import { Bell, KeyRound, type LucideIcon, Monitor, Palette, Settings, User } from "lucide-react";

export type SettingsNavSubItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

// Single source of truth for Settings navigation (used by sidebar + settings page subnav).
export const settingsNavItem = {
  title: "Settings",
  url: "/dashboard/settings",
  icon: Settings,
  subItems: [
    { title: "Profile", url: "/dashboard/settings/profile", icon: User },
    { title: "Account", url: "/dashboard/settings/account", icon: KeyRound },
    { title: "Appearance", url: "/dashboard/settings/appearance", icon: Palette },
    { title: "Notifications", url: "/dashboard/settings/notifications", icon: Bell },
    { title: "Display", url: "/dashboard/settings/display", icon: Monitor },
  ],
} satisfies {
  title: string;
  url: string;
  icon: LucideIcon;
  subItems: SettingsNavSubItem[];
};
