#!/usr/bin/env node
/**
 * Mirror `(shell)` routes under `(admin-shell)/admin/` as re-exports.
 * Skips root `(shell)/layout.tsx` and `(shell)/page.tsx` (admin has its own home).
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const shellRoot = path.join(root, "src/app/(shell)");
const adminRoot = path.join(root, "src/app/(admin-shell)/admin");

function walk(dir, relDir = "") {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = relDir ? `${relDir}/${ent.name}` : ent.name;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(abs, rel);
      continue;
    }
    if (ent.name !== "page.tsx" && ent.name !== "layout.tsx") continue;
    if (rel === "page.tsx" || rel === "layout.tsx") {
      if (ent.name === "page.tsx" && rel === "page.tsx") continue;
      if (ent.name === "layout.tsx" && rel === "layout.tsx") continue;
    }
    if (rel === "page.tsx") continue;

    const adminFile = path.join(adminRoot, rel);
    fs.mkdirSync(path.dirname(adminFile), { recursive: true });
    const importPath = `@/app/(shell)/${rel.replace(/\.tsx$/, "")}`;
    const content =
      ent.name === "page.tsx"
        ? `export { default } from "${importPath}";\nexport * from "${importPath}";\n`
        : `export { default } from "${importPath}";\n`;
    fs.writeFileSync(adminFile, content);
  }
}

walk(shellRoot);
console.log("Admin route mirror synced.");
