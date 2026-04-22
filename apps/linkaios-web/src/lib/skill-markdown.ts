/**
 * Split / merge LiNKskill body as SKILL.md-style: optional YAML frontmatter between --- fences, then markdown prompt.
 */

export type ParsedSkillBody = {
  frontmatterYaml: string;
  promptMarkdown: string;
};

export function parseSkillBodyMarkdown(body: string): ParsedSkillBody {
  const trimmed = body.replace(/^\uFEFF/, "").trimStart();
  if (!trimmed.startsWith("---")) {
    return { frontmatterYaml: "", promptMarkdown: body };
  }
  const rest = trimmed.slice(3).replace(/^\r?\n/, "");
  const end = rest.indexOf("\n---");
  if (end === -1) {
    return { frontmatterYaml: "", promptMarkdown: body };
  }
  const yaml = rest.slice(0, end).trim();
  let after = rest.slice(end + 4);
  if (after.startsWith("\r\n")) after = after.slice(2);
  else if (after.startsWith("\n")) after = after.slice(1);
  return { frontmatterYaml: yaml, promptMarkdown: after.replace(/^\r?\n/, "") };
}

export function mergeSkillBodyMarkdown(frontmatterYaml: string, promptMarkdown: string): string {
  const yaml = frontmatterYaml.trim();
  if (!yaml) {
    return promptMarkdown;
  }
  return `---\n${yaml}\n---\n\n${promptMarkdown}`;
}

/** Prose-only body: strips legacy YAML frontmatter for display and for saves that must not reintroduce manifest YAML. */
export function getSkillBodyPromptOnly(body: string): string {
  return parseSkillBodyMarkdown(body).promptMarkdown;
}
