import { History, LayoutDashboard, type LucideIcon, Puzzle } from "lucide-react";

import { processFiltersSidebarItem } from "@/navigation/process-filters/process-filters-nav";
import { proxyNavItem } from "@/navigation/proxy/proxy-nav";
import { settingsNavItem } from "@/navigation/settings/settings-nav";

export type NavAction = "quick-create" | "history";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  action?: NavAction;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  action?: NavAction;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Workspace",
        url: "/dashboard/workspace",
        icon: LayoutDashboard,
      },
      {
        title: "History",
        url: "/dashboard/workspace/history",
        icon: History,
        action: "history",
      },
      processFiltersSidebarItem,
      {
        title: "Plugins",
        url: "/dashboard/plugins",
        icon: Puzzle,
      },
    ],
  },
  {
    id: 2,
    label: "Proxy",
    items: (proxyNavItem.subItems ?? []).map((item) => ({
      title: item.title,
      url: item.url,
      icon: item.icon,
    })),
  },
  {
    id: 3,
    label: "Settings",
    items: (settingsNavItem.subItems ?? []).map((item) => ({
      title: item.title,
      url: item.url,
      icon: item.icon,
    })),
  },
];
