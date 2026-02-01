import { Globe, type LucideIcon, Router, ShieldCheck, SquareTerminal } from "lucide-react";

export type ProxyNavSubItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

// Single source of truth for Proxy navigation (used by sidebar + proxy page subnav).
export const proxyNavItem = {
  title: "Proxy",
  url: "/dashboard/proxy",
  icon: SquareTerminal,
  subItems: [
    { title: "Proxy Agent", url: "/dashboard/proxy/agent", icon: Router },
    { title: "System Proxy", url: "/dashboard/proxy/system-proxy", icon: Globe },
    { title: "Certificates", url: "/dashboard/proxy/certificates", icon: ShieldCheck },
  ],
} satisfies {
  title: string;
  url: string;
  icon: LucideIcon;
  subItems: ProxyNavSubItem[];
};
