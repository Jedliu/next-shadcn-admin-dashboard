"use client";

import { Info, Lock, Play, Power, Settings2, Wifi } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { useProxy } from "./proxy-provider";

export function AgentPanel() {
  const {
    agentStatus,
    listenPort,
    mitmEnabled,
    autoApplySystemProxy,
    certInstalled,
    setListenPort,
    setMitmEnabled,
    setAutoApplySystemProxy,
    toggleAgent,
  } = useProxy();

  const isRunning = agentStatus === "running";

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-base">Proxy Agent</h2>
        <p className="text-muted-foreground text-sm">Control the local proxy agent and HTTPS interception.</p>
      </div>
      <Separator />

      <div className="rounded-lg border bg-background">
        <div className="flex items-center gap-3 p-4">
          <span className={`size-2 rounded-full ${isRunning ? "bg-emerald-500" : "bg-muted-foreground"}`} />
          <div className="font-medium text-sm">{isRunning ? "Agent running" : "Agent stopped"}</div>
        </div>
        <div className="border-t px-4 py-2 text-muted-foreground text-xs">Listening on port {listenPort}</div>
      </div>

      <div className="rounded-lg border bg-background">
        <div className="flex items-center gap-2 border-b p-4">
          <Settings2 className="size-4 text-muted-foreground" />
          <div className="font-medium text-sm">Configuration</div>
        </div>
        <div className="grid gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="listen-port" className="font-medium text-xs">
              Listen port
            </Label>
            <Input
              id="listen-port"
              type="number"
              min={1}
              max={65535}
              value={listenPort}
              onChange={(e) => setListenPort(Number(e.target.value))}
              className="h-8 text-sm"
            />
            <div className="text-muted-foreground text-xs">Default: 8888</div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border bg-background p-3">
            <div className="flex items-start gap-3">
              <Lock className={`mt-0.5 size-5 ${mitmEnabled ? "text-emerald-500" : "text-muted-foreground"}`} />
              <div className="space-y-0.5">
                <div className="font-medium text-sm">HTTPS interception (MITM)</div>
                <div className="text-muted-foreground text-xs">Decrypt HTTPS traffic</div>
                {!certInstalled && mitmEnabled ? (
                  <div className="mt-2">
                    <Badge variant="destructive">Certificate missing</Badge>
                  </div>
                ) : null}
              </div>
            </div>
            <Switch
              checked={mitmEnabled}
              onCheckedChange={(checked) => setMitmEnabled(Boolean(checked))}
              disabled={!certInstalled}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border bg-background p-3">
            <div className="flex items-start gap-3">
              <Wifi
                className={`mt-0.5 size-5 ${autoApplySystemProxy ? "text-emerald-500" : "text-muted-foreground"}`}
              />
              <div className="space-y-0.5">
                <div className="font-medium text-sm">Auto apply system proxy</div>
                <div className="text-muted-foreground text-xs">Apply system proxy when the agent starts</div>
              </div>
            </div>
            <Switch
              checked={autoApplySystemProxy}
              onCheckedChange={(checked) => setAutoApplySystemProxy(Boolean(checked))}
            />
          </div>

          <Button
            type="button"
            size="sm"
            className={cn(
              "justify-self-start",
              isRunning
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-emerald-600 text-white hover:bg-emerald-600/90",
            )}
            onClick={toggleAgent}
          >
            {isRunning ? <Power /> : <Play />}
            {isRunning ? "Stop agent" : "Start agent"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-background">
        <div className="flex items-center gap-2 border-b p-4">
          <Info className="size-4 text-muted-foreground" />
          <div className="font-medium text-sm">Notes</div>
        </div>
        <div className="px-4 py-3 text-muted-foreground text-xs">
          After starting the agent, configure your browser or OS to use it.
          <div className="mt-2">
            Default address: <span className="font-mono text-foreground">127.0.0.1:{listenPort}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
