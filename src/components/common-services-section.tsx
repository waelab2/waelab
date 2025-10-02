"use client";

import PhotoEditorImage from "@/assets/images/photo-editor.jpg";
import ServiceIcon1 from "@/assets/images/service-icon-1.png";
import ServiceIcon2 from "@/assets/images/service-icon-2.png";
import ServiceImage1 from "@/assets/images/services-1.jpg";
import ServiceImage2 from "@/assets/images/services-2.jpg";
import ServiceImage3 from "@/assets/images/services-3.png";
import ServiceImage4 from "@/assets/images/services-4.jpg";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AccentedText from "~/components/accented-text";
import SectionTitle from "~/components/section-title";

export default function CommonServicesSection() {
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {!showServiceInfo && (
        <section className="text-ui-dark mx-4 my-8 flex flex-col items-center gap-4 md:mx-12 md:my-12 lg:my-24">
          {pathname === "/" && (
            <SectionTitle
              title="Services"
              leftArrow
              rightArrow
              className="justify-center"
            />
          )}
          <h2 className="mb-4 w-full text-center text-2xl leading-tight font-bold md:w-3/4 lg:w-1/2 lg:text-4xl">
            Comprehensive Solutions for{" "}
            <AccentedText>Creative Video</AccentedText> Production
          </h2>
          <div className="flex w-full flex-col gap-8 lg:flex-row">
            <div className="flex w-full flex-col gap-4 rounded-xl p-4 shadow-lg lg:flex-1 lg:flex-row lg:gap-8">
              <figure className="relative h-48 w-full lg:h-full lg:flex-1">
                <Image
                  src={ServiceImage1}
                  alt="Service 1"
                  fill
                  className="rounded-lg object-cover"
                />
              </figure>
              <div className="flex flex-col justify-between gap-4 lg:flex-2 lg:gap-8">
                <div className="flex flex-wrap gap-4 lg:gap-8">
                  <Image
                    src={ServiceIcon1}
                    alt="Service Icon 1"
                    width={80}
                    height={80}
                    className="lg:w-[125px] lg:h-[125px]"
                  />
                  <Image
                    src={ServiceIcon2}
                    alt="Service Icon 2"
                    width={80}
                    height={80}
                    className="lg:w-[125px] lg:h-[125px]"
                  />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-bold lg:text-2xl">
                    Smart Video Editing
                  </h4>
                  <p className="mb-2 text-sm text-gray-500 lg:text-base">
                    Enhance and refine your videos effortlessly with AI-powered
                    editing tools.
                  </p>
                  <button
                    onClick={() => setShowServiceInfo(true)}
                    className="mb-2 flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80 lg:gap-4"
                  >
                    <h5 className="text-sm font-semibold lg:text-lg">
                      More about Smart Video Editing
                    </h5>
                    <div className="rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-1.5 lg:p-2">
                      <ArrowRightIcon className="h-4 w-4 text-white lg:h-6 lg:w-6" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:flex-1 lg:flex xl:grid-cols-3">
              <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-xl px-1 py-4 shadow-lg">
                <Image
                  src={ServiceImage2}
                  alt="Service 2"
                  fill
                  className="z-10 object-cover"
                />
                <div className="absolute inset-0 z-20 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
                <div className="relative z-20 rounded-full border border-white px-4 py-1 text-sm text-white lg:px-6">
                  Library
                </div>
                <div className="relative z-20 text-center text-lg font-semibold text-white lg:text-2xl">
                  Creative Templates
                </div>
              </div>
              <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-xl px-1 py-4 shadow-lg">
                <Image
                  src={ServiceImage3}
                  alt="Service 3"
                  fill
                  className="z-10 object-cover"
                />
                <div className="absolute inset-0 z-20 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
                <div className="relative z-20 rounded-full border border-white px-4 py-1 text-sm text-white lg:px-6">
                  Script
                </div>
                <div className="relative z-20 text-center text-lg font-semibold text-white lg:text-2xl">
                  AI Script Writing
                </div>
              </div>
              <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-xl px-1 py-4 shadow-lg sm:col-span-2 xl:col-span-1">
                <Image
                  src={ServiceImage4}
                  alt="Service 4"
                  fill
                  className="z-10 object-cover"
                />
                <div className="absolute inset-0 z-20 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
                <div className="relative z-20 rounded-full border border-white px-4 py-1 text-sm text-white lg:px-6">
                  AI
                </div>
                <div className="relative z-20 text-center text-lg font-semibold text-white lg:text-2xl">
                  AI Video Creation
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      {showServiceInfo && (
        <ServiceInfo onBack={() => setShowServiceInfo(false)} />
      )}
    </>
  );
}

function ServiceInfo({ onBack }: { onBack: () => void }) {
  return (
    <div className="relative mx-4 my-8 rounded-2xl bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-0.5 md:mx-8 md:my-16">
      <Image
        src={ServiceIcon1}
        alt="Service Icon 1"
        width={64}
        height={64}
        className="absolute top-0 left-4 -translate-y-1/2 md:left-16 md:w-24 md:h-24"
      />
      <div className="flex flex-col items-stretch rounded-2xl bg-white md:flex-row">
        <div className="flex flex-1 flex-col justify-center p-6 md:p-12">
          <h2 className="text-ui-dark mb-4 text-2xl font-semibold md:text-3xl">
            Smart Video Editing
          </h2>
          <p className="text-ui-grey mb-6 text-sm md:text-base">
            Enhance and refine your videos effortlessly with AI-powered editing
            tools. Easily trim, merge, and adjust video speed while applying
            cinematic effects. Take your videos to the next level with advanced
            color correction, noise reduction, and automatic enhancement
            features.
          </p>
          <button
            onClick={onBack}
            className="flex w-fit cursor-pointer items-center gap-2 transition-opacity hover:opacity-80 md:gap-3"
          >
            <div className="rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-1.5 md:p-2">
              <ArrowLeftIcon className="h-3 w-3 text-white md:h-4 md:w-4" />
            </div>
            <span className="text-sm font-semibold text-gray-700 md:text-lg">
              Back to Services
            </span>
          </button>
        </div>
        <div className="relative flex flex-1 items-center justify-center p-6 md:p-12">
          <figure className="relative aspect-video w-full">
            <div className="absolute -top-3 left-3 z-10 h-full w-full rounded-xl bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] md:-top-6 md:left-6" />
            <Image
              src={PhotoEditorImage}
              alt="Service Info"
              className="absolute z-20 rounded-xl shadow-lg"
              fill
            />
            <Image
              src={ServiceIcon2}
              alt="Service Icon 2"
              width={80}
              height={80}
              className="absolute bottom-2 left-0 z-30 -translate-x-1/2 md:bottom-4 md:w-32 md:h-32"
            />
          </figure>
        </div>
      </div>
    </div>
  );
}
