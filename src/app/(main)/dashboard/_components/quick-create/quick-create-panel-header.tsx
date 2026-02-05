"use client";

import { Pin, PinOff, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type QuickCreatePanelHeaderProps = {
  panel: "quick-create" | "history";
  onPin?: () => void;
  onUnpin?: () => void;
  onClose?: () => void;
  className?: string;
};

export function QuickCreatePanelHeader({ panel, onPin, onUnpin, onClose, className }: QuickCreatePanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b bg-muted/50",
        panel === "history" ? "p-3" : "p-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className={cn("truncate", panel === "history" ? "font-medium text-sm" : "font-semibold")}>
          {panel === "history" ? "Taffic History" : "Quick Create"}
        </h2>
        {panel === "history" ? (
          <p className="text-muted-foreground text-xs">Management for taffic history</p>
        ) : (
          <p className="text-muted-foreground text-sm">Create common items without leaving your current page.</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {onUnpin ? (
          <button
            type="button"
            onClick={onUnpin}
            title="Unpin"
            className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <PinOff className="size-4" />
            <span className="sr-only">Unpin</span>
          </button>
        ) : null}
        {onPin ? (
          <button
            type="button"
            onClick={onPin}
            title="Pin"
            className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Pin className="size-4" />
            <span className="sr-only">Pin</span>
          </button>
        ) : null}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
