"use client";

import * as React from "react";
import { TaskFilter } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TaskFiltersProps {
  filters: TaskFilter;
  onFilterChange: (filters: Partial<TaskFilter>) => void;
  onClearFilters: () => void;
}

export function TaskFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search tasks..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>
      <select
        value={filters.priority || "all"}
        onChange={(e) =>
          onFilterChange({
            priority: e.target.value === "all" ? undefined : (e.target.value as "none" | "low" | "medium" | "high"),
          })
        }
      >
        <option value="all">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <select
        value={filters.status || "all"}
        onChange={(e) =>
          onFilterChange({ status: e.target.value as TaskFilter["status"] })
        }
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
      <select
        value={filters.view || "all"}
        onChange={(e) =>
          onFilterChange({ view: e.target.value as TaskFilter["view"] })
        }
      >
        <option value="all">All Tasks</option>
        <option value="today">Today</option>
        <option value="next7days">Next 7 Days</option>
        <option value="upcoming">Upcoming</option>
      </select>
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
