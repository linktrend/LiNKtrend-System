export type CustomerServiceNavItem = {
  id: "queue";
  label: string;
  href: string;
  match: (path: string) => boolean;
};

export const CUSTOMER_SERVICE_BASE = "/customer-service";

/** Sidebar sections for Customer Service — unified ticket queue across licensees. */
export const CUSTOMER_SERVICE_SIDEBAR_ITEMS: CustomerServiceNavItem[] = [
  {
    id: "queue",
    label: "Ticket Queue",
    href: CUSTOMER_SERVICE_BASE,
    match: (path) => path === CUSTOMER_SERVICE_BASE || path === `${CUSTOMER_SERVICE_BASE}/`,
  },
];

export function customerServiceSectionActive(pathname: string): boolean {
  return pathname === CUSTOMER_SERVICE_BASE || pathname.startsWith(`${CUSTOMER_SERVICE_BASE}/`);
}
