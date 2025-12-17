import { NextResponse } from "next/server";
import { TaskService } from "@/services/task-service";

const taskService = new TaskService();

export async function GET() {
  try {
    const tasks = await taskService.getAllTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch all tasks" },
      { status: 500 }
    );
  }
}
