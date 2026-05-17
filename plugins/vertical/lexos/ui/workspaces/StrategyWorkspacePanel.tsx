/**
 * StrategyWorkspacePanel - W6 Case Strategy Development
 *
 * Workspace panel for developing case strategy from supported facts.
 *
 * Stage: W6 (Strategy Development)
 */

import React from 'react';
import { WorkspaceContainer } from '../layouts/WorkspaceContainer';

export interface StrategyWorkspacePanelProps {
  /** Matter identifier */
  matterId: string;
}

/**
 * Case strategy development workspace panel
 *
 * Placeholder implementation for MVO scaffold.
 *
 * @example
 * ```tsx
 * <StrategyWorkspacePanel matterId="matter-123" />
 * ```
 */
export function StrategyWorkspacePanel({ matterId }: StrategyWorkspacePanelProps) {
  return (
    <WorkspaceContainer
      title="Strategy Workspace"
      stage="W6"
      description="Develop case strategy from supported facts"
      actions={
        <button
          disabled
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-50"
        >
          Save Strategy Memo
        </button>
      }
    >
      <div className="strategy-workspace-placeholder rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
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
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Strategy Workspace Panel
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Matter ID: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{matterId}</code>
        </p>
        <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Not Yet Implemented</p>
          <p className="mt-1">
            This panel will provide tools for developing case strategy from supported facts,
            creating strategy memos, and identifying research questions and risks.
            Integrates with LinkBot strategist role for reasoning.
            Part of W6 (Strategy Development) workflow stage.
          </p>
        </div>
      </div>
    </WorkspaceContainer>
  );
}
