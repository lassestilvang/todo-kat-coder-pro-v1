# Database Setup and Schema Documentation

This document provides comprehensive information about the SQLite database setup with Drizzle ORM for the Next.js daily task planner.

## Overview

The application uses SQLite as the database engine with Drizzle ORM for type-safe database operations. The schema supports all the complex requirements for task management including recurring tasks, labels, attachments, sub-tasks, and audit trails.

## Database Schema

### Core Entities

#### 1. Lists (`lists`)

Stores task lists including the magic "Inbox" list and custom lists.

**Fields:**

- `id`: Primary key (auto-increment)
- `name`: List name (unique)
- `color`: Hex color code (e.g., "#FF5733")
- `emoji`: Emoji icon (e.g., "📝")
- `isMagic`: Boolean flag for magic lists (Inbox)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**

- `list_name_idx`: Unique index on name
- `magic_list_idx`: Index on isMagic flag

#### 2. Labels (`labels`)

Categorizes tasks with icons and colors.

**Fields:**

- `id`: Primary key (auto-increment)
- `name`: Label name (unique)
- `icon`: Emoji icon
- `color`: Hex color code
- `createdAt`: Creation timestamp

**Indexes:**

- `label_name_idx`: Unique index on name

#### 3. Tasks (`tasks`)

Main entity storing all task information.

**Fields:**

- `id`: Primary key (auto-increment)
- `title`: Task title
- `description`: Task description (optional)
- `date`: Task date (YYYY-MM-DD)
- `deadline`: Task deadline (YYYY-MM-DDTHH:mm)
- `estimateHours`: Estimated hours (0-23)
- `estimateMinutes`: Estimated minutes (0-59)
- `actualHours`: Actual hours spent (0-23)
- `actualMinutes`: Actual minutes spent (0-59)
- `priority`: Priority level (none, low, medium, high)
- `listId`: Foreign key to lists
- `isCompleted`: Completion status
- `completedAt`: Completion timestamp
- `isRecurring`: Whether task recurs
- `recurrenceType`: Recurrence type (daily, weekly, weekday, monthly, yearly, custom)
- `recurrenceInterval`: Interval for custom recurrence
- `recurrenceEndDate`: End date for recurrence
- `reminders`: JSON array of reminder objects
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**

- `task_title_idx`: Index on title
- `task_priority_idx`: Index on priority
- `task_date_idx`: Index on date
- `task_deadline_idx`: Index on deadline
- `task_completed_idx`: Index on completion status
- `task_list_idx`: Index on listId
- `task_recurring_idx`: Index on isRecurring
- Composite indexes for common query patterns

#### 4. Task Labels (`task_labels`)

Many-to-many relationship between tasks and labels.

**Fields:**

- `id`: Primary key (auto-increment)
- `taskId`: Foreign key to tasks
- `labelId`: Foreign key to labels
- `createdAt`: Creation timestamp

**Indexes:**

- `unique_task_label`: Unique constraint on (taskId, labelId)
- `task_label_task_idx`: Index on taskId
- `task_label_label_idx`: Index on labelId

#### 5. Sub-Tasks (`sub_tasks`)

Child tasks within a main task.

**Fields:**

- `id`: Primary key (auto-increment)
- `taskId`: Foreign key to tasks
- `title`: Sub-task title
- `isCompleted`: Completion status
- `completedAt`: Completion timestamp
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**

- `subtask_task_idx`: Index on taskId
- `subtask_completed_idx`: Index on completion status

#### 6. Attachments (`attachments`)

File attachments for tasks.

**Fields:**

- `id`: Primary key (auto-increment)
- `taskId`: Foreign key to tasks
- `fileName`: Original file name
- `filePath`: Path or URL to file
- `fileSize`: File size in bytes
- `mimeType`: MIME type
- `createdAt`: Creation timestamp

**Indexes:**

- `attachment_task_idx`: Index on taskId
- `attachment_filename_idx`: Index on fileName

#### 7. Task Changes (`task_changes`)

Audit trail for tracking all task modifications.

**Fields:**

