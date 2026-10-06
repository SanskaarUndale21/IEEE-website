// One-time helper: generates the admin secrets and prints the lines to put in
// .env.local (and Vercel env vars). Run:  node scripts/setup-admin.mjs
// The password is read from the prompt and is never written to disk by this script.

import { randomBytes, scryptSync } from "node:crypto";
import readline from "node:readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const password = await ask("Choose the admin password (min 14 chars): ");
rl.close();

if (password.length < 14) {
  console.error("Too short. Use at least 14 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const N = 32768, r = 8, p = 1;
const hash = scryptSync(password, salt, 64, { N, r, p, maxmem: 256 * 1024 * 1024 });
const stored = `scrypt:${N}:${r}:${p}:${salt.toString("base64url")}:${hash.toString("base64url")}`;

const routeKey = `101132497-${randomBytes(36).toString("base64url")}`; // IEEE id + 48 random chars
const sessionSecret = randomBytes(48).toString("base64url");
const ipSalt = randomBytes(24).toString("base64url");

console.log("\nAdd these to .env.local and to Vercel (Production + Preview):\n");
console.log("ADMIN_IEEE_ID=101132497");
console.log(`ADMIN_ROUTE_KEY=${routeKey}`);
console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`);
console.log(`ADMIN_PASSWORD_HASH=${stored}`);
console.log(`IP_HASH_SALT=${ipSalt}`);
console.log(`\nYour private admin URL:  https://<your-domain>/${routeKey}\n`);
console.log("Keep the URL secret. Do not commit .env.local.");
