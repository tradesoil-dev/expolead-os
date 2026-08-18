"use client";

import { useCallback, useState } from "react";

type ConfirmOptions = {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // danger (default true) = red confirm button + warning icon. false = emerald.
  danger?: boolean;
};

type ConfirmState = { message: string; opts: ConfirmOptions; resolve: (v: boolean) => void } | null;

// Shared in-app confirmation modal — replaces native confirm() across the app.
// Usage: const { confirm, ConfirmUI } = useConfirm();
//        if (!(await confirm("Delete this?", { title: "Delete" }))) return;
//        ...render {ConfirmUI} once in the component.
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(null);

  const confirm = useCallback((message: string, opts: ConfirmOptions = {}) => {
    return new Promise<boolean>((resolve) => setState({ message, opts, resolve }));
  }, []);

  const close = useCallback((value: boolean) => {
    setState((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const danger = state ? state.opts.danger !== false : true;

  const ConfirmUI = state ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => close(false)} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${danger ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink-900">{state.opts.title ?? "Are you sure?"}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-500">{state.message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => close(false)}
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
          >
            {state.opts.cancelLabel ?? "Cancel"}
          </button>
          <button
            onClick={() => close(true)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {state.opts.confirmLabel ?? "Delete"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmUI };
}
