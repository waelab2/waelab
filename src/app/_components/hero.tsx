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
    <section className="relative flex h-screen w-screen rounded-b-[3rem] bg-[#282830] p-8 text-white">
      <div className="relative z-3 h-full w-full rounded-[2rem] border-3 border-[#EEEFF6] bg-[#EEEFF614] p-8">
        {children}
      </div>
      <div className="absolute top-1/2 left-1/2 z-1 h-full w-full -translate-x-1/2 -translate-y-1/2 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3838401A] to-[#383840]" />
        <video
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute top-0 left-0 z-2">
        <Image
          src="/top-left-decoration.png"
          alt="hero-bg"
          width={500}
          height={500}
        />
      </div>
      <div className="absolute right-0 bottom-0 z-2">
        <Image
          src="/bottom-right-decoration.png"
          alt="hero-bg"
          width={500}
          height={500}
        />
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
