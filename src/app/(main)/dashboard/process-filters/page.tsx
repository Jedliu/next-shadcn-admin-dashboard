"use client";

import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  ProcessFiltersAddRule,
  ProcessFiltersAppliedRules,
  ProcessFiltersSettings,
} from "./_components/process-filters-panel";

function HighlightCard({
  id,
  highlightState,
  children,
}: {
  id: string;
  highlightState: { id: string; nonce: number } | null;
  children: React.ReactNode;
}) {
  const highlight = highlightState?.id === id;
  const flashToken = highlightState?.nonce ?? 0;

  return (
    <Card
      className={cn("relative py-4", highlight && "pf-flash-border")}
      data-flash={highlight ? flashToken % 2 : undefined}
    >
      <CardContent className="px-5">
        <section id={id} className="scroll-mt-24">
          {children}
        </section>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const [highlightState, setHighlightState] = React.useState<{ id: string; nonce: number } | null>(null);
  const highlightTimeoutRef = React.useRef<number | null>(null);

  const triggerHighlight = React.useCallback((hash: string) => {
    // Clear any existing timeout
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    // Set highlight with a new nonce so the animation restarts even on the same target
    setHighlightState((prev) => ({
      id: hash,
      nonce: (prev?.nonce ?? 0) + 1,
    }));

    // Clear highlight after the flash animation finishes
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightState((prev) => (prev?.id === hash ? null : prev));
      highlightTimeoutRef.current = null;
    }, 1100);
  }, []);

  React.useEffect(() => {
    // Listen for custom navigation event from subnav
    const handleNavEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ hash: string }>;
      triggerHighlight(customEvent.detail.hash);
    };

    window.addEventListener("process-filters-nav", handleNavEvent);

    return () => {
      window.removeEventListener("process-filters-nav", handleNavEvent);
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [triggerHighlight]);

  return (
    <div className="space-y-6">
      <HighlightCard id="settings" highlightState={highlightState}>
        <ProcessFiltersSettings />
      </HighlightCard>
      <HighlightCard id="add-new-rule" highlightState={highlightState}>
        <ProcessFiltersAddRule />
      </HighlightCard>
      <HighlightCard id="existing-rules" highlightState={highlightState}>
        <ProcessFiltersAppliedRules />
      </HighlightCard>
    </div>
  );
}
