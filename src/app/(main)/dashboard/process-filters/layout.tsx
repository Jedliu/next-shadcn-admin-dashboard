import type { Metadata } from "next";

import { ProcessFiltersSubnav } from "./_components/process-filters-subnav";

export const metadata: Metadata = {
  title: "Process Filters",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container/main flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Process Filters</h1>
        <p className="text-sm text-muted-foreground">
          Create rules to control which processes are captured and logged.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <ProcessFiltersSubnav />
        <div className="min-w-0 max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
