"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RunwayRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/playground");
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="text-white/80">Redirecting to playground...</p>
    </div>
  );
}
