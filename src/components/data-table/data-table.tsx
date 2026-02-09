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
import { type ColumnDef, flexRender, type Row, type Table as TanStackTable } from "@tanstack/react-table";

import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DraggableRow } from "./draggable-row";

type DataTableRowContextMenu<TData> = (props: {
  row: Row<TData>;
  table: TanStackTable<TData>;
  selectedRows: Row<TData>[];
}) => React.ReactNode;

interface DataTableProps<TData, TValue> {
  table: TanStackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  dndEnabled?: boolean;
  onReorder?: (newData: TData[]) => void;
  density?: "compact" | "normal" | "comfortable";
  className?: string;
  rowContextMenu?: DataTableRowContextMenu<TData>;
  enableKeyboardSelection?: boolean;
  fillEmptyRows?: boolean;
  onRowDoubleClick?: (
    row: Row<TData>,
    table: TanStackTable<TData>,
    event: React.MouseEvent<HTMLTableRowElement>,
  ) => void;
}

export function DataTable<TData, TValue>({
  table,
  columns,
  dndEnabled = false,
  onReorder,
  density = "normal",
  className,
  rowContextMenu,
  enableKeyboardSelection = false,
  fillEmptyRows = false,
  onRowDoubleClick,
}: DataTableProps<TData, TValue>) {
  const densityClass =
    density === "compact"
      ? "[&_[data-slot=table-cell]]:py-1 [&_[data-slot=table-head]]:h-8"
      : density === "comfortable"
        ? "[&_[data-slot=table-cell]]:py-3 [&_[data-slot=table-head]]:h-12"
        : "[&_[data-slot=table-cell]]:py-2 [&_[data-slot=table-head]]:h-10";
  const headerBandClass = density === "compact" ? "h-8" : density === "comfortable" ? "h-12" : "h-10";
  const dataIds: UniqueIdentifier[] = table
    .getRowModel()
    .rows.map((row) => (row.original as { id: UniqueIdentifier }).id);
  const sortableId = React.useId();
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));
  const lastSelectedIdRef = React.useRef<string | null>(null);
  const dragSelectingRef = React.useRef(false);
  const dragAnchorIdRef = React.useRef<string | null>(null);
  const dragCurrentIdRef = React.useRef<string | null>(null);
  const resizingRef = React.useRef(false);
  const lastResizeAtRef = React.useRef(0);
  const keyboardActiveRef = React.useRef(false);
  const keyboardRootRef = React.useRef<HTMLDivElement | null>(null);
  const keyboardFocusRef = React.useRef<HTMLButtonElement | null>(null);
  const [maxFillRows, setMaxFillRows] = React.useState(0);
  const lastRowsFitRef = React.useRef(0);
  const resizeRafRef = React.useRef<number | null>(null);

  const stopDragSelection = React.useCallback(() => {
    dragSelectingRef.current = false;
    dragAnchorIdRef.current = null;
    dragCurrentIdRef.current = null;
  }, []);

  React.useEffect(() => {
    const handlePointerUp = () => {
      if (resizingRef.current) {
        lastResizeAtRef.current = Date.now();
      }
      stopDragSelection();
      resizingRef.current = false;
    };
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [stopDragSelection]);

  const isEventFromInteractiveElement = React.useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest(
        "button,a,input,textarea,select,option,[role='button'],[role='checkbox'],[role='menuitem'],[data-row-select-ignore]",
      ),
    );
  }, []);

  const isEventFromTextInput = React.useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest("input,textarea,[contenteditable='true']"));
  }, []);

  const isEditableTarget = React.useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest("input,textarea,[contenteditable='true'],[role='textbox'],[role='searchbox']"));
  }, []);

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

  const handleKeyboardSelection = React.useCallback(
    (event: KeyboardEvent) => {
      if (!enableKeyboardSelection) return;
      if (!keyboardActiveRef.current) return;

      const isSelectAllShortcut = (event.key === "a" || event.key === "A") && (event.metaKey || event.ctrlKey);
      const isEscape = event.key === "Escape" || event.key === "Esc";
      if (!isSelectAllShortcut && !isEscape) return;
      if (isEditableTarget(event.target)) return;

      if (isSelectAllShortcut) {
        event.preventDefault();
        table.toggleAllPageRowsSelected(true);
        return;
      }

      if (isEscape) {
        if (table.getSelectedRowModel().rows.length === 0) return;
        event.preventDefault();
        table.resetRowSelection();
      }
    },
    [enableKeyboardSelection, isEditableTarget, table],
  );

  React.useEffect(() => {
    if (!enableKeyboardSelection) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!keyboardRootRef.current) return;
      if (!(event.target instanceof Node)) return;
      const isInside = keyboardRootRef.current.contains(event.target);
      keyboardActiveRef.current = isInside;
      if (isInside && !isEventFromInteractiveElement(event.target)) {
        keyboardFocusRef.current?.focus({ preventScroll: true });
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!keyboardRootRef.current) return;
      if (!(event.target instanceof Node)) return;
      keyboardActiveRef.current = keyboardRootRef.current.contains(event.target);
    };

    window.addEventListener("keydown", handleKeyboardSelection);
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("focusin", handleFocusIn, true);
    return () => {
      window.removeEventListener("keydown", handleKeyboardSelection);
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("focusin", handleFocusIn, true);
    };
  }, [enableKeyboardSelection, handleKeyboardSelection, isEventFromInteractiveElement]);

  const markResizing = React.useCallback((event: React.SyntheticEvent) => {
    event.stopPropagation();
    resizingRef.current = true;
  }, []);

  const selectRange = React.useCallback(
    (anchorId: string, targetId: string) => {
      const rows = table.getRowModel().rows;
      const anchorIndex = rows.findIndex((row) => row.id === anchorId);
      const targetIndex = rows.findIndex((row) => row.id === targetId);
      if (anchorIndex === -1 || targetIndex === -1) {
        table.setRowSelection({ [targetId]: true });
        return;
      }
      const [start, end] = anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];
      const nextSelection: Record<string, boolean> = {};
      for (let i = start; i <= end; i += 1) {
        const row = rows[i];
        if (row?.getCanSelect()) nextSelection[row.id] = true;
      }
      table.setRowSelection(nextSelection);
    },
    [table],
  );

  const handleRowPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLTableRowElement>, row: Row<TData>) => {
      if (event.button !== 0) return;
      if (!row.getCanSelect()) return;
      if (isEventFromInteractiveElement(event.target)) {
        if (event.target instanceof HTMLElement && event.target.closest("[role='checkbox'],input[type='checkbox']")) {
          lastSelectedIdRef.current = row.id;
        }
        return;
      }

      const rowId = row.id;
      if (event.shiftKey) {
        const anchorId = lastSelectedIdRef.current ?? rowId;
        selectRange(anchorId, rowId);
        lastSelectedIdRef.current = rowId;
        stopDragSelection();
        event.preventDefault();
        return;
      }

      if (event.metaKey || event.ctrlKey) {
        table.setRowSelection((prev) => {
          const next = { ...prev };
          if (row.getIsSelected()) {
            delete next[rowId];
          } else {
            next[rowId] = true;
          }
          return next;
        });
        lastSelectedIdRef.current = rowId;
        stopDragSelection();
        event.preventDefault();
        return;
      }

      table.setRowSelection({ [rowId]: true });
      lastSelectedIdRef.current = rowId;
      dragSelectingRef.current = true;
      dragAnchorIdRef.current = rowId;
      dragCurrentIdRef.current = rowId;
      event.preventDefault();
    },
    [isEventFromInteractiveElement, selectRange, stopDragSelection, table],
  );

  const handleRowPointerEnter = React.useCallback(
    (event: React.PointerEvent<HTMLTableRowElement>, row: Row<TData>) => {
      if (!dragSelectingRef.current) return;
      if (!row.getCanSelect()) return;
      if (isEventFromInteractiveElement(event.target)) return;

      const anchorId = dragAnchorIdRef.current;
      if (!anchorId) return;
      if (dragCurrentIdRef.current === row.id) return;
      dragCurrentIdRef.current = row.id;
      selectRange(anchorId, row.id);
    },
    [isEventFromInteractiveElement, selectRange],
  );

  const handleRowContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, row: Row<TData>) => {
      if (!rowContextMenu) return;
      if (!row.getCanSelect()) return;
      if (isEventFromTextInput(event.target)) return;
      stopDragSelection();
      if (!row.getIsSelected()) {
        table.setRowSelection({ [row.id]: true });
      }
      lastSelectedIdRef.current = row.id;
    },
    [isEventFromTextInput, rowContextMenu, stopDragSelection, table],
  );

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const rows = table.getRowModel().rows;
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const emptyRowHeightClass = density === "compact" ? "h-8" : density === "comfortable" ? "h-12" : "h-10";
  const rowHeightPx = density === "compact" ? 32 : density === "comfortable" ? 48 : 40;
  const headerHeightPx = rowHeightPx;
  const emptyRowCount = fillEmptyRows && rows.length > 0 ? Math.max(maxFillRows - rows.length, 0) : 0;

  React.useEffect(() => {
    if (!fillEmptyRows) return;
    const parent = keyboardRootRef.current?.parentElement;
    if (!parent) return;
    const maxRowsCap = 60;

    const computeRows = () => {
      const height = parent.clientHeight;
      const available = Math.max(height - headerHeightPx, 0);
      const rowsFit = Math.min(Math.floor(available / rowHeightPx), maxRowsCap);
      if (rowsFit !== lastRowsFitRef.current) {
        lastRowsFitRef.current = rowsFit;
        setMaxFillRows(rowsFit);
      }
    };

    const scheduleCompute = () => {
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
      }
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;
        computeRows();
      });
    };

    computeRows();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => scheduleCompute());
    observer.observe(parent);
    return () => {
      observer.disconnect();
      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
    };
  }, [fillEmptyRows, headerHeightPx, rowHeightPx]);

  const renderRow = (row: Row<TData>) => {
    const rowProps = {
      onPointerDown: (event: React.PointerEvent<HTMLTableRowElement>) => handleRowPointerDown(event, row),
      onPointerEnter: (event: React.PointerEvent<HTMLTableRowElement>) => handleRowPointerEnter(event, row),
      onContextMenu: rowContextMenu
        ? (event: React.MouseEvent<HTMLTableRowElement>) => handleRowContextMenu(event, row)
        : undefined,
      onDoubleClick: onRowDoubleClick
        ? (event: React.MouseEvent<HTMLTableRowElement>) => {
            if (isEventFromInteractiveElement(event.target)) return;
            onRowDoubleClick(row, table, event);
          }
        : undefined,
      className: cn(row.getCanSelect() && "cursor-pointer"),
    };

    const rowElement = dndEnabled ? (
      <DraggableRow row={row} {...rowProps} />
    ) : (
      <TableRow data-state={row.getIsSelected() && "selected"} {...rowProps}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );

    if (!rowContextMenu) {
      return <React.Fragment key={row.id}>{rowElement}</React.Fragment>;
    }

    const menu = rowContextMenu({ row, table, selectedRows });
    if (!menu) {
      return <React.Fragment key={row.id}>{rowElement}</React.Fragment>;
    }

    return (
      <ContextMenu key={row.id}>
        <ContextMenuTrigger asChild>{rowElement}</ContextMenuTrigger>
        <ContextMenuContent>{menu}</ContextMenuContent>
      </ContextMenu>
    );
  };

  const tableContent = (
    <div ref={keyboardRootRef} className="relative w-full">
      {enableKeyboardSelection ? (
        <button ref={keyboardFocusRef} type="button" tabIndex={-1} aria-label="Table focus" className="sr-only" />
      ) : null}
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-x-0 top-0 z-0 bg-muted", headerBandClass)}
      />
      <table
        className={cn("relative z-10 w-full table-fixed caption-bottom text-sm", densityClass, className)}
        style={{ width: table.getTotalSize() }}
      >
        <TableHeader className="sticky top-0 z-10 border-b bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort() && !header.isPlaceholder;
                const handleSort = () => {
                  if (!canSort) return;
                  if (resizingRef.current || Date.now() - lastResizeAtRef.current < 200) return;

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
                          markResizing(event);
                          header.getResizeHandler()(event);
                        }}
                        onTouchStart={(event) => {
                          markResizing(event);
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
          {!rows.length ? (
            <TableRow>
              <TableCell colSpan={visibleColumnCount} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : dndEnabled ? (
            <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
              {rows.map((row) => renderRow(row))}
              {emptyRowCount > 0
                ? Array.from({ length: emptyRowCount }, (_, index) => (
                    <TableRow key={`empty-${index}`} aria-hidden className="pointer-events-none">
                      <TableCell colSpan={visibleColumnCount} className={emptyRowHeightClass} />
                    </TableRow>
                  ))
                : null}
            </SortableContext>
          ) : (
            <>
              {rows.map((row) => renderRow(row))}
              {emptyRowCount > 0
                ? Array.from({ length: emptyRowCount }, (_, index) => (
                    <TableRow key={`empty-${index}`} aria-hidden className="pointer-events-none">
                      <TableCell colSpan={visibleColumnCount} className={emptyRowHeightClass} />
                    </TableRow>
                  ))
                : null}
            </>
          )}
        </TableBody>
      </table>
    </div>
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
