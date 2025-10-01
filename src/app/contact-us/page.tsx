"use client";

import Footer from "~/components/footer";
import Hero from "../_components/hero";
import FaqSection from "./faq-section";
import FormSection from "./form-section";

export default function ContactUs() {
  return (
    <>
      <Hero />
      <main>
        <FormSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
