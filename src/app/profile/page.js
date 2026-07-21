"use client";

import { useEffect, useState } from "react";
import { User, Mail, Lock, Save, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import Avatar from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { getCurrentOwner, updateOwnerProfile, changeOwnerPassword } from "@/data/auth";

export default function ProfilePage() {
  const toast = useToast();
  // `owner` is the saved identity (its email is the lookup key); `profile` is the
  // editable form state.
  const [owner, setOwner] = useState(null);
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const c = getCurrentOwner();
    if (c) {
      setOwner(c);
      setProfile({ name: c.name || "", email: c.email || "" });
    }
  }, []);

  const setP = (key) => (e) => {
    setProfile((f) => ({ ...f, [key]: e.target.value }));
    setProfileErrors((x) => ({ ...x, [key]: undefined }));
  };
  const setPwField = (key) => (e) => {
    setPw((f) => ({ ...f, [key]: e.target.value }));
    setPwErrors((x) => ({ ...x, [key]: undefined }));
  };

  async function saveProfile(e) {
    e.preventDefault();
    const errs = {};
    if (!profile.name.trim()) errs.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) errs.email = "Enter a valid email";
    setProfileErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingProfile(true);
    const res = await updateOwnerProfile(profile);
    if (res.ok) {
      setOwner(res.owner);
      toast("Profile updated.", "success");
    } else {
      setProfileErrors({ email: res.error });
      toast(res.error, "error");
    }
    setSavingProfile(false);
  }

  async function savePassword(e) {
    e.preventDefault();
    const errs = {};
    if (!pw.current) errs.current = "Enter your current password";
    if (!pw.next || pw.next.length < 4) errs.next = "At least 4 characters";
    if (pw.confirm !== pw.next) errs.confirm = "Passwords don't match";
    setPwErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingPw(true);
    const res = await changeOwnerPassword(pw.current, pw.next);
    if (res.ok) {
      setPw({ current: "", next: "", confirm: "" });
      toast("Password changed.", "success");
    } else {
      setPwErrors(/current/i.test(res.error) ? { current: res.error } : { next: res.error });
      toast(res.error, "error");
    }
    setSavingPw(false);
  }

  return (
    <DashboardShell>
      <div className="pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account details and password.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Account details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="p-1 rounded-full bg-gradient-to-br from-brand-400 to-steel-500">
              <Avatar name={profile.name || "Owner"} size={64} className="ring-2 ring-white" />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-gray-900 truncate">{profile.name || "Owner"}</p>
              <p className="text-sm text-brand-600">Owner</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <Field label="Full name" icon={User} error={profileErrors.name}>
              <input value={profile.name} onChange={setP("name")} placeholder="Your name" className={inputCls(profileErrors.name)} />
            </Field>
            <Field label="Email" icon={Mail} error={profileErrors.email}>
              <input type="email" value={profile.email} onChange={setP("email")} placeholder="you@example.com" className={inputCls(profileErrors.email)} />
            </Field>
            <p className="text-xs text-gray-400">You sign in with this email.</p>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium disabled:opacity-60"
            >
              {savingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save changes
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-600" />
            Change password
          </h2>
          <p className="text-sm text-gray-400 mb-4">Use a password you don&apos;t use anywhere else.</p>

          <form onSubmit={savePassword} className="space-y-4">
            <Field label="Current password" icon={Lock} error={pwErrors.current}>
              <input
                type={showPw ? "text" : "password"}
                value={pw.current}
                onChange={setPwField("current")}
                placeholder="••••••••"
                className={inputCls(pwErrors.current) + " pr-11"}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>
            <Field label="New password" icon={Lock} error={pwErrors.next}>
              <input
                type={showPw ? "text" : "password"}
                value={pw.next}
                onChange={setPwField("next")}
                placeholder="At least 4 characters"
                className={inputCls(pwErrors.next)}
              />
            </Field>
            <Field label="Confirm new password" icon={Lock} error={pwErrors.confirm}>
              <input
                type={showPw ? "text" : "password"}
                value={pw.confirm}
                onChange={setPwField("confirm")}
                placeholder="Re-enter new password"
                className={inputCls(pwErrors.confirm)}
              />
            </Field>

            <button
              type="submit"
              disabled={savingPw}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium disabled:opacity-60"
            >
              {savingPw ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              Update password
            </button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `w-full pl-11 pr-3.5 py-2.5 rounded-lg border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-colors ${
    error ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-brand-400 focus:ring-brand-100"
  }`;
}
