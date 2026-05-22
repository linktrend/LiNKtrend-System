/**
 * Venture Detail Page
 *
 * Drill-down view for a specific venture/app-factory run.
 * Shows squad status, stage progression, and handoff artifacts.
 */

import Link from "next/link";

interface VentureDetailPageProps {
  params: Promise<{ id: string }>;
}

// Placeholder venture detail
const mockVentureDetail = {
  id: "venture-001",
  name: "Acme Startup Portal",
  description: "A modern web portal for Acme Startup with integrated CRM and payment capabilities.",
  blueprint: {
    ref: "blueprint:acme-001",
    prdSummary: "B2B SaaS portal with Stripe billing, Supabase backend, and React frontend",
    businessPlanRef: "bp:acme-001",
  },
  currentPhase: "5.4",
  currentStage: "linkapps.phase5.ai_implementation",
  status: "running",
  progress: {
    stagesCompleted: 3,
    stagesTotal: 7,
    currentIteration: 3,
  },
  squad: {
    technicalLead: "linkbot-tl-001",
    frontendSpecialist: "linkbot-fe-001",
    backendSpecialist: "linkbot-be-001",
    productOwner: "linkbot-po-001",
  },
  artifacts: {
    appRepoRef: "repo:tenant-001:acme-portal:abc123",
    serviceCredentialsRef: "creds:tenant-001:acme-portal:xyz789",
    deploymentRefs: ["deploy:tenant-001:repo-abc:def456"],
    previewUrl: "https://acme-portal-preview-mock.vercel.app",
  },
  createdAt: "2026-05-15T10:00:00Z",
  updatedAt: "2026-05-18T09:30:00Z",
};

const stageProgression = [
  { id: "5.1", name: "Squad Formation", status: "completed" },
  { id: "5.2", name: "Repository Generation", status: "completed" },
  { id: "5.3", name: "Service Provisioning", status: "completed" },
  { id: "5.4", name: "AI Implementation", status: "in_progress" },
  { id: "5.5", name: "Quality Validation", status: "pending" },
  { id: "5.6", name: "Deployment", status: "pending" },
  { id: "5.7", name: "Handoff Pack", status: "pending" },
];

export default async function VentureDetailPage({ params }: VentureDetailPageProps) {
  const { id } = await params;
  const venture = mockVentureDetail; // Would fetch by id

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/suites/linkapps" className="hover:underline">LiNKapps</Link>
        <span>/</span>
        <Link href="/suites/linkapps/ventures" className="hover:underline">Ventures</Link>
        <span>/</span>
        <span className="text-foreground">{venture.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{venture.name}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">{venture.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              Phase {venture.currentPhase}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              venture.status === "running" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
            }`}>
              {venture.status}
            </span>
            <span className="text-xs text-muted-foreground">
              Updated {new Date(venture.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/suites/linkapps/ventures/${id}/logs`}
            className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            View Logs
          </Link>
          <Link
            href={venture.artifacts.previewUrl}
            target="_blank"
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Preview Site →
          </Link>
        </div>
      </div>

      {/* Stage Progression */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-medium mb-4">Stage Progression</h2>
        <div className="flex items-center gap-2">
          {stageProgression.map((stage, index) => (
            <div key={stage.id} className="flex items-center">
              <div className={`flex flex-col items-center ${
                stage.status === "completed" ? "text-green-600" :
                stage.status === "in_progress" ? "text-blue-600" :
                "text-muted-foreground"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stage.status === "completed" ? "bg-green-100" :
                  stage.status === "in_progress" ? "bg-blue-100 ring-2 ring-blue-300" :
                  "bg-muted"
                }`}>
                  {stage.status === "completed" ? "✓" : stage.id}
                </div>
                <span className="text-xs mt-1 whitespace-nowrap">{stage.name}</span>
              </div>
              {index < stageProgression.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  stage.status === "completed" ? "bg-green-300" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Squad Status */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-medium mb-4">Active Squad</h2>
          <div className="space-y-3">
            <SquadMemberRow role="Technical Lead" botId={venture.squad.technicalLead} status="active" />
            <SquadMemberRow role="Product Owner" botId={venture.squad.productOwner} status="standby" />
            <SquadMemberRow role="Frontend Specialist" botId={venture.squad.frontendSpecialist} status="active" />
            <SquadMemberRow role="Backend Specialist" botId={venture.squad.backendSpecialist} status="active" />
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link href={`/suites/linkapps/ventures/${id}/squad`} className="text-sm text-primary hover:underline">
              Manage squad →
            </Link>
          </div>
        </div>

        {/* Artifacts & References */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-medium mb-4">Artifacts & References</h2>
          <div className="space-y-2 text-sm">
            <ArtifactRow label="App Repository" value={venture.artifacts.appRepoRef} />
            <ArtifactRow label="Service Credentials" value={venture.artifacts.serviceCredentialsRef} />
            <ArtifactRow label="Blueprint" value={venture.blueprint.ref} />
            <ArtifactRow label="Business Plan" value={venture.blueprint.businessPlanRef} />
            <div className="pt-2">
              <span className="text-muted-foreground">Deployments:</span>
              <ul className="mt-1 space-y-1">
                {venture.artifacts.deploymentRefs.map((ref) => (
                  <li key={ref} className="font-mono text-xs bg-muted px-2 py-1 rounded">{ref}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-medium mb-4">Recent Activity</h2>
        <div className="space-y-3 text-sm">
          <ActivityItem
            timestamp="2026-05-18T09:30:00Z"
            event="linkapps.build.iteration"
            description="Build iteration #3 completed with all checks passing"
          />
          <ActivityItem
            timestamp="2026-05-18T08:15:00Z"
            event="linkapps.role.completed"
            description="Backend Specialist completed API implementation slice"
          />
          <ActivityItem
            timestamp="2026-05-17T16:45:00Z"
            event="linkapps.services.provisioned"
            description="Supabase and Stripe service stubs created"
          />
        </div>
      </div>
    </div>
  );
}

function SquadMemberRow({ role, botId, status }: { role: string; botId: string; status: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          status === "active" ? "bg-green-500" :
          status === "standby" ? "bg-amber-500" :
          "bg-gray-300"
        }`} />
        <div>
          <div className="font-medium">{role}</div>
          <div className="text-xs text-muted-foreground font-mono">{botId}</div>
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded ${
        status === "active" ? "bg-green-50 text-green-700" :
        status === "standby" ? "bg-amber-50 text-amber-700" :
        "bg-gray-50 text-gray-700"
      }`}>
        {status}
      </span>
    </div>
  );
}

function ArtifactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{value}</span>
    </div>
  );
}

function ActivityItem({ timestamp, event, description }: { timestamp: string; event: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {new Date(timestamp).toLocaleTimeString()}
      </div>
      <div>
        <div className="font-mono text-xs text-primary">{event}</div>
        <div className="text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
