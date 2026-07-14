"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
            className="rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Update contact"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-ink-500 hover:text-ink-900"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="py-3 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">
          {contact.full_name ?? "—"}
          {contact.is_primary && (
            <span className="ml-2 text-[10px] text-ink-400">PRIMARY</span>
          )}
        </p>
        <p className="text-xs text-ink-500">{contact.position ?? ""}</p>

        <div className="mt-2 flex gap-3 text-xs">
          <button onClick={() => setEditing(true)} className="text-brand-600 hover:text-brand-700">
            Edit
          </button>
          <button onClick={deleteContact} className="text-rose-600 hover:text-rose-700">
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