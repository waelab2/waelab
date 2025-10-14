"use client";

import ScriptIcon from "@/assets/icons/script.svg";
import VideoEditingIcon from "@/assets/icons/video-editing.svg";
import VideoIcon from "@/assets/icons/video.svg";
import Image, { type StaticImageData } from "next/image";
import GradientBordered from "~/components/gradient-bordered";
import { Card, CardContent } from "~/components/ui/card";
import { useLanguageToggle, useTranslations } from "~/hooks/use-translations";
import { cn } from "~/lib/utils";

export default function FeaturesSection() {
  const { t } = useTranslations();
  const { language } = useLanguageToggle();

  const features = [
    {
      title: t("features_section.feature_1.title"),
      description: t("features_section.feature_1.description"),
      icon: VideoIcon as StaticImageData,
    },
    {
      title: t("features_section.feature_2.title"),
      description: t("features_section.feature_2.description"),
      icon: ScriptIcon as StaticImageData,
    },
    {
      title: t("features_section.feature_3.title"),
      description: t("features_section.feature_3.description"),
      icon: VideoEditingIcon as StaticImageData,
    },
  ];
  return (
    <section className="mx-4 my-12 flex flex-col items-center gap-8 md:mx-8 lg:mx-12 lg:my-24">
      <div className="flex w-full flex-col gap-8 lg:min-h-[300px] lg:flex-row">
        {features.map((feature, index) => (
          <GradientBordered
            key={feature.title}
            className={cn(
              "w-full rounded-2xl",
              // Responsive positioning - only apply on large screens and up
              "lg:self-start xl:self-center 2xl:self-end",
              index === 0 && "lg:self-start xl:self-start 2xl:self-start",
              index === 1 && "lg:self-center xl:self-center 2xl:self-center",
              index === 2 && "lg:self-end xl:self-end 2xl:self-end",
            )}
          >
            <Card className="h-full rounded-2xl border-0 bg-white shadow-none">
              <CardContent className="px-4 py-6">
                <div
                  className={`flex flex-col items-center gap-4 text-center lg:flex-row lg:items-start ${language === "ar" ? "lg:text-right" : "lg:text-left"}`}
                >
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={64}
                    height={64}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-ui-dark mb-2 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-ui-grey text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </GradientBordered>
        ))}
      </div>
    </section>
  );
}
