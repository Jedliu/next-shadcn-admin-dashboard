"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { settingsNavItem } from "@/navigation/settings/settings-nav";

export function SettingsSubnav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:flex-col">
      {settingsNavItem.subItems.map((item) => {
        const active = pathname === item.url;
        const Icon = item.icon;
        return (
          <Link
            key={item.url}
            prefetch={false}
            href={item.url}
            className={cn(
              "text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center rounded-md px-3 py-2 text-sm transition-colors",
              active && "bg-muted text-foreground font-medium",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="mr-2 size-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
