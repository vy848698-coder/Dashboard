"use client";

import { useState, createContext, useContext } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Lets pages read the topbar's global search query.
const SearchContext = createContext({ query: "", setQuery: () => {} });
export const useGlobalSearch = () => useContext(SearchContext);

// Wraps every admin page with the sidebar + topbar chrome.
export default function DashboardShell({ children, searchPlaceholder }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      <div className="flex">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex-1 min-w-0">
          <Topbar
            onMenuClick={() => setMobileOpen(true)}
            query={query}
            onQueryChange={setQuery}
            searchPlaceholder={searchPlaceholder}
          />
          <main className="px-6 lg:px-8 pb-10">{children}</main>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
