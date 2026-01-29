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

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const [orderDrawerOpen, setOrderDrawerOpen] = React.useState(false);
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
    if (!orderDrawerOpen || isDragging) return;
    setColumnIds(getReorderableVisibleColumns().map((c) => c.id));
  }, [orderDrawerOpen, isDragging, getReorderableVisibleColumns]);

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <Settings2 />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
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
          <DropdownMenuItem
            disabled={!canOrderColumns}
            onSelect={() => {
              setOrderDrawerOpen(true);
            }}
          >
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            Order columns
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Drawer open={orderDrawerOpen} onOpenChange={setOrderDrawerOpen} direction={isMobile ? "bottom" : "right"}>
        <DrawerContent
          sideWidth="20rem"
          sideMaxWidth="20rem"
          // This drawer is intentionally shorter and vertically centered (desktop) to avoid a large empty area.
          sideOffsetY="clamp(1rem, 3svh, 3rem)"
          className={cn(
            isMobile
              ? "max-h-[80vh]"
              : "overflow-hidden data-[vaul-drawer-direction=right]:my-auto data-[vaul-drawer-direction=right]:h-fit data-[vaul-drawer-direction=right]:max-h-[calc(100svh-var(--drawer-side-offset-y)-var(--drawer-side-offset-y))]",
          )}
        >
          <DrawerHeader className="gap-1">
            <DrawerTitle>Order columns</DrawerTitle>
            <DrawerDescription>Drag to reorder visible columns.</DrawerDescription>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4 text-sm">
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
        </DrawerContent>
      </Drawer>
    </>
  );
}
