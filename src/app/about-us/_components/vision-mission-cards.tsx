import EyeIcon from "@/assets/icons/eye.svg";
import TargetingIcon from "@/assets/icons/targeting.svg";
import type { StaticImageData } from "next/image";
import Image from "next/image";

const CONTENT = [
  {
    title: "Our Vision",
    description:
      "To become the leading destination for digital creativity in the Arab world and revolutionize video production through AI technology. 🚀🎥",
    icon: EyeIcon as StaticImageData,
  },
  {
    title: "Our Mission",
    description:
      "To empower everyone with access to AI-driven technology for creating cinematic content that matches traditional production quality. With easy-to-use tools, we make creativity accessible to all. 🎬✨",
    icon: TargetingIcon as StaticImageData,
  },
];

export default function VisionMissionCards() {
  return (
    <div className="flex flex-col gap-6">
      {CONTENT.map((item) => (
        <VisionMissionCard key={item.title} {...item} />
      ))}
    </div>
  );
}

function VisionMissionCard({
  title,
  description,
  icon,
}: (typeof CONTENT)[number]) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-md">
      <div className="text-ui-dark flex-1">
        <h4 className="mb-2 text-2xl font-semibold">{title}</h4>
        <p>{description}</p>
      </div>
      <div className="ml-4 flex h-full items-center">
        <Image src={icon} alt={title} width={96} height={96} />
      </div>
    </div>
  );
}
