import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import AccentedText from "~/components/accented-text";
import SectionTitle from "~/components/section-title";

export default function Services() {
  return (
    <section className="flex flex-col items-center gap-4 px-8 py-16">
      <SectionTitle title="Services" leftArrow rightArrow />
      <h2 className="mb-4 w-1/2 text-center text-4xl leading-tight font-bold">
        Comprehensive Solutions for <AccentedText>Creative Video</AccentedText>{" "}
        Production
      </h2>
      <div className="flex w-full gap-8">
        <div className="flex flex-1 gap-8 rounded-xl p-4 shadow-lg">
          <figure className="relative h-full w-full flex-1">
            <Image
              src="/services-1.jpg"
              alt="Service 1"
              fill
              className="rounded-lg object-cover"
            />
          </figure>
          <div className="flex flex-2 flex-col justify-between gap-8">
            <div className="flex gap-8">
              <Image
                src="/service-icon-1.png"
                alt="Service Icon 1"
                width={125}
                height={125}
              />
              <Image
                src="/service-icon-2.png"
                alt="Service Icon 2"
                width={125}
                height={125}
              />
            </div>
            <div>
              <h4 className="mb-2 text-2xl font-bold">Smart Video Editing</h4>
              <p className="mb-2 text-gray-500">
                Enhance and refine your videos effortlessly with AI-powered
                editing tools.
              </p>
              <div className="mb-2 flex items-center gap-4">
                <h5 className="text-lg">More about Smart Video Editing</h5>
                <div className="rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-2">
                  <ArrowRightIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-1 gap-8">
          <div
            className="relative flex flex-1 flex-col items-center justify-between rounded-lg px-1 py-4 shadow-lg"
            style={{
              background: "url('/services-2.jpg') no-repeat center center",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 z-10 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
            <div className="rounded-full border border-white px-6 py-1 text-white">
              Library
            </div>

            <div className="text-center text-2xl font-semibold text-white">
              Creative Templates
            </div>
          </div>
          <div
            className="relative flex flex-1 flex-col items-center justify-between rounded-lg px-1 py-4 shadow-lg"
            style={{
              background: "url('/services-3.png') no-repeat center center",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 z-10 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
            <div className="rounded-full border border-white px-6 py-1 text-white">
              Script
            </div>

            <div className="text-center text-2xl font-semibold text-white">
              AI Script Writing
            </div>
          </div>
          <div
            className="relative flex flex-1 flex-col items-center justify-between rounded-lg px-1 py-4 shadow-lg"
            style={{
              background: "url('/services-4.jpg') no-repeat center center",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 z-10 bg-linear-to-r from-[#E9476E00] to-[#3B5DA84D]" />
            <div className="rounded-full border border-white px-6 py-1 text-white">
              AI
            </div>

            <div className="text-center text-2xl font-semibold text-white">
              AI Video Creation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
