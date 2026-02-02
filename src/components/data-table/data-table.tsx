"use no memo";

import * as React from "react";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { type ColumnDef, flexRender, type Table as TanStackTable } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DraggableRow } from "./draggable-row";

interface DataTableProps<TData, TValue> {
  table: TanStackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  dndEnabled?: boolean;
  onReorder?: (newData: TData[]) => void;
  className?: string;
  minRowCount?: number;
}

function renderTableBody<TData, TValue>({
  table,
  columns,
  dndEnabled,
  dataIds,
}: {
  table: TanStackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  dndEnabled: boolean;
  dataIds: UniqueIdentifier[];
}) {
  if (!table.getRowModel().rows.length) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No results.
        </TableCell>
      </TableRow>
    );
  }
  if (dndEnabled) {
    return (
      <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
        {table.getRowModel().rows.map((row) => (
          <DraggableRow key={row.id} row={row} />
        ))}
      </SortableContext>
    );
  }
  return table.getRowModel().rows.map((row) => (
    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function DataTable<TData, TValue>({
  table,
  columns,
  dndEnabled = false,
  onReorder,
  className,
  minRowCount,
}: DataTableProps<TData, TValue>) {
  const dataIds: UniqueIdentifier[] = table.getRowModel().rows.map((row) => Number(row.id) as UniqueIdentifier);
  const sortableId = React.useId();
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const rowCount = table.getRowModel().rows.length;
  const fillerRows = minRowCount && rowCount > 0 ? Math.max(0, minRowCount - rowCount) : 0;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id && onReorder) {
      const oldIndex = dataIds.indexOf(active.id);
      const newIndex = dataIds.indexOf(over.id);

      // Call parent with new data order (parent manages state)
      const newData = arrayMove(table.options.data, oldIndex, newIndex);
      onReorder(newData);
    }
  }

  const tableContent = (
    <Table className={cn("table-fixed", className)} style={{ width: table.getTotalSize() }}>
      <TableHeader className="sticky top-0 z-10 bg-muted">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort() && !header.isPlaceholder;
              const handleSort = () => {
                if (!canSort) return;

                const currentSort = header.column.getIsSorted();
                if (currentSort === false) {
                  // Unsorted -> asc
                  header.column.toggleSorting(false);
                } else if (currentSort === "asc") {
                  // asc -> desc
                  header.column.toggleSorting(true);
                } else {
                  // desc -> unsorted
                  header.column.clearSorting();
                }
              };

              return (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className={cn("group", canSort && "cursor-pointer select-none")}
                  onClick={canSort ? handleSort : undefined}
                  style={{
                    width: header.getSize(),
                    position: "relative",
                  }}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={(event) => {
                        event.stopPropagation();
                        header.getResizeHandler()(event);
                      }}
                      onTouchStart={(event) => {
                        event.stopPropagation();
                        header.getResizeHandler()(event);
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="hover:!w-1 hover:!bg-primary absolute top-0 right-0 z-20 h-full w-px cursor-col-resize touch-none select-none bg-border opacity-0 group-hover:opacity-100"
                      style={{
                        transform: header.column.getIsResizing() ? "translateX(0)" : "",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="**:data-[slot=table-cell]:first:w-8">
        {renderTableBody({ table, columns, dndEnabled, dataIds })}
        {fillerRows > 0
          ? Array.from({ length: fillerRows }).map((_, rowIndex) => (
              <TableRow key={`filler-${rowIndex}`} aria-hidden="true" className="hover:bg-transparent">
                {Array.from({ length: visibleColumnCount }).map((__, cellIndex) => (
                  <TableCell key={`filler-${rowIndex}-${cellIndex}`} className="py-3">
                    <div className="h-3 w-full max-w-[120px] rounded bg-muted/40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : null}
      </TableBody>
    </Table>
  );

  if (dndEnabled) {
    return (
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        id={sortableId}
      >
        {tableContent}
      </DndContext>
    );
  }

  return tableContent;
}
