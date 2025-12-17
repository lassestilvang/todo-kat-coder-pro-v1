# Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Next.js daily task planner application. The strategy follows modern testing practices with a focus on reliability, maintainability, and developer confidence. We use Bun test runner for all testing needs.

## Testing Philosophy

### Testing Pyramid

```
    E2E Tests (10%)
   /                 \
  /    Integration    \
 /       Tests       \
/        (30%)        \
-----------------------
|   Unit Tests (60%)  |
-----------------------
```

### Testing Principles

1. **Fast Feedback**: Tests should run quickly to provide immediate feedback
2. **Isolation**: Tests should be independent and not rely on external state
3. **Reproducibility**: Tests should produce consistent results
4. **Maintainability**: Tests should be easy to understand and update
5. **Coverage**: Aim for meaningful coverage, not just high percentages

## Testing Tools and Setup

### Test Runner

- **Primary**: Bun test runner
- **Framework**: Built-in Bun testing utilities
- **Assertion Library**: Bun's built-in assertions
- **Mocking**: Bun's built-in mocking capabilities

### Configuration

```typescript
// bun.config.ts
export default {
  test: {
    include: ["**/*.{test,spec}.{js,ts,tsx}"],
    exclude: ["node_modules", "dist", "build"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "build/",
        "**/*.d.ts",
        "**/*.config.*",
      ],
    },
  },
};
```

### Test Utilities

```typescript
// tests/utils/test-utils.tsx
import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { setupStore } from "@/lib/store";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

// Create test store
const createTestStore = (preloadedState?: Partial<RootState>) => {
  return setupStore(preloadedState);
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof createTestStore>;
  queryClient?: QueryClient;
}

function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={options.queryClient || new QueryClient()}>
      <Provider store={store}>
        <ThemeProvider>{children}</ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from "@testing-library/react";
export { customRender as render };
```

## Unit Testing

### Component Testing

#### Testing Library Setup

```typescript
// tests/unit/components/TaskCard.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@/tests/utils/test-utils";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Task } from "@/lib/types/task";

const mockTask: Task = {
  id: "1",
  title: "Test Task",
  description: "Test Description",
  status: "pending",
  priority: "medium",
  isCompleted: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  order: 0,
  listId: "1",
};

describe("TaskCard", () => {
  const defaultProps = {
    task: mockTask,
    onToggleComplete: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders task title and description", () => {
    render(<TaskCard {...defaultProps} />);

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("calls onToggleComplete when checkbox is clicked", () => {
    render(<TaskCard {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(defaultProps.onToggleComplete).toHaveBeenCalledWith("1", true);
  });

  it("shows priority badge", () => {
    render(<TaskCard {...defaultProps} />);

    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("handles overdue tasks", () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date(Date.now() - 86400000), // Yesterday
    };

    render(<TaskCard {...defaultProps} task={overdueTask} />);

    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });
});
```

#### Hook Testing

```typescript
// tests/unit/hooks/useTasks.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useTasks } from "@/lib/hooks/useTasks";
import { taskService } from "@/lib/services/taskService";

// Mock the service
jest.mock("@/lib/services/taskService");

const mockTaskService = taskService as jest.Mocked<typeof taskService>;

describe("useTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches tasks successfully", async () => {
    const mockTasks = [{ id: "1", title: "Test Task", status: "pending" }];

    mockTaskService.getAllTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });
  });

  it("handles fetch errors", async () => {
    mockTaskService.getAllTasks.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to fetch tasks");
    });
  });
});
```

#### Utility Function Testing

```typescript
// tests/unit/utils/dateUtils.test.ts
import { formatDate, isOverdue, getDaysUntilDue } from "@/lib/utils/dateUtils";

describe("dateUtils", () => {
  describe("formatDate", () => {
    it("formats date correctly", () => {
      const date = new Date("2023-12-25T10:00:00Z");
      expect(formatDate(date)).toBe("Dec 25, 2023");
    });

    it("handles invalid dates", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
    });
  });

  describe("isOverdue", () => {
    it("returns true for overdue tasks", () => {
      const dueDate = new Date(Date.now() - 86400000); // Yesterday
      expect(isOverdue(dueDate)).toBe(true);
    });

    it("returns false for future tasks", () => {
      const dueDate = new Date(Date.now() + 86400000); // Tomorrow
      expect(isOverdue(dueDate)).toBe(false);
    });
  });

  describe("getDaysUntilDue", () => {
    it("calculates days until due date", () => {
      const dueDate = new Date(Date.now() + 86400000 * 3); // 3 days from now
      expect(getDaysUntilDue(dueDate)).toBe(3);
    });

    it("returns 0 for past due dates", () => {
      const dueDate = new Date(Date.now() - 86400000); // Yesterday
      expect(getDaysUntilDue(dueDate)).toBe(0);
    });
  });
});
```

