import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TaskWithRelations } from "@/types/task";
import { TaskService } from "@/services/task-service";

type ViewType = "today" | "next7days" | "upcoming" | "all" | "inbox";

interface ViewState {
  currentView: ViewType;
  tasks: TaskWithRelations[];
  loading: boolean;
  error: string | null;

  // View-specific data
  viewData: {
    today: {
      tasks: TaskWithRelations[];
      total: number;
    };
    next7days: {
      tasks: TaskWithRelations[];
      total: number;
    };
    upcoming: {
      tasks: TaskWithRelations[];
      total: number;
    };
    all: {
      tasks: TaskWithRelations[];
      total: number;
    };
    inbox: {
      tasks: TaskWithRelations[];
      total: number;
    };
  };

  // Actions
  setView: (view: ViewType) => Promise<void>;
  refreshView: () => Promise<void>;
  refreshAllViews: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set, get) => ({
      currentView: "today",
      tasks: [],
      loading: false,
      error: null,

      viewData: {
        today: { tasks: [], total: 0 },
        next7days: { tasks: [], total: 0 },
        upcoming: { tasks: [], total: 0 },
        all: { tasks: [], total: 0 },
        inbox: { tasks: [], total: 0 },
      },

      setView: async (view) => {
        set({ currentView: view, loading: true, error: null });

        try {
          let tasks: TaskWithRelations[] = [];

          switch (view) {
            case "today":
              tasks = await TaskService.getTodayTasks();
              break;
            case "next7days":
              tasks = await TaskService.getUpcomingTasks(7);
              break;
            case "upcoming":
              tasks = await TaskService.getUpcomingTasks(30);
              break;
            case "all":
              tasks = await TaskService.getAllTasks();
              break;
            case "inbox":
              tasks = await TaskService.getInboxTasks();
              break;
          }

          set((state) => ({
            tasks,
            viewData: {
              ...state.viewData,
              [view]: { tasks, total: tasks.length },
            },
            loading: false,
          }));
        } catch (error) {
          set({
            tasks: [],
            loading: false,
            error:
              error instanceof Error ? error.message : "Failed to load view",
          });
        }
      },

      refreshView: async () => {
        const currentView = get().currentView;
        await get().setView(currentView);
      },

      refreshAllViews: async () => {
        set({ loading: true, error: null });

        try {
          const [today, next7days, upcoming, all, inbox] = await Promise.all([
            TaskService.getTodayTasks(),
            TaskService.getUpcomingTasks(7),
            TaskService.getUpcomingTasks(30),
            TaskService.getAllTasks(),
            TaskService.getInboxTasks(),
          ]);

          set((state) => ({
            viewData: {
              today: { tasks: today, total: today.length },
              next7days: { tasks: next7days, total: next7days.length },
              upcoming: { tasks: upcoming, total: upcoming.length },
              all: { tasks: all, total: all.length },
              inbox: { tasks: inbox, total: inbox.length },
            },
            loading: false,
          }));
        } catch (error) {
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to refresh views",
          });
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "view-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentView: state.currentView,
      }),
    }
  )
);
