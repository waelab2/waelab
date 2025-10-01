import AboutUsBackground from "@/assets/images/about-us-background.png";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import AccentedText from "~/components/accented-text";
import PrimaryAccentedButton from "~/components/primary-accented-button";
import SectionTitle from "~/components/section-title";

export default function AboutSection() {
  return (
    <section className="text-ui-dark relative m-12 mt-24 flex items-center">
      <Image src={AboutUsBackground} alt="about-us-bg" fill className="-z-10" />
      <div className="flex-1">
        <Image
          src="/decoration-play-button.png"
          alt="about"
          width={500}
          height={500}
        />
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <SectionTitle title="About" rightArrow />
        <h2 className="text-4xl leading-tight font-bold">
          Elevating <AccentedText>Video Creation </AccentedText>
          <br />
          With AI-Powered Innovation
        </h2>
        <figure className="relative h-[300px] w-full">
          <div className="absolute inset-0 z-10 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
          <Image
            className="rounded-lg"
            src="/about-section-image.jpg"
            alt="about"
            fill
            style={{ objectFit: "cover" }}
          />
        </figure>
        <p className="text-base text-gray-500">
          WELAB is the leading site in Saudi Arabia that combines artificial
          intelligence and artistic creativity to create videos and cinematic
          scenes in full. The site is designed to be an integrated platform...
        </p>
        <PrimaryAccentedButton className="w-fit">
          Read More <ArrowRightIcon className="ml-2 h-4 w-4" />
        </PrimaryAccentedButton>
      </div>
    </section>
  );
}
