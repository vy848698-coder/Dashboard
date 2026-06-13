"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { checkCredentials, setAuthed } from "@/data/auth";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setAuthError("");
    setErrors((x) => ({ ...x, [key]: undefined }));
  };

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const owner = checkCredentials(form);
    if (owner) {
      setAuthed(owner);
      router.push("/");
    } else {
      setAuthError("Invalid credentials. Access is restricted to owners.");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-sidebar px-4">
      {/* Colored gradient blobs (brand palette) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -top-24 -left-20 w-96 h-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="animate-blob blob-delay-2 absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-steel-500/25 blur-3xl" />
        <div className="animate-blob blob-delay-3 absolute -bottom-28 left-1/4 w-96 h-96 rounded-full bg-gold/20 blur-3xl" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm animate-card-in">
        <div className="group bg-white/95 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl shadow-black/40 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-500/20">
          {/* Brand badge */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-steel-600 flex items-center justify-center shadow-lg shadow-brand-500/40 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <ShieldCheck size={26} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center">Welcome back</h1>
          <p className="text-sm text-gray-500 text-center mt-1 mb-6">
            Sign in to the Clans Machina admin panel.
          </p>

          {authError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Name" icon={User} error={errors.name}>
              <input value={form.name} onChange={set("name")} placeholder="Your name" className={inputCls(errors.name)} />
            </Field>

            <Field label="Email" icon={Mail} error={errors.email}>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputCls(errors.email)} />
            </Field>

            <Field label="Password" icon={Lock} error={errors.password}>
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                className={inputCls(errors.password) + " pr-11"}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-semibold shadow-lg shadow-brand-500/30 transition-all duration-200 hover:shadow-brand-500/50 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          Owner access only · Clans Machina
        </p>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-brand-500"
        />
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `peer w-full pl-11 pr-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
    error
      ? "border-red-300 focus:ring-red-100"
      : "border-gray-200 focus:border-brand-400 focus:ring-brand-100"
  }`;
}
