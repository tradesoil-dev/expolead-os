"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import ModernSelect from "@/components/Select";
import DatePicker from "@/components/DatePicker";
import {
  INTEREST_TYPES,
  PRIORITIES,
  FOLLOW_UP_STATUSES,
  type Exhibition,
} from "@/lib/types";
import { User, Building2, Tag, MapPin, StickyNote } from "lucide-react";

const SI = { size: 15, strokeWidth: 2 } as const;

export default function SupplierForm({ exhibitions }: { exhibitions: Exhibition[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_name: "",
    country: "",
    website: "",
    interest_type: "supplier",
    priority: "medium",
    follow_up_status: "new",
    follow_up_date: "",
    exhibition_id: "",
    booth_number: "",
    hall: "",
    stand_location: "",
    visited: false,
    visit_date: "",
    is_target: false,
    notes: "",
    products: "",
  });

  const [contact, setContact] = useState({
    full_name: "",
    position: "",
    email: "",
    phone: "",
    whatsapp: "",
    wechat: "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setC<K extends keyof typeof contact>(k: K, v: (typeof contact)[K]) {
    setContact((c) => ({ ...c, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Supabase isn't connected yet. Add your keys to .env.local to save data.");
      return;
    }

    if (!contact.full_name.trim()) {
      setError("Contact name is required.");
      return;
    }

    if (!form.company_name.trim()) {
      setError("Company name is required.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          company_name: form.company_name.trim(),
          country: form.country || null,
          website: form.website || null,
          interest_type: form.interest_type,
          priority: form.priority,
          follow_up_status: form.follow_up_status,
          follow_up_date: form.follow_up_date || null,
          categories: [],
          exhibition_id: form.exhibition_id || null,
          booth_number: form.booth_number || null,
          hall: form.hall || null,
          stand_location: form.stand_location || null,
          visited: form.visited,
          visit_date: form.visit_date || null,
          is_target: form.is_target,
          notes: form.notes || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      const supplierId = data.id as string;

      const hasContact = Object.values(contact).some((v) => v.trim());
      if (hasContact) {
        await supabase.from("contacts").insert({
          supplier_id: supplierId,
          full_name: contact.full_name || null,
          position: contact.position || null,
          email: contact.email || null,
          phone: contact.phone || null,
          whatsapp: contact.whatsapp || null,
          wechat: contact.wechat || null,
          is_primary: true,
        });
      }

      // Products discussed at the booth (comma-separated) → one row each
      const productNames = form.products
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      if (productNames.length > 0) {
        await supabase.from("products").insert(
          productNames.map((name) => ({ supplier_id: supplierId, name }))
        );
      }

      router.push(`/suppliers/${supplierId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save supplier.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <Link href="/suppliers" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
        ← Back to connections
      </Link>
      <div className="flex flex-col lg:flex-row gap-4 items-start">
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20">
          {error}
        </p>
      )}

      <Section title="Primary contact" icon={<User {...SI} />}>
        <Grid>
          <Field label="Full name *">
            <Input value={contact.full_name} onChange={(v) => setC("full_name", v)} placeholder="Li Wei" />
          </Field>

          <Field label="Position">
            <Input value={contact.position} onChange={(v) => setC("position", v)} placeholder="Sales Manager" />
          </Field>

          <Field label="Email">
            <Input type="email" value={contact.email} onChange={(v) => setC("email", v)} placeholder="li@company.com" />
          </Field>

          <Field label="Phone">
            <Input value={contact.phone} onChange={(v) => setC("phone", v)} />
          </Field>

          <Field label="WhatsApp">
            <Input value={contact.whatsapp} onChange={(v) => setC("whatsapp", v)} />
          </Field>

          <Field label="WeChat">
            <Input value={contact.wechat} onChange={(v) => setC("wechat", v)} />
          </Field>
        </Grid>
      </Section>

      <Section title="Company" icon={<Building2 {...SI} />}>
        <Grid>
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

          <Field label="Products discussed (comma-separated)" span2>
            <Input
              value={form.products}
              onChange={(v) => set("products", v)}
              placeholder="e.g. Oleic Acid, Stearic Acid, Glycerine"
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Classification" icon={<Tag {...SI} />}>
        <Grid>
          <Field label="Classification">
            <Select value={form.interest_type} onChange={(v) => set("interest_type", v)} options={INTEREST_TYPES} />
          </Field>

          <Field label="Priority">
            <Select value={form.priority} onChange={(v) => set("priority", v)} options={PRIORITIES} />
          </Field>

          <Field label="Follow-up status">
            <Select value={form.follow_up_status} onChange={(v) => set("follow_up_status", v)} options={FOLLOW_UP_STATUSES} />
          </Field>

          <Field label="Follow-up date">
            <Input type="date" value={form.follow_up_date} onChange={(v) => set("follow_up_date", v)} />
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
        </Grid>
      </Section>

      <Section title="Booth & exhibition" icon={<MapPin {...SI} />}>
        <Grid>
          <Field label="Exhibition">
            <Select
              value={form.exhibition_id}
              onChange={(v) => set("exhibition_id", v)}
              options={[{ value: "", label: "— None —" }, ...exhibitions.map((ex) => ({ value: ex.id, label: ex.name }))]}
            />
          </Field>

          <Field label="Hall">
            <Input value={form.hall} onChange={(v) => set("hall", v)} placeholder="e.g. Hall 3" />
          </Field>

          <Field label="Booth number">
            <Input value={form.booth_number} onChange={(v) => set("booth_number", v)} placeholder="e.g. 3.2E15" />
          </Field>

          <Field label="Stand location">
            <Input value={form.stand_location} onChange={(v) => set("stand_location", v)} placeholder="Near raw materials zone" />
          </Field>

          <Field label="Visited">
            <label className="flex items-center gap-2 h-9">
              <input
                type="checkbox"
                checked={form.visited}
                onChange={(e) => set("visited", e.target.checked)}
                className="h-4 w-4 rounded border-ink-300"
              />
              <span className="text-sm text-ink-700">Yes, visited this booth</span>
            </label>
          </Field>

          <Field label="Visit date">
            <Input type="date" value={form.visit_date} onChange={(v) => set("visit_date", v)} />
          </Field>
        </Grid>
      </Section>

      <Section title="Notes" icon={<StickyNote {...SI} />}>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={4}
          placeholder="What did you discuss? Products of interest, pricing, samples promised…"
          className={`${inputClass} resize-y`}
        />
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save connection"}
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

    {/* Guide note — coaches first-time users */}
    <div className="w-full max-w-sm rounded-xl border border-emerald-100 bg-emerald-50 p-5">
      <p className="text-sm font-bold text-emerald-900 mb-3">New here? Capturing a connection</p>
      <div className="space-y-2.5">
        <div className="flex gap-2.5 items-start">
          <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">1</span>
          <p className="text-xs leading-relaxed text-emerald-800">Start with the person you met — their name (required), role, and how to reach them: email, WhatsApp or WeChat.</p>
        </div>
        <div className="flex gap-2.5 items-start">
          <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">2</span>
          <p className="text-xs leading-relaxed text-emerald-800">Add their company — name, country and what they trade. Tick &ldquo;target&rdquo; if it&rsquo;s one you plan to visit.</p>
        </div>
        <div className="flex gap-2.5 items-start">
          <span className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">3</span>
          <p className="text-xs leading-relaxed text-emerald-800">Classify, set a follow-up date, link the exhibition and add notes — then save.</p>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition";

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        {icon && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

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
  onChange: (v: string) => void;
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

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return <ModernSelect value={value} onChange={onChange} options={options} />;
}