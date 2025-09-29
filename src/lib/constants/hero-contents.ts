import { type NavLink } from "./nav-links";

export const hero_contents: Record<
  Exclude<NavLink["href"], "/">,
  {
    en: { small_title: string; main_title: string };
    ar: { small_title: string; main_title: string };
  }
> = {
  "/about-us": {
    en: {
      small_title: "About Us",
      main_title: "Know About Us",
    },
    ar: {
      small_title: "عنا",
      main_title: "اعرف عنا",
    },
  },
  "/our-services": {
    en: {
      small_title: "Our Services",
      main_title: "What We Offer",
    },
    ar: {
      small_title: "خدماتنا",
      main_title: "ما نقدمه",
    },
  },
  "/plans": {
    en: {
      small_title: "Plans",
      main_title: "Choose Your Plan",
    },
    ar: {
      small_title: "الخطط",
      main_title: "اختر خطتك",
    },
  },
  "/contact": {
    en: {
      small_title: "Contact Us",
      main_title: "Get in Touch",
    },
    ar: {
      small_title: "تواصل معنا",
      main_title: "ابقى على تواصل",
    },
  },
} as const;
