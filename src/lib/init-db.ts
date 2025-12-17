import { db } from "./db";
import { lists, labels, tasks } from "./schema";
import { sql } from "drizzle-orm";

/**
 * Initialize the database with default data
 * This should be run after migrations
 */
export async function initializeDatabase() {
  console.log("Initializing database with default data...");

  try {
    // Check if we already have the magic Inbox list
    const inboxExists = await db
      .select()
      .from(lists)
      .where(sql`LOWER(${lists.name}) = 'inbox'`)
      .get();

    if (!inboxExists) {
      console.log("Creating magic Inbox list...");
      await db
        .insert(lists)
        .values({
          name: "Inbox",
          color: "#3B82F6",
          emoji: "📥",
          isMagic: true,
        })
        .run();
      console.log("✓ Magic Inbox list created");
    } else {
      console.log("✓ Magic Inbox list already exists");
    }

    // Check if we have default labels
    const labelCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(labels)
      .get();

    if (!labelCount || Number(labelCount.count) === 0) {
      console.log("Creating default labels...");
      const defaultLabels = [
        { name: "Work", icon: "💼", color: "#EF4444" },
        { name: "Personal", icon: "🏠", color: "#10B981" },
        { name: "Urgent", icon: "🔥", color: "#F59E0B" },
        { name: "Learning", icon: "📚", color: "#8B5CF6" },
        { name: "Health", icon: "💪", color: "#14B8A6" },
        { name: "Shopping", icon: "🛒", color: "#F97316" },
        { name: "Finance", icon: "💰", color: "#22C55E" },
        { name: "Travel", icon: "✈️", color: "#06B6D4" },
      ];

      await db.insert(labels).values(defaultLabels).run();
      console.log(`✓ Created ${defaultLabels.length} default labels`);
    } else {
      console.log("✓ Default labels already exist");
    }

    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Reset the database (for development/testing)
 */
export async function resetDatabase() {
  console.log("Resetting database...");

  try {
    // Drop all tables in correct order (respecting foreign keys)
    await db.run(sql`
      DROP TABLE IF EXISTS task_changes;
      DROP TABLE IF EXISTS attachments;
      DROP TABLE IF EXISTS sub_tasks;
      DROP TABLE IF EXISTS task_labels;
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS labels;
      DROP TABLE IF EXISTS lists;
    `);

    console.log("✓ All tables dropped");

    // Re-run migrations by importing and executing the migration script
    // This would normally be done via the migrate.ts script
    console.log("Database reset completed. Run migrations to set up schema.");
  } catch (error) {
    console.error("Failed to reset database:", error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const stats = await db.transaction(async (tx: unknown) => {
      const [
        totalTasks,
        completedTasks,
        pendingTasks,
        totalLists,
        totalLabels,
        todayTasks,
      ] = await Promise.all([
        (tx as any)
          .select({ count: sql`COUNT(*)` })
          .from(tasks)
          .get(),
        (tx as any)
          .select({ count: sql`COUNT(*)` })
          .from(tasks)
          .where(sql`${tasks.isCompleted} = 1`)
          .get(),
        (tx as any)
          .select({ count: sql`COUNT(*)` })
          .from(tasks)
          .where(sql`${tasks.isCompleted} = 0`)
          .get(),
        (tx as any)
          .select({ count: sql`COUNT(*)` })
          .from(lists)
          .get(),
        (tx as any)
          .select({ count: sql`COUNT(*)` })
          .from(labels)
          .get(),
        (tx as any)
          .select({ count: sql`COUNT(*)` })
          .from(tasks)
          .where(
            sql`${tasks.date} = DATE('now') AND ${tasks.isCompleted} = 0`
          )
          .get(),
      ]);

      return {
        totalTasks: Number(totalTasks?.count || 0),
        completedTasks: Number(completedTasks?.count || 0),
        pendingTasks: Number(pendingTasks?.count || 0),
        totalLists: Number(totalLists?.count || 0),
        totalLabels: Number(totalLabels?.count || 0),
        todayTasks: Number(todayTasks?.count || 0),
      };
    });

    return stats;
  } catch (error) {
    console.error("Failed to get database stats:", error);
    throw error;
  }
}
