import { Circle, Clock, CheckCircle2 } from "lucide-react";

export const statusConfig = {
  TODO: {
    label: "To Do",
    icon: Circle,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    hoverBg: "hover:bg-gray-100",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    hoverBg: "hover:bg-blue-100",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    hoverBg: "hover:bg-green-100",
  },
};

export function getDeadlineStatus(deadline: string | null | undefined) {
  if (!deadline) return null;

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let text = "";
  let color = "";

  if (diffHours < 0) {
    const overdue = Math.abs(diffHours);
    if (overdue < 24) {
      text = `${overdue}h overdue`;
    } else {
      text = `${Math.abs(diffDays)}d overdue`;
    }
    color = "text-red-600 bg-red-50 border-red-200";
  } else if (diffHours < 24) {
    text = `${diffHours}h left`;
    color = "text-orange-600 bg-orange-50 border-orange-200";
  } else if (diffDays < 7) {
    text = `${diffDays}d left`;
    color = "text-yellow-600 bg-yellow-50 border-yellow-200";
  } else {
    text = `${diffDays}d left`;
    color = "text-gray-600 bg-gray-50 border-gray-200";
  }

  return { text, color, isOverdue: diffHours < 0 };
}