import Image from "next/image";
import { useLanguageToggle } from "~/hooks/use-translations";
import { cn } from "~/lib/utils";
import AccentedText from "./accented-text";

type SectionTitleProps = {
  title: string;
  leftArrow?: boolean;
  rightArrow?: boolean;
  className?: string;
};
export default function SectionTitle({
  title,
  leftArrow = false,
  rightArrow = false,
  className = "",
}: SectionTitleProps) {
  const { language } = useLanguageToggle();
  return (
    <h4 className={cn("flex items-center gap-4 text-lg", className)}>
      {leftArrow && (
        <Image
          src="/left-title-arrow.png"
          alt="arrow"
          width={64}
          height={1}
          className={language === "ar" ? "rotate-180" : ""}
        />
      )}
      <AccentedText>{title}</AccentedText>
      {rightArrow && (
        <Image
          src="/right-title-arrow.png"
          alt="arrow"
          width={64}
          height={1}
          className={language === "ar" ? "rotate-180" : ""}
        />
      )}
    </h4>
  );
}
