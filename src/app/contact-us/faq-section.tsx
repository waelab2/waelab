"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AccentedText from "~/components/accented-text";
import SectionTitle from "~/components/section-title";
import { Button } from "~/components/ui/button";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.15,
        ease: "easeOut",
      }}
      className={cn(
        "group border-border/60 rounded-lg border",
        "transition-all duration-200 ease-in-out",
        isOpen ? "bg-card/30" : "hover:bg-card/50",
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4"
      >
        <h3
          className={cn(
            "text-left text-sm font-medium transition-colors duration-200 sm:text-base",
            "text-ui-dark",
            isOpen && "",
          )}
        >
          {question}
        </h3>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className={cn("shrink-0 rounded-full p-0.5")}
        >
          <AccentedText className="text-xl sm:text-2xl">+</AccentedText>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  duration: 0.4,
                  ease: [0.04, 0.62, 0.23, 0.98],
                },
                opacity: {
                  duration: 0.25,
                  delay: 0.1,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.3,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 0.25,
                },
              },
            }}
          >
            <div className="border-border/40 border-t px-4 pt-2 pb-3 sm:px-6 sm:pb-4">
              <motion.p
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="text-ui-grey text-xs leading-relaxed sm:text-sm"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FaqSection() {
  const pathname = usePathname();

  const faqs: Omit<FAQItemProps, "index">[] = [
    {
      question: "What types of videos can I create using your platform?",
      answer:
        "Our platform allows you to create a wide range of videos, including AI-generated content, cinematic edits, business promos, and social media content. Whether you need professional marketing videos or creative storytelling pieces, our tools provide everything you need.",
    },
    {
      question: "Is there a free plan available?",
      answer:
        "Yes! We offer a free plan with essential features to get you started. You can upgrade anytime for more advanced tools and unlimited access to premium features.",
    },
    {
      question: "How does AI help in video creation?",
      answer:
        "Our AI-powered tools assist in scriptwriting, scene transitions, and image integration, ensuring your videos look professional without requiring extensive editing experience.",
    },
    {
      question: "Can I export videos in different formats?",
      answer:
        "Yes, you can export your videos in various formats including MP4, MOV, and more. We support multiple resolutions and aspect ratios to fit your specific platform needs.",
    },
    {
      question: "How long does it take to generate a video?",
      answer:
        "Generation time depends on video length and complexity, but most videos are ready within minutes. Our AI-powered system ensures fast processing without compromising quality.",
    },
    {
      question: "Do I need video editing experience?",
      answer:
        "Not at all! Our platform is designed for users of all skill levels. The intuitive interface and AI assistance make it easy for anyone to create professional-quality videos.",
    },
  ];

  return (
    <section className="text-ui-dark mx-4 my-12 sm:mx-8 md:mx-12 md:my-12 lg:my-24">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-center lg:text-left"
        >
          <SectionTitle 
            title="Q&A" 
            rightArrow 
            leftArrow 
            className="mb-4 text-lg sm:text-xl justify-center lg:justify-start" 
          />
          <h2 className="mb-3 text-2xl font-semibold sm:text-3xl">
            Most <AccentedText>Common</AccentedText> Questions
          </h2>
          <p className="text-ui-grey mb-6 text-sm leading-relaxed sm:text-base">
            Find everything you need to know about our services, pricing, and
            how we can help you create stunning videos effortlessly.
          </p>

          {/* Because this component is borrowed by home page */}
          {pathname === "/" && (
            <Link href="/contact-us#faq">
              <Button
                className="waelab-gradient-bg min-w-40 rounded-full py-4 text-white shadow-none transition-all duration-300 hover:text-white hover:shadow-md sm:min-w-48 sm:py-6"
                type="button"
              >
                View All
                <ArrowRightIcon className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </motion.div>

        <div className="flex-1">
          {(pathname === "/" ? faqs.slice(0, 4) : faqs).map((faq, index) => (
            <div key={index}>
              <FAQItem {...faq} index={index} />
              {index < (pathname === "/" ? 3 : faqs.length - 1) && <Separator className="my-2 h-0.25" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
