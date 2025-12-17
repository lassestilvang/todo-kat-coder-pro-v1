"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
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
  const [date, setDate] = useState<Date | undefined>(value);
  const [time, setTime] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDate(value);
    if (value && showTime) {
      const hours = value.getHours().toString().padStart(2, "0");
      const minutes = value.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    }
  }, [value, showTime]);

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
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="date-picker" className="text-sm font-medium">
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              error && "border-destructive"
            )}
            disabled={disabled}
            id="date-picker"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {date ? formatDateDisplay(date) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-3" align="start">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            disabled={(date) => {
              if (disabled) return true;
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
          />

          {showTime && (
            <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
              <Label htmlFor="time-input" className="text-sm">
                Time:
              </Label>
              <input
                id="time-input"
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
