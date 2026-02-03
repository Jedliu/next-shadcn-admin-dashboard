"use client";
"use no memo";

import * as React from "react";

import { Copy, GripVerticalIcon, ListFilterPlus, Plus, Search, Trash2, XIcon } from "lucide-react";
import { createPortal } from "react-dom";
import type { z } from "zod";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { withDndColumn } from "../../../../../components/data-table/table-utils";
import { dashboardColumns } from "./columns";
import type { sectionSchema } from "./schema";
import { TableCellViewerDrawer, TableCellViewerInset, TableCellViewerProvider } from "./table-cell-viewer";

type FacetFilters = {
  client?: string[];
  host?: string[];
  format?: string[];
  statusGroup?: string[];
};

type FilterFieldKey = keyof FacetFilters;
type FilterOperator = "in" | "notIn";
type FilterGroupJoin = "all" | "any";

type FilterCondition = {
  id: string;
  field: FilterFieldKey | null;
  operator: FilterOperator;
  values: string[];
};

type FilterGroup = {
  id: string;
  // Relationship between conditions inside this group.
  conditionsJoin: FilterGroupJoin;
  // Relationship between groups (kept consistent across all groups for now).
  join: FilterGroupJoin;
  conditions: FilterCondition[];
};

const CLIENT_OPTIONS = [
  { label: "Eddie Lake", value: "Eddie Lake" },
  { label: "Jamik Tashpulatov", value: "Jamik Tashpulatov" },
  { label: "Sarah Johnson", value: "Sarah Johnson" },
  { label: "Assign reviewer", value: "Assign reviewer" },
] as const;

const HOST_OPTIONS = [{ label: "api.studio-admin.dev", value: "api.studio-admin.dev" }] as const;

const FILTER_FIELD_DEFS: Array<{
  key: FilterFieldKey;
  label: string;
  options: Array<{ label: string; value: string }>;
}> = [
  {
    key: "client",
    label: "Client",
    options: [...CLIENT_OPTIONS],
  },
  {
    key: "host",
    label: "Host",
    options: [...HOST_OPTIONS],
  },
  {
    key: "format",
    label: "Format",
    options: [
      { label: "JSON", value: "JSON" },
      { label: "XML", value: "XML" },
      { label: "Text", value: "Text" },
      { label: "HTML", value: "HTML" },
      { label: "JS", value: "JS" },
      { label: "CSS", value: "CSS" },
      { label: "Image", value: "Image" },
      { label: "Media", value: "Media" },
      { label: "Binary", value: "Binary" },
    ],
  },
  {
    key: "statusGroup",
    label: "Status",
    options: [
      { label: "1xx", value: "1xx" },
      { label: "2xx", value: "2xx" },
      { label: "3xx", value: "3xx" },
      { label: "4xx", value: "4xx" },
      { label: "5xx", value: "5xx" },
    ],
  },
];

function newId(prefix: string) {
  // Stable enough for UI keys; avoids pulling in an id lib.
  const uuid = globalThis.crypto?.randomUUID?.();
  return `${prefix}-${uuid ?? Math.random().toString(16).slice(2)}`;
}

function createEmptyCondition(): FilterCondition {
  return { id: newId("cond"), field: null, operator: "in", values: [] };
}

function createEmptyGroup(join: FilterGroupJoin = "all"): FilterGroup {
  return { id: newId("group"), join, conditionsJoin: "all", conditions: [createEmptyCondition()] };
}

function deriveFacetFilters(groups: FilterGroup[]): FacetFilters {
  const next: FacetFilters = {};
  for (const group of groups) {
    for (const cond of group.conditions) {
      if (!cond.field) continue;
      if (cond.operator !== "in") continue;
      if (cond.values.length === 0) continue;

      const existing = next[cond.field] ?? [];
      next[cond.field] = Array.from(new Set([...existing, ...cond.values]));
    }
  }
  return next;
}

function countActiveConditions(groups: FilterGroup[]) {
  return groups.reduce(
    (acc, group) => acc + group.conditions.filter((c) => Boolean(c.field) && c.values.length > 0).length,
    0,
  );
}

