"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRightIcon, MenuIcon } from "lucide-react";
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
import { hero_contents, nav_links, type NavLink } from "~/lib/constants/index";
import { cn } from "~/lib/utils";

export default function Hero() {
  const pathname = usePathname() as unknown as Exclude<NavLink["href"], "/">;
  const content = hero_contents[pathname].en;

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

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="hidden lg:flex">
        {nav_links.map((link) => (
          <NavigationMenuItem key={link.href}>
            <NavigationMenuLink
              asChild
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent text-sm font-semibold text-white hover:bg-transparent hover:text-white focus:bg-transparent focus:text-white focus:outline-none active:text-white sm:text-base",
              )}
            >
              <Link
                href={link.href}
                className="text-white hover:text-white focus:text-white active:text-white"
              >
                {pathname === link.href ? (
                  <span className="flex items-center gap-2">
                    <div className="waelab-gradient-bg h-2 w-2 rounded-full" />
                    <AccentedText>{link.label}</AccentedText>
                  </span>
                ) : (
                  link.label
                )}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNavigation() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="lg:hidden text-white hover:text-gray-300 transition-colors">
          <MenuIcon className="h-8 w-8" />
          <span className="sr-only">Open navigation menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#1a1a1a] border-[#333]">
        <SheetHeader>
          <SheetTitle className="text-white text-left">Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4">
          {nav_links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-white transition-colors hover:bg-[#333] hover:text-white",
                pathname === link.href && "bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white"
              )}
            >
              <span className="font-medium text-white">
                {pathname === link.href ? (
                  <span className="text-white">{link.label}</span>
                ) : (
                  link.label
                )}
              </span>
            </Link>
          ))}
        </nav>
        
        {/* Authentication Section */}
        <div className="px-4 py-8 border-t border-[#333]">
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
                    Sign Up
                  </Button>
                </SignUpButton>
                <SignInButton>
                  <Button
                    className="grow-1 rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white hover:opacity-90"
                    size="lg"
                  >
                    Login <ArrowRightIcon className="ml-2 h-4 w-4" />
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
