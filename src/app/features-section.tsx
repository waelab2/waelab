"use client";

import ScriptIcon from "@/assets/icons/script.svg";
import VideoEditingIcon from "@/assets/icons/video-editing.svg";
import VideoIcon from "@/assets/icons/video.svg";
import Image from "next/image";
import GradientBordered from "~/components/gradient-bordered";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

const features = [
  {
    title: "AI-Powered Video Editing",
    description:
      "Enhance and Refine Your Videos with Powerful Intelligent Tools.",
    icon: VideoIcon,
  },
  {
    title: "Creative Scriptwriting",
    description: "Generate engaging and smart video scripts instantly.",
    icon: ScriptIcon,
  },
  {
    title: "Smart Image Montage",
    description: "Seamlessly blend images into stunning video sequences.",
    icon: VideoEditingIcon,
  },
];

export default function FeaturesSection() {
  return (
    <section className="flex flex-col items-center gap-8">
      <div className="flex min-h-[300px] w-full gap-8">
        {features.map((feature, index) => (
          <GradientBordered
            key={feature.title}
            className={cn(
              "w-full rounded-2xl",
              index === 0
                ? "self-start"
                : index === 1
                  ? "self-center"
                  : "self-end",
            )}
          >
            <Card className="h-full rounded-2xl border-0 bg-white shadow-none">
              <CardContent className="px-4 py-6">
                <div className="flex items-center gap-x-4 gap-y-8">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={64}
                    height={64}
                  />
                  <div>
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
