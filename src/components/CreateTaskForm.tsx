"use client";
import React from "react";
import { Plus, Calendar } from "lucide-react";

interface CreateTaskFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  deadline: string;
  setDeadline: (date: string) => void;
  handleCreate: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export default function CreateTaskForm({
  title,
  setTitle,
  description,
  setDescription,
  deadline,
  setDeadline,
  handleCreate,
  handleKeyPress,
}: CreateTaskFormProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Task title..."
          className="w-full text-lg font-medium placeholder-gray-400 focus:outline-none text-gray-900"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={2}
          className="w-full text-sm placeholder-gray-400 focus:outline-none resize-none text-gray-600"
        />
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-gray-400" />
          <label className="text-gray-500 font-medium min-w-fit">
            Deadline:
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="flex-1 text-gray-600 focus:outline-none"
            placeholder="Set deadline (optional)"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}