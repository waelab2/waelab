import Image from "next/image";
import AccentedText from "~/components/accented-text";

export default function ComingSoonSection() {
  return (
    <section className="ui-dark relative flex w-full flex-col lg:flex-row gap-24 lg:gap-12 px-8 py-24 lg:px-12 lg:py-24 text-white">
      {/* Image Section */}
      <div className="flex-1 flex items-center justify-center lg:justify-start">
        <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <Image
            src="/iphone-mockups.png"
            alt="iphone-mockups"
            width={500}
            height={1}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 lg:flex-[2] flex flex-col items-center justify-center gap-6 sm:gap-8 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
          <AccentedText>WAELAB</AccentedText>
        </h2>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
          Coming Soon
        </h2>
        <p className="text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed">
          WELAB is your ultimate tool for merging photos and creating stunning
          videos effortlessly. Transform your memories into high-quality visual
          stories with just a few taps. Stay tuned for the official launch!
        </p>
        <div className="flex w-full flex-wrap justify-center gap-4">
          <div className="rounded-full border border-white bg-white/15 px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-base text-white whitespace-nowrap">
            Creative Effects
          </div>
          <div className="rounded-full border border-white bg-white/15 px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-base text-white whitespace-nowrap">
            Smart Editing
          </div>
          <div className="rounded-full border border-white bg-white/15 px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-base text-white whitespace-nowrap">
            Seamless Photo & Video Merge
          </div>
        </div>
      </div>
    </section>
  );
}
