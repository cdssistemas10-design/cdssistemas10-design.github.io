import crypto from "node:crypto";
import path from "node:path";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { loadServerConfig } from "./server-config.js";
import { createGitHubPublisher } from "./github-publisher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = loadServerConfig();
const { production, port, host } = config;

mkdirSync(path.dirname(config.databasePath), { recursive: true });
const db = new DatabaseSync(config.databasePath);
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    must_change_password INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    username TEXT PRIMARY KEY,
    failed_count INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT,
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

try {
  db.exec("ALTER TABLE login_attempts ADD COLUMN updated_at TEXT");
} catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS cds_sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expires INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_cds_sessions_expires ON cds_sessions(expires);
`);
class SQLiteSessionStore extends session.Store {
  constructor(database) {
    super();
    this.database = database;
  }

  get(sid, callback) {
    try {
      const row = this.database.prepare(
        "SELECT sess, expires FROM cds_sessions WHERE sid = ?"
      ).get(sid);
      if (!row || row.expires <= Date.now()) {
        if (row) this.database.prepare("DELETE FROM cds_sessions WHERE sid = ?").run(sid);
        return callback(null, null);
      }
      callback(null, JSON.parse(row.sess));
    } catch (error) {
      callback(error);
    }
  }

  set(sid, sess, callback) {
    try {
      const maxAge = sess.cookie?.maxAge;
      const expires = typeof maxAge === "number"
        ? Date.now() + maxAge
        : Date.now() + 8 * 60 * 60 * 1000;
      this.database.prepare(`
        INSERT INTO cds_sessions (sid, sess, expires) VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires = excluded.expires
      `).run(sid, JSON.stringify(sess), expires);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  destroy(sid, callback) {
    try {
      this.database.prepare("DELETE FROM cds_sessions WHERE sid = ?").run(sid);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  touch(sid, sess, callback) {
    try {
      const maxAge = sess.cookie?.maxAge;
      const expires = typeof maxAge === "number"
        ? Date.now() + maxAge
        : Date.now() + 8 * 60 * 60 * 1000;
      this.database.prepare("UPDATE cds_sessions SET sess = ?, expires = ? WHERE sid = ?")
        .run(JSON.stringify(sess), expires, sid);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  pruneExpired() {
    this.database.prepare("DELETE FROM cds_sessions WHERE expires <= ?").run(Date.now());
  }
}

const sessionStore = new SQLiteSessionStore(db);

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", config.trustProxy);
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(express.json({
  limit: "500kb",
  strict: true,
}));
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Formato JSON inválido." });
  }
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "Solicitação excede o tamanho permitido." });
  }
  console.error("Request parsing failed:", error);
  return res.status(500).json({ error: "Não foi possível processar a solicitação." });
});

app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    db.prepare("SELECT 1").get();
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Health check database query failed:", error);
    res.status(503).json({ status: "unavailable" });
  }
});

app.use(session({
  name: "cds_admin.sid",
  secret: config.sessionSecret || crypto.randomBytes(32).toString("hex"),
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: production,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 8,
  },
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  validate: { xForwardedForHeader: true },
});

setInterval(() => {
  sessionStore.pruneExpired();
  db.prepare(
    "DELETE FROM login_attempts WHERE COALESCE(updated_at, '') < ?"
  ).run(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
}, 60 * 60 * 1000).unref();

function requireAuth(req, res, next) {
  if (!req.session.adminId) return res.status(401).json({ error: "Autenticação obrigatória." });
  next();
}

function requirePasswordChanged(req, res, next) {
  if (req.session.mustChangePassword) {
    return res.status(403).json({ error: "É obrigatório alterar a senha inicial.", mustChangePassword: true });
  }
  next();
}

function isAllowedOrigin(req) {
  const origin = req.get("origin");
  const requestOrigin = `${req.protocol}://${req.get("host")}`;
  const allowedOrigin = config.publicOrigin || requestOrigin;
  return !origin || origin === allowedOrigin;
}

