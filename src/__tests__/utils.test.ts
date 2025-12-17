import { describe, it, expect } from "bun:test";
import { formatDate, formatTime, generateTaskSummary } from "@/lib/utils";

describe("Utils", () => {
  describe("formatDate", () => {
    it("should format valid date string", () => {
      const date = "2024-01-15T10:30:00.000Z";
      const result = formatDate(date);
      expect(result).toBe("Jan 15, 2024");
    });

    it("should return original string for invalid date", () => {
      const invalidDate = "invalid-date";
      const result = formatDate(invalidDate);
      expect(result).toBe(invalidDate);
    });
  });

  describe("formatTime", () => {
    it("should format time with hours and minutes", () => {
      const result = formatTime(2, 30);
      expect(result).toBe("02:30");
    });

    it("should format time with only hours", () => {
      const result = formatTime(1, 0);
      expect(result).toBe("01:00");
    });

    it("should return empty string when no time provided", () => {
      const result = formatTime();
      expect(result).toBe("");
    });
  });

  describe("generateTaskSummary", () => {
    it("should generate summary with priority and date", () => {
      const task = {
        title: "Test Task",
        date: "2024-01-15T10:30:00.000Z",
        priority: "high" as const,
        listId: 1,
        isCompleted: false,
        isRecurring: false,
        deadline: undefined,
        estimateHours: undefined,
        estimateMinutes: undefined,
        actualHours: undefined,
        actualMinutes: undefined,
      };
      const result = generateTaskSummary(task);
      expect(result).toContain("Priority: high");
      expect(result).toContain("Date: Jan 15, 2024");
    });

    it("should generate summary with time estimates", () => {
      const task = {
        title: "Test Task",
        date: "2024-01-15T10:30:00.000Z",
        priority: "medium" as const,
        listId: 1,
        isCompleted: false,
        isRecurring: false,
        deadline: undefined,
        estimateHours: 2,
        estimateMinutes: 30,
        actualHours: 1,
        actualMinutes: 45,
      };
      const result = generateTaskSummary(task);
      expect(result).toContain("Estimate: 02:30");
      expect(result).toContain("Actual: 01:45");
    });

    it("should return empty string for task with no properties", () => {
      const task = {
        title: "Test Task",
        date: "2024-01-15T10:30:00.000Z",
        priority: "none" as const,
        listId: 1,
        isCompleted: false,
        isRecurring: false,
        deadline: undefined,
        estimateHours: undefined,
        estimateMinutes: undefined,
        actualHours: undefined,
        actualMinutes: undefined,
      };
      const result = generateTaskSummary(task);
      expect(result).toBe("Date: Jan 15, 2024");
    });
  });
});
