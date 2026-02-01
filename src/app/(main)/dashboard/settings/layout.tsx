import type { Metadata } from "next";

import { SettingsSubnav } from "./_components/settings-subnav";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container/main flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <SettingsSubnav />
        <div className="min-w-0 max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
