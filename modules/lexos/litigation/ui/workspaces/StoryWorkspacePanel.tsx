/**
 * StoryWorkspacePanel - W2 Case-Client Story Development
 *
 * Workspace panel for developing and editing the case master story
 * from client narrative.
 *
 * Stage: W2 (Case-Client Story)
 */

import React from 'react';
import { WorkspaceContainer } from '../layouts/WorkspaceContainer';

export interface StoryWorkspacePanelProps {
  /** Matter identifier */
  matterId: string;
}

/**
 * Case story development workspace panel
 *
 * Placeholder implementation for MVO scaffold.
 *
 * @example
 * ```tsx
 * <StoryWorkspacePanel matterId="matter-123" />
 * ```
 */
export function StoryWorkspacePanel({ matterId }: StoryWorkspacePanelProps) {
  return (
    <WorkspaceContainer
      title="Case Story Workspace"
      stage="W2"
      description="Develop and edit the case master story from client narrative"
      actions={
        <button
          disabled
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-50"
        >
          Save Story
        </button>
      }
    >
      <div className="story-workspace-placeholder rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Story Workspace Panel
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Matter ID: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{matterId}</code>
        </p>
        <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Not Yet Implemented</p>
          <p className="mt-1">
            This panel will provide tools for creating and editing the case master story,
            extracting assertions, building timelines, and identifying gaps.
            Part of W2 (Case-Client Story) workflow stage.
          </p>
        </div>
      </div>
    </WorkspaceContainer>
  );
}
