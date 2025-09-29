import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AccentedText from "~/components/accented-text";
import NavigationAuthPart from "~/components/navigation-auth-part";
import PrimaryAccentedButton from "~/components/primary-accented-button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { cn } from "~/lib/utils";

export default function HomeHero() {
  return (
    <ContentBox>
      <div className="flex items-center justify-between">
        <Image src="/logo.svg" alt="logo" width={48} height={48} />
        <NavigationLinks />
        <NavigationAuthPart />
      </div>
      <div className="flex h-full flex-col items-center justify-center gap-8">
        <h1 className="w-2/3 text-center text-6xl leading-tight font-bold">
          Unleash <AccentedText>Your</AccentedText> Creativity With AI-Powered
          Magic
        </h1>
        <p className="text-center text-lg">
          Transform your photos and ideas into stunning visual content
          effortlessly. The future starts here!
        </p>
        <Link href="/dashboard">
          <PrimaryAccentedButton className="text-lg">
            Start Now <ArrowRightIcon className="ml-2" />
          </PrimaryAccentedButton>
        </Link>
      </div>
    </ContentBox>
  );
}

function ContentBox({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex h-screen w-full rounded-b-[3rem] bg-[#282830] p-8 text-white">
      <div className="relative z-3 h-full w-full rounded-[2rem] border-3 border-[#EEEFF6] bg-[#EEEFF614] p-8">
        {children}
      </div>
      <div className="absolute top-1/2 left-1/2 z-1 h-full w-full -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-b-[3rem] opacity-50">
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
          priority
          style={{ width: "auto", height: "auto" }}
        />
      </div>
      <div className="absolute right-0 bottom-0 z-2">
        <Image
          src="/bottom-right-decoration.png"
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
  const links = [
    { href: "/", label: "Home" },
    { href: "/about-us", label: "About Us" },
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
