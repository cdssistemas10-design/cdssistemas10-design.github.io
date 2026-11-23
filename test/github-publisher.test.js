import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { GitHubPublisher, createGitHubPublisher } from "../github-publisher.js";

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
  };
}

test("Token GitHub ausente ou repositório externo são rejeitados", () => {
  assert.throws(() => new GitHubPublisher({}), /GITHUB_TOKEN/);
  assert.throws(() => new GitHubPublisher({
    token: "token",
    repository: "outro/repo",
  }), /não autorizado/);
  assert.throws(() => createGitHubPublisher({}), /GITHUB_TOKEN/);
});

test("Token inválido não vaza detalhes e gera falha genérica na API", async () => {
  const publisher = new GitHubPublisher({
    token: "github_pat_invalid",
    fetchImpl: async (url, options) => {
      assert.match(options.headers.Authorization, /^Bearer github_pat_/);
      return response(401, { message: "Bad credentials", detail: "private" });
    },
  });
  await assert.rejects(() => publisher.prepare(), /HTTP 401/);
});

test("Token nunca aparece em arquivos e interfaces públicas", async () => {
  const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
  const adminPanel = await readFile(new URL("../src/components/AdminConfig.tsx", import.meta.url), "utf8");
  assert.match(envExample, /GITHUB_TOKEN=/);
  assert.doesNotMatch(envExample, /github_pat_[A-Za-z0-9]/);
  assert.doesNotMatch(adminPanel, /GITHUB_TOKEN|Authorization|Bearer/);
});

test("Preparação consulta SHA da branch e arquivo permitido", async () => {
  const publisher = new GitHubPublisher({
    token: "test-token",
    fetchImpl: async (_url, _options) => response(200,
      _url.includes("/git/ref/heads/")
        ? { object: { sha: "a".repeat(40) } }
        : { sha: "b".repeat(40) }),
  });
  assert.deepEqual(await publisher.prepare(), {
    baseSha: "a".repeat(40),
    fileSha: "b".repeat(40),
  });
});

test("Arquivo fora da whitelist é rejeitado", async () => {
  const publisher = new GitHubPublisher({ token: "test-token", fetchImpl: async () => response(200, {}) });
  await assert.rejects(() => publisher.publish({
    baseSha: "a".repeat(40),
    filePath: "secrets.txt",
    content: "{}",
  }), /whitelist/);
});

test("Conflito de SHA interrompe antes de criar commit", async () => {
  const publisher = new GitHubPublisher({
    token: "test-token",
    fetchImpl: async (_url) => response(200, { object: { sha: "b".repeat(40) } }),
  });
  await assert.rejects(() => publisher.publish({
    baseSha: "a".repeat(40),
    filePath: "src/site-config.json",
    content: "{}",
  }), (error) => error.code === "CONFLICT_SHA");
});

test("Falha da API do GitHub é propagada sem dados sensíveis", async () => {
  const publisher = new GitHubPublisher({
    token: "test-token",
    fetchImpl: async () => response(503, { message: "private diagnostic", token: "test-token" }),
  });
  await assert.rejects(() => publisher.prepare(), /HTTP 503/);
});

test("Criação de commit envia somente a árvore autorizada", async () => {
  let capturedTree;
  const baseSha = "a".repeat(40);
  const publisher = new GitHubPublisher({
    token: "test-token",
    fetchImpl: async (url, options) => {
      if (url.includes("/git/ref/heads/main")) {
        return response(200, { object: { sha: baseSha } });
      }
      if (url.endsWith("/git/commits/" + baseSha)) {
        return response(200, { tree: { sha: "c".repeat(40) } });
      }
      if (url.includes("/contents/")) {
        return response(200, { sha: "d".repeat(40) });
      }
      if (url.endsWith("/git/blobs")) {
        return response(200, { sha: "e".repeat(40) });
      }
      if (url.endsWith("/git/trees")) {
        capturedTree = JSON.parse(options.body);
        return response(200, { sha: "f".repeat(40) });
      }
      if (url.endsWith("/git/commits")) {
        return response(201, { sha: "1".repeat(40) });
      }
      if (url.includes("/git/refs/heads/main")) {
        return response(200, { object: { sha: "1".repeat(40) } });
      }
      return response(404, {});
    },
  });
  const result = await publisher.publish({
    baseSha,
    filePath: "src/site-config.json",
    content: "{}",
  });
  assert.equal(result.commitSha, "1".repeat(40));
  assert.deepEqual(capturedTree.tree, [{
    path: "src/site-config.json",
    mode: "100644",
    type: "blob",
    sha: "e".repeat(40),
  }]);
});

test("Publicação repetida detecta conteúdo já presente", async () => {
  const baseSha = "a".repeat(40);
  const publisher = new GitHubPublisher({
    token: "test-token",
    fetchImpl: async (url) => {
      if (url.includes("/git/ref/heads/main")) return response(200, { object: { sha: baseSha } });
      if (url.includes("/contents/")) return response(200, { sha: "e".repeat(40) });
      if (url.endsWith("/git/commits/" + baseSha)) return response(200, { tree: { sha: "c".repeat(40) } });
      if (url.endsWith("/git/blobs")) return response(200, { sha: "e".repeat(40) });
      return response(404, {});
    },
  });
  const result = await publisher.publish({
    baseSha,
    filePath: "src/site-config.json",
    content: "{}",
  });
  assert.equal(result.duplicate, true);
});

test("Consulta workflow distingue aguardando, execução, sucesso e falha", async () => {
  async function runStatus(run) {
    const publisher = new GitHubPublisher({
      token: "test-token",
      fetchImpl: async (url) => {
        assert.match(url, /actions\/workflows\/deploy\.yml\/runs\?head_sha=1{40}/);
        return response(200, { workflow_runs: [run] });
      },
    });
    return publisher.status("1".repeat(40));
  }
  assert.equal((await runStatus({ status: "queued", created_at: "2026-01-01", conclusion: null })).state, "workflow_waiting");
  assert.equal((await runStatus({ status: "in_progress", created_at: "2026-01-01", conclusion: null })).state, "workflow_running");
  assert.equal((await runStatus({ status: "completed", created_at: "2026-01-01", conclusion: "success" })).state, "deploy_completed");
  assert.equal((await runStatus({ status: "completed", created_at: "2026-01-01", conclusion: "failure" })).state, "workflow_failed");
});

test("Sem workflow registrado o commit é reportado como recebido", async () => {
  const publisher = new GitHubPublisher({
    token: "test-token",
    fetchImpl: async () => response(200, { workflow_runs: [] }),
  });
  assert.deepEqual(await publisher.status("1".repeat(40)), {
    state: "commit_received",
    runs: [],
  });
});
