"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { saveErrorMessage } from "@/lib/errors";
import Select from "@/components/Select";
import DatePicker from "@/components/DatePicker";
import { PRIORITIES } from "@/lib/types";

type CompanyManagerProps = {
  supplierId: string;
  initialData: {
    company_name: string;
    country: string | null;
    website: string | null;
    priority: string | null;
    follow_up_date: string | null;
    follow_up_note: string | null;
    is_target: boolean | null;
  };
};

export default function CompanyManager({ supplierId, initialData }: CompanyManagerProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_name: initialData.company_name ?? "",
    country: initialData.country ?? "",
    website: initialData.website ?? "",
    priority: initialData.priority ?? "medium",
    follow_up_date: initialData.follow_up_date ?? "",
    follow_up_note: initialData.follow_up_note ?? "",
    is_target: initialData.is_target ?? false,
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

    if (!form.company_name.trim()) {
      setError("Company name is required.");
      return;
    }

    setSaving(true);

    const { error } = await createClient()
      .from("suppliers")
      .update({
        company_name: form.company_name.trim(),
        country: form.country || null,
        website: form.website || null,
        priority: form.priority,
        follow_up_date: form.follow_up_date || null,
        follow_up_note: form.follow_up_note || null,
        is_target: form.is_target,
      })
      .eq("id", supplierId);

    if (error) {
      setError(saveErrorMessage(error, "connection", "Could not save company details."));
      setSaving(false);
      return;
    }

    router.push(`/connections/${supplierId}`);
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
        <h2 className="text-sm font-semibold mb-4">Company details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company name *" span2>
            <Input
              value={form.company_name}
              onChange={(v) => set("company_name", v)}
              placeholder="e.g. Jiangsu Oleo Co., Ltd"
            />
          </Field>

          <Field label="Country">
            <Input value={form.country} onChange={(v) => set("country", v)} placeholder="China" />
          </Field>

          <Field label="Website">
            <Input value={form.website} onChange={(v) => set("website", v)} placeholder="https://…" />
          </Field>

          <Field label="Priority">
            <Select value={form.priority} onChange={(v) => set("priority", v)} options={PRIORITIES} />
          </Field>

          <Field label="Follow-up date">
            <Input type="date" value={form.follow_up_date} onChange={(v) => set("follow_up_date", v)} />
          </Field>

          <Field label="Follow-up note" span2>
            <Input
              value={form.follow_up_note}
              onChange={(v) => set("follow_up_note", v)}
              placeholder="What's the next action? e.g. Send quotation for green tea"
            />
          </Field>

          <Field label="Saved as target (before show)">
            <label className="flex items-center gap-2 h-9">
              <input
                type="checkbox"
                checked={form.is_target}
                onChange={(e) => set("is_target", e.target.checked)}
                className="h-4 w-4 rounded border-ink-300"
              />
              <span className="text-sm text-ink-700">Yes, this was a pre-show target</span>
            </label>
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save company details"}
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
  span2,
  children,
}: {
  label: string;
  span2?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`block ${span2 ? "sm:col-span-2" : ""}`}>
      <span className="block text-sm font-medium text-ink-700 mb-1.5">{label}</span>
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
