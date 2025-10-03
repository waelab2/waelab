"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Mail, MapPin, Phone, Printer } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FacebookIcon from "~/assets/icons/facebook.svg";
import FooterLogo from "~/assets/icons/footer-logo.svg";
import InstagramIcon from "~/assets/icons/instagram.svg";
import LinkedinIcon from "~/assets/icons/linkedin.svg";
import SnapchatIcon from "~/assets/icons/snapchat.svg";
import TiktokIcon from "~/assets/icons/tiktok.svg";
import XIcon from "~/assets/icons/x.svg";
import FooterBackground from "~/assets/images/footer-background.svg";
import { useLanguageToggle, useTranslations } from "~/hooks/use-translations";
import AccentedText from "./accented-text";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

// These will be moved inside the component to use translations

const contactInfo = [
  { icon: Mail, text: "Info@DETASAD.com" },
  {
    icon: MapPin,
    text: "P.O. Box 22135 ----  Riyadh 11495 Kingdom of Saudi Arabia",
    isAddress: true,
  },
  {
    icon: Phone,
    text: "+966920001221",
  },
  {
    icon: Printer,
    text: "+966112497887",
  },
];

const socialLinks = [
  { icon: TiktokIcon, label: "TikTok", href: "https://www.tiktok.com" },
  { icon: XIcon, label: "X", href: "https://x.com" },
  { icon: SnapchatIcon, label: "Snapchat", href: "https://www.snapchat.com" },
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "https://www.linkedin.com" },
  {
    icon: InstagramIcon,
    label: "Instagram",
    href: "https://www.instagram.com",
  },
];