### Service Testing

```typescript
// tests/unit/services/taskService.test.ts
import { taskService } from "@/lib/services/taskService";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

// Mock the database
jest.mock("@/lib/db");

const mockDb = db as jest.Mocked<typeof db>;

describe("taskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllTasks", () => {
    it("returns all tasks", async () => {
      const mockTasks = [
        { id: "1", title: "Task 1" },
        { id: "2", title: "Task 2" },
      ];

      mockDb.query.tasks.findMany.mockResolvedValue(mockTasks);

      const result = await taskService.getAllTasks();

      expect(result).toEqual(mockTasks);
      expect(mockDb.query.tasks.findMany).toHaveBeenCalled();
    });
  });

  describe("createTask", () => {
    it("creates a new task", async () => {
      const taskData = { title: "New Task", listId: "1" };
      const createdTask = { id: "3", ...taskData };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([createdTask]),
      });

      const result = await taskService.createTask(taskData);

      expect(result).toEqual(createdTask);
    });
  });

  describe("updateTask", () => {
    it("updates an existing task", async () => {
      const updateData = { title: "Updated Task" };
      const updatedTask = { id: "1", ...updateData };

      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([updatedTask]),
      });

      const result = await taskService.updateTask("1", updateData);

      expect(result).toEqual(updatedTask);
    });
  });

  describe("deleteTask", () => {
    it("deletes a task", async () => {
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      await expect(taskService.deleteTask("1")).resolves.toBeUndefined();

      expect(mockDb.delete).toHaveBeenCalledWith(tasks);
    });
  });
});
```

## Integration Testing

### API Route Testing

```typescript
// tests/integration/api/tasks.test.ts
import { describe, expect, it, beforeEach } from "bun:test";
import { createMocks } from "node-mocks-http";
import { GET, POST } from "@/app/api/tasks/route";
import { db } from "@/lib/db";

describe("/api/tasks", () => {
  beforeEach(async () => {
    // Clean up database
    await db.delete(tasks);
  });

  describe("GET /api/tasks", () => {
    it("returns all tasks", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("supports filtering by list", async () => {
      const { req } = createMocks({
        method: "GET",
        url: "/api/tasks?listId=1",
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("POST /api/tasks", () => {
    it("creates a new task", async () => {
      const taskData = {
        title: "Test Task",
        listId: "1",
        priority: "medium",
      };

      const { req } = createMocks({
        method: "POST",
        body: taskData,
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe("Test Task");
    });

    it("validates required fields", async () => {
      const { req } = createMocks({
        method: "POST",
        body: {},
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
```

### Database Integration Testing

```typescript
// tests/integration/db/tasks.test.ts
import { describe, expect, it, beforeEach } from "bun:test";
import { db } from "@/lib/db";
import { tasks, lists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

describe("Database Integration - Tasks", () => {
  beforeEach(async () => {
    // Clean up
    await db.delete(tasks);
    await db.delete(lists);
  });

  it("creates and retrieves a task", async () => {
    // Create a list first
    const [list] = await db
      .insert(lists)
      .values({
        id: "1",
        name: "Test List",
        color: "#3B82F6",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create a task
    const [task] = await db
      .insert(tasks)
      .values({
        id: "1",
        title: "Test Task",
        listId: list.id,
        status: "pending",
        priority: "medium",
        isCompleted: false,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Retrieve the task
    const retrievedTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, task.id),
    });

    expect(retrievedTask).toBeDefined();
    expect(retrievedTask?.title).toBe("Test Task");
    expect(retrievedTask?.listId).toBe(list.id);
  });

  it("supports task relationships", async () => {
    // Test with relations
    const taskWithRelations = await db.query.tasks.findMany({
      with: {
        list: true,
      },
    });

    expect(Array.isArray(taskWithRelations)).toBe(true);
  });
});
```

