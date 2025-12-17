"use client";

import * as React from "react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  checkboxSize?: "sm" | "md" | "lg";
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checkboxSize = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={
            "rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring-primary " +
            sizeClasses[checkboxSize] +
            " " +
            className
          }
          ref={ref}
          {...props}
        />
        {label && (
          <label className="text-sm text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
