import type { SkillRecord } from "@linktrend/shared-types";

/** Fail closed when governance requires a resolved approved skill row. */
export function assertResolvedApprovedSkill(
  skillName: string,
  skill: SkillRecord | null,
): asserts skill is SkillRecord {
  if (!skill) {
    throw new Error(
      `LiNKlogic enforcement: no approved skill "${skillName}" in linkaios.skills (status must be approved).`,
    );
  }
  if (skill.status !== "approved") {
    throw new Error(
      `LiNKlogic enforcement: skill "${skillName}" v${skill.version} has status "${skill.status}", expected approved.`,
    );
  }
}
