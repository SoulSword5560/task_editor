// components/TaskCard.tsx
"use client";
import React from "react";
import { Task, TaskStatus } from "@/lib/types";
import { statusConfig, getDeadlineStatus } from "@/lib/utils";
import {
  Pencil,
  Trash2,
  X,
  Check,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  editingId: number | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  editDescription: string;
  setEditDescription: (desc: string) => void;
  editDeadline: string;
  setEditDeadline: (date: string) => void;
  startEdit: (task: Task) => void;
  submitEdit: (id: number) => void;
  setEditingId: (id: number | null) => void;
  removeTask: (id: number) => void;
  updateTaskStatus: (id: number, status: TaskStatus) => void;
}

export default function TaskCard({
  task,
  editingId,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  editDeadline,
  setEditDeadline,
  startEdit,
  submitEdit,
  setEditingId,
  removeTask,
  updateTaskStatus,
}: TaskCardProps) {
  const config = statusConfig[task.status];
  const Icon = config.icon;
  const deadlineStatus = getDeadlineStatus(task.deadline);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all group">
      {editingId === task.id ? (
        <div className="p-4 space-y-3">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full text-base font-medium placeholder-gray-400 focus:outline-none text-gray-900"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Add a description..."
            rows={2}
            className="w-full text-sm placeholder-gray-400 focus:outline-none resize-none text-gray-600"
          />
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <label className="text-gray-500 font-medium text-sm min-w-fit">
              Deadline:
            </label>
            <input
              type="datetime-local"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
              className="flex-1 text-sm text-gray-600 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => submitEdit(task.id)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-sm"
            >
              <Check size={14} />
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md font-medium transition-colors text-sm"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <Icon
                size={18}
                className={`${config.color} flex-shrink-0 mt-0.5`}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {task.description}
                  </p>
                )}

                {deadlineStatus && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {deadlineStatus.isOverdue ? (
                        <AlertCircle
                          size={14}
                          className={deadlineStatus.color.split(" ")[0]}
                        />
                      ) : (
                        <Clock
                          size={14}
                          className={deadlineStatus.color.split(" ")[0]}
                        />
                      )}
                      <span className="text-xs text-gray-500 font-medium">
                        Deadline:
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded border ${deadlineStatus.color}`}
                      >
                        {deadlineStatus.text}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(task.deadline!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => startEdit(task)}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                title="Edit"
              >
                <Pencil size={14} className="text-gray-600" />
              </button>
              <button
                onClick={() => removeTask(task.id)}
                className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                title="Delete"
              >
                <Trash2 size={14} className="text-red-600" />
              </button>
            </div>
          </div>

          <div className="flex gap-1.5">
            {(Object.keys(statusConfig) as TaskStatus[]).map((status) => {
              const statusConf = statusConfig[status];
              const StatusIcon = statusConf.icon;
              const isActive = task.status === status;

              return (
                <button
                  key={status}
                  onClick={() => updateTaskStatus(task.id, status)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? `${statusConf.bg} ${statusConf.color} ${statusConf.border} border`
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <StatusIcon size={12} />
                  {statusConf.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}