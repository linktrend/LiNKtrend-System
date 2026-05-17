type AuthenticatedUser = { id: string };

type KernelAuthEnv = Record<string, string | undefined>;

export type KernelActor =
  | { kind: "service"; actorId: "mvo-service" }
  | { kind: "user"; actorId: string };

export type ResolveKernelActorDeps = {
  getUserByAccessToken: (accessToken: string) => Promise<AuthenticatedUser | null>;
};

export type KernelScopeAccessDeps = {
  getRunScope: (runId: string) => Promise<{ tenantId: string; requestedByActorId: string } | null>;
  getApprovalScope: (
    approvalId: string
  ) => Promise<{ runId: string; tenantId: string; requestedByActorId: string } | null>;
  userOwnsTenantScope: (actorId: string, tenantId: string) => Promise<boolean>;
};

export type KernelAccessScope =
  | { kind: "tenant"; tenantId: string }
  | { kind: "run"; runId: string }
  | { kind: "approval"; approvalId: string };

function isTruthy(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ", 2);
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function hasEnabledServiceBypass(env: KernelAuthEnv): boolean {
  return isTruthy(env.LINKAIOS_ENABLE_MVO_SERVICE_BYPASS);
}

function hasEnabledUserKernelApi(env: KernelAuthEnv): boolean {
  return !isTruthy(env.LINKAIOS_DISABLE_MVO_USER_KERNEL_API);
}

function parseOperatorAllowlist(env: KernelAuthEnv): Set<string> | null {
  const raw = env.LINKAIOS_MVO_KERNEL_OPERATOR_USER_IDS?.trim();
  if (!raw) return null;
  const ids = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return ids.length > 0 ? new Set(ids) : null;
}

function isUserAllowlisted(actorId: string, env: KernelAuthEnv): boolean {
  const allowlist = parseOperatorAllowlist(env);
  return allowlist ? allowlist.has(actorId) : false;
}

export function isKernelOperatorActor(
  actor: KernelActor,
  env: KernelAuthEnv = process.env
): boolean {
  return actor.kind === "service" || isUserAllowlisted(actor.actorId, env);
}

function isServiceBypassRequest(token: string, env: KernelAuthEnv): boolean {
  const secret = env.BOT_KERNEL_API_SECRET?.trim();
  if (!secret || !hasEnabledServiceBypass(env)) return false;
  return token === secret;
}

export async function canAccessKernelScope(
  actor: KernelActor,
  scope: KernelAccessScope,
  deps: KernelScopeAccessDeps,
  env: KernelAuthEnv = process.env
): Promise<boolean> {
  if (actor.kind === "service") return true;
  if (isUserAllowlisted(actor.actorId, env)) return true;

  if (scope.kind === "tenant") {
    return deps.userOwnsTenantScope(actor.actorId, scope.tenantId);
  }

  if (scope.kind === "run") {
    const runScope = await deps.getRunScope(scope.runId);
    if (!runScope) return false;
    return runScope.requestedByActorId === actor.actorId;
  }

  const approvalScope = await deps.getApprovalScope(scope.approvalId);
  if (!approvalScope) return false;
  if (approvalScope.requestedByActorId === actor.actorId) return true;
  const runScope = await deps.getRunScope(approvalScope.runId);
  return runScope?.requestedByActorId === actor.actorId;
}

export async function resolveKernelActor(
  req: Request,
  deps: ResolveKernelActorDeps,
  env: KernelAuthEnv = process.env
): Promise<KernelActor | null> {
  const token = getBearerToken(req.headers.get("authorization"));
  if (!token) return null;

  if (isServiceBypassRequest(token, env)) {
    return { kind: "service", actorId: "mvo-service" };
  }

  if (!hasEnabledUserKernelApi(env)) return null;

  const user = await deps.getUserByAccessToken(token);
  if (!user) return null;

  const allowlist = parseOperatorAllowlist(env);
  if (allowlist && !allowlist.has(user.id)) return null;

  return { kind: "user", actorId: user.id };
}