function requireSameOrigin(req, res, next) {
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Origem não autorizada." });
  }
  next();
}

function requireCsrf(req, res, next) {
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Origem não autorizada." });
  }
  if (!req.session.csrfToken || req.get("x-csrf-token") !== req.session.csrfToken) {
    return res.status(403).json({ error: "Token CSRF inválido." });
  }
  next();
}

app.get("/api/auth/status", (req, res) => {
  res.json({
    authenticated: Boolean(req.session.adminId),
    mustChangePassword: Boolean(req.session.mustChangePassword),
  });
});

app.get("/api/auth/csrf", requireAuth, (req, res) => {
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  res.json({ csrfToken: req.session.csrfToken });
});

app.post("/api/auth/login", loginLimiter, requireSameOrigin, async (req, res) => {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!username || !password || username.length > 255 || password.length > 1024) {
    return res.status(400).json({ error: "Informe usuário e senha válidos." });
  }
  try {
    const attempt = db.prepare(
      "SELECT failed_count, locked_until, updated_at FROM login_attempts WHERE username = ?"
    ).get(username);
    if (attempt?.locked_until && Date.parse(attempt.locked_until) > Date.now()) {
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    }

    const user = db.prepare(
      "SELECT id, password_hash, must_change_password FROM admin_users WHERE username = ?"
    ).get(username);
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!valid) {
      const now = Date.now();
      const windowStart = new Date(now - 15 * 60 * 1000).toISOString();
      const failedCount = attempt?.updated_at > windowStart
        ? Number(attempt.failed_count || 0) + 1
        : 1;
      const lockedUntil = failedCount >= 5
        ? new Date(now + 15 * 60 * 1000).toISOString()
        : null;
      db.prepare(`
        INSERT INTO login_attempts (username, failed_count, locked_until, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET
          failed_count = excluded.failed_count,
          locked_until = excluded.locked_until,
          updated_at = excluded.updated_at
      `).run(username, failedCount, lockedUntil, new Date(now).toISOString());
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    }

    db.prepare("DELETE FROM login_attempts WHERE username = ?").run(username);
    req.session.regenerate((error) => {
      if (error) {
        console.error("Could not regenerate login session:", error);
        return res.status(503).json({ error: "Não foi possível iniciar a sessão." });
      }
      req.session.adminId = user.id;
      req.session.mustChangePassword = Boolean(user.must_change_password);
      req.session.csrfToken = crypto.randomBytes(32).toString("hex");
      req.session.save((saveError) => {
        if (saveError) {
          console.error("Could not persist login session:", saveError);
          return res.status(503).json({ error: "Não foi possível iniciar a sessão." });
        }
        res.json({
          authenticated: true,
          mustChangePassword: req.session.mustChangePassword,
          csrfToken: req.session.csrfToken,
        });
      });
    });
  } catch (error) {
    console.error("Authentication database operation failed:", error);
    return res.status(503).json({ error: "Serviço de autenticação indisponível." });
  }
});

app.post("/api/auth/logout", requireAuth, requireCsrf, (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Could not destroy logout session:", error);
      return res.status(503).json({ error: "Não foi possível encerrar a sessão." });
    }
    res.clearCookie("cds_admin.sid");
    res.json({ authenticated: false });
  });
});

app.post("/api/auth/password", requireAuth, requireCsrf, async (req, res) => {
  const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  if (newPassword.length < 8) return res.status(400).json({ error: "A nova senha deve ter pelo menos 8 caracteres." });

  const user = db.prepare("SELECT password_hash FROM admin_users WHERE id = ?").get(req.session.adminId);
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    return res.status(401).json({ error: "Senha atual inválida." });
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    db.prepare("UPDATE admin_users SET password_hash = ?, must_change_password = 0, updated_at = ? WHERE id = ?")
      .run(passwordHash, new Date().toISOString(), req.session.adminId);
    req.session.mustChangePassword = false;
    req.session.save((error) => {
      if (error) {
        console.error("Could not persist password-change session:", error);
        return res.status(503).json({ error: "Não foi possível concluir a alteração da senha." });
      }
      res.json({ changed: true });
    });
  } catch (error) {
    console.error("Password change operation failed:", error);
    return res.status(503).json({ error: "Não foi possível alterar a senha." });
  }
});

const CONFIG_MAX_BYTES = 500 * 1024;
const stringFields = new Set([
  "whatsappNumber", "whatsappDefaultMessage", "phoneDisplay", "email", "address",
  "instagram", "facebook", "youtube", "linkedin", "heroEyebrow", "heroTitlePrefix",
  "heroTitleHighlight", "heroDescription", "heroStat1Value", "heroStat1Label",
  "heroStat2Value", "heroStat2Label", "heroStat3Value", "heroStat3Label",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateString(value, maxLength) {
  return typeof value === "string" && value.length <= maxLength;
}

function normalizeWhatsAppNumber(rawNumber) {
  const digits = String(rawNumber || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function validateSiteConfig(config) {
  if (!isPlainObject(config)) return "Formato de configuração inválido.";
  if (Object.keys(config).length > 100) return "Configuração contém campos demais.";

  for (const [key, value] of Object.entries(config)) {
    if (!stringFields.has(key) &&
      !["plans", "products", "cities", "faqs", "testimonials"].includes(key)) {
      return `Campo de configuração não permitido: ${key}`;
    }
  }

  for (const key of stringFields) {
    if (config[key] !== undefined && !validateString(config[key],
      key === "whatsappDefaultMessage" || key === "heroDescription" ? 1000 : 500)) {
      return `Campo inválido: ${key}`;
    }
  }

  if (config.whatsappNumber !== undefined) {
    const digits = normalizeWhatsAppNumber(config.whatsappNumber);
    if (config.whatsappNumber !== "" &&
      (!/^55\d{10,11}$/.test(digits) || digits.length > 13)) {
      return "Número de WhatsApp inválido.";
    }
  }

  if (config.plans !== undefined) {
    if (!Array.isArray(config.plans) || config.plans.length > 20) {
      return "Lista de planos inválida.";
    }
    for (const plan of config.plans) {
      if (!isPlainObject(plan) ||
        typeof plan.name !== "string" || plan.name.length > 100 ||
        typeof plan.priceMonthly !== "number" || !Number.isFinite(plan.priceMonthly) ||
        typeof plan.priceAnnual !== "number" || !Number.isFinite(plan.priceAnnual) ||
        typeof plan.tagline !== "string" || plan.tagline.length > 500 ||
        typeof plan.badge !== "string" || plan.badge.length > 100 ||
        typeof plan.cta !== "string" || plan.cta.length > 100 ||
        typeof plan.highlight !== "boolean" ||
        !Array.isArray(plan.features) || plan.features.length > 50 ||
        plan.features.some((feature) => typeof feature !== "string" || feature.length > 300)) {
        return "Dados de plano inválidos.";
      }
      if (plan.priceMonthly < 0 || plan.priceAnnual < 0) return "Preços de plano inválidos.";
    }
  }

  for (const [key, maxItems] of [["products", 100], ["cities", 100], ["faqs", 100], ["testimonials", 100]]) {
    if (config[key] !== undefined && (!Array.isArray(config[key]) || config[key].length > maxItems)) {
      return `Lista inválida: ${key}`;
    }
  }
  return null;
}

const publicListFields = {
  plans: ["name", "priceMonthly", "priceAnnual", "tagline", "badge", "features", "highlight", "cta"],
  products: ["id", "name", "price", "unit", "category"],
  cities: ["name", "state", "status"],
  faqs: ["q", "a"],
  testimonials: ["name", "business", "city", "text", "results", "initials", "rating"],
};

function toPublicSiteConfig(config) {
  const publicFields = new Set([...stringFields, ...Object.keys(publicListFields)]);
  const publicConfig = Object.fromEntries(
    Object.entries(config).filter(([key]) => publicFields.has(key))
  );

  for (const [key, allowedFields] of Object.entries(publicListFields)) {
    if (!Array.isArray(config[key])) continue;
    publicConfig[key] = config[key]
      .filter(isPlainObject)
      .map((item) => Object.fromEntries(
        Object.entries(item).filter(([field]) => allowedFields.includes(field))
      ));
  }

  return publicConfig;
}

app.get("/api/admin/settings", requireAuth, requirePasswordChanged, (req, res) => {
  try {
    const row = db.prepare("SELECT value FROM site_settings WHERE key = 'site_config'").get();
    res.json({ settings: row ? JSON.parse(row.value) : null });
  } catch (error) {
    console.error("Could not read administrative settings:", error);
    res.status(503).json({ error: "Configurações administrativas indisponíveis." });
  }
});

app.put("/api/admin/settings", requireAuth, requirePasswordChanged, requireCsrf, (req, res) => {
  if (!req.body?.settings || typeof req.body.settings !== "object" || Array.isArray(req.body.settings)) {
    return res.status(400).json({ error: "Formato de configuração inválido." });
  }
  const settings = { ...req.body.settings };
  if (Object.prototype.hasOwnProperty.call(settings, "whatsappNumber")) {
    settings.whatsappNumber = normalizeWhatsAppNumber(settings.whatsappNumber);
  }
  const value = JSON.stringify(settings);
  if (Buffer.byteLength(value, "utf8") > CONFIG_MAX_BYTES) {
    return res.status(413).json({ error: "Configuração excede o tamanho permitido." });
  }
  const validationError = validateSiteConfig(settings);
  if (validationError) return res.status(400).json({ error: validationError });
  try {
    db.prepare(`
      INSERT INTO site_settings (key, value, updated_at) VALUES ('site_config', ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(value, new Date().toISOString());
  } catch (error) {
    console.error("Could not persist site configuration:", error);
    return res.status(503).json({ error: "Não foi possível salvar as configurações." });
  }
  res.json({ updated: true });
});

app.get("/api/site-config", (req, res) => {
  try {
    const row = db.prepare("SELECT value FROM site_settings WHERE key = 'site_config'").get();
    if (!row) return res.json({});
    const config = JSON.parse(row.value);
    const validationError = validateSiteConfig(config);
    if (validationError) {
      console.error("Stored public configuration failed validation:", validationError);
      return res.status(503).json({ error: "Configuração pública indisponível." });
    }
    return res.json(toPublicSiteConfig(config));
  } catch (error) {
    console.error("Could not read public site configuration:", error);
    return res.status(503).json({ error: "Configuração pública indisponível." });
  }
});

const publicationLocks = new Map();
const publicationAuditPath = path.join(path.dirname(config.databasePath), "publication-audit.jsonl");

function appendPublicationAudit(record) {
  mkdirSync(path.dirname(publicationAuditPath), { recursive: true });
  appendFileSync(publicationAuditPath, `${JSON.stringify(record)}\n`, "utf8");
}

app.get("/api/admin/publish/prepare", requireAuth, requirePasswordChanged, requireCsrf, async (req, res) => {
  try {
    const publisher = createGitHubPublisher();
    const preparation = await publisher.prepare();
    res.json({
      prepared: true,
      baseSha: preparation.baseSha,
      fileSha: preparation.fileSha,
      repository: "cdssistemas10-design/cdssistemas10-design.github.io",
      branch: "main",
    });
  } catch (error) {
    console.error("Could not prepare GitHub publication:", error);
    const message = error instanceof Error && /GITHUB_TOKEN não configurado|não autorizado|não autorizado|branch/i.test(error.message)
      ? "Publicação GitHub indisponível: verifique a configuração local."
      : "Não foi possível consultar o GitHub.";
    res.status(error instanceof Error && /GITHUB_TOKEN não configurado/i.test(error.message) ? 503 : 502).json({ error: message });
  }
});

app.post("/api/admin/publish", requireAuth, requirePasswordChanged, requireCsrf, async (req, res) => {
  const baseSha = typeof req.body?.baseSha === "string" ? req.body.baseSha : "";
  const settings = req.body?.settings;
  if (!/^[0-9a-f]{40}$/i.test(baseSha) || !isPlainObject(settings)) {
    return res.status(400).json({ error: "Dados de publicação inválidos." });
  }

  const normalized = { ...settings };
  if (typeof normalized.whatsappNumber === "string") {
    normalized.whatsappNumber = normalizeWhatsAppNumber(normalized.whatsappNumber);
  }
  const validationError = validateSiteConfig(normalized);
  if (validationError) return res.status(400).json({ error: validationError });
  const content = `${JSON.stringify(normalized, null, 2)}\n`;
  if (Buffer.byteLength(content, "utf8") > CONFIG_MAX_BYTES) {
    return res.status(413).json({ error: "Configuração excede o tamanho permitido." });
  }

  if (publicationLocks.has(req.session.adminId)) {
    return res.status(409).json({ error: "Já existe uma publicação em andamento." });
  }
  publicationLocks.set(req.session.adminId, true);

  try {
    const publisher = createGitHubPublisher();
    const result = await publisher.publish({
      baseSha,
      filePath: "src/site-config.json",
      content,
    });
    appendPublicationAudit({
      commitSha: result.commitSha,
      baseSha,
      status: result.duplicate ? "duplicate" : "commit_created",
      message: result.duplicate ? "Conteúdo já publicado." : "Commit criado.",
      createdAt: result.publishedAt || new Date().toISOString(),
    });
    res.json({
      commitSha: result.commitSha,
      publishedAt: result.publishedAt || null,
      duplicate: Boolean(result.duplicate),
      state: result.duplicate ? "published" : "commit_received",
    });
  } catch (error) {
    const isConflict = error instanceof Error && error.code === "CONFLICT_SHA";
    const message = isConflict
      ? "A branch recebeu alterações externas. Atualize a preparação e tente novamente."
      : "Não foi possível publicar no GitHub.";
    appendPublicationAudit({
      commitSha: null,
      baseSha,
      status: isConflict ? "conflict" : "failed",
      message,
      createdAt: new Date().toISOString(),
    });
    console.error("GitHub publication failed:", error);
    res.status(isConflict ? 409 : 502).json({ error: message });
  } finally {
    publicationLocks.delete(req.session.adminId);
  }
});

app.get("/api/admin/publish/status/:commitSha", requireAuth, requirePasswordChanged, async (req, res) => {
  try {
    const publisher = createGitHubPublisher();
    const status = await publisher.status(req.params.commitSha);
    res.json(status);
  } catch (error) {
    console.error("Could not query GitHub workflow status:", error);
    res.status(502).json({ error: "Não foi possível consultar o workflow." });
  }
});

app.get("/api/admin/publish/history", requireAuth, requirePasswordChanged, (req, res) => {
  try {
    if (!existsSync(publicationAuditPath)) return res.json({ publications: [] });
    const rows = readFileSync(publicationAuditPath, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .slice(-20)
      .reverse()
      .map((line) => JSON.parse(line));
    res.json({ publications: rows });
  } catch (error) {
    console.error("Could not read publication audit:", error);
    res.status(503).json({ error: "Não foi possível consultar o histórico de publicação." });
  }
});

const frontendPath = path.join(__dirname, "dist");
if (existsSync(path.join(frontendPath, "index.html"))) {
  app.use(express.static(frontendPath));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

export {
  app,
  db,
  sessionStore,
  SQLiteSessionStore,
  validateSiteConfig,
  toPublicSiteConfig,
  config,
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, host, () => {
    console.log(`CDS administrativo disponível em http://${host}:${port}`);
  });
}
