import * as React from "react";

import { ExternalLink, GripVerticalIcon, Pin, PinOff, RotateCcw, XIcon } from "lucide-react";
import { createPortal } from "react-dom";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import type { sectionSchema } from "./schema";

type ViewerItem = z.infer<typeof sectionSchema>;

type TableCellViewerContextValue = {
  open: boolean;
  pinned: boolean;
  item: ViewerItem | null;
  panelWidth: number;
  drafts: Record<number, ViewerItem>;
  setOpen: (open: boolean) => void;
  setPinned: (pinned: boolean) => void;
  setItem: (item: ViewerItem) => void;
  setPanelWidth: React.Dispatch<React.SetStateAction<number>>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<number, ViewerItem>>>;
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
  const [drafts, setDrafts] = React.useState<Record<number, ViewerItem>>({});

  // Persist input values across pin/unpin: initialize a draft the first time an item is opened.
  React.useEffect(() => {
    if (!item) return;
    setDrafts((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: item }));
  }, [item]);

  const value = React.useMemo(
    () => ({
      open,
      pinned,
      item,
      panelWidth,
      drafts,
      setOpen,
      setPinned,
      setItem,
      setPanelWidth,
      setDrafts,
    }),
    [drafts, item, open, pinned, panelWidth],
  );

  return <TableCellViewerContext.Provider value={value}>{children}</TableCellViewerContext.Provider>;
}

