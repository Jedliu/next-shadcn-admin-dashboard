"use client";

import * as React from "react";

import { FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <Card>
      <CardHeader>
        <CardTitle>Logs</CardTitle>
        <CardDescription>Configure log level, retention, and storage location.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="log-level">Log level</Label>
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger id="log-level" className="w-full sm:w-56">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {LOG_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-sm">Controls how much detail is written to log files.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="log-retention">Log retention</Label>
          <Select value={retention} onValueChange={setRetention}>
            <SelectTrigger id="log-retention" className="w-full sm:w-56">
              <SelectValue placeholder="Select retention" />
            </SelectTrigger>
            <SelectContent>
              {RETENTION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-sm">Logs older than this are automatically removed.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="log-path">Log folder</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input id="log-path" value={logPath} readOnly className="font-mono sm:flex-1" />
            <Button type="button" variant="outline" onClick={openLogsFolder} className="sm:w-fit">
              <FolderOpen />
              Open folder
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">Open the directory where log files are stored.</p>
        </div>
      </CardContent>
    </Card>
  );
}
