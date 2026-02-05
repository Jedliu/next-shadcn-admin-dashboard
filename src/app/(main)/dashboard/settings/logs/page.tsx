"use client";

import * as React from "react";

import { FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const LOG_LEVELS = [
  { value: "error", label: "Error" },
  { value: "warn", label: "Warn" },
  { value: "info", label: "Info" },
  { value: "debug", label: "Debug" },
  { value: "trace", label: "Trace" },
];

const RETENTION_OPTIONS = [
  { value: "7d", label: "7 days" },
  { value: "14d", label: "14 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "180d", label: "180 days" },
  { value: "365d", label: "1 year" },
];

export default function Page() {
  const [logLevel, setLogLevel] = React.useState("info");
  const [retention, setRetention] = React.useState("30d");
  const [logPath] = React.useState("~/.studio-admin/logs");

  const openLogsFolder = React.useCallback(() => {
    // Demo: no-op. In Tauri, this would open a folder in the OS file explorer.
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-base">Logs</h2>
        <p className="text-muted-foreground text-sm">Configure log level, retention, and storage location.</p>
      </div>
      <Separator />
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="log-level" className="font-medium text-xs">
            Log level
          </Label>
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger id="log-level" size="sm" className="w-full text-xs sm:w-56">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {LOG_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value} className="text-xs">
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">Controls how much detail is written to log files.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="log-retention" className="font-medium text-xs">
            Log retention
          </Label>
          <Select value={retention} onValueChange={setRetention}>
            <SelectTrigger id="log-retention" size="sm" className="w-full text-xs sm:w-56">
              <SelectValue placeholder="Select retention" />
            </SelectTrigger>
            <SelectContent>
              {RETENTION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">Logs older than this are automatically removed.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="log-path" className="font-medium text-xs">
            Log folder
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input id="log-path" value={logPath} readOnly className="h-8 font-mono text-sm sm:flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={openLogsFolder} className="sm:w-fit">
              <FolderOpen />
              Open folder
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">Open the directory where log files are stored.</p>
        </div>
      </div>
    </div>
  );
}
