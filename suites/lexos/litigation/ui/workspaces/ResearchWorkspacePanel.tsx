/**
 * ResearchWorkspacePanel - W7 Legal Research
 *
 * Workspace panel for conducting legal research and verifying citations.
 *
 * Stage: W7 (Legal Research)
 */

import React from 'react';
import { WorkspaceContainer } from '../layouts/WorkspaceContainer';

export interface ResearchWorkspacePanelProps {
  /** Matter identifier */
  matterId: string;
}

/**
 * Legal research workspace panel
 *
 * Placeholder implementation for MVO scaffold.
 *
 * @example
 * ```tsx
 * <ResearchWorkspacePanel matterId="matter-123" />
 * ```
 */
export function ResearchWorkspacePanel({ matterId }: ResearchWorkspacePanelProps) {
  return (
    <WorkspaceContainer
      title="Research Workspace"
      stage="W7"
      description="Conduct legal research and verify citations"
      actions={
        <>
          <button
            disabled
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 opacity-50"
          >
            Search Authorities
          </button>
          <button
            disabled
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Save Research Memo
          </button>
        </>
      }
    >
      <div className="research-workspace-placeholder rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Research Workspace Panel
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Matter ID: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{matterId}</code>
        </p>
        <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Not Yet Implemented</p>
          <p className="mt-1">
            This panel will provide tools for conducting legal research,
            finding authorities, verifying citations, and creating research memos.
            Uses LiNKbot librarian role. Note: Legal research API operates in shadow mode
            for MVO. Part of W7 (Legal Research) workflow stage.
          </p>
        </div>
      </div>
    </WorkspaceContainer>
  );
}
