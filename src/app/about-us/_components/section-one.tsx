import WorkFromHomeImage from "@/assets/work-from-home.jpg";
import Image from "next/image";
import AccentedText from "~/components/accented-text";
import VisionMissionCards from "./vision-mission-cards";

export default function SectionOne() {
  return (
    <section className="relative z-20 m-12 flex flex-col justify-center gap-12 md:flex-row">
      <div className="flex flex-1 flex-col gap-8">
        <div>
          <h2 className="mb-4 text-4xl font-bold">
            Elevating <AccentedText>Video Creation</AccentedText> with
            AI-Powered Innovation
          </h2>
          <p className="text-[#737485]">
            Waelab is the leading platform in Saudi Arabia that combines
            artificial intelligence and artistic creativity to produce fully
            cinematic videos and scenes. Designed as an all-in-one solution, it
            offers innovative tools that empower individuals and businesses to
            transform their ideas into stunning, high-quality visuals. 🎬✨
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
