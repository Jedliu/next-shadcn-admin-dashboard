"use client";

import * as React from "react";

import { Clock, Copy, Database, Hand, OctagonAlert, Pin, Search, Trash2, X, Zap } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut } from "@/components/ui/context-menu";
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
  if (kind === "manual") return <Hand className="size-4 text-blue-600" />;
  return <Zap className="size-4 text-amber-500" />;
}

export function HistoryPanel({ className }: { readonly className?: string }) {
  const { historyFilters, setHistoryFilters, historySearch, setHistorySearch, historyPinnedIds, setHistoryPinnedIds } =
    useQuickCreate();

  const [items, setItems] = React.useState<HistoryItem[]>(seedHistory);
  const [deleteTargets, setDeleteTargets] = React.useState<HistoryItem[]>([]);
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
    (ids: string[]) => {
      setHistoryPinnedIds((prev) => {
        const prevSet = new Set(prev);
        const pinnedCount = ids.filter((id) => prevSet.has(id)).length;
        const shouldUnpin = pinnedCount > ids.length / 2;
        if (shouldUnpin) {
          return prev.filter((id) => !ids.includes(id));
        }
        const newIds = ids.filter((id) => !prevSet.has(id));
        return [...prev, ...newIds];
      });
    },
    [setHistoryPinnedIds],
  );

  const handleClone = React.useCallback((targets: HistoryItem[]) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const clones = targets.map((item) => ({
      ...item,
      id: `${item.id}-clone-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: `${item.title} copy`,
      timestamp,
      kind: "manual" as HistoryKind,
    }));
    setItems((prev) => [...clones, ...prev]);
  }, []);

  const handleDelete = React.useCallback((targets: HistoryItem[]) => {
    setDeleteTargets(targets);
  }, []);

  const confirmDelete = React.useCallback(() => {
    if (deleteTargets.length === 0) return;
    const idsToDelete = new Set(deleteTargets.map((t) => t.id));
    setItems((prev) => prev.filter((item) => !idsToDelete.has(item.id)));
    setHistoryPinnedIds((prev) => prev.filter((id) => !idsToDelete.has(id)));
    setDeleteTargets([]);
  }, [deleteTargets, setHistoryPinnedIds]);

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
        size: 235,
        minSize: 150,
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

  // Handle Backspace key to delete selected rows
  const tableRef = React.useRef<HTMLDivElement>(null);
  const tableActiveRef = React.useRef(false);

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!tableRef.current) return;
      if (!(event.target instanceof Node)) return;
      tableActiveRef.current = tableRef.current.contains(event.target);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest("input,textarea,[contenteditable='true']")) return;
      if (!tableActiveRef.current) return;

      if (event.key === "Escape") {
        // If context menu is open, let it close first
        if (document.querySelector("[data-radix-menu-content]")) return;
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) return;
        event.preventDefault();
        table.resetRowSelection();
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) return;
        event.preventDefault();
        handleDelete(selectedRows.map((r) => r.original));
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [table, handleDelete]);

  const rowContextMenu = React.useCallback(
    ({ row, selectedRows }: { row: { original: HistoryItem }; selectedRows: { original: HistoryItem }[] }) => {
      const targets = selectedRows.length > 1 ? selectedRows.map((r) => r.original) : [row.original];
      const targetIds = targets.map((t) => t.id);
      const pinnedCount = targets.filter((t) => pinnedSet.has(t.id)).length;
      const shouldUnpin = pinnedCount > targets.length / 2;
      return (
        <>
          <ContextMenuItem onSelect={() => togglePinned(targetIds)}>
            <Pin className="size-4 text-muted-foreground" />
            {shouldUnpin ? "Unpin" : "Pin"}
            {targets.length > 1 ? ` (${targets.length})` : ""}
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => handleClone(targets)}>
            <Copy className="size-4 text-muted-foreground" />
            Clone{targets.length > 1 ? ` (${targets.length})` : ""}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => table.resetRowSelection()}>
            <X className="size-4 text-muted-foreground" />
            Clear selection
            <ContextMenuShortcut>Esc</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem variant="destructive" onSelect={() => handleDelete(targets)}>
            <Trash2 className="size-4" />
            Delete{targets.length > 1 ? ` (${targets.length})` : ""}
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </>
      );
    },
    [pinnedSet, togglePinned, handleClone, handleDelete, table],
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

      <div ref={tableRef} className="min-h-0 flex-1 overflow-y-auto">
        {visibleItems.length ? (
          <DataTable
            table={table}
            columns={columns}
            density="compact"
            rowContextMenu={rowContextMenu}
            enableKeyboardSelection
            fillEmptyRows
            className="w-full [&_thead_tr]:border-transparent"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <div className="font-medium text-sm">No history found</div>
            <div className="text-muted-foreground text-sm">Try changing the filter or search query.</div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteTargets.length > 0} onOpenChange={(open) => !open && setDeleteTargets([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <OctagonAlert className="h-5 w-5 text-destructive" />
              </div>
              {deleteTargets.length > 1 ? "Delete history items?" : "Delete history item?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">
              This action cannot be undone.{" "}
              {deleteTargets.length > 1
                ? `This will permanently delete ${deleteTargets.length} records.`
                : `This will permanently delete "${deleteTargets[0]?.title}".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
