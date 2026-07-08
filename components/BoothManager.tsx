"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Select from "@/components/Select";
import DatePicker from "@/components/DatePicker";
import type { Exhibition } from "@/lib/types";

type BoothManagerProps = {
  supplierId: string;
  exhibitions: Exhibition[];
  initialData: {
    exhibition_id: string | null;
    hall: string | null;
    booth_number: string | null;
    stand_location: string | null;
    visited: boolean | null;
    visit_date: string | null;
  };
};

export default function BoothManager({
  supplierId,
  exhibitions,
  initialData,
}: BoothManagerProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    exhibition_id: initialData.exhibition_id ?? "",
    hall: initialData.hall ?? "",
    booth_number: initialData.booth_number ?? "",
    stand_location: initialData.stand_location ?? "",
    visited: initialData.visited ?? false,
    visit_date: initialData.visit_date ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Supabase is not connected yet.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("suppliers")
      .update({
        exhibition_id: form.exhibition_id || null,
        hall: form.hall || null,
        booth_number: form.booth_number || null,
        stand_location: form.stand_location || null,
        visited: form.visited,
        visit_date: form.visit_date || null,
      })
      .eq("id", supplierId);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push(`/suppliers/${supplierId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-4">Booth & Exhibition</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="block">
            <span className="block text-sm font-medium text-ink-700 mb-1.5">
              Exhibition
            </span>
            <Select
              value={form.exhibition_id}
              onChange={(v) => set("exhibition_id", v)}
              options={[{ value: "", label: "— None —" }, ...exhibitions.map((ex) => ({ value: ex.id, label: ex.name }))]}
            />
          </div>

          <Field label="Hall">
            <Input
              value={form.hall}
              onChange={(value) => set("hall", value)}
              placeholder="e.g. Hall 3"
            />
          </Field>

          <Field label="Booth number">
            <Input
              value={form.booth_number}
              onChange={(value) => set("booth_number", value)}
              placeholder="e.g. 3.2E15"
            />
          </Field>

          <Field label="Stand location">
            <Input
              value={form.stand_location}
              onChange={(value) => set("stand_location", value)}
              placeholder="e.g. Oleo Section"
            />
          </Field>

          <Field label="Visited">
            <label className="flex items-center gap-2 h-9">
              <input
                type="checkbox"
                checked={form.visited}
                onChange={(e) => set("visited", e.target.checked)}
                className="h-4 w-4 rounded border-ink-300"
              />
              <span className="text-sm text-ink-700">
                Yes, visited this booth
              </span>
            </label>
          </Field>

          <Field label="Visit date">
            <Input
              type="date"
              value={form.visit_date}
              onChange={(value) => set("visit_date", value)}
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save booth information"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <span className="block text-sm font-medium text-ink-700 mb-1.5">
        {label}
      </span>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  if (type === "date") {
    return <DatePicker value={value} onChange={onChange} />;
  }
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}