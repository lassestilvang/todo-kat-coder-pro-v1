"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  label,
  error,
  disabled = false,
  className,
  showTime = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(() => value);
  const [time, setTime] = useState<string>(() => {
    if (value && showTime) {
      const hours = value.getHours().toString().padStart(2, "0");
      const minutes = value.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "";
  });
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);

    if (selectedDate && showTime && time) {
      const [hours, minutes] = time.split(":").map(Number);
      selectedDate.setHours(hours, minutes);
    }

    onChange?.(selectedDate);
  };

  const handleTimeChange = (timeString: string) => {
    setTime(timeString);

    if (date) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      setDate(newDate);
      onChange?.(newDate);
    }
  };

  const formatDateDisplay = (date: Date | undefined): string => {
    if (!date) return "";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    if (showTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div ref={containerRef} className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            error && "border-destructive"
          )}
          disabled={disabled}
          onClick={() => setOpen(!open)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {date ? formatDateDisplay(date) : <span>{placeholder}</span>}
        </Button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3">
            <input
              type="date"
              value={date ? date.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : undefined;
                handleDateChange(newDate);
              }}
              min={minDate ? minDate.toISOString().split("T")[0] : undefined}
              max={maxDate ? maxDate.toISOString().split("T")[0] : undefined}
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {showTime && (
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                <label className="text-sm">Time:</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}