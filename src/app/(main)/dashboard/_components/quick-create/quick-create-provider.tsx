"use client";

import * as React from "react";

type QuickCreateContextValue = {
  open: boolean;
  pinned: boolean;
  panelWidth: number;
  testInputValue: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPinned: React.Dispatch<React.SetStateAction<boolean>>;
  setPanelWidth: React.Dispatch<React.SetStateAction<number>>;
  setTestInputValue: React.Dispatch<React.SetStateAction<string>>;
  toggleOpen: () => void;
  togglePinned: () => void;
};

const QuickCreateContext = React.createContext<QuickCreateContextValue | null>(null);

export function QuickCreateProvider({ children }: { readonly children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const [panelWidth, setPanelWidth] = React.useState(352); // 22rem
  const [testInputValue, setTestInputValue] = React.useState("");

  const toggleOpen = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const togglePinned = React.useCallback(() => {
    setPinned((prev) => !prev);
    setOpen(true);
  }, []);

  const value = React.useMemo(
    () => ({
      open,
      pinned,
      panelWidth,
      testInputValue,
      setOpen,
      setPinned,
      setPanelWidth,
      setTestInputValue,
      toggleOpen,
      togglePinned,
    }),
    [open, pinned, panelWidth, testInputValue, toggleOpen, togglePinned],
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
