"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  Users,
  MessageSquare,
  FlaskConical,
  FileText,
  CircleCheck,
} from "lucide-react";

type Mode = "signin" | "signup";

const stages = [
  {
    title: "Booth Visit",
    subtitle: "Capture contact",
    icon: <Users size={20} />,
  },
  {
    title: "Discussion",
    subtitle: "Explore opportunity",
    icon: <MessageSquare size={20} strokeWidth={1.5} />,
  },
  {
    title: "Sample",
    subtitle: "Evaluate product",
    icon: <FlaskConical size={20} />,
  },
  {
    title: "Quote Review",
    subtitle: "Review pricing",
    icon: <FileText size={20} />,
  },
  {
    title: "Order Ready",
    subtitle: "Commercial ready",
    icon: <CircleCheck size={20} />,
  },
];

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "signup" ? "signup" : "signin"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((current) => (current === 4 ? 0 : current + 1));
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured) {
      setError("Supabase isn't connected yet. Add your keys to .env.local to enable sign-in.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setInfo("Account created. Check your email to confirm, then sign in.");
          setMode("signin");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen grid lg:grid-cols-[1fr_1fr] bg-white overflow-hidden">
      <section className="hidden lg:flex h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.14),transparent_34%),linear-gradient(135deg,#f8fafc,#eefaf6,#f8fbff)] px-10">
        <div className="absolute top-8 left-10">
  <div className="inline-block text-center">
    <h1 className="text-3xl font-bold tracking-tight text-ink-900">
      ExpoLead OS
    </h1>

    <div className="mt-1 w-full text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
      Powered by Tradesoil
    </div>
  </div>
</div>
        <div className="w-full max-w-[520px] rounded-[2rem] bg-white/60 p-6 shadow-xl backdrop-blur">
          <div className="flex justify-center py-10">
  <div className="scale-[5] text-emerald-700">
    {stages[activeStep].icon}
  </div>
</div>

          <div className="relative mt-16 mx-auto w-full max-w-sm">
            {/* Background line */}
            <div className="absolute left-7 right-7 top-7 h-0.5 bg-emerald-100" />
            {/* Progress line — grows left to right with each stage */}
            <div
              className="absolute left-7 right-7 top-7 h-0.5 bg-emerald-600 origin-left transition-transform duration-500"
              style={{ transform: `scaleX(${activeStep / (stages.length - 1)})` }}
            />

            <div className="relative flex items-start justify-between">
              {stages.map((stage, index) => {
                const completed = index < activeStep;
                const active = index === activeStep;
                return (
                  <div key={stage.title} className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={`grid h-14 w-14 place-items-center rounded-full transition-colors duration-500 ${
                        completed || active
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white border-2 border-emerald-200 text-ink-400"
                      }`}
                    >
                      {completed
                        ? <span className="text-lg font-bold">✓</span>
                        : <span className={active ? "text-white" : "text-ink-400"}>{stage.icon}</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-14 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              ExpoLead Workspace
            </div>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-ink-900">
              {stages[activeStep].title}
            </h2>

            <p className="mt-3 text-base text-ink-500">
              {stages[activeStep].subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="w-full max-w-md self-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h1>

          <p className="mt-3 text-sm text-ink-500">
            {mode === "signin"
              ? "Enter your credentials to access your account."
              : "Start capturing connections from your next exhibition."}
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-bold uppercase tracking-wide text-ink-700">Password</span>
                {mode === "signin" && (
                  <Link href="/reset-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Forgot password?</Link>
                )}
              </div>
              <input
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            {error && (
              <p className="text-sm text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-600/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {info && (
              <p className="text-sm text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-600/20 rounded-lg px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-3.5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading
                ? mode === "signin" ? "Signing in…" : "Creating account…"
                : mode === "signin" ? "Sign in →" : "Create account"}
            </button>
          </form>

          <p className="text-sm text-ink-500 mt-7 text-center">
            {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>

          {!isSupabaseConfigured && (
            <p className="text-xs text-ink-400 text-center mt-4">
              Connect Supabase in <code>.env.local</code> to enable authentication.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wide text-ink-700 mb-2">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
      />
    </label>
  );
}