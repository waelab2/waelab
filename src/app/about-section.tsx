"use client";

import AboutUsBackground from "@/assets/images/about-us-background.png";
import { useTranslations } from "@/hooks/use-translations";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import AccentedText from "~/components/accented-text";
import PrimaryAccentedButton from "~/components/primary-accented-button";
import SectionTitle from "~/components/section-title";

export default function AboutSection() {
  const { t } = useTranslations();

  return (
    <section className="text-ui-dark relative px-8 py-12 md:px-12 lg:pt-24 lg:pb-0">
      <Image src={AboutUsBackground} alt="about-us-bg" fill className="-z-10" />

      {/* Mobile: Stack vertically (content first, then image), Desktop: Side by side */}
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
        {/* Content section - appears first on mobile */}
        <div className="order-1 flex flex-1 flex-col gap-4 lg:order-2 lg:gap-6">
          <SectionTitle title={t("home.about_section.title")} rightArrow />
          <h2 className="text-2xl leading-tight font-bold md:text-3xl lg:text-4xl">
            {t("home.about_section.heading_part1")}{" "}
            <AccentedText>
              {t("home.about_section.heading_part2")}{" "}
            </AccentedText>
            <br />
            {t("home.about_section.heading_part3")}
          </h2>
          <figure className="relative h-[200px] w-full md:h-[250px] lg:h-[300px]">
            <div className="absolute inset-0 z-10 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
            <Image
              className="rounded-lg"
              src="/about-section-image.jpg"
              alt="about"
              fill
              style={{ objectFit: "cover" }}
            />
          </figure>
          <p className="text-sm leading-relaxed text-gray-500 md:text-base">
            {t("home.about_section.description")}
          </p>
          <PrimaryAccentedButton className="w-fit text-sm md:text-base">
            {t("home.about_section.read_more_button")}{" "}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </PrimaryAccentedButton>
        </div>

        {/* Image section - appears second on mobile */}
        <div className="order-2 w-full max-w-md flex-1 lg:order-1 lg:max-w-none">
          <Image
            src="/decoration-play-button.png"
            alt="about"
            width={500}
            height={500}
            className="mx-auto h-auto w-full max-w-[300px] lg:max-w-[500px]"
          />
        </div>
      </div>
    </section>
  );
}
