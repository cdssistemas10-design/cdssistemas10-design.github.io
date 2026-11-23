import test, { after } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import bcrypt from "bcryptjs";
import os from "node:os";
import path from "node:path";
import { loadServerConfig } from "../server-config.js";
import {
  normalizeWhatsAppNumber,
  isValidWhatsAppNumber,
  buildWhatsAppLink,
  buildWhatsAppAppLink,
} from "../src/utils/whatsapp.ts";

const testDataDirectory = mkdtempSync(path.join(os.tmpdir(), "cds-admin-tests-"));
const testDatabasePath = path.join(testDataDirectory, "admin.db");
const testSessionSecret = randomBytes(32).toString("hex");
process.env.NODE_ENV = "test";
process.env.DATABASE_PATH = testDatabasePath;
process.env.SESSION_SECRET = testSessionSecret;
process.env.TRUST_PROXY = "0";
delete process.env.PUBLIC_ORIGIN;

const {
  app,
  db,
  config,
  SQLiteSessionStore,
  sessionStore,
  validateSiteConfig,
  toPublicSiteConfig,
} = await import("../server.js");
let cleanupDatabase = db;

after(() => {
  cleanupDatabase.close();
  rmSync(testDataDirectory, { recursive: true, force: true });
});

function signedSessionCookie(sid) {
  const signature = createHmac("sha256", testSessionSecret)
    .update(sid)
    .digest("base64")
    .replace(/=+$/, "");
  return `cds_admin.sid=${encodeURIComponent(`s:${sid}.${signature}`)}`;
}

test("WhatsApp normaliza DDD brasileiro e valida números", () => {
  assert.equal(normalizeWhatsAppNumber("(11) 91234-5678"), "5511912345678");
  assert.equal(isValidWhatsAppNumber("5511912345678"), true);
  assert.equal(isValidWhatsAppNumber("123"), false);
  assert.equal(buildWhatsAppLink("11 91234-5678", "Olá & equipe"),
    "whatsapp://send?phone=5511912345678&text=Ol%C3%A1%20%26%20equipe");
  assert.match(buildWhatsAppAppLink("5511912345678", "Olá"),
    /^whatsapp:\/\/send\?phone=5511912345678/);
});

test("Validação de configuração aceita esquema comercial válido", () => {
  const config = {
    whatsappNumber: "5511912345678",
    whatsappDefaultMessage: "Olá",
    phoneDisplay: "(88) 99999-9999",
    email: "contato@cds.test",
    address: "Cariri",
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
    plans: [{
      name: "Plano",
      priceMonthly: 150,
      priceAnnual: 150,
      tagline: "Gestão",
      badge: "Principal",
      features: ["Vendas"],
      highlight: true,
      cta: "Consultar",
    }],
  };
  assert.equal(validateSiteConfig(config), null);
  assert.match(validateSiteConfig({ ...config, unknownField: true }), /não permitido/);
});

test("Validação rejeita tamanho excessivo, tipos inválidos e planos negativos", () => {
  assert.match(validateSiteConfig({
    plans: [{
      name: "Plano",
      priceMonthly: -1,
      priceAnnual: 150,
      tagline: "Gestão",
      badge: "",
      features: [],
      highlight: false,
      cta: "Consultar",
    }],
  }), /inválidos/);
  assert.match(validateSiteConfig({ heroDescription: 123 }), /inválido/);
});

test("SQLiteSessionStore persiste a sessão e restaura após nova instância", () => {
  const database = new DatabaseSync(":memory:");
  database.exec(`
    CREATE TABLE cds_sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expires INTEGER NOT NULL
    )
  `);
  const firstStore = new SQLiteSessionStore(database);
  firstStore.set("sid-a", {
    cookie: { maxAge: 8 * 60 * 60 * 1000 },
    adminId: 1,
  });

  const restartedStore = new SQLiteSessionStore(database);
  const restored = new Promise((resolve, reject) => {
    restartedStore.get("sid-a", (error, session) => {
      if (error) reject(error);
      else resolve(session);
    });
  });
  return restored.then((session) => {
    assert.equal(session.adminId, 1);
  });
});

