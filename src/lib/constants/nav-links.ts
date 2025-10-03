// Navigation links will be created dynamically with translations
// This is now handled in the components that use them
export const nav_links = [
  { href: "/", labelKey: "nav.home" },
  { href: "/about-us", labelKey: "nav.about_us" },
  { href: "/our-services", labelKey: "nav.our_services" },
  { href: "/our-plans", labelKey: "nav.our_plans" },
  { href: "/contact-us", labelKey: "nav.contact_us" },
] as const;

export type NavLink = (typeof nav_links)[number];
