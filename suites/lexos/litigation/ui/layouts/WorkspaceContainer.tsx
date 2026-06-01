/**
 * WorkspaceContainer - Consistent wrapper for all LEXOS workspaces
 *
 * Provides uniform layout, header, and scrollable content area for workspace panels.
 */

import React from 'react';

export interface WorkspaceContainerProps {
  /** Child content to render in the workspace */
  children: React.ReactNode;
  /** Workspace panel title */
  title: string;
  /** Optional stage identifier (W0-W11) */
  stage?: string;
  /** Optional description text */
  description?: string;
  /** Optional action buttons for the header */
  actions?: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Consistent container wrapper for all LEXOS workspace panels
 *
 * Provides a standardized layout with header, optional actions, and
 * scrollable content area.
 *
 * @example
 * ```tsx
 * <WorkspaceContainer
 *   title="Evidence Workspace"
 *   stage="W4"
 *   description="Upload, process, and catalog case evidence"
 *   actions={<Button>Upload Evidence</Button>}
 * >
 *   <EvidenceList matterId="matter-123" />
 * </WorkspaceContainer>
 * ```
 */
export function WorkspaceContainer({
  children,
  title,
  stage,
  description,
  actions,
  className = '',
}: WorkspaceContainerProps) {
  return (
    <div className={`workspace-container flex h-full flex-col ${className}`}>
      {/* Workspace Header */}
      <div className="workspace-header border-b border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              {stage && (
                <span className="stage-badge rounded bg-indigo-100 px-2 py-1 text-xs font-mono text-indigo-700">
                  {stage}
                </span>
              )}
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="workspace-actions flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="workspace-content flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
