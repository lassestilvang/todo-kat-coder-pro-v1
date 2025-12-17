# API Endpoints Documentation

This document provides comprehensive documentation for all API endpoints in the daily task planner application.

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Rate Limiting](#rate-limiting)
4. [Tasks API](#tasks-api)
5. [Lists API](#lists-api)
6. [Labels API](#labels-api)
7. [Attachments API](#attachments-api)
8. [Sub-tasks API](#sub-tasks-api)
9. [Search API](#search-api)
10. [Views API](#views-api)
11. [Stats API](#stats-api)
12. [Task Changes API](#task-changes-api)
13. [Best Practices](#best-practices)

## Authentication

The API uses session-based authentication. Users must be logged in to access any endpoints.

**Authentication Header:**

```
Cookie: session=your-session-token
```

**Response for Unauthenticated Requests:**

```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED",
  "status": 401
}
```

## Error Handling

All API endpoints follow a consistent error response format:

### Error Response Format

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "status": 400,
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

| Code                    | Status | Description                           |
| ----------------------- | ------ | ------------------------------------- |
| `UNAUTHORIZED`          | 401    | Authentication required or invalid    |
| `FORBIDDEN`             | 403    | Access denied                         |
| `NOT_FOUND`             | 404    | Resource not found                    |
| `VALIDATION_ERROR`      | 400    | Invalid request data                  |
| `DUPLICATE_TASK`        | 409    | Task with similar data already exists |
| `ATTACHMENT_TOO_LARGE`  | 413    | File size exceeds limit               |
| `UNSUPPORTED_FILE_TYPE` | 415    | File type not allowed                 |
| `DATABASE_ERROR`        | 500    | Internal server error                 |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 100 requests per 15 minutes per IP
- **Burst**: 20 requests per second
- **Headers**: Rate limit status is included in response headers

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

**Rate Limited Response:**

```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "status": 429,
  "retryAfter": 60
}
```

## Tasks API

### Base URL

```
/api/tasks
```

### GET /api/tasks

Retrieve all tasks with optional filtering and pagination.

#### Query Parameters

| Parameter   | Type   | Required | Description                                   |
| ----------- | ------ | -------- | --------------------------------------------- |
| `priority`  | string | No       | Filter by priority (none, low, medium, high)  |
| `status`    | string | No       | Filter by status (all, pending, completed)    |
| `listId`    | number | No       | Filter by list ID                             |
| `search`    | string | No       | Search query for title, description, labels   |
| `page`      | number | No       | Page number (default: 1)                      |
| `limit`     | number | No       | Items per page (default: 50, max: 200)        |
| `sortBy`    | string | No       | Sort field (title, priority, date, createdAt) |
| `sortOrder` | string | No       | Sort order (asc, desc)                        |

#### Example Request

```
GET /api/tasks?priority=high&status=pending&listId=1&page=1&limit=10
```

#### Success Response (200)

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project proposal",
      "description": "Write detailed project proposal for Q1",
      "priority": "high",
      "date": "2024-01-15",
      "deadline": "2024-01-15T17:00:00",
      "estimateHours": 4,
      "estimateMinutes": 30,
      "actualHours": 0,
      "actualMinutes": 0,
      "listId": 1,
      "isCompleted": false,
      "completedAt": null,
      "isRecurring": false,
      "recurrenceType": null,
      "recurrenceInterval": null,
      "recurrenceEndDate": null,
      "reminders": [
        {
          "type": "time",
          "value": "1 hour before"
        }
      ],
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z",
      "list": {
        "id": 1,
        "name": "Work",
        "color": "#3B82F6"
      },
      "labels": [
        {
          "id": 1,
          "name": "Urgent",
          "color": "#EF4444"
        }
      ],
      "subTasks": [
        {
          "id": 1,
          "taskId": 1,
          "title": "Research competitors",
          "isCompleted": false,
          "completedAt": null,
          "createdAt": "2024-01-01T10:00:00Z",
          "updatedAt": "2024-01-01T10:00:00Z"
        }
      ],
      "attachments": [
        {
          "id": 1,
          "taskId": 1,
          "filename": "proposal-template.docx",
          "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "size": 1024000,
          "url": "/api/attachments/1/download",
          "createdAt": "2024-01-01T10:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### POST /api/tasks

Create a new task.

#### Request Body

```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "medium",
  "date": "2024-01-15",
  "deadline": "2024-01-15T17:00:00",
  "estimateHours": 2,
  "estimateMinutes": 30,
  "actualHours": 0,
  "actualMinutes": 0,
  "listId": 1,
  "isCompleted": false,
  "isRecurring": false,
  "recurrenceType": "weekly",
  "recurrenceInterval": 1,
  "recurrenceEndDate": "2024-12-31",
  "reminders": [
    {
      "type": "time",
      "value": "1 hour before"
    }
  ],
  "labelIds": [1, 2]
}
```

#### Validation Rules

- `title`: Required, 1-200 characters
- `priority`: Optional, one of (none, low, medium, high)
- `date`: Optional, valid date format (YYYY-MM-DD)
- `deadline`: Optional, valid datetime format (YYYY-MM-DDTHH:mm)
- `estimateHours`: Optional, 0-23
- `estimateMinutes`: Optional, 0-59
- `actualHours`: Optional, 0-23
- `actualMinutes`: Optional, 0-59
- `listId`: Optional, must exist
- `isCompleted`: Optional, boolean
- `isRecurring`: Optional, boolean
- `recurrenceType`: Required if `isRecurring` is true
- `recurrenceInterval`: Required if `isRecurring` is true, 1-365
- `recurrenceEndDate`: Optional, valid date format
- `reminders`: Optional array of reminder objects
- `labelIds`: Optional array of existing label IDs

#### Success Response (201)

```json
{
  "task": {
    "id": 1,
    "title": "New Task",
    "description": "Task description",
    "priority": "medium",
    "date": "2024-01-15",
    "deadline": "2024-01-15T17:00:00",
    "estimateHours": 2,
    "estimateMinutes": 30,
    "actualHours": 0,
    "actualMinutes": 0,
    "listId": 1,
    "isCompleted": false,
    "completedAt": null,
    "isRecurring": false,
    "recurrenceType": null,
    "recurrenceInterval": null,
    "recurrenceEndDate": null,
    "reminders": [],
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

### GET /api/tasks/:id

Retrieve a specific task by ID.

#### Example Request

```
GET /api/tasks/1
```

#### Success Response (200)

```json
{
  "task": {
    "id": 1,
    "title": "Task Title",
    "description": "Task description",
    "priority": "high",
    "date": "2024-01-15",
    "deadline": "2024-01-15T17:00:00",
    "estimateHours": 4,
    "estimateMinutes": 30,
    "actualHours": 0,
    "actualMinutes": 0,
    "listId": 1,
    "isCompleted": false,
    "completedAt": null,
    "isRecurring": false,
    "recurrenceType": null,
    "recurrenceInterval": null,
    "recurrenceEndDate": null,
    "reminders": [],
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z",
    "list": {
      "id": 1,
      "name": "Work",
      "color": "#3B82F6"
    },
    "labels": [],
    "subTasks": [],
    "attachments": []
  }
}
```

### PUT /api/tasks/:id

Update an existing task.

#### Request Body

Same as POST request, but all fields are optional. Only provided fields will be updated.

#### Example Request

```
PUT /api/tasks/1
```

```json
{
  "title": "Updated Task Title",
  "isCompleted": true,
  "completedAt": "2024-01-01T15:30:00"
}
```

#### Success Response (200)

```json
{
  "task": {
    "id": 1,
    "title": "Updated Task Title",
    "description": "Task description",
    "priority": "high",
    "date": "2024-01-15",
    "deadline": "2024-01-15T17:00:00",
    "estimateHours": 4,
    "estimateMinutes": 30,
    "actualHours": 0,
    "actualMinutes": 0,
    "listId": 1,
    "isCompleted": true,
    "completedAt": "2024-01-01T15:30:00",
    "isRecurring": false,
    "recurrenceType": null,
    "recurrenceInterval": null,
    "recurrenceEndDate": null,
    "reminders": [],
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T15:30:00Z"
  }
}
```

### DELETE /api/tasks/:id

Delete a task and all its related data (sub-tasks, attachments, labels).

#### Example Request

```
DELETE /api/tasks/1
```

#### Success Response (200)

```json
{
  "message": "Task deleted successfully",
  "deletedTask": {
    "id": 1,
    "title": "Task Title"
  }
}
```

## Lists API

### Base URL

```
/api/lists
```

### GET /api/lists

Retrieve all lists.

#### Example Request

```
GET /api/lists
```

#### Success Response (200)

```json
{
  "lists": [
    {
      "id": 1,
      "name": "Work",
      "color": "#3B82F6",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Personal",
      "color": "#10B981",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### POST /api/lists

Create a new list.

#### Request Body

```json
{
  "name": "Shopping",
  "color": "#F59E0B"
}
```

#### Success Response (201)

```json
{
  "list": {
    "id": 3,
    "name": "Shopping",
    "color": "#F59E0B",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

### GET /api/lists/:id

Retrieve a specific list.

#### Success Response (200)

```json
{
  "list": {
    "id": 1,
    "name": "Work",
    "color": "#3B82F6",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

### PUT /api/lists/:id

Update a list.

#### Request Body

```json
{
  "name": "Updated List Name",
  "color": "#EF4444"
}
```

### DELETE /api/lists/:id

Delete a list and all its tasks.

#### Success Response (200)

```json
{
  "message": "List and all associated tasks deleted successfully",
  "deletedList": {
    "id": 1,
    "name": "Work"
  }
}
```

## Labels API

### Base URL

```
/api/labels
```

### GET /api/labels

Retrieve all labels.

#### Example Request

```
GET /api/labels
```

#### Success Response (200)

```json
{
  "labels": [
    {
      "id": 1,
      "name": "Urgent",
      "color": "#EF4444",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Review",
      "color": "#F59E0B",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### POST /api/labels

Create a new label.

#### Request Body

```json
{
  "name": "Important",
  "color": "#10B981"
}
```

#### Success Response (201)

```json
{
  "label": {
    "id": 3,
    "name": "Important",
    "color": "#10B981",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

### GET /api/labels/:id

Retrieve a specific label.

### PUT /api/labels/:id

Update a label.

### DELETE /api/labels/:id

Delete a label.

## Attachments API

### Base URL

```
/api/attachments
```

### GET /api/attachments

Retrieve all attachments for a specific task.

#### Query Parameters

- `taskId`: Task ID to filter attachments

#### Example Request

```
GET /api/attachments?taskId=1
```

#### Success Response (200)

```json
{
  "attachments": [
    {
      "id": 1,
      "taskId": 1,
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "size": 1024000,
      "url": "/api/attachments/1/download",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### POST /api/attachments

Upload a new attachment.

#### Request (multipart/form-data)

- `file`: The file to upload
- `taskId`: Task ID to associate the attachment with

#### File Restrictions

- Maximum size: 5MB
- Allowed types: PDF, images, text files

#### Success Response (201)

```json
{
  "attachment": {
    "id": 1,
    "taskId": 1,
    "filename": "document.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "url": "/api/attachments/1/download",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

### GET /api/attachments/:id

Download an attachment.

#### Example Request

```
GET /api/attachments/1/download
```

#### Success Response (200)

Returns the file content with appropriate headers.

### DELETE /api/attachments/:id

Delete an attachment.

#### Success Response (200)

```json
{
  "message": "Attachment deleted successfully",
  "deletedAttachment": {
    "id": 1,
    "filename": "document.pdf"
  }
}
```

## Sub-tasks API

### Base URL

```
/api/subtasks
```

### GET /api/subtasks?taskId=:id

Retrieve all sub-tasks for a specific task.

#### Example Request

```
GET /api/subtasks?taskId=1
```

#### Success Response (200)

```json
{
  "subTasks": [
    {
      "id": 1,
      "taskId": 1,
      "title": "Research competitors",
      "isCompleted": false,
      "completedAt": null,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### POST /api/subtasks

Create a new sub-task.

#### Request Body

```json
{
  "taskId": 1,
  "title": "Write introduction",
  "isCompleted": false
}
```

#### Success Response (201)

```json
{
  "subTask": {
    "id": 2,
    "taskId": 1,
    "title": "Write introduction",
    "isCompleted": false,
    "completedAt": null,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

### PUT /api/subtasks/:id

Update a sub-task.

#### Request Body

```json
{
  "title": "Updated sub-task title",
  "isCompleted": true,
  "completedAt": "2024-01-01T15:30:00"
}
```

### DELETE /api/subtasks/:id

Delete a sub-task.

## Search API

### Base URL

```
/api/search
```

### GET /api/search

Perform advanced search across all tasks.

#### Query Parameters

| Parameter  | Type   | Required | Description                                |
| ---------- | ------ | -------- | ------------------------------------------ |
| `q`        | string | Yes      | Search query                               |
| `priority` | string | No       | Filter by priority                         |
| `status`   | string | No       | Filter by status (all, pending, completed) |
| `listId`   | number | No       | Filter by list ID                          |
| `labelId`  | number | No       | Filter by label ID                         |
| `dateFrom` | string | No       | Filter by date range start                 |
| `dateTo`   | string | No       | Filter by date range end                   |
| `page`     | number | No       | Page number                                |
| `limit`    | number | No       | Items per page                             |

#### Example Request

```
GET /api/search?q=project&priority=high&status=pending&page=1&limit=10
```

#### Success Response (200)

```json
{
  "results": [
    {
      "id": 1,
      "title": "Complete project proposal",
      "description": "Write detailed project proposal for Q1",
      "priority": "high",
      "date": "2024-01-15",
      "deadline": "2024-01-15T17:00:00",
      "list": {
        "id": 1,
        "name": "Work"
      },
      "labels": [
        {
          "id": 1,
          "name": "Urgent"
        }
      ],
      "matchInfo": {
        "score": 0.95,
        "matchedFields": ["title", "description"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "searchInfo": {
    "query": "project",
    "totalResults": 25,
    "searchTime": 45
  }
}
```

## Views API

### Base URL

```
/api/views
```

### GET /api/views/today

Get tasks due today.

### GET /api/views/next-7-days

Get tasks due in the next 7 days.

### GET /api/views/upcoming

Get upcoming tasks (due after today).

### GET /api/views/all

Get all tasks.

### GET /api/views/inbox

Get inbox tasks (not assigned to any list).

#### Response Format

All view endpoints return the same format as GET /api/tasks with pagination.

## Stats API

### Base URL

```
/api/stats
```

### GET /api/stats

Get task statistics.

#### Example Request

```
GET /api/stats
```

#### Success Response (200)

```json
{
  "stats": {
    "totalTasks": 150,
    "completedTasks": 89,
    "pendingTasks": 61,
    "overdueTasks": 12,
    "highPriorityTasks": 25,
    "todayTasks": 8,
    "next7DaysTasks": 23,
    "lists": [
      {
        "id": 1,
        "name": "Work",
        "taskCount": 67,
        "completedCount": 45
      }
    ],
    "labels": [
      {
        "id": 1,
        "name": "Urgent",
        "taskCount": 15
      }
    ],
    "completionRate": 59.33,
    "averageCompletionTime": 2.5,
    "mostProductiveDay": "2024-01-15"
  }
}
```

## Task Changes API

### Base URL

```
/api/task-changes
```

### GET /api/task-changes?taskId=:id

Get audit trail for a specific task.

#### Example Request

```
GET /api/task-changes?taskId=1
```

#### Success Response (200)

```json
{
  "changes": [
    {
      "id": 1,
      "taskId": 1,
      "action": "CREATE",
      "changedBy": "user@example.com",
      "changes": {
        "title": "New Task",
        "priority": "medium"
      },
      "createdAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "taskId": 1,
      "action": "UPDATE",
      "changedBy": "user@example.com",
      "changes": {
        "priority": {
          "from": "medium",
          "to": "high"
        }
      },
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## Best Practices

### Client Implementation

1. **Error Handling**: Always handle errors gracefully
2. **Loading States**: Show loading indicators for async operations
3. **Caching**: Implement client-side caching where appropriate
4. **Pagination**: Use pagination for large datasets
5. **Rate Limiting**: Respect rate limits and implement retry logic

### Example Client Code

```javascript
// Example fetch wrapper with error handling
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// Example usage
try {
  const tasks = await apiRequest("/api/tasks?status=pending");
  console.log("Tasks:", tasks);
} catch (error) {
  console.error("Failed to fetch tasks:", error.message);
}
```

### Security Considerations

1. **Input Validation**: Always validate user inputs
2. **Authentication**: Ensure proper authentication for all endpoints
3. **Authorization**: Check permissions before modifying data
4. **Rate Limiting**: Implement client-side rate limiting
5. **Error Messages**: Don't expose sensitive information in error messages

### Performance Optimization

1. **Batch Operations**: Use bulk operations when possible
2. **Selective Loading**: Only load necessary data
3. **Caching**: Implement appropriate caching strategies
4. **Pagination**: Use pagination for large datasets
5. **Debouncing**: Debounce search and filter operations

## Versioning

The API is currently at version 1.0. Future versions will be indicated in the URL path (e.g., `/api/v2/tasks`).

## Changelog

### v1.0.0 (2024-01-01)

- Initial API release
- Complete CRUD operations for all entities
- Advanced search and filtering
- Audit trail functionality
- File attachment support
- Recurring tasks support
