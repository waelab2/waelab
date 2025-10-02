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
    <div className="flex flex-col gap-8">
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
    <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-md md:flex-row md:items-center md:gap-4 md:p-6">
      <div className="flex justify-start md:hidden">
        <Image src={icon} alt={title} width={64} height={64} />
      </div>
      <div className="text-ui-dark flex-1">
        <h4 className="mb-2 text-xl font-semibold md:text-2xl">{title}</h4>
        <p className="text-sm md:text-base">{description}</p>
      </div>
      <div className="hidden md:ml-4 md:flex md:h-full md:items-center">
        <Image
          src={icon}
          alt={title}
          width={64}
          height={64}
          className="md:h-24 md:w-24"
        />
      </div>
    </div>
  );
}
