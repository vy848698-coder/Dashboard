"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { inquiries as MOCK_INQUIRIES } from "@/data/inquiries";

const API_URL = process.env.NEXT_PUBLIC_INQUIRIES_API;
const UPDATE_URL = process.env.NEXT_PUBLIC_UPDATE_STATUS_API;

const InquiriesContext = createContext({
  inquiries: [],
  loading: true,
  source: "mock",
  error: null,
  refresh: () => {},
  updateStatus: () => {},
});

export function InquiriesProvider({ children }) {
  const [inquiries, setInquiries] = useState(MOCK_INQUIRIES);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("mock");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    // No API configured → stay on mock data.
    if (!API_URL) {
      setSource("mock");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Expected a JSON array");
      setInquiries(data);
      setSource("live");
      setError(null);
    } catch (e) {
      // Fall back to mock data so the dashboard still works offline.
      setInquiries(MOCK_INQUIRIES);
      setSource("mock");
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Poll every 30s so new form submissions appear without a manual refresh.
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  // Update a lead's status. Optimistically updates the UI, then persists to
  // MySQL via the PHP endpoint (when configured).
  const updateStatus = useCallback(async (id, status) => {
    setInquiries((list) =>
      list.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
    if (!UPDATE_URL) return { ok: true, persisted: false };
    try {
      const res = await fetch(UPDATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, persisted: true };
    } catch (e) {
      return { ok: false, persisted: false, error: e.message };
    }
  }, []);

  return (
    <InquiriesContext.Provider
      value={{ inquiries, loading, source, error, refresh: load, updateStatus }}
    >
      {children}
    </InquiriesContext.Provider>
  );
}

export function useInquiries() {
  return useContext(InquiriesContext);
}
