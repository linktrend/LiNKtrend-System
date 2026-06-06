import { resolveKernelActor, type KernelActor } from "@/lib/kernel/api-auth";

/** Vendor Admin or service token for LiNKsuitegen Admin APIs. */
export async function resolveLinksuitegenAdminActor(req: Request): Promise<KernelActor | null> {
  const serviceToken = process.env.LINKAIOS_ADMIN_SERVICE_TOKEN?.trim();
  const auth = req.headers.get("authorization");
  if (serviceToken && auth === `Bearer ${serviceToken}`) {
    return { kind: "service", actorId: "mvo-service" };
  }
  const kernelSecret = process.env.BOT_KERNEL_API_SECRET?.trim();
  if (kernelSecret && auth === `Bearer ${kernelSecret}`) {
    return { kind: "service", actorId: "mvo-service" };
  }
  return resolveKernelActor(req, {
    getUserByAccessToken: async () => null,
  });
}

export function isVendorAdminActor(actor: KernelActor | null): boolean {
  return actor?.kind === "service";
}
