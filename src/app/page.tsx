"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Circle,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Search, 
} from "lucide-react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  deadline?: string | null;
  createdAt: string;
};

const statusConfig = {
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

function getDeadlineStatus(deadline: string | null | undefined) {
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
    if (!title.trim()) return alert("Title required");
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title, 
        description,
        deadline: deadline || null
      }),
    });
    if (res.ok) {
      setTitle("");
      setDescription("");
      setDeadline("");
      fetchTasks();
    } else {
      alert("Failed to add");
    }
  }

  async function updateTaskStatus(taskId: number, newStatus: TaskStatus) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  }

  async function removeTask(id: number) {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  }

  async function startEdit(t: Task) {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDescription(t.description || "");
    setEditDeadline(t.deadline ? new Date(t.deadline).toISOString().slice(0, 16) : "");
  }

  async function submitEdit(id: number) {
    if (!editTitle.trim()) return alert("Title required");
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        deadline: editDeadline || null
      }),
    });
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditDeadline("");
    fetchTasks();
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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

  const renderTask = (t: Task) => {
    const config = statusConfig[t.status];
    const Icon = config.icon;
    const deadlineStatus = getDeadlineStatus(t.deadline);

    return (
      <div
        key={t.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all group"
      >
        {editingId === t.id ? (
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
              <label className="text-gray-500 font-medium text-sm min-w-fit">Deadline:</label>
              <input
                type="datetime-local"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="flex-1 text-sm text-gray-600 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => submitEdit(t.id)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-sm"
              >
                <Check size={14} />
                Save
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditTitle("");
                  setEditDescription("");
                  setEditDeadline("");
                }}
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
                <Icon size={18} className={`${config.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    {t.title}
                  </h3>
                  {t.description && (
                    <p className="text-sm text-gray-600 mb-2">{t.description}</p>
                  )}
                  
                  {deadlineStatus && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {deadlineStatus.isOverdue ? (
                          <AlertCircle size={14} className={deadlineStatus.color.split(' ')[0]} />
                        ) : (
                          <Clock size={14} className={deadlineStatus.color.split(' ')[0]} />
                        )}
                        <span className="text-xs text-gray-500 font-medium">Deadline:</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${deadlineStatus.color}`}>
                          {deadlineStatus.text}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(t.deadline!).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => startEdit(t)}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} className="text-gray-600" />
                </button>
                <button
                  onClick={() => removeTask(t.id)}
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
                const isActive = t.status === status;

                return (
                  <button
                    key={status}
                    onClick={() => updateTaskStatus(t.id, status)}
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      <header className="sticky top-0 z-10 w-full bg-white-900 backdrop-blur-sm border-b ">        
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
                      statusTasks.map(renderTask)
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