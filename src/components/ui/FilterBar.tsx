"use client";

import * as React from "react";
import { Button } from "./button";
import { Select } from "./select";
import { Checkbox } from "./checkbox";
import { SearchBar } from "./SearchBar";

export interface FilterBarProps {
  filters: {
    search?: string;
    priority?: string;
    status?: string;
    listId?: number;
    labelIds?: number[];
    date?: string;
  };
  lists: Array<{ id: number; name: string; color: string; emoji: string }>;
  labels: Array<{ id: number; name: string; color: string; icon: string }>;
  onFilterChange: (filters: {
    search?: string;
    priority?: string;
    status?: string;
    listId?: number;
    labelIds?: number[];
    date?: string;
  }) => void;
  onClear?: () => void;
  compact?: boolean;
}

export function FilterBar({
  filters,
  lists,
  labels,
  onFilterChange,
  onClear,
  compact = false,
}: FilterBarProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handlePriorityChange = (value: string) => {
    onFilterChange({ ...filters, priority: value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value });
  };

  const handleListChange = (value: string) => {
    onFilterChange({ ...filters, listId: value ? Number(value) : undefined });
  };

  const handleLabelToggle = (labelId: number) => {
    const currentLabels = filters.labelIds || [];
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter((id) => id !== labelId)
      : [...currentLabels, labelId];
    onFilterChange({ ...filters, labelIds: newLabels });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      priority: "",
      status: "all",
      listId: undefined,
      labelIds: [],
      date: "",
    });
    onClear?.();
  };

  return (
    <div className={`space-y-4 ${compact ? "space-y-2" : ""}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={filters.search || ""}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
          />
        </div>

        <div className="flex items-center space-x-4">
          <Select
            value={filters.priority || ""}
            onChange={(e) => handlePriorityChange(e.target.value)}
            options={[
              { value: "", label: "All priorities" },
              { value: "none", label: "No priority" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />

          <Select
            value={filters.status || "all"}
            onChange={(e) => handleStatusChange(e.target.value)}
            options={[
              { value: "all", label: "All tasks" },
              { value: "pending", label: "Pending" },
              { value: "completed", label: "Completed" },
            ]}
          />

          <Select
            value={filters.listId?.toString() || ""}
            onChange={(e) => handleListChange(e.target.value)}
            options={[
              { value: "", label: "All lists" },
              ...lists.map((list) => ({
                value: list.id.toString(),
                label: `${list.emoji} ${list.name}`,
              })),
            ]}
          />

          <Button
            variant="outline"
            onClick={clearFilters}
            className={compact ? "h-9" : ""}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {!compact && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Labels</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange({ ...filters, labelIds: [] })}
            >
              Clear selection
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <label
                key={label.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Checkbox
                  checked={(filters.labelIds || []).includes(label.id)}
                  onChange={() => handleLabelToggle(label.id)}
                />
                <span
                  className="inline-block h-3 w-3 rounded"
                  style={{ backgroundColor: label.color }}
                />
                <span>
                  {label.icon} {label.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
