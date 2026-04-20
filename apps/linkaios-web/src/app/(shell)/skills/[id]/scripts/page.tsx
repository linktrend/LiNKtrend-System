import { redirect } from "next/navigation";

export default async function LegacySkillScriptsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  redirect(`/skills/${id}`);
}
