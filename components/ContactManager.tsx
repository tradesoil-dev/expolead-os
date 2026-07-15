"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EditButton from "@/components/EditButton";

type Contact = {
  id: string;
  full_name: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  wechat: string | null;
  is_primary: boolean | null;
};

type ContactForm = {
  full_name: string;
  position: string;
  email: string;
  phone: string;
  whatsapp: string;
  wechat: string;
  is_primary: boolean;
};

export default function ContactManager({
  contact,
}: {
  contact: Contact;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ContactForm>({
    full_name: contact.full_name ?? "",
    position: contact.position ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    whatsapp: contact.whatsapp ?? "",
    wechat: contact.wechat ?? "",
    is_primary: contact.is_primary ?? false,
  });

  function set<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function updateContact() {
    setSaving(true);

    await createClient()
      .from("contacts")
      .update({
        full_name: form.full_name || null,
        position: form.position || null,
        email: form.email || null,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        wechat: form.wechat || null,
        is_primary: form.is_primary,
      })
      .eq("id", contact.id);

    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function deleteContact() {
    const confirmed = window.confirm("Delete this contact?");
    if (!confirmed) return;

    await createClient().from("contacts").delete().eq("id", contact.id);
    router.refresh();
  }

  const inp =
    "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";
  const lbl = "mb-1 block text-xs font-bold uppercase tracking-wide text-ink-500";

  if (editing) {
    return (
      <li className="py-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Full name</label>
            <input className={inp} placeholder="Gerald Perera" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Position</label>
            <input className={inp} placeholder="Sales Manager" value={form.position} onChange={(e) => set("position", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input className={inp} placeholder="name@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input className={inp} placeholder="+94 77 123 4567" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>WhatsApp</label>
            <input className={inp} placeholder="+94 77 123 4567" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </div>
          <div>
            <label className={lbl}>WeChat</label>
            <input className={inp} placeholder="WeChat ID" value={form.wechat} onChange={(e) => set("wechat", e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={form.is_primary}
            onChange={(e) => set("is_primary", e.target.checked)}
          />
          Primary contact
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={updateContact}
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save contact"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="py-3 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">
          {contact.is_primary ? "Primary contact" : "Contact"}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-ink-900">{contact.full_name ?? "—"}</p>
        <p className="text-xs text-ink-500">{contact.position ?? ""}</p>

        <div className="mt-2 flex items-center gap-2">
          <EditButton onClick={() => setEditing(true)} />
          <button onClick={deleteContact} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            Delete
          </button>
        </div>
      </div>

      <div className="text-right text-xs text-ink-600 space-y-0.5">
        {contact.email && <p>{contact.email}</p>}
        {contact.phone && <p>{contact.phone}</p>}
        {contact.whatsapp && <p>WhatsApp: {contact.whatsapp}</p>}
        {contact.wechat && <p>WeChat: {contact.wechat}</p>}
      </div>
    </li>
  );
}