import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export function resolveDatabasePath(env = process.env) {
  const rawConfiguredPath = env.DATABASE_PATH;
  if (env.NODE_ENV === "production" && rawConfiguredPath === undefined) {
    throw new Error("DATABASE_PATH is required in production.");
  }
  if (rawConfiguredPath !== undefined) {
    if (typeof rawConfiguredPath !== "string" || !rawConfiguredPath.trim()) {
      throw new Error("DATABASE_PATH must be a non-empty path.");
    }
    const configuredPath = rawConfiguredPath.trim();
    if (env.NODE_ENV === "production" && !path.isAbsolute(configuredPath)) {
      throw new Error("DATABASE_PATH must be absolute in production.");
    }
    return path.resolve(projectRoot, configuredPath);
  }
  return path.join(projectRoot, "data", "admin.db");
}

function parseOrigin(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("PUBLIC_ORIGIN must be a valid HTTP or HTTPS origin.");
  }
  if (!["http:", "https:"].includes(url.protocol) ||
    url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("PUBLIC_ORIGIN must contain only an HTTP or HTTPS origin.");
  }
  return url.origin;
}

export function loadServerConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV === undefined ? "development" : env.NODE_ENV;
  if (!["development", "test", "production"].includes(nodeEnv)) {
    throw new Error("NODE_ENV must be development, test, or production.");
  }
  const production = nodeEnv === "production";

  const rawPort = env.PORT === undefined ? "3000" : env.PORT;
  if (typeof rawPort !== "string" || !/^\d+$/.test(rawPort)) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  const port = Number(rawPort);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  const host = env.HOST === undefined ? "0.0.0.0" : env.HOST.trim();
  if (!host || /\s/.test(host)) {
    throw new Error("HOST must be a non-empty hostname or IP address.");
  }

  let trustProxy = false;
  if (env.TRUST_PROXY !== undefined) {
    if (typeof env.TRUST_PROXY !== "string" || !/^\d+$/.test(env.TRUST_PROXY)) {
      throw new Error("TRUST_PROXY must be a non-negative integer hop count.");
    }
    trustProxy = Number(env.TRUST_PROXY);
    if (!Number.isSafeInteger(trustProxy)) {
      throw new Error("TRUST_PROXY must be a non-negative integer hop count.");
    }
  }

  const sessionSecret = env.SESSION_SECRET;
  if (sessionSecret !== undefined &&
    (typeof sessionSecret !== "string" || Buffer.byteLength(sessionSecret, "utf8") < 32)) {
    throw new Error("SESSION_SECRET must contain at least 32 bytes.");
  }
  if (production && !sessionSecret) {
    throw new Error("SESSION_SECRET is required in production.");
  }

  const publicOrigin = env.PUBLIC_ORIGIN === undefined
    ? null
    : parseOrigin(env.PUBLIC_ORIGIN);
  if (production && !publicOrigin) {
    throw new Error("PUBLIC_ORIGIN is required in production.");
  }
  if (production && publicOrigin && !publicOrigin.startsWith("https://")) {
    throw new Error("PUBLIC_ORIGIN must use HTTPS in production.");
  }

  return {
    nodeEnv,
    production,
    host,
    port,
    trustProxy,
    publicOrigin,
    sessionSecret,
    databasePath: resolveDatabasePath(env),
  };
}
