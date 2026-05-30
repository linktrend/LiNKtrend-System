/**
 * AssertionsWorkspacePanel - W5 Support Matrix and Assertions
 *
 * Workspace panel for mapping evidence to assertions and building
 * the support matrix.
 *
 * Stage: W5 (Support Matrix)
 */

import React from 'react';
import { WorkspaceContainer } from '../layouts/WorkspaceContainer';

export interface AssertionsWorkspacePanelProps {
  /** Matter identifier */
  matterId: string;
}

/**
 * Assertions and support matrix workspace panel
 *
 * Placeholder implementation for MVO scaffold.
 *
 * @example
 * ```tsx
 * <AssertionsWorkspacePanel matterId="matter-123" />
 * ```
 */
export function AssertionsWorkspacePanel({ matterId }: AssertionsWorkspacePanelProps) {
  return (
    <WorkspaceContainer
      title="Assertions Workspace"
      stage="W5"
      description="Build support matrix, map evidence to assertions, identify contradictions"
      actions={
        <>
          <button
            disabled
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 opacity-50"
          >
            Export Matrix
          </button>
          <button
            disabled
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Refresh Analysis
          </button>
        </>
      }
    >
      <div className="assertions-workspace-placeholder rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Assertions Workspace Panel
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Matter ID: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{matterId}</code>
        </p>
        <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Not Yet Implemented</p>
          <p className="mt-1">
            This panel will display the support matrix, map evidence to assertions,
            identify contradictions, and highlight evidence gaps.
            Integrates with LiNKbot analyst role for reasoning.
            Part of W5 (Support Matrix) workflow stage.
          </p>
        </div>
      </div>
    </WorkspaceContainer>
  );
}
