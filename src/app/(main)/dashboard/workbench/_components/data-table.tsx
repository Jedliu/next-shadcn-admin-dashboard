"use client";
"use no memo";

import * as React from "react";

import { Copy, ListFilterPlus, Plus, SlidersHorizontal, Trash2, XIcon } from "lucide-react";
import type { z } from "zod";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { withDndColumn } from "../../../../../components/data-table/table-utils";
import { dashboardColumns } from "./columns";
import type { sectionSchema } from "./schema";
import { TableCellViewerDrawer, TableCellViewerInset, TableCellViewerProvider } from "./table-cell-viewer";

type FacetFilters = {
  protocol?: string[];
  httpVersion?: string[];
  format?: string[];
  status?: string[];
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
  join: FilterGroupJoin;
  conditions: FilterCondition[];
};

const FILTER_FIELD_DEFS: Array<{
  key: FilterFieldKey;
  label: string;
  options: Array<{ label: string; value: string }>;
}> = [
  {
    key: "protocol",
    label: "Protocol",
    options: [
      { label: "Http", value: "Http" },
      { label: "Https", value: "Https" },
      { label: "Websocket", value: "Websocket" },
    ],
  },
  {
    key: "httpVersion",
    label: "HTTP Version",
    options: [
      { label: "HTTP1", value: "HTTP1" },
      { label: "HTTP2", value: "HTTP2" },
    ],
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
    key: "status",
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

function createEmptyGroup(): FilterGroup {
  return { id: newId("group"), join: "all", conditions: [createEmptyCondition()] };
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
          className="h-8 min-w-48 justify-start gap-2 px-2 text-left font-normal"
        >
          <span className="text-muted-foreground text-xs">Values</span>
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
                className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
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
}: {
  groups: FilterGroup[];
  totalActiveConditions: number;
  onClearAll: () => void;
  onChange: (next: FilterGroup[]) => void;
}) {
  return (
    <div className="w-[44rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
      <div className="flex items-center justify-between gap-4 border-b bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">Filters</div>
          {totalActiveConditions > 0 ? <Badge variant="secondary">{totalActiveConditions}</Badge> : null}
        </div>
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

      <div className="p-3">
        <div className="grid gap-3">
          {groups.map((group, groupIndex) => (
            <React.Fragment key={group.id}>
              <div className="rounded-lg bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Group {groupIndex + 1}</div>
                    <Select
                      value={group.join}
                      onValueChange={(value) => {
                        onChange(groups.map((g) => (g.id === group.id ? { ...g, join: value as FilterGroupJoin } : g)));
                      }}
                    >
                      <SelectTrigger className="h-8 w-[10rem]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Match all (AND)</SelectItem>
                        <SelectItem value="any">Match any (OR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const next = groups.filter((g) => g.id !== group.id);
                      onChange(next.length > 0 ? next : [createEmptyGroup()]);
                    }}
                    title="Remove group"
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Remove group</span>
                  </Button>
                </div>

                <div className="text-muted-foreground mt-2 text-sm">
                  {group.join === "all" ? "All of the following are true:" : "Any of the following are true:"}
                </div>

                <div className="mt-2 grid gap-2">
                  {group.conditions.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No conditions yet.</div>
                  ) : (
                    group.conditions.map((cond, conditionIndex) => {
                      const fieldDef = cond.field
                        ? (FILTER_FIELD_DEFS.find((f) => f.key === cond.field) ?? null)
                        : null;
                      return (
                        <div
                          key={cond.id}
                          className="bg-background flex items-center gap-2 overflow-hidden rounded-md border"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                                            c.id === cond.id ? { ...c, field: value as FilterFieldKey, values: [] } : c,
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
                                            c.id === cond.id ? { ...c, operator: value as FilterOperator } : c,
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
                              className="text-muted-foreground hover:text-foreground px-3 py-2"
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
                              className="text-muted-foreground hover:text-foreground px-3 py-2"
                              title="Remove"
                              onClick={() => {
                                onChange(
                                  groups.map((g) =>
                                    g.id !== group.id
                                      ? g
                                      : {
                                          ...g,
                                          conditions:
                                            g.conditions.length <= 1
                                              ? [createEmptyCondition()]
                                              : g.conditions.filter((c) => c.id !== cond.id),
                                        },
                                  ),
                                );
                              }}
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
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
                  </div>
                </div>
              </div>

              {groupIndex < groups.length - 1 ? (
                <div className="flex items-center justify-center">
                  <span className="text-muted-foreground rounded-full border bg-background px-3 py-1 text-xs">OR</span>
                </div>
              ) : null}
            </React.Fragment>
          ))}

          <div className="flex items-center justify-start">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onChange([...groups, createEmptyGroup()])}
            >
              <Plus className="size-4" />
              Add group
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DataTable({ data: initialData }: { data: z.infer<typeof sectionSchema>[] }) {
  const [data, setData] = React.useState(() => initialData);
  const columns = withDndColumn(dashboardColumns);
  const table = useDataTableInstance({ data, columns, getRowId: (row) => row.id.toString() });
  const [tabs, setTabs] = React.useState([
    { value: "outline", label: "Outline" },
    { value: "past-performance", label: "Past Performance", badge: 3 },
    { value: "key-personnel", label: "Key Personnel", badge: 2 },
    { value: "focus-documents", label: "Focus Documents" },
  ]);
  const [activeTab, setActiveTab] = React.useState("outline");
  const [filterGroups, setFilterGroups] = React.useState<FilterGroup[]>(() => [
    {
      id: newId("group"),
      join: "all",
      conditions: [
        { id: newId("cond"), field: "protocol", operator: "in", values: ["Https"] },
        { id: newId("cond"), field: "httpVersion", operator: "in", values: ["HTTP2"] },
        { id: newId("cond"), field: "format", operator: "in", values: ["HTML"] },
        { id: newId("cond"), field: "status", operator: "in", values: ["2xx"] },
      ],
    },
  ]);
  const [filtersEnabled, setFiltersEnabled] = React.useState(true);
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

  const totalSelectedFilters = React.useMemo(() => countActiveConditions(filterGroups), [filterGroups]);
  const hasAnyFilters = totalSelectedFilters > 0;
  const showFiltered = hasAnyFilters && filtersEnabled;

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
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="relative overflow-hidden rounded-lg border before:absolute before:top-0 before:right-0 before:left-0 before:z-0 before:box-content before:h-10 before:border-border before:border-b before:bg-muted">
                <DataTableNew
                  dndEnabled
                  table={table}
                  columns={columns}
                  onReorder={setData}
                  className="relative z-10 w-auto [&_thead_tr]:border-transparent"
                />
              </div>
              <DataTablePagination table={table} />
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
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                  <span>{tab.label}</span>
                  {tab.badge ? <Badge variant="secondary">{tab.badge}</Badge> : null}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground inline-flex size-5 cursor-pointer items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100"
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
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex flex-nowrap items-center gap-2">
                <FieldLabel htmlFor="filters-enabled" className="!w-fit">
                  <Field
                    orientation="horizontal"
                    className="gap-1.5 overflow-hidden !px-3 !py-1.5 transition-all duration-100 ease-linear group-has-data-[state=checked]/field-label:!px-2"
                  >
                    <Checkbox
                      id="filters-enabled"
                      checked={showFiltered}
                      onCheckedChange={() => {
                        if (!hasAnyFilters) return;
                        setFiltersEnabled((prev) => !prev);
                      }}
                      className="-ml-6 -translate-x-1 rounded-full transition-all duration-100 ease-linear data-[state=checked]:ml-0 data-[state=checked]:translate-x-0"
                    />
                    <FieldTitle>{showFiltered ? "Filtered" : "All"}</FieldTitle>
                  </Field>
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Button type="button" size="icon-sm" variant="outline" title="Filters">
                        <ListFilterPlus />
                        <span className="sr-only">Filters</span>
                      </Button>
                      {totalSelectedFilters > 0 ? (
                        <span className="bg-destructive absolute top-0 right-0 flex min-w-4 origin-center translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1 text-white text-xs">
                          {totalSelectedFilters}
                        </span>
                      ) : null}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    className="w-auto border-0 bg-transparent p-0 shadow-none"
                  >
                    <FiltersBuilder
                      groups={filterGroups}
                      totalActiveConditions={totalSelectedFilters}
                      onClearAll={() => {
                        setFilterGroups([createEmptyGroup()]);
                        setFiltersEnabled(false);
                      }}
                      onChange={(next) => {
                        setFilterGroups(next);
                        setFiltersEnabled(true);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <div className="h-6 w-px bg-border" />
                <DataTableFacetedFilter
                  title="Protocol"
                  options={[
                    { label: "Http", value: "Http" },
                    { label: "Https", value: "Https" },
                    { label: "Websocket", value: "Websocket" },
                  ]}
                  values={facetFilters.protocol}
                  onChange={(value) => setFacetFilter("protocol", value)}
                />
                <DataTableFacetedFilter
                  title="HTTP Version"
                  options={[
                    { label: "HTTP1", value: "HTTP1" },
                    { label: "HTTP2", value: "HTTP2" },
                  ]}
                  values={facetFilters.httpVersion}
                  onChange={(value) => setFacetFilter("httpVersion", value)}
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
                  values={facetFilters.status}
                  onChange={(value) => setFacetFilter("status", value)}
                />
                {hasAnyFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterGroups([createEmptyGroup()]);
                      setFiltersEnabled(false);
                    }}
                    className="text-sm font-medium text-foreground hover:text-foreground/80 inline-flex items-center gap-2 px-3 py-1.5"
                  >
                    Reset
                    <XIcon className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <Button variant="outline" size="sm">
                <SlidersHorizontal />
                <span className="hidden lg:inline">Filters</span>
              </Button>
            </div>
          </div>
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className={
                tab.value === "outline" ? "relative flex min-h-0 flex-1 flex-col gap-4 overflow-auto" : "flex flex-col"
              }
            >
              {renderTabContent(tab.value)}
            </TabsContent>
          ))}
        </Tabs>
        <TableCellViewerDrawer />
      </div>
    </TableCellViewerProvider>
  );
}
