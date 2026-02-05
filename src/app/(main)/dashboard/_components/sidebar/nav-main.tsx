"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ChevronRight, GripVerticalIcon, MailIcon, PlusCircleIcon } from "lucide-react";
import { createPortal } from "react-dom";

import { HistoryPanel } from "@/app/(main)/dashboard/_components/quick-create/history-panel";
import { QuickCreateActions } from "@/app/(main)/dashboard/_components/quick-create/quick-create-actions";
import { QuickCreatePanelHeader } from "@/app/(main)/dashboard/_components/quick-create/quick-create-panel-header";
import { useQuickCreate } from "@/app/(main)/dashboard/_components/quick-create/quick-create-provider";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePointerResize } from "@/hooks/use-pointer-resize";
import { clampPanelWidth } from "@/lib/panel-utils";
import type { NavGroup, NavMainItem } from "@/navigation/sidebar/sidebar-items";

interface NavMainProps {
  readonly items: readonly NavGroup[];
}

// Local action union to avoid TS server cache issues with type exports.
type NavAction = "quick-create" | "history";

function readNavAction(value: unknown): NavAction | undefined {
  if (!value || typeof value !== "object") return undefined;
  const action = (value as { action?: unknown }).action;
  return action === "quick-create" || action === "history" ? action : undefined;
}

const IsComingSoon = () => (
  <span className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-xs dark:text-gray-800">Soon</span>
);

const NavItemExpanded = ({
  item,
  isActive,
  isSubmenuOpen,
  onSubItemAction,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  isSubmenuOpen: (subItems?: NavMainItem["subItems"]) => boolean;
  onSubItemAction: (action: NavAction) => void;
}) => {
  const itemAction = readNavAction(item);
  return (
    <Collapsible key={item.title} asChild defaultOpen={isSubmenuOpen(item.subItems)} className="group/collapsible">
      <SidebarMenuItem>
        {item.subItems ? (
          <>
            <SidebarMenuButton
              asChild
              aria-disabled={item.comingSoon}
              isActive={isActive(item.url, item.subItems)}
              tooltip={item.title}
            >
              <Link prefetch={false} href={item.url} target={item.newTab ? "_blank" : undefined}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.comingSoon && <IsComingSoon />}
              </Link>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction aria-label={`Toggle ${item.title}`} className="group-data-[collapsible=icon]:hidden">
                <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuAction>
            </CollapsibleTrigger>
          </>
        ) : (
          <SidebarMenuButton
            aria-disabled={!itemAction ? item.comingSoon : undefined}
            disabled={itemAction ? item.comingSoon : undefined}
            isActive={isActive(item.url)}
            tooltip={item.title}
            onClick={() => {
              if (!itemAction) return;
              onSubItemAction(itemAction);
            }}
            asChild={!itemAction}
          >
            {itemAction ? (
              <>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.comingSoon && <IsComingSoon />}
              </>
            ) : (
              <Link prefetch={false} href={item.url} target={item.newTab ? "_blank" : undefined}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.comingSoon && <IsComingSoon />}
              </Link>
            )}
          </SidebarMenuButton>
        )}
        {item.subItems && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  {readNavAction(subItem) ? (
                    <SidebarMenuSubButton asChild aria-disabled={subItem.comingSoon} isActive={false}>
                      <button
                        type="button"
                        onClick={() => {
                          const action = readNavAction(subItem);
                          if (!action) return;
                          onSubItemAction(action);
                        }}
                        disabled={subItem.comingSoon}
                      >
                        {subItem.icon && <subItem.icon />}
                        <span>{subItem.title}</span>
                        {subItem.comingSoon && <IsComingSoon />}
                      </button>
                    </SidebarMenuSubButton>
                  ) : (
                    <SidebarMenuSubButton aria-disabled={subItem.comingSoon} isActive={isActive(subItem.url)} asChild>
                      <Link prefetch={false} href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                        {subItem.icon && <subItem.icon />}
                        <span>{subItem.title}</span>
                        {subItem.comingSoon && <IsComingSoon />}
                      </Link>
                    </SidebarMenuSubButton>
                  )}
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};

