"use client";

import * as React from "react";
import { TaskWithRelations } from "@/types/task";
import { TaskList } from "@/components/TaskList";
import { TaskForm } from "@/components/TaskForm";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskStore } from "@/store/taskStore";
import { useListStore } from "@/store/listStore";
import { useLabelStore } from "@/store/labelStore";
import { useSearchStore } from "@/store/searchStore";

export function TaskManagement() {
  const [showForm, setShowForm] = React.useState(false);
  const [selectedTask, setSelectedTask] =
    React.useState<TaskWithRelations | null>(null);
  const [selectedTasks, setSelectedTasks] = React.useState<number[]>([]);
  const [bulkAction, setBulkAction] = React.useState<string>("");

  // Store hooks
  const tasks = useTaskStore((state) => state.byId);
  const loading = useTaskStore((state) => state.loading);
  const error = useTaskStore((state) => state.error);
  const lists = useListStore((state) =>
    state.allIds.map((id) => state.byId[id])
  );
  const labels = useLabelStore((state) => state.allIds.map(id => state.byId[id]));
  const searchQuery = useSearchStore((state) => state.query);
  const searchResults = useSearchStore((state) => state.results);
  const isSearching = useSearchStore((state) => state.isSearching);

  // Filter state
  const [filters, setFilters] = React.useState({
    priority: "",
    status: "all",
    listId: undefined as number | undefined,
    labelIds: [] as number[],
  });

  // Filter tasks based on filters
  const filteredTasks = React.useMemo(() => {
    const allTasks = Object.values(tasks);

    return allTasks.filter((task: TaskWithRelations) => {
      // Priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Status filter
      if (filters.status === "completed" && !task.isCompleted) {
        return false;
      }
      if (filters.status === "pending" && task.isCompleted) {
        return false;
      }

      // List filter
      if (filters.listId && task.listId !== filters.listId) {
        return false;
      }

      // Label filter
      if (filters.labelIds.length > 0) {
        const taskLabelIds = task.labels?.map((l) => l.id) || [];
        const hasAnyLabel = filters.labelIds.some((id) =>
          taskLabelIds.includes(id)
        );
        if (!hasAnyLabel) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  // Use search results if searching
  const displayTasks = isSearching ? searchResults : filteredTasks;

  // Handle task selection
  const handleTaskSelect = (taskId: number, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(displayTasks.map((task: TaskWithRelations) => task.id).filter((id): id is number => id !== undefined));
    } else {
      setSelectedTasks([]);
    }
  };

  // Handle bulk operations
  const handleBulkAction = async () => {
    if (selectedTasks.length === 0) return;

    try {
      switch (bulkAction) {
        case "complete":
          for (const taskId of selectedTasks) {
            await useTaskStore.getState().toggleTask(taskId);
          }
          break;
        case "delete":
          if (confirm(`Delete ${selectedTasks.length} tasks?`)) {
            for (const taskId of selectedTasks) {
              await useTaskStore.getState().deleteTask(taskId);
            }
          }
          break;
        case "move":
          // Handle move to list
          break;
      }
      setSelectedTasks([]);
      setBulkAction("");
    } catch (error) {
      console.error("Bulk operation failed:", error);
    }
  };

  // Handle task operations
  const handleTaskToggle = async (task: TaskWithRelations) => {
    if (task.id !== undefined) {
      await useTaskStore.getState().toggleTask(task.id);
      // Update selection if needed
      if (selectedTasks.includes(task.id)) {
        setSelectedTasks(selectedTasks.filter((id) => id !== task.id));
      }
    }
  };

  const handleTaskEdit = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleTaskDelete = async (task: TaskWithRelations) => {
    if (confirm("Are you sure you want to delete this task?")) {
      if (task.id !== undefined) {
        await useTaskStore.getState().deleteTask(task.id);
        setSelectedTasks(selectedTasks.filter((id) => id !== task.id));
      }
    }
  };

  const handleTaskDuplicate = async (task: TaskWithRelations) => {
    const { id, createdAt, updatedAt, ...taskData } = task;
    await useTaskStore.getState().createTask(taskData);
  };

  const handleFormSubmit = async (taskData: TaskWithRelations) => {
    if (selectedTask && selectedTask.id !== undefined) {
      await useTaskStore.getState().updateTask(selectedTask.id, taskData);
    } else {
      await useTaskStore.getState().createTask(taskData);
    }
    setShowForm(false);
    setSelectedTask(null);
  };

  const handleSearch = (query: string) => {
    useSearchStore.getState().search(query);
  };

  const handleClearFilters = () => {
    setFilters({
      priority: "",
      status: "all",
      listId: undefined,
      labelIds: [],
    });
  };

  // Calculate statistics
  const selectedTasksData = displayTasks.filter((task: TaskWithRelations) =>
    task.id !== undefined && selectedTasks.includes(task.id)
  );
  const selectedCompleted = selectedTasksData.filter(
    (t) => t.isCompleted
  ).length;
  const selectedPending = selectedTasksData.filter(
    (t) => !t.isCompleted
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Management
          </h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">🛠️</Badge>
            <Badge variant="secondary">{displayTasks.length} tasks</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Task</span>
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Selected: {selectedTasks.length}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Pending:
                </span>
                <Badge variant="secondary">{selectedPending}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Completed:
                </span>
                <Badge variant="secondary">{selectedCompleted}</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bulk Actions</option>
                <option value="complete">Mark Complete</option>
                <option value="delete">Delete</option>
                <option value="move">Move to List</option>
              </select>
              <Button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="flex items-center space-x-2"
              >
                <span>⚡</span>
                <span>Apply</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(value) =>
                useSearchStore.getState().setSearchTerm(value)
              }
              onSearch={handleSearch}
              placeholder="Search tasks..."
            />
          </div>
          <FilterBar
            filters={{
              search: searchQuery,
              priority: filters.priority,
              status: filters.status,
              listId: filters.listId,
              labelIds: filters.labelIds,
            }}
            lists={lists}
            labels={labels}
            onFilterChange={(newFilters) => {
              setFilters({
                priority: newFilters.priority || "",
                status: newFilters.status || "all",
                listId: newFilters.listId,
                labelIds: newFilters.labelIds || [],
              });
            }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={
                selectedTasks.length === displayTasks.length &&
                displayTasks.length > 0
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Select All
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {displayTasks.length} of {Object.values(tasks).length} tasks
          </div>
        </div>

        <TaskList
          tasks={displayTasks}
          loading={loading === "loading"}
          error={error || undefined}
          onTaskToggle={handleTaskToggle}
          onTaskEdit={handleTaskEdit}
          onTaskDelete={handleTaskDelete}
          onTaskDuplicate={handleTaskDuplicate}
          showLabels={true}
          showSubTasks={true}
          showAttachments={true}
          showActions={true}
        />
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedTask ? "Edit Task" : "Create Task"}
              </h2>
              <TaskForm
                task={selectedTask || undefined}
                lists={lists}
                labels={labels}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedTask(null);
                }}
                onDelete={selectedTask ? handleTaskDelete : undefined}
                mode={selectedTask ? "edit" : "create"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
