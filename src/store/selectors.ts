import { TaskState } from "./taskStore";

// Stable selector reference to prevent infinite loops
export const allTasksSelector = (state: TaskState): any[] => {
  return state.allIds.map((id) => state.byId[id]).filter(Boolean);
};