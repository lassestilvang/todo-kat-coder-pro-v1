-- Initial database schema for daily task planner
-- This migration creates all tables and initial data

-- Create lists table
CREATE TABLE lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT NOT NULL CHECK (length(color) = 7), -- Hex color like #FF5733
  emoji TEXT NOT NULL CHECK (length(emoji) <= 4), -- Emoji icon
  is_magic INTEGER NOT NULL DEFAULT 0 CHECK (is_magic IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on list name
CREATE UNIQUE INDEX list_name_idx ON lists(name);

-- Create index on magic flag
CREATE INDEX magic_list_idx ON lists(is_magic);

-- Create labels table
CREATE TABLE labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL CHECK (length(icon) <= 4), -- Emoji icon
  color TEXT NOT NULL CHECK (length(color) = 7), -- Hex color
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on label name
CREATE UNIQUE INDEX label_name_idx ON labels(name);

-- Create tasks table
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL, -- ISO date string YYYY-MM-DD
  deadline TEXT, -- ISO datetime string YYYY-MM-DDTHH:mm
  estimate_hours INTEGER,
  estimate_minutes INTEGER,
  actual_hours INTEGER,
  actual_minutes INTEGER,
  priority TEXT NOT NULL DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high')),
  list_id INTEGER NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  completed_at TEXT,
  is_recurring INTEGER NOT NULL DEFAULT 0 CHECK (is_recurring IN (0, 1)),
  recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'weekday', 'monthly', 'yearly', 'custom')),
  recurrence_interval INTEGER,
  recurrence_end_date TEXT, -- ISO date when recurrence ends
  reminders TEXT, -- JSON array of reminder objects
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES lists(id)
);

-- Create indexes for performance
CREATE INDEX task_title_idx ON tasks(title);
CREATE INDEX task_priority_idx ON tasks(priority);
CREATE INDEX task_date_idx ON tasks(date);
CREATE INDEX task_deadline_idx ON tasks(deadline);
CREATE INDEX task_completed_idx ON tasks(is_completed);
CREATE INDEX task_list_idx ON tasks(list_id);
CREATE INDEX task_recurring_idx ON tasks(is_recurring);

-- Create composite indexes for common queries
CREATE INDEX task_list_priority_idx ON tasks(list_id, priority);
CREATE INDEX task_date_completed_idx ON tasks(date, is_completed);

-- Create task_labels junction table
CREATE TABLE task_labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  label_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, label_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);

-- Create indexes for task_labels
CREATE INDEX task_label_task_idx ON task_labels(task_id);
CREATE INDEX task_label_label_idx ON task_labels(label_id);

-- Create sub_tasks table
CREATE TABLE sub_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Create indexes for sub_tasks
CREATE INDEX subtask_task_idx ON sub_tasks(task_id);
CREATE INDEX subtask_completed_idx ON sub_tasks(is_completed);

-- Create attachments table
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER, -- Size in bytes
  mime_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Create indexes for attachments
CREATE INDEX attachment_task_idx ON attachments(task_id);
CREATE INDEX attachment_filename_idx ON attachments(file_name);

-- Create task_changes table for audit trail
CREATE TABLE task_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'complete', 'uncomplete')),
  changed_fields TEXT, -- JSON object with field changes
  old_value TEXT, -- Previous state of the task (JSON)
  new_value TEXT, -- New state of the task (JSON)
  changed_by TEXT, -- User who made the change (if applicable)
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Create indexes for task_changes
CREATE INDEX change_task_idx ON task_changes(task_id);
CREATE INDEX change_type_idx ON task_changes(change_type);
CREATE INDEX change_created_idx ON task_changes(created_at);

-- Insert magic Inbox list
INSERT INTO lists (name, color, emoji, is_magic) VALUES ('Inbox', '#3B82F6', '📥', 1);

-- Insert some default labels
INSERT INTO labels (name, icon, color) VALUES
  ('Work', '💼', '#EF4444'),
  ('Personal', '🏠', '#10B981'),
  ('Urgent', '🔥', '#F59E0B'),
  ('Learning', '📚', '#8B5CF6'),
  ('Health', '💪', '#14B8A6');
