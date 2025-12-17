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

    // Build where conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereConditions: Array<any> = [];

    // Apply filters
    if (search) {
      whereConditions.push(like(tasks.title, `%${search}%`));
    }

    if (priority) {
      whereConditions.push(eq(tasks.priority, priority));
    }

    if (status === "completed") {
      whereConditions.push(eq(tasks.isCompleted, true));
    } else if (status === "pending") {
      whereConditions.push(eq(tasks.isCompleted, false));
    }

    // Apply view filters
    if (view === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      whereConditions.push(
        and(
          like(tasks.date, `${today.toISOString().split("T")[0]}%`),
          isNull(tasks.isCompleted)
        )
      );
    } else if (view === "next7days") {
      const today = new Date();
      const next7Days = new Date();
      next7Days.setDate(today.getDate() + 7);
      whereConditions.push(
        and(
          like(tasks.date, `%${today.toISOString().split("T")[0]}%`),
          like(tasks.date, `%${next7Days.toISOString().split("T")[0]}%`),
          isNull(tasks.isCompleted)
        )
      );
    } else if (view === "upcoming") {
      const today = new Date();
      whereConditions.push(
        and(
          like(tasks.date, `%${today.toISOString().split("T")[0]}%`),
          isNull(tasks.isCompleted)
        )
      );
    }

    // Create query with where conditions
    let query;
    if (whereConditions.length > 0) {
      query = db.select().from(tasks).where(and(...whereConditions));
    } else {
      query = db.select().from(tasks);
    }

    // Apply sorting
    let sortColumn;
    switch (sortField as string) {
      case "title":
        sortColumn = tasks.title;
        break;
      case "priority":
        sortColumn = tasks.priority;
        break;
      case "date":
        sortColumn = tasks.date;
        break;
      case "createdAt":
        sortColumn = tasks.createdAt;
        break;
      case "updatedAt":
        sortColumn = tasks.updatedAt;
        break;
      default:
        sortColumn = tasks.createdAt;
    }
    query = query.orderBy(sortDirection === "asc" ? sortColumn : sortColumn);

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
        reminders: validatedData.reminders ? JSON.stringify(validatedData.reminders) : undefined,
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
