"use client";

import * as React from "react";
import { TaskWithRelations } from "@/types/task";
import { TaskList } from "@/components/TaskList";
import { TaskForm } from "@/components/TaskForm";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTaskStore, useAllTasks } from "@/store/taskStore";
import { useListStore } from "@/store/listStore";
import { useLabelStore } from "@/store/labelStore";
import { useSearchStore } from "@/store/searchStore";

export function InboxView() {
  const [showForm, setShowForm] = React.useState(false);
  const [selectedTask, setSelectedTask] =
    React.useState<TaskWithRelations | null>(null);

  // Store hooks
  const tasks = useAllTasks();
  const loading = useTaskStore((state) => state.loading);
  const error = useTaskStore((state) => state.error);
  const lists = useListStore((state) => state.allIds.map(id => state.byId[id]));
  const labels = useLabelStore((state) => state.allIds.map(id => state.byId[id]));
  const searchQuery = useSearchStore((state) => state.query);
  const searchResults = useSearchStore((state) => state.results);
  const isSearching = useSearchStore((state) => state.isSearching);

  // Get inbox tasks (tasks without a specific list or with magic inbox list)
  const inboxTasks = React.useMemo(() => {
    return Object.values(tasks).filter((task: TaskWithRelations) => {
      // Filter for inbox list (magic inbox) or no specific list
      const inboxList = lists.find(
        (list: any) => list.isMagic && list.name === "Inbox"
      );
      return task.listId === inboxList?.id || !task.listId;
    });
  }, [tasks, lists]);

  // Use search results if searching
  const displayTasks = isSearching ? searchResults : inboxTasks;

  // Handle task operations
  const handleTaskToggle = async (task: TaskWithRelations) => {
    await useTaskStore.getState().toggleTask(task.id);
  };

  const handleTaskEdit = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleTaskDelete = async (task: TaskWithRelations) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await useTaskStore.getState().deleteTask(task.id);
    }
  };

  const handleTaskDuplicate = async (task: TaskWithRelations) => {
    const { id, createdAt, updatedAt, ...taskData } = task;
    await useTaskStore.getState().createTask(taskData);
  };

  const handleFormSubmit = async (taskData: any) => {
    if (selectedTask) {
      await useTaskStore.getState().updateTask(selectedTask.id, taskData);
    } else {
      // Automatically assign to inbox list
      const inboxList = lists.find(
        (list: any) => list.isMagic && list.name === "Inbox"
      );
      await useTaskStore.getState().createTask({
        ...taskData,
        listId: inboxList?.id || taskData.listId,
      });
    }
    setShowForm(false);
    setSelectedTask(null);
  };

  const handleSearch = (query: string) => {
    useSearchStore.getState().search(query);
  };

  // Calculate statistics
  const pendingTasks = inboxTasks.filter(
    (t: TaskWithRelations) => !t.isCompleted
  ).length;
  const highPriorityTasks = inboxTasks.filter(
    (t: TaskWithRelations) => t.priority === "high"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inbox
          </h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">📥</Badge>
            <Badge variant="secondary">{displayTasks.length} tasks</Badge>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Task</span>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingTasks}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <span className="text-blue-600 dark:text-blue-300">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                High Priority
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {highPriorityTasks}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <span className="text-red-600 dark:text-red-300">🔥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Quick Actions
              </p>
              <div className="flex space-x-2 mt-2">
                <Button variant="outline" size="sm">
                  📋 Sort
                </Button>
                <Button variant="outline" size="sm">
                  🏷️ Label
                </Button>
                <Button variant="outline" size="sm">
                  📅 Schedule
                </Button>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <span className="text-purple-600 dark:text-purple-300">⚡</span>
            </div>
          </div>
        </div>
      </div>

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
              placeholder="Search inbox tasks..."
            />
          </div>
          <FilterBar
            filters={{
              search: searchQuery,
              priority: "",
              status: "all",
              listId: undefined,
              labelIds: [],
            }}
            lists={lists}
            labels={labels}
            onFilterChange={(newFilters) => {
              // Handle filter changes
            }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
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
