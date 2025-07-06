import { type LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "~/lib/utils";

interface QuickLinkCardProps {
  href: string;
  title: string;
  description?: string;
  Icon: LucideIcon;
  className?: string;
}

export default function QuickLinkCard({
  href,
  title,
  description,
  Icon,
  className,
}: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group bg-card focus-visible:ring-ring relative flex flex-col items-start rounded-lg border p-6 shadow-sm transition-colors duration-300 hover:bg-gradient-to-r hover:from-[#E9476E] hover:to-[#3B5DA8] hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <Icon className="mb-4 size-8 transition-colors" />
      <h3 className="mb-1 text-lg leading-none font-semibold tracking-tight group-hover:text-white">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground text-sm group-hover:text-white">
          {description}
        </p>
      )}
    </Link>
  );
}
