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

  return (
    <div className={cn("-mx-2 flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-accent", className)}>
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {getSortIcon(column.getIsSorted())}
    </div>
  );
}
