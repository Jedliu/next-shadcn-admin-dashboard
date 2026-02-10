"use client";

import * as React from "react";

import { Clock, Copy, Database, Hand, Pin, Search, Trash2, Zap } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Checkbox } from "@/components/ui/checkbox";
import { ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { cn } from "@/lib/utils";

import { useQuickCreate } from "./quick-create-provider";

type HistoryKind = "manual" | "auto";

type HistoryItem = {
  id: string;
  kind: HistoryKind;
  title: string;
  timestamp: string; // demo-friendly formatting
  records: number;
};

const seedHistory: HistoryItem[] = [
  {
    id: "auto-20260126-171042",
    kind: "auto",
    title: "Auto save_20260126_171042",
    timestamp: "2026/01/26 17:10:42",
    records: 302,
  },
  {
    id: "manual-20260124-210818-106-copy",
    kind: "manual",
    title: "20260124_210818_106 copy",
    timestamp: "2026/01/24 23:01:19",
    records: 4,
  },
  {
    id: "manual-20260124-210841-263-copy",
    kind: "manual",
    title: "20260124_210841_263 copy",
    timestamp: "2026/01/24 23:01:12",
    records: 4,
  },
  {
    id: "manual-20260124-210841-263",
    kind: "manual",
    title: "20260124_210841_263",
    timestamp: "2026/01/24 21:08:41",
    records: 4,
  },
  {
    id: "manual-20260124-210818-106",
    kind: "manual",
    title: "20260124_210818_106",
    timestamp: "2026/01/24 21:08:18",
    records: 4,
  },
  {
    id: "auto-20260124-194045",
    kind: "auto",
    title: "Auto save_20260124_194045",
    timestamp: "2026/01/24 19:40:45",
    records: 2,
  },
  {
    id: "auto-20260124-095958",
    kind: "auto",
    title: "Auto save_20260124_095958",
    timestamp: "2026/01/24 09:59:58",
    records: 65,
  },
  {
    id: "auto-20260123-143649",
    kind: "auto",
    title: "Auto save_20260123_143649",
    timestamp: "2026/01/23 14:36:49",
    records: 9,
  },
  {
    id: "auto-20260123-085841",
    kind: "auto",
    title: "Auto save_20260123_085841",
    timestamp: "2026/01/23 08:58:41",
    records: 1,
  },
];

function kindIcon(kind: HistoryKind) {
  if (kind === "manual") return <Hand className="size-5 text-blue-600" />;
  return <Zap className="size-5 text-amber-500" />;
}

export function HistoryPanel({ className }: { readonly className?: string }) {
  const { historyFilters, setHistoryFilters, historySearch, setHistorySearch, historyPinnedIds, setHistoryPinnedIds } =
    useQuickCreate();

  const [items] = React.useState<HistoryItem[]>(seedHistory);
  const pinnedSet = React.useMemo(() => new Set(historyPinnedIds), [historyPinnedIds]);
  const pinnedSetRef = React.useRef(pinnedSet);
  pinnedSetRef.current = pinnedSet;
  const searchFilteredItems = React.useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.title.toLowerCase().includes(q) || item.timestamp.toLowerCase().includes(q));
  }, [items, historySearch]);

  const counts = React.useMemo(() => {
    const manual = searchFilteredItems.filter((i) => i.kind === "manual").length;
    const auto = searchFilteredItems.filter((i) => i.kind === "auto").length;
    const pinned = searchFilteredItems.filter((i) => pinnedSet.has(i.id)).length;
    return { manual, auto, pinned };
  }, [pinnedSet, searchFilteredItems]);

  const visibleItems = React.useMemo(() => {
    if (historyFilters.length === 0) return searchFilteredItems;
    return searchFilteredItems.filter((item) => {
      const matchesPinned = historyFilters.includes("pinned") && pinnedSet.has(item.id);
      const matchesKind =
        (historyFilters.includes("auto") && item.kind === "auto") ||
        (historyFilters.includes("manual") && item.kind === "manual");
      return matchesPinned || matchesKind;
    });
  }, [historyFilters, pinnedSet, searchFilteredItems]);

  const togglePinned = React.useCallback(
    (id: string) => {
      setHistoryPinnedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    },
    [setHistoryPinnedIds],
  );

  const columns = React.useMemo<import("@tanstack/react-table").ColumnDef<HistoryItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 40,
        minSize: 40,
        maxSize: 40,
      },
      {
        id: "kind",
        header: () => null,
        cell: ({ row }) => <div className="flex items-center justify-center">{kindIcon(row.original.kind)}</div>,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 40,
        minSize: 40,
        maxSize: 40,
      },
      {
        accessorKey: "title",
        header: () => <span className="text-xs uppercase tracking-wide text-muted-foreground">Title</span>,
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="min-w-0 truncate font-medium text-sm">{row.original.title}</span>
              {pinnedSetRef.current.has(row.original.id) ? <Pin className="size-3 text-primary" /> : null}
            </div>
            <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
              <Clock className="size-3" />
              <span className="font-mono tabular-nums">{row.original.timestamp}</span>
            </div>
          </div>
        ),
        enableSorting: false,
        size: 320,
        minSize: 200,
      },
      {
        accessorKey: "records",
        header: () => <span className="text-xs uppercase tracking-wide text-muted-foreground">Records</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Database className="size-4" />
            <span className="font-mono tabular-nums">{row.original.records}</span>
          </div>
        ),
        enableSorting: false,
        size: 120,
        minSize: 100,
      },
    ],
    [],
  );

  const getRowId = React.useCallback((row: HistoryItem) => row.id, []);

  const table = useDataTableInstance({
    data: visibleItems,
    columns,
    enableRowSelection: true,
    defaultPageSize: Math.max(visibleItems.length, 1),
    getRowId,
  });

  const rowContextMenu = React.useCallback(
    ({ row }: { row: { original: HistoryItem } }) => {
      const isPinned = pinnedSet.has(row.original.id);
      return (
        <>
          <ContextMenuItem
            onSelect={(event) => {
              event.preventDefault();
              togglePinned(row.original.id);
            }}
          >
            <Pin className="size-4 text-muted-foreground" />
            {isPinned ? "Unpin" : "Pin"}
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={(event) => {
              event.preventDefault();
            }}
          >
            <Copy className="size-4 text-muted-foreground" />
            Copy
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </ContextMenuItem>
        </>
      );
    },
    [pinnedSet, togglePinned],
  );

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div className="border-b bg-background/95 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search history..."
              className="h-9 border-0 pl-9 shadow-none focus-visible:ring-0"
            />
          </div>
          <DataTableFacetedFilter
            title="Type"
            options={[
              { label: `Auto saved (${counts.auto})`, value: "auto", icon: Zap },
              { label: `Manual saved (${counts.manual})`, value: "manual", icon: Hand },
              { label: `Pinned (${counts.pinned})`, value: "pinned", icon: Pin },
            ]}
            values={historyFilters}
            onChange={(values) => setHistoryFilters((values ?? []) as Array<"manual" | "auto" | "pinned">)}
            countLabelThreshold={1}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visibleItems.length ? (
          <div className="min-h-0 flex-1">
            <DataTable
              table={table}
              columns={columns}
              density="compact"
              rowContextMenu={rowContextMenu}
              enableKeyboardSelection
              fillEmptyRows
              className="w-full [&_thead_tr]:border-transparent"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <div className="font-medium text-sm">No history found</div>
            <div className="text-muted-foreground text-sm">Try changing the filter or search query.</div>
          </div>
        )}
      </div>
    </div>
  );
}
