"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccentedText from "~/components/accented-text";
import NavigationAuthPart from "~/components/navigation-auth-part";
import SectionTitle from "~/components/section-title";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { hero_contents, nav_links, type NavLink } from "~/lib/constants/index";
import { cn } from "~/lib/utils";

export default function Hero() {
  const pathname = usePathname() as unknown as Exclude<NavLink["href"], "/">;
  const content = hero_contents[pathname].en;

  return (
    <ContentBox>
      <div className="flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={48} height={48} />
        </Link>
        <NavigationLinks />
        <NavigationAuthPart />
      </div>
      <div className="mt-12 mb-8 flex flex-col items-center justify-center gap-8">
        <SectionTitle title={content.small_title} leftArrow rightArrow />
        <h1 className="w-2/3 text-center text-5xl leading-tight font-bold">
          {content.main_title}
        </h1>
      </div>
    </ContentBox>
  );
}

function ContentBox({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex w-full overflow-hidden rounded-b-[3rem] bg-[#282830] p-8 text-white">
      <div className="relative z-3 h-full w-full rounded-[2rem] border-3 border-[#EEEFF6] bg-[#EEEFF615] p-8">
        {children}
      </div>
      <div className="absolute top-0 left-0 z-2 opacity-50">
        <Image
          src="/top-left-decoration.png"
          alt="hero-bg"
          width={500}
          height={500}
          style={{ width: "auto", height: "auto" }}
        />
      </div>
    </section>
  );
}

function NavigationLinks() {
  const pathname = usePathname();

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {nav_links.map((link) => (
          <NavigationMenuItem key={link.href}>
            <NavigationMenuLink
              asChild
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent font-semibold hover:bg-gradient-to-r hover:from-[#E9476E] hover:to-[#3B5DA8] hover:bg-clip-text hover:text-transparent",
              )}
            >
              <Link href={link.href}>
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
