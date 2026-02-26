"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowLeftIcon, ArrowRightIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccentedText from "~/components/accented-text";
import NavigationAuthPart from "~/components/navigation-auth-part";
import SectionTitle from "~/components/section-title";
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
import { nav_links, type NavLink } from "~/lib/constants/index";
import { cn } from "~/lib/utils";

export default function Hero() {
  const pathname = usePathname() as unknown as Exclude<NavLink["href"], "/">;
  const { t } = useTranslations();

  // Get hero content based on current page
  const getHeroContent = () => {
    switch (pathname) {
      case "/about-us":
        return {
          small_title: t("about_us.hero.small_title"),
          main_title: t("about_us.hero.main_title"),
        };
      case "/our-services":
        return {
          small_title: t("our_services.hero.small_title"),
          main_title: t("our_services.hero.main_title"),
        };
      case "/our-plans":
        return {
          small_title: t("our_plans.hero.small_title"),
          main_title: t("our_plans.hero.main_title"),
        };
      case "/contact-us":
        return {
          small_title: t("contact_us.hero.small_title"),
          main_title: t("contact_us.hero.main_title"),
        };
      default:
        return {
          small_title: "",
          main_title: "",
        };
    }
  };

  const content = getHeroContent();

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
      <div className="mt-6 mb-4 flex flex-col items-center justify-center gap-4 sm:mt-8 sm:mb-6 sm:gap-6 md:mt-12 md:mb-8 md:gap-8">
        <SectionTitle title={content.small_title} leftArrow rightArrow />
        <h1 className="w-full max-w-4xl px-4 text-center text-3xl leading-tight font-bold sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight">
          {content.main_title}
        </h1>
      </div>
    </ContentBox>
  );
}

function ContentBox({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex w-full overflow-hidden rounded-b-[1rem] bg-[#282830] p-4 text-white sm:rounded-b-[2rem] sm:p-6 md:rounded-b-[3rem] md:p-8">
      <div className="relative z-3 h-full w-full rounded-[1rem] border-3 border-[#EEEFF6] bg-[#EEEFF615] p-4 sm:rounded-[1.5rem] sm:p-6 md:rounded-[2rem] md:p-8">
        {children}
      </div>
      <div className="absolute top-0 left-0 z-2 hidden sm:block">
        <Image
          src="/top-left-decoration.png"
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

function NavigationLinks() {
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguageToggle();
  const { t } = useTranslations();
  const { userId } = useAuth();
  const links = [
    ...nav_links.map((link) => ({ href: link.href, label: t(link.labelKey) })),
    ...(userId
      ? [{ href: "/dashboard", label: language === "ar" ? "لوحة التحكم" : "Dashboard" }]
      : []),
  ];
  const navigationItems = [
    ...links,
    { href: "__language__" as const, labelKey: "" as const },
  ];
  const displayItems =
    language === "ar" ? [...navigationItems].reverse() : navigationItems;

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="hidden lg:flex">
        {displayItems.map((item) =>
          item.href === "__language__" ? (
            <NavigationMenuItem key="language-switcher">
              <button
                onClick={toggleLanguage}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent text-sm font-semibold text-white hover:bg-transparent hover:text-white focus:bg-transparent focus:text-white focus:outline-none active:text-white sm:text-base",
                )}
              >
                {language === "en" ? "العربية" : "English"}
              </button>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.href}>
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
                      className={cn(
                        "flex items-center gap-2",
                        language === "ar" && "flex-row-reverse",
                      )}
                    >
                      <div className="waelab-gradient-bg h-2 w-2 rounded-full" />
                      <AccentedText>
                        {"label" in item ? item.label : ""}
                      </AccentedText>
                    </span>
                  ) : (
                    "label" in item ? item.label : ""
                  )}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNavigation() {
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguageToggle();
  const { t } = useTranslations();
  const { userId } = useAuth();
  const links = [
    ...nav_links.map((link) => ({ href: link.href, label: t(link.labelKey) })),
    ...(userId
      ? [{ href: "/dashboard", label: language === "ar" ? "لوحة التحكم" : "Dashboard" }]
      : []),
  ];
  const navigationItems = [
    ...links,
    { href: "__language__" as const, labelKey: "" as const },
  ];
  const displayItems =
    language === "ar" ? [...navigationItems].reverse() : navigationItems;

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
            item.href === "__language__" ? (
              <button
                key="language-switcher"
                onClick={toggleLanguage}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-white transition-colors hover:bg-[#333] hover:text-white"
              >
                <span className="font-medium text-white">
                  {language === "en" ? "العربية" : "English"}
                </span>
              </button>
            ) : (
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
                  {"label" in item
                    ? pathname === item.href
                      ? (
                        <span className="text-white">{item.label}</span>
                        )
                      : (
                          item.label
                        )
                    : null}
                </span>
              </Link>
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
                    {t("nav.login")}
                    {language === "ar" ? (
                      <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    ) : (
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    )}
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
