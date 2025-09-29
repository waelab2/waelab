export const nav_links = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/our-services", label: "Our Services" },
  { href: "/plans", label: "Plans" },
  { href: "/contact", label: "Contact Us" },
] as const;

export type NavLink = (typeof nav_links)[number];
