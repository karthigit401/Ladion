"use client";

import { createContext, useCallback, useContext, useState } from "react";
import clsx from "clsx";

const ToastContext = createContext({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const toast = useCallback((message, tone = "info") => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2 w-[min(92vw,360px)]">
        {items.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "fade-up rounded-lg border px-4 py-3 text-sm shadow-xl backdrop-blur",
              t.tone === "success" && "border-emerald-400/30 bg-emerald-950/80 text-emerald-100",
              t.tone === "error" && "border-rose-400/30 bg-rose-950/80 text-rose-100",
              t.tone === "info" && "border-white/15 bg-[#11151c]/95 text-fg"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
