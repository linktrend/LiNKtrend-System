import { redirect } from "next/navigation";

export default function GatewayLegacyRedirect() {
  redirect("/settings/gateway");
}
