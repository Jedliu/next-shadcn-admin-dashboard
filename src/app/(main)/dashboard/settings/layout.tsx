import type { Metadata } from "next";

import { SettingsSubnav } from "./_components/settings-subnav";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container/main flex min-h-0 flex-1 flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account settings and set e-mail preferences.</p>
      </div>
      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <SettingsSubnav />
        <div className="min-h-0 min-w-0 max-w-2xl overflow-y-auto [html_&]:pr-4">{children}</div>
      </div>
    </div>
  );
}
