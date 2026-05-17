/**
 * LexosAppShell - Main application shell for LEXOS vertical plugin
 *
 * Provides the top-level layout structure for all LEXOS litigation workspaces.
 * Includes header navigation, optional matter-specific subnav, and content area.
 */

import React from 'react';
import { MatterSubnav } from './MatterSubnav';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

export interface LexosAppShellProps {
  /** Child content to render in the main area */
  children: React.ReactNode;
  /** Optional matter ID for matter-specific navigation */
  matterId?: string;
  /** Optional active panel identifier for navigation highlighting */
  activePanel?: string;
  /** Optional breadcrumb items for navigation context */
  breadcrumbs?: BreadcrumbItem[];
  /** Optional page title */
  title?: string;
  /** Optional action buttons for the header */
  actions?: React.ReactNode;
}

/**
 * Main application shell for LEXOS litigation interface
 *
 * @example
 * ```tsx
 * <LexosAppShell
 *   matterId="matter-123"
 *   activePanel="evidence"
 *   breadcrumbs={[{ label: 'Matters', href: '/matters' }, { label: 'Smith v. Jones' }]}
 *   title="Evidence Workspace"
 * >
 *   <EvidenceWorkspacePanel matterId="matter-123" />
 * </LexosAppShell>
 * ```
 */
export function LexosAppShell({
  children,
  matterId,
  activePanel,
  breadcrumbs,
  title,
  actions,
}: LexosAppShellProps) {
  return (
    <div className="lexos-app-shell flex min-h-screen flex-col bg-gray-50">
      {/* Top Header */}
      <header className="lexos-header border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="lexos-logo flex items-center gap-2">
              <span className="text-xl font-bold text-indigo-600">LEXOS</span>
              <span className="text-sm text-gray-500">Litigation Operating System</span>
            </div>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="ml-6 border-l border-gray-300 pl-6">
                <Breadcrumbs items={breadcrumbs} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <div className="lexos-user-menu flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 text-center leading-8 text-indigo-700">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Matter Subnavigation */}
      {matterId && (
        <div className="lexos-subnav border-b border-gray-200 bg-white">
          <MatterSubnav matterId={matterId} activeStage={activePanel} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="lexos-main flex-1 p-6">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </div>
        )}
        <div className="lexos-content rounded-lg bg-white shadow-sm">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="lexos-footer border-t border-gray-200 bg-white px-6 py-3 text-sm text-gray-500">
        <div className="flex items-center justify-between">
          <span>LEXOS v1.0.0-mvo — Development Mode</span>
          <span>© LiNKtrend Systems</span>
        </div>
      </footer>
    </div>
  );
}
