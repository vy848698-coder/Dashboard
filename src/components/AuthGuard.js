"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthed } from "@/data/auth";

// Blocks dashboard pages until the owner is logged in. Unauthenticated
// visitors are redirected to /signin. Renders nothing until the check
// completes, so protected content never flashes.
export default function AuthGuard({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (isAuthed()) {
      setOk(true);
    } else {
      router.replace("/signin");
    }
  }, [router]);

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}
