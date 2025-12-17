"use client";

import * as React from "react";
import { TaskWithRelations } from "@/types/task";
import { useTaskStore } from "@/store/taskStore";
import { useListStore } from "@/store/listStore";
import { useLabelStore } from "@/store/labelStore";
import { useViewStore } from "@/store/viewStore";
import { useSearchStore } from "@/store/searchStore";
import { TodayView } from "./TodayView";
import { Next7DaysView } from "./Next7DaysView";
import { UpcomingView } from "./UpcomingView";
import { AllView } from "./AllView";
import { InboxView } from "./InboxView";
import { TaskDetailView } from "./TaskDetailView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Dashboard() {
  const [selectedTask, setSelectedTask] =
    React.useState<TaskWithRelations | null>(null);

  // Store hooks
  const tasks = useTaskStore((state: any) => state.byId);
  const loading = useTaskStore((state: any) => state.loading);
  const lists = useListStore((state: any) => state.lists);
  const labels = useLabelStore((state: any) => state.labels);
  const currentView = useViewStore((state: any) => state.currentView);
  const searchQuery = useSearchStore((state: any) => state.query);

  // Handle task selection for detail view
  const handleTaskSelect = (task: TaskWithRelations) => {
    setSelectedTask(task);
  };

  // Handle task operations
  const handleTaskEdit = (task: TaskWithRelations) => {
    setSelectedTask(task);
  };

  const handleTaskDelete = async (task: TaskWithRelations) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await useTaskStore.getState().deleteTask(task.id);
      setSelectedTask(null);
    }
  };

  const handleTaskDuplicate = async (task: TaskWithRelations) => {
    const { id, createdAt, updatedAt, ...taskData } = task;
    await useTaskStore.getState().createTask(taskData);
  };

  const handleTaskToggle = async (task: TaskWithRelations) => {
    await useTaskStore.getState().toggleTask(task.id);
  };

  // Calculate overall statistics
  const totalTasks = Object.values(tasks).length;
  const completedTasks = Object.values(tasks).filter(
    (t: any) => t.isCompleted
  ).length;
  const pendingTasks = Object.values(tasks).filter(
    (t: any) => !t.isCompleted
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Dashboard
          </h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">📊</Badge>
            <Badge variant="secondary">{totalTasks} total tasks</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {searchQuery && (
            <Badge variant="secondary">Search: {searchQuery}</Badge>
          )}
          <Badge variant="outline">View: {currentView}</Badge>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Tasks
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalTasks}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <span className="text-purple-600 dark:text-purple-300">📊</span>
            </div>
          </div>
        </div>

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
                Completed
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedTasks}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <span className="text-green-600 dark:text-green-300">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Views */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <Tabs value={currentView} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="next7days">Next 7 Days</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
              </TabsList>

              <TabsContent value="today">
                <TodayView />
              </TabsContent>

              <TabsContent value="next7days">
                <Next7DaysView />
              </TabsContent>

              <TabsContent value="upcoming">
                <UpcomingView />
              </TabsContent>

              <TabsContent value="all">
                <AllView />
              </TabsContent>

              <TabsContent value="inbox">
                <InboxView />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                📅 Schedule for Today
              </Button>
              <Button variant="outline" className="w-full justify-start">
                🏷️ Add Labels
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ⏰ Set Reminders
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📎 Add Attachments
              </Button>
            </div>
          </div>

          {/* Lists */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Lists
            </h3>
            <div className="space-y-2">
              {lists.map((list: any) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{list.emoji}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {list.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {
                      Object.values(tasks).filter(
                        (t: any) => t.listId === list.id
                      ).length
                    }
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Labels
            </h3>
            <div className="flex flex-wrap gap-2">
              {labels.map((label: any) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: label.color, color: label.color }}
                >
                  <span className="mr-2">{label.icon}</span>
                  {label.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <TaskDetailView
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onEdit={handleTaskEdit}
                onDelete={handleTaskDelete}
                onDuplicate={handleTaskDuplicate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
