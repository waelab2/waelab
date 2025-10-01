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
        <section className="text-ui-dark m-12 my-24 flex flex-col items-center gap-4">
          {pathname === "/" && (
            <SectionTitle
              title="Services"
              leftArrow
              rightArrow
              className="justify-center"
            />
          )}
          <h2 className="mb-4 w-1/2 text-center text-4xl leading-tight font-bold">
            Comprehensive Solutions for{" "}
            <AccentedText>Creative Video</AccentedText> Production
          </h2>
          <div className="flex w-full gap-8">
            <div className="flex flex-1 gap-8 rounded-xl p-4 shadow-lg">
              <figure className="relative h-full w-full flex-1">
                <Image
                  src={ServiceImage1}
                  alt="Service 1"
                  fill
                  className="rounded-lg object-cover"
                />
              </figure>
              <div className="flex flex-2 flex-col justify-between gap-8">
                <div className="flex gap-8">
                  <Image
                    src={ServiceIcon1}
                    alt="Service Icon 1"
                    width={125}
                    height={125}
                  />
                  <Image
                    src={ServiceIcon2}
                    alt="Service Icon 2"
                    width={125}
                    height={125}
                  />
                </div>
                <div>
                  <h4 className="mb-2 text-2xl font-bold">
                    Smart Video Editing
                  </h4>
                  <p className="mb-2 text-gray-500">
                    Enhance and refine your videos effortlessly with AI-powered
                    editing tools.
                  </p>
                  <button
                    onClick={() => setShowServiceInfo(true)}
                    className="mb-2 flex cursor-pointer items-center gap-4 transition-opacity hover:opacity-80"
                  >
                    <h5 className="text-lg font-semibold">
                      More about Smart Video Editing
                    </h5>
                    <div className="rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-2">
                      <ArrowRightIcon className="h-6 w-6 text-white" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-1 gap-8">
              <div className="relative flex flex-1 flex-col items-center justify-between overflow-hidden rounded-xl px-1 py-4 shadow-lg">
                <Image
                  src={ServiceImage2}
                  alt="Service 2"
                  fill
                  className="z-10 object-cover"
                />
                <div className="absolute inset-0 z-20 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
                <div className="relative z-20 rounded-full border border-white px-6 py-1 text-white">
                  Library
                </div>

                <div className="relative z-20 text-center text-2xl font-semibold text-white">
                  Creative Templates
                </div>
              </div>
              <div className="relative flex flex-1 flex-col items-center justify-between overflow-hidden rounded-xl px-1 py-4 shadow-lg">
                <Image
                  src={ServiceImage3}
                  alt="Service 3"
                  fill
                  className="z-10 object-cover"
                />
                <div className="absolute inset-0 z-20 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
                <div className="relative z-20 rounded-full border border-white px-6 py-1 text-white">
                  Script
                </div>

                <div className="relative z-20 text-center text-2xl font-semibold text-white">
                  AI Script Writing
                </div>
              </div>
              <div className="relative flex flex-1 flex-col items-center justify-between overflow-hidden rounded-xl px-1 py-4 shadow-lg">
                <Image
                  src={ServiceImage4}
                  alt="Service 4"
                  fill
                  className="z-10 object-cover"
                />
                <div className="absolute inset-0 z-20 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
                <div className="relative z-20 rounded-full border border-white px-6 py-1 text-white">
                  AI
                </div>

                <div className="relative z-20 text-center text-2xl font-semibold text-white">
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
    <div className="relative mx-8 my-16 rounded-2xl bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-0.5">
      <Image
        src={ServiceIcon1}
        alt="Service Icon 1"
        width={96}
        height={96}
        className="absolute top-0 left-16 -translate-y-1/2"
      />
      <div className="flex flex-col items-stretch rounded-2xl bg-white md:flex-row">
        <div className="flex flex-1 flex-col justify-center p-12">
          <h2 className="text-ui-dark mb-4 text-3xl font-semibold">
            Smart Video Editing
          </h2>
          <p className="text-ui-grey mb-6">
            Enhance and refine your videos effortlessly with AI-powered editing
            tools. Easily trim, merge, and adjust video speed while applying
            cinematic effects. Take your videos to the next level with advanced
            color correction, noise reduction, and automatic enhancement
            features.
          </p>
          <button
            onClick={onBack}
            className="flex w-fit cursor-pointer items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-2">
              <ArrowLeftIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700">
              Back to Services
            </span>
          </button>
        </div>
        <div className="relative flex flex-1 items-center justify-center p-12">
          <figure className="relative aspect-video w-full">
            <div className="absolute -top-6 left-6 z-10 h-full w-full rounded-xl bg-gradient-to-r from-[#E9476E] to-[#3B5DA8]" />
            <Image
              src={PhotoEditorImage}
              alt="Service Info"
              className="absolute z-20 rounded-xl shadow-lg"
              fill
            />
            <Image
              src={ServiceIcon2}
              alt="Service Icon 2"
              width={128}
              height={128}
              className="absolute bottom-4 left-0 z-30 -translate-x-1/2"
            />
          </figure>
        </div>
      </div>
    </div>
  );
}
