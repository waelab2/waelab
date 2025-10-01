"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
        className="flex w-full items-center justify-between gap-4 px-6 py-4"
      >
        <h3
          className={cn(
            "text-left text-base font-medium transition-colors duration-200",
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
          <AccentedText className="text-2xl">+</AccentedText>
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
            <div className="border-border/40 border-t px-6 pt-2 pb-4">
              <motion.p
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="text-ui-grey text-sm leading-relaxed"
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
    <section className="text-ui-dark relative">
      <div className="flex items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionTitle title="Q&A" rightArrow className="mb-4 text-xl" />
          <h2 className="mb-3 text-3xl font-semibold">
            Most <AccentedText>Common</AccentedText> Questions
          </h2>
          <p className="text-ui-grey mb-6">
            Find everything you need to know about our services, pricing, and
            how we can help you create stunning videos effortlessly.
          </p>

          {/* Because this component is borrowed by home page */}
          {pathname === "/" && (
            <Link href="/contact-us#faq">
              <Button
                className="waelab-gradient-bg min-w-48 rounded-full py-6 text-white shadow-none transition-all duration-300 hover:text-white hover:shadow-md"
                type="button"
              >
                View All
                <ArrowRightIcon className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </motion.div>

        <div className="w-1/2">
          {(pathname === "/" ? faqs.slice(0, 4) : faqs).map((faq, index) => (
            <div key={index}>
              <FAQItem {...faq} index={index} />
              {index < faqs.length - 1 && <Separator className="my-2 h-0.25" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
