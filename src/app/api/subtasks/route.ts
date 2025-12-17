import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subTasks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { SubTask } from "@/types/task";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const subtasks = (await db
      .select()
      .from(subTasks)
      .where(eq(subTasks.taskId, parseInt(taskId)))
      .all()) as SubTask[];

    return NextResponse.json(subtasks);
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch subtasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, title } = body;

    if (!taskId || !title) {
      return NextResponse.json(
        { error: "Task ID and title are required" },
        { status: 400 }
      );
    }

    const [newSubTask] = await db
      .insert(subTasks)
      .values({
        taskId,
        title,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newSubTask, { status: 201 });
  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json(
      { error: "Failed to create subtask" },
      { status: 500 }
    );
  }
}
