import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("published frontend integrates the protected admin panel", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.match(app, /import AdminConfig/);
  assert.match(app, /Footer onOpenAdmin=\{\(\) => setAdminOpen\(true\)\}/);
  assert.match(app, /<AdminConfig open=\{adminOpen\}/);
});

test("public footer exposes the configuration button and opens it", async () => {
  const footer = await readFile(new URL("../src/components/CtaFooter.tsx", import.meta.url), "utf8");
  assert.match(footer, /Configuração do site/);
  assert.match(footer, /onOpenAdmin/);
  assert.match(footer, /Abrir configuração do site/);
});

test("admin API routes remain protected in backend source", async () => {
  const server = await readFile(new URL("../server.js", import.meta.url), "utf8");
  assert.match(server, /app\.get\("\/api\/admin\/settings",\s*requireAuth,\s*requirePasswordChanged/);
  assert.match(server, /app\.put\("\/api\/admin\/settings",\s*requireAuth,\s*requirePasswordChanged,\s*requireCsrf/);
});

test("admin panel opens an authentication screen and does not expose credentials", async () => {
  const panel = await readFile(new URL("../src/components/AdminConfig.tsx", import.meta.url), "utf8");
  assert.match(panel, /Acesso restrito/);
  assert.match(panel, /Painel administrativo/);
  assert.match(panel, /api\/auth\/login/);
  assert.match(panel, /Salvar alterações/);
  assert.match(panel, /Publicar no site/);
  assert.match(panel, /Estado da publicação/);
  assert.doesNotMatch(panel, /ADMIN_|password_hash|senha_do_administrador/i);
});
