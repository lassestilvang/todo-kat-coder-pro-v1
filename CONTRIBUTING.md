# Contributing to Next.js Daily Task Planner

Thank you for considering contributing to the Next.js Daily Task Planner! We welcome contributions from everyone. This guide will help you understand how to contribute effectively.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Submitting Changes](#submitting-changes)
7. [Issue Reporting](#issue-reporting)
8. [Feature Requests](#feature-requests)
9. [Documentation](#documentation)
10. [Community Guidelines](#community-guidelines)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful in all interactions and follow these guidelines:

- Be respectful and inclusive
- Be collaborative and constructive
- Be empathetic and patient
- Focus on what is best for the community
- Show courtesy and respect in all interactions

**Unacceptable Behavior:**

- Harassment or offensive comments
- Personal attacks or trolling
- Deliberate intimidation or threats
- Any behavior that violates these principles

## How to Contribute

### Quick Start

1. **Fork the repository**

   - Click the "Fork" button on GitHub
   - Clone your fork locally

2. **Set up your development environment**

   ```bash
   git clone https://github.com/your-username/todo-kat-coder-pro-v1.git
   cd todo-kat-coder-pro-v1
   bun install
   ```

3. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**

   - Follow coding standards
   - Write tests
   - Update documentation

5. **Submit a pull request**
   - Push to your fork
   - Create PR on GitHub

### Types of Contributions

We welcome various types of contributions:

- **Code Contributions**: New features, bug fixes, refactoring
- **Documentation**: Guides, tutorials, API documentation
- **Testing**: Unit tests, integration tests, E2E tests
- **Design**: UI/UX improvements, accessibility enhancements
- **Community**: Answering questions, helping other contributors

## Development Setup

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **Bun**: Version 1.0 or higher
- **Git**: Version 2.0 or higher
- **SQLite**: Version 3 or higher

### Initial Setup

1. **Clone and Install**

   ```bash
   git clone https://github.com/your-username/todo-kat-coder-pro-v1.git
   cd todo-kat-coder-pro-v1
   bun install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Database Setup**

   ```bash
   bun run migrate
   ```

4. **Start Development Server**
   ```bash
   bun dev
   ```

### Development Tools

#### IDE Configuration

**VS Code Extensions:**

- ESLint
- Prettier
- TypeScript Importer
- Drizzle Studio
- SQLite Viewer

**Recommended Settings:**

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### Development Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `bun dev`          | Start development server |
| `bun build`        | Build for production     |
| `bun start`        | Start production server  |
| `bun test`         | Run tests                |
| `bun test --watch` | Run tests in watch mode  |
| `bun lint`         | Run ESLint               |
| `bun typecheck`    | Run TypeScript checking  |
| `bun migrate`      | Run database migrations  |

## Coding Standards

### TypeScript Guidelines

#### Strict Mode

All code must use TypeScript strict mode:

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

- Always provide explicit type annotations
- Use interfaces for object definitions
- Use type aliases for complex types
- Prefer readonly for immutable properties

```typescript
// Good
interface Task {
  readonly id: number;
  title: string;
  priority: TaskPriority;
  readonly createdAt: Date;
}

// Avoid
type Task = {
  id: any;
  title: string;
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
}
```

## Testing

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

## Submitting Changes

### Pull Request Guidelines

1. **Before Submitting**

   - Ensure all tests pass
   - Run linting and type checking
   - Update documentation if needed
   - Squash commits (if requested)

2. **Pull Request Template**

   ```markdown
   ## Summary

   Brief description of changes

   ## Test plan

   - [ ] Test A
   - [ ] Test B
   - [ ] Test C

   ## Documentation

   - [ ] Documentation updated
   - [ ] Examples updated
   - [ ] Changelog updated

   ## Type of change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   ```

### Commit Message Format

Use conventional commit format:

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

**Examples:**

```
feat(task-form): add priority selection dropdown

- Add priority enum to Task interface
- Create PrioritySelector component
- Update TaskForm to include priority field
- Add validation for priority field

Closes #123
```

```
fix(api): resolve task creation validation error

- Fix validation schema for task creation
- Add proper error handling
- Update error messages

Fixes #456
```

### Code Review Process

1. **Automated Checks**

   - Tests must pass
   - Linting must pass
   - Type checking must pass

2. **Manual Review**

   - At least one maintainer approval required
   - Address all review comments
   - Ensure code quality and best practices

3. **Merge Requirements**
   - All checks passing
   - Required approvals obtained
   - Branch up to date with main

## Issue Reporting

### Before Reporting an Issue

1. **Search existing issues**

   - Check if the issue already exists
   - Look for similar problems

2. **Check documentation**

   - Review README and guides
   - Check FAQ section

3. **Try to reproduce**
   - Ensure issue is reproducible
   - Test with latest version

### How to Report Issues

1. **Use the appropriate issue template**

   - Bug report
   - Feature request
   - Question/Help

2. **Provide detailed information**

   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment information
   - Error messages and logs

3. **Include supporting materials**
   - Screenshots
   - Code examples
   - Videos (if helpful)

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment info**

- OS: [e.g. macOS, Windows]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
- Node.js version: [e.g. 18.0.0]

**Additional context**
Add any other context about the problem here.
```

## Feature Requests

### How to Request Features

1. **Search existing requests**

   - Check if feature already requested
   - Look for similar features

2. **Create feature request**

   - Use feature request template
   - Provide detailed description
   - Explain use case and benefits

3. **Community feedback**
   - Gather community support
   - Discuss implementation details
   - Consider alternative solutions

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**Example Use Case**
Provide a real-world example of how this feature would be used.
```

### Feature Implementation Process

1. **Idea Discussion**

   - Community feedback
   - Feasibility assessment
   - Priority determination

2. **Design Phase**

   - Technical specifications
   - API design
   - UI/UX considerations

3. **Implementation**

   - Development
   - Testing
   - Documentation

4. **Review and Merge**
   - Code review
   - Testing
   - Documentation review

## Documentation

### Documentation Guidelines

1. **Keep documentation up to date**

   - Update docs with code changes
   - Review existing documentation
   - Fix outdated information

2. **Write clear and concise docs**

   - Use simple language
   - Provide examples
   - Include code snippets

3. **Follow documentation structure**
   - Use proper headings
   - Organize content logically
   - Use consistent formatting

### Documentation Types

1. **API Documentation**

   - Function signatures
   - Parameter descriptions
   - Return values
   - Examples

2. **User Guides**

   - Step-by-step instructions
   - Use cases
   - Best practices

3. **Developer Guides**

   - Setup instructions
   - Architecture documentation
   - Contributing guidelines

4. **Changelog**
   - Version history
   - Breaking changes
   - New features
   - Bug fixes

### Writing Documentation

````typescript
/**
 * Fetches tasks from the API with optional filters.
 *
 * @param filters - Optional filters to apply to the task query
 * @param options - Additional options for the request
 * @returns Promise resolving to an array of tasks
 *
 * @example
 * ```typescript
 * const tasks = await fetchTasks({ priority: 'high', status: 'pending' });
 * console.log(tasks);
 * ```
 *
 * @example
 * ```typescript
 * const allTasks = await fetchTasks();
 * ```
 */
export async function fetchTasks(
  filters?: TaskFilters,
  options?: FetchOptions
): Promise<Task[]> {
  // Implementation
}
````

## Community Guidelines

### Communication Channels

1. **GitHub Issues**

   - Bug reports
   - Feature requests
   - Technical discussions

2. **Pull Requests**

   - Code contributions
   - Documentation improvements
   - Test additions

3. **Discussions**

   - Questions and answers
   - Community help
   - General discussions

4. **Community Chat**
   - Real-time discussions
   - Collaboration
   - Social interactions

### Community Expectations

1. **Be Respectful**

   - Treat others with kindness
   - Respect different opinions
   - Avoid personal attacks

2. **Be Helpful**

   - Answer questions when you can
   - Help new contributors
   - Share knowledge and experience

3. **Be Inclusive**

   - Welcome diverse perspectives
   - Use inclusive language
   - Avoid exclusionary behavior

4. **Be Constructive**
   - Provide helpful feedback
   - Focus on solutions
   - Avoid negativity

### Maintainer Responsibilities

1. **Code Review**

   - Review pull requests promptly
   - Provide constructive feedback
   - Ensure code quality

2. **Issue Management**

   - Respond to issues
   - Label and categorize
   - Close resolved issues

3. **Community Engagement**

   - Participate in discussions
   - Help new contributors
   - Foster positive community

4. **Project Maintenance**
   - Update dependencies
   - Fix critical bugs
   - Plan future releases

### Recognition and Rewards

We recognize and appreciate contributions through:

- **GitHub contributions graph**
- **Special recognition in releases**
- **Feature naming**
- **Community shoutouts**
- **Mentorship opportunities**

### Getting Help

If you need help or have questions:

1. **Check Documentation**

   - README.md
   - docs/ directory
   - API documentation

2. **Search Issues**

   - Existing bug reports
   - Feature requests
   - Questions

3. **Ask the Community**

   - GitHub Discussions
   - Community chat
   - Stack Overflow

4. **Contact Maintainers**
   - GitHub issues
   - Email (if available)
   - Community channels

---

Thank you for contributing to the Next.js Daily Task Planner! Together, we can build an amazing task management application that helps people be more productive and organized.
