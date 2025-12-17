# Advanced Search and Filtering

This document describes the advanced search and filtering capabilities implemented in the Next.js daily task planner application.

## Features

### 1. Advanced Search Bar

The `AdvancedSearchBar` component provides:

- **Real-time Search**: Debounced search with instant results
- **Search Suggestions**: Recent searches and popular search patterns
- **Quick Actions**: Type `/` to access quick filters and actions
- **Fuzzy Matching**: Search across all task properties with fuzzy matching
- **Search History**: Persistent search history with suggestions

#### Usage

```tsx
import { AdvancedSearchBar } from "@/components/ui/AdvancedSearchBar";

<AdvancedSearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  placeholder="Search tasks, filters, or type / for quick actions..."
  debounce={300}
  showFilters={true}
  showSuggestions={true}
/>;
```

#### Features

- **Quick Filters**: Click buttons to apply common filters (High Priority, Pending, Completed)
- **Search Suggestions**: Shows recent searches and popular patterns
- **Keyboard Navigation**: Navigate suggestions with arrow keys
- **Clear Search**: Clear button to reset search

### 2. Advanced Filter Bar

The `AdvancedFilterBar` component provides comprehensive filtering:

- **Basic Filters**: Priority, status, list selection
- **Advanced Filters**: Date ranges, labels, time estimates
- **Saved Filters**: Save and load custom filter combinations
- **Active Filters Display**: Visual indicators of currently applied filters

#### Usage

```tsx
import { AdvancedFilterBar } from "@/components/ui/AdvancedFilterBar";

<AdvancedFilterBar
  filters={filters}
  onFiltersChange={setFilters}
  onClear={clearFilters}
/>;
```

#### Filter Options

1. **Priority Filter**: Filter by task priority (Low, Medium, High, Urgent)
2. **Status Filter**: Filter by completion status (All, Pending, Completed)
3. **List Filter**: Filter by task list
4. **Date Range**: Filter by start and end dates
5. **Labels**: Filter by task labels
6. **Time Estimate**: Filter by estimated time required

### 3. Search Analytics

The search system includes analytics features:

- **Search History**: Tracks recent searches for quick access
- **Popular Searches**: Identifies commonly used search patterns
- **Search Suggestions**: Provides intelligent suggestions based on usage
- **Trending Searches**: Highlights frequently searched terms

### 4. Filter Persistence

Filters are automatically saved and can be:

- **Auto-saved**: Filters persist across sessions
- **Named Filters**: Save filter combinations with custom names
- **Quick Load**: Load saved filters with one click
- **Filter Sharing**: Export/import filter configurations

## Implementation Details

### State Management

Search and filter state is managed through:

1. **Zustand Store**: Centralized state management for filters
2. **URL Parameters**: Filters reflected in URL for sharing
3. **LocalStorage**: Persistent storage of filter preferences
4. **Component State**: Local state for UI interactions

### Performance Optimizations

- **Debounced Search**: Prevents excessive API calls
- **Virtualization**: Large lists use virtualization for performance
- **Memoization**: Expensive calculations are memoized
- **Indexing**: Database indexes for faster search queries

### Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Logical focus order and management
- **High Contrast**: Support for high contrast modes

## API Integration

### Search API

```typescript
// Search tasks endpoint
GET /api/search?q={query}&filters={filters}

// Response
{
  results: TaskWithRelations[],
  total: number,
  facets: {
    priorities: { [key: string]: number },
    statuses: { [key: string]: number },
    lists: { [key: string]: number }
  }
}
```

### Filter API

```typescript
// Apply filters endpoint
POST /api/tasks/filter
{
  filters: TaskFilter,
  pagination: {
    page: number,
    limit: number
  }
}
```

## Best Practices

1. **Use Debouncing**: Always debounce search inputs to improve performance
2. **Limit Suggestions**: Show only the most relevant suggestions
3. **Clear Filters**: Provide easy ways to clear all filters
4. **Visual Feedback**: Show active filters clearly
5. **Keyboard Support**: Ensure all functionality is keyboard accessible
6. **Mobile Optimization**: Optimize filters for mobile touch interactions

## Examples

### Basic Search Implementation

```tsx
function TaskManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TaskFilter>({
    search: "",
    priority: undefined,
    status: "all",
    listId: undefined,
  });

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
  };

  return (
    <div>
      <AdvancedSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
      />
      <AdvancedFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onClear={() => setFilters(initialFilters)}
      />
      {/* Task list */}
    </div>
  );
}
```

### Advanced Filter Configuration

```tsx
const advancedFilters: TaskFilter = {
  search: "urgent",
  priority: "high",
  status: "pending",
  listId: 1,
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
  labelIds: [1, 2, 3],
  estimateHours: 2,
  estimateMinutes: 30,
};
```

This advanced search and filtering system provides a powerful and user-friendly way to find and organize tasks in the application.
