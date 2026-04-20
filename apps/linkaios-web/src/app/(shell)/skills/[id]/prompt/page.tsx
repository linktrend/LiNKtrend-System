import { redirect } from "next/navigation";

export default async function LegacySkillPromptPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  redirect(`/skills/${id}`);
}