function ValuesPicker({
  disabled,
  options,
  values,
  onChange,
}: {
  disabled?: boolean;
  options: Array<{ label: string; value: string }>;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const selected = React.useMemo(() => new Set(values), [values]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 min-w-0 flex-1 justify-start gap-2 px-2 text-left font-normal"
        >
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {values.length === 0 ? <span className="text-muted-foreground">Select…</span> : values.join(", ")}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" sideOffset={8} className="w-72 p-2">
        <div className="flex max-h-64 flex-col gap-1 overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {options.map((opt) => {
            const checked = selected.has(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                onClick={() => {
                  if (checked) {
                    onChange(values.filter((v) => v !== opt.value));
                    return;
                  }
                  onChange([...values, opt.value]);
                }}
              >
                <Checkbox checked={checked} />
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
        {values.length > 0 ? (
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
              Clear
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function FiltersBuilder({
  groups,
  totalActiveConditions,
  onClearAll,
  onChange,
  variant = "popover",
  showHeader = variant === "popover",
}: {
  groups: FilterGroup[];
  totalActiveConditions: number;
  onClearAll: () => void;
  onChange: (next: FilterGroup[]) => void;
  variant?: "popover" | "panel";
  showHeader?: boolean;
}) {
  const groupMatchMode = groups[0]?.join ?? "all";
  const showGroupConnector = groups.length > 1;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden",
        variant === "popover" &&
          "max-h-[calc(var(--radix-popover-content-available-height)-0.75rem)] w-[44rem] max-w-[calc(100vw-2rem)] rounded-lg border bg-popover text-popover-foreground shadow-lg",
        variant === "panel" && "min-h-0 flex-1",
      )}
    >
      {showHeader ? (
        <div className="flex items-center justify-between gap-4 border-b bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm">Filters</div>
            {totalActiveConditions > 0 ? <Badge variant="secondary">{totalActiveConditions}</Badge> : null}
          </div>
        </div>
      ) : null}

      <div className={cn("min-h-0 flex-1 overflow-y-auto", variant === "popover" ? "p-2" : "p-3")}>
        <div className="relative">
          {showGroupConnector ? (
            <>
              <div className="absolute top-0 bottom-0 left-8 w-px bg-border" />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-8 rounded-full"
                onClick={() =>
                  onChange(
                    groups.map((g) => ({
                      ...g,
                      join: groupMatchMode === "all" ? ("any" as const) : ("all" as const),
                    })),
                  )
                }
                title="Toggle group relationship"
              >
                {groupMatchMode === "all" ? "AND" : "OR"}
              </Button>
            </>
          ) : null}

          <div className={showGroupConnector ? "space-y-1.5 pl-16" : "space-y-1.5"}>
            {groups.map((group, groupIndex) => (
              <React.Fragment key={group.id}>
                <div className="relative">
                  {showGroupConnector ? (
                    groupIndex === 0 ? (
                      <div className="-left-8 absolute top-0 h-px w-8 bg-border" />
                    ) : groupIndex === groups.length - 1 ? (
                      <div className="-left-8 absolute bottom-0 h-px w-8 bg-border" />
                    ) : null
                  ) : null}

                  <div className="rounded-lg border bg-muted/20 p-2">
                    <div className="mt-1.5">
                      {group.conditions.length === 0 ? (
                        <div className="text-muted-foreground text-sm">No conditions yet.</div>
                      ) : (
                        <div className="relative">
                          {group.conditions.length > 1 ? (
                            <>
                              <div className="absolute top-0 bottom-0 left-7 w-px bg-border" />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-7 rounded-full"
                                onClick={() =>
                                  onChange(
                                    groups.map((g) =>
                                      g.id !== group.id
                                        ? g
                                        : { ...g, conditionsJoin: g.conditionsJoin === "all" ? "any" : "all" },
                                    ),
                                  )
                                }
                                title="Toggle condition relationship"
                              >
                                {group.conditionsJoin === "all" ? "AND" : "OR"}
                              </Button>
                            </>
                          ) : null}

                          <div className={group.conditions.length > 1 ? "grid min-w-0 pl-16" : "grid min-w-0"}>
                            {group.conditions.map((cond, conditionIndex) => {
                              const fieldDef = cond.field
                                ? (FILTER_FIELD_DEFS.find((f) => f.key === cond.field) ?? null)
                                : null;
                              return (
                                <div key={cond.id} className="relative min-w-0">
                                  {group.conditions.length > 1 ? (
                                    conditionIndex === 0 ? (
                                      <div className="-left-9 absolute top-0 h-px w-9 bg-border" />
                                    ) : conditionIndex === group.conditions.length - 1 ? (
                                      <div className="-left-9 absolute bottom-0 h-px w-9 bg-border" />
                                    ) : null
                                  ) : null}

                                  <div className="flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md bg-background">
                                    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-2 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                      <Select
                                        value={cond.field ?? ""}
                                        onValueChange={(value) => {
                                          onChange(
                                            groups.map((g) =>
                                              g.id !== group.id
                                                ? g
                                                : {
                                                    ...g,
                                                    conditions: g.conditions.map((c) =>
                                                      c.id === cond.id
                                                        ? { ...c, field: value as FilterFieldKey, values: [] }
                                                        : c,
                                                    ),
                                                  },
                                            ),
                                          );
                                        }}
                                      >
                                        <SelectTrigger className="h-8 w-[10.5rem]">
                                          <SelectValue placeholder="Field" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {FILTER_FIELD_DEFS.map((f) => (
                                            <SelectItem key={f.key} value={f.key}>
                                              {f.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>

                                      <Select
                                        value={cond.operator}
                                        onValueChange={(value) => {
                                          onChange(
                                            groups.map((g) =>
                                              g.id !== group.id
                                                ? g
                                                : {
                                                    ...g,
                                                    conditions: g.conditions.map((c) =>
                                                      c.id === cond.id
                                                        ? { ...c, operator: value as FilterOperator }
                                                        : c,
                                                    ),
                                                  },
                                            ),
                                          );
                                        }}
                                      >
                                        <SelectTrigger className="h-8 w-[9rem]">
                                          <SelectValue placeholder="Operator" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="in">is any of</SelectItem>
                                          <SelectItem value="notIn">is none of</SelectItem>
                                        </SelectContent>
                                      </Select>

                                      <ValuesPicker
                                        disabled={!cond.field}
                                        options={fieldDef?.options ?? []}
                                        values={cond.values}
                                        onChange={(nextValues) => {
                                          onChange(
                                            groups.map((g) =>
                                              g.id !== group.id
                                                ? g
                                                : {
                                                    ...g,
                                                    conditions: g.conditions.map((c) =>
                                                      c.id === cond.id ? { ...c, values: nextValues } : c,
                                                    ),
                                                  },
                                            ),
                                          );
                                        }}
                                      />
                                    </div>

                                    <div className="flex shrink-0 items-center">
                                      <button
                                        type="button"
                                        className="px-2 py-1.5 text-muted-foreground hover:text-foreground"
                                        title="Clone"
                                        onClick={() => {
                                          onChange(
                                            groups.map((g) =>
                                              g.id !== group.id
                                                ? g
                                                : {
                                                    ...g,
                                                    conditions: [
                                                      ...g.conditions.slice(0, conditionIndex + 1),
                                                      { ...cond, id: newId("cond"), values: [...cond.values] },
                                                      ...g.conditions.slice(conditionIndex + 1),
                                                    ],
                                                  },
                                            ),
                                          );
                                        }}
                                      >
                                        <Copy className="size-4" />
                                        <span className="sr-only">Clone</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="px-2 py-1.5 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                                        title="Remove"
                                        disabled={groups.length === 1 && group.conditions.length === 1}
                                        onClick={() => {
                                          if (groups.length === 1 && group.conditions.length === 1) return;
                                          onChange(
                                            groups.flatMap((g) => {
                                              if (g.id !== group.id) return [g];
                                              const nextConditions = g.conditions.filter((c) => c.id !== cond.id);
                                              // If the group is empty, remove the group entirely.
                                              if (nextConditions.length === 0) return [];
                                              return [{ ...g, conditions: nextConditions }];
                                            }),
                                          );
                                        }}
                                      >
                                        <Trash2 className="size-4" />
                                        <span className="sr-only">Remove</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary"
                          onClick={() => {
                            onChange(
                              groups.map((g) =>
                                g.id !== group.id ? g : { ...g, conditions: [...g.conditions, createEmptyCondition()] },
                              ),
                            );
                          }}
                        >
                          <Plus className="size-4" />
                          Add condition
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            const next = groups.filter((g) => g.id !== group.id);
                            onChange(next.length > 0 ? next : [createEmptyGroup(groupMatchMode)]);
                          }}
                          title={`Remove group ${groupIndex + 1}`}
                        >
                          <Trash2 className="size-4" />
                          Remove group
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t bg-muted/40 px-3 py-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onChange([...groups, createEmptyGroup(groupMatchMode)])}
        >
          <Plus className="size-4" />
          Add group
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onClearAll}
          disabled={totalActiveConditions === 0}
        >
          Clear all
        </Button>
      </div>
    </div>
  );
}

function FiltersPanelDrawer({
  open,
  panelWidth,
  setPanelWidth,
  totalActiveConditions,
  onOpenChange,
  children,
}: {
  open: boolean;
  panelWidth: number;
  setPanelWidth: React.Dispatch<React.SetStateAction<number>>;
  totalActiveConditions: number;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
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
  const DESKTOP_FLOATING_ANIMATION_MS = 500; // Match the existing right panel animation.

  const clampWidth = React.useCallback((width: number) => {
    const min = 360; // 22.5rem
    const max = typeof window !== "undefined" ? Math.floor((window.innerWidth - 48) * 0.5) : 720;
    return Math.max(min, Math.min(max, Math.round(width)));
  }, []);

  React.useEffect(() => {
    if (isMobile) return;
    setPortalTarget(document.body);
  }, [isMobile]);

  React.useEffect(() => {
    if (isMobile) return;
    const onResize = () => setPanelWidth((w) => clampWidth(w));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampWidth, isMobile, setPanelWidth]);

  React.useEffect(() => {
    if (isMobile) {
      setDesktopPosition(null);
      return;
    }

    // Keep the last computed position while closing so the panel doesn't "jump" during the animation.
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
  }, [isMobile, open]);

  React.useEffect(() => {
    if (isMobile) return;
    if (unmountTimeoutRef.current) {
      window.clearTimeout(unmountTimeoutRef.current);
      unmountTimeoutRef.current = null;
    }

    if (open) {
      setMounted(true);
      // Start from hidden so the entrance animation is visible.
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
  }, [isMobile, open]);

  React.useEffect(() => {
    if (isMobile) return;
    if (!mounted || !desktopPosition) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [desktopPosition, isMobile, mounted]);

  if (!isMobile) {
    if (!portalTarget || !mounted || !desktopPosition) return null;

    const width = clampWidth(panelWidth);
    const hiddenTranslateX = width + desktopPosition.right + 32;

    return createPortal(
      <div className="pointer-events-none fixed inset-0 z-40">
        <div
          ref={contentRef}
          className={cn(
            "pointer-events-auto absolute flex flex-col overflow-hidden rounded-lg border bg-background shadow-lg",
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

          <div className="flex items-center justify-between gap-2 border-b bg-muted/40 p-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 truncate font-medium text-sm">Filters</div>
              {totalActiveConditions > 0 ? <Badge variant="secondary">{totalActiveConditions}</Badge> : null}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              title="Close"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        </div>
      </div>,
      portalTarget,
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
      modal={false}
      dismissible={false}
    >
      <DrawerContent hideOverlay className="overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b bg-muted/40 p-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 truncate font-medium text-sm">Filters</div>
              {totalActiveConditions > 0 ? <Badge variant="secondary">{totalActiveConditions}</Badge> : null}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              title="Close"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function DataTable({ data: initialData }: { data: z.infer<typeof sectionSchema>[] }) {
  const [data, setData] = React.useState<z.infer<typeof sectionSchema>[]>(() => {
    // IMPORTANT: Keep derived demo fields deterministic to avoid SSR hydration mismatches.
    // - Don't use Date.now()/Math.random()
    // - Don't use locale/timezone dependent formatting like toTimeString()
    const baseTs = Date.parse("2026-02-01T12:00:00.000Z");
    const formats = ["HTML", "JSON", "XML", "Text", "JS", "CSS", "Image", "Media", "Binary"] as const;
    return initialData.map((row, index): z.infer<typeof sectionSchema> => {
      const id = row.id;
      const ssl = id % 2 === 0;
      const method = id % 3 === 0 ? "POST" : "GET";
      const code = [200, 204, 301, 304, 400, 401, 403, 404, 500][id % 9] ?? 200;
      const statusGroup = `${Math.floor(code / 100)}xx`;
      const ts = new Date(baseTs - (index * 7 + id) * 60_000);
      const iso = ts.toISOString();
      const date = iso.slice(0, 10);
      const time = iso.slice(11, 19);
      const host = "api.studio-admin.dev";
      const path = `/v1/items/${id}`;
      const query = `q=${encodeURIComponent(row.header)}`;
      const url = `https://${host}${path}?${query}`;
      const format = formats[id % formats.length] ?? "HTML";
      const duration = 120 + (id % 9) * 37;
      const latency = 20 + (id % 7) * 9;
      const requestTotalTime = Math.round(duration * 0.45);
      const responseTotalTime = Math.max(1, duration - requestTotalTime);
      const timeComplete = duration + latency;
      const requestBodySize = 300 + (id % 13) * 97;
      const responseBodySize = 900 + (id % 17) * 131;
      const serverIpAddress = `10.0.${id % 10}.${(id % 240) + 10}`;
      const edited = id % 5 === 0;
      const client = row.reviewer;
      const comment = id % 4 === 0 ? "Needs review" : "";

      return {
        ...row,
        ssl,
        method,
        code,
        date,
        time,
        url,
        host,
        path,
        query,
        format,
        statusGroup,
        duration,
        latency,
        requestTotalTime,
        responseTotalTime,
        timeComplete,
        requestBodySize,
        responseBodySize,
        serverIpAddress,
        edited,
        client,
        comment,
        // Keep the existing viewer input functional: use `target` as URL.
        target: url,
      };
    });
  });
  const columns = withDndColumn(dashboardColumns);
  const table = useDataTableInstance({
    data,
    columns,
    defaultPageSize: data.length,
    defaultColumnVisibility: {
      format: false,
      host: false,
      path: false,
      query: false,
      date: false,
      statusGroup: false,
      timeComplete: false,
      requestTotalTime: false,
      responseTotalTime: false,
      latency: false,
      serverIpAddress: false,
    },
    getRowId: (row) => row.id.toString(),
  });
  const [tabs, setTabs] = React.useState([
    { value: "outline", label: "Outline" },
    { value: "past-performance", label: "Past Performance", badge: 3 },
    { value: "key-personnel", label: "Key Personnel", badge: 2 },
    { value: "focus-documents", label: "Focus Documents" },
  ]);
  const [activeTab, setActiveTab] = React.useState("outline");
  const [filterGroups, setFilterGroups] = React.useState<FilterGroup[]>(() => [createEmptyGroup()]);
  const [filtersEnabled, setFiltersEnabled] = React.useState(false); // Also set filtersEnabled to false initially
  const [filtersPanelOpen, setFiltersPanelOpen] = React.useState(false);
  const [filtersPanelWidth, setFiltersPanelWidth] = React.useState(416);
  const [urlQuery, setUrlQuery] = React.useState("");
  const facetFilters = React.useMemo(() => deriveFacetFilters(filterGroups), [filterGroups]);

  const setFacetFilter = React.useCallback((group: FilterFieldKey, values?: string[]) => {
    setFilterGroups((prev) => {
      const nextValues = values?.length ? values : [];
      const cleaned = (prev.length > 0 ? prev : [createEmptyGroup()]).map((g) => ({
        ...g,
        conditions: g.conditions.filter((c) => c.field !== group),
      }));

      const first = cleaned[0] ?? createEmptyGroup();
      const nextFirst: FilterGroup =
        nextValues.length > 0
          ? {
              ...first,
              conditions: [
                ...first.conditions.filter((c) => c.field !== null),
                { id: newId("cond"), field: group, operator: "in", values: nextValues },
              ],
            }
          : first;

      const normalized = cleaned.map((g) =>
        g.conditions.length === 0 ? { ...g, conditions: [createEmptyCondition()] } : g,
      );
      normalized[0] =
        nextFirst.conditions.length === 0 ? { ...nextFirst, conditions: [createEmptyCondition()] } : nextFirst;

      return normalized;
    });
    setFiltersEnabled(true);
  }, []);

  const totalSelectedFilters = React.useMemo(
    () => countActiveConditions(filterGroups) + (urlQuery.trim() ? 1 : 0),
    [filterGroups, urlQuery],
  );
  const hasAnyFilters = totalSelectedFilters > 0;
  const showFiltered = hasAnyFilters && filtersEnabled;

  const appliedColumnFilters = React.useMemo(() => {
    if (!filtersEnabled) return [];

    const next: Array<{ id: string; value: unknown }> = [];
    const q = urlQuery.trim();
    if (q) next.push({ id: "url", value: q });

    for (const [key, values] of Object.entries(facetFilters) as Array<[FilterFieldKey, string[] | undefined]>) {
      if (!values?.length) continue;
      next.push({ id: key, value: values });
    }

    return next;
  }, [facetFilters, filtersEnabled, urlQuery]);

  React.useEffect(() => {
    table.setColumnFilters(appliedColumnFilters);
  }, [appliedColumnFilters, table]);

  React.useEffect(() => {
    if (activeTab !== "outline" && filtersPanelOpen) {
      setFiltersPanelOpen(false);
    }
  }, [activeTab, filtersPanelOpen]);

  React.useEffect(() => {
    if (!hasAnyFilters && filtersEnabled) {
      setFiltersEnabled(false);
    }
  }, [filtersEnabled, hasAnyFilters]);

  const handleRemoveTab = React.useCallback(
    (value: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev;
        const nextTabs = prev.filter((tab) => tab.value !== value);
        if (value === activeTab) {
          const nextIndex = Math.min(
            prev.findIndex((tab) => tab.value === value),
            nextTabs.length - 1,
          );
          setActiveTab(nextTabs[Math.max(0, nextIndex)]?.value ?? "");
        }
        return nextTabs;
      });
    },
    [activeTab],
  );

  const renderTabContent = (value: string) => {
    switch (value) {
      case "outline":
        return (
          <div
            data-slot="table-cell-viewer-anchor"
            className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg border before:absolute before:top-0 before:right-0 before:left-0 before:z-0 before:box-content before:h-10 before:bg-muted">
                <div className="relative z-10 min-h-0 flex-1 overflow-auto">
                  <DataTableNew
                    dndEnabled
                    table={table}
                    columns={columns}
                    onReorder={setData}
                    className="w-auto [&_thead_tr]:border-transparent"
                  />
                </div>
              </div>
            </div>
            <TableCellViewerInset />
          </div>
        );
      case "past-performance":
      case "key-personnel":
      case "focus-documents":
        return <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />;
      default:
        return null;
    }
  };

  return (
    <TableCellViewerProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 w-full flex-1 flex-col justify-start gap-2"
        >
          <div className="flex items-center justify-between">
            <Label htmlFor="view-selector" className="sr-only">
              View
            </Label>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="flex @4xl/main:hidden w-fit" size="sm" id="view-selector">
                <SelectValue placeholder="Select a view" />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TabsList
              variant="line"
              className="@4xl/main:flex hidden w-full justify-start **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1"
            >
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2" asChild>
                  <div className="flex items-center gap-2">
                    <span>{tab.label}</span>
                    {tab.badge ? <Badge variant="secondary">{tab.badge}</Badge> : null}
                    <button
                      type="button"
                      className="inline-flex size-5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground opacity-70 transition-opacity hover:text-foreground hover:opacity-100"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveTab(tab.value);
                      }}
                      aria-label={`Remove ${tab.label}`}
                      disabled={tabs.length <= 1}
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center overflow-x-auto p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex flex-nowrap items-center gap-2">
                <div className="relative w-56 shrink-0">
                  <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
                  <Input
                    value={urlQuery}
                    onChange={(e) => setUrlQuery(e.target.value)}
                    placeholder="Filter URL..."
                    className="h-8 pl-9"
                  />
                </div>
                <FieldLabel htmlFor="filters-enabled" className="!w-fit">
                  <Field
                    orientation="horizontal"
                    className="!px-3 !py-1.5 group-has-data-[state=checked]/field-label:!px-2 gap-1.5 overflow-hidden transition-all duration-100 ease-linear"
                  >
                    <Checkbox
                      id="filters-enabled"
                      checked={showFiltered}
                      onCheckedChange={() => {
                        if (!hasAnyFilters) return;
                        setFiltersEnabled((prev) => !prev);
                      }}
                      className="rounded-full transition-all duration-100 ease-linear data-[state=unchecked]:-ml-6 data-[state=unchecked]:-translate-x-1 data-[state=checked]:ml-0 data-[state=checked]:translate-x-0 [html[data-theme-preset=brutalist]_&]:shadow-none [html[data-theme-preset=brutalist]_&]:data-[state=checked]:shadow-xs [html[data-theme-preset=brutalist]_&]:data-[state=unchecked]:opacity-0"
                    />
                    <FieldTitle>{showFiltered ? "Filtered" : "All"}</FieldTitle>
                  </Field>
                </FieldLabel>
                <div className="h-6 w-px bg-border" />
                <DataTableFacetedFilter
                  title="Client"
                  options={[...CLIENT_OPTIONS]}
                  values={facetFilters.client}
                  onChange={(value) => setFacetFilter("client", value)}
                />
                <DataTableFacetedFilter
                  title="Host"
                  options={[...HOST_OPTIONS]}
                  values={facetFilters.host}
                  onChange={(value) => setFacetFilter("host", value)}
                />
                <DataTableFacetedFilter
                  title="Format"
                  options={[
                    { label: "JSON", value: "JSON" },
                    { label: "XML", value: "XML" },
                    { label: "Text", value: "Text" },
                    { label: "HTML", value: "HTML" },
                    { label: "JS", value: "JS" },
                    { label: "CSS", value: "CSS" },
                    { label: "Image", value: "Image" },
                    { label: "Media", value: "Media" },
                    { label: "Binary", value: "Binary" },
                  ]}
                  values={facetFilters.format}
                  onChange={(value) => setFacetFilter("format", value)}
                  listClassName="max-h-none overflow-visible"
                />
                <DataTableFacetedFilter
                  title="Status"
                  options={[
                    { label: "1xx", value: "1xx" },
                    { label: "2xx", value: "2xx" },
                    { label: "3xx", value: "3xx" },
                    { label: "4xx", value: "4xx" },
                    { label: "5xx", value: "5xx" },
                  ]}
                  values={facetFilters.statusGroup}
                  onChange={(value) => setFacetFilter("statusGroup", value)}
                />
                {hasAnyFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterGroups([createEmptyGroup()]);
                      setUrlQuery("");
                      setFiltersEnabled(false);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 font-medium text-foreground text-sm hover:text-foreground/80"
                  >
                    Reset
                    <XIcon className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2 pr-4">
              <DataTableViewOptions table={table} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFiltersPanelOpen((prev) => !prev)}
                disabled={activeTab !== "outline"}
                className="relative"
              >
                <ListFilterPlus />
                <span className="hidden lg:inline">Filters</span>
                {totalSelectedFilters > 0 ? (
                  <span className="-translate-y-1/2 pointer-events-none absolute top-0 right-0 z-20 flex min-w-4 origin-center translate-x-1/2 items-center justify-center rounded-full bg-destructive px-1 text-white text-xs">
                    {totalSelectedFilters}
                  </span>
                ) : null}
              </Button>
            </div>
          </div>
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className={
                tab.value === "outline"
                  ? "relative flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
                  : "flex flex-col"
              }
            >
              {renderTabContent(tab.value)}
            </TabsContent>
          ))}
        </Tabs>
        <TableCellViewerDrawer />
        <FiltersPanelDrawer
          open={filtersPanelOpen}
          onOpenChange={setFiltersPanelOpen}
          panelWidth={filtersPanelWidth}
          setPanelWidth={setFiltersPanelWidth}
          totalActiveConditions={totalSelectedFilters}
        >
          <FiltersBuilder
            groups={filterGroups}
            totalActiveConditions={totalSelectedFilters}
            onClearAll={() => {
              setFilterGroups([createEmptyGroup()]);
              setUrlQuery("");
              setFiltersEnabled(false);
            }}
            onChange={(next) => {
              setFilterGroups(next);
              setFiltersEnabled(true);
            }}
            variant="panel"
            showHeader={false}
          />
        </FiltersPanelDrawer>
      </div>
    </TableCellViewerProvider>
  );
}
