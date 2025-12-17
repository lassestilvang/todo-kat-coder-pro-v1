import { NextResponse } from "next/server";
import { TaskService } from "@/services/task-service";

const taskService = new TaskService();

export async function GET() {
  try {
    const tasks = await taskService.getInboxTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching inbox tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch inbox tasks" },
      { status: 500 }
    );
  }
}
