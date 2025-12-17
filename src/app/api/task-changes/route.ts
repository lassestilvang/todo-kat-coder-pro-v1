import { NextResponse } from "next/server";
import { AuditService } from "@/services/audit-service";

const auditService = new AuditService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const changeType = searchParams.get("changeType") as
      | "create"
      | "update"
      | "delete"
      | "complete"
      | "uncomplete"
      | undefined;

    if (taskId) {
      const changes = await auditService.getTaskChanges(parseInt(taskId), {
        limit,
        offset,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        changeType,
      });
      return NextResponse.json(changes);
    } else {
      const changes = await auditService.getAllChanges({
        limit,
        offset,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        changeType,
      });
      return NextResponse.json(changes);
    }
  } catch (error) {
    console.error("Error fetching task changes:", error);
    return NextResponse.json(
      { error: "Failed to fetch task changes" },
      { status: 500 }
    );
  }
}