- `id`: Primary key (auto-increment)
- `taskId`: Foreign key to tasks
- `changeType`: Type of change (create, update, delete, complete, uncomplete)
- `changedFields`: JSON object with changed field names
- `oldValue`: Previous task state (JSON)
- `newValue`: New task state (JSON)
- `changedBy`: User who made the change
- `createdAt`: Change timestamp

**Indexes:**

- `change_task_idx`: Index on taskId
- `change_type_idx`: Index on changeType
- `change_created_idx`: Index on createdAt

## Database Operations

### Running Migrations

```bash
# Generate migration files (if using Drizzle Kit)
bun run db:generate

# Run migrations
bun run db:migrate
```

### Initializing Database

```typescript
import { initializeDatabase } from "@/lib/init-db";

// Initialize with default data
await initializeDatabase();
```

### Using the Database Service

```typescript
import { dbService } from "@/lib/db-service";

// Get all tasks
const { tasks, total } = await dbService.getTasks();

// Get tasks for today
const todayTasks = await dbService.getTodayTasks();

// Create a new task
const newTask = await dbService.createTask({
  title: "New Task",
  date: "2024-01-15",
  priority: "high",
  listId: 1,
});

// Add label to task
await dbService.addLabelToTask(taskId, labelId);
```

## Performance Considerations

### Indexes

The schema includes strategic indexes for common query patterns:

- Task filtering by list, priority, date, completion status
- Label and list lookups
- Composite indexes for multi-field queries

### Query Optimization

- Use the database service methods for optimized queries
- The service handles relation grouping efficiently
- Pagination is supported for large datasets

### Audit Trail

- All task changes are automatically logged
- Change history can be retrieved for any task
- Useful for debugging and compliance

## Data Relationships

```
Lists (1) ---- (N) Tasks (N) ---- (N) Labels
   |                    |
   |                    |-- (1) ---- (N) Sub-Tasks
   |                    |
   |                    |-- (1) ---- (N) Attachments
   |                    |
   |                    |-- (1) ---- (N) Task Changes
```

## Magic Inbox

The "Inbox" list is a special magic list:

- Automatically created during initialization
- `isMagic` flag set to true
- Serves as the default list for new tasks
- Cannot be deleted through the UI

## Recurring Tasks

Recurring tasks are supported with:

- Multiple recurrence types (daily, weekly, weekday, monthly, yearly, custom)
- Optional end dates
- Custom intervals for flexible scheduling

## File Structure

```
src/lib/
├── schema.ts          # Drizzle ORM schema definitions
├── db.ts             # Database connection
├── db-service.ts     # Database service layer
├── migrate.ts        # Migration runner
├── init-db.ts        # Database initialization
└── migrations/       # SQL migration files
    └── 001_initial_schema.sql
```

## Best Practices

1. **Use the Database Service**: Always use `dbService` for database operations to ensure consistency and proper error handling.

2. **Handle Relations**: The service automatically handles task relations (labels, sub-tasks, attachments) when fetching tasks.

3. **Audit Trail**: All changes are automatically logged. Use `getTaskChanges()` to retrieve change history.

4. **Indexes**: The schema includes optimized indexes. Add new indexes only when necessary for performance.

5. **Transactions**: Use database transactions for operations that modify multiple related records.

6. **Validation**: All data should be validated before insertion using the Zod schemas.

## Troubleshooting

### Common Issues

1. **Migration Failures**: Check the migration file syntax and ensure proper foreign key constraints.

2. **Performance Issues**: Review query patterns and consider adding appropriate indexes.

3. **Data Integrity**: Use transactions for complex operations to maintain data consistency.

4. **Schema Changes**: Always create new migration files for schema changes rather than modifying existing ones.

### Resetting Database (Development)

```typescript
import { resetDatabase } from "@/lib/init-db";

// WARNING: This will delete all data
await resetDatabase();
```

## Future Enhancements

Potential schema improvements:

- Full-text search indexing for task content
- User authentication and multi-tenancy
- Task dependencies and relationships
- Advanced analytics and reporting tables
- Soft delete support
