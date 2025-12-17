import { describe, it, expect } from "bun:test";
import { taskSchema, TaskFormData } from "@/types/task";

describe("Task Schema", () => {
  it("should validate a valid task", () => {
    const validTask: TaskFormData = {
      title: "Test Task",
      description: "Test Description",
      priority: "medium",
      date: new Date().toISOString().split("T")[0],
      listId: 1,
      isCompleted: false,
      isRecurring: false,
    };

    const result = taskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it("should reject a task without a title", () => {
    const invalidTask: Partial<TaskFormData> = {
      priority: "medium",
      date: new Date().toISOString().split("T")[0],
      listId: 1,
      isCompleted: false,
      isRecurring: false,
    };

    const result = taskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ["title"],
        message: "Required",
      })
    );
  });

  it("should set default values for optional fields", () => {
    const minimalTask: Partial<TaskFormData> = {
      title: "Minimal Task",
      priority: "low",
      date: new Date().toISOString().split("T")[0],
      listId: 1,
      isRecurring: false,
    };

    const result = taskSchema.safeParse(minimalTask);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isCompleted).toBe(false);
    }
  });
});
