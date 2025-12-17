import { db } from "@/lib/db";
import { labels } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { Label } from "@/types/task";

export class LabelService {
  async getLabels(): Promise<Label[]> {
    return db.select().from(labels).all() as Label[];
  }

  async getLabelById(id: number): Promise<Label | undefined> {
    return db.select().from(labels).where(eq(labels.id, id)).get() as
      | Label
      | undefined;
  }

  async createLabel(label: Omit<Label, "id" | "createdAt">): Promise<Label> {
    const [newLabel] = (await db
      .insert(labels)
      .values(label)
      .returning()
      .all()) as Label[];
    return newLabel;
  }

  async updateLabel(
    id: number,
    updates: Partial<Label>
  ): Promise<Label | undefined> {
    const [updatedLabel] = (await db
      .update(labels)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(labels.id, id))
      .returning()
      .all()) as Label[];
    return updatedLabel;
  }

  async deleteLabel(id: number): Promise<void> {
    await db.delete(labels).where(eq(labels.id, id)).run();
  }
}
