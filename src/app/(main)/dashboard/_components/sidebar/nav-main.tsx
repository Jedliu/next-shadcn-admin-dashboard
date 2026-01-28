"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight, MailIcon, Pin, PlusCircleIcon, XIcon } from "lucide-react";
import { createPortal } from "react-dom";

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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { NavGroup, NavMainItem } from "@/navigation/sidebar/sidebar-items";

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
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  isSubmenuOpen: (subItems?: NavMainItem["subItems"]) => boolean;
}) => {
  return (
    <Collapsible key={item.title} asChild defaultOpen={isSubmenuOpen(item.subItems)} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {item.subItems ? (
            <SidebarMenuButton
              disabled={item.comingSoon}
              isActive={isActive(item.url, item.subItems)}
              tooltip={item.title}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {item.comingSoon && <IsComingSoon />}
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              asChild
              aria-disabled={item.comingSoon}
              isActive={isActive(item.url)}
              tooltip={item.title}
            >
              <Link prefetch={false} href={item.url} target={item.newTab ? "_blank" : undefined}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.comingSoon && <IsComingSoon />}
              </Link>
            </SidebarMenuButton>
          )}
        </CollapsibleTrigger>
        {item.subItems && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton aria-disabled={subItem.comingSoon} isActive={isActive(subItem.url)} asChild>
                    <Link prefetch={false} href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                      {subItem.comingSoon && <IsComingSoon />}
                    </Link>
                  </SidebarMenuSubButton>
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
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
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
            <DropdownMenuItem key={subItem.title} asChild>
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
    setOpen: setQuickCreateOpen,
    setPinned: setQuickCreatePinned,
  } = useQuickCreate();
  const [sidebarRight, setSidebarRight] = React.useState(0);
  const sidebarRightRef = React.useRef(0);
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);

  const getSidebarRight = React.useCallback(() => {
    // `sidebar-inner` reflects the visible sidebar edge for all variants.
    const el = document.querySelector<HTMLElement>('[data-slot="sidebar-inner"]');
    if (!el) return 0;
    return Math.round(el.getBoundingClientRect().right);
  }, []);

  const updateSidebarRight = React.useCallback(() => {
    const nextRight = getSidebarRight();
    if (!nextRight) return;
    sidebarRightRef.current = nextRight;
    setSidebarRight(nextRight);
  }, [getSidebarRight]);

  const toggleQuickCreate = React.useCallback(() => {
    setQuickCreateOpen((prev) => !prev);
  }, [setQuickCreateOpen]);

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

  const isItemActive = (url: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems?.length) {
      return subItems.some((sub) => path.startsWith(sub.url));
    }
    return path === url;
  };

  const isSubmenuOpen = (subItems?: NavMainItem["subItems"]) => {
    return subItems?.some((sub) => path.startsWith(sub.url)) ?? false;
  };

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
              <DrawerTitle>Quick Create</DrawerTitle>
              <DrawerDescription>Create common items without leaving your current page.</DrawerDescription>
            </DrawerHeader>
            <QuickCreateActions className="flex-1 p-4 pt-0" />
          </DrawerContent>
        </Drawer>
      ) : (
        !quickCreatePinned &&
        portalTarget &&
        createPortal(
          <div
            data-slot="quick-create-flyout"
            aria-hidden={!quickCreateOpen}
            className="fixed top-16 bottom-6 z-[80] w-[22rem] overflow-hidden rounded-lg border bg-background shadow-lg transition-[transform,opacity] duration-300 ease-out"
            style={
              {
                left: (sidebarRightRef.current || sidebarRight || 0) + 16,
                opacity: quickCreateOpen ? 1 : 0,
                transform: quickCreateOpen ? "translate3d(0,0,0)" : "translate3d(calc(-100% - 16px),0,0)",
                pointerEvents: quickCreateOpen ? "auto" : "none",
              } as React.CSSProperties
            }
          >
            <div className="flex items-start justify-between gap-3 border-b bg-muted/50 p-4">
              <div className="min-w-0">
                <h2 className="truncate font-semibold">Quick Create</h2>
                <p className="text-muted-foreground text-sm">Create common items without leaving your current page.</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuickCreatePinned(true)}
                  title="Pin"
                  className="ring-offset-background focus:ring-ring inline-flex size-8 items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                >
                  <Pin className="size-4" />
                  <span className="sr-only">Pin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCreateOpen(false)}
                  title="Close"
                  className="ring-offset-background focus:ring-ring inline-flex size-8 items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="size-4" />
                </button>
              </div>
            </div>
            <QuickCreateActions className="flex-1 p-4" />
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
                  return <NavItemCollapsed key={item.title} item={item} isActive={isItemActive} />;
                }
                // Expanded view
                return (
                  <NavItemExpanded key={item.title} item={item} isActive={isItemActive} isSubmenuOpen={isSubmenuOpen} />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
