"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionItem = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
};

export function SelectionActionBar({
  count,
  actions,
  className,
}: {
  count: number;
  actions: ActionItem[];
  className?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (count > 0) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), 200);
    return () => window.clearTimeout(timeout);
  }, [count]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "pointer-events-auto fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-background/95 px-4 py-2 text-foreground shadow-sm backdrop-blur transition-all duration-200 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none",
        className,
      )}
    >
      <span className="text-sm font-medium tabular-nums">{count} selected</span>
      <span className="h-5 w-px bg-border" />
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <React.Fragment key={action.label}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-foreground/80 hover:text-foreground"
              onClick={action.onClick}
            >
              {Icon ? <Icon className="size-4" /> : null}
              {action.label}
            </Button>
            {index < actions.length - 1 ? <span className="h-5 w-px bg-border" /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}
