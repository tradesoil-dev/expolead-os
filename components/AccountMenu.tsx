"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AccountMenu({ email }: { email: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPosY, setAvatarPosY] = useState(50);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const initials = fullName
    ? fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : email
    ? email.slice(0, 2).toUpperCase()
    : "ME";

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("full_name, company_name, avatar_url, avatar_position_y, trial_ends_at, subscription_status, early_access, is_admin")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFullName(data.full_name || "");
            setCompanyName(data.company_name || "");
            setAvatarUrl(data.avatar_url || null);
            setAvatarPosY(data.avatar_position_y ?? 50);
            setIsAdmin(!!data.is_admin);
            if (!data.early_access && data.subscription_status !== "active" && data.trial_ends_at) {
              const days = Math.ceil(
                (new Date(data.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              setDaysLeft(Math.max(0, days));
              setIsExpired(days <= 0);
            }
          }
        });
    });
  }, []);

  const handleOpen = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((o) => !o);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function signOut() {
    if (isSupabaseConfigured) await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="h-11 w-11 rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 hover:bg-emerald-200 transition-colors overflow-hidden grid place-items-center"
        aria-label="Account menu"
      >
        {avatarUrl
          ? <img src={avatarUrl} alt="Avatar" style={{ width: 44, height: 44, objectFit: "cover", objectPosition: `center ${avatarPosY}%`, display: "block" }} />
          : initials}
      </button>

      {open && (
        <div
          ref={ref}
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
          className="fixed z-[9999] w-64 rounded-xl border border-ink-200 bg-white shadow-lg overflow-hidden"
        >
          {/* Identity */}
          <div className="px-4 py-3 border-b border-ink-100">
            <p className="text-sm font-semibold text-ink-900 truncate">
              {fullName || "Your account"}
            </p>
            {companyName && (
              <p className="text-xs text-ink-500 truncate mt-0.5">{companyName}</p>
            )}
            {email && (
              <p className="text-xs text-ink-400 truncate mt-0.5">{email}</p>
            )}
            {!fullName && (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 block"
              >
                Complete your profile →
              </Link>
            )}
          </div>

          {/* My Account */}
          <div className="py-2 border-b border-ink-100">
            <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-400">
              My Account
            </p>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <ProfileIcon className="h-4 w-4 text-ink-400" />
              My Profile
            </Link>
          </div>

          {/* Admin (only for admins) */}
          {isAdmin && (
            <div className="py-2 border-b border-ink-100 bg-emerald-50/60">
              <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Admin
              </p>
              <Link
                href="/admin/people"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="7" r="3" />
                  <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                  <path d="M16 3.5a4 4 0 010 7M21 20c0-2.7-1.6-5-4-5.7" />
                </svg>
                People
                <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Admin</span>
              </Link>
              <Link
                href="/admin/library"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 5a2 2 0 012-2h13a1 1 0 011 1v15a1 1 0 01-1 1H6a2 2 0 01-2-2V5z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 3v16" strokeLinecap="round" />
                </svg>
                Exhibition Library
                <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Admin</span>
              </Link>
            </div>
          )}

          {/* Trial status */}
          {daysLeft !== null && (
            <div className={`mx-3 my-2 rounded-lg px-3 py-2 text-xs ${isExpired ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
              {isExpired
                ? "Trial ended — upgrade to add new records."
                : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in your free trial.`}
              <Link
                href="/upgrade"
                onClick={() => setOpen(false)}
                className="ml-2 font-bold underline"
              >
                View Plans
              </Link>
            </div>
          )}

          {/* Workspace */}
          <div className="py-2 border-b border-ink-100">
            <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-400">
              Workspace
            </p>
            <Link
              href="/upgrade"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <BillingIcon className="h-4 w-4 text-ink-400" />
              <span>View Plans</span>
            </Link>
            <div className="flex items-center gap-3 px-4 py-2 text-sm text-ink-300 cursor-not-allowed select-none">
              <UsersIcon className="h-4 w-4" />
              <span>Manage Users</span>
              <span className="ml-auto text-[10px] font-semibold text-ink-300 border border-ink-200 rounded px-1.5 py-0.5">
                Soon
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 text-sm text-ink-300 cursor-not-allowed select-none">
              <BillingIcon className="h-4 w-4" />
              <span>Billing</span>
              <span className="ml-auto text-[10px] font-semibold text-ink-300 border border-ink-200 rounded px-1.5 py-0.5">
                Soon
              </span>
            </div>
          </div>

          {/* Sign out */}
          <div className="py-1">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <SignOutIcon className="h-4 w-4 text-ink-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
      <path d="M21 20c0-3-1.8-5.5-4.5-6.3" strokeLinecap="round" />
    </svg>
  );
}

function BillingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" strokeLinecap="round" />
    </svg>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
