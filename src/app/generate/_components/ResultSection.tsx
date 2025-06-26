"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Skeleton } from "~/components/ui/skeleton";
import type { Result, Status } from "~/lib/types";

export default function ResultSection({
  status,
  result,
}: {
  status: Status;
  result: Result;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (status === "COMPLETED" && result != null) {
      result
        .then(({ data }) => {
          setImageUrl(data.images[0]!.url);
        })
        .catch((error) => {
          console.error("Error loading result:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [status, result]);

  return (
    <div className="flex flex-col items-center justify-center">
      <AspectRatio ratio={16 / 9}>
        {isLoading ? (
          <ImageSkeleton />
        ) : (
          <Suspense fallback={<ImageSkeleton />}>
            <Image
              src={imageUrl}
              alt="Result"
              className="rounded-lg object-cover shadow-lg"
              fill
            />
          </Suspense>
        )}
      </AspectRatio>
    </div>
  );
}

function ImageSkeleton() {
  return <Skeleton className="h-full w-full rounded-lg shadow-lg" />;
}
