"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    async function exchangeToken() {
      if (!isSupabaseConfigured) { setVerifying(false); return; }
      const supabase = createClient();

      // PKCE flow: token_hash + type in query params
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (error) {
          setError("This reset link has expired or already been used. Please request a new one.");
          setVerifying(false);
          return;
        }
        setSessionReady(true);
        setVerifying(false);
        return;
      }

      // Implicit flow: check if there is already an active recovery session
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSessionReady(true);
      } else {
        setError("This reset link has expired or already been used. Please request a new one.");
      }
      setVerifying(false);
    }

    exchangeToken();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Set new password
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Choose a strong password for your ExpoLead OS account.
        </p>

        {verifying ? (
          <p className="mt-8 text-sm text-slate-400">Verifying your reset link...</p>
        ) : !sessionReady ? (
          <div className="mt-8 rounded-xl bg-rose-50 border border-rose-200 px-5 py-4">
            <p className="text-sm font-semibold text-rose-700">Link expired</p>
            <p className="mt-1 text-sm text-rose-600">{error}</p>
            <a href="/reset-password" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Request a new reset link
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">New password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">Confirm password</span>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </label>

            {error && (
              <p className="text-sm text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-600/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-3.5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense>
      <UpdatePasswordForm />
    </Suspense>
  );
}
