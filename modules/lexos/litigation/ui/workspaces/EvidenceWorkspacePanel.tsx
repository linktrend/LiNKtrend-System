/**
 * EvidenceWorkspacePanel - W4 Evidence Intake and Processing
 *
 * Workspace panel for uploading, browsing, and processing case evidence.
 *
 * Stage: W4 (Evidence Intake)
 */

import React from 'react';
import { WorkspaceContainer } from '../layouts/WorkspaceContainer';

export interface EvidenceWorkspacePanelProps {
  /** Matter identifier */
  matterId: string;
}

/**
 * Evidence workspace panel
 *
 * Placeholder implementation for MVO scaffold.
 *
 * @example
 * ```tsx
 * <EvidenceWorkspacePanel matterId="matter-123" />
 * ```
 */
export function EvidenceWorkspacePanel({ matterId }: EvidenceWorkspacePanelProps) {
  return (
    <WorkspaceContainer
      title="Evidence Workspace"
      stage="W4"
      description="Upload, browse, and process case evidence"
      actions={
        <>
          <button
            disabled
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 opacity-50"
          >
            Browse
          </button>
          <button
            disabled
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Upload Evidence
          </button>
        </>
      }
    >
      <div className="evidence-workspace-placeholder rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Evidence Workspace Panel
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Matter ID: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{matterId}</code>
        </p>
        <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Not Yet Implemented</p>
          <p className="mt-1">
            This panel will provide evidence upload, OCR/text extraction, evidence catalog,
            and quality assessment tools. Integrates with LiNKautowork for deterministic
            extraction workflows. Part of W4 (Evidence Intake) workflow stage.
          </p>
        </div>
      </div>
    </WorkspaceContainer>
  );
}
