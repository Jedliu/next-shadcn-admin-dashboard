"use client";
"use no memo";

import * as React from "react";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column, Table as TanStackTable } from "@tanstack/react-table";
import { ArrowDownUp, ArrowLeftRight, ChevronDown, Columns2, GripVertical, ListRestart } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps<TData> {
  table: TanStackTable<TData>;
}

type ColumnTreeMeta = {
  label?: string;
  parent?: string;
  order?: number;
};

function getColumnTreeMeta<TData>(column: Column<TData, unknown>) {
  return (column.columnDef.meta ?? {}) as ColumnTreeMeta;
}

function getColumnLabel<TData>(column: Column<TData, unknown>) {
  const meta = getColumnTreeMeta(column);
  if (meta.label) return meta.label;
  if (typeof column.columnDef.header === "string") return column.columnDef.header;
  return column.id;
}

function ColumnOrderRow({ id, label }: { id: string; label: React.ReactNode }) {
  const { transform, transition, setNodeRef, isDragging, attributes, listeners } = useSortable({ id });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <TableCell className="w-10 p-1">
        <Button
          {...attributes}
          {...listeners}
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:bg-transparent"
        >
          <GripVertical className="size-3 text-muted-foreground" />
          <span className="sr-only">Drag to reorder</span>
        </Button>
      </TableCell>
      <TableCell className="min-w-0">
        <span className="block min-w-0 truncate capitalize">{label}</span>
      </TableCell>
    </TableRow>
  );
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const [orderMenuOpen, setOrderMenuOpen] = React.useState(false);
  const [columnIds, setColumnIds] = React.useState<string[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const columnIdsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    columnIdsRef.current = columnIds;
  }, [columnIds]);

  const getReorderableVisibleColumns = React.useCallback(
    () =>
      table
        .getAllLeafColumns()
        .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide() && column.getIsVisible()),
    [table],
  );

  React.useEffect(() => {
    if (!orderMenuOpen || isDragging) return;
    setColumnIds(getReorderableVisibleColumns().map((c) => c.id));
  }, [orderMenuOpen, isDragging, getReorderableVisibleColumns]);

  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));
  const sortableId = React.useId();

  const handleResetColumns = () => {
    table.resetColumnVisibility();
    table.resetColumnSizing();
    table.resetColumnOrder();
  };

  const handleFitColumns = () => {
    const rows = table.getRowModel().rows;
    const sampleRows = rows.slice(0, 50);
    const nextSizing: Record<string, number> = {};
    const charWidth = 7.6; // approximate width for text-sm font
    const cellPadding = 24; // table cell horizontal padding + icon spacing

    for (const column of table.getAllLeafColumns()) {
      if (!column.getIsVisible() || !column.getCanResize()) continue;
      const headerLabel = getColumnLabel(column);
      let maxLen = typeof headerLabel === "string" ? headerLabel.length : 0;

      for (const row of sampleRows) {
        const value = row.getValue(column.id);
        if (value === null || value === undefined) continue;
        const text = typeof value === "string" ? value : String(value);
        maxLen = Math.max(maxLen, text.length);
      }

      const minSize = column.columnDef.minSize ?? 40;
      const maxSize = column.columnDef.maxSize ?? 800;
      const fallback = column.columnDef.size ?? column.getSize() ?? minSize;

      if (maxLen === 0) {
        nextSizing[column.id] = Math.max(minSize, Math.min(maxSize, fallback));
        continue;
      }

      const estimated = Math.ceil(maxLen * charWidth + cellPadding);
      nextSizing[column.id] = Math.max(minSize, Math.min(maxSize, estimated));
    }

    table.setColumnSizing(nextSizing);
  };

  const applyColumnOrder = React.useCallback(
    (newVisibleColumnIds: string[]) => {
      const visibleIdSet = new Set(newVisibleColumnIds);
      const baseOrder = table.getAllLeafColumns().map((col) => col.id);
      const nextVisible = [...newVisibleColumnIds];

      const nextOrder = baseOrder.map((id) => (visibleIdSet.has(id) ? (nextVisible.shift() as string) : id));
      table.setColumnOrder(nextOrder);
    },
    [table],
  );

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setColumnIds((prev) => {
      const oldIndex = prev.indexOf(activeId);
      const newIndex = prev.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return prev;

      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function handleDragEnd(_event: DragEndEvent) {
    setIsDragging(false);
    // Apply column order after the DnD interaction commits to avoid render-phase updates.
    applyColumnOrder(columnIdsRef.current);
  }

  const canOrderColumns = getReorderableVisibleColumns().length > 1;
  const toggleableColumns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide());

  const toggleNodes = React.useMemo(() => {
    const nodes = toggleableColumns.map((column, index) => {
      const meta = getColumnTreeMeta(column);
      return {
        id: column.id,
        parent: meta.parent,
        order: meta.order ?? 0,
        index,
        label: getColumnLabel(column),
        column,
      };
    });

    const hasExplicitOrder = toggleableColumns.some((col) => typeof getColumnTreeMeta(col).order === "number");
    const byId = new Map(nodes.map((n) => [n.id, n] as const));
    const children = new Map<string, typeof nodes>();
    for (const node of nodes) {
      if (!node.parent) continue;
      if (!byId.has(node.parent)) continue;
      const next = children.get(node.parent) ?? [];
      next.push(node);
      children.set(node.parent, next);
    }

    const roots = nodes.filter((n) => !n.parent || !byId.has(n.parent));

    const sortNodes = (a: (typeof nodes)[number], b: (typeof nodes)[number]) => {
      if (hasExplicitOrder) {
        if (a.order !== b.order) return a.order - b.order;
        return a.index - b.index;
      }
      return a.index - b.index;
    };

    roots.sort(sortNodes);
    for (const list of children.values()) list.sort(sortNodes);

    return { roots, children };
  }, [toggleableColumns]);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setOrderMenuOpen(false);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Columns2 />
          <span className="hidden lg:inline">Customize Columns</span>
          <span className="lg:hidden">Columns</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel>Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(() => {
          const renderNode = (node: (typeof toggleNodes.roots)[number], depth: number) => {
            // Keep the checkmark aligned, but slightly indent the label for child columns.
            // DropdownMenuCheckboxItem already uses `pl-8`, so small increments look better than large jumps.
            const padding = depth <= 0 ? undefined : depth === 1 ? "pl-10" : depth === 2 ? "pl-12" : "pl-14";
            return (
              <React.Fragment key={node.id}>
                <DropdownMenuCheckboxItem
                  className={cn(padding)}
                  checked={node.column.getIsVisible()}
                  onCheckedChange={(value) => node.column.toggleVisibility(!!value)}
                  onSelect={(event) => event.preventDefault()}
                >
                  {node.label}
                </DropdownMenuCheckboxItem>
                {(toggleNodes.children.get(node.id) ?? []).map((child) => renderNode(child, depth + 1))}
              </React.Fragment>
            );
          };

          return toggleNodes.roots.map((node) => renderNode(node, 0));
        })()}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            handleFitColumns();
          }}
        >
          <ArrowLeftRight className="size-4 text-muted-foreground" />
          Fit to content
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            handleResetColumns();
          }}
        >
          <ListRestart className="size-4 text-muted-foreground" />
          Reset columns
        </DropdownMenuItem>
        <DropdownMenuSub open={orderMenuOpen} onOpenChange={setOrderMenuOpen}>
          <DropdownMenuSubTrigger disabled={!canOrderColumns}>
            <ArrowDownUp className="size-4 text-muted-foreground" />
            Order columns
          </DropdownMenuSubTrigger>
          <DropdownMenuPrimitive.SubContent
            sideOffset={8}
            className={cn(
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 max-h-[calc(100svh-2rem)] w-52 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[state=open]:animate-in",
            )}
          >
            <div className="border-b px-4 py-3">
              <div className="font-medium text-sm">Drag to order</div>
            </div>
            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto px-4 py-3 text-sm">
              {columnIds.length === 0 ? (
                <div className="text-muted-foreground">No reorderable columns.</div>
              ) : (
                <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragOver={handleDragOver}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  onDragCancel={() => setIsDragging(false)}
                  sensors={sensors}
                  id={sortableId}
                >
                  <Table className="table-fixed">
                    <TableBody className="[&_tr]:border-border">
                      <SortableContext items={columnIds} strategy={verticalListSortingStrategy}>
                        {columnIds.map((id) => (
                          <ColumnOrderRow key={id} id={id} label={id} />
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </DndContext>
              )}
            </div>
          </DropdownMenuPrimitive.SubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
