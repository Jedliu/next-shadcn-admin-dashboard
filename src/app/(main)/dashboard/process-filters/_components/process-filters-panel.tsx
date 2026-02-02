"use client";

import * as React from "react";

import { Filter, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ProcessRule = {
  id: string;
  name: string;
  path: string;
  match: "Exact" | "Contains";
  allowNetwork: boolean;
  recordLogs: boolean;
  enabled: boolean;
};

const initialRules: ProcessRule[] = [
  {
    id: "evernote",
    name: "Evernote",
    path: "/Applications/Evernote.app/Contents/MacOS/Evernote",
    match: "Exact",
    allowNetwork: true,
    recordLogs: true,
    enabled: true,
  },
  {
    id: "crash-handler",
    name: "CrashHandler",
    path: "/Applications/Adobe Illustrator 2025/Adobe Illustrator.app/Contents/Frameworks/AdobeCrashReporter.framework",
    match: "Contains",
    allowNetwork: true,
    recordLogs: false,
    enabled: true,
  },
];

export function ProcessFiltersSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <div className="font-medium text-base">Process filter settings</div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-muted/10 p-4">
        <div className="space-y-1">
          <div className="font-medium">Enable process filters</div>
          <div className="text-muted-foreground text-sm">Only capture traffic for processes that match a rule.</div>
        </div>
        <Switch defaultChecked aria-label="Enable process filters" />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="font-medium">Other processes (no matching rules)</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Label className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
            <Checkbox defaultChecked />
            <span className="grid gap-1">
              <span className="font-medium">Allow network</span>
              <span className="text-muted-foreground text-xs">Capture traffic for unknown processes.</span>
            </span>
          </Label>
          <Label className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
            <Checkbox defaultChecked />
            <span className="grid gap-1">
              <span className="font-medium">Record logs</span>
              <span className="text-muted-foreground text-xs">Keep request logs when unmatched.</span>
            </span>
          </Label>
        </div>
      </div>
    </div>
  );
}

export function ProcessFiltersAddRule() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Plus className="size-4 text-muted-foreground" />
        <div className="font-medium text-base">Add new rule</div>
      </div>

      <div className="space-y-3">
        <div className="font-medium">Rule details</div>
        <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
          <Input placeholder="Process name or full path" />
          <Select defaultValue="contains">
            <SelectTrigger>
              <SelectValue placeholder="Match mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="exact">Exact</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" className="gap-2">
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
          <Label className="flex items-center gap-2">
            <Checkbox defaultChecked />
            Allow network
          </Label>
          <Label className="flex items-center gap-2">
            <Checkbox defaultChecked />
            Record logs
          </Label>
          <span className="text-xs">Exact matches use the full process path.</span>
        </div>
      </div>
    </div>
  );
}

export function ProcessFiltersAppliedRules() {
  const [rules, setRules] = React.useState<ProcessRule[]>(initialRules);

  const toggleRule = React.useCallback((id: string, enabled: boolean) => {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, enabled } : rule)));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Existing rules</div>
        <Badge variant="secondary">{rules.length}</Badge>
      </div>
      <div className="grid gap-3">
        {rules.map((rule) => (
          <div key={rule.id} className="overflow-hidden rounded-lg border bg-muted/20 p-3">
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Checkbox
                  checked={rule.enabled}
                  onCheckedChange={(checked) => toggleRule(rule.id, Boolean(checked))}
                  aria-label={`Enable ${rule.name}`}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{rule.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {rule.match}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", rule.enabled ? "text-foreground" : "text-muted-foreground")}
                    >
                      {rule.enabled ? "Applied" : "Paused"}
                    </Badge>
                  </div>
                  <div className="w-full truncate text-muted-foreground text-xs">{rule.path}</div>
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                    {rule.allowNetwork ? <span>Allow network</span> : <span>Network blocked</span>}
                    {rule.recordLogs ? <span>Record logs</span> : <span>No logs</span>}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline">Reset</Button>
        <Button>Save changes</Button>
      </div>
    </div>
  );
}
