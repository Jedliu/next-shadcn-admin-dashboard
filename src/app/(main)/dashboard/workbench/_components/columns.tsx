import type { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, EllipsisVertical, Loader, Lock } from "lucide-react";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "../../../../../components/data-table/data-table-column-header";
import type { sectionSchema } from "./schema";
import { TableCellViewer } from "./table-cell-viewer";

function formatMs(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  if (value < 1000) return `${value} ms`;
  return `${(value / 1000).toFixed(2)} s`;
}

function formatBytes(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  const units = ["B", "KB", "MB", "GB"] as const;
  let v = value;
  let idx = 0;
  while (v >= 1024 && idx < units.length - 1) {
    v /= 1024;
    idx += 1;
  }
  const digits = idx === 0 ? 0 : idx === 1 ? 0 : 1;
  return `${v.toFixed(digits)} ${units[idx]}`;
}

export const dashboardColumns: ColumnDef<z.infer<typeof sectionSchema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 48,
    minSize: 48,
    maxSize: 48,
  },
  {
    accessorKey: "ssl",
    header: ({ column }) => <DataTableColumnHeader column={column} title="SSL" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.ssl ? <Lock className="size-4 text-muted-foreground" /> : null}
      </div>
    ),
    size: 56,
    minSize: 56,
    meta: { label: "SSL", order: 1 },
  },
  {
    id: "statusIcon",
    accessorFn: (row) => row.status,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status Icon" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.status === "Done" ? (
          <CircleCheck className="size-4 fill-green-500 stroke-border dark:fill-green-400" />
        ) : (
          <Loader className="size-4 text-muted-foreground" />
        )}
      </div>
    ),
    size: 84,
    minSize: 84,
    meta: { label: "Status Icon", order: 2 },
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{row.original.id}</span>,
    size: 80,
    minSize: 72,
    meta: { label: "ID", order: 3 },
  },
  {
    accessorKey: "url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="URL" />,
    cell: ({ row }) => {
      const label = row.original.url ?? row.original.target ?? "";
      return <TableCellViewer item={row.original} label={label} />;
    },
    size: 420,
    minSize: 160,
    meta: { label: "URL", order: 4 },
  },
  {
    accessorKey: "host",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Host" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.host ?? ""}</span>,
    size: 220,
    minSize: 140,
    meta: { label: "Host", parent: "url", order: 1 },
  },
  {
    accessorKey: "path",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Path" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.path ?? ""}</span>,
    size: 220,
    minSize: 140,
    meta: { label: "Path", parent: "url", order: 2 },
  },
  {
    accessorKey: "query",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Query" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.query ?? ""}</span>,
    size: 220,
    minSize: 140,
    meta: { label: "Query", parent: "url", order: 3 },
  },
  {
    accessorKey: "client",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
    cell: ({ row }) => <span className="min-w-0 truncate">{row.original.client ?? ""}</span>,
    size: 180,
    minSize: 140,
    meta: { label: "Client", order: 5 },
  },
  {
    accessorKey: "method",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Method" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 font-mono text-muted-foreground text-xs">
        {row.original.method ?? ""}
      </Badge>
    ),
    size: 120,
    minSize: 110,
    meta: { label: "Method", order: 6 },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.status === "Done" ? (
          <CircleCheck className="fill-green-500 stroke-border dark:fill-green-400" />
        ) : (
          <Loader />
        )}
        {row.original.status}
      </Badge>
    ),
    size: 150,
    minSize: 140,
    meta: { label: "Status", order: 7 },
  },
  {
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 font-mono text-muted-foreground text-xs">
        {(row.original.code ?? 0).toString()}
      </Badge>
    ),
    size: 110,
    minSize: 96,
    meta: { label: "Code", order: 8 },
  },
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{row.original.date ?? ""}</span>,
    size: 130,
    minSize: 120,
    meta: { label: "Date", parent: "code", order: 1 },
  },
  {
    accessorKey: "time",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
    cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{row.original.time ?? ""}</span>,
    size: 120,
    minSize: 110,
    meta: { label: "Time", order: 9 },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{formatMs(row.original.duration)}</span>,
    size: 140,
    minSize: 120,
    meta: { label: "Duration", order: 10 },
  },
  {
    accessorKey: "timeComplete",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Time Complete" />,
    cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{formatMs(row.original.timeComplete)}</span>,
    size: 160,
    minSize: 140,
    meta: { label: "Time Complete", parent: "duration", order: 1 },
  },
  {
    accessorKey: "requestTotalTime",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Request Total Time" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs tabular-nums">{formatMs(row.original.requestTotalTime)}</span>
    ),
    size: 190,
    minSize: 160,
    meta: { label: "Request Total Time", parent: "duration", order: 2 },
  },
  {
    accessorKey: "responseTotalTime",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Response Total Time" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs tabular-nums">{formatMs(row.original.responseTotalTime)}</span>
    ),
    size: 200,
    minSize: 170,
    meta: { label: "Response Total Time", parent: "duration", order: 3 },
  },
  {
    accessorKey: "latency",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Latency" />,
    cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{formatMs(row.original.latency)}</span>,
    size: 140,
    minSize: 120,
    meta: { label: "Latency", parent: "duration", order: 4 },
  },
  {
    accessorKey: "requestBodySize",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Request Body Size" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs tabular-nums">{formatBytes(row.original.requestBodySize)}</span>
    ),
    size: 190,
    minSize: 160,
    meta: { label: "Request Body Size", order: 11 },
  },
  {
    accessorKey: "responseBodySize",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Response Body Size" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs tabular-nums">{formatBytes(row.original.responseBodySize)}</span>
    ),
    size: 200,
    minSize: 170,
    meta: { label: "Response Body Size", order: 12 },
  },
  {
    accessorKey: "serverIpAddress",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Server IP Address" />,
    cell: ({ row }) => <span className="font-mono text-xs tabular-nums">{row.original.serverIpAddress ?? ""}</span>,
    size: 200,
    minSize: 170,
    meta: { label: "Server IP Address", parent: "responseBodySize", order: 1 },
  },
  {
    accessorKey: "edited",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Edited" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.edited ? <CircleCheck className="size-4 text-muted-foreground" /> : null}
      </div>
    ),
    size: 110,
    minSize: 96,
    meta: { label: "Edited", order: 13 },
  },
  {
    accessorKey: "comment",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Comment" />,
    cell: ({ row }) => (
      <span className="min-w-0 truncate text-muted-foreground text-sm">{row.original.comment ?? ""}</span>
    ),
    size: 220,
    minSize: 160,
    meta: { label: "Comment", order: 14 },
  },
  {
    id: "actions",
    header: () => <div className="w-8" />,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex size-8 text-muted-foreground data-[state=open]:bg-muted" size="icon">
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableResizing: false,
    size: 56,
    minSize: 56,
    maxSize: 56,
  },
];
