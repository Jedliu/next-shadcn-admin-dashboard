"use client";

import * as React from "react";

import { usePathname, useSearchParams } from "next/navigation";

type QuickCreateContextValue = {
  open: boolean;
  pinned: boolean;
  panelWidth: number;
  panel: "quick-create" | "history";
  testInputValue: string;
  historyTab: "all" | "manual" | "auto";
  historySearch: string;
  historySelectedId: string | null;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPinned: React.Dispatch<React.SetStateAction<boolean>>;
  setPanelWidth: React.Dispatch<React.SetStateAction<number>>;
  setPanel: React.Dispatch<React.SetStateAction<"quick-create" | "history">>;
  setTestInputValue: React.Dispatch<React.SetStateAction<string>>;
  setHistoryTab: React.Dispatch<React.SetStateAction<"all" | "manual" | "auto">>;
  setHistorySearch: React.Dispatch<React.SetStateAction<string>>;
  setHistorySelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  toggleOpen: () => void;
  togglePinned: () => void;
  openPanel: (panel: "quick-create" | "history") => void;
  togglePanel: (panel: "quick-create" | "history") => void;
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
  const [panelWidth, setPanelWidth] = React.useState(352); // 22rem
  const [testInputValue, setTestInputValue] = React.useState("");
  const [historyTab, setHistoryTab] = React.useState<"all" | "manual" | "auto">("all");
  const [historySearch, setHistorySearch] = React.useState("");
  const [historySelectedId, setHistorySelectedId] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    if (!pathname) return;
    const allowsHistory = pathname.startsWith("/dashboard/workbench") || pathname.startsWith("/dashboard/plugins");
    if (!allowsHistory) return;

    const panelParam = searchParams?.get("panel");
    let shouldOpen = panelParam === "history";

    if (!shouldOpen) {
      try {
        shouldOpen = window.sessionStorage.getItem("open-history-panel") === "1";
      } catch {
        shouldOpen = false;
      }
    }

    if (!shouldOpen) return;

    setPanelState((prev) => ({ ...prev, open: true, panel: "history" }));

    if (panelParam !== "history") {
      try {
        window.sessionStorage.removeItem("open-history-panel");
      } catch {
        // ignore storage errors
      }
    }
  }, [pathname, searchParams]);

  React.useEffect(() => {
    if (!pathname) return;
    const allowsHistory = pathname.startsWith("/dashboard/workbench") || pathname.startsWith("/dashboard/plugins");
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
      historyTab,
      historySearch,
      historySelectedId,
      setOpen,
      setPinned,
      setPanelWidth,
      setPanel,
      setTestInputValue,
      setHistoryTab,
      setHistorySearch,
      setHistorySelectedId,
      toggleOpen,
      togglePinned,
      openPanel,
      togglePanel,
    }),
    [
      open,
      pinned,
      panelWidth,
      panel,
      testInputValue,
      historyTab,
      historySearch,
      historySelectedId,
      setOpen,
      setPanel,
      toggleOpen,
      togglePinned,
      openPanel,
      togglePanel,
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
