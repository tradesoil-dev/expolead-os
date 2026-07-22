"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Select from "@/components/Select";
import { QUANTITY_UNITS, DEFAULT_QUANTITY_UNIT } from "@/lib/quantity-units";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currencies";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [about, setAbout] = useState("");
  const [quantityUnit, setQuantityUnit] = useState(DEFAULT_QUANTITY_UNIT);
  const [savingUnit, setSavingUnit] = useState(false);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [posY, setPosY] = useState(50);
  const [adjusting, setAdjusting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragState = useRef<{ startY: number; startPosY: number } | null>(null);

  const supabase = createClient();

  const initials = fullName
    ? fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "ME";

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, company_name, role, country, linkedin_url, about, avatar_url, avatar_position_y, quantity_unit, currency")
      .eq("id", user.id)
      .single();
    if (data) {
      setFullName(data.full_name || "");
      setCompanyName(data.company_name || "");
      setRole(data.role || "");
      setCountry(data.country || "");
      setLinkedinUrl(data.linkedin_url || "");
      setAbout(data.about || "");
      setAvatarUrl(data.avatar_url || null);
      setPosY(data.avatar_position_y ?? 50);
      setQuantityUnit(data.quantity_unit || DEFAULT_QUANTITY_UNIT);
      setCurrency(data.currency || DEFAULT_CURRENCY);
    }
  }

  async function saveQuantityUnit(unit: string) {
    setQuantityUnit(unit);
    setSavingUnit(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavingUnit(false); return; }
    const { error } = await supabase.from("profiles").upsert({ id: user.id, quantity_unit: unit });
    setSavingUnit(false);
    showToast(error ? error.message : "Quantity unit saved.", error ? "error" : "success");
  }

  async function saveCurrency(next: string) {
    setCurrency(next);
    setSavingCurrency(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavingCurrency(false); return; }
    const { error } = await supabase.from("profiles").upsert({ id: user.id, currency: next });
    setSavingCurrency(false);
    showToast(error ? error.message : "Currency saved.", error ? "error" : "success");
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { showToast(uploadError.message, "error"); setUploading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(url);
    setPosY(50);
    setAdjusting(true);
    await supabase.from("profiles").upsert({ id: user.id, avatar_url: url, avatar_position_y: 50 });
    setUploading(false);
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragState.current = { startY: e.clientY, startPosY: posY };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onTouchStart(e: React.TouchEvent) {
    dragState.current = { startY: e.touches[0].clientY, startPosY: posY };
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragState.current) return;
    const dy = e.clientY - dragState.current.startY;
    setPosY(Math.max(0, Math.min(100, dragState.current.startPosY + dy * 0.5)));
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragState.current) return;
    const dy = e.touches[0].clientY - dragState.current.startY;
    setPosY(Math.max(0, Math.min(100, dragState.current.startPosY + dy * 0.5)));
  }

  function onMouseUp() {
    dragState.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  function onTouchEnd() {
    dragState.current = null;
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  }

  async function savePosition() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, avatar_position_y: Math.round(posY) });
    setAdjusting(false);
  }

  async function saveProfile() {
    setSaving(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) { showToast("Please login again.", "error"); setSaving(false); return; }
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, full_name: fullName, company_name: companyName,
      role, country, linkedin_url: linkedinUrl, about,
      avatar_url: avatarUrl, avatar_position_y: Math.round(posY),
    });
    setSaving(false);
    if (error) { showToast(error.message, "error"); return; }
    showToast("Profile saved successfully.", "success");
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const avatarStyle: React.CSSProperties = {
    width: 80, height: 80, borderRadius: 18, overflow: "hidden",
    flexShrink: 0, background: "#d1fae5",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const imgStyle: React.CSSProperties = {
    width: "100%", height: "100%", objectFit: "cover",
    objectPosition: `center ${posY}%`, display: "block",
    cursor: adjusting ? "ns-resize" : "default",
    userSelect: "none",
  };

  const adjustPreviewStyle: React.CSSProperties = {
    width: 120, height: 120, borderRadius: 20, overflow: "hidden",
    border: "2px solid #059669", cursor: "ns-resize", flexShrink: 0,
    userSelect: "none",
  };

  const adjustImgStyle: React.CSSProperties = {
    width: "100%", height: "100%", objectFit: "cover",
    objectPosition: `center ${posY}%`, display: "block",
    pointerEvents: "none",
  };

  return (
    <main className="p-5 max-w-6xl">
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg text-sm font-medium w-max max-w-[calc(100vw-2rem)] ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
          {toast.type === "success" ? (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your ExpoLead OS account, workspace and preferences.</p>
      </div>

      <div className="mb-5 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div style={avatarStyle} className="text-xl font-bold text-emerald-700">
              {avatarUrl
                ? <img src={avatarUrl} alt="Avatar" style={imgStyle} />
                : initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{fullName || "Your Name"}</h2>
              <p className="mt-1 text-sm text-slate-600">{role || "Your Role"} at {companyName || "Your Company"}</p>
              <p className="mt-1 text-sm text-slate-500">{country || "Country"}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-emerald-50 px-4 py-3 text-sm">
            <p className="font-bold text-emerald-700">ExpoLead OS Account</p>
            <p className="text-xs text-slate-500">Profile active</p>
          </div>
        </div>
        {about && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">About</p>
            <p className="mt-1 text-sm leading-5 text-slate-700">{about}</p>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Profile Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Company Name</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ABC Trading Ltd" className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Role</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Business Development Manager" className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Sri Lanka" className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">LinkedIn URL</label>
              <input type="text" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/your-profile" className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">About Me</label>
              <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Write a short professional profile..." rows={3} className="w-full rounded-lg border px-3 py-2 text-sm resize-y" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Profile Photo</h3>

            {adjusting && avatarUrl ? (
              <div className="mt-4">
                <p className="mb-2 text-xs text-slate-500">Drag up or down to reposition</p>
                <div
                  style={adjustPreviewStyle}
                  onMouseDown={onMouseDown}
                  onTouchStart={onTouchStart}
                >
                  <img src={avatarUrl} alt="Adjust" style={adjustImgStyle} draggable={false} />
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={savePosition} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                    Save position
                  </button>
                  <button onClick={() => setAdjusting(false)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-4">
                <div style={avatarStyle} className="text-xl font-bold text-emerald-700">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="Avatar" style={{ ...imgStyle, cursor: "default" }} />
                    : initials}
                </div>
                <div className="space-y-2">
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="block rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    {uploading ? "Uploading…" : avatarUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                  {avatarUrl && (
                    <button onClick={() => setAdjusting(true)}
                      className="block rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                      Adjust position
                    </button>
                  )}
                  <p className="text-xs text-slate-500">PNG, JPG or WebP · max 2 MB</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Workspace Preferences</h3>
            <p className="mt-1 text-sm text-slate-600">The unit your deals are measured in. Applies across your dashboard, opportunities, and reports.</p>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Quantity unit</label>
              <Select
                value={quantityUnit}
                onChange={saveQuantityUnit}
                options={QUANTITY_UNITS}
                disabled={savingUnit}
              />
              <p className="mt-2 text-xs text-slate-500">Pick MT for bulk commodities, or cartons, units, kg, and more for packaged goods.</p>
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Currency</label>
              <Select
                value={currency}
                onChange={saveCurrency}
                options={CURRENCIES}
                disabled={savingCurrency}
              />
              <p className="mt-2 text-xs text-slate-500">Used for optional deal values and exhibition costs. One currency per workspace, so figures stay comparable.</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Account Status</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Workspace</span>
                <span className="font-semibold text-emerald-700">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Profile</span>
                <span className="font-semibold text-emerald-700">Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Email</span>
                <span className="font-semibold text-emerald-700">Verified</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Account Security</h3>
            <p className="mt-2 text-sm text-slate-600">Password and login settings will be added later.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
