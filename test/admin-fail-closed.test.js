import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("published frontend does not import or render the admin panel", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(app, /AdminConfig|adminOpen|onOpenAdmin/);
});

test("public footer has no administrative configuration entry", async () => {
  const footer = await readFile(new URL("../src/components/CtaFooter.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(footer, /Configuração do site|onOpenAdmin|Abrir configuração/);
});

test("admin API routes remain protected in backend source", async () => {
  const server = await readFile(new URL("../server.js", import.meta.url), "utf8");
  assert.match(server, /app\.get\("\/api\/admin\/settings",\s*requireAuth,\s*requirePasswordChanged/);
  assert.match(server, /app\.put\("\/api\/admin\/settings",\s*requireAuth,\s*requirePasswordChanged,\s*requireCsrf/);
});
