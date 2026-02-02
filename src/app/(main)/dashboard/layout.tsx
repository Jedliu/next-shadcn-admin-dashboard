import type { ReactNode } from "react";

import { cookies } from "next/headers";

import { QuickCreateInset } from "@/app/(main)/dashboard/_components/quick-create/quick-create-inset";
import { QuickCreateProvider } from "@/app/(main)/dashboard/_components/quick-create/quick-create-provider";
import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SIDEBAR_COLLAPSIBLE_VALUES, SIDEBAR_VARIANT_VALUES } from "@/lib/preferences/layout";
import { cn } from "@/lib/utils";
import { getPreference } from "@/server/server-actions";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const [variant, collapsible] = await Promise.all([
    getPreference("sidebar_variant", SIDEBAR_VARIANT_VALUES, "inset"),
    getPreference("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, "icon"),
  ]);

  return (
    <QuickCreateProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar variant={variant} collapsible={collapsible} />
        <SidebarInset
          className={cn(
            "[html[data-content-layout=centered]_&]:mx-auto! [html[data-content-layout=centered]_&]:max-w-screen-2xl!",
            // Adds right margin for inset sidebar in centered layout up to 113rem.
            // On wider screens with collapsed sidebar, removes margin and sets margin auto for alignment.
            "max-[113rem]:peer-data-[variant=inset]:mr-2! min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:mr-auto!",
          )}
        >
          <AppHeader />
          <QuickCreateInset>{children}</QuickCreateInset>
        </SidebarInset>
      </SidebarProvider>
    </QuickCreateProvider>
  );
}
