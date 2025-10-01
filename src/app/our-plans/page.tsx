import Footer from "~/components/footer";
import Hero from "../_components/hero";
import PricingSection from "./_components/pricing-section";
import SectionOne from "./_components/section-one";

export default function OurPlans() {
  return (
    <>
      <Hero />
      <main className="relative text-[#282830]">
        <SectionOne />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
