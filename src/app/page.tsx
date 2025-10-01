import CommonServicesSection from "~/components/common-services-section";
import Footer from "~/components/footer";
import HomeHero from "./_components/home-hero";
import AboutSection from "./about-section";
import ComingSoonSection from "./coming-soon-section";
import FaqSection from "./contact-us/faq-section";
import FeaturesSection from "./features-section";

export default async function Home() {
  return (
    <>
      <HomeHero />
      <AboutSection />
      <CommonServicesSection />
      <ComingSoonSection />
      <FeaturesSection />
      <FaqSection />
      <Footer />
    </>
  );
}
