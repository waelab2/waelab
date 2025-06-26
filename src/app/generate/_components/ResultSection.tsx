"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
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
    <div>
      <h2 className="text-center text-3xl">Result</h2>
      {isLoading ? (
        <ImageSkeleton />
      ) : (
        <Suspense fallback={<ImageSkeleton />}>
          <Image src={imageUrl} alt="Result" width={384} height={384} />
        </Suspense>
      )}
    </div>
  );
}

function ImageSkeleton() {
  return <Skeleton className="h-[384px] w-[384px] rounded-lg shadow-lg" />;
}
