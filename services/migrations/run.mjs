#!/usr/bin/env node
/**
 * Runs *.sql in this folder in sorted order using DATABASE_URL.
 * Usage (from repo root): pnpm db:migrate
 * Requires: DATABASE_URL in .env (never commit .env)
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Add it to .env (see .env.example).");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString });
  await client.connect();
  const files = (await readdir(__dirname))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const full = path.join(__dirname, file);
    const sql = await readFile(full, "utf8");
    if (!sql.trim()) continue;
    console.log("Applying:", file);
    await client.query(sql);
  }

  await client.end();
  console.log("Migrations finished.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
