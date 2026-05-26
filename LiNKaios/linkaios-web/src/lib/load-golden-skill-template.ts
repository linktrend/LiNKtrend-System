import fs from "node:fs";
import path from "node:path";

function repoRootFromWebCwd(): string {
  const cwd = process.cwd();
  if (cwd.endsWith("linkaios-web")) {
    return path.resolve(cwd, "../..");
  }
  return path.resolve(cwd);
}

/** Load packages/linklogic-sdk/templates/skill-golden.md for licensor skill creation. */
export function loadGoldenSkillTemplateMarkdown(): string {
  const templatePath = path.join(repoRootFromWebCwd(), "packages/linklogic-sdk/templates/skill-golden.md");
  if (!fs.existsSync(templatePath)) {
    return "# {{name}}\n\n## Overview\n\nDescribe what this skill does.\n";
  }
  return fs.readFileSync(templatePath, "utf8");
}

export function applyGoldenTemplateName(raw: string, skillName: string): string {
  const title = skillName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return raw
    .replace(/^name:\s*skill-template\s*$/m, `name: ${skillName}`)
    .replace(/^#\s*<Skill Name Identifier>\s*$/m, `# ${title}`)
    .replace(/<SKILLNAME>/g, skillName.toUpperCase().replace(/-/g, ""));
}
