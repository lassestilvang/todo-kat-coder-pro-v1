// Re-export all stores for easy importing
export { useTaskStore } from "./taskStore";
export { useListStore } from "./listStore";
export { useLabelStore } from "./labelStore";
export { useUIStore } from "./uiStore";
export { useSearchStore } from "./searchStore";
export { useViewStore } from "./viewStore";
export { useFormStore } from "./formStore";

// Import services for API integration
export { TaskService } from "@/services/task-service";
export { ListService } from "@/services/list-service";
export { LabelService } from "@/services/label-service";

// Import validation utilities
export {
  validateTask,
  validateTaskPartial,
  validateTaskField,
  validateList,
  validateListField,
  validateLabel,
  validateLabelField,
  validateWithDetails,
  validateEmail,
  validateUrl,
  validateColor,
  validateFileSize,
  validateFileType,
} from "@/lib/validation";

// Import types
export * from "@/types/task";
export * from "@/types/api";
export * from "@/types/components";
export * from "@/types/utils";
