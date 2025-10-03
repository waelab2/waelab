"use client";

import OurPlansImage from "@/assets/images/plans.svg";
import Image, { type StaticImageData } from "next/image";
import AccentedText from "~/components/accented-text";
import { useTranslations } from "~/hooks/use-translations";

export default function SectionOne() {
  const { t } = useTranslations();
  return (
    <section className="relative z-20 m-12 flex flex-col items-center justify-center gap-12 md:flex-row">
      <div className="flex flex-1 flex-col gap-8">
        <div>
          <h2 className="mb-4 text-4xl font-bold">
            {t("our_plans.section_one.heading_part1")}{" "}
            <AccentedText>
              {t("our_plans.section_one.heading_part2")}
            </AccentedText>{" "}
            {t("our_plans.section_one.heading_part3")}
          </h2>
          <p className="text-[#737485]">
            {t("our_plans.section_one.description")}
          </p>
        </div>
      </div>

      <div className="flex flex-1">
        <Image
          src={OurPlansImage as StaticImageData}
          alt="Our Plans Image"
          className="w-full rounded-2xl object-cover"
        />
      </div>
    </section>
  );
}