## End-to-End Testing

### Playwright Setup

```typescript
// tests/e2e/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
});
```

### E2E Test Examples

```typescript
// tests/e2e/tasks.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Task Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for the app to load
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
  });

  test("creates a new task", async ({ page }) => {
    // Click on new task button
    await page.click('[data-testid="new-task-button"]');

    // Fill out the form
    await page.fill('[data-testid="task-title-input"]', "Test Task");
    await page.fill(
      '[data-testid="task-description-input"]',
      "Test Description"
    );

    // Select priority
    await page.selectOption('[data-testid="task-priority-select"]', "medium");

    // Set due date
    await page.fill('[data-testid="task-due-date-input"]', "2023-12-25");

    // Submit the form
    await page.click('[data-testid="submit-task-button"]');

    // Verify task was created
    await expect(page.locator('[data-testid="task-card"]')).toContainText(
      "Test Task"
    );
    await expect(page.locator('[data-testid="task-card"]')).toContainText(
      "Test Description"
    );
  });

  test("completes a task", async ({ page }) => {
    // Create a task first
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-title-input"]', "Task to Complete");
    await page.click('[data-testid="submit-task-button"]');

    // Find and complete the task
    const taskCard = page
      .locator('[data-testid="task-card"]')
      .filter({ hasText: "Task to Complete" });
    await taskCard.locator('[data-testid="task-checkbox"]').check();

    // Verify task is marked as completed
    await expect(taskCard).toHaveClass(/completed/);
  });

  test("filters tasks by priority", async ({ page }) => {
    // Create tasks with different priorities
    const priorities = ["low", "medium", "high", "urgent"];

    for (const priority of priorities) {
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', `Task ${priority}`);
      await page.selectOption('[data-testid="task-priority-select"]', priority);
      await page.click('[data-testid="submit-task-button"]');
    }

    // Filter by high priority
    await page.selectOption('[data-testid="priority-filter"]', "high");

    // Verify only high priority tasks are shown
    const taskCards = page.locator('[data-testid="task-card"]');
    for (let i = 0; i < (await taskCards.count()); i++) {
      await expect(taskCards.nth(i)).toContainText("High");
    }
  });

  test("searches for tasks", async ({ page }) => {
    // Create some tasks
    const taskTitles = ["Shopping List", "Work Project", "Personal Goals"];

    for (const title of taskTitles) {
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', title);
      await page.click('[data-testid="submit-task-button"]');
    }

    // Search for "Work"
    await page.fill('[data-testid="search-input"]', "Work");

    // Verify only matching tasks are shown
    await expect(page.locator('[data-testid="task-card"]')).toContainText(
      "Work Project"
    );
    await expect(page.locator('[data-testid="task-card"]')).not.toContainText(
      "Shopping List"
    );
  });
});
```

### List Management E2E Tests

```typescript
// tests/e2e/lists.spec.ts
import { test, expect } from "@playwright/test";

test.describe("List Management", () => {
  test("creates a new list", async ({ page }) => {
    await page.goto("/");

    // Open new list modal
    await page.click('[data-testid="new-list-button"]');

    // Fill out form
    await page.fill('[data-testid="list-name-input"]', "My New List");
    await page.fill('[data-testid="list-color-input"]', "#FF5733");

    // Submit
    await page.click('[data-testid="submit-list-button"]');

    // Verify list was created
    await expect(page.locator('[data-testid="list-sidebar"]')).toContainText(
      "My New List"
    );
  });

  test("edits a list", async ({ page }) => {
    // Create a list first
    await page.click('[data-testid="new-list-button"]');
    await page.fill('[data-testid="list-name-input"]', "Original Name");
    await page.click('[data-testid="submit-list-button"]');

    // Edit the list
    await page
      .click('[data-testid="list-card"]')
      .filter({ hasText: "Original Name" });
    await page.click('[data-testid="edit-list-button"]');
    await page.fill('[data-testid="list-name-input"]', "Updated Name");
    await page.click('[data-testid="submit-list-button"]');

    // Verify update
    await expect(page.locator('[data-testid="list-sidebar"]')).toContainText(
      "Updated Name"
    );
  });
});
```

