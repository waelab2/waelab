"use client";

import WorkFromHomeImage from "@/assets/images/work-from-home.jpg";
import Image from "next/image";
import AccentedText from "~/components/accented-text";
import { useTranslations } from "~/hooks/use-translations";
import VisionMissionCards from "./vision-mission-cards";

export default function SectionOne() {
  const { t } = useTranslations();
  return (
    <section className="relative z-20 m-8 flex flex-col justify-center gap-8 md:m-12 md:gap-12 lg:flex-row">
      <div className="flex flex-1 flex-col gap-8">
        <div>
          <h2 className="mb-4 text-2xl font-bold md:text-4xl">
            {t("about.section_one.heading_part1")}{" "}
            <AccentedText>{t("about.section_one.heading_part2")}</AccentedText>{" "}
            {t("about.section_one.heading_part3")}
          </h2>
          <p className="text-sm text-[#737485] md:text-base">
            {t("about.section_one.description")}
          </p>
        </div>
        <VisionMissionCards />
      </div>

      <div className="flex flex-1">
        <Image
          src={WorkFromHomeImage}
          alt="Work From Home Image"
          className="w-full rounded-2xl object-cover shadow-lg"
        />
      </div>
    </section>
  );
}
