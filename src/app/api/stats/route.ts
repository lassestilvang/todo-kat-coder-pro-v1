import { NextResponse } from "next/server";
import { TaskService } from "@/services/task-service";
import { AuditService } from "@/services/audit-service";

const taskService = new TaskService();
const auditService = new AuditService();

export async function GET() {
  try {
    const [taskStats, changeStats] = await Promise.all([
      taskService.getTaskStatistics(),
      auditService.getChangeStatistics(),
    ]);

    const stats = {
      tasks: taskStats,
      changes: changeStats,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
