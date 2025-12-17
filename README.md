# Next.js Daily Task Planner

A modern, feature-rich task management application built with Next.js, TypeScript, and SQLite. Designed for productivity with advanced features like recurring tasks, labels, attachments, and comprehensive search capabilities.

## 🚀 Features

### Core Task Management

- **Create, Read, Update, Delete** tasks with full CRUD operations
- **Priority System**: Categorize tasks by priority (None, Low, Medium, High)
- **Due Dates & Deadlines**: Set and track task deadlines with time precision
- **Time Tracking**: Estimate and track actual time spent on tasks
- **Task Completion**: Mark tasks as complete with timestamp tracking

### Advanced Features

- **Recurring Tasks**: Support for daily, weekly, weekday, monthly, yearly, and custom recurrence patterns
- **Labels & Categories**: Organize tasks with customizable labels
- **Sub-tasks**: Break down complex tasks into manageable sub-tasks
- **Attachments**: Upload and manage file attachments for tasks
- **Audit Trail**: Automatic tracking of all task changes and modifications

### Smart Organization

- **Multiple Views**: Today, Next 7 Days, Upcoming, All, and Inbox views
- **Advanced Search**: Full-text search with filters by priority, status, date, and labels
- **Smart Filtering**: Quick filters for common task management patterns
- **Task Lists**: Organize tasks into customizable lists

### User Experience

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Automatic theme switching with system preference detection
- **Real-time Updates**: Live updates across all views and components
- **Smooth Animations**: Polished user interface with Framer Motion animations
- **Offline Support**: Works offline with automatic sync when back online

### Technical Excellence

- **Type Safety**: Full TypeScript support with strict type checking
- **State Management**: Modern Zustand-based state management
- **Form Validation**: Robust form validation with Zod
- **Performance**: Optimized performance with virtualization and caching
- **Testing**: Comprehensive test suite with Bun Test

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript with React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand with Immer
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & Data

- **Database**: SQLite with Drizzle ORM
- **API**: Next.js API Routes
- **File Storage**: Local file system with secure upload handling
- **Search**: Full-text search with SQLite FTS5

### Development Tools

- **Testing**: Bun Test
- **Linting**: ESLint with TypeScript rules
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Bun

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── tasks/         # Task CRUD endpoints
│   │   ├── lists/         # List management endpoints
│   │   ├── labels/        # Label management endpoints
│   │   ├── attachments/   # File attachment endpoints
│   │   ├── subtasks/      # Sub-task endpoints
│   │   ├── search/        # Search functionality
│   │   └── stats/         # Statistics endpoints
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Main application page
│   └── dashboard/         # Dashboard view
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── layout/           # Layout components (Header, Sidebar)
│   ├── views/            # View components (Today, All, etc.)
│   ├── TaskCard.tsx      # Individual task display
│   ├── TaskList.tsx      # Task list component
│   ├── TaskForm.tsx      # Task creation/editing form
│   ├── SearchBar.tsx     # Search interface
│   └── FilterBar.tsx     # Filter controls
├── lib/                  # Utilities and core logic
│   ├── db.ts             # Database connection
│   ├── schema.ts         # Database schema definitions
│   ├── db-service.ts     # Database service layer
│   ├── utils.ts          # Utility functions
│   ├── validation.ts     # Form validation schemas
│   └── migrate.ts        # Database migrations
├── services/             # Business logic services
│   ├── task-service.ts   # Task business logic
│   ├── search-service.ts # Search functionality
│   ├── label-service.ts  # Label management
│   ├── list-service.ts   # List management
│   ├── file-service.ts   # File upload handling
│   └── audit-service.ts  # Audit trail management
├── store/                # Zustand state management
│   ├── taskStore.ts      # Task state
│   ├── listStore.ts      # List state
│   ├── labelStore.ts     # Label state
│   ├── uiStore.ts        # UI state
│   ├── searchStore.ts    # Search state
│   ├── viewStore.ts      # View state
│   ├── formStore.ts      # Form state
│   └── index.ts          # Store exports
├── hooks/                # Custom React hooks
│   ├── useFormValidation.ts  # Form validation hook
│   ├── useDebounce.ts        # Debouncing hook
│   └── useTheme.ts           # Theme management hook
├── types/                # TypeScript type definitions
│   ├── task.ts           # Task-related types
│   ├── api.ts            # API types
│   ├── forms.ts          # Form types
│   ├── components.ts     # Component types
│   └── utils.ts          # Utility types
├── __tests__/            # Test files
│   ├── task.test.ts      # Task component tests
│   └── utils.test.ts     # Utility function tests
└── styles/               # Global styles
    └── globals.css       # Tailwind imports and globals
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- Bun 1.0 or higher
- SQLite 3

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd todo-kat-coder-pro-v1
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Start the development server:**

   ```bash
   bun dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Docker Setup

For containerized deployment:

```bash
# Build the image
docker build -t todo-planner .

