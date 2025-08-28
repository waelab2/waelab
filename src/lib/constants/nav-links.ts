export const nav_links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Our Services" },
  { href: "/plans", label: "Plans" },
  { href: "/contact", label: "Contact Us" },
] as const;

export type NavLink = (typeof nav_links)[number];
