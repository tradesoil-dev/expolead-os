"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AddContactForm({ supplierId }: { supplierId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [c, setC] = useState({
    full_name: "",
    position: "",
    email: "",
    phone: "",
    whatsapp: "",
    wechat: "",
    is_primary: false,
  });

  function set<K extends keyof typeof c>(k: K, v: (typeof c)[K]) {
    setC((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    if (!isSupabaseConfigured) return;

    const hasData = Object.entries(c).some(([key, value]) => {
      if (key === "is_primary") return false;
      return String(value).trim();
    });

    if (!hasData) return;

    setSaving(true);

    await createClient().from("contacts").insert({
      supplier_id: supplierId,
      full_name: c.full_name || null,
      position: c.position || null,
      email: c.email || null,
      phone: c.phone || null,
      whatsapp: c.whatsapp || null,
      wechat: c.wechat || null,
      is_primary: c.is_primary,
    });

    setSaving(false);
    setC({
      full_name: "",
      position: "",
      email: "",
      phone: "",
      whatsapp: "",
      wechat: "",
      is_primary: false,
    });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        + Add contact
      </button>
    );
  }

  const inp =
    "rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

  return (
    <div className="rounded-lg border border-ink-200 p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input className={inp} placeholder="Full name" value={c.full_name} onChange={(e) => set("full_name", e.target.value)} />
        <input className={inp} placeholder="Position" value={c.position} onChange={(e) => set("position", e.target.value)} />
        <input className={inp} placeholder="Email" value={c.email} onChange={(e) => set("email", e.target.value)} />
        <input className={inp} placeholder="Phone" value={c.phone} onChange={(e) => set("phone", e.target.value)} />
        <input className={inp} placeholder="WhatsApp" value={c.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        <input className={inp} placeholder="WeChat" value={c.wechat} onChange={(e) => set("wechat", e.target.value)} />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-600">
        <input
          type="checkbox"
          checked={c.is_primary}
          onChange={(e) => set("is_primary", e.target.checked)}
        />
        Primary contact
      </label>

      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save contact"}
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-ink-500 hover:text-ink-900">
          Cancel
        </button>
      </div>
    </div>
  );
}