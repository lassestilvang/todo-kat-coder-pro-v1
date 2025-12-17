import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { eq, like, and, isNull } from "drizzle-orm";
import { taskSchema, TaskFilter, TaskSort } from "@/types/task";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const priority = searchParams.get("priority") as TaskFilter["priority"];
    const status =
      (searchParams.get("status") as TaskFilter["status"]) || "all";
    const view = (searchParams.get("view") as TaskFilter["view"]) || "all";

    const sortField =
      (searchParams.get("sortField") as keyof TaskFilter) || "createdAt";
    const sortDirection =
      (searchParams.get("sortDirection") as TaskSort["direction"]) || "desc";

    let query = db.select().from(tasks);

    // Apply filters
    if (search) {
      query = query.where(like(tasks.title, `%${search}%`));
    }

    if (priority) {
      query = query.where(eq(tasks.priority, priority));
    }

    if (status === "completed") {
      query = query.where(eq(tasks.isCompleted, true));
    } else if (status === "pending") {
      query = query.where(eq(tasks.isCompleted, false));
    }

    // Apply view filters
    if (view === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      query = query.where(
        and(
          like(tasks.dueDate, `${today.toISOString().split("T")[0]}%`),
          isNull(tasks.isCompleted)
        )
      );
    } else if (view === "next7days") {
      const today = new Date();
      const next7Days = new Date();
      next7Days.setDate(today.getDate() + 7);
      query = query.where(
        and(
          like(tasks.dueDate, `%${today.toISOString().split("T")[0]}%`),
          like(tasks.dueDate, `%${next7Days.toISOString().split("T")[0]}%`),
          isNull(tasks.isCompleted)
        )
      );
    } else if (view === "upcoming") {
      const today = new Date();
      query = query.where(
        and(
          like(tasks.dueDate, `%${today.toISOString().split("T")[0]}%`),
          isNull(tasks.isCompleted)
        )
      );
    }

    // Apply sorting
    query = query.orderBy(
      sortDirection === "asc" ? tasks[sortField] : tasks[sortField]
    );

    const result = await query;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const [newTask] = await db
      .insert(tasks)
      .values({
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
