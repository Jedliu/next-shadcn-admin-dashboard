"use client";
"use no memo";

import * as React from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { CircleCheck, CircleMinus, EllipsisVertical, Plus, Power, Settings2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { cn } from "@/lib/utils";

import { CreatePluginDialog } from "./create-plugin-dialog";

type PluginStatus = "enabled" | "disabled";

type Plugin = {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  priority: number;
  status: PluginStatus;
};

const seedPlugins: Plugin[] = [
  {
    id: "rate_limit",
    name: "rate_limit",
    description: "Request limiting (200 req/s, burst 500)",
    author: "Sysproxy Team",
    version: "v1.0.0",
    priority: 10,
    status: "enabled",
  },
  {
    id: "auth",
    name: "auth",
    description: "Auto inject auth info (Bearer/Basic/ApiKey)",
    author: "Sysproxy Team",
    version: "v1.0.0",
    priority: 20,
    status: "enabled",
  },
  {
    id: "cache",
    name: "cache",
    description: "HTTP response cache (TTL: 60s)",
    author: "Sysproxy Team",
    version: "v1.0.0",
    priority: 30,
    status: "disabled",
  },
  {
    id: "header_modifier",
    name: "header_modifier",
    description: "Auto add, modify, or remove HTTP request headers",
    author: "Sysproxy Team",
    version: "v1.0.0",
    priority: 50,
    status: "enabled",
  },
  {
    id: "mock",
    name: "mock",
    description: "Mock responses for frontend development and testing",
    author: "Sysproxy Team",
    version: "v1.0.0",
    priority: 60,
    status: "enabled",
  },
  {
    id: "cors",
    name: "cors",
    description: "Auto handle CORS preflight requests",
    author: "Sysproxy Team",
    version: "v1.0.0",
    priority: 70,
    status: "enabled",
  },
  {
    id: "script_debug",
    name: "script_debug",
    description: "Live script debug",
    author: "sysproxy",
    version: "v0.1.0",
    priority: 140,
    status: "disabled",
  },
];

function matchesQuery(plugin: Plugin, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    plugin.id.toLowerCase().includes(q) ||
    plugin.name.toLowerCase().includes(q) ||
    plugin.description.toLowerCase().includes(q) ||
    plugin.author.toLowerCase().includes(q)
  );
}

