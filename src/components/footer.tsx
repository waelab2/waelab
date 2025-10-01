"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Mail, MapPin, Phone, Printer } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import FooterLogo from "~/assets/footer-logo.svg";
import FacebookIcon from "~/assets/icons/facebook.svg";
import InstagramIcon from "~/assets/icons/instagram.svg";
import LinkedinIcon from "~/assets/icons/linkedin.svg";
import SnapchatIcon from "~/assets/icons/snapchat.svg";
import TiktokIcon from "~/assets/icons/tiktok.svg";
import XIcon from "~/assets/icons/x.svg";
import FooterBackground from "~/assets/images/footer-background.svg";
import AccentedText from "./accented-text";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

const toExploreLinks = [
  { text: "Home", href: "/" },
  { text: "About Us", href: "/about-us" },
  { text: "Our Services", href: "/our-services" },
  { text: "Our Plans", href: "/our-plans" },
];

const helpAndServicesLinks = [
  { text: "Contact Us", href: "/contact-us" },
  { text: "Q&A", href: "/contact-us#faq" },
  { text: "How it Works", href: "#" },
];

const moreLinks = [
  { text: "Privacy Policy", href: "/privacy-policy" },
  { text: "Terms of Service", href: "/terms-of-service" },
];

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
  return (
    <footer className="ui-dark relative w-full place-self-end p-12 pt-24 text-white">
      <Image
        src={FooterBackground as StaticImageData}
        alt="Footer Background"
        className="absolute bottom-0 left-0 z-10"
      />
      <div className="relative z-20 flex items-center gap-32">
        <div className="flex-2">
          <Image src={FooterLogo as StaticImageData} alt="logo" />
        </div>
        <div className="flex-3">
          <div className="flex flex-col gap-4 rounded-[2rem] border-3 border-[#EEEFF6] bg-[#EEEFF615] p-16">
            <div className="text-2xl">Stay Inspired Weekly!</div>
            <div className="text-base">
              Get the latest updates, tips, and exclusive content delivered
              straight to your inbox. 🚀
            </div>
            <div className="relative rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-0.5">
              <div className="bg-primary absolute top-0.5 right-0.5 bottom-0.5 left-0.5 z-10 rounded-full" />
              <div className="absolute top-0.5 right-0.5 bottom-0.5 left-0.5 z-20 rounded-full bg-[#EEEFF615]" />
              <Input
                className="relative z-30 rounded-full border-none px-4 py-6"
                placeholder="Enter You Mail Here"
              />
            </div>
          </div>
        </div>
      </div>
      <Separator className="my-24 bg-[#EEEFF650]" />
      <div className="relative z-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5 lg:col-span-2">
          <div className="text-center sm:text-left">
            <p className="text-lg font-medium">To Explore</p>
            <ul className="mt-8 space-y-4 text-sm">
              {toExploreLinks.map(({ text, href }) => (
                <li key={text}>
                  <a className="transition" href={href}>
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-lg font-medium">Help and Services</p>
            <ul className="mt-8 space-y-4 text-sm">
              {helpAndServicesLinks.map(({ text, href }) => (
                <li key={text}>
                  <a className="transition" href={href}>
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-lg font-medium">Helpful Links</p>
            <ul className="mt-8 space-y-4 text-sm">
              <Unauthenticated>
                <SignInButton>
                  <li className="cursor-pointer">
                    <span className="transition">Login</span>
                  </li>
                </SignInButton>
                <SignUpButton>
                  <li className="cursor-pointer">
                    <span className="transition">Sign Up</span>
                  </li>
                </SignUpButton>
              </Unauthenticated>
              <Authenticated>
                <li>
                  <Link href="/dashboard">
                    <span className="transition">Dashboard</span>
                  </Link>
                </li>
              </Authenticated>
              {moreLinks.map(({ text, href }) => (
                <li key={text}>
                  <Link href={href}>
                    <span className="transition">{text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-lg font-medium">Contact Us</p>
            <ul className="mt-8 space-y-4 text-sm">
              {contactInfo.map(({ icon: Icon, text, isAddress }) => (
                <li
                  key={text}
                  className="flex items-center justify-center gap-1.5 sm:justify-start"
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

          <div className="text-center sm:text-left">
            <p className="text-lg font-medium">Follow Us</p>
            <ul className="mt-8 grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
              {socialLinks.map(({ label, href, icon }) => (
                <Link key={label} className="transition" href={href}>
                  <li className="flex h-16 w-16 items-center justify-center rounded-full border border-white transition hover:bg-white/10">
                    <Image src={icon as StaticImageData} alt={label} />
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          &copy; 2025 <AccentedText>Waelab</AccentedText> - All rights reserved.
        </div>
      </div>
    </footer>
  );
}
