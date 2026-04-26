import CommonServicesSection from "~/components/common-services-section";
import Footer from "~/components/footer";
import HomeHero from "./_components/home-hero";
import AboutSection from "./about-section";
import ComingSoonSection from "./coming-soon-section";
import FaqSection from "./contact-us/faq-section";
import FeaturesSection from "./features-section";
import PricingSection from "./our-plans/_components/pricing-section";
import SectionOne from "./our-plans/_components/section-one";

export default async function Home() {
  return (
    <div className="overflow-x-hidden">
      <HomeHero />
      <AboutSection />
      <CommonServicesSection />
      <ComingSoonSection />
      <FeaturesSection />
      <FaqSection />
      <main id="plans" className="relative text-[#282830]">
        <SectionOne />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
