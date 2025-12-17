import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subTasks } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { SubTask } from "@/types/task";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid subtask ID" },
        { status: 400 }
      );
    }

    const [subtask] = await db
      .select()
      .from(subTasks)
      .where(eq(subTasks.id, id));

    if (!subtask) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }

    return NextResponse.json(subtask);
  } catch (error) {
    console.error("Error fetching subtask:", error);
    return NextResponse.json(
      { error: "Failed to fetch subtask" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid subtask ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, isCompleted } = body;

    const [updatedSubTask] = await db
      .update(subTasks)
      .set({
        title,
        isCompleted,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(subTasks.id, id))
      .returning();

    if (!updatedSubTask) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSubTask);
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json(
      { error: "Failed to update subtask" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid subtask ID" },
        { status: 400 }
      );
    }

    const [deletedSubTask] = await db
      .delete(subTasks)
      .where(eq(subTasks.id, id))
      .returning();

    if (!deletedSubTask) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subtask deleted successfully" });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return NextResponse.json(
      { error: "Failed to delete subtask" },
      { status: 500 }
    );
  }
}
