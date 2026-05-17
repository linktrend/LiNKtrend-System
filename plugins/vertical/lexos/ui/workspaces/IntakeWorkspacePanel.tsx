/**
 * IntakeWorkspacePanel - W0 Client/Matter Intake
 *
 * Workspace panel for processing new client/matter intake,
 * conflict checking, and KYC/CDD.
 *
 * Stage: W0 (Client Onboarding)
 */

import React from 'react';
import { WorkspaceContainer } from '../layouts/WorkspaceContainer';

export interface IntakeWorkspacePanelProps {
  /** Intake record identifier */
  intakeId: string;
}

/**
 * Client/matter intake workspace panel
 *
 * Placeholder implementation for MVO scaffold.
 *
 * @example
 * ```tsx
 * <IntakeWorkspacePanel intakeId="intake-456" />
 * ```
 */
export function IntakeWorkspacePanel({ intakeId }: IntakeWorkspacePanelProps) {
  return (
    <WorkspaceContainer
      title="Intake Workspace"
      stage="W0"
      description="Process new client/matter intake, conflict check, and KYC/CDD"
      actions={
        <>
          <button
            disabled
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 opacity-50"
          >
            Reject
          </button>
          <button
            disabled
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Accept Matter
          </button>
        </>
      }
    >
      <div className="intake-workspace-placeholder rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Intake Workspace Panel
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Intake ID: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{intakeId}</code>
        </p>
        <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Not Yet Implemented</p>
          <p className="mt-1">
            This panel will provide intake form processing, conflict checking,
            KYC/CDD workflows, and client/matter creation. Integrates with LinkBot
            intake agent role and mock CRM capability. Note: Human approval required
            for acceptance in MVO mode. Part of W0 (Client Onboarding) workflow stage.
          </p>
        </div>
      </div>
    </WorkspaceContainer>
  );
}
