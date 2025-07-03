import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { cn } from "~/lib/utils";

export default function Hero() {
  return (
    <ContentBox>
      <div className="flex items-center justify-between">
        <Image src="/logo.svg" alt="logo" width={48} height={48} />
        <NavigationLinks />
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="lg"
            className="bg-transparent bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] bg-clip-text font-semibold text-transparent"
            style={{
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Sign Up
          </Button>
          <Button
            className="rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white"
            size="lg"
          >
            Login <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </ContentBox>
  );
}

function ContentBox({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex h-screen w-screen rounded-b-[3rem] bg-[#282830] p-8 text-white">
      <div className="h-full w-full rounded-[2rem] border-3 border-[#EEEFF6] bg-[#EEEFF614] p-8">
        {children}
      </div>
    </section>
  );
}

function NavigationLinks() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Our Services" },
    { href: "/plans", label: "Plans" },
    { href: "/contact", label: "Contact Us" },
    { href: "#", label: "العربية" },
  ];

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {links.map((link) => (
          <NavigationMenuItem key={link.href}>
            <NavigationMenuLink
              asChild
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent font-semibold hover:bg-gradient-to-r hover:from-[#E9476E] hover:to-[#3B5DA8] hover:bg-clip-text hover:text-transparent",
              )}
            >
              <Link href={link.href}>{link.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
