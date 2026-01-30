import * as React from "react";

import { Pin, PinOff, TrendingUp, XIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import type { sectionSchema } from "./schema";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type ViewerItem = z.infer<typeof sectionSchema>;

type TableCellViewerContextValue = {
  open: boolean;
  pinned: boolean;
  item: ViewerItem | null;
  panelWidth: number;
  setOpen: (open: boolean) => void;
  setPinned: (pinned: boolean) => void;
  setItem: (item: ViewerItem) => void;
  setPanelWidth: React.Dispatch<React.SetStateAction<number>>;
};

const TableCellViewerContext = React.createContext<TableCellViewerContextValue | null>(null);

function useTableCellViewer() {
  const context = React.useContext(TableCellViewerContext);
  if (!context) {
    throw new Error("TableCellViewerProvider is missing");
  }
  return context;
}

export function TableCellViewerProvider({ children }: { readonly children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const [item, setItem] = React.useState<ViewerItem | null>(null);
  const [panelWidth, setPanelWidth] = React.useState(416);

  const value = React.useMemo(
    () => ({
      open,
      pinned,
      item,
      panelWidth,
      setOpen,
      setPinned,
      setItem,
      setPanelWidth,
    }),
    [item, open, pinned, panelWidth],
  );

  return <TableCellViewerContext.Provider value={value}>{children}</TableCellViewerContext.Provider>;
}

function TableCellViewerBody({ item, isMobile }: { item: ViewerItem; isMobile: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 text-sm">
      {!isMobile && (
        <>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 0,
                right: 10,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                hide
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area
                dataKey="mobile"
                type="natural"
                fill="var(--color-mobile)"
                fillOpacity={0.6}
                stroke="var(--color-mobile)"
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
          <Separator />
          <div className="grid gap-2">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Showing total visitors for the last 6 months. This is just some random text to test the layout. It spans
              multiple lines and should wrap around.
            </div>
          </div>
          <Separator />
        </>
      )}
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <Label htmlFor="header">Header</Label>
          <Input id="header" defaultValue={item.header} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="type">Type</Label>
            <Select defaultValue={item.type}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Table of Contents">Table of Contents</SelectItem>
                <SelectItem value="Executive Summary">Executive Summary</SelectItem>
                <SelectItem value="Technical Approach">Technical Approach</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Capabilities">Capabilities</SelectItem>
                <SelectItem value="Focus Documents">Focus Documents</SelectItem>
                <SelectItem value="Narrative">Narrative</SelectItem>
                <SelectItem value="Cover Page">Cover Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="status">Status</Label>
            <Select defaultValue={item.status}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Done">Done</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="target">Target</Label>
            <Input id="target" defaultValue={item.target} />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="limit">Limit</Label>
            <Input id="limit" defaultValue={item.limit} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="reviewer">Reviewer</Label>
          <Select defaultValue={item.reviewer}>
            <SelectTrigger id="reviewer" className="w-full">
              <SelectValue placeholder="Select a reviewer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
              <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
              <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </div>
  );
}

function TableCellViewerActions({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Button>Submit</Button>
      <Button variant="outline" onClick={onClose}>
        Done
      </Button>
    </>
  );
}

export function TableCellViewer({ item }: { item: ViewerItem }) {
  const { setItem, setOpen } = useTableCellViewer();

  return (
    <Button
      variant="link"
      className="w-full min-w-0 justify-start px-0 text-left text-foreground"
      onClick={() => {
        setItem(item);
        setOpen(true);
      }}
    >
      <span className="min-w-0 flex-1 truncate">{item.header}</span>
    </Button>
  );
}

export function TableCellViewerDrawer() {
  const isMobile = useIsMobile();
  const { open, pinned, item, panelWidth, setOpen, setPinned, setPanelWidth } = useTableCellViewer();
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const isResizingRef = React.useRef(false);
  const resizeStartXRef = React.useRef(0);
  const resizeStartWidthRef = React.useRef(0);
  const prevUserSelectRef = React.useRef<string | null>(null);
  const [desktopPosition, setDesktopPosition] = React.useState<null | { top: number; right: number; bottom: number }>(
    null,
  );
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const unmountTimeoutRef = React.useRef<number | null>(null);
  const DESKTOP_FLOATING_ANIMATION_MS = 500; // Match Vaul's default timing.

  const clampWidth = React.useCallback((width: number) => {
    const min = 288; // 18rem
    // Allow resizing up to ~50% of the available viewport width (minus the drawer inset).
    const max = typeof window !== "undefined" ? Math.floor((window.innerWidth - 48) * 0.5) : 720;
    return Math.max(min, Math.min(max, Math.round(width)));
  }, []);

  React.useEffect(() => {
    if (isMobile) return;
    const onResize = () => setPanelWidth((w) => clampWidth(w));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampWidth, isMobile, setPanelWidth]);

  React.useEffect(() => {
    if (!isMobile || !pinned) return;
    setPinned(false);
  }, [isMobile, pinned, setPinned]);

  React.useEffect(() => {
    if (isMobile) return;
    setPortalTarget(document.body);
  }, [isMobile]);

  React.useEffect(() => {
    if (isMobile || pinned) {
      // When pinned (inset) or on mobile, the drawer shouldn't manage a desktop-positioned box.
      setDesktopPosition(null);
      return;
    }

    // Keep the last computed desktopPosition while closing so the floating panel doesn't "jump"
    // during the close animation.
    if (!open) return;

    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const anchor = document.querySelector<HTMLElement>('[data-slot="table-cell-viewer-anchor"]');
        const rect = anchor?.getBoundingClientRect();
        if (!rect) return;
        setDesktopPosition({
          top: Math.round(rect.top),
          right: Math.max(0, Math.round(window.innerWidth - rect.right)),
          bottom: Math.max(0, Math.round(window.innerHeight - rect.bottom)),
        });
      });
    };

    update();
    window.addEventListener("resize", update);
    // Use capture to catch scroll events from nested scroll containers.
    window.addEventListener("scroll", update, true);

    const anchor = document.querySelector<HTMLElement>('[data-slot="table-cell-viewer-anchor"]');
    const ro = anchor ? new ResizeObserver(update) : null;
    if (anchor && ro) ro.observe(anchor);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      ro?.disconnect();
    };
  }, [isMobile, open, pinned]);

  // Desktop: render a floating panel (not Vaul) so the close animation is smooth and consistent.
  React.useEffect(() => {
    if (isMobile) return;
    if (unmountTimeoutRef.current) {
      window.clearTimeout(unmountTimeoutRef.current);
      unmountTimeoutRef.current = null;
    }

    // If we don't have content, unmount immediately.
    if (!item) {
      setVisible(false);
      setMounted(false);
      return;
    }

    if (open && !pinned) {
      setMounted(true);
      // Ensure we start from the "hidden" state so the entrance animation is visible.
      setVisible(false);
      return;
    }

    // Closing: animate out, then unmount after the transition.
    setVisible(false);
    unmountTimeoutRef.current = window.setTimeout(() => setMounted(false), DESKTOP_FLOATING_ANIMATION_MS);
    return () => {
      if (unmountTimeoutRef.current) {
        window.clearTimeout(unmountTimeoutRef.current);
        unmountTimeoutRef.current = null;
      }
    };
  }, [isMobile, open, pinned, item]);

  React.useEffect(() => {
    if (isMobile) return;
    if (!mounted) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [isMobile, mounted]);

  if (!isMobile) {
    if (!item || !portalTarget || !mounted || !desktopPosition) return null;

    return createPortal(
      <div className="pointer-events-none fixed inset-0 z-40">
        <div
          ref={contentRef}
          className={cn(
            "pointer-events-auto absolute flex flex-col overflow-hidden rounded-lg border bg-background shadow-lg",
            // Match Vaul's right drawer slide timing/curve (0.5s cubic-bezier(0.32, 0.72, 0, 1)).
            "transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            visible ? "translate-x-0" : "translate-x-full",
          )}
          style={{
            top: `${desktopPosition.top}px`,
            right: `${desktopPosition.right}px`,
            bottom: `${desktopPosition.bottom}px`,
            width: `${clampWidth(panelWidth)}px`,
          }}
        >
          <div
            aria-hidden="true"
            title="Resize"
            className="absolute inset-y-0 left-0 w-2 cursor-col-resize touch-none select-none"
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
              const delta = resizeStartXRef.current - e.clientX;
              setPanelWidth(clampWidth(resizeStartWidthRef.current + delta));
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
            <div className="absolute inset-y-0 left-0 w-px bg-border" />
          </div>

          <div className="flex items-start justify-between gap-3 border-b bg-muted/50 p-4">
            <div className="min-w-0">
              <h2 className="truncate font-semibold">{item.header}</h2>
              <p className="text-muted-foreground text-sm">Showing total visitors for the last 6 months</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPinned(true)}
                title="Pin"
                className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              >
                <Pin className="size-4" />
                <span className="sr-only">Pin</span>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              >
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>

          <TableCellViewerBody item={item} isMobile={false} />
          <div className="mt-auto p-4">
            <div className="flex flex-col gap-2">
              <TableCellViewerActions onClose={() => setOpen(false)} />
            </div>
          </div>
        </div>
      </div>,
      portalTarget,
    );
  }

  if (!item) return null;

  return (
    <Drawer
      open={open && !pinned}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
      modal={false}
      dismissible={false}
    >
      <DrawerContent
        ref={contentRef}
        hideOverlay
        hideCloseButton={!isMobile}
        className={cn(isMobile ? undefined : "overflow-hidden")}
        headerActions={
          isMobile ? null : (
            <>
              <button
                type="button"
                onClick={() => setPinned(true)}
                title="Pin"
                className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              >
                <Pin className="size-4" />
                <span className="sr-only">Pin</span>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              >
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </button>
            </>
          )
        }
      >
        {!isMobile && (
          <div
            aria-hidden="true"
            title="Resize"
            className="absolute inset-y-0 left-0 w-2 cursor-col-resize touch-none select-none"
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
              const delta = resizeStartXRef.current - e.clientX;
              setPanelWidth(clampWidth(resizeStartWidthRef.current + delta));
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
            <div className="absolute inset-y-0 left-0 w-px bg-border" />
          </div>
        )}
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>Showing total visitors for the last 6 months</DrawerDescription>
        </DrawerHeader>
        <TableCellViewerBody item={item} isMobile={isMobile} />
        <DrawerFooter>
          <TableCellViewerActions onClose={() => setOpen(false)} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function TableCellViewerInset() {
  const isMobile = useIsMobile();
  const { open, pinned, item, panelWidth, setOpen, setPinned, setPanelWidth } = useTableCellViewer();
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const isResizingRef = React.useRef(false);
  const resizeStartXRef = React.useRef(0);
  const resizeStartWidthRef = React.useRef(0);
  const prevUserSelectRef = React.useRef<string | null>(null);

  const clampWidth = React.useCallback((width: number) => {
    const min = 288; // 18rem
    // Allow resizing up to ~50% of the available viewport width (minus the drawer inset).
    const max = typeof window !== "undefined" ? Math.floor((window.innerWidth - 48) * 0.5) : 720;
    return Math.max(min, Math.min(max, Math.round(width)));
  }, []);

  if (!item || !open || !pinned || isMobile) return null;

  return (
    <aside
      className="hidden h-full shrink-0 overflow-hidden self-stretch lg:block"
      style={{ width: `${clampWidth(panelWidth)}px` }}
    >
      <section
        ref={sectionRef}
        className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm"
      >
        <div
          aria-hidden="true"
          title="Resize"
          className="absolute top-0 bottom-0 left-0 z-10 w-2 cursor-col-resize touch-none select-none"
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
            const delta = resizeStartXRef.current - e.clientX;
            setPanelWidth(clampWidth(resizeStartWidthRef.current + delta));
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
          <div className="absolute top-0 bottom-0 left-0 w-px bg-border" />
        </div>
        <div className="flex items-start justify-between gap-3 border-b bg-muted/50 p-4">
          <div className="min-w-0">
            <h2 className="truncate font-semibold">{item.header}</h2>
            <p className="text-muted-foreground text-sm">Showing total visitors for the last 6 months</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPinned(false)}
              title="Unpin"
              className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <PinOff className="size-4" />
              <span className="sr-only">Unpin</span>
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="Close"
              className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
        <TableCellViewerBody item={item} isMobile={false} />
        <div className="mt-auto p-4">
          <div className="flex flex-col gap-2">
            <TableCellViewerActions onClose={() => setOpen(false)} />
          </div>
        </div>
      </section>
    </aside>
  );
}
