"use client";

import * as React from "react";

import { GripVerticalIcon } from "lucide-react";

import { HistoryPanel } from "@/app/(main)/dashboard/_components/quick-create/history-panel";
import { QuickCreateActions } from "@/app/(main)/dashboard/_components/quick-create/quick-create-actions";
import { QuickCreatePanelHeader } from "@/app/(main)/dashboard/_components/quick-create/quick-create-panel-header";
import { useQuickCreate } from "@/app/(main)/dashboard/_components/quick-create/quick-create-provider";
import { usePointerResize } from "@/hooks/use-pointer-resize";
import { clampPanelWidth } from "@/lib/panel-utils";

export function QuickCreateInset({ children }: { readonly children: React.ReactNode }) {
  const { open, pinned, panelWidth, panel, setOpen, setPinned, setPanelWidth } = useQuickCreate();
  const clampWidth = React.useCallback((width: number) => clampPanelWidth(width, { min: 320 }), []);
  const resizeHandle = usePointerResize({
    direction: "right",
    getWidth: () => panelWidth,
    setWidth: setPanelWidth,
    clamp: clampWidth,
  });

  return (
    <div className="flex flex-1 min-h-0 gap-4 overflow-hidden p-4 md:p-6 [html[data-theme-preset=brutalist]_&]:overflow-x-visible [html[data-theme-preset=brutalist]_&]:overflow-y-hidden">
      {open && pinned && (
        <aside className="hidden shrink-0 lg:block" style={{ width: `${panelWidth}px` }}>
          <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
            <div
              aria-hidden="true"
              title="Resize"
              className="group absolute inset-y-0 right-0 z-20 w-3 cursor-col-resize touch-none select-none"
              onPointerDown={resizeHandle.onPointerDown}
              onPointerMove={resizeHandle.onPointerMove}
              onPointerUp={resizeHandle.onPointerUp}
              onPointerCancel={resizeHandle.onPointerCancel}
            >
              <div className="absolute inset-y-0 right-0 w-px bg-border" />
              <div className="-translate-x-0.5 -translate-y-1/2 pointer-events-none absolute top-1/2 right-0 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-background bg-border shadow-sm">
                  <GripVerticalIcon className="size-2.5" />
                </div>
              </div>
            </div>
            <QuickCreatePanelHeader panel={panel} onUnpin={() => setPinned(false)} onClose={() => setOpen(false)} />
            {panel === "history" ? <HistoryPanel className="flex-1" /> : <QuickCreateActions className="flex-1 p-4" />}
          </section>
        </aside>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden [html[data-theme-preset=brutalist]_&]:overflow-x-visible [html[data-theme-preset=brutalist]_&]:overflow-y-hidden">
        {children}
      </div>
    </div>
  );
}
