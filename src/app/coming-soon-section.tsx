"use client";

import Image from "next/image";
import AccentedText from "~/components/accented-text";
import { useTranslations } from "~/hooks/use-translations";

export default function ComingSoonSection() {
  const { t } = useTranslations();
  return (
    <section className="ui-dark relative flex w-full flex-col gap-24 px-8 py-24 text-white lg:flex-row lg:gap-12 lg:px-12 lg:py-24">
      {/* Image Section */}
      <div className="flex flex-1 items-center justify-center lg:justify-start">
        <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <Image
            src="/iphone-mockups.png"
            alt="iphone-mockups"
            width={500}
            height={1}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center sm:gap-8 lg:flex-[2]">
        <h2 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          <AccentedText>WAELAB</AccentedText>
        </h2>
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
          {t("coming_soon_section.heading")}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed sm:text-lg lg:text-xl">
          {t("coming_soon_section.description")}
        </p>
        <div className="flex w-full flex-wrap justify-center gap-4">
          <div className="rounded-full border border-white bg-white/15 px-4 py-1 text-sm whitespace-nowrap text-white sm:px-6 sm:py-2 sm:text-base">
            {t("coming_soon_section.feature_1")}
          </div>
          <div className="rounded-full border border-white bg-white/15 px-4 py-1 text-sm whitespace-nowrap text-white sm:px-6 sm:py-2 sm:text-base">
            {t("coming_soon_section.feature_2")}
          </div>
          <div className="rounded-full border border-white bg-white/15 px-4 py-1 text-sm whitespace-nowrap text-white sm:px-6 sm:py-2 sm:text-base">
            {t("coming_soon_section.feature_3")}
          </div>
        </div>
      </div>
    </section>
  );
}
