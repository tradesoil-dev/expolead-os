"use client";

import { useCallback, useState } from "react";

type ToastState = { message: string; type: "success" | "error" } | null;

// Shared in-app toast — replaces native alert() across the app.
export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ToastUI = toast ? (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg text-sm font-medium w-max max-w-[calc(100vw-2rem)] ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
      {toast.type === "success" ? (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      ) : (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      )}
      {toast.message}
    </div>
  ) : null;

  return { showToast, ToastUI };
}
