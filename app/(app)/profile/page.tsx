"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [about, setAbout] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const initials = fullName
    ? fullName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ME";

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("full_name, company_name, role, country, linkedin_url, about")
      .eq("id", user.id)
      .single();

    if (data) {
      setFullName(data.full_name || "");
      setCompanyName(data.company_name || "");
      setRole(data.role || "");
      setCountry(data.country || "");
      setLinkedinUrl(data.linkedin_url || "");
      setAbout(data.about || "");
    }
  }

  async function saveProfile() {
    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Please login again.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      company_name: companyName,
      role,
      country,
      linkedin_url: linkedinUrl,
      about,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile saved successfully.");
  }

  return (
    <main className="p-5 max-w-6xl">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your ExpoLead OS account, workspace and preferences.
        </p>
      </div>

      <div className="mb-5 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700">
              {initials}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {fullName || "Your Name"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {role || "Your Role"} at {companyName || "Your Company"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {country || "Country"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-emerald-50 px-4 py-3 text-sm">
            <p className="font-bold text-emerald-700">ExpoLead OS Account</p>
            <p className="text-xs text-slate-500">Profile active</p>
          </div>
        </div>

        {about && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              About
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-700">{about}</p>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            Profile Details
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="ABC Trading Ltd"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Business Development Manager"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Sri Lanka"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                About Me
              </label>
              <textarea
  value={about}
  onChange={(e) => setAbout(e.target.value)}
  placeholder="Write a short professional profile..."
  rows={3}
  className="w-full rounded-lg border px-3 py-2 text-sm resize-y"
/>
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Profile Photo</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700">
                {initials}
              </div>
              <div>
                <button className="rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Upload Photo
                </button>
                <p className="mt-1 text-xs text-slate-500">
                  Image upload will be connected later.
                </p>
              </div>
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
            <h3 className="text-lg font-bold text-slate-900">
              Account Security
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Password and login settings will be added later.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}