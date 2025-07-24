import React from "react";
import Image from "next/image";

interface QuizForceLogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  textClassName?: string;
}

export function QuizForceLogo({
  size = 14, // Smaller icon size
  className = "",
  withText = false,
  textClassName = "",
}: QuizForceLogoProps) {
  if (withText) {
    return (
      <div className="flex items-center space-x-2">
        <Image
          src="/images/icon.png"
          alt="QuizForce"
          width={size}
          height={size}
          className={`w-auto h-auto ${className}`}
          priority
        />
        <span
          className={`text-xl font-bold text-black ${textClassName}`}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          QuizForce
        </span>
      </div>
    );
  }

  return (
    <Image
      src="/images/icon.png"
      alt="QuizForce"
      width={size}
      height={size}
      className={`w-auto h-auto ${className}`}
      priority
    />
  );
}
