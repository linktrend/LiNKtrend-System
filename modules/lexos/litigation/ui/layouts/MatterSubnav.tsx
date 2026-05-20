/**
 * MatterSubnav - Matter-specific navigation for LEXOS litigation workflow stages
 *
 * Provides navigation across W0-W11 workflow stages for a specific matter.
 */

import React from 'react';

export interface MatterSubnavProps {
  /** Matter identifier for navigation links */
  matterId: string;
  /** Currently active stage/panel identifier */
  activeStage?: string;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  stage: string;
  description: string;
}

/**
 * Navigation items for W0-W11 litigation workflow stages
 *
 * W0: Intake — Client/matter intake and conflict checking
 * W1: Client Master — Client record management
 * W2: Case Story — Case narrative development
 * W3: Opposing File — Defense file reconciliation (deferred in MVO)
 * W4: Evidence — Evidence upload and processing
 * W5: Assertions — Support matrix and contradiction analysis
 * W6: Strategy — Case strategy development
 * W7: Research — Legal research
 * W8: Argument — Legal argument drafting
 * W9: Adversarial — Adversarial stress-testing
 * W10: Exhibits — Visual exhibit preparation (deferred in MVO)
 * W11: Output — Final output refinement
 */
const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', href: '/matters/[matterId]/overview', stage: 'W1', description: 'Matter dashboard and status' },
  { id: 'story', label: 'Story', href: '/matters/[matterId]/story', stage: 'W2', description: 'Case narrative development' },
  { id: 'evidence', label: 'Evidence', href: '/matters/[matterId]/evidence', stage: 'W4', description: 'Evidence upload and processing' },
  { id: 'assertions', label: 'Assertions', href: '/matters/[matterId]/assertions', stage: 'W5', description: 'Support matrix and contradictions' },
  { id: 'strategy', label: 'Strategy', href: '/matters/[matterId]/strategy', stage: 'W6', description: 'Case strategy development' },
  { id: 'research', label: 'Research', href: '/matters/[matterId]/research', stage: 'W7', description: 'Legal research' },
  { id: 'argument', label: 'Argument', href: '/matters/[matterId]/argument', stage: 'W8', description: 'Legal argument drafting' },
  { id: 'adversarial', label: 'Adversarial', href: '/matters/[matterId]/adversarial', stage: 'W9', description: 'Adversarial stress-testing' },
  { id: 'output', label: 'Output', href: '/matters/[matterId]/output', stage: 'W11', description: 'Final output artifacts' },
];

/**
 * Matter subnavigation component
 *
 * Renders horizontal navigation tabs for workflow stages.
 *
 * @example
 * ```tsx
 * <MatterSubnav matterId="matter-123" activeStage="evidence" />
 * ```
 */
export function MatterSubnav({ matterId, activeStage }: MatterSubnavProps) {
  return (
    <nav className="matter-subnav flex overflow-x-auto px-6" aria-label="Matter workflow stages">
      <div className="flex gap-1 py-2">
        {NAV_ITEMS.map((item) => {
          const href = item.href.replace('[matterId]', matterId);
          const isActive = activeStage === item.id;

          return (
            <a
              key={item.id}
              href={href}
              className={`
                matter-subnav-item group relative flex flex-col items-center
                rounded-md px-4 py-2 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
              title={item.description}
            >
              <span className="flex items-center gap-2">
                <span className={`
                  stage-badge rounded px-1.5 py-0.5 text-xs font-mono
                  ${isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-600'}
                `}>
                  {item.stage}
                </span>
                <span>{item.label}</span>
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
