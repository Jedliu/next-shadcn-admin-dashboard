"use client";
"use no memo";

import * as React from "react";

import { SlidersHorizontal, XIcon } from "lucide-react";
import type { z } from "zod";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { withDndColumn } from "../../../../../components/data-table/table-utils";
import { dashboardColumns } from "./columns";
import type { sectionSchema } from "./schema";

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
  const [activeFilters, setActiveFilters] = React.useState<{
    protocol?: string[];
    httpVersion?: string[];
    format?: string[];
    media?: string[];
    status?: string[];
  }>({
    protocol: ["Https"],
    httpVersion: ["HTTP2"],
    format: ["HTML"],
    media: ["Image"],
    status: ["2xx"],
  });
  const [filtersEnabled, setFiltersEnabled] = React.useState(true);

  const setFilter = React.useCallback((group: keyof typeof activeFilters, values?: string[]) => {
    setActiveFilters((prev) => ({ ...prev, [group]: values }));
    setFiltersEnabled(true);
  }, []);

  const totalSelectedFilters = Object.values(activeFilters).reduce((count, values) => count + (values?.length ?? 0), 0);
  const hasAnyFilters = totalSelectedFilters > 0;

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
          <>
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
          </>
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-col justify-start gap-2">
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
                  checked={filtersEnabled}
                  onCheckedChange={(checked) => setFiltersEnabled(!!checked)}
                  className="-ml-6 -translate-x-1 rounded-full transition-all duration-100 ease-linear data-[state=checked]:ml-0 data-[state=checked]:translate-x-0"
                />
                <FieldTitle>{hasAnyFilters ? "Filtered" : "All"}</FieldTitle>
              </Field>
            </FieldLabel>
            <div className="h-6 w-px bg-border" />
            <DataTableFacetedFilter
              title="Protocol"
              options={[
                { label: "Http", value: "Http" },
                { label: "Https", value: "Https" },
                { label: "Websocket", value: "Websocket" },
              ]}
              values={activeFilters.protocol}
              onChange={(value) => setFilter("protocol", value)}
            />
            <DataTableFacetedFilter
              title="HTTP Version"
              options={[
                { label: "HTTP1", value: "HTTP1" },
                { label: "HTTP2", value: "HTTP2" },
              ]}
              values={activeFilters.httpVersion}
              onChange={(value) => setFilter("httpVersion", value)}
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
              ]}
              values={activeFilters.format}
              onChange={(value) => setFilter("format", value)}
            />
            <DataTableFacetedFilter
              title="Media"
              options={[
                { label: "Image", value: "Image" },
                { label: "Media", value: "Media" },
                { label: "Binary", value: "Binary" },
              ]}
              values={activeFilters.media}
              onChange={(value) => setFilter("media", value)}
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
              values={activeFilters.status}
              onChange={(value) => setFilter("status", value)}
            />
            {hasAnyFilters ? (
              <button
                type="button"
                onClick={() => {
                  setActiveFilters({});
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
          className={tab.value === "outline" ? "relative flex flex-col gap-4 overflow-auto" : "flex flex-col"}
        >
          {renderTabContent(tab.value)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
