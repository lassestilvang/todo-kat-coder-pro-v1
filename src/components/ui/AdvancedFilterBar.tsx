"use client";

import React, { useState, useMemo } from "react";
import {
  Filter,
  Calendar,
  Tag,
  CheckCircle,
  X,
  Save,
  Folder,
  Search,
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { Priority, TaskFilter } from "@/types/task";
import { useListStore } from "@/store/listStore";

interface AdvancedFilterBarProps {
  filters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  onClear: () => void;
  className?: string;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: TaskFilter;
  createdAt: Date;
}

export function AdvancedFilterBar({
  filters,
  onFiltersChange,
  onClear,
  className,
}: AdvancedFilterBarProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");

  const lists = useListStore((state) =>
    state.allIds.map((id) => state.byId[id])
  );

  const priorityOptions: Priority[] = ["none", "low", "medium", "high"];
  const statusOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
  ];

  const handleFilterChange = (updates: Partial<TaskFilter>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      priority: undefined,
      status: "all",
      view: "all",
      listId: undefined,
      date: undefined,
      limit: 50,
      offset: 0,
      orderBy: "createdAt",
      orderDirection: "desc",
      completed: undefined,
    });
    onClear();
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.priority) count++;
    if (filters.status !== "all") count++;
    if (filters.listId) count++;
    if (filters.date) count++;
    return count;
  }, [filters]);

  return (
    <div className={cn("space-y-4", className || "")}>
      {/* Basic Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[300px]">
          <Input
            placeholder="Search tasks..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="w-full"
          />
        </div>

        <select
          value={filters.priority || "all"}
          onChange={(e) =>
            handleFilterChange({
              priority: e.target.value === "all" ? undefined : (e.target.value as Priority),
            })
          }
          className="w-[180px] px-3 py-2 border rounded-md"
        >
          <option value="all">All Priorities</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.status || "all"}
          onChange={(e) => handleFilterChange({ status: e.target.value as TaskFilter["status"] })}
          className="w-[160px] px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.listId?.toString() || "all"}
          onChange={(e) =>
            handleFilterChange({
              listId: e.target.value === "all" ? undefined : parseInt(e.target.value),
            })
          }
          className="w-[200px] px-3 py-2 border rounded-md"
        >
          <option value="all">All Lists</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id.toString()}>
              {list.emoji} {list.name}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Advanced
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {isAdvancedOpen && (
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Advanced Filters</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Date Filter */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Date</label>
              <Input
                type="date"
                value={filters.date || ""}
                onChange={(e) => handleFilterChange({ date: e.target.value })}
                placeholder="Select date"
              />
            </div>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Saved Filters</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{filter.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {filter.filters.search || "Custom"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onFiltersChange(filter.filters);
                          setIsAdvancedOpen(false);
                        }}
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSavedFilters(savedFilters.filter(f => f.id !== filter.id))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters */}
      {(filters.search ||
        filters.priority ||
        filters.status !== "all" ||
        filters.listId ||
        filters.date) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Search className="h-3 w-3" />
              Search: {filters.search}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange({ search: "" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Tag className="h-3 w-3" />
              Priority: {filters.priority}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange({ priority: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange({ status: "all" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.listId && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Folder className="h-3 w-3" />
              List: {lists.find((l) => l.id === filters.listId)?.name}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange({ listId: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.date && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Date: {new Date(filters.date).toLocaleDateString()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange({ date: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Save Filter</h3>
            <Input
              placeholder="Filter name"
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!saveFilterName.trim()) return;
                  const newFilter: SavedFilter = {
                    id: Date.now().toString(),
                    name: saveFilterName,
                    filters: { ...filters },
                    createdAt: new Date(),
                  };
                  setSavedFilters([...savedFilters, newFilter]);
                  setSaveFilterName("");
                  setShowSaveDialog(false);
                }}
                disabled={!saveFilterName.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Filter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}