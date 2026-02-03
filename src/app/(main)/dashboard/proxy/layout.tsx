import type { Metadata } from "next";

import { ProxyProvider } from "./_components/proxy-provider";
import { ProxySubnav } from "./_components/proxy-subnav";

export const metadata: Metadata = {
  title: "Proxy",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container/main flex min-h-0 flex-1 flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl tracking-tight">Proxy</h1>
        <p className="text-muted-foreground text-sm">Manage proxy agent, system proxy settings, and certificates.</p>
      </div>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <ProxySubnav />
        <ProxyProvider>
          <div className="min-h-0 min-w-0 max-w-2xl overflow-y-auto">{children}</div>
        </ProxyProvider>
      </div>
    </div>
  );
}