const NavItemCollapsed = ({
  item,
  isActive,
  onSubItemAction,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  onSubItemAction: (action: NavAction) => void;
}) => {
  return (
    <SidebarMenuItem key={item.title}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            disabled={item.comingSoon}
            tooltip={item.title}
            isActive={isActive(item.url, item.subItems)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-50 space-y-1" side="right" align="start">
          {item.subItems?.map((subItem) => (
            <DropdownMenuItem
              key={subItem.title}
              onSelect={(e) => {
                const action = readNavAction(subItem);
                if (!action) return;
                e.preventDefault();
                onSubItemAction(action);
              }}
              className="p-0"
            >
              {readNavAction(subItem) ? (
                <SidebarMenuSubButton
                  asChild
                  className="focus-visible:ring-0"
                  aria-disabled={subItem.comingSoon}
                  isActive={false}
                >
                  <div>
                    {subItem.icon && <subItem.icon className="[&>svg]:text-sidebar-foreground" />}
                    <span>{subItem.title}</span>
                    {subItem.comingSoon && <IsComingSoon />}
                  </div>
                </SidebarMenuSubButton>
              ) : (
                <SidebarMenuSubButton
                  key={subItem.title}
                  asChild
                  className="focus-visible:ring-0"
                  aria-disabled={subItem.comingSoon}
                  isActive={isActive(subItem.url)}
                >
                  <Link prefetch={false} href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                    {subItem.icon && <subItem.icon className="[&>svg]:text-sidebar-foreground" />}
                    <span>{subItem.title}</span>
                    {subItem.comingSoon && <IsComingSoon />}
                  </Link>
                </SidebarMenuSubButton>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export function NavMain({ items }: NavMainProps) {
  const path = usePathname();
  const [hash, setHash] = React.useState("");
  const { state, isMobile } = useSidebar();
  const router = useRouter();
  const {
    open: quickCreateOpen,
    pinned: quickCreatePinned,
    panelWidth,
    panel,
    setPanelWidth,
    setOpen: setQuickCreateOpen,
    setPinned: setQuickCreatePinned,
    openPanel,
    togglePanel,
    requestPanelOpen,
  } = useQuickCreate();
  const [sidebarRight, setSidebarRight] = React.useState(0);
  const sidebarRightRef = React.useRef(0);
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
  const clampWidth = React.useCallback((width: number) => clampPanelWidth(width, { min: 320 }), []);
  const resizeHandle = usePointerResize({
    direction: "right",
    getWidth: () => panelWidth,
    setWidth: setPanelWidth,
    clamp: clampWidth,
  });

  React.useEffect(() => {
    if (isMobile) return;
    const onResize = () => setPanelWidth((w) => clampWidth(w));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampWidth, isMobile, setPanelWidth]);

  const getSidebarRight = React.useCallback(() => {
    // `sidebar-inner` reflects the visible sidebar edge for all variants.
    const inner = document.querySelector<HTMLElement>('[data-slot="sidebar-inner"]');
    const container = document.querySelector<HTMLElement>('[data-slot="sidebar-container"]');
    const gap = document.querySelector<HTMLElement>('[data-slot="sidebar-gap"]');
    const rect = inner?.getBoundingClientRect() ?? container?.getBoundingClientRect();
    if (rect?.right) return Math.round(rect.right);
    if (gap) return Math.round(gap.getBoundingClientRect().right);
    return 0;
  }, []);

  const updateSidebarRight = React.useCallback(() => {
    const nextRight = getSidebarRight();
    if (!nextRight) return;
    sidebarRightRef.current = nextRight;
    setSidebarRight(nextRight);
  }, [getSidebarRight]);

  const toggleQuickCreate = React.useCallback(() => {
    togglePanel("quick-create");
  }, [togglePanel]);

  React.useEffect(() => {
    if (isMobile) return;
    const el = document.querySelector<HTMLElement>('[data-slot="sidebar-inner"]');
    if (!el) return;

    updateSidebarRight();

    const ro = new ResizeObserver(updateSidebarRight);
    ro.observe(el);
    window.addEventListener("resize", updateSidebarRight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateSidebarRight);
    };
  }, [isMobile, updateSidebarRight]);

  React.useEffect(() => {
    if (isMobile) return;
    setPortalTarget(document.body);
  }, [isMobile]);

  React.useEffect(() => {
    const readHash = () => setHash(window.location.hash.replace(/^#/, ""));
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  React.useEffect(() => {
    if (isMobile || quickCreateOpen) return;
    const flyout = document.querySelector<HTMLElement>('[data-slot="quick-create-flyout"]');
    const active = document.activeElement as HTMLElement | null;
    if (flyout && active && flyout.contains(active)) {
      active.blur();
    }
  }, [isMobile, quickCreateOpen]);

  React.useEffect(() => {
    if (!isMobile) return;
    // Pinned (docked) mode is desktop-only.
    setQuickCreatePinned(false);
  }, [isMobile, setQuickCreatePinned]);

  React.useEffect(() => {
    if (isMobile || quickCreatePinned || !quickCreateOpen) return;
    updateSidebarRight();
    const raf = requestAnimationFrame(updateSidebarRight);
    const timeout = window.setTimeout(updateSidebarRight, 120);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [isMobile, quickCreateOpen, quickCreatePinned, updateSidebarRight]);

  const isItemActive = (url: string, subItems?: NavMainItem["subItems"]) => {
    const currentHash = hash || "settings";
    const [base, targetHash] = url.split("#");

    const matchesUrl = (targetUrl: string) => {
      const [targetBase, targetHash] = targetUrl.split("#");
      if (path !== targetBase) return false;
      if (!targetHash) return true;
      return targetHash === currentHash;
    };

    if (subItems?.length) {
      return base === path || subItems.some((sub) => !sub.action && matchesUrl(sub.url));
    }
    if (!targetHash) return path === base;
    return matchesUrl(url);
  };

  const onSubItemAction = React.useCallback(
    (action: NavAction) => {
      if (action === "quick-create") {
        togglePanel("quick-create");
        return;
      }

      if (action !== "history") return;

      const allowsHistory = path.startsWith("/dashboard/workspace") || path.startsWith("/dashboard/plugins");
      if (allowsHistory) {
        openPanel("history");
        return;
      }

      requestPanelOpen("history");
      router.push("/dashboard/workspace");
    },
    [openPanel, path, requestPanelOpen, router, togglePanel],
  );

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                onClick={toggleQuickCreate}
              >
                <PlusCircleIcon />
                <span>Quick Create</span>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <MailIcon />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {isMobile ? (
        <Drawer open={quickCreateOpen} onOpenChange={setQuickCreateOpen} direction="bottom" modal noBodyStyles={false}>
          <DrawerContent>
            <DrawerHeader className="gap-1">
              <DrawerTitle>{panel === "history" ? "Taffic History" : "Quick Create"}</DrawerTitle>
              {panel === "history" ? (
                <DrawerDescription>Management for taffic history</DrawerDescription>
              ) : (
                <DrawerDescription>Create common items without leaving your current page.</DrawerDescription>
              )}
            </DrawerHeader>
            {panel === "history" ? (
              <HistoryPanel className="flex-1" />
            ) : (
              <QuickCreateActions className="flex-1 p-4 pt-0" />
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        !quickCreatePinned &&
        portalTarget &&
        createPortal(
          <div
            data-slot="quick-create-flyout"
            aria-hidden={!quickCreateOpen}
            className="pointer-events-none fixed top-0 right-0 bottom-0 left-0 z-40 overflow-hidden"
            style={{
              clipPath: `inset(0 0 0 ${(sidebarRightRef.current || sidebarRight || 0) + 8}px)`,
            }}
          >
            <div
              className="absolute top-6 bottom-6 flex min-h-0 flex-col overflow-hidden rounded-lg border bg-background shadow-lg transition-[left,opacity] duration-300 ease-out"
              style={{
                width: `${panelWidth}px`,
                left: quickCreateOpen
                  ? (sidebarRightRef.current || sidebarRight || 0) + 16
                  : (sidebarRightRef.current || sidebarRight || 0) - panelWidth,
                opacity: quickCreateOpen && (sidebarRightRef.current || sidebarRight) > 0 ? 1 : 0,
                pointerEvents: quickCreateOpen && (sidebarRightRef.current || sidebarRight) > 0 ? "auto" : "none",
              }}
            >
              <div
                aria-hidden="true"
                title="Resize"
                className="group absolute inset-y-0 right-0 z-20 w-3 cursor-col-resize touch-none select-none"
                onPointerDown={resizeHandle.onPointerDown}
                onPointerMove={resizeHandle.onPointerMove}
                onPointerUp={resizeHandle.onPointerUp}
                onPointerCancel={resizeHandle.onPointerCancel}
              >
                <div className="absolute inset-y-0 right-0 w-px bg-border" />
                <div className="-translate-x-0.5 -translate-y-1/2 pointer-events-none absolute top-1/2 right-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-background bg-border shadow-sm">
                    <GripVerticalIcon className="size-2.5" />
                  </div>
                </div>
              </div>
              <QuickCreatePanelHeader
                panel={panel}
                onPin={() => setQuickCreatePinned(true)}
                onClose={() => setQuickCreateOpen(false)}
              />
              {panel === "history" ? (
                <HistoryPanel className="flex-1" />
              ) : (
                <QuickCreateActions className="flex-1 p-4" />
              )}
            </div>
          </div>,
          portalTarget,
        )
      )}

      {items.map((group) => (
        <SidebarGroup key={group.id}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {group.items.map((item) => {
                if (state === "collapsed" && !isMobile) {
                  // If no subItems, just render the button as a link
                  if (!item.subItems) {
                    const action = readNavAction(item);
                    if (action) {
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            disabled={item.comingSoon}
                            tooltip={item.title}
                            isActive={false}
                            onClick={() => {
                              onSubItemAction(action);
                            }}
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            {item.comingSoon && <IsComingSoon />}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          aria-disabled={item.comingSoon}
                          tooltip={item.title}
                          isActive={isItemActive(item.url)}
                        >
                          <Link prefetch={false} href={item.url} target={item.newTab ? "_blank" : undefined}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                  // Otherwise, render the dropdown as before
                  return (
                    <NavItemCollapsed
                      key={item.title}
                      item={item}
                      isActive={isItemActive}
                      onSubItemAction={onSubItemAction}
                    />
                  );
                }
                // Expanded view
                return (
                  <NavItemExpanded
                    key={item.title}
                    item={item}
                    isActive={isItemActive}
                    isSubmenuOpen={(subItems) => isItemActive(item.url, subItems)}
                    onSubItemAction={onSubItemAction}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
