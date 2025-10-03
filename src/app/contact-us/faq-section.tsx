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
import { useTranslations } from "~/hooks/use-translations";

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
        className="flex w-full items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 lg:gap-4 lg:px-6 lg:py-4"
      >
        <h3
          className={cn(
            "text-left text-xs font-medium transition-colors duration-200 sm:text-sm lg:text-base",
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
          <AccentedText className="text-lg sm:text-xl lg:text-2xl">
            +
          </AccentedText>
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
            <div className="border-border/40 border-t px-3 pt-1 pb-2 sm:px-4 sm:pt-2 sm:pb-3 lg:px-6 lg:pb-4">
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
  const { t } = useTranslations();

  const faqs: Omit<FAQItemProps, "index">[] = [
    {
      question: t("faq_section.faq_1.question"),
      answer: t("faq_section.faq_1.answer"),
    },
    {
      question: t("faq_section.faq_2.question"),
      answer: t("faq_section.faq_2.answer"),
    },
    {
      question: t("faq_section.faq_3.question"),
      answer: t("faq_section.faq_3.answer"),
    },
    {
      question: t("faq_section.faq_4.question"),
      answer: t("faq_section.faq_4.answer"),
    },
    {
      question: t("faq_section.faq_5.question"),
      answer: t("faq_section.faq_5.answer"),
    },
    {
      question: t("faq_section.faq_6.question"),
      answer: t("faq_section.faq_6.answer"),
    },
  ];

  return (
    <section className="text-ui-dark mx-4 my-8 sm:mx-8 sm:my-12 md:mx-12 md:my-16 lg:my-24">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-center lg:text-left"
        >
          <SectionTitle
            title={t("faq_section.title")}
            rightArrow
            leftArrow
            className="mb-3 justify-center text-base sm:text-lg lg:justify-start lg:text-xl"
          />
          <h2 className="mb-2 text-xl font-semibold sm:text-2xl lg:text-3xl">
            {t("faq_section.heading_part1")}{" "}
            <AccentedText>{t("faq_section.heading_part2")}</AccentedText>{" "}
            {t("faq_section.heading_part3")}
          </h2>
          <p className="text-ui-grey mb-4 text-xs leading-relaxed sm:text-sm lg:mb-6 lg:text-base">
            {t("faq_section.description")}
          </p>

          {/* Because this component is borrowed by home page */}
          {pathname === "/" && (
            <Link href="/contact-us#faq">
              <Button
                className="waelab-gradient-bg min-w-32 rounded-full py-3 text-sm text-white shadow-none transition-all duration-300 hover:text-white hover:shadow-md sm:min-w-40 sm:py-4 sm:text-base lg:min-w-48 lg:py-6"
                type="button"
              >
                {t("faq_section.view_all_button")}
                <ArrowRightIcon className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          )}
        </motion.div>

        <div className="flex-1">
          {(pathname === "/" ? faqs.slice(0, 4) : faqs).map((faq, index) => (
            <div key={index}>
              <FAQItem {...faq} index={index} />
              {index < (pathname === "/" ? 3 : faqs.length - 1) && (
                <Separator className="my-1 h-0.25 sm:my-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
