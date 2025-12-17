"use client";

import React, { useState, useMemo } from "react";
import {
  Filter,
  Calendar,
  Tag,
  Clock,
  CheckCircle,
  X,
  Plus,
  Save,
  Folder,
  Star,
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";
import { Checkbox } from "./checkbox";
import { Slider } from "./slider";
import { DatePicker } from "./DatePicker";
import { useTaskStore } from "@/store/taskStore";
import { useListStore } from "@/store/listStore";
import { useLabelStore } from "@/store/labelStore";
import { Priority, TaskFilter } from "@/types/task";
import { cn } from "@/lib/utils";

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

  const lists = useListStore((state) => state.lists);
  const labels = useLabelStore((state) => state.labels);

  const priorityOptions: Priority[] = ["low", "medium", "high", "urgent"];
  const statusOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
  ];

  const handleFilterChange = (updates: Partial<TaskFilter>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleDateRangeChange = (
    field: "startDate" | "endDate",
    date: Date | undefined
  ) => {
    handleFilterChange({
      date: date ? date.toISOString() : undefined,
      [field]: date,
    });
  };

  const handleLabelToggle = (labelId: number) => {
    const currentLabels = filters.labelIds || [];
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter((id) => id !== labelId)
      : [...currentLabels, labelId];
    handleFilterChange({ labelIds: newLabels });
  };

  const handlePriorityToggle = (priority: Priority) => {
    const currentPriorities = filters.priority ? [filters.priority] : [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [priority];
    handleFilterChange({ priority: newPriorities[0] || undefined });
  };

  const handleTimeEstimateChange = (value: number[]) => {
    handleFilterChange({
      estimateHours: value[0],
      estimateMinutes: value[1],
    });
  };

  const saveCurrentFilter = () => {
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
  };

  const loadSavedFilter = (filter: SavedFilter) => {
    onFiltersChange(filter.filters);
    setIsAdvancedOpen(false);
  };

  const removeSavedFilter = (id: string) => {
    setSavedFilters(savedFilters.filter((f) => f.id !== id));
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
      startDate: undefined,
      endDate: undefined,
      labelIds: [],
      estimateHours: undefined,
      estimateMinutes: undefined,
    });
    onClear();
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.priority) count++;
    if (filters.status !== "all") count++;
    if (filters.listId) count++;
    if (filters.labelIds?.length) count++;
    if (filters.date) count++;
    if (filters.estimateHours || filters.estimateMinutes) count++;
    return count;
  }, [filters]);

  return (
    <div className={cn("space-y-4", className)}>
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

        <Select
          value={filters.priority || "all"}
          onValueChange={(value) =>
            handleFilterChange({
              priority: value === "all" ? undefined : (value as Priority),
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorityOptions.map((priority) => (
              <SelectItem key={priority} value={priority}>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`bg-${priority}-100 text-${priority}-800`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleFilterChange({ status: value })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.listId?.toString() || "all"}
          onValueChange={(value) =>
            handleFilterChange({
              listId: value === "all" ? undefined : parseInt(value),
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="List" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lists</SelectItem>
            {lists.map((list) => (
              <SelectItem key={list.id} value={list.id.toString()}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{list.emoji}</span>
                  <span>{list.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[500px] p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
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

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Start Date</Label>
                  <DatePicker
                    value={filters.startDate}
                    onChange={(date) =>
                      handleDateRangeChange("startDate", date)
                    }
                    placeholder="Start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">End Date</Label>
                  <DatePicker
                    value={filters.endDate}
                    onChange={(date) => handleDateRangeChange("endDate", date)}
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Labels */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Labels</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {labels.map((label) => (
                    <div key={label.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={(filters.labelIds || []).includes(label.id)}
                        onCheckedChange={() => handleLabelToggle(label.id)}
                      />
                      <Badge
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <span className="text-sm">{label.icon}</span>
                        <span>{label.name}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Estimate */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Time Estimate</Label>
                <Slider
                  min={0}
                  max={8}
                  step={0.5}
                  value={[
                    filters.estimateHours || 0,
                    filters.estimateMinutes
                      ? filters.estimateHours! + filters.estimateMinutes! / 60
                      : filters.estimateHours || 0,
                  ]}
                  onValueChange={handleTimeEstimateChange}
                />
                <div className="text-xs text-gray-500">
                  {filters.estimateHours || filters.estimateMinutes
                    ? `${filters.estimateHours}h ${
                        filters.estimateMinutes || 0
                      }m`
                    : "No estimate"}
                </div>
              </div>

              {/* Saved Filters */}
              {savedFilters.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Saved Filters</Label>
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
                            onClick={() => loadSavedFilter(filter)}
                          >
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSavedFilter(filter.id)}
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
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {(filters.search ||
        filters.priority ||
        filters.status !== "all" ||
        filters.listId ||
        filters.labelIds?.length ||
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
          {filters.labelIds?.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Tag className="h-3 w-3" />
              Labels: {filters.labelIds.length}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange({ labelIds: [] })}
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
                onClick={saveCurrentFilter}
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
