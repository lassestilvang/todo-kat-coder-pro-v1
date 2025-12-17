"use client";

import React from "react";
import { TaskWithRelations } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  CheckCircle,
  Circle,
  Clock,
  Tag,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { Swipeable } from "./Swipeable";

interface MobileTaskCardProps {
  task: TaskWithRelations;
  onToggle: (id: number) => void;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (id: number) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
  urgent: "bg-purple-100 text-purple-800 border-purple-200",
  none: "bg-gray-100 text-gray-800 border-gray-200",
};

export function MobileTaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onSwipeLeft,
  onSwipeRight,
  className,
}: MobileTaskCardProps) {
  const formatDateDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const getPriorityColor = (priority: string) => {
    return (
      priorityColors[priority as keyof typeof priorityColors] ||
      priorityColors.none
    );
  };

  const handleSwipeLeft = () => {
    if (task.isCompleted) {
      onToggle(task.id);
    } else {
      onSwipeLeft?.();
    }
  };

  const handleSwipeRight = () => {
    if (!task.isCompleted) {
      onToggle(task.id);
    } else {
      onSwipeRight?.();
    }
  };

  return (
    <Swipeable
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      leftActionLabel={task.isCompleted ? "Unmark" : "Complete"}
      rightActionLabel={task.isCompleted ? "Delete" : "Edit"}
      leftActionIcon={
        task.isCompleted ? (
          <Circle className="h-5 w-5" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )
      }
      rightActionIcon={
        task.isCompleted ? (
          <Trash2 className="h-5 w-5" />
        ) : (
          <Edit className="h-5 w-5" />
        )
      }
    >
      <Card
        className={`border-l-4 ${
          task.isCompleted ? "border-l-green-500" : "border-l-blue-500"
        } ${className}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(task.id)}
                className="p-0 hover:bg-transparent"
              >
                {task.isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </Button>
              <div className="flex-1">
                <CardTitle
                  className={`text-lg font-semibold ${
                    task.isCompleted
                      ? "line-through text-gray-500"
                      : "text-gray-900"
                  }`}
                >
                  {task.title}
                </CardTitle>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                <Star className="h-3 w-3 mr-1" />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
              <Button variant="ghost" size="sm" className="md:hidden">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {task.date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDateDisplay(task.date)}</span>
              </div>
            )}
            {task.estimateHours && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {task.estimateHours}h {task.estimateMinutes || 0}m
                </span>
              </div>
            )}
          </div>

          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.labels.map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <span className="text-sm">{label.icon}</span>
                  <span>{label.name}</span>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {task.list && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span className="text-sm">{task.list.emoji}</span>
                  <span>{task.list.name}</span>
                </Badge>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(task)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Swipeable>
  );
}

interface MobileTaskListProps {
  tasks: TaskWithRelations[];
  onToggle: (id: number) => void;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (id: number) => void;
  className?: string;
}

export function MobileTaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  className,
}: MobileTaskListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {tasks.map((task) => (
        <MobileTaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface MobileBottomNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function MobileBottomNavigation({
  currentView,
  onViewChange,
}: MobileBottomNavigationProps) {
  const navigationItems = [
    { key: "today", label: "Today", icon: "📅" },
    { key: "next-7-days", label: "Next 7 Days", icon: "🗓️" },
    { key: "inbox", label: "Inbox", icon: "📥" },
    { key: "all", label: "All", icon: "📋" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around py-2">
        {navigationItems.map((item) => (
          <Button
            key={item.key}
            variant={currentView === item.key ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(item.key)}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
