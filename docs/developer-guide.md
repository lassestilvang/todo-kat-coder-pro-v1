# Developer Guide

This guide provides comprehensive information for developers working on the Next.js daily task planner application.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Code Style and Conventions](#code-style-and-conventions)
3. [Testing Procedures](#testing-procedures)
4. [Build and Deployment Process](#build-and-deployment-process)
5. [Debugging and Troubleshooting](#debugging-and-troubleshooting)
6. [Performance Optimization](#performance-optimization)
7. [Architecture Patterns](#architecture-patterns)
8. [State Management](#state-management)
9. [API Development](#api-development)
10. [Database Development](#database-development)
11. [Component Development](#component-development)
12. [Contributing Guidelines](#contributing-guidelines)

## Development Environment Setup

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **Bun**: Version 1.0 or higher
- **SQLite**: Version 3 or higher
- **Git**: Version 2.0 or higher

### Initial Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd todo-kat-coder-pro-v1
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the project root:

   ```env
   DATABASE_URL=file:./sqlite.db
   NEXT_PUBLIC_APP_NAME="Daily Task Planner"
   NEXT_PUBLIC_APP_VERSION="1.0.0"
   MAX_FILE_SIZE=5242880
   ALLOWED_FILE_TYPES=application/pdf,image/*,text/*
   SEARCH_DEBOUNCE_MS=300
   ```

4. **Initialize the database:**

   ```bash
   bun run migrate
   ```

5. **Start the development server:**
   ```bash
   bun dev
   ```

### Development Tools

#### IDE Configuration

**VS Code Extensions:**

- ESLint
- Prettier
- TypeScript Importer
- Drizzle Studio (for database management)
- SQLite Viewer

**Recommended Settings (`.vscode/settings.json`):**

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### Development Scripts

| Script             | Description                  |
| ------------------ | ---------------------------- |
| `bun dev`          | Start development server     |
| `bun build`        | Build for production         |
| `bun start`        | Start production server      |
| `bun test`         | Run tests                    |
| `bun test --watch` | Run tests in watch mode      |
| `bun lint`         | Run ESLint                   |
| `bun typecheck`    | Run TypeScript type checking |
| `bun migrate`      | Run database migrations      |

#### Hot Reload Configuration

The development server supports hot module replacement (HMR) for:

- React components
- CSS-in-JS styles
- TypeScript files
- API route changes (server restart)

## Code Style and Conventions

### TypeScript Guidelines

#### Strict Mode

All TypeScript files must use strict mode:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

#### Type Definitions

- Always provide explicit type annotations for function parameters and return types
- Use interface over type for object definitions
- Prefer readonly for properties that shouldn't change
- Use enum for fixed sets of values

```typescript
// Good
interface Task {
  readonly id: number;
  title: string;
  priority: TaskPriority;
}

enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// Avoid
type Task = {
  id: number;
  title: any;
  priority: string;
};
```

#### Naming Conventions

| Type             | Convention                | Example                        |
| ---------------- | ------------------------- | ------------------------------ |
| Variables        | camelCase                 | `const taskList`               |
| Functions        | camelCase                 | `function getTaskById()`       |
| Classes          | PascalCase                | `class TaskManager`            |
| Interfaces       | PascalCase                | `interface TaskData`           |
| Types            | PascalCase                | `type TaskId = number`         |
| Constants        | UPPER_SNAKE_CASE          | `const MAX_RETRY_ATTEMPTS = 3` |
| Private Methods  | camelCase with \_ prefix  | `private _validateTask()`      |
| React Components | PascalCase                | `function TaskCard()`          |
| Hooks            | camelCase with use prefix | `function useTaskState()`      |

### React Development Patterns

#### Component Structure

```tsx
// Component file structure
import React, { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <Button onClick={() => onEdit(task)}>Edit</Button>
      <Button onClick={() => onDelete(task.id)}>Delete</Button>
    </div>
  );
};
```

#### Hooks Usage

```tsx
// Custom hook example
import { useState, useCallback, useEffect } from "react";

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, refetch: fetchTasks };
}
```

### State Management Patterns

#### Zustand Store Structure

```typescript
// Store example
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Task } from "@/types/task";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Task) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
    }),
    {
      name: "task-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### API Development Guidelines

#### Route Structure

```typescript
// API route example
import { NextRequest, NextResponse } from "next/server";
import { taskService } from "@/services/task-service";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  date: z.string().optional(),
  deadline: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const task = await taskService.createTask(validatedData);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### Error Handling

```typescript
// Error handling pattern
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Usage in API routes
export async function GET(request: NextRequest) {
  try {
    const tasks = await taskService.getAllTasks();
    return NextResponse.json({ tasks });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Database Development

#### Schema Design

```typescript
// Drizzle ORM schema
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).default(
    "medium"
  ),
  date: text("date"),
  deadline: text("deadline"),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const labels = sqliteTable("labels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const taskLabels = sqliteTable(
  "task_labels",
  {
    taskId: integer("task_id").notNull(),
    labelId: integer("label_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.labelId] }),
  })
);
```

#### Service Layer

```typescript
// Service pattern
import { db } from "@/lib/db";
import { tasks, labels, taskLabels } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";

export class TaskService {
  async createTask(data: NewTask) {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  }

  async getTaskWithRelations(id: number) {
    const result = await db
      .select()
      .from(tasks)
      .leftJoin(taskLabels, eq(tasks.id, taskLabels.taskId))
      .leftJoin(labels, eq(taskLabels.labelId, labels.id))
      .where(eq(tasks.id, id));

    return this.mapTaskWithRelations(result);
  }

  async searchTasks(query: string, filters: SearchFilters) {
    const whereConditions = this.buildSearchConditions(query, filters);

    return await db
      .select()
      .from(tasks)
      .where(and(...whereConditions))
      .orderBy(tasks.createdAt)
      .limit(50);
  }

  private mapTaskWithRelations(rows: any[]) {
    // Map and group related data
    const taskMap = new Map<number, any>();

    for (const row of rows) {
      if (!taskMap.has(row.tasks.id)) {
        taskMap.set(row.tasks.id, {
          ...row.tasks,
          labels: [],
        });
      }

      const task = taskMap.get(row.tasks.id);
      if (row.labels) {
        task.labels.push(row.labels);
      }
    }

    return Array.from(taskMap.values());
  }
}
```

## Testing Procedures

### Test Structure

```
src/__tests__/
├── components/           # Component tests
│   ├── TaskCard.test.tsx
│   └── TaskForm.test.tsx
├── services/            # Service tests
│   ├── taskService.test.ts
│   └── searchService.test.ts
├── utils/               # Utility tests
│   ├── dateUtils.test.ts
│   └── validation.test.ts
├── integration/         # Integration tests
│   ├── api.test.ts
│   └── e2e.test.ts
└── fixtures/            # Test data
    ├── tasks.json
    └── users.json
```

### Unit Testing

```typescript
// Example unit test
import { describe, it, expect } from "bun:test";
import { validateTask, TaskSchema } from "@/lib/validation";
import { TaskPriority } from "@/types/task";

describe("Task Validation", () => {
  it("should validate a valid task", () => {
    const validTask = {
      title: "Test Task",
      priority: TaskPriority.MEDIUM,
      date: "2024-01-01",
    };

    const result = validateTask(validTask);
    expect(result.success).toBe(true);
  });

  it("should reject a task without title", () => {
    const invalidTask = {
      priority: TaskPriority.MEDIUM,
    };

    const result = validateTask(invalidTask);
    expect(result.success).toBe(false);
    expect(result.error).toContain("title");
  });

  it("should validate task priority enum", () => {
    const invalidTask = {
      title: "Test Task",
      priority: "invalid" as TaskPriority,
    };

    const result = validateTask(invalidTask);
    expect(result.success).toBe(false);
  });
});
```

### Component Testing

```tsx
// Component test example
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "@/components/TaskCard";
import { Task } from "@/types/task";

const mockTask: Task = {
  id: 1,
  title: "Test Task",
  description: "Test Description",
  priority: "medium",
  date: "2024-01-01",
  isCompleted: false,
};

describe("TaskCard", () => {
  it("should render task information", () => {
    render(
      <TaskCard task={mockTask} onEdit={jest.fn()} onDelete={jest.fn()} />
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", () => {
    const mockOnEdit = jest.fn();
    render(
      <TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={jest.fn()} />
    );

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });
});
```

### API Testing

```typescript
// API test example
import { describe, it, expect, beforeEach } from "bun:test";
import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/tasks/route";

describe("/api/tasks", () => {
  beforeEach(() => {
    // Reset database or mock data
  });

  it("should create a new task", async () => {
    const { req } = createMocks({
      method: "POST",
      body: {
        title: "New Task",
        priority: "medium",
      },
    });

    const response = await handler.POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.task.title).toBe("New Task");
  });

  it("should return validation error for invalid data", async () => {
    const { req } = createMocks({
      method: "POST",
      body: {
        title: "", // Invalid: empty title
      },
    });

    const response = await handler.POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });
});
```

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/__tests__/task.test.ts

# Run tests with coverage
bun test --coverage

# Run tests matching pattern
bun test --grep="Task"

# Run tests in parallel
bun test --jobs=4
```

### Test Configuration

```json
// package.json test configuration
{
  "test": {
    "coverage": true,
    "coverageProvider": "v8",
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/*.test.{ts,tsx}",
      "!src/**/*.spec.{ts,tsx}"
    ],
    "coverageReporters": ["text", "lcov", "html"],
    "testMatch": ["**/__tests__/**/*.{ts,tsx}", "**/*.{test,spec}.{ts,tsx}"],
    "setupFilesAfterEnv": ["<rootDir>/src/setupTests.ts"]
  }
}
```

## Build and Deployment Process

### Build Configuration

```typescript
// next.config.ts
const nextConfig = {
  output: "standalone",
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["localhost"],
  },
  env: {
    APP_VERSION: process.env.npm_package_version,
  },
};

export default nextConfig;
```

### Build Process

```bash
# Development build
bun dev

# Production build
bun run build

# Production start
bun start

# Build with analysis
bun run build --analyze
```

### Environment Configuration

#### Development Environment

```env
NODE_ENV=development
DATABASE_URL=file:./dev.sqlite.db
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DEBUG=true
```

#### Staging Environment

```env
NODE_ENV=staging
DATABASE_URL=sqlite:///staging.sqlite.db
NEXT_PUBLIC_API_URL=https://staging.example.com/api
DEBUG=false
```

#### Production Environment

```env
NODE_ENV=production
DATABASE_URL=sqlite:///prod.sqlite.db
NEXT_PUBLIC_API_URL=https://api.example.com
DEBUG=false
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM oven/bun:1.0

WORKDIR /app

# Copy package files
COPY package.json bun.lock .

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "start"]
```

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=sqlite:///data/sqlite.db
    volumes:
      - ./data:/app/data
    depends_on:
      - db

  db:
    image: sqlite3
    volumes:
      - ./data:/data
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "bun"

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test

      - name: Build application
        run: bun run build

      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app
            git pull
            bun install
            bun run build
            pm2 restart app
```

## Debugging and Troubleshooting

### Development Debugging

#### Browser Developer Tools

1. **React DevTools**: Inspect component hierarchy and state
2. **Redux DevTools**: Monitor state changes (if using Redux)
3. **Network Tab**: Monitor API calls and responses
4. **Console**: Check for errors and warnings

#### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node-terminal",
      "request": "launch",
      "command": "bun dev",
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

#### Logging

```typescript
// Development logging
const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  },
};

// Usage
logger.debug("Task created", { taskId: 1, title: "New Task" });
```

### Common Issues and Solutions

#### TypeScript Errors

**Issue**: Type errors in third-party libraries
**Solution**: Add type declarations or use `// @ts-ignore`

```typescript
// @ts-ignore
import someLibrary from "some-library";
```

**Issue**: Module resolution errors
**Solution**: Check `tsconfig.json` paths and module resolution

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

#### Database Issues

**Issue**: Database connection errors
**Solution**: Check database URL and permissions

```typescript
// Check database connection
import { db } from "@/lib/db";

try {
  await db.execute(sql`SELECT 1`);
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database connection failed:", error);
}
```

**Issue**: Migration errors
**Solution**: Check migration files and database schema

```bash
# Reset database (development only)
rm sqlite.db
bun run migrate
```

#### Performance Issues

**Issue**: Slow page loads
**Solution**: Check bundle size and implement optimizations

```typescript
// Analyze bundle size
bun run build --analyze

// Implement code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

**Issue**: State update loops
**Solution**: Check for infinite re-renders

```typescript
// Add debugging to useEffect
useEffect(
  () => {
    console.log("Component re-rendered");
    // ... effect logic
  },
  [
    /* dependencies */
  ]
);
```

### Error Monitoring

#### Client-Side Error Tracking

```typescript
// Error boundary component
import React, { Component, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Server-Side Error Tracking

```typescript
// API error handler
export function handleApiError(error: unknown, req: NextRequest) {
  const errorId = generateErrorId();
  const errorInfo = {
    id: errorId,
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  };

  // Log error
  console.error(`Error ${errorId}:`, errorInfo);

  // Send to error tracking service
  sendToErrorTracking(errorInfo);

  return errorId;
}
```

## Performance Optimization

### Bundle Optimization

#### Code Splitting

```typescript
// Dynamic imports
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable SSR for client-only components
});

// Route-based code splitting
const Dashboard = dynamic(() => import("./Dashboard"));
```

#### Image Optimization

```tsx
// Next.js Image component
import Image from "next/image";

<Image
  src="/images/task-icon.png"
  alt="Task icon"
  width={50}
  height={50}
  priority={false}
  placeholder="blur"
  blurDataURL="/images/placeholder.png"
/>;
```

#### Font Optimization

```typescript
// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
};
```

### Database Optimization

#### Query Optimization

```typescript
// Efficient queries
export class OptimizedTaskService {
  // Use SELECT specific fields instead of *
  async getTasksSummary() {
    return await db
      .select({
        id: tasks.id,
        title: tasks.title,
        priority: tasks.priority,
        date: tasks.date,
      })
      .from(tasks)
      .limit(100);
  }

  // Use indexes for common queries
  async getTasksByPriority(priority: string) {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.priority, priority))
      .limit(50);
  }

  // Use JOINs efficiently
  async getTasksWithLabels() {
    return await db
      .select()
      .from(tasks)
      .leftJoin(taskLabels, eq(tasks.id, taskLabels.taskId))
      .leftJoin(labels, eq(taskLabels.labelId, labels.id))
      .limit(100);
  }
}
```

#### Caching Strategy

```typescript
// Redis caching example
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export class CachedTaskService {
  async getTasksWithCache() {
    const cacheKey = "tasks:all";
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const tasks = await this.getTasksFromDB();
    await redis.setex(cacheKey, 300, JSON.stringify(tasks)); // Cache for 5 minutes

    return tasks;
  }

  async invalidateTasksCache() {
    await redis.del("tasks:all");
  }
}
```

### State Management Optimization

#### Selective State Updates

```typescript
// Zustand with selective updates
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface TaskState {
  tasks: Task[];
  selectedTaskId: number | null;
  // ... other state
}

export const useTaskStore = create<TaskState>()(
  subscribeWithSelector((set) => ({
    tasks: [],
    selectedTaskId: null,
  }))
);

// Select specific state to avoid unnecessary re-renders
export const useSelectedTask = () =>
  useTaskStore((state) =>
    state.tasks.find((t) => t.id === state.selectedTaskId)
  );
```

#### Virtualization

```tsx
// List virtualization
import { FixedSizeList as List } from "react-window";

const TaskListVirtualized = ({ tasks }: { tasks: Task[] }) => {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <TaskCard task={tasks[index]} />
    </div>
  );

  return (
    <List height={600} itemCount={tasks.length} itemSize={80} width="100%">
      {Row}
    </List>
  );
};
```

### Rendering Optimization

#### Memoization

```typescript
// useMemo for expensive calculations
import { useMemo, useCallback } from "react";

const TaskList = ({ tasks, filter }: { tasks: Task[]; filter: string }) => {
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [tasks, filter]);

  const handleTaskClick = useCallback((taskId: number) => {
    // Handle click
  }, []);

  return (
    <div>
      {filteredTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => handleTaskClick(task.id)}
        />
      ))}
    </div>
  );
};
```

#### Debouncing

```typescript
// Search debouncing
import { useState, useMemo } from "react";

const useDebouncedSearch = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useMemo(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const SearchBar = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedSearch(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);
};
```

## Architecture Patterns

### Component Architecture

#### Atomic Design Pattern

```
src/components/
├── atoms/           # Basic UI elements (Button, Input, Badge)
├── molecules/       # Compound components (SearchBar, FilterBar)
├── organisms/       # Complex components (TaskCard, TaskList)
├── templates/       # Page templates (DashboardTemplate)
└── pages/           # Page components (HomePage, TaskPage)
```

#### Component Composition

```tsx
// Flexible component composition
interface LayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
}

export const Layout = ({ header, sidebar, content, footer }: LayoutProps) => {
  return (
    <div className="layout">
      {header && <header>{header}</header>}
      <div className="main">
        {sidebar && <aside>{sidebar}</aside>}
        <main>{content}</main>
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
};

// Usage
<Layout
  header={<Header />}
  sidebar={<Sidebar />}
  content={<TaskManagement />}
  footer={<Footer />}
/>;
```

### Service Layer Pattern

```typescript
// Service layer structure
src/services/
├── task-service.ts      # Task business logic
├── search-service.ts    # Search functionality
├── label-service.ts     # Label management
├── list-service.ts      # List management
├── file-service.ts      # File upload handling
├── audit-service.ts     # Audit trail management
└── index.ts             # Service exports
```

### Repository Pattern

```typescript
// Repository interface
interface Repository<T> {
  findById(id: number): Promise<T | null>;
  findAll(filters?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}

// Implementation
class TaskRepository implements Repository<Task> {
  async findById(id: number): Promise<Task | null> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || null;
  }

  async findAll(filters?: TaskFilters): Promise<Task[]> {
    let query = db.select().from(tasks);

    if (filters?.priority) {
      query = query.where(eq(tasks.priority, filters.priority));
    }

    return await query.limit(100);
  }

  // ... other methods
}
```

## Contributing Guidelines

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests for your changes**
5. **Run the test suite**
   ```bash
   bun test
   ```
6. **Build and check the application**
   ```bash
   bun run build
   ```
7. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
8. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
9. **Create a pull request**

### Code Review Process

1. **All changes require review** before merging
2. **Use descriptive commit messages**
3. **Ensure tests pass** before submitting
4. **Address all review comments**
5. **Squash commits** before merging (if requested)

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**

```
feat(task-form): add priority selection dropdown

- Add priority enum to Task interface
- Create PrioritySelector component
- Update TaskForm to include priority field
- Add validation for priority field

Closes #123
```

### Pull Request Guidelines

1. **Use a clear and descriptive title**
2. **Reference relevant issues** (e.g., "Fixes #123")
3. **Provide a detailed description** of changes
4. **Include screenshots** for UI changes
5. **List any breaking changes**
6. **Add tests** for new functionality

### Code Quality Standards

1. **All code must be typed** with TypeScript
2. **Pass all linting rules** (ESLint)
3. **Maintain test coverage** above 80%
4. **Follow existing code style** and patterns
5. **Document complex logic** with comments
6. **Update documentation** for API changes

### Issue Reporting

When reporting issues:

1. **Search existing issues** first
2. **Provide a clear title** and description
3. **Include reproduction steps**
4. **Add environment information** (OS, browser, version)
5. **Include error messages** and stack traces
6. **Provide relevant code snippets**

### Security Guidelines

1. **Never commit secrets** or credentials
2. **Use environment variables** for configuration
3. **Validate all user inputs**
4. **Follow secure coding practices**
5. **Report security vulnerabilities** privately

---

This developer guide provides comprehensive information for working on the project. For additional questions or support, please reach out to the development team or create an issue in the repository.
