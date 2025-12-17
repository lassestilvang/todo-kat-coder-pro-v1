"use client";

import * as React from "react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "spinner",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const spinnerClasses = sizeClasses[size];

  if (variant === "dots") {
    return (
      <div
        className={`flex space-x-2 ${className}`}
        role="status"
        aria-label="Loading"
      >
        <span className={`block rounded-full bg-primary ${spinnerClasses}`} />
        <span className={`block rounded-full bg-primary ${spinnerClasses}`} />
        <span className={`block rounded-full bg-primary ${spinnerClasses}`} />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={`relative ${className}`}
        role="status"
        aria-label="Loading"
      >
        <div
          className={`absolute inset-0 rounded-full bg-primary ${spinnerClasses} animate-ping opacity-75`}
        />
        <div className={`relative rounded-full bg-primary ${spinnerClasses}`} />
      </div>
    );
  }

  return (
    <div className={className} role="status" aria-label="Loading">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary ${spinnerClasses}`}
      />
    </div>
  );
}