function formatStatus(status: PluginStatus) {
  if (status === "enabled") {
    return (
      <span className="inline-flex items-center gap-2 rounded-md bg-emerald-500/15 px-2 py-1 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
        <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-300" />
        <span className="font-medium text-sm">Enabled</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-destructive/15 px-2 py-1 text-destructive dark:bg-destructive/20">
      <CircleMinus className="size-4 text-destructive" />
      <span className="font-medium text-sm">Disabled</span>
    </span>
  );
}

export function PluginsPanel() {
  const [plugins, setPlugins] = React.useState<Plugin[]>(seedPlugins);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | PluginStatus>("all");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);

  const [configurePluginId, setConfigurePluginId] = React.useState<string | null>(null);

  const totalCount = plugins.length;
  const enabledCount = plugins.filter((p) => p.status === "enabled").length;
  const disabledCount = totalCount - enabledCount;

  const filteredPlugins = React.useMemo(() => {
    let next = plugins.filter((p) => matchesQuery(p, query));
    if (statusFilter !== "all") next = next.filter((p) => p.status === statusFilter);
    return next;
  }, [plugins, query, statusFilter]);

  const togglePlugin = React.useCallback((id: string) => {
    setPlugins((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextStatus: PluginStatus = p.status === "enabled" ? "disabled" : "enabled";
        toast.message(`${p.name} ${nextStatus === "enabled" ? "enabled" : "disabled"}.`);
        return { ...p, status: nextStatus };
      }),
    );
  }, []);

  const deletePlugin = React.useCallback((id: string) => {
    setPlugins((prev) => {
      const plugin = prev.find((p) => p.id === id);
      if (plugin) toast.success(`Deleted plugin: ${plugin.name}`);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const columns = React.useMemo<ColumnDef<Plugin>[]>(
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
        size: 44,
        minSize: 44,
        maxSize: 44,
      },
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Plugin" />,
        cell: ({ row }) => (
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-mono font-semibold text-sm">{row.original.name}</span>
              <Badge variant="outline" className="font-mono text-muted-foreground">
                {row.original.version}
              </Badge>
            </div>
            <div className="text-muted-foreground text-sm">{row.original.description}</div>
          </div>
        ),
        size: 480,
        minSize: 280,
      },
      {
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
        cell: ({ row }) => (
          <div className="font-mono text-muted-foreground text-sm tabular-nums">{row.original.priority}</div>
        ),
        size: 110,
        minSize: 96,
      },
      {
        accessorKey: "author",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
        cell: ({ row }) => <div className="text-muted-foreground text-sm">{row.original.author}</div>,
        size: 160,
        minSize: 140,
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <div className="text-sm">{formatStatus(row.original.status)}</div>,
        size: 140,
        minSize: 120,
      },
      {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({ row }) => <div className="font-mono text-muted-foreground text-sm">{row.original.id}</div>,
        size: 180,
        minSize: 140,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="size-8">
                    <EllipsisVertical className="size-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setConfigurePluginId(row.original.id);
                    }}
                  >
                    <Settings2 className="size-4 text-muted-foreground" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      togglePlugin(row.original.id);
                    }}
                  >
                    <Power className="size-4 text-muted-foreground" />
                    {status === "enabled" ? "Disable" : "Enable"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => {
                      e.preventDefault();
                      deletePlugin(row.original.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 96,
        minSize: 80,
        maxSize: 120,
      },
    ],
    [deletePlugin, togglePlugin],
  );

  const table = useDataTableInstance({
    data: filteredPlugins,
    columns,
    defaultPageSize: 10,
    getRowId: (row) => row.id,
  });

  const configurePlugin = React.useMemo(
    () => (configurePluginId ? (plugins.find((p) => p.id === configurePluginId) ?? null) : null),
    [plugins, configurePluginId],
  );

  const onImportClick = () => {
    fileInputRef.current?.click();
  };

  const onImportSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success(`Selected plugin file: ${file.name}`);
    e.target.value = "";
  };

  const handleCreatePlugin = (data: { name: string; description: string }) => {
    const name = data.name.trim() || `plugin_${Math.random().toString(16).slice(2, 6)}`;
    const next: Plugin = {
      id: name,
      name,
      description: data.description.trim() || "New plugin",
      author: "You",
      version: "v0.1.0",
      priority: 100,
      status: "disabled",
    };
    setPlugins((prev) => [next, ...prev]);
    toast.success(`Created plugin: ${name}`);
  };

  return (
    <div className="@container/main flex h-full min-h-0 flex-col gap-6">
      {/* ... (keep header and cards) */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl tracking-tight">Plugins</h1>
          <p className="text-muted-foreground text-sm">Manage installed plugins, priorities, and runtime status.</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={onImportSelected} />
          <Button type="button" variant="outline" onClick={onImportClick} className="gap-2">
            <Upload className="size-4" />
            Import plugin
          </Button>
          <Button type="button" onClick={() => setCreateOpen(true)} className="gap-2">
            <span>Create plugin</span>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid @xl/main:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{totalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Enabled</CardDescription>
            <CardTitle className="text-3xl text-emerald-600 tabular-nums">{enabledCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Disabled</CardDescription>
            <CardTitle className="text-3xl text-destructive tabular-nums">{disabledCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex @md/main:flex-row flex-col @md/main:items-center @md/main:justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name or ID..."
              className="h-8 @md/main:w-[280px] w-full"
            />

            <DataTableFacetedFilter
              title="Status"
              options={[
                { label: "Enabled", value: "enabled", icon: CircleCheck },
                { label: "Disabled", value: "disabled", icon: CircleMinus },
              ]}
              values={statusFilter === "all" ? undefined : [statusFilter]}
              onChange={(values) => {
                if (!values || values.length === 0 || values.length > 1) {
                  setStatusFilter("all");
                  return;
                }
                setStatusFilter(values[0] as PluginStatus);
              }}
              listClassName="max-h-56"
            />
          </div>

          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border before:absolute before:top-0 before:right-0 before:left-0 before:z-0 before:box-content before:h-10 before:border-border before:border-b before:bg-muted">
          <DataTable table={table} columns={columns} className="relative z-10 w-auto [&_thead_tr]:border-transparent" />
        </div>

        <DataTablePagination table={table} />
      </div>

      <CreatePluginDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreatePlugin} />

      <Dialog
        open={Boolean(configurePluginId)}
        onOpenChange={(open) => {
          if (!open) setConfigurePluginId(null);
        }}
      >
        {/* ... (keep configure dialog content) */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure plugin</DialogTitle>
            <DialogDescription>Demo configuration panel. Settings are not persisted yet.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-muted-foreground">
                {configurePlugin?.version ?? "v0.0.0"}
              </Badge>
              <Badge variant="secondary" className="text-muted-foreground">
                Status:{" "}
                <span
                  className={cn(
                    "ml-1 font-medium",
                    configurePlugin?.status === "enabled" ? "text-emerald-600" : "text-muted-foreground",
                  )}
                >
                  {configurePlugin?.status ?? "disabled"}
                </span>
              </Badge>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plugin-priority">Priority</Label>
              <Input
                id="plugin-priority"
                type="number"
                min={0}
                max={999}
                defaultValue={configurePlugin?.priority ?? 100}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plugin-notes">Notes</Label>
              <Input id="plugin-notes" placeholder="Optional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setConfigurePluginId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (configurePlugin) toast.success(`Saved configuration for ${configurePlugin.name}.`);
                setConfigurePluginId(null);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
