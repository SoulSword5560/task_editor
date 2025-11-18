"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Search, X, Circle } from "lucide-react";
import { Task, TaskStatus } from "@/lib/types"; 
import { statusConfig } from "@/lib/utils"; 
import CreateTaskForm from "@/components/CreateTaskForm"; 
import TaskCard from "@/components/TaskCard"; 
import { useToast } from "@/components/Toast"; 


export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { showToast, ToastContainer } = useToast();

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      const data = await res.json();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => {
      setTasks((prev) => [...prev]);
    }, 60000);

    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleCreate() {
    if (!title.trim()) {
      showToast("error", "Title is required!");
      return;
    }

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        deadline: deadline || null,
      }),
    });

    if (res.ok) {
      setTitle("");
      setDescription("");
      setDeadline("");
      fetchTasks();
      showToast("success", "Task created successfully!");
    } else {
      showToast("error", "Failed to create task. Please try again.");
    }
  }

  async function updateTaskStatus(taskId: number, newStatus: TaskStatus) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
    showToast("success", "Task status updated!");
  }

  async function removeTask(id: number) {
    if (!confirm("Delete this task?")) return;
    
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    
    if (res.ok) {
      fetchTasks();
      showToast("success", "Task deleted successfully!");
    } else {
      showToast("error", "Failed to delete task.");
    }
  }

  async function startEdit(t: Task) {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDescription(t.description || "");
    setEditDeadline(
      t.deadline ? new Date(t.deadline).toISOString().slice(0, 16) : ""
    );
  }

  async function submitEdit(id: number) {
    if (!editTitle.trim()) {
      showToast("error", "Title is required!");
      return;
    }

    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        deadline: editDeadline || null,
      }),
    });

    if (res.ok) {
      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
      setEditDeadline("");
      fetchTasks();
      showToast("success", "Task updated successfully!");
    } else {
      showToast("error", "Failed to update task.");
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const suggestions = useMemo(() => {
    if (!searchQuery) return [];

    const relatedTitles = tasks
      .filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          task.title.toLowerCase() !== searchQuery.toLowerCase()
      )
      .map((task) => task.title);

    return [...new Set(relatedTitles)].slice(0, 5);
  }, [tasks, searchQuery]);

  const tasksByStatus = {
    TODO: filteredTasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: filteredTasks.filter((t) => t.status === "IN_PROGRESS"),
    COMPLETED: filteredTasks.filter((t) => t.status === "COMPLETED"),
  };

  const handleSuggestionClick = (title: string) => {
    setSearchQuery(title);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer />

      <header className="sticky top-0 z-10 w-full bg-white backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Tasks</h1>
            <p className="text-gray-500">
              {tasks.length === 0
                ? "No tasks yet"
                : `${filteredTasks.length} tasks found`}
            </p>
          </div>

          <div ref={searchContainerRef} className="relative w-full max-w-md">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search by title..."
              className="w-full pl-10 pr-10 py-2.5 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {suggestions.map((title, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(title)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 pb-12">
        <CreateTaskForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          deadline={deadline}
          setDeadline={setDeadline}
          handleCreate={handleCreate}
          handleKeyPress={handleKeyPress}
        />

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(statusConfig) as TaskStatus[]).map((status) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const statusTasks = tasksByStatus[status];

              return (
                <div key={status} className="flex flex-col">
                  <div
                    className={`${config.bg} ${config.border} border rounded-lg p-4 mb-3`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={20} className={config.color} />
                      <h2 className="font-semibold text-gray-900">
                        {config.label}
                      </h2>
                      <span className="ml-auto text-sm font-medium text-gray-500">
                        {statusTasks.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    {statusTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No tasks
                      </div>
                    ) : (
                      statusTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          editingId={editingId}
                          editTitle={editTitle}
                          setEditTitle={setEditTitle}
                          editDescription={editDescription}
                          setEditDescription={setEditDescription}
                          editDeadline={editDeadline}
                          setEditDeadline={setEditDeadline}
                          startEdit={startEdit}
                          submitEdit={submitEdit}
                          setEditingId={setEditingId}
                          removeTask={removeTask}
                          updateTaskStatus={updateTaskStatus}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Circle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-500">
              Create your first task to get started
            </p>
          </div>
        )}
      </main>
    </div>
  );
}