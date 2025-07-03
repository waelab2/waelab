import Image from "next/image";
import AccentedText from "./accented-text";

type SectionTitleProps = {
  title: string;
  leftArrow?: boolean;
  rightArrow?: boolean;
};
export default function SectionTitle({
  title,
  leftArrow = false,
  rightArrow = false,
}: SectionTitleProps) {
  return (
    <h4 className="flex items-center gap-4 text-lg">
      {leftArrow && (
        <Image src="/left-title-arrow.png" alt="arrow" width={64} height={1} />
      )}
      <AccentedText>{title}</AccentedText>
      {rightArrow && (
        <Image src="/right-title-arrow.png" alt="arrow" width={64} height={1} />
      )}
    </h4>
  );
}
