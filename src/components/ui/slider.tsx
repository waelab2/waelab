/**
 * Slider Component
 *
 * A reusable slider component for numeric ranges with labels and validation.
 */

"use client";

import { useCallback } from "react";
import { cn } from "~/lib/utils";

interface SliderProps {
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export function Slider({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false,
  showValue = true,
  formatValue = (val) => val.toString(),
}: SliderProps) {
  // Remove unused state
  // const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (!isNaN(newValue)) {
        onChange(Math.min(Math.max(newValue, min), max));
      }
    },
    [onChange, min, max],
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {showValue && (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={value}
              onChange={handleInputChange}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={cn(
                "w-20 rounded-md border border-white/30 px-2 py-1 text-sm",
                "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
                {
                  "cursor-not-allowed opacity-50": disabled,
                },
              )}
            />
            <span className="text-sm text-gray-400">{formatValue(value)}</span>
          </div>
        )}
        <div className="text-xs text-gray-400">
          {min} - {max}
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          // onMouseDown={() => setIsDragging(true)}
          // onMouseUp={() => setIsDragging(false)}
          disabled={disabled}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200",
            "focus:ring-opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none",
            {
              "cursor-not-allowed opacity-50": disabled,
            },
          )}
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
        />

        {/* Custom thumb styling */}
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            background: #3b82f6;
            border: 2px solid #ffffff;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          input[type="range"]::-webkit-slider-thumb:hover {
            background: #2563eb;
            transform: scale(1.1);
          }

          input[type="range"]::-moz-range-thumb {
            height: 20px;
            width: 20px;
            background: #3b82f6;
            border: 2px solid #ffffff;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          input[type="range"]::-moz-range-thumb:hover {
            background: #2563eb;
            transform: scale(1.1);
          }

          input[type="range"]:disabled::-webkit-slider-thumb {
            cursor: not-allowed;
            opacity: 0.5;
          }

          input[type="range"]:disabled::-moz-range-thumb {
            cursor: not-allowed;
            opacity: 0.5;
          }
        `}</style>
      </div>
    </div>
  );
}
