"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Clock, Star, Tag, Filter, Sparkles } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import { Badge } from "./badge";
import { Command } from "cmdk";
import { useSearchStore } from "@/store/searchStore";
import { useTaskStore } from "@/store/taskStore";
import { useDebounce } from "@/hooks/useDebounce";

interface AdvancedSearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  debounce?: number;
  className?: string;
  showFilters?: boolean;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "saved" | "popular";
  icon?: React.ReactNode;
}

export function AdvancedSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search tasks, filters, or type / for quick actions...",
  debounce = 300,
  className,
  showFilters = true,
  showSuggestions = true,
  autoFocus = false,
}: AdvancedSearchBarProps) {
  const [internalValue, setInternalValue] = useState(() => value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { searchHistory, filters, setFilters } = useSearchStore();
  const { allIds, byId } = useTaskStore();
  const debouncedValue = useDebounce(internalValue, debounce);

  // Update suggestions based on search history and popular searches
  const suggestions = useMemo(() => {
    const suggestions: SearchSuggestion[] = [];

    // Recent searches
    if (searchHistory.length > 0) {
      suggestions.push(
        ...searchHistory.slice(0, 5).map((search, index) => ({
          id: `recent-${index}`,
          text: search,
          type: "recent" as const,
          icon: <Clock className="h-4 w-4 text-gray-500" />,
        }))
      );
    }

    // Popular searches based on task patterns
    const popularPatterns = [
      { text: "priority:high", type: "popular" as const },
      { text: "status:pending", type: "popular" as const },
      { text: "due:today", type: "popular" as const },
      { text: "list:work", type: "popular" as const },
    ];

    suggestions.push(
      ...popularPatterns.map((pattern, index) => ({
        id: `popular-${index}`,
        text: pattern.text,
        type: pattern.type,
        icon: <Sparkles className="h-4 w-4 text-yellow-500" />,
      }))
    );

    return suggestions;
  }, [searchHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleSearch = () => {
    if (debouncedValue.trim()) {
      onSearch?.(debouncedValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(0);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setInternalValue(suggestion.text);
    onChange?.(suggestion.text);
    setIsOpen(false);
    setSelectedIndex(0);
    setTimeout(handleSearch, 0);
  };

  const clearSearch = () => {
    setInternalValue("");
    onChange?.("");
    setIsOpen(false);
    setSelectedIndex(0);
  };

  const applyQuickFilter = (filterType: string, value: string) => {
    const newFilters = { ...filters };

    switch (filterType) {
      case "priority":
        newFilters.priorities = [value];
        break;
      case "status":
        newFilters.completed = value === "completed";
        break;
      case "list":
        newFilters.lists = [parseInt(value)];
        break;
    }

    setFilters(newFilters);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className || "")}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="pl-10 pr-16"
          autoFocus={autoFocus}
        />
        {internalValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-20 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          onClick={handleSearch}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-none"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {showSuggestions && isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <Command>
            <div className="p-3 border-b">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Quick Actions
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Type / to search, or use filters below
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-md text-sm",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      index === selectedIndex
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center gap-2">
                      {suggestion.icon}
                      <span>{suggestion.text}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {suggestion.type}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showFilters && (
              <div className="p-3 border-t">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Quick Filters
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickFilter("priority", "high")}
                    className="justify-start"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    High Priority
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickFilter("status", "pending")}
                    className="justify-start"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Pending
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickFilter("status", "completed")}
                    className="justify-start"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Completed
                  </Button>
                </div>
              </div>
            )}
          </Command>
        </div>
      )}
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}