import Footer from "~/components/footer";
import CommonServicesSection from "../_components/common-services-section";
import Hero from "../_components/hero";

export default function OurServices() {
  return (
    <>
      <Hero />
      <main className="relative text-[#282830]">
        <CommonServicesSection />
      </main>
      <Footer />
    </>
  );
}
