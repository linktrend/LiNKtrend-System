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
    .filter((f) => f.endsWith(".sql") && f !== "ALL_IN_ONE.sql")
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
  if (err?.code === "ENOTFOUND" && String(process.env.DATABASE_URL).includes("db.")) {
    console.error(
      "\nHint: direct db.<project>.supabase.co is often IPv6-only. Use the Session pooler URI from Supabase Dashboard → Connect, or run ALL_IN_ONE.sql in the SQL Editor.\n",
    );
  }
  process.exit(1);
});
