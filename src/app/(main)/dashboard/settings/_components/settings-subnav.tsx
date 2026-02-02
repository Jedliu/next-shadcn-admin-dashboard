"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { settingsNavItem } from "@/navigation/settings/settings-nav";

export function SettingsSubnav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col [&::-webkit-scrollbar]:hidden">
      {settingsNavItem.subItems.map((item) => {
        const active = pathname === item.url;
        const Icon = item.icon;
        return (
          <Link
            key={item.url}
            prefetch={false}
            href={item.url}
            className={cn(
              "inline-flex items-center rounded-md px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground",
              active && "bg-muted font-medium text-foreground",
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
