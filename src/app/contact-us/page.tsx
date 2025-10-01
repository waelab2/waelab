"use client";

import Footer from "../_components/footer";
import Hero from "../_components/hero";
import FaqSection from "./faq-section";
import FormSection from "./form-section";

export default function ContactUs() {
  return (
    <>
      <Hero />
      <main className="relative m-12 min-h-screen bg-white py-16">
        <FormSection />
        <div className="mb-24" />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
