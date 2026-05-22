/**
 * Venture Detail Page
 *
 * Drill-down view for a specific venture/app-factory run.
 * Shows squad status, stage progression, and handoff artifacts.
 */

import Link from "next/link";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { VentureBreadcrumbRegister } from "@/components/ventures/venture-breadcrumb-register";
import {
  VentureActivityPanel,
  VentureArtifactsPanel,
  VentureSquadPanel,
  VentureStageProgression,
  VentureStatusPills,
} from "@/components/ventures/venture-detail-panels";
import { BUTTON } from "@/lib/ui-standards";

interface VentureDetailPageProps {
  params: Promise<{ id: string }>;
}

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

const recentActivity = [
  {
    timestamp: "2026-05-18T09:30:00Z",
    event: "linkapps.build.iteration",
    description: "Build iteration #3 completed with all checks passing",
  },
  {
    timestamp: "2026-05-18T08:15:00Z",
    event: "linkapps.role.completed",
    description: "Backend Specialist completed API implementation slice",
  },
  {
    timestamp: "2026-05-17T16:45:00Z",
    event: "linkapps.services.provisioned",
    description: "Supabase and Stripe service stubs created",
  },
];

export default async function VentureDetailPage({ params }: VentureDetailPageProps) {
  const { id } = await params;
  const venture = mockVentureDetail;

  return (
    <main className="space-y-8">
      <VentureBreadcrumbRegister ventureId={id} displayName={venture.name} />

      <ShellPageHeaderClient
        title={venture.name}
        subtitle={venture.description}
        actions={
          <>
            <Link href={`/suites/linkapps/ventures/${id}/logs`} className={BUTTON.secondaryRow}>
              View Logs
            </Link>
            <a href={venture.artifacts.previewUrl} target="_blank" rel="noopener noreferrer" className={BUTTON.primaryRow}>
              Preview Site ↗
            </a>
          </>
        }
      />

      <VentureStatusPills phase={venture.currentPhase} status={venture.status} updatedAt={venture.updatedAt} />

      <VentureStageProgression stages={stageProgression} />

      <div className="grid gap-6 lg:grid-cols-2">
        <VentureSquadPanel ventureId={id} squad={venture.squad} />
        <VentureArtifactsPanel
          blueprintRef={venture.blueprint.ref}
          businessPlanRef={venture.blueprint.businessPlanRef}
          artifacts={venture.artifacts}
        />
      </div>

      <VentureActivityPanel items={recentActivity} />
    </main>
  );
}
