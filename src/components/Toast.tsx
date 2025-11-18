import React, { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
      textColor: "text-green-800",
      iconColor: "text-green-500",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-500",
      textColor: "text-red-800",
      iconColor: "text-red-500",
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${bgColor} ${borderColor} border-l-4 rounded-lg shadow-lg p-4 max-w-md animate-slide-in`}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className={`${iconColor} flex-shrink-0 mt-0.5`} />
        <p className={`text-sm font-medium ${textColor} flex-1`}>{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 hover:bg-gray-200 rounded transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}

// Hook to manage toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<Array<{ id: number; type: ToastType; message: string }>>([]);

  const showToast = React.useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const ToastContainer = React.useCallback(() => {
    return (
      <>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{ top: `${1 + index * 5}rem` }}
            className="fixed right-4 z-50 transition-all duration-300"
          >
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </>
    );
  }, [toasts, removeToast]);

  return { showToast, ToastContainer };
}