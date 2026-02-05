"use client";

import { Info, Power, RefreshCcw, Router, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { useProxy } from "./proxy-provider";

export function SystemProxyPanel() {
  const {
    systemProxyStatus,
    systemProxyHost,
    systemProxyPort,
    setSystemProxyHost,
    setSystemProxyPort,
    applySystemProxy,
    restoreSystemProxy,
    clearSystemProxy,
  } = useProxy();

  const isSet = systemProxyStatus === "set";

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-base">System Proxy</h2>
        <p className="text-muted-foreground text-sm">Configure OS-level proxy routing and restore defaults.</p>
      </div>
      <Separator />

      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between gap-4 border-b p-4">
          <div className="flex items-center gap-2">
            <Router className="size-4 text-muted-foreground" />
            <div className="font-medium text-sm">Current system proxy</div>
          </div>
          <Badge variant={isSet ? "secondary" : "outline"}>{isSet ? "Set" : "Unset"}</Badge>
        </div>
        <div className="px-4 py-3 text-muted-foreground text-xs">
          {isSet ? (
            <span className="font-mono text-foreground">
              {systemProxyHost}:{systemProxyPort}
            </span>
          ) : (
            "No system proxy applied"
          )}
        </div>
        <div className="border-t px-4 py-3">
          <Button type="button" size="sm" variant="destructive" onClick={clearSystemProxy}>
            <Trash2 />
            Clear system proxy
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-background">
        <div className="flex items-center gap-2 border-b p-4">
          <Info className="size-4 text-muted-foreground" />
          <div className="font-medium text-sm">Configure system proxy</div>
        </div>
        <div className="grid gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="proxy-host" className="font-medium text-xs">
              Proxy host
            </Label>
            <Input
              id="proxy-host"
              value={systemProxyHost}
              onChange={(e) => setSystemProxyHost(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="proxy-port" className="font-medium text-xs">
              Proxy port
            </Label>
            <Input
              id="proxy-port"
              type="number"
              min={1}
              max={65535}
              value={systemProxyPort}
              onChange={(e) => setSystemProxyPort(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="button" size="sm" onClick={applySystemProxy}>
              <Power />
              Apply system proxy
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={restoreSystemProxy}>
              <RefreshCcw />
              Restore original proxy
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-background">
        <div className="flex items-center gap-2 border-b p-4">
          <Info className="size-4 text-muted-foreground" />
          <div className="font-medium text-sm">Notes</div>
        </div>
        <div className="px-4 py-3 text-muted-foreground text-xs">
          <ul className="list-disc space-y-1 pl-5">
            <li>When system proxy is set, all apps will use the proxy for network access</li>
            <li>After use, restore the original proxy or clear the system proxy</li>
            <li>Proxy port should match the agent listening port</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
