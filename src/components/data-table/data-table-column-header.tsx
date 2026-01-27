"use no memo";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

function getSortIcon(sort: "asc" | "desc" | false | undefined) {
  switch (sort) {
    case "desc":
      return <ArrowDown className="size-4" />;
    case "asc":
      return <ArrowUp className="size-4" />;
    default:
      return null;
  }
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("truncate", className)}>{title}</div>;
  }

  const handleSort = () => {
    const currentSort = column.getIsSorted();
    if (currentSort === false) {
      // 当前无排序 → 升序
      column.toggleSorting(false);
    } else if (currentSort === "asc") {
      // 当前升序 → 降序
      column.toggleSorting(true);
    } else {
      // 当前降序 → 无排序
      column.clearSorting();
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "-mx-2 flex cursor-pointer select-none items-center space-x-2 rounded-md px-2 py-1 hover:bg-accent",
        className,
      )}
      onClick={handleSort}
    >
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {getSortIcon(column.getIsSorted())}
    </button>
  );
}
