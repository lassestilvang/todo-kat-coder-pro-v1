import { NextResponse } from "next/server";
import { FileService } from "@/services/file-service";

const fileService = new FileService();

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

    const attachments = await fileService.getAttachmentsForTask(
      parseInt(taskId)
    );

    return NextResponse.json(attachments);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const taskId = formData.get("taskId");

    if (!file || !taskId) {
      return NextResponse.json(
        { error: "File and task ID are required" },
        { status: 400 }
      );
    }

    const validation = fileService.validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const attachment = await fileService.uploadFile(
      file,
      parseInt(taskId.toString())
    );

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json(
      { error: "Failed to upload attachment" },
      { status: 500 }
    );
  }
}
