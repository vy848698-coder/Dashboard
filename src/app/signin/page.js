"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate() {
    const errs = {};
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
    // UI-only: simulate sign-in, then go to the dashboard.
    await new Promise((r) => setTimeout(r, 600));
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 text-center">Sign in</h1>
          <p className="text-sm text-gray-500 text-center mt-1 mb-6">
            Welcome back to your admin panel.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="admin@clansmachina.com"
                className={inputCls(errors.email)}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="#" className="text-xs text-brand-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                className={inputCls(errors.password)}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function inputCls(error) {
  return `w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? "border-red-300 focus:ring-red-100"
      : "border-gray-200 focus:border-brand-400 focus:ring-brand-100"
  }`;
}
