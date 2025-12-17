import { NextResponse } from "next/server";
import { TaskService } from "@/services/task-service";

const taskService = new TaskService();

export async function GET() {
  try {
    const tasks = await taskService.getUpcomingTasks(7);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching next 7 days tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch next 7 days tasks" },
      { status: 500 }
    );
  }
}
