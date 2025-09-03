/**
 * File Upload Component
 *
 * A reusable file upload component that supports drag and drop, preview, and validation.
 */

"use client";

import { File, Image, Music, Upload, Video, X } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "./button";

interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  preview?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  preview = true,
  className,
  placeholder = "Click to upload or drag and drop",
  disabled = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (maxSize && file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return `File size must be less than ${maxSizeMB}MB`;
      }

      // Check file type
      if (accept !== "*/*") {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const fileType = file.type;
        const isAccepted = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            return fileType.startsWith(type.slice(0, -1));
          }
          return fileType === type;
        });

        if (!isAccepted) {
          return `File type must be: ${accept}`;
        }
      }

      return null;
    },
    [accept, maxSize],
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      onChange(file);
    },
    [validateFile, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && files[0]) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect, disabled],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0 && files[0]) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleRemove = useCallback(() => {
    setError(null);
    onChange(null);
  }, [onChange]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    if (file.type.startsWith("video/")) {
      return <Video className="h-8 w-8 text-purple-500" />;
    }
    if (file.type.startsWith("audio/")) {
      return <Music className="h-8 w-8 text-green-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getPreviewContent = () => {
    if (!value) return null;

    if (value.type.startsWith("image/") && preview) {
      const imageUrl = URL.createObjectURL(value);
      return (
        <div className="relative">
          <img
            src={imageUrl}
            alt={`Preview of ${value.name}`}
            className="max-h-48 max-w-full rounded-lg object-contain"
            onLoad={() => URL.revokeObjectURL(imageUrl)}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    // For non-image files or when preview is disabled
    return (
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center space-x-3">
          {getFileIcon(value)}
          <div>
            <p className="text-sm font-medium">{value.name}</p>
            <p className="text-xs text-gray-500">
              {(value.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (value) {
    return (
      <div className={cn("space-y-2", className)}>
        {getPreviewContent()}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors",
          {
            "border-blue-400 bg-blue-50": isDragOver,
            "cursor-pointer hover:border-gray-400": !disabled,
            "cursor-not-allowed opacity-50": disabled,
          },
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />

        <div className="space-y-2">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">{placeholder}</p>
            <p className="text-xs text-gray-500">
              {accept !== "*/*" && `Accepted types: ${accept}`}
              {maxSize &&
                ` • Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
