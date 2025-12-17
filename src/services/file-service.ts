import { db } from "@/lib/db";
import { attachments } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { Attachment } from "@/types/task";

export class FileService {
  async uploadFile(file: File, taskId: number): Promise<Attachment> {
    try {
      // In a real application, you would:
      // 1. Save the file to a storage service (AWS S3, Google Cloud Storage, etc.)
      // 2. Generate a secure URL for the file
      // 3. Store metadata in the database

      // For this demo, we'll simulate file upload
      const fileName = file.name;
      const mimeType = file.type;
      const fileSize = file.size;

      // Generate a mock file path/URL
      const filePath = `/uploads/${Date.now()}_${fileName}`;

      const [newAttachment] = (await db
        .insert(attachments)
        .values({
          taskId,
          fileName,
          filePath,
          fileSize,
          mimeType,
          createdAt: new Date().toISOString(),
        })
        .returning()
        .all()) as Attachment[];

      return newAttachment;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  }

  async deleteFile(id: number): Promise<void> {
    try {
      // In a real application, you would also delete the actual file from storage
      await db.delete(attachments).where(eq(attachments.id, id)).run();
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file");
    }
  }

  async getAttachmentsForTask(taskId: number): Promise<Attachment[]> {
    try {
      return db
        .select()
        .from(attachments)
        .where(eq(attachments.taskId, taskId))
        .all() as Attachment[];
    } catch (error) {
      console.error("Error getting attachments:", error);
      throw new Error("Failed to get attachments");
    }
  }

  async getFileById(id: number): Promise<Attachment | undefined> {
    try {
      return db
        .select()
        .from(attachments)
        .where(eq(attachments.id, id))
        .get() as Attachment | undefined;
    } catch (error) {
      console.error("Error getting file:", error);
      throw new Error("Failed to get file");
    }
  }

  // File validation
  validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "image/",
      "application/pdf",
      "text/",
      "application/msword",
      "application/vnd.openxmlformats-officedocument",
    ];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "File size exceeds 10MB limit",
      };
    }

    const isAllowedType = allowedTypes.some((type) =>
      file.type.startsWith(type)
    );

    if (!isAllowedType) {
      return {
        isValid: false,
        error: "File type not allowed",
      };
    }

    return { isValid: true };
  }

  // Generate a download URL (mock implementation)
  generateDownloadUrl(attachment: Attachment): string {
    // In a real application, this would generate a signed URL
    // that expires after a certain time for security
    return attachment.filePath;
  }

  // Get file icon based on MIME type
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith("image/")) {
      return "🖼️";
    } else if (mimeType === "application/pdf") {
      return "📄";
    } else if (mimeType.startsWith("text/")) {
      return "📝";
    } else if (
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "📄";
    } else if (
      mimeType === "application/vnd.ms-excel" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return "📊";
    } else if (
      mimeType === "application/vnd.ms-powerpoint" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return "📽️";
    } else {
      return "📎";
    }
  }
}