# Run the container
docker run -p 3000:3000 todo-planner
```

## 📖 Usage Guide

### Creating Your First Task

1. Click the "Add Task" button
2. Fill in the task details:
   - **Title**: Task name (required)
   - **Description**: Detailed task description
   - **Priority**: Set task priority
   - **Date**: Task date
   - **Deadline**: Optional deadline with time
   - **Time Estimate**: Estimated time to complete
3. Click "Save Task" to create

### Organizing Tasks

- **Lists**: Create lists to categorize your tasks (e.g., "Work", "Personal")
- **Labels**: Add labels for additional categorization (e.g., "Urgent", "Review")
- **Sub-tasks**: Break complex tasks into smaller steps

### Managing Recurring Tasks

Set up recurring tasks for regular activities:

- **Daily**: Every day
- **Weekly**: Same day each week
- **Weekday**: Monday through Friday
- **Monthly**: Same date each month
- **Yearly**: Same date each year
- **Custom**: Define custom intervals

### Using Views

Switch between different views to focus on specific task sets:

- **Today**: Tasks due today
- **Next 7 Days**: Tasks due in the next week
- **Upcoming**: Tasks due in the future
- **All**: All tasks regardless of date
- **Inbox**: Unorganized tasks

### Search and Filter

Use the search bar and filters to find specific tasks:

- **Search**: Full-text search across all task fields
- **Priority Filter**: Show tasks by priority level
- **Status Filter**: Show completed or pending tasks
- **List Filter**: Filter by specific lists
- **Label Filter**: Filter by labels

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=file:./sqlite.db

# Application
NEXT_PUBLIC_APP_NAME="Daily Task Planner"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=application/pdf,image/*,text/*

# Search
SEARCH_DEBOUNCE_MS=300
```

### Database Configuration

The application uses SQLite by default. To use a different database:

1. Install the appropriate Drizzle ORM driver
2. Update the database connection in `src/lib/db.ts`
3. Update the schema definitions if needed

### Theme Customization

Customize the application theme by modifying `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#...",
          100: "#...",
          // ... more color shades
        },
      },
    },
  },
};
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/__tests__/task.test.ts

# Run tests with coverage
bun test --coverage
```

### Writing Tests

When adding new features, include tests following these patterns:

```typescript
import { describe, it, expect } from "bun:test";

describe("Feature Name", () => {
  it("should do something", () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

## 🚀 Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy!

### Docker Deployment

```bash
# Build production image
docker build --target production -t todo-planner:prod .

# Run with persistent storage
docker run -p 3000:3000 \
  -v todo-data:/app/data \
  todo-planner:prod