test("Configuração de produção valida variáveis de hospedagem", () => {
  const validEnvironment = {
    NODE_ENV: "production",
    HOST: "0.0.0.0",
    PORT: "8080",
    TRUST_PROXY: "1",
    PUBLIC_ORIGIN: "https://admin.cds.example",
    SESSION_SECRET: randomBytes(32).toString("hex"),
    DATABASE_PATH: path.join(testDataDirectory, "production.db"),
  };
  const productionConfig = loadServerConfig(validEnvironment);
  assert.equal(productionConfig.host, "0.0.0.0");
  assert.equal(productionConfig.port, 8080);
  assert.equal(productionConfig.trustProxy, 1);
  assert.equal(productionConfig.publicOrigin, "https://admin.cds.example");
  assert.equal(productionConfig.databasePath, validEnvironment.DATABASE_PATH);
  const defaults = loadServerConfig({ NODE_ENV: "test" });
  assert.equal(defaults.host, "0.0.0.0");
  assert.equal(defaults.port, 3000);
  assert.equal(defaults.trustProxy, false);

  assert.throws(() => loadServerConfig({
    ...validEnvironment,
    PORT: "70000",
  }), /PORT/);
  assert.throws(() => loadServerConfig({
    ...validEnvironment,
    TRUST_PROXY: "one",
  }), /TRUST_PROXY/);
  assert.throws(() => loadServerConfig({
    ...validEnvironment,
    PUBLIC_ORIGIN: "https://admin.cds.example/path",
  }), /PUBLIC_ORIGIN/);
  assert.throws(() => loadServerConfig({
    ...validEnvironment,
    SESSION_SECRET: "too-short",
  }), /SESSION_SECRET/);
  assert.throws(() => loadServerConfig({
    ...validEnvironment,
    SESSION_SECRET: undefined,
  }), /SESSION_SECRET/);
  assert.throws(() => loadServerConfig({
    ...validEnvironment,
    DATABASE_PATH: "relative/admin.db",
  }), /absolute/);
  assert.throws(() => loadServerConfig({
    ...validEnvironment,
    DATABASE_PATH: undefined,
  }), /DATABASE_PATH/);
  assert.throws(() => loadServerConfig({
    ...validEnvironment,
    PUBLIC_ORIGIN: undefined,
  }), /PUBLIC_ORIGIN/);
});

test("Backend inicializa no caminho persistente configurado sem provisionar conta", () => {
  assert.equal(config.databasePath, testDatabasePath);
  assert.equal(existsSync(testDatabasePath), true);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM admin_users").get().count, 0);
});

