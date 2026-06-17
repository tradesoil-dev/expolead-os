"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AddProductForm({ supplierId }: { supplierId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    application: "",
    certifications: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!isSupabaseConfigured) return;
    if (!form.name.trim()) return;

    setSaving(true);

    await createClient().from("products").insert({
      supplier_id: supplierId,
      name: form.name.trim(),
      application: form.application || null,
      certifications: form.certifications
        ? form.certifications.split(",").map((c) => c.trim()).filter(Boolean)
        : [],
    });

    setSaving(false);
    setForm({ name: "", application: "", certifications: "" });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        + Add product
      </button>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

  return (
    <div className="rounded-lg border border-ink-200 p-3 space-y-3">
      <input
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Product name, e.g. Oleic Acid"
        className={inputClass}
      />

      <input
        value={form.application}
        onChange={(e) => set("application", e.target.value)}
        placeholder="Application, e.g. Biodiesel / FAME feedstock"
        className={inputClass}
      />

      <input
        value={form.certifications}
        onChange={(e) => set("certifications", e.target.value)}
        placeholder="Certifications, comma-separated e.g. ISCC, MSDS"
        className={inputClass}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-ink-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save product"}
        </button>

        <button
          onClick={() => setOpen(false)}
          className="text-sm text-ink-500 hover:text-ink-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}