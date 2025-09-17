// src/types/task.ts
export type Task = {
  id: string; 
  title: string;
  description?: string;
  column: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  store?: string; 
  assignee?: string; 
  dueDate?: string; 
  startDate?: string;
  endDate?: string; 
  createdAt?: string;
  updatedAt?: string;
};