export default function Footer() {
  const pathname = usePathname();
  const { t } = useTranslations();
  const { language } = useLanguageToggle();

  const toExploreLinks = [
    { text: t("footer.nav.home"), href: "/" },
    { text: t("footer.nav.about_us"), href: "/about-us" },
    { text: t("footer.nav.our_services"), href: "/our-services" },
    { text: t("footer.nav.our_plans"), href: "/our-plans" },
  ];

  const helpAndServicesLinks = [
    { text: t("footer.nav.contact_us"), href: "/contact-us" },
    { text: t("footer.nav.qa"), href: "/contact-us#faq" },
    { text: t("footer.nav.how_it_works"), href: "#" },
  ];

  const moreLinks = [
    { text: t("footer.nav.privacy_policy"), href: "/privacy-policy" },
    { text: t("footer.nav.terms_of_service"), href: "/terms-of-service" },
  ];

  return (
    <footer className="ui-dark relative w-full place-self-end p-8 py-12 text-white sm:p-8 sm:pt-16 lg:p-12 lg:pt-24">
      <Image
        src={FooterBackground as StaticImageData}
        alt="Footer Background"
        className="absolute bottom-0 left-0 z-10"
      />
      <div className="relative z-20 flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16 xl:gap-32">
        <div className="flex-1 lg:flex-2">
          <Link href="/">
            <Image
              src={FooterLogo as StaticImageData}
              alt="logo"
              className="mx-auto w-4/5 -translate-x-1/10 lg:w-auto lg:translate-x-0"
            />
          </Link>
        </div>
        <div className="w-full lg:flex-3">
          <div className="flex flex-col gap-6 rounded-[2rem] border-3 border-[#EEEFF6] bg-[#EEEFF615] p-8 sm:p-12 lg:p-16">
            <div className="text-xl sm:text-2xl">
              {t("footer.newsletter.title")}
            </div>
            <div className="text-sm sm:text-base">
              {t("footer.newsletter.description")}
            </div>
            <div className="relative rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-0.5">
              <div className="bg-primary absolute top-0.5 right-0.5 bottom-0.5 left-0.5 z-10 rounded-full" />
              <div className="absolute top-0.5 right-0.5 bottom-0.5 left-0.5 z-20 rounded-full bg-[#EEEFF615]" />
              <Input
                className="relative z-30 rounded-full border-none px-4 py-4 sm:py-6"
                placeholder={t("footer.newsletter.placeholder")}
              />
            </div>
          </div>
        </div>
      </div>
      <Separator className="my-12 bg-[#EEEFF650] sm:my-16 lg:my-24" />
      <div className="relative z-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className={language === "ar" ? "text-right" : "text-left"}>
            <p className="text-base font-medium sm:text-lg">
              {t("footer.sections.to_explore")}
            </p>
            <ul className="mt-4 space-y-3 text-sm sm:mt-6 sm:space-y-4 lg:mt-8">
              {toExploreLinks.map(({ text, href }) => (
                <li key={text}>
                  <Link
                    href={href}
                    className="text-white transition hover:text-white focus:text-white active:text-white"
                  >
                    {pathname === href ? (
                      language === "ar" ? (
                        <span className="flex flex-row-reverse items-center justify-end gap-2">
                          <AccentedText>{text}</AccentedText>
                          <div className="waelab-gradient-bg h-2 w-2 rounded-full" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-start gap-2">
                          <div className="waelab-gradient-bg h-2 w-2 rounded-full" />
                          <AccentedText>{text}</AccentedText>
                        </span>
                      )
                    ) : (
                      text
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={language === "ar" ? "text-right" : "text-left"}>
            <p className="text-base font-medium sm:text-lg">
              {t("footer.sections.help_and_services")}
            </p>
            <ul className="mt-4 space-y-3 text-sm sm:mt-6 sm:space-y-4 lg:mt-8">
              {helpAndServicesLinks.map(({ text, href }) => (
                <li key={text}>
                  <Link
                    href={href}
                    className="text-white transition hover:text-white focus:text-white active:text-white"
                  >
                    {pathname === href ? (
                      language === "ar" ? (
                        <span className="flex flex-row-reverse items-center justify-end gap-2">
                          <AccentedText>{text}</AccentedText>
                          <div className="waelab-gradient-bg h-2 w-2 rounded-full" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-start gap-2">
                          <div className="waelab-gradient-bg h-2 w-2 rounded-full" />
                          <AccentedText>{text}</AccentedText>
                        </span>
                      )
                    ) : (
                      text
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={language === "ar" ? "text-right" : "text-left"}>
            <p className="text-base font-medium sm:text-lg">
              {t("footer.sections.helpful_links")}
            </p>
            <ul className="mt-4 space-y-3 text-sm sm:mt-6 sm:space-y-4 lg:mt-8">
              <Unauthenticated>
                <SignInButton>
                  <li className="cursor-pointer">
                    <span className="transition">{t("footer.auth.login")}</span>
                  </li>
                </SignInButton>
                <SignUpButton>
                  <li className="cursor-pointer">
                    <span className="transition">
                      {t("footer.auth.sign_up")}
                    </span>
                  </li>
                </SignUpButton>
              </Unauthenticated>
              <Authenticated>
                <li>
                  <Link href="/dashboard">
                    <span className="transition">
                      {t("footer.auth.dashboard")}
                    </span>
                  </Link>
                </li>
              </Authenticated>
              {moreLinks.map(({ text, href }) => (
                <li key={text}>
                  <Link
                    href={href}
                    className="text-white hover:text-white focus:text-white active:text-white"
                  >
                    {pathname === href ? (
                      language === "ar" ? (
                        <span className="flex flex-row-reverse items-center justify-end gap-2 transition">
                          <div className="waelab-gradient-bg h-2 w-2 rounded-full" />
                          <AccentedText>{text}</AccentedText>
                        </span>
                      ) : (
                        <span className="flex items-center justify-start gap-2 transition">
                          <div className="waelab-gradient-bg h-2 w-2 rounded-full" />
                          <AccentedText>{text}</AccentedText>
                        </span>
                      )
                    ) : (
                      <span className="transition">{text}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={language === "ar" ? "text-right" : "text-left"}>
            <p className="text-base font-medium sm:text-lg">
              {t("footer.sections.contact_us")}
            </p>
            <ul className="mt-4 space-y-3 text-sm sm:mt-6 sm:space-y-4 lg:mt-8">
              {contactInfo.map(({ icon: Icon, text, isAddress }) => (
                <li
                  key={text}
                  className={`flex items-center gap-1.5 ${language === "ar" ? "justify-end" : "justify-start"}`}
                >
                  <Icon className="size-5 shrink-0 shadow-sm" />
                  {isAddress ? (
                    <address className="-mt-0.5 flex-1 not-italic transition">
                      {text}
                    </address>
                  ) : (
                    <span className="flex-1 transition">{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className={language === "ar" ? "text-right" : "text-left"}>
            <p className="text-base font-medium sm:text-lg">
              {t("footer.sections.follow_us")}
            </p>
            <ul className="mt-6 grid grid-cols-6 gap-8 text-sm sm:mt-8 md:gap-16 lg:grid-cols-3 lg:gap-8">
              {socialLinks.map(({ label, href, icon }) => (
                <Link key={label} className="transition" href={href}>
                  <li className="flex h-12 w-12 items-center justify-center rounded-full border border-white transition hover:bg-white/10 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                    <Image src={icon as StaticImageData} alt={label} />
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-sm sm:mt-10 sm:text-base lg:mt-12">
          &copy; 2025 <AccentedText>Waelab</AccentedText> -{" "}
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
