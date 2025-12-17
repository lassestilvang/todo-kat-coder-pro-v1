import { Task } from "@/types/task";

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return "denied";
    }

    if (Notification.permission === "default") {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  showTaskReminder(task: Task): void {
    if (Notification.permission === "granted") {
      const notification = new Notification(`Task Reminder: ${task.title}`, {
        body: task.description || "Time to work on this task!",
        icon: "/favicon.ico",
        tag: `task-${task.id}`,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  showTaskDueNotification(task: Task): void {
    if (Notification.permission === "granted") {
      const notification = new Notification(`Task Due: ${task.title}`, {
        body: `This task is due ${task.deadline || "today"}!`,
        icon: "/favicon.ico",
        tag: `due-${task.id}`,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  scheduleReminders(tasks: Task[]): void {
    tasks.forEach((task) => {
      if (task.reminders && task.reminders.length > 0) {
        task.reminders.forEach((reminder) => {
          const reminderTime = this.calculateReminderTime(
            task.date,
            reminder.time,
            reminder.unit
          );

          const timeUntilReminder = reminderTime - Date.now();

          if (timeUntilReminder > 0) {
            setTimeout(() => {
              this.showTaskReminder(task);
            }, timeUntilReminder);
          }
        });
      }
    });
  }

  private calculateReminderTime(
    taskDate: string,
    time: number,
    unit: "minutes" | "hours" | "days"
  ): number {
    const taskDateTime = new Date(taskDate).getTime();
    const reminderOffset = this.getOffsetInMilliseconds(time, unit);
    return taskDateTime - reminderOffset;
  }

  private getOffsetInMilliseconds(
    time: number,
    unit: "minutes" | "hours" | "days"
  ): number {
    switch (unit) {
      case "minutes":
        return time * 60 * 1000;
      case "hours":
        return time * 60 * 60 * 1000;
      case "days":
        return time * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  checkDueTasks(tasks: Task[]): void {
    const now = new Date();
    const dueTasks = tasks.filter((task) => {
      if (!task.deadline || task.isCompleted) return false;

      const deadline = new Date(task.deadline);
      return deadline <= now;
    });

    dueTasks.forEach((task) => {
      this.showTaskDueNotification(task);
    });
  }

  static checkForOverdueTasks(): void {
    // This would typically be called from a background service or interval
    console.log("Checking for overdue tasks...");
  }
}
