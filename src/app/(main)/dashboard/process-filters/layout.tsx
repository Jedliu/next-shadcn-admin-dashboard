import type { Metadata } from "next";

import { ProcessFiltersSubnav } from "./_components/process-filters-subnav";

export const metadata: Metadata = {
  title: "Process Filters",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container/main flex min-h-0 flex-1 flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl tracking-tight">Process Filters</h1>
        <p className="text-muted-foreground text-sm">
          Create rules to control which processes are captured and logged.
        </p>
      </div>
      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <ProcessFiltersSubnav />
        <div className="min-h-0 min-w-0 max-w-2xl overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
