import AboutUsBackground from "@/assets/images/about-us-background.png";
import Image from "next/image";
import Footer from "../_components/footer";
import Hero from "../_components/hero";
import SectionOne from "./_components/section-one";
import SectionTwo from "./_components/section-two";

export default function About() {
  return (
    <>
      <Hero />
      <main className="relative text-[#282830]">
        <Image
          src={AboutUsBackground}
          alt="about-us-bg"
          fill
          className="z-10"
        />
        <SectionOne />
        <SectionTwo />
      </main>
      <Footer />
    </>
  );
}
