"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { withKey } from "@/data/apiConfig";
import { useToast } from "./Toast";

const API_URL = process.env.NEXT_PUBLIC_SAATHI_API;
const UPDATE_URL = process.env.NEXT_PUBLIC_SAATHI_STATUS_API;

// The chatbot writes straight to MySQL, so we poll. 5s keeps new leads feeling
// instant without hammering the PHP endpoint.
const POLL_MS = 5000;

const SaathiContext = createContext({
  leads: [],
  loading: true,
  source: "offline",
  error: null,
  lastUpdated: null,
  freshIds: new Set(),
  refresh: () => {},
  updateStatus: () => {},
});

export function SaathiProvider({ children }) {
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("offline");
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  // Leads that arrived while the dashboard was open (highlighted in the table).
  const [freshIds, setFreshIds] = useState(new Set());
  // Ids seen so far; null until the first successful load so we don't toast
  // every existing lead on page open.
  const knownIds = useRef(null);

  const load = useCallback(async () => {
    if (!API_URL) {
      setSource("offline");
      setError("NEXT_PUBLIC_SAATHI_API is not set");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(API_URL, { cache: "no-store", headers: withKey() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Expected a JSON array");

      if (knownIds.current) {
        const added = data.filter((l) => !knownIds.current.has(l.id));
        if (added.length) {
          setFreshIds((s) => new Set([...s, ...added.map((l) => l.id)]));
          toast(
            added.length === 1
              ? `New Solar Saathi lead: ${added[0].name}`
              : `${added.length} new Solar Saathi leads`,
            "info"
          );
        }
      }
      knownIds.current = new Set(data.map((l) => l.id));

      setLeads(data);
      setSource("live");
      setError(null);
      setLastUpdated(new Date());
    } catch (e) {
      // Keep the last good data on screen; just flag the connection problem.
      setSource("offline");
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    // Catch up immediately when the tab comes back into focus.
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  // Optimistic status change, persisted via update_saathi_status.php.
  const updateStatus = useCallback(async (id, status) => {
    setLeads((list) => list.map((l) => (l.id === id ? { ...l, status } : l)));
    if (!UPDATE_URL) return { ok: true, persisted: false };
    try {
      const res = await fetch(UPDATE_URL, {
        method: "POST",
        headers: withKey({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, persisted: true };
    } catch (e) {
      return { ok: false, persisted: false, error: e.message };
    }
  }, []);

  return (
    <SaathiContext.Provider
      value={{ leads, loading, source, error, lastUpdated, freshIds, refresh: load, updateStatus }}
    >
      {children}
    </SaathiContext.Provider>
  );
}

export function useSaathi() {
  return useContext(SaathiContext);
}
