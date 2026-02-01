"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight, GripVerticalIcon, MailIcon, Pin, PlusCircleIcon, XIcon } from "lucide-react";
import { createPortal } from "react-dom";

import { HistoryPanel } from "@/app/(main)/dashboard/_components/quick-create/history-panel";
import { QuickCreateActions } from "@/app/(main)/dashboard/_components/quick-create/quick-create-actions";
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
import { cn } from "@/lib/utils";
import type { NavAction, NavGroup, NavMainItem, NavSubItem } from "@/navigation/sidebar/sidebar-items";

interface NavMainProps {
  readonly items: readonly NavGroup[];
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
            aria-disabled={!item.action ? item.comingSoon : undefined}
            disabled={item.action ? item.comingSoon : undefined}
            isActive={isActive(item.url)}
            tooltip={item.title}
            onClick={() => {
              if (!item.action) return;
              onSubItemAction(item.action);
            }}
            asChild={!item.action}
          >
            {item.action ? (
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
                  {subItem.action ? (
                    <SidebarMenuSubButton asChild aria-disabled={subItem.comingSoon} isActive={false}>
                      <button
                        type="button"
                        onClick={() => onSubItemAction(subItem.action!)}
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
                if (!subItem.action) return;
                e.preventDefault();
                onSubItemAction(subItem.action);
              }}
              className="p-0"
            >
              {subItem.action ? (
                <SidebarMenuSubButton
                  asChild
                  className="focus-visible:ring-0"
                  aria-disabled={subItem.comingSoon}
                  isActive={false}
                >
                  <button type="button" disabled={subItem.comingSoon} onClick={() => onSubItemAction(subItem.action!)}>
                    {subItem.icon && <subItem.icon className="[&>svg]:text-sidebar-foreground" />}
                    <span>{subItem.title}</span>
                    {subItem.comingSoon && <IsComingSoon />}
                  </button>
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
  const { state, isMobile } = useSidebar();
  const {
    open: quickCreateOpen,
    pinned: quickCreatePinned,
    panelWidth,
    panel,
    setPanelWidth,
    setOpen: setQuickCreateOpen,
    setPinned: setQuickCreatePinned,
    togglePanel,
  } = useQuickCreate();
  const [sidebarRight, setSidebarRight] = React.useState(0);
  const sidebarRightRef = React.useRef(0);
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
  const isResizingRef = React.useRef(false);
  const resizeStartXRef = React.useRef(0);
  const resizeStartWidthRef = React.useRef(0);
  const prevUserSelectRef = React.useRef<string | null>(null);

  const clampPanelWidth = React.useCallback((width: number) => {
    const min = 320; // 20rem
    const max = typeof window !== "undefined" ? Math.floor((window.innerWidth - 48) * 0.5) : 720;
    return Math.max(min, Math.min(max, Math.round(width)));
  }, []);

  React.useEffect(() => {
    if (isMobile) return;
    const onResize = () => setPanelWidth((w) => clampPanelWidth(w));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampPanelWidth, isMobile, setPanelWidth]);

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
    if (!isMobile) return;
    // Pinned (docked) mode is desktop-only.
    setQuickCreatePinned(false);
  }, [isMobile, setQuickCreatePinned]);

  React.useEffect(() => {
    if (isMobile || quickCreatePinned || !quickCreateOpen) return;
    updateSidebarRight();
    requestAnimationFrame(updateSidebarRight);
    const timeout = window.setTimeout(updateSidebarRight, 120);
    return () => window.clearTimeout(timeout);
  }, [isMobile, quickCreateOpen, quickCreatePinned, updateSidebarRight]);

  const isItemActive = (url: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems?.length) {
      return path === url || subItems.some((sub) => !sub.action && path.startsWith(sub.url));
    }
    return path === url;
  };

  const onSubItemAction = React.useCallback(
    (action: NavAction) => {
      if (action === "quick-create") togglePanel("quick-create");
      if (action === "history") togglePanel("history");
    },
    [togglePanel],
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
              <DrawerTitle>{panel === "history" ? "History" : "Quick Create"}</DrawerTitle>
              {panel === "history" ? null : (
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
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  isResizingRef.current = true;
                  resizeStartXRef.current = e.clientX;
                  resizeStartWidthRef.current = panelWidth;
                  prevUserSelectRef.current = document.body.style.userSelect;
                  document.body.style.userSelect = "none";
                  (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (!isResizingRef.current) return;
                  const delta = e.clientX - resizeStartXRef.current;
                  setPanelWidth(clampPanelWidth(resizeStartWidthRef.current + delta));
                }}
                onPointerUp={(e) => {
                  if (!isResizingRef.current) return;
                  isResizingRef.current = false;
                  document.body.style.userSelect = prevUserSelectRef.current ?? "";
                  prevUserSelectRef.current = null;
                  try {
                    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
                  } catch {
                    // ignore
                  }
                }}
                onPointerCancel={() => {
                  isResizingRef.current = false;
                  document.body.style.userSelect = prevUserSelectRef.current ?? "";
                  prevUserSelectRef.current = null;
                }}
              >
                <div className="absolute inset-y-0 right-0 w-px bg-border" />
                <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 -translate-x-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-background shadow-sm">
                    <GripVerticalIcon className="size-2.5" />
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-start justify-between gap-3 border-b bg-muted/50",
                  panel === "history" ? "p-3" : "p-4",
                )}
              >
                <div className="min-w-0">
                  <h2 className={cn("truncate", panel === "history" ? "text-sm font-medium" : "font-semibold")}>
                    {panel === "history" ? "History" : "Quick Create"}
                  </h2>
                  {panel === "history" ? null : (
                    <p className="text-muted-foreground text-sm">
                      Create common items without leaving your current page.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuickCreatePinned(true)}
                    title="Pin"
                    className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <Pin className="size-4" />
                    <span className="sr-only">Pin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCreateOpen(false)}
                    title="Close"
                    className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="size-4" />
                  </button>
                </div>
              </div>
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
                    if (item.action) {
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            disabled={item.comingSoon}
                            tooltip={item.title}
                            isActive={false}
                            onClick={() => onSubItemAction(item.action!)}
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
