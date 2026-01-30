import { Bell, KeyRound, Monitor, Palette, User } from "lucide-react";

import { LayoutControls } from "@/app/(main)/dashboard/_components/sidebar/layout-controls";
import { cn } from "@/lib/utils";

const settingsNav = [
  { label: "Profile", icon: User },
  { label: "Account", icon: KeyRound },
  { label: "Appearance", icon: Palette, active: true },
  { label: "Notifications", icon: Bell },
  { label: "Display", icon: Monitor },
];

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex flex-col gap-1">
          {settingsNav.map((item) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                item.active && "bg-muted text-foreground font-medium",
              )}
              aria-current={item.active ? "page" : undefined}
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="max-w-2xl">
          <LayoutControls />
        </div>
      </div>
    </div>
  );
}