## Visual Regression Testing

```typescript
// tests/visual/tasks.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Visual Regression - Tasks", () => {
  test("task card appearance", async ({ page }) => {
    await page.goto("/tasks");

    // Create a task for testing
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-title-input"]', "Visual Test Task");
    await page.selectOption('[data-testid="task-priority-select"]', "urgent");
    await page.click('[data-testid="submit-task-button"]');

    // Take screenshot of task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toHaveScreenshot("urgent-task-card.png");
  });

  test("empty state appearance", async ({ page }) => {
    await page.goto("/tasks");

    // Ensure no tasks exist
    await expect(page.locator('[data-testid="empty-state"]')).toHaveScreenshot(
      "empty-state.png"
    );
  });
});
```

## Performance Testing

```typescript
// tests/performance/tasks.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Performance - Tasks", () => {
  test("loads tasks quickly", async ({ page }) => {
    // Create many tasks
    for (let i = 0; i < 100; i++) {
      await page.goto("/tasks/new");
      await page.fill('[data-testid="task-title-input"]', `Task ${i}`);
      await page.click('[data-testid="submit-task-button"]');
    }

    // Measure load time
    const startTime = Date.now();
    await page.goto("/tasks");
    await page.waitForSelector('[data-testid="task-card"]');
    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("search performance", async ({ page }) => {
    // Create many tasks for search testing
    for (let i = 0; i < 50; i++) {
      await page.goto("/tasks/new");
      await page.fill(
        '[data-testid="task-title-input"]',
        `Searchable Task ${i}`
      );
      await page.click('[data-testid="submit-task-button"]');
    }

    await page.goto("/tasks");

    // Measure search time
    const startTime = Date.now();
    await page.fill('[data-testid="search-input"]', "Searchable");
    await page.waitForSelector('[data-testid="task-card"]');
    const searchTime = Date.now() - startTime;

    // Should search in under 1 second
    expect(searchTime).toBeLessThan(1000);
  });
});
```

## Test Data Management

### Factories

```typescript
// tests/factories/index.ts
import { Task, List, Label } from "@/lib/types";

export const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: crypto.randomUUID(),
  title: "Test Task",
  description: "Test Description",
  status: "pending",
  priority: "medium",
  isCompleted: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  order: 0,
  ...overrides,
});

export const createList = (overrides: Partial<List> = {}): List => ({
  id: crypto.randomUUID(),
  name: "Test List",
  color: "#3B82F6",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  order: 0,
  ...overrides,
});

export const createLabel = (overrides: Partial<Label> = {}): Label => ({
  id: crypto.randomUUID(),
  name: "Test Label",
  color: "#10B981",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});
```

### Fixtures

```typescript
// tests/fixtures/tasks.ts
export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete project proposal",
    description: "Write and submit the Q4 project proposal",
    status: "in_progress",
    priority: "high",
    dueDate: new Date("2023-12-15"),
    estimatedTime: 120,
    isCompleted: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 43200000,
    order: 0,
    listId: "1",
  },
  {
    id: "2",
    title: "Team meeting",
    description: "Weekly team sync meeting",
    status: "pending",
    priority: "medium",
    dueDate: new Date("2023-12-14"),
    isCompleted: false,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
    order: 1,
    listId: "1",
  },
];
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: "bun"

      - name: Install dependencies
        run: bun install

      - name: Run linting
        run: bun lint

      - name: Run type checking
        run: bun typecheck

      - name: Run unit tests
        run: bun test:unit

      - name: Run integration tests
        run: bun test:integration

      - name: Run E2E tests
        run: bun test:e2e

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

### Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "bun test",
    "test:unit": "bun test --testPathPattern=unit",
    "test:integration": "bun test --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:coverage": "bun test --coverage",
    "test:watch": "bun test --watch",
    "test:ci": "bun test --coverage --ci"
  }
}
```

This comprehensive testing strategy ensures the application is reliable, maintainable, and provides confidence in the codebase while following modern testing best practices.