function TableCellViewerBody({
  draft,
  onChange,
  isMobile,
  pinned,
  onTogglePinned,
  onClose,
}: {
  draft: ViewerItem;
  onChange: (next: ViewerItem) => void;
  isMobile: boolean;
  pinned?: boolean;
  onTogglePinned?: () => void;
  onClose?: () => void;
}) {
  const [requestTab, setRequestTab] = React.useState("overview");
  const [responseTab, setResponseTab] = React.useState("raw");

  const defaultUrl = `https://jsonplaceholder.typicode.com/todos/${draft.id}`;
  const url = draft.target?.trim() ? draft.target : defaultUrl;

  const requestOverview = [
    { label: "Status", value: "Completed" },
    { label: "Method", value: "GET" },
    { label: "Protocol", value: "h2" },
    { label: "Code", value: "200" },
    { label: "Host", value: "jsonplaceholder.typicode.com:443" },
    { label: "Keep Alive", value: "false" },
    { label: "Content Type", value: "application/json; charset=utf-8" },
  ];

  const responseHeaders = [
    "h2 200",
    "x-ratelimit-remaining: 999",
    "cf-cache-status: HIT",
    "access-control-allow-credentials: true",
    "x-powered-by: Express",
    "age: 4757",
    "access-control-allow-origin: *",
    "pragma: no-cache",
    "expires: -1",
    "server: cloudflare",
    "content-type: application/json; charset=utf-8",
    "vary: Origin, Accept-Encoding",
    "cache-control: max-age=43200",
    "x-content-type-options: nosniff",
  ];

  const responseBody = '{\n  "userId": 1,\n  "id": 1,\n  "title": "delectus aut autem",\n  "completed": false\n}\n';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ResizablePanelGroup direction="vertical" className="min-h-0 flex-1">
        <ResizablePanel defaultSize={55} minSize={20} className="min-h-0">
          <Tabs value={requestTab} onValueChange={setRequestTab} className="flex h-full min-h-0 flex-col gap-0">
            <div className="flex items-center justify-between gap-3 border-b bg-muted/40 p-2">
              <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsList className="h-9 w-max">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="headers">Headers (4)</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="cookies">Cookies (0)</TabsTrigger>
                </TabsList>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  GET
                </Badge>
                {!isMobile && onTogglePinned ? (
                  <button
                    type="button"
                    onClick={onTogglePinned}
                    title={pinned ? "Unpin" : "Pin"}
                    className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                  >
                    {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                    <span className="sr-only">{pinned ? "Unpin" : "Pin"}</span>
                  </button>
                ) : null}
                {onClose ? (
                  <button
                    type="button"
                    onClick={onClose}
                    title="Close"
                    className="inline-flex size-8 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                  >
                    <XIcon className="size-4" />
                    <span className="sr-only">Close</span>
                  </button>
                ) : null}
              </span>
            </div>

            <div className="border-b p-2">
              <div className="flex items-center gap-2">
                <Label className="sr-only text-muted-foreground" htmlFor="request-url">
                  URL
                </Label>
                <Input
                  id="request-url"
                  value={url}
                  onChange={(e) => onChange({ ...draft, target: e.target.value })}
                  className={cn("h-9 font-mono text-xs", isMobile && "text-[13px]")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0"
                  title="Open"
                  onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="size-4" />
                  <span className="sr-only">Open</span>
                </Button>
                <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0" title="Refresh">
                  <RotateCcw className="size-4" />
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1">
              <TabsContent value="overview" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-3 text-sm">
                    <dl className="grid grid-cols-[10rem_1fr] gap-x-6 gap-y-3">
                      {requestOverview.map((row) => (
                        <React.Fragment key={row.label}>
                          <dt className="text-muted-foreground">{row.label}</dt>
                          <dd className="font-medium text-foreground">{row.value}</dd>
                        </React.Fragment>
                      ))}
                    </dl>
                    <Separator className="my-3" />
                    <div className="grid gap-2">
                      <div className="font-medium">Notes</div>
                      <div className="text-muted-foreground">
                        Demo content: use the resize handle to adjust the split view.
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="headers" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-3 font-mono text-xs">
                    <div className="grid gap-1">
                      <div>accept: */*</div>
                      <div>user-agent: Studio Admin</div>
                      <div>x-request-id: {`req_${draft.id}`}</div>
                      <div>accept-encoding: gzip</div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="body" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-3 text-sm">
                    <div className="text-muted-foreground">No request body for GET.</div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="cookies" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-3 text-sm">
                    <div className="text-muted-foreground">No cookies.</div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={45} minSize={20} className="min-h-0">
          <Tabs value={responseTab} onValueChange={setResponseTab} className="flex h-full min-h-0 flex-col gap-0">
            <div className="flex items-center justify-between gap-3 border-b bg-muted/40 p-2">
              <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsList className="h-9 w-max">
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                  <TabsTrigger value="resp-headers">Headers (26)</TabsTrigger>
                  <TabsTrigger value="resp-body">Body</TabsTrigger>
                  <TabsTrigger value="set-cookie">Set-Cookie (0)</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">h2</Badge>
                <Badge variant="secondary">200</Badge>
              </div>
            </div>

            <div className="min-h-0 flex-1">
              <TabsContent value="raw" className="h-full">
                <ScrollArea className="h-full">
                  <pre className="p-3 font-mono text-foreground text-xs leading-5">{responseHeaders.join("\n")}</pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="resp-headers" className="h-full">
                <ScrollArea className="h-full">
                  <pre className="p-3 font-mono text-foreground text-xs leading-5">{responseHeaders.join("\n")}</pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="resp-body" className="h-full">
                <ScrollArea className="h-full">
                  <pre className="p-3 font-mono text-foreground text-xs leading-5">{responseBody}</pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="set-cookie" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-3 text-sm">
                    <div className="text-muted-foreground">No Set-Cookie headers.</div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export function TableCellViewer({ item, label }: { item: ViewerItem; label?: React.ReactNode }) {
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
      <span className="min-w-0 flex-1 truncate">{label ?? item.header}</span>
    </Button>
  );
}

export function TableCellViewerDrawer() {
  const isMobile = useIsMobile();
  const { open, pinned, item, panelWidth, drafts, setDrafts, setOpen, setPinned, setPanelWidth } = useTableCellViewer();
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const isMountedRef = React.useRef(false);
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

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clampWidth = React.useCallback((width: number) => {
    const min = 360; // 22.5rem
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
    // Only unpin when switching to mobile after initial mount
    if (!isMountedRef.current) return;
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
        if (!isMountedRef.current) return;
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

    // When pinned (inset), the floating panel shouldn't exist.
    if (pinned) {
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
    unmountTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setMounted(false);
    }, DESKTOP_FLOATING_ANIMATION_MS);
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
    const raf = requestAnimationFrame(() => {
      if (!isMountedRef.current) return;
      setVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [isMobile, mounted]);

  if (!isMobile) {
    if (!item || !portalTarget || !mounted || !desktopPosition) return null;

    const width = clampWidth(panelWidth);
    // Slide fully past the viewport edge (account for the anchor inset on the right + a bit extra for shadow).
    const hiddenTranslateX = width + desktopPosition.right + 32;
    const draft = drafts[item.id] ?? item;

    return createPortal(
      <div className="pointer-events-none fixed inset-0 z-40">
        <div
          ref={contentRef}
          className={cn(
            "pointer-events-auto absolute flex flex-col overflow-hidden rounded-lg border bg-background shadow-lg",
            // Match Vaul's right drawer slide timing/curve (0.5s cubic-bezier(0.32, 0.72, 0, 1)).
            "transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          )}
          style={{
            top: `${desktopPosition.top}px`,
            right: `${desktopPosition.right}px`,
            bottom: `${desktopPosition.bottom}px`,
            width: `${width}px`,
            transform: visible ? "translate3d(0,0,0)" : `translate3d(${hiddenTranslateX}px,0,0)`,
          }}
        >
          <div
            aria-hidden="true"
            title="Resize"
            className="group absolute inset-y-0 left-0 z-20 w-3 cursor-col-resize touch-none select-none"
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
            <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-0 translate-x-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-background bg-border shadow-sm">
                <GripVerticalIcon className="size-2.5" />
              </div>
            </div>
          </div>

          <TableCellViewerBody
            draft={draft}
            onChange={(next) => setDrafts((prev) => ({ ...prev, [item.id]: next }))}
            isMobile={false}
            pinned={false}
            onTogglePinned={() => setPinned(true)}
            onClose={() => setOpen(false)}
          />
        </div>
      </div>,
      portalTarget,
    );
  }

  if (!item) return null;
  const draft = drafts[item.id] ?? item;

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
            className="group absolute inset-y-0 left-0 z-20 w-3 cursor-col-resize touch-none select-none"
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
            <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-0 translate-x-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-background bg-border shadow-sm">
                <GripVerticalIcon className="size-2.5" />
              </div>
            </div>
          </div>
        )}
        <TableCellViewerBody
          draft={draft}
          onChange={(next) => setDrafts((prev) => ({ ...prev, [item.id]: next }))}
          isMobile={isMobile}
          pinned={false}
          onClose={() => setOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

export function TableCellViewerInset() {
  const isMobile = useIsMobile();
  const { open, pinned, item, panelWidth, drafts, setDrafts, setOpen, setPinned, setPanelWidth } = useTableCellViewer();
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const isResizingRef = React.useRef(false);
  const resizeStartXRef = React.useRef(0);
  const resizeStartWidthRef = React.useRef(0);
  const prevUserSelectRef = React.useRef<string | null>(null);

  const clampWidth = React.useCallback((width: number) => {
    const min = 360; // 22.5rem
    // Allow resizing up to ~50% of the available viewport width (minus the drawer inset).
    const max = typeof window !== "undefined" ? Math.floor((window.innerWidth - 48) * 0.5) : 720;
    return Math.max(min, Math.min(max, Math.round(width)));
  }, []);

  // Match Quick Create's pinned (inset) behavior: no enter/exit animation.
  if (!item || isMobile || !open || !pinned) return null;

  const draft = drafts[item.id] ?? item;

  return (
    <aside
      className="hidden h-full shrink-0 self-stretch overflow-hidden lg:block"
      style={{ width: `${clampWidth(panelWidth)}px` }}
    >
      <section
        ref={sectionRef}
        className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm"
      >
        <div
          aria-hidden="true"
          title="Resize"
          className="group absolute top-0 bottom-0 left-0 z-20 w-3 cursor-col-resize touch-none select-none"
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
          <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-0 translate-x-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-background bg-border shadow-sm">
              <GripVerticalIcon className="size-2.5" />
            </div>
          </div>
        </div>
        <TableCellViewerBody
          draft={draft}
          onChange={(next) => setDrafts((prev) => ({ ...prev, [item.id]: next }))}
          isMobile={false}
          pinned
          onTogglePinned={() => setPinned(false)}
          onClose={() => setOpen(false)}
        />
      </section>
    </aside>
  );
}
