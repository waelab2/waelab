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
        "group relative flex flex-col items-start rounded-lg bg-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-[#E9476E] hover:to-[#3B5DA8] hover:text-white hover:shadow-none focus-visible:outline-none",
        className,
      )}
    >
      <Icon className="mb-4 size-8 text-white transition-colors group-hover:text-white" />
      <h3 className="mb-1 text-lg leading-none font-semibold tracking-tight text-white group-hover:text-white">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-white/80 group-hover:text-white">
          {description}
        </p>
      )}
    </Link>
  );
}
