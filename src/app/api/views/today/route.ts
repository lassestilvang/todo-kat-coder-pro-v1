import { NextResponse } from "next/server";
import { TaskService } from "@/services/task-service";

const taskService = new TaskService();

export async function GET() {
  try {
    const tasks = await taskService.getTodayTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching today's tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's tasks" },
      { status: 500 }
    );
  }
}
