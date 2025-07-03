import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

export default function PrimaryAccentedButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      className={cn(
        "rounded-full bg-gradient-to-r from-[#E9476E] to-[#3B5DA8] text-white",
        className,
      )}
      size="lg"
    >
      {children}
    </Button>
  );
}
