"use client";

import * as React from "react";

import { GripVerticalIcon, PinOff, XIcon } from "lucide-react";

import { HistoryPanel } from "@/app/(main)/dashboard/_components/quick-create/history-panel";
import { QuickCreateActions } from "@/app/(main)/dashboard/_components/quick-create/quick-create-actions";
import { useQuickCreate } from "@/app/(main)/dashboard/_components/quick-create/quick-create-provider";
import { cn } from "@/lib/utils";

export function QuickCreateInset({ children }: { readonly children: React.ReactNode }) {
  const { open, pinned, panelWidth, panel, setOpen, setPinned, setPanelWidth } = useQuickCreate();
  const isResizingRef = React.useRef(false);
  const resizeStartXRef = React.useRef(0);
  const resizeStartWidthRef = React.useRef(0);
  const prevUserSelectRef = React.useRef<string | null>(null);

  const clampPanelWidth = React.useCallback((width: number) => {
    const min = 320; // 20rem
    const max = typeof window !== "undefined" ? Math.floor((window.innerWidth - 48) * 0.5) : 720;
    return Math.max(min, Math.min(max, Math.round(width)));
  }, []);

  return (
    <div className="flex h-full min-h-0 gap-4 p-4 md:p-6">
      {open && pinned && (
        <aside className="hidden shrink-0 lg:block" style={{ width: `${panelWidth}px` }}>
          <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
            <div
              aria-hidden="true"
              title="Resize"
              className="group absolute inset-y-0 right-0 z-20 w-3 cursor-col-resize touch-none select-none"
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                isResizingRef.current = true;
                resizeStartXRef.current = e.clientX;
                resizeStartWidthRef.current = panelWidth;
                prevUserSelectRef.current = document.body.style.userSelect;
                document.body.style.userSelect = "none";
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!isResizingRef.current) return;
                const delta = e.clientX - resizeStartXRef.current;
                setPanelWidth(clampPanelWidth(resizeStartWidthRef.current + delta));
              }}
              onPointerUp={(e) => {
                if (!isResizingRef.current) return;
                isResizingRef.current = false;
                document.body.style.userSelect = prevUserSelectRef.current ?? "";
                prevUserSelectRef.current = null;
                try {
                  (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
              }}
              onPointerCancel={() => {
                isResizingRef.current = false;
                document.body.style.userSelect = prevUserSelectRef.current ?? "";
                prevUserSelectRef.current = null;
              }}
            >
              <div className="absolute inset-y-0 right-0 w-px bg-border" />
              <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 -translate-x-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-background shadow-sm">
                  <GripVerticalIcon className="size-2.5" />
                </div>
              </div>
            </div>
            <div
              className={cn(
                "flex items-start justify-between gap-3 border-b bg-muted/50",
                panel === "history" ? "p-3" : "p-4",
              )}
            >
              <div className="min-w-0">
                <h2 className={cn("truncate", panel === "history" ? "text-sm font-medium" : "font-semibold")}>
                  {panel === "history" ? "History" : "Quick Create"}
                </h2>
                {panel === "history" ? null : (
                  <p className="text-muted-foreground text-sm">
                    Create common items without leaving your current page.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPinned(false)}
                  title="Unpin"
                  className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <PinOff className="size-4" />
                  <span className="sr-only">Unpin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  title="Close"
                  className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <XIcon className="size-4" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>
            {panel === "history" ? <HistoryPanel className="flex-1" /> : <QuickCreateActions className="flex-1 p-4" />}
          </section>
        </aside>
      )}

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
