import OurPlansImage from "@/assets/images/plans.svg";
import Image, { type StaticImageData } from "next/image";
import AccentedText from "~/components/accented-text";

export default function SectionOne() {
  return (
    <section className="relative z-20 m-12 flex flex-col items-center justify-center gap-12 md:flex-row">
      <div className="flex flex-1 flex-col gap-8">
        <div>
          <h2 className="mb-4 text-4xl font-bold">
            Choose Your <AccentedText>Perfect</AccentedText> Plan
          </h2>
          <p className="text-[#737485]">
            We offer plans tailored to your needs, whether you&apos;re looking
            for basic tools or advanced professional features. Choose what fits
            you and start today!
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
