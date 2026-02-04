"use client";

import { Info, Power, RefreshCcw, Router, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="flex flex-col gap-4">
      <Card className="py-4">
        <CardHeader className="px-5">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Router className="size-4 text-muted-foreground" />
              Current system proxy
            </CardTitle>
            <Badge variant={isSet ? "secondary" : "outline"}>{isSet ? "Set" : "Unset"}</Badge>
          </div>
          <CardDescription>
            {isSet ? (
              <span className="font-mono text-foreground">
                {systemProxyHost}:{systemProxyPort}
              </span>
            ) : (
              "No system proxy applied"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <Button type="button" variant="destructive" onClick={clearSystemProxy}>
            <Trash2 />
            Clear system proxy
          </Button>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4 text-muted-foreground" />
            Configure system proxy
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="proxy-host">Proxy host</Label>
              <Input id="proxy-host" value={systemProxyHost} onChange={(e) => setSystemProxyHost(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proxy-port">Proxy port</Label>
              <Input
                id="proxy-port"
                type="number"
                min={1}
                max={65535}
                value={systemProxyPort}
                onChange={(e) => setSystemProxyPort(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button type="button" size="lg" onClick={applySystemProxy}>
                <Power />
                Apply system proxy
              </Button>
              <Button type="button" size="lg" variant="secondary" onClick={restoreSystemProxy}>
                <RefreshCcw />
                Restore original proxy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4 text-muted-foreground" />
            Notes
          </CardTitle>
          <CardDescription>
            <ul className="list-disc space-y-1 pl-5">
              <li>When system proxy is set, all apps will use the proxy for network access</li>
              <li>After use, restore the original proxy or clear the system proxy</li>
              <li>Proxy port should match the agent listening port</li>
            </ul>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
