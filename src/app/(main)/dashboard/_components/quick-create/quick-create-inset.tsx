"use client";

import type * as React from "react";

import { PinOff, XIcon } from "lucide-react";

import { QuickCreateActions } from "@/app/(main)/dashboard/_components/quick-create/quick-create-actions";
import { useQuickCreate } from "@/app/(main)/dashboard/_components/quick-create/quick-create-provider";

export function QuickCreateInset({ children }: { readonly children: React.ReactNode }) {
  const { open, pinned, setOpen, setPinned } = useQuickCreate();

  return (
    <div className="flex h-full min-h-0 gap-4 p-4 md:p-6">
      {open && pinned && (
        <aside className="hidden w-[22rem] shrink-0 lg:block">
          <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b bg-muted/50 p-4">
              <div className="min-w-0">
                <h2 className="truncate font-semibold">Quick Create</h2>
                <p className="text-muted-foreground text-sm">Create common items without leaving your current page.</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPinned(false)}
                  title="Unpin"
                  className="ring-offset-background focus:ring-ring inline-flex size-8 items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                >
                  <PinOff className="size-4" />
                  <span className="sr-only">Unpin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  title="Close"
                  className="ring-offset-background focus:ring-ring inline-flex size-8 items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                >
                  <XIcon className="size-4" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>
            <QuickCreateActions className="flex-1 p-4" />
          </section>
        </aside>
      )}

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
