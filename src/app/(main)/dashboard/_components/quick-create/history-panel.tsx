"use client";

import * as React from "react";

import { Clock, Copy, Database, Hand, Pencil, Search, Trash2, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { useQuickCreate } from "./quick-create-provider";

type HistoryKind = "manual" | "auto";

type HistoryItem = {
  id: string;
  kind: HistoryKind;
  title: string;
  timestamp: string; // demo-friendly formatting
  records: number;
};

const seedHistory: HistoryItem[] = [
  {
    id: "auto-20260126-171042",
    kind: "auto",
    title: "Auto save_20260126_171042",
    timestamp: "2026/01/26 17:10:42",
    records: 302,
  },
  {
    id: "manual-20260124-210818-106-copy",
    kind: "manual",
    title: "20260124_210818_106 copy",
    timestamp: "2026/01/24 23:01:19",
    records: 4,
  },
  {
    id: "manual-20260124-210841-263-copy",
    kind: "manual",
    title: "20260124_210841_263 copy",
    timestamp: "2026/01/24 23:01:12",
    records: 4,
  },
  {
    id: "manual-20260124-210841-263",
    kind: "manual",
    title: "20260124_210841_263",
    timestamp: "2026/01/24 21:08:41",
    records: 4,
  },
  {
    id: "manual-20260124-210818-106",
    kind: "manual",
    title: "20260124_210818_106",
    timestamp: "2026/01/24 21:08:18",
    records: 4,
  },
  {
    id: "auto-20260124-194045",
    kind: "auto",
    title: "Auto save_20260124_194045",
    timestamp: "2026/01/24 19:40:45",
    records: 2,
  },
  {
    id: "auto-20260124-095958",
    kind: "auto",
    title: "Auto save_20260124_095958",
    timestamp: "2026/01/24 09:59:58",
    records: 65,
  },
  {
    id: "auto-20260123-143649",
    kind: "auto",
    title: "Auto save_20260123_143649",
    timestamp: "2026/01/23 14:36:49",
    records: 9,
  },
  {
    id: "auto-20260123-085841",
    kind: "auto",
    title: "Auto save_20260123_085841",
    timestamp: "2026/01/23 08:58:41",
    records: 1,
  },
];

function kindIcon(kind: HistoryKind) {
  if (kind === "manual") return <Hand className="size-5 text-blue-600" />;
  return <Zap className="size-5 text-amber-500" />;
}

export function HistoryPanel({ className }: { readonly className?: string }) {
  const { historyTab, setHistoryTab, historySearch, setHistorySearch, historySelectedId, setHistorySelectedId } =
    useQuickCreate();

  const [items] = React.useState<HistoryItem[]>(seedHistory);

  const counts = React.useMemo(() => {
    const manual = items.filter((i) => i.kind === "manual").length;
    const auto = items.filter((i) => i.kind === "auto").length;
    return { all: items.length, manual, auto };
  }, [items]);

  const visibleItems = React.useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return items.filter((item) => {
      if (historyTab !== "all" && item.kind !== historyTab) return false;
      if (!q) return true;
      return item.title.toLowerCase().includes(q) || item.timestamp.toLowerCase().includes(q);
    });
  }, [items, historySearch, historyTab]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div className="border-b bg-background/95">
        <div className="relative">
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Search history..."
            className="h-9 border-0 pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="border-b bg-muted/40 px-3 py-2">
        <Tabs value={historyTab} onValueChange={(v) => setHistoryTab(v as typeof historyTab)} className="w-full">
          <TabsList className="w-full justify-start gap-1 bg-transparent p-0">
            <TabsTrigger value="all" className="flex-none rounded-md border border-transparent px-3 font-normal">
              <span>All</span>
              <span className="text-muted-foreground">({counts.all})</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex-none rounded-md border border-transparent px-3 font-normal">
              <Hand className="size-4" />
              <span>Manual</span>
              <span className="text-muted-foreground">({counts.manual})</span>
            </TabsTrigger>
            <TabsTrigger value="auto" className="flex-none rounded-md border border-transparent px-3 font-normal">
              <Zap className="size-4" />
              <span>Auto</span>
              <span className="text-muted-foreground">({counts.auto})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visibleItems.length ? (
          visibleItems.map((item) => {
            const selected = historySelectedId === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "group flex w-full items-start gap-3 border-b px-3 py-3 text-left text-sm transition-colors hover:bg-muted/30",
                  selected && "bg-muted/40",
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  onClick={() => setHistorySelectedId(item.id)}
                >
                  <div className="mt-1 shrink-0">{kindIcon(item.kind)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="min-w-0 truncate font-normal">{item.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="size-4" />
                      <span className="font-mono tabular-nums">{item.timestamp}</span>
                    </div>
                  </div>
                </button>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Database className="size-4" />
                    <span className="font-mono tabular-nums">{item.records}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button type="button" variant="ghost" size="icon-sm" title="Copy">
                      <Copy className="size-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" title="Rename">
                      <Pencil className="size-4" />
                      <span className="sr-only">Rename</span>
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm" title="Delete">
                      <Trash2 className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <div className="font-medium text-sm">No history found</div>
            <div className="text-muted-foreground text-sm">Try changing the filter or search query.</div>
          </div>
        )}
      </div>
    </div>
  );
}
