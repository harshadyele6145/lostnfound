import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-3 px-4 sm:items-end">
        {toasts.map((toast) => (
          <div key={toast.id} className={`pointer-events-auto w-full max-w-sm rounded-2xl border p-4 shadow-lg transition ${toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-900" : toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-900" : "bg-slate-900 border-slate-700 text-white"}`}>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm leading-6">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="rounded-full p-1 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
