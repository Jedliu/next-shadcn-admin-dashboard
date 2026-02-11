"use client";

import * as React from "react";

import { usePathname, useSearchParams } from "next/navigation";

type QuickCreateContextValue = {
  open: boolean;
  pinned: boolean;
  panelWidth: number;
  panel: "quick-create" | "history";
  testInputValue: string;
  historyFilters: Array<"manual" | "auto" | "pinned">;
  historySearch: string;
  historySelectedIds: string[];
  historyPinnedIds: string[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPinned: React.Dispatch<React.SetStateAction<boolean>>;
  setPanelWidth: React.Dispatch<React.SetStateAction<number>>;
  setPanel: React.Dispatch<React.SetStateAction<"quick-create" | "history">>;
  setTestInputValue: React.Dispatch<React.SetStateAction<string>>;
  setHistoryFilters: React.Dispatch<React.SetStateAction<Array<"manual" | "auto" | "pinned">>>;
  setHistorySearch: React.Dispatch<React.SetStateAction<string>>;
  setHistorySelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setHistoryPinnedIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleOpen: () => void;
  togglePinned: () => void;
  openPanel: (panel: "quick-create" | "history") => void;
  togglePanel: (panel: "quick-create" | "history") => void;
  requestPanelOpen: (panel: "quick-create" | "history") => void;
};

const QuickCreateContext = React.createContext<QuickCreateContextValue | null>(null);

export function QuickCreateProvider({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [panelState, setPanelState] = React.useState<{ open: boolean; panel: "quick-create" | "history" }>({
    open: false,
    panel: "quick-create",
  });
  const [pinned, setPinned] = React.useState(false);
  const [panelWidth, setPanelWidth] = React.useState(410);
  const [testInputValue, setTestInputValue] = React.useState("");
  const [historyFilters, setHistoryFilters] = React.useState<Array<"manual" | "auto" | "pinned">>([]);
  const [historySearch, setHistorySearch] = React.useState("");
  const [historySelectedIds, setHistorySelectedIds] = React.useState<string[]>([]);
  const [historyPinnedIds, setHistoryPinnedIds] = React.useState<string[]>([]);
  const [pendingPanel, setPendingPanel] = React.useState<"quick-create" | "history" | null>(null);

  const open = panelState.open;
  const panel = panelState.panel;

  const setOpen: React.Dispatch<React.SetStateAction<boolean>> = React.useCallback((next) => {
    setPanelState((prev) => ({
      ...prev,
      open: typeof next === "function" ? (next as (p: boolean) => boolean)(prev.open) : next,
    }));
  }, []);

  const setPanel: React.Dispatch<React.SetStateAction<"quick-create" | "history">> = React.useCallback((next) => {
    setPanelState((prev) => ({
      ...prev,
      panel: typeof next === "function" ? (next as (p: typeof prev.panel) => typeof prev.panel)(prev.panel) : next,
    }));
  }, []);

  const toggleOpen = React.useCallback(() => {
    setPanelState((prev) => ({ ...prev, open: !prev.open }));
  }, []);

  const togglePinned = React.useCallback(() => {
    setPinned((prev) => !prev);
    setOpen(true);
  }, [setOpen]);

  const openPanel = React.useCallback((nextPanel: "quick-create" | "history") => {
    setPanelState((prev) => ({ ...prev, panel: nextPanel, open: true }));
  }, []);

  const togglePanel = React.useCallback((nextPanel: "quick-create" | "history") => {
    setPanelState((prev) => ({
      ...prev,
      panel: nextPanel,
      open: !(prev.open && prev.panel === nextPanel),
    }));
  }, []);

  const requestPanelOpen = React.useCallback((nextPanel: "quick-create" | "history") => {
    setPendingPanel(nextPanel);
  }, []);

  React.useEffect(() => {
    if (!pathname) return;
    if (pendingPanel === "quick-create") {
      setPanelState((prev) => ({ ...prev, open: true, panel: "quick-create" }));
      setPendingPanel(null);
      return;
    }
    const allowsHistory = pathname.startsWith("/dashboard/workspace") || pathname.startsWith("/dashboard/plugins");
    if (!allowsHistory) return;

    const panelParam = searchParams?.get("panel");
    const shouldOpen = panelParam === "history" || pendingPanel === "history";

    if (!shouldOpen) return;

    setPanelState((prev) => ({ ...prev, open: true, panel: "history" }));
    if (pendingPanel === "history") setPendingPanel(null);
  }, [pathname, pendingPanel, searchParams]);

  React.useEffect(() => {
    if (!pathname) return;
    const allowsHistory = pathname.startsWith("/dashboard/workspace") || pathname.startsWith("/dashboard/plugins");
    if (allowsHistory) return;
    if (panel !== "history") return;

    setPinned(false);
    setPanelState((prev) => ({ ...prev, open: false, panel: "quick-create" }));
  }, [pathname, panel]);

  const value = React.useMemo(
    () => ({
      open,
      pinned,
      panelWidth,
      panel,
      testInputValue,
      historyFilters,
      historySearch,
      historySelectedIds,
      historyPinnedIds,
      setOpen,
      setPinned,
      setPanelWidth,
      setPanel,
      setTestInputValue,
      setHistoryFilters,
      setHistorySearch,
      setHistorySelectedIds,
      setHistoryPinnedIds,
      toggleOpen,
      togglePinned,
      openPanel,
      togglePanel,
      requestPanelOpen,
    }),
    [
      open,
      pinned,
      panelWidth,
      panel,
      testInputValue,
      historyFilters,
      historySearch,
      historySelectedIds,
      historyPinnedIds,
      setOpen,
      setPanel,
      toggleOpen,
      togglePinned,
      openPanel,
      togglePanel,
      requestPanelOpen,
    ],
  );

  return <QuickCreateContext.Provider value={value}>{children}</QuickCreateContext.Provider>;
}

export function useQuickCreate() {
  const ctx = React.useContext(QuickCreateContext);
  if (!ctx) {
    throw new Error("useQuickCreate must be used within QuickCreateProvider");
  }
  return ctx;
}
