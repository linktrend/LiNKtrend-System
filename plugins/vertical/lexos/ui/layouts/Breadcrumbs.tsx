/**
 * Breadcrumbs - Navigation breadcrumbs for LEXOS litigation interface
 *
 * Provides hierarchical navigation context for matter and intake workspaces.
 */

import React from 'react';

export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** Optional href for navigation */
  href?: string;
}

export interface BreadcrumbsProps {
  /** Array of breadcrumb items from root to current */
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs navigation component
 *
 * Renders a trail of navigation links showing the user's current location
 * within the application hierarchy.
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Matters', href: '/matters' },
 *     { label: 'Smith v. Jones', href: '/matters/matter-123' },
 *     { label: 'Evidence' },
 *   ]}
 * />
 * ```
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="mx-2 h-4 w-4 flex-shrink-0 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              )}

              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={`${isLast ? 'font-medium text-gray-900' : 'text-gray-500'}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
