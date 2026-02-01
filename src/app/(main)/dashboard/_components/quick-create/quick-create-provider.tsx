"use client";

import * as React from "react";

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
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const [panelWidth, setPanelWidth] = React.useState(352); // 22rem
  const [panel, setPanel] = React.useState<"quick-create" | "history">("quick-create");
  const [testInputValue, setTestInputValue] = React.useState("");
  const [historyTab, setHistoryTab] = React.useState<"all" | "manual" | "auto">("all");
  const [historySearch, setHistorySearch] = React.useState("");
  const [historySelectedId, setHistorySelectedId] = React.useState<string | null>(null);

  const toggleOpen = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const togglePinned = React.useCallback(() => {
    setPinned((prev) => !prev);
    setOpen(true);
  }, []);

  const openPanel = React.useCallback((nextPanel: "quick-create" | "history") => {
    setPanel(nextPanel);
    setOpen(true);
  }, []);

  const togglePanel = React.useCallback((nextPanel: "quick-create" | "history") => {
    setPanel((prevPanel) => {
      setOpen((prevOpen) => (prevOpen && prevPanel === nextPanel ? false : true));
      return nextPanel;
    });
  }, []);

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
