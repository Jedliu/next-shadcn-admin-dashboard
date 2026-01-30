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
import type { Table as TanStackTable } from "@tanstack/react-table";
import { GripVertical, ListRestart, Settings2, SlidersHorizontal } from "lucide-react";
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

      const next = arrayMove(prev, oldIndex, newIndex);
      applyColumnOrder(next);
      return next;
    });
  }

  function handleDragEnd(_event: DragEndEvent) {
    setIsDragging(false);
  }

  const canOrderColumns = getReorderableVisibleColumns().length > 1;

  return (
    <>
      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) setOrderMenuOpen(false);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <Settings2 />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  onSelect={(event) => event.preventDefault()}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
          <DropdownMenuSeparator />
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
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              Order columns
            </DropdownMenuSubTrigger>
            <DropdownMenuPrimitive.SubContent
              sideOffset={8}
              className={cn(
                "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 w-52 max-h-[calc(100svh-2rem)] overflow-hidden rounded-md border shadow-lg",
              )}
            >
              <div className="border-b px-4 py-3">
                <div className="text-sm font-medium">Drag to order</div>
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
    </>
  );
}
