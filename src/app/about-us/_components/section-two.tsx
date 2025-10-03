"use client";

import ValuesIcon from "@/assets/icons/values.svg";
import DecorationPlayButton from "@/assets/images/decoration-play-button.png";
import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "~/hooks/use-translations";

export default function SectionTwo() {
  const { t } = useTranslations();
  return (
    <section className="relative z-20 m-8 flex flex-col justify-center gap-8 md:m-12 md:gap-12 lg:flex-row">
      <div className="order-2 flex flex-1 lg:order-1">
        <Image
          src={DecorationPlayButton}
          alt="Decoration Play Button"
          className="w-full rounded-2xl object-cover"
        />
      </div>
      <div className="order-1 flex flex-1 items-center lg:order-2">
        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-md md:gap-6 md:p-8">
          <div className="flex items-end justify-between gap-4">
            <h4 className="text-xl font-semibold md:text-2xl">
              {t("about.section_two.heading")}
            </h4>
            <Image
              src={ValuesIcon as StaticImageData}
              alt="Waelab Icon"
              width={64}
              height={64}
              className="md:h-24 md:w-24"
            />
          </div>
          <p className="text-ui-grey text-sm md:text-base">
            {t("about.section_two.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
