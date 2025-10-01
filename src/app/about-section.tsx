import AboutUsBackground from "@/assets/images/about-us-background.png";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import AccentedText from "~/components/accented-text";
import PrimaryAccentedButton from "~/components/primary-accented-button";
import SectionTitle from "~/components/section-title";

export default function AboutSection() {
  return (
    <section className="text-ui-dark relative px-8 py-12 md:px-12 lg:pt-24 lg:pb-0">
      <Image src={AboutUsBackground} alt="about-us-bg" fill className="-z-10" />
      
      {/* Mobile: Stack vertically (content first, then image), Desktop: Side by side */}
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
        {/* Content section - appears first on mobile */}
        <div className="flex flex-1 flex-col gap-4 lg:gap-6 order-1 lg:order-2">
          <SectionTitle title="About" rightArrow />
          <h2 className="text-2xl md:text-3xl lg:text-4xl leading-tight font-bold">
            Elevating <AccentedText>Video Creation </AccentedText>
            <br />
            With AI-Powered Innovation
          </h2>
          <figure className="relative h-[200px] md:h-[250px] lg:h-[300px] w-full">
            <div className="absolute inset-0 z-10 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
            <Image
              className="rounded-lg"
              src="/about-section-image.jpg"
              alt="about"
              fill
              style={{ objectFit: "cover" }}
            />
          </figure>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed">
            WELAB is the leading site in Saudi Arabia that combines artificial
            intelligence and artistic creativity to create videos and cinematic
            scenes in full. The site is designed to be an integrated platform...
          </p>
          <PrimaryAccentedButton className="w-fit text-sm md:text-base">
            Read More <ArrowRightIcon className="ml-2 h-4 w-4" />
          </PrimaryAccentedButton>
        </div>
        
        {/* Image section - appears second on mobile */}
        <div className="flex-1 w-full max-w-md lg:max-w-none order-2 lg:order-1">
          <Image
            src="/decoration-play-button.png"
            alt="about"
            width={500}
            height={500}
            className="w-full h-auto max-w-[300px] mx-auto lg:max-w-[500px]"
          />
        </div>
      </div>
    </section>
  );
}
