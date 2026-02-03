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

  const handleNavClick = React.useCallback((targetHash: string) => {
    setHash(targetHash);
    // Dispatch custom event to trigger highlight in page component
    window.dispatchEvent(new CustomEvent("process-filters-nav", { detail: { hash: targetHash } }));
  }, []);

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col [&::-webkit-scrollbar]:hidden">
      {processFiltersNavItem.subItems.map((item) => {
        const [base, targetHash] = item.url.split("#");
        const active = pathname === base && targetHash === (hash || "settings");
        const Icon = item.icon;
        return (
          <Link
            key={item.url}
            prefetch={false}
            href={item.url}
            onClick={() => handleNavClick(targetHash ?? "settings")}
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
