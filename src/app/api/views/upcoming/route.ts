import { NextResponse } from "next/server";
import { TaskService } from "@/services/task-service";

const taskService = new TaskService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const tasks = await taskService.getUpcomingTasks(days);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching upcoming tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming tasks" },
      { status: 500 }
    );
  }
}
