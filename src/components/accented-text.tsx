import { cn } from "~/lib/utils";

export default function AccentedText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-transparent bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] bg-clip-text font-semibold text-transparent",
        className,
      )}
      style={{
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </span>
  );
}
