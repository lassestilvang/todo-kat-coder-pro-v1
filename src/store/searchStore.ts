import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { TaskWithRelations } from "@/types/task";
import { TaskService } from "@/services/task-service";

interface SearchState {
  // Search state
  query: string;
  results: TaskWithRelations[];
  searchHistory: string[];
  isSearching: boolean;
  searchError: string | null;

  // Search filters
  filters: {
    lists: number[];
    labels: number[];
    priorities: string[];
    dateRange: {
      start: string;
      end: string;
    };
    completed: boolean | null;
  };

  // Actions
  search: (
    query: string,
    filters?: Partial<SearchState["filters"]>
  ) => Promise<void>;
  clearSearch: () => void;
  addToHistory: (query: string) => void;
  removeFromHistory: (query: string) => void;
  clearHistory: () => void;
  setFilters: (filters: Partial<SearchState["filters"]>) => void;
  clearFilters: () => void;
  setSearchError: (error: string | null) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    immer((set, get) => ({
      query: "",
      results: [],
      searchHistory: [],
      isSearching: false,
      searchError: null,

      filters: {
        lists: [],
        labels: [],
        priorities: [],
        dateRange: {
          start: "",
          end: "",
        },
        completed: null,
      },

      search: async (query, filters) => {
        set((state) => {
          state.query = query;
          state.isSearching = true;
          state.searchError = null;
        });

        try {
          const searchFilters = filters || get().filters;
          const results = await TaskService.searchTasks(query, searchFilters);

          set((state) => {
            state.results = results;
            state.isSearching = false;
            if (query && !state.searchHistory.includes(query)) {
              state.searchHistory.unshift(query);
              if (state.searchHistory.length > 10) {
                state.searchHistory = state.searchHistory.slice(0, 10);
              }
            }
          });
        } catch (error) {
          set((state) => {
            state.results = [];
            state.isSearching = false;
            state.searchError =
              error instanceof Error ? error.message : "Search failed";
          });
        }
      },

      clearSearch: () => {
        set((state) => {
          state.query = "";
          state.results = [];
          state.searchError = null;
        });
      },

      addToHistory: (query) => {
        set((state) => {
          if (query && !state.searchHistory.includes(query)) {
            state.searchHistory.unshift(query);
            if (state.searchHistory.length > 10) {
              state.searchHistory = state.searchHistory.slice(0, 10);
            }
          }
        });
      },

      removeFromHistory: (query) => {
        set((state) => {
          state.searchHistory = state.searchHistory.filter((q) => q !== query);
        });
      },

      clearHistory: () => {
        set((state) => {
          state.searchHistory = [];
        });
      },

      setFilters: (filters) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        });
      },

      clearFilters: () => {
        set((state) => {
          state.filters = {
            lists: [],
            labels: [],
            priorities: [],
            dateRange: {
              start: "",
              end: "",
            },
            completed: null,
          };
        });
      },

      setSearchError: (error) => {
        set((state) => {
          state.searchError = error;
        });
      },
    })),
    {
      name: "search-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        filters: state.filters,
      }),
    }
  )
);
