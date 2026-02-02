"use client";

import * as React from "react";

import { Download, FileText, RefreshCw, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
};

type LogFile = {
  id: string;
  name: string;
  updatedAt: string;
  size: string;
  entries: LogEntry[];
};

const seedLogs: LogFile[] = [
  {
    id: "proxy-2026-02-02",
    name: "proxy_2026-02-02.log",
    updatedAt: "2026/02/02 14:12:21",
    size: "8.4 MB",
    entries: [
      {
        id: "1",
        timestamp: "14:12:21.102",
        level: "info",
        source: "proxy",
        message: "Proxy listening on 127.0.0.1:8899",
      },
      {
        id: "2",
        timestamp: "14:12:28.550",
        level: "debug",
        source: "tls",
        message: "TLS handshake completed for api.example.com",
      },
      {
        id: "3",
        timestamp: "14:13:01.840",
        level: "warn",
        source: "resolver",
        message: "Fallback to secondary DNS for auth.service.local",
      },
      {
        id: "4",
        timestamp: "14:13:05.220",
        level: "error",
        source: "router",
        message: "Upstream timeout after 15000ms (requestId=req_9m31)",
      },
      {
        id: "5",
        timestamp: "14:13:18.744",
        level: "info",
        source: "proxy",
        message: "Captured 18 requests in the last minute",
      },
    ],
  },
  {
    id: "core-2026-02-01",
    name: "core_2026-02-01.log",
    updatedAt: "2026/02/01 23:49:10",
    size: "12.1 MB",
    entries: [
      {
        id: "6",
        timestamp: "23:45:01.928",
        level: "info",
        source: "core",
        message: "Daily cleanup task finished (14.2k rows)",
      },
      {
        id: "7",
        timestamp: "23:46:54.412",
        level: "debug",
        source: "scheduler",
        message: "Queue depth check: 0 pending jobs",
      },
      {
        id: "8",
        timestamp: "23:48:37.114",
        level: "warn",
        source: "core",
        message: "Process filters rule #42 returned empty dataset",
      },
      {
        id: "9",
        timestamp: "23:49:10.771",
        level: "error",
        source: "core",
        message: "Failed to persist rule snapshot (disk busy)",
      },
    ],
  },
  {
    id: "auth-2026-02-01",
    name: "auth_2026-02-01.log",
    updatedAt: "2026/02/01 18:22:43",
    size: "4.2 MB",
    entries: [
      {
        id: "10",
        timestamp: "18:20:05.008",
        level: "info",
        source: "auth",
        message: "OAuth token refreshed for admin@studio.dev",
      },
      {
        id: "11",
        timestamp: "18:21:19.665",
        level: "error",
        source: "auth",
        message: "Login attempt blocked after 5 failed retries",
      },
      {
        id: "12",
        timestamp: "18:22:43.201",
        level: "info",
        source: "auth",
        message: "SAML session rotated for org:studio",
      },
    ],
  },
];

const levelMeta: Record<LogLevel, { label: string; badgeClass: string; dotClass: string }> = {
  debug: {
    label: "Debug",
    badgeClass: "bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground/60",
  },
  info: {
    label: "Info",
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
    dotClass: "bg-blue-500",
  },
  warn: {
    label: "Warn",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    dotClass: "bg-amber-500",
  },
  error: {
    label: "Error",
    badgeClass: "bg-destructive/15 text-destructive",
    dotClass: "bg-destructive",
  },
};

export function LogsPanel() {
  const [files] = React.useState<LogFile[]>(seedLogs);
  const [activeFileId, setActiveFileId] = React.useState(files[0]?.id ?? "");
  const [fileQuery, setFileQuery] = React.useState("");
  const [entryQuery, setEntryQuery] = React.useState("");
  const [levelFilter, setLevelFilter] = React.useState<LogLevel[]>(["debug", "info", "warn", "error"]);

  const activeFile = React.useMemo(
    () => files.find((file) => file.id === activeFileId) ?? files[0],
    [activeFileId, files],
  );

  const visibleFiles = React.useMemo(() => {
    const q = fileQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(q) ||
        file.updatedAt.toLowerCase().includes(q) ||
        file.size.toLowerCase().includes(q),
    );
  }, [files, fileQuery]);

  const filteredEntries = React.useMemo(() => {
    if (!activeFile) return [];
    const q = entryQuery.trim().toLowerCase();
    return activeFile.entries.filter((entry) => {
      const matchLevel = levelFilter.length === 0 || levelFilter.includes(entry.level);
      if (!matchLevel) return false;
      if (!q) return true;
      return (
        entry.message.toLowerCase().includes(q) ||
        entry.source.toLowerCase().includes(q) ||
        entry.timestamp.toLowerCase().includes(q)
      );
    });
  }, [activeFile, entryQuery, levelFilter]);

  return (
    <div className="@container/main flex min-h-0 flex-1 flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl tracking-tight">Logs</h1>
        <p className="text-muted-foreground text-sm">Browse runtime logs and filter important events.</p>
      </div>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-background">
          <div className="border-b bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
                <Input
                  value={fileQuery}
                  onChange={(e) => setFileQuery(e.target.value)}
                  placeholder="Search log files..."
                  className="h-9 pl-9"
                />
              </div>
              <Button type="button" variant="outline" size="icon" className="h-9 w-9">
                <RefreshCw className="size-4" />
                <span className="sr-only">Refresh logs</span>
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            {visibleFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                <div className="font-medium text-sm">No log files</div>
                <div className="text-muted-foreground text-sm">Try adjusting your search.</div>
              </div>
            ) : (
              <div className="flex flex-col">
                {visibleFiles.map((file) => {
                  const selected = file.id === activeFile?.id;
                  return (
                    <div
                      key={file.id}
                      className={cn(
                        "group flex w-full items-start gap-3 border-b px-3 py-3 text-left text-sm transition-colors hover:bg-muted/30",
                        selected && "bg-muted/40",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFileId(file.id)}
                        className="flex min-w-0 flex-1 items-start gap-3 text-left"
                      >
                        <div className="mt-0.5">
                          <FileText className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="min-w-0 truncate font-medium">{file.name}</div>
                          <div className="mt-1 flex flex-col gap-0.5 text-muted-foreground text-xs">
                            <span className="font-mono tabular-nums">{file.updatedAt}</span>
                            <span className="font-medium">{file.size}</span>
                          </div>
                        </div>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete log</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          <div className="border-t bg-background p-3">
            <Button type="button" variant="outline" className="w-full">
              Open Logs Folder
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-background">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <h2 className="min-w-0 truncate font-semibold text-sm">{activeFile?.name ?? "No file selected"}</h2>
                {activeFile ? <Badge variant="secondary">{activeFile.entries.length} entries</Badge> : null}
              </div>
              <p className="mt-1 text-muted-foreground text-xs">
                {activeFile ? `${activeFile.updatedAt} · ${activeFile.size}` : "Select a file to view details."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <RefreshCw className="size-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Download className="size-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-b bg-background px-4 py-3">
            <div className="relative flex min-w-[220px] flex-1">
              <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                value={entryQuery}
                onChange={(e) => setEntryQuery(e.target.value)}
                placeholder="Filter logs..."
                className="h-9 pl-9"
              />
            </div>
            <ToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              value={levelFilter}
              onValueChange={(values) => setLevelFilter(values as LogLevel[])}
              spacing={0}
            >
              {(["debug", "info", "warn", "error"] as LogLevel[]).map((level) => (
                <ToggleGroupItem key={level} value={level} className="gap-2">
                  <span className={cn("h-2 w-2 rounded-full", levelMeta[level].dotClass)} />
                  {levelMeta[level].label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                <div className="font-medium text-sm">No log entries</div>
                <div className="text-muted-foreground text-sm">Try a different filter or search.</div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                    <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", levelMeta[entry.level].dotClass)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{entry.timestamp}</span>
                        <Badge className={cn("h-5 px-2 text-[10px] font-medium", levelMeta[entry.level].badgeClass)}>
                          {levelMeta[entry.level].label}
                        </Badge>
                        <span className="text-muted-foreground text-xs">{entry.source}</span>
                      </div>
                      <p className="mt-1 text-sm">{entry.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
