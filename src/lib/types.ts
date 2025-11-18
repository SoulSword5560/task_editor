export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  deadline?: string | null;
  createdAt: string;
};