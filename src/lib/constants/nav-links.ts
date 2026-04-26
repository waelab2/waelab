// Kept for typing and dashboard translations; marketing nav is trimmed in hero components.
export const nav_links = [{ href: "/", labelKey: "nav.home" }] as const;

export type NavLink = (typeof nav_links)[number];
