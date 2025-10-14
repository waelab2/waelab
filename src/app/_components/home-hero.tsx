"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowLeftIcon, ArrowRightIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AccentedText from "~/components/accented-text";
import NavigationAuthPart from "~/components/navigation-auth-part";
import PrimaryAccentedButton from "~/components/primary-accented-button";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useLanguageToggle, useTranslations } from "~/hooks/use-translations";
import { cn } from "~/lib/utils";

export default function HomeHero() {
  const { t } = useTranslations();
  const { language } = useLanguageToggle();

  return (
    <ContentBox>
      <div className="flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="logo"
            width={48}
            height={48}
            className="h-10 w-10 sm:h-10 sm:w-10 md:h-12 md:w-12"
          />
        </Link>
        <NavigationLinks />
        <MobileNavigation />
        <div className="hidden lg:block">
          <NavigationAuthPart />
        </div>
      </div>
      <div className="flex h-full flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8">
        <h1 className="w-full max-w-4xl px-4 text-center text-3xl leading-tight font-bold sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight">
          {t("home.hero.heading_part1")}{" "}
          <AccentedText>{t("home.hero.heading_part2")}</AccentedText>{" "}
          {t("home.hero.heading_part3")}
        </h1>
        <p className="w-full max-w-2xl px-4 text-center text-base sm:text-lg md:text-xl">
          {t("home.hero.description")}
        </p>
        <Link href="/dashboard">
          <PrimaryAccentedButton className="text-base sm:text-lg">
            {language === "ar" ? (
              <>
                {t("home.hero.start_button")}
                <ArrowLeftIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              </>
            ) : (
              <>
                {t("home.hero.start_button")}{" "}
                <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </>
            )}
          </PrimaryAccentedButton>
        </Link>
      </div>
    </ContentBox>
  );
}

function ContentBox({ children }: { children: React.ReactNode }) {
  return (
    <section className="ui-dark relative flex h-screen w-full rounded-b-[1rem] p-4 text-white sm:rounded-b-[2rem] sm:p-6 md:rounded-b-[3rem] md:p-8">
      <div className="relative z-3 h-full w-full rounded-[1rem] border-3 border-[#EEEFF6] bg-[#EEEFF614] p-4 sm:rounded-[1.5rem] sm:p-6 md:rounded-[2rem] md:p-8">
        {children}
      </div>
      <div className="absolute top-1/2 left-1/2 z-1 h-full w-full -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-b-[1rem] opacity-50 sm:rounded-b-[2rem] md:rounded-b-[3rem]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3838401A] to-[#383840]" />
        <video
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute top-0 left-0 z-2 hidden sm:block">
        <Image
          src="/top-left-decoration.png"
          alt="hero-bg"
          width={500}
          height={500}
          priority
          style={{ width: "auto", height: "auto" }}
          className="h-32 w-auto sm:h-40 md:h-48 lg:h-64"
        />
      </div>
      <div className="absolute right-0 bottom-0 z-2 hidden sm:block">
        <Image
          src="/bottom-right-decoration.png"
          alt="hero-bg"
          width={500}
          height={500}
          style={{ width: "auto", height: "auto" }}
          className="h-32 w-auto sm:h-40 md:h-48 lg:h-64"
        />
      </div>
    </section>
  );
}

type NavigationLinkItem = {
  type: "link";
  href: string;
  label: string;
};

type LanguageSwitcherItem = {
  type: "language-switcher";
};

type NavigationItem = NavigationLinkItem | LanguageSwitcherItem;