```

### Manual Deployment

1. Build the application:

   ```bash
   bun run build
   ```

2. Start the production server:
   ```bash
   bun start
   ```

## 🔍 API Reference

### Tasks API

#### GET /api/tasks

Retrieve all tasks with optional filtering

**Query Parameters:**

- `priority`: Filter by priority (none, low, medium, high)
- `status`: Filter by completion status (all, pending, completed)
- `listId`: Filter by list ID
- `search`: Full-text search query

**Response:**

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Task Title",
      "description": "Task description",
      "priority": "high",
      "date": "2024-01-01",
      "deadline": "2024-01-01T17:00:00",
      "isCompleted": false,
      "completedAt": null,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### POST /api/tasks

Create a new task

**Request Body:**

```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "medium",
  "date": "2024-01-01",
  "deadline": "2024-01-01T17:00:00",
  "estimateHours": 2,
  "estimateMinutes": 30,
  "listId": 1,
  "labels": [1, 2],
  "isRecurring": false,
  "recurrenceType": null,
  "recurrenceInterval": null,
  "recurrenceEndDate": null,
  "reminders": [
    {
      "type": "time",
      "value": "1 hour before"
    }
  ]
}
```

#### PUT /api/tasks/:id

Update a task

#### DELETE /api/tasks/:id

Delete a task

### Lists API

#### GET /api/lists

Retrieve all lists

#### POST /api/lists

Create a new list

#### PUT /api/lists/:id

Update a list

#### DELETE /api/lists/:id

Delete a list

### Labels API

#### GET /api/labels

Retrieve all labels

#### POST /api/labels

Create a new label

#### PUT /api/labels/:id

Update a label

#### DELETE /api/labels/:id

Delete a label

### Search API

#### GET /api/search

Advanced search across all tasks

**Query Parameters:**

- `q`: Search query
- `priority`: Filter by priority
- `status`: Filter by status
- `listId`: Filter by list
- `labelId`: Filter by label
- `dateFrom`: Start date filter
- `dateTo`: End date filter

## 🎨 Theming

The application supports automatic theme switching based on system preferences. You can also manually toggle themes using the theme toggle button.

### Custom Theme Colors

Modify `tailwind.config.ts` to customize the color scheme:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom colors
        brand: {
          50: "#f8fafc",
          100: "#f1f5f9",
          // ... more shades
        },
      },
    },
  },
};
```

## 📱 Responsive Design

The application is fully responsive and works on all device sizes:

- **Mobile**: Optimized touch interface with collapsible sidebar
- **Tablet**: Balanced layout with adaptive components
- **Desktop**: Full feature set with side-by-side layouts

## 🔒 Security

The application includes several security measures:

- **Input Validation**: All user inputs are validated and sanitized
- **File Upload Security**: File type validation and size limits
- **SQL Injection Protection**: Drizzle ORM prevents SQL injection
- **XSS Protection**: React automatically escapes content

## 📊 Performance

Optimized for performance with:

- **Virtualization**: Large lists use virtualization
- **Caching**: Strategic caching of API responses
- **Lazy Loading**: Components load on demand
- **Bundle Splitting**: Code splitting for faster loading

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Run the test suite
6. Submit a pull request

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Write meaningful commit messages
- Include tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Drizzle ORM team for the type-safe database solution
- shadcn/ui for the beautiful component library
- All contributors and testers

## 📞 Support

If you encounter any issues or have questions:

1. Check the [FAQ](#faq)
2. Search existing [issues](https://github.com/your-repo/issues)
3. [Open a new issue](https://github.com/your-repo/issues/new)
4. Join our [Discord community](https://discord.gg/your-invite)

## 📚 Additional Documentation

- [API Documentation](docs/api-endpoints.md)
- [Database Setup](docs/database-setup.md)
- [Advanced Search & Filtering](docs/advanced-search-filtering.md)
- [Developer Guide](docs/developer-guide.md)
- [User Guide](docs/user-guide.md)
- [Architecture Documentation](docs/architecture.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Changelog](CHANGELOG.md)

## 🤔 FAQ

### How do I backup my data?

The application stores data in `sqlite.db` in the project root. Simply copy this file to backup your data.

### Can I use a different database?

Yes, you can configure the application to use PostgreSQL, MySQL, or other databases supported by Drizzle ORM.

### How do recurring tasks work?

Recurring tasks create new instances based on the recurrence pattern. When you complete a recurring task, a new instance is automatically created according to the schedule.

### Is the application secure?

Yes, the application includes multiple security measures including input validation, SQL injection protection, and file upload security.

### How can I contribute?

Please see our [Contributing Guide](CONTRIBUTING.md) for detailed instructions on how to contribute to the project.

---

**Note**: This application is a work in progress. Features and APIs may change as we continue development.
