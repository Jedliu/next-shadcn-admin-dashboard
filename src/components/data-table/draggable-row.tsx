"use no memo";

import * as React from "react";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, type Row } from "@tanstack/react-table";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type DraggableRowProps = React.ComponentPropsWithoutRef<"tr"> & {
  row: Row<any>;
};

export const DraggableRow = React.forwardRef<HTMLTableRowElement, DraggableRowProps>(function DraggableRowInner(
  { row, className, style, ...rest },
  forwardedRef,
) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: (row.original as { id: UniqueIdentifier }).id,
  });

  const setRefs = React.useCallback(
    (node: HTMLTableRowElement | null) => {
      setNodeRef(node);
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, setNodeRef],
  );

  return (
    <TableRow
      {...rest}
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setRefs}
      className={cn("relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80", className)}
      style={{
        ...style,
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
});
