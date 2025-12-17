import { db } from "@/lib/db";
import { lists } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { List } from "@/types/task";

export class ListService {
  async getLists(): Promise<List[]> {
    return db.select().from(lists).all() as List[];
  }

  async getListById(id: number): Promise<List | undefined> {
    return db.select().from(lists).where(eq(lists.id, id)).get() as
      | List
      | undefined;
  }

  async createList(
    list: Omit<List, "id" | "createdAt" | "updatedAt">
  ): Promise<List> {
    const [newList] = (await db
      .insert(lists)
      .values(list)
      .returning()
      .all()) as List[];
    return newList;
  }

  async updateList(
    id: number,
    updates: Partial<List>
  ): Promise<List | undefined> {
    const [updatedList] = (await db
      .update(lists)
      .set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(lists.id, id))
      .returning()
      .all()) as List[];
    return updatedList;
  }

  async deleteList(id: number): Promise<void> {
    await db.delete(lists).where(eq(lists.id, id)).run();
  }

  async getInboxList(): Promise<List | undefined> {
    return db.select().from(lists).where(eq(lists.isMagic, true)).get() as
      | List
      | undefined;
  }

  async createInboxList(): Promise<List> {
    const [inboxList] = (await db
      .insert(lists)
      .values({
        name: "Inbox",
        color: "#6366F1",
        emoji: "📥",
        isMagic: true,
      })
      .returning()
      .all()) as List[];
    return inboxList;
  }
}