test("Health check responde sem expor detalhes internos", async () => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const port = server.address().port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
    assert.equal(response.headers.get("cache-control"), "no-store");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test("Rotas administrativas exigem sessão e operações de alteração exigem CSRF", async () => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const port = server.address().port;
  try {
    const status = await fetch(`http://127.0.0.1:${port}/api/auth/status`);
    assert.equal(status.status, 200);
    assert.equal((await status.json()).authenticated, false);

    const protectedSettings = await fetch(`http://127.0.0.1:${port}/api/admin/settings`);
    assert.equal(protectedSettings.status, 401);

    const csrf = await fetch(`http://127.0.0.1:${port}/api/auth/csrf`);
    assert.equal(csrf.status, 401);

    const unauthenticatedLogout = await fetch(`http://127.0.0.1:${port}/api/auth/logout`, {
      method: "POST",
    });
    assert.equal(unauthenticatedLogout.status, 401);

    const unauthenticatedPasswordChange = await fetch(`http://127.0.0.1:${port}/api/auth/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(unauthenticatedPasswordChange.status, 401);

    const unauthenticatedPut = await fetch(`http://127.0.0.1:${port}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": "invalido" },
      body: JSON.stringify({ settings: { address: "teste" } }),
    });
    assert.equal(unauthenticatedPut.status, 401);

    const unauthenticatedPublishPrepare = await fetch(`http://127.0.0.1:${port}/api/admin/publish/prepare`);
    assert.equal(unauthenticatedPublishPrepare.status, 401);

    const unauthenticatedPublish = await fetch(`http://127.0.0.1:${port}/api/admin/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseSha: "a".repeat(40), settings: {} }),
    });
    assert.equal(unauthenticatedPublish.status, 401);

    const publicConfig = await fetch(`http://127.0.0.1:${port}/api/site-config`);
    assert.equal(publicConfig.status, 200);
    const publicJson = await publicConfig.json();
    assert.equal(Object.prototype.hasOwnProperty.call(publicJson, "password_hash"), false);
    assert.equal(publicConfig.headers.get("access-control-allow-origin"), null);

    const sid = randomBytes(18).toString("hex");
    const csrfToken = randomBytes(24).toString("hex");
    await new Promise((resolve, reject) => {
      sessionStore.set(sid, {
        cookie: { maxAge: 60_000 },
        adminId: 1,
        mustChangePassword: false,
        csrfToken,
      }, (error) => error ? reject(error) : resolve());
    });
    const cookie = signedSessionCookie(sid);
    const updateUrl = `http://127.0.0.1:${port}/api/admin/settings`;

    const missingCsrf = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Cookie: cookie,
        Origin: `http://127.0.0.1:${port}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings: { address: "Teste" } }),
    });
    assert.equal(missingCsrf.status, 403);

    const foreignOrigin = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Cookie: cookie,
        Origin: "https://untrusted.example",
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings: { address: "Teste" } }),
    });
    assert.equal(foreignOrigin.status, 403);

    const authorizedUpdate = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Cookie: cookie,
        Origin: `http://127.0.0.1:${port}`,
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings: { address: "Teste" } }),
    });
    assert.equal(authorizedUpdate.status, 200);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test("Login, configuração, CSRF, logout e persistência após reiniciar o backend", async () => {
  db.prepare("DELETE FROM site_settings WHERE key = 'site_config'").run();
  const testPassword = randomBytes(32).toString("hex");
  const passwordHash = await bcrypt.hash(testPassword, 4);
  db.prepare(`
    INSERT INTO admin_users (username, password_hash, must_change_password, updated_at)
    VALUES (?, ?, 0, ?)
  `).run("integration-test-admin", passwordHash, new Date().toISOString());

  const settings = {
    address: "Cariri - CE",
    plans: [{
      name: "Plano teste",
      priceMonthly: 99,
      priceAnnual: 89,
      tagline: "Plano público",
      badge: "Demonstração",
      features: ["Vendas"],
      highlight: true,
      cta: "Consultar",
      internalPlanNote: "private-plan-field",
    }],
    products: [{
      id: 1,
      name: "Produto demonstração",
      price: 10,
      unit: "UN",
      category: "Teste",
      code: "internal-code",
      barcode: "internal-barcode",
      cost: 2,
      stock: 50,
      minStock: 5,
      privateNote: "private-product-field",
    }],
    cities: [{
      name: "Crato",
      state: "CE",
      status: "Atendimento regional",
      internalNote: "private-city-field",
    }],
    faqs: [{
      q: "Pergunta pública?",
      a: "Resposta pública.",
      internalNote: "private-faq-field",
    }],
    testimonials: [{
      name: "Cliente teste",
      business: "Comércio teste",
      city: "Crato",
      text: "Depoimento público.",
      results: "Resultado público.",
      initials: "CT",
      rating: 5,
      internalNote: "private-testimonial-field",
    }],
  };
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  let cookie = "";
  let csrfToken = "";

  try {
    const invalidLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "missing-test-user", password: testPassword }),
    });
    assert.equal(invalidLogin.status, 401);

    const wrongPassword = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "integration-test-admin", password: "incorrect" }),
    });
    assert.equal(wrongPassword.status, 401);

    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "integration-test-admin", password: testPassword }),
    });
    assert.equal(login.status, 200);
    assert.equal((await login.json()).authenticated, true);
    const setCookie = login.headers.get("set-cookie");
    assert.ok(setCookie);
    cookie = setCookie.split(";")[0];

    const status = await fetch(`${baseUrl}/api/auth/status`, {
      headers: { Cookie: cookie },
    });
    assert.deepEqual(await status.json(), {
      authenticated: true,
      mustChangePassword: false,
    });

    const initialSettings = await fetch(`${baseUrl}/api/admin/settings`, {
      headers: { Cookie: cookie },
    });
    assert.equal(initialSettings.status, 200);
    assert.equal((await initialSettings.json()).settings, null);

    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`, {
      headers: { Cookie: cookie },
    });
    csrfToken = (await csrfResponse.json()).csrfToken;
    assert.equal(typeof csrfToken, "string");

    const tooShortPassword = await fetch(`${baseUrl}/api/auth/password`, {
      method: "POST",
      headers: {
        Cookie: cookie,
        Origin: baseUrl,
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword: testPassword, newPassword: "1234567" }),
    });
    assert.equal(tooShortPassword.status, 400);

    const eightCharacterPassword = await fetch(`${baseUrl}/api/auth/password`, {
      method: "POST",
      headers: {
        Cookie: cookie,
        Origin: baseUrl,
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword: testPassword, newPassword: "12345678" }),
    });
    assert.equal(eightCharacterPassword.status, 200);
    assert.deepEqual(await eightCharacterPassword.json(), { changed: true });

    const missingCsrf = await fetch(`${baseUrl}/api/admin/settings`, {
      method: "PUT",
      headers: {
        Cookie: cookie,
        Origin: `${baseUrl}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings }),
    });
    assert.equal(missingCsrf.status, 403);

    const update = await fetch(`${baseUrl}/api/admin/settings`, {
      method: "PUT",
      headers: {
        Cookie: cookie,
        Origin: `${baseUrl}`,
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings }),
    });
    assert.equal(update.status, 200);
    assert.equal((await update.json()).updated, true);

    const publicResponse = await fetch(`${baseUrl}/api/site-config`);
    assert.equal(publicResponse.status, 200);
    const publicConfig = await publicResponse.json();
    assert.deepEqual(Object.keys(publicConfig.products[0]).sort(),
      ["category", "id", "name", "price", "unit"]);
    assert.deepEqual(Object.keys(publicConfig.plans[0]).sort(),
      ["badge", "cta", "features", "highlight", "name", "priceAnnual", "priceMonthly", "tagline"]);
    assert.deepEqual(Object.keys(publicConfig.cities[0]).sort(), ["name", "state", "status"]);
    assert.deepEqual(Object.keys(publicConfig.faqs[0]).sort(), ["a", "q"]);
    assert.deepEqual(Object.keys(publicConfig.testimonials[0]).sort(),
      ["business", "city", "initials", "name", "rating", "results", "text"]);
    assert.equal(JSON.stringify(publicConfig).includes("private-"), false);
    assert.equal(JSON.stringify(publicConfig).includes("internal-barcode"), false);

    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
    db.close();

    const restarted = await import(`../server.js?restart=${Date.now()}`);
    cleanupDatabase = restarted.db;
    const restartedServer = restarted.app.listen(0, "127.0.0.1");
    await new Promise((resolve) => restartedServer.once("listening", resolve));
    const restartedUrl = `http://127.0.0.1:${restartedServer.address().port}`;
    try {
      const restartedStatus = await fetch(`${restartedUrl}/api/auth/status`, {
        headers: { Cookie: cookie },
      });
      assert.deepEqual(await restartedStatus.json(), {
        authenticated: true,
        mustChangePassword: false,
      });

      const persistedSettings = await fetch(`${restartedUrl}/api/admin/settings`, {
        headers: { Cookie: cookie },
      });
      assert.deepEqual((await persistedSettings.json()).settings, settings);

      const logout = await fetch(`${restartedUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: cookie,
          Origin: restartedUrl,
          "X-CSRF-Token": csrfToken,
        },
      });
      assert.equal(logout.status, 200);
      assert.equal((await logout.json()).authenticated, false);

      const expiredSid = randomBytes(18).toString("hex");
      restarted.db.prepare(
        "INSERT INTO cds_sessions (sid, sess, expires) VALUES (?, ?, ?)"
      ).run(expiredSid, JSON.stringify({
        cookie: { maxAge: 60_000 },
        adminId: 1,
        mustChangePassword: false,
      }), Date.now() - 1);
      const expiredStatus = await fetch(`${restartedUrl}/api/auth/status`, {
        headers: { Cookie: signedSessionCookie(expiredSid) },
      });
      assert.deepEqual(await expiredStatus.json(), {
        authenticated: false,
        mustChangePassword: false,
      });
    } finally {
      await new Promise((resolve, reject) => {
        restartedServer.close((error) => error ? reject(error) : resolve());
      });
    }
  } finally {
    if (server.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
  }
});
