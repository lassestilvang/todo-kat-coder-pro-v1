import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  createdAt: Date;
  read: boolean;
}

interface UIState {
  // Theme
  theme: "light" | "dark" | "system";
  isDarkMode: boolean;

  // Modals
  modals: {
    taskForm: {
      open: boolean;
      mode: "create" | "edit";
      taskId?: number;
    };
    listForm: {
      open: boolean;
      mode: "create" | "edit";
      listId?: number;
    };
    labelForm: {
      open: boolean;
      mode: "create" | "edit";
      labelId?: number;
    };
    confirm: {
      open: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel: () => void;
    };
  };

  // Loading states
  loadingStates: Record<string, boolean>;

  // Notifications
  notifications: Notification[];

  // Sidebar
  sidebarCollapsed: boolean;

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  setIsDarkMode: (isDarkMode: boolean) => void;
  openModal: (modal: keyof UIState["modals"], data?: any) => void;
  closeModal: (modal: keyof UIState["modals"]) => void;
  setLoading: (key: string, loading: boolean) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "read">
  ) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "system",
      isDarkMode: false,

      modals: {
        taskForm: { open: false, mode: "create" },
        listForm: { open: false, mode: "create" },
        labelForm: { open: false, mode: "create" },
        confirm: {
          open: false,
          title: "",
          message: "",
          onConfirm: () => {},
          onCancel: () => {},
        },
      },

      loadingStates: {},

      notifications: [],

      sidebarCollapsed: false,

      setTheme: (theme) => set({ theme }),
      setIsDarkMode: (isDarkMode) => set({ isDarkMode }),

      openModal: (modal, data = {}) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modal]: {
              ...state.modals[modal as keyof typeof state.modals],
              ...data,
              open: true,
            },
          },
        }));
      },

      closeModal: (modal) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modal]: {
              ...state.modals[modal as keyof typeof state.modals],
              open: false,
            },
          },
        }));
      },

      setLoading: (key, loading) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading,
          },
        }));
      },

      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id,
              createdAt: new Date(),
              read: false,
            },
          ],
        }));

        // Auto-remove notification after duration
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration);
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },
    }),
    {
      name: "ui-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
