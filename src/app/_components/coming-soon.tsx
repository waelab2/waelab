import Image from "next/image";
import AccentedText from "~/components/accented-text";

export default function ComingSoon() {
  return (
    <section className="relative flex w-full gap-8 bg-[#282830] p-8 text-white">
      <div className="flex-1 items-center">
        <Image
          src="/iphone-mockups.png"
          alt="iphone-mockups"
          width={500}
          height={1}
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <h2 className="text-7xl font-bold">
          <AccentedText>WAELAB</AccentedText>
        </h2>
        <h2 className="text-6xl font-bold">Coming Soon</h2>
        <p className="text-center text-lg">
          WELAB is your ultimate tool for merging photos and creating stunning
          videos effortlessly. Transform your memories into high-quality visual
          stories with just a few taps. Stay tuned for the official launch!
        </p>
        <div className="flex w-full flex-wrap justify-center gap-4">
          <div className="rounded-full border border-white bg-white/15 px-6 py-1 text-white">
            Creative Effects
          </div>
          <div className="rounded-full border border-white bg-white/15 px-6 py-1 text-white">
            Smart Editing
          </div>
          <div className="rounded-full border border-white bg-white/15 px-6 py-1 text-white">
            Seamless Photo & Video Merge
          </div>
        </div>
      </div>
    </section>
  );
}
