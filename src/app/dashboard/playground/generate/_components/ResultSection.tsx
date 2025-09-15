"use client";

import { Suspense, useEffect, useState } from "react";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Skeleton } from "~/components/ui/skeleton";
import type { Result, Status, VideoGenerationOutput } from "~/lib/types";

export default function ResultSection({
  status,
  result,
  showMetadata = true,
}: {
  status: Status;
  result: Result;
  showMetadata?: boolean;
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

      {videoData && !isLoading && showMetadata && (
        <div className="space-y-1 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span className="font-medium">File:</span>
            <span className="text-white/60">{videoData.file_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Size:</span>
            <span className="text-white/60">
              {(videoData.file_size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Type:</span>
            <span className="text-white/60">{videoData.content_type}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3 text-white/80">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
        <span className="text-lg font-medium">Generating video...</span>
      </div>
    </div>
  );
}