function NavigationLinks() {
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguageToggle();
  const { t } = useTranslations();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/about-us", label: t("nav.about_us") },
    { href: "/our-services", label: t("nav.our_services") },
    { href: "/our-plans", label: t("nav.our_plans") },
    { href: "/contact-us", label: t("nav.contact_us") },
  ];

  // Create navigation items with language switcher
  const navigationItems: NavigationItem[] = [
    ...links.map((link) => ({ type: "link" as const, ...link })),
    { type: "language-switcher" as const },
  ];

  // Reverse order for RTL (Arabic)
  const displayItems =
    isClient && language === "ar"
      ? [...navigationItems].reverse()
      : navigationItems;

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="hidden lg:flex">
        {displayItems.map((item) => (
          <NavigationMenuItem
            key={item.type === "link" ? item.href : "language-switcher"}
          >
            {item.type === "link" ? (
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent text-sm font-semibold text-white hover:bg-transparent hover:text-white focus:bg-transparent focus:text-white focus:outline-none active:text-white sm:text-base",
                )}
              >
                <Link
                  href={item.href}
                  className="text-white hover:text-white focus:text-white active:text-white"
                >
                  {pathname === item.href ? (
                    <span
                      className={`flex items-center gap-2 ${isClient && language === "ar" ? "flex-row-reverse" : ""}`}
                    >
                      <div className="waelab-gradient-bg h-2 w-2 rounded-full" />
                      <AccentedText>{item.label}</AccentedText>
                    </span>
                  ) : (
                    item.label
                  )}
                </Link>
              </NavigationMenuLink>
            ) : (
              <button
                onClick={toggleLanguage}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent text-sm font-semibold text-white hover:bg-transparent hover:text-white focus:bg-transparent focus:text-white focus:outline-none active:text-white sm:text-base",
                )}
              >
                {!isClient
                  ? "English"
                  : language === "en"
                    ? "العربية"
                    : "English"}
              </button>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNavigation() {
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguageToggle();
  const { t } = useTranslations();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/about-us", label: t("nav.about_us") },
    { href: "/our-services", label: t("nav.our_services") },
    { href: "/our-plans", label: t("nav.our_plans") },
    { href: "/contact-us", label: t("nav.contact_us") },
  ];

  // Create navigation items with language switcher
  const navigationItems: NavigationItem[] = [
    ...links.map((link) => ({ type: "link" as const, ...link })),
    { type: "language-switcher" as const },
  ];

  // Reverse order for RTL (Arabic)
  const displayItems =
    isClient && language === "ar"
      ? [...navigationItems].reverse()
      : navigationItems;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="text-white transition-colors hover:text-gray-300 lg:hidden">
          <MenuIcon className="h-8 w-8" />
          <span className="sr-only">Open navigation menu</span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] border-[#333] bg-[#1a1a1a] sm:w-[400px]"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-white">Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4">
          {displayItems.map((item) =>
            item.type === "link" ? (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-white transition-colors hover:bg-[#333] hover:text-white",
                  pathname === item.href &&
                    "bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white",
                )}
              >
                <span className="font-medium text-white">
                  {pathname === item.href ? (
                    <span className="text-white">{item.label}</span>
                  ) : (
                    item.label
                  )}
                </span>
              </Link>
            ) : (
              <button
                key="language-switcher"
                onClick={toggleLanguage}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-white transition-colors hover:bg-[#333] hover:text-white"
              >
                <span className="font-medium text-white">
                  {!isClient
                    ? "English"
                    : language === "en"
                      ? "العربية"
                      : "English"}
                </span>
              </button>
            ),
          )}
        </nav>

        {/* Authentication Section */}
        <div className="border-t border-[#333] px-4 py-8">
          <div className="flex flex-col space-y-3">
            <Unauthenticated>
              <div className="flex gap-3">
                <SignUpButton>
                  <Button
                    variant="ghost"
                    className="justify-center bg-transparent bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] bg-clip-text text-lg font-semibold text-transparent hover:bg-[#333]"
                    style={{
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {t("nav.sign_up")}
                  </Button>
                </SignUpButton>
                <SignInButton>
                  <Button
                    className="grow-1 rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white hover:opacity-90"
                    size="lg"
                  >
                    {t("nav.login")} <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </SignInButton>
              </div>
            </Unauthenticated>
            <Authenticated>
              <div className="flex items-center justify-center py-2">
                <UserButton />
              </div>
            </Authenticated>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
