import path from "node:path";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import { resolveDatabasePath } from "../server-config.js";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_INITIAL_PASSWORD;

if (username !== "cds.Diego") {
  throw new Error("Provisionamento permitido somente para cds.Diego.");
}
if (!password) {
  throw new Error("ADMIN_INITIAL_PASSWORD é obrigatório.");
}
if (password.length < 8) {
  throw new Error("ADMIN_INITIAL_PASSWORD deve ter pelo menos 8 caracteres.");
}

const databasePath = resolveDatabasePath(process.env);
mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    must_change_password INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
  );
`);

const existing = db.prepare("SELECT id FROM admin_users WHERE username = ?").get(username);
if (existing) {
  db.close();
  throw new Error("A conta administrativa já existe.");
}

const passwordHash = await bcrypt.hash(password, 12);
db.prepare(
  "INSERT INTO admin_users (username, password_hash, must_change_password, updated_at) VALUES (?, ?, 1, ?)"
).run(username, passwordHash, new Date().toISOString());
db.close();
console.log("Conta administrativa inicial provisionada.");
