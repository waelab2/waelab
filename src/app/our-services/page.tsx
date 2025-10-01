import CommonServicesSection from "~/components/common-services-section";
import Footer from "~/components/footer";
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
