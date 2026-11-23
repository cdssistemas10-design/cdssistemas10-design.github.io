const ALLOWED_REPOSITORY = "cdssistemas10-design/cdssistemas10-design.github.io";
const ALLOWED_BRANCH = "main";
const ALLOWED_PUBLICATION_FILES = new Set(["src/site-config.json"]);
const MAX_PUBLICATION_BYTES = 500 * 1024;

function parseRepository(repository) {
  const parts = repository.split("/");
  if (parts.length !== 2 || parts.includes("")) {
    throw new Error("GITHUB_REPOSITORY inválido.");
  }
  return { owner: parts[0], repo: parts[1] };
}

export class GitHubPublisher {
  constructor({
    token,
    repository = ALLOWED_REPOSITORY,
    branch = ALLOWED_BRANCH,
    fetchImpl = globalThis.fetch,
  } = {}) {
    if (typeof token !== "string" || !token.trim()) {
      throw new Error("GITHUB_TOKEN não configurado.");
    }
    if (repository !== ALLOWED_REPOSITORY) {
      throw new Error("Repositório GitHub não autorizado.");
    }
    if (branch !== ALLOWED_BRANCH) {
      throw new Error("Branch de publicação não autorizado.");
    }
    this.token = token.trim();
    this.repository = parseRepository(repository);
    this.branch = branch;
    this.fetchImpl = fetchImpl;
  }

  async request(method, apiPath, body) {
    const response = await this.fetchImpl(`https://api.github.com${apiPath}`, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "cds-site-local-admin",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    if (!response.ok) {
      throw new Error(`GitHub API respondeu com HTTP ${response.status}.`);
    }
    return data;
  }

  async prepare() {
    const basePath = `/repos/${this.repository.owner}/${this.repository.repo}`;
    const branch = await this.request("GET", `${basePath}/git/ref/heads/${this.branch}`);
    const baseSha = branch.object?.sha;
    if (!/^[0-9a-f]{40}$/i.test(baseSha || "")) {
      throw new Error("A referência da branch não possui SHA válido.");
    }

    const file = await this.request(
      "GET",
      `${basePath}/contents/src%2Fsite-config.json?ref=${encodeURIComponent(baseSha)}`,
    );
    return {
      baseSha,
      fileSha: typeof file.sha === "string" ? file.sha : null,
    };
  }

  async publish({ baseSha, filePath, content }) {
    if (!ALLOWED_PUBLICATION_FILES.has(filePath)) {
      throw new Error("Arquivo fora da whitelist de publicação.");
    }
    if (!/^[0-9a-f]{40}$/i.test(baseSha || "")) {
      throw new Error("SHA base inválido.");
    }
    if (typeof content !== "string") {
      throw new Error("Conteúdo da publicação inválido.");
    }
    const bytes = Buffer.byteLength(content, "utf8");
    if (bytes > MAX_PUBLICATION_BYTES) {
      throw new Error("Arquivo excede o tamanho permitido.");
    }

    JSON.parse(content);
    const basePath = `/repos/${this.repository.owner}/${this.repository.repo}`;
    const branch = await this.request("GET", `${basePath}/git/ref/heads/${this.branch}`);
    const currentSha = branch.object?.sha;
    if (currentSha !== baseSha) {
      const conflict = new Error("A branch recebeu alterações externas. Atualize a preparação.");
      conflict.code = "CONFLICT_SHA";
      throw conflict;
    }

    const remoteFile = await this.request(
      "GET",
      `${basePath}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(baseSha)}`,
    );

    const commit = await this.request("GET", `${basePath}/git/commits/${baseSha}`);
    const baseTreeSha = commit.tree?.sha;
    if (!baseTreeSha) throw new Error("Não foi possível obter a árvore da branch.");

    const blob = await this.request("POST", `${basePath}/git/blobs`, {
      content,
      encoding: "utf-8",
    });
    if (!blob?.sha) throw new Error("Não foi possível preparar o arquivo.");
    if (remoteFile?.sha === blob.sha) {
      return {
        commitSha: baseSha,
        duplicate: true,
      };
    }

    const tree = await this.request("POST", `${basePath}/git/trees`, {
      base_tree: baseTreeSha,
      tree: [{ path: filePath, mode: "100644", type: "blob", sha: blob.sha }],
    });
    if (!tree?.sha) throw new Error("Não foi possível criar a árvore da publicação.");

    const createdCommit = await this.request("POST", `${basePath}/git/commits`, {
      message: "Atualiza configuração pública do CDS Site",
      tree: createdCommitSafeTreeSha(tree),
      parents: [baseSha],
    });
    if (!createdCommit?.sha) throw new Error("Não foi possível criar o commit.");

    await this.request("PATCH", `${basePath}/git/refs/heads/${this.branch}`, {
      sha: createdCommit.sha,
    });

    return {
      commitSha: createdCommit.sha,
      publishedAt: new Date().toISOString(),
    };
  }

  async status(commitSha) {
    if (!/^[0-9a-f]{40}$/i.test(commitSha || "")) {
      throw new Error("SHA do commit inválido.");
    }
    const basePath = `/repos/${this.repository.owner}/${this.repository.repo}`;
    const runs = await this.request(
      "GET",
      `${basePath}/actions/workflows/deploy.yml/runs?head_sha=${encodeURIComponent(commitSha)}&per_page=20`,
    );
    const workflowRuns = Array.isArray(runs?.workflow_runs) ? runs.workflow_runs : [];
    if (!workflowRuns.length) return { state: "commit_received", runs: [] };

    const run = workflowRuns
      .slice()
      .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0))[0];
    if (run.status === "queued" || run.status === "waiting" || run.status === "pending") {
      return { state: "workflow_waiting", runs: [simplifyRun(run)] };
    }
    if (run.status === "in_progress" || run.status === "requested") {
      return { state: "workflow_running", runs: [simplifyRun(run)] };
    }
    if (run.status === "completed" && run.conclusion === "success") {
      return { state: "deploy_completed", runs: [simplifyRun(run)] };
    }
    if (run.status === "completed") {
      return { state: "workflow_failed", runs: [simplifyRun(run)] };
    }
    return { state: "workflow_waiting", runs: [simplifyRun(run)] };
  }
}

function createdCommitSafeTreeSha(tree) {
  if (!tree?.sha) throw new Error("Não foi possível preparar o commit.");
  return tree.sha;
}

function simplifyRun(run) {
  return {
    id: run.id,
    name: run.name,
    status: run.status,
    conclusion: run.conclusion,
    htmlUrl: run.html_url,
    createdAt: run.created_at,
    updatedAt: run.updated_at,
  };
}

export function createGitHubPublisher(env = process.env, fetchImpl = globalThis.fetch) {
  return new GitHubPublisher({
    token: env.GITHUB_TOKEN,
    repository: env.GITHUB_REPOSITORY || ALLOWED_REPOSITORY,
    branch: env.GITHUB_BRANCH || ALLOWED_BRANCH,
    fetchImpl,
  });
}
