"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const config = {
  success: { icon: CheckCircle2, cls: "text-brand-600", bar: "bg-brand-500" },
  error: { icon: AlertCircle, cls: "text-red-600", bar: "bg-red-500" },
  info: { icon: Info, cls: "text-steel-600", bar: "bg-steel-500" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-80 max-w-[calc(100vw-3rem)]">
        {toasts.map((t) => {
          const { icon: Icon, cls, bar } = config[t.type] || config.info;
          return (
            <div
              key={t.id}
              className="relative overflow-hidden bg-white rounded-xl border border-gray-100 shadow-lg shadow-gray-200/70 px-4 py-3 flex items-start gap-3 animate-[slideIn_0.2s_ease-out]"
            >
              <Icon size={20} className={`${cls} shrink-0 mt-0.5`} />
              <p className="text-sm text-gray-700 flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-gray-300 hover:text-gray-500">
                <X size={16} />
              </button>
              <span className={`absolute bottom-0 left-0 h-0.5 ${bar} animate-[shrink_3.5s_linear_forwards]`} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
