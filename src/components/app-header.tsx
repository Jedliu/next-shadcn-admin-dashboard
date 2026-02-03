"use client";

import React from "react";

import { usePathname } from "next/navigation";

import { SearchDialog } from "@/app/(main)/dashboard/_components/sidebar/search-dialog";
import { HudStats } from "@/components/hud-stats";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  const pathname = usePathname();

  // Split pathname into segments, filter out empty strings
  const segments = pathname.split("/").filter((segment) => segment !== "");

  // Generate breadcrumb items
  // We skip the first segment if it's "dashboard" to keep it clean, or keep it if preferred.
  // Let's keep it but capitalized.

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;

    // Convert kebab-case to Title Case (e.g., "process-filters" -> "Process Filters")
    const title = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return { title, href, isLast };
  });

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, _index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem className="hidden md:block">
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!crumb.isLast && <BreadcrumbSeparator className="hidden md:block" />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <HudStats className="hidden md:flex" />
        <SearchDialog />
      </div>
    </header>
  );
}
