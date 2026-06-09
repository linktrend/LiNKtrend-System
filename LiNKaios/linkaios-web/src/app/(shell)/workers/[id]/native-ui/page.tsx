import { linkbotNativeUiHref } from "@/lib/linkbot-native-ui";

import { NativeUiLauncher } from "@/components/native-ui-launcher";

export const dynamic = "force-dynamic";

export default async function WorkerNativeUiPlaceholderPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const href = linkbotNativeUiHref(id);
  return <NativeUiLauncher href={href} agentId={id} />;
}
