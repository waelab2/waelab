import { cn } from "~/lib/utils";

export default function GradientBordered({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] p-0.75",
        className,
      )}
    >
      {children}
    </div>
  );
}
