"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { processFiltersNavItem } from "@/navigation/process-filters/process-filters-nav";

export function ProcessFiltersSubnav() {
  const pathname = usePathname();
  const [hash, setHash] = React.useState("");

  React.useEffect(() => {
    const readHash = () => setHash(window.location.hash.replace(/^#/, ""));
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:flex-col">
      {processFiltersNavItem.subItems.map((item) => {
        const [base, targetHash] = item.url.split("#");
        const active = pathname === base && targetHash === (hash || "settings");
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
