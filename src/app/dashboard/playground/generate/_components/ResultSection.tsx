"use client";

import { Suspense, useEffect, useState } from "react";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Skeleton } from "~/components/ui/skeleton";
import type { Result, Status, VideoGenerationOutput } from "~/lib/types";

export default function ResultSection({
  status,
  result,
}: {
  status: Status;
  result: Result;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [videoData, setVideoData] = useState<
    VideoGenerationOutput["video"] | null
  >(null);

  useEffect(() => {
    if (status === "COMPLETED" && result != null) {
      // result is a Promise that resolves to { data: VideoGenerationOutput }
      const loadResult = async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/await-thenable
          const resolvedResult = await result;
          setVideoData(resolvedResult.data.video);
          console.log("🎬 Video result loaded:", resolvedResult.data.video);
        } catch (error) {
          console.error("Error loading video result:", error);
        } finally {
          setIsLoading(false);
        }
      };

      void loadResult();
    }
  }, [status, result]);

  return (
    <div className="space-y-4">
      <AspectRatio ratio={16 / 9}>
        {isLoading ? (
          <VideoSkeleton />
        ) : (
          <Suspense fallback={<VideoSkeleton />}>
            <video
              src={videoData?.url}
              controls
              autoPlay
              loop
              muted
              className="h-full w-full rounded-lg object-cover shadow-lg"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </Suspense>
        )}
      </AspectRatio>

      {videoData && !isLoading && (
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span className="font-medium">File:</span>
            <span className="text-gray-500">{videoData.file_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Size:</span>
            <span className="text-gray-500">
              {(videoData.file_size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Type:</span>
            <span className="text-gray-500">{videoData.content_type}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="relative h-full w-full">
      <Skeleton className="h-full w-full rounded-lg shadow-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          <span className="text-sm">Generating video...</span>
        </div>
      </div>
    </div>
  );
}
