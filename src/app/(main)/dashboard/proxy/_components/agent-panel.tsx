"use client";

import { Info, Lock, Play, Power, Settings2, Wifi } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="flex flex-col gap-4">
      <Card className="py-4">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className={`size-2 rounded-full ${isRunning ? "bg-emerald-500" : "bg-muted-foreground"}`} />
            {isRunning ? "Agent running" : "Agent stopped"}
          </CardTitle>
          <CardDescription>Listening on port {listenPort}</CardDescription>
        </CardHeader>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="size-4 text-muted-foreground" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="listen-port">Listen port</Label>
              <Input
                id="listen-port"
                type="number"
                min={1}
                max={65535}
                value={listenPort}
                onChange={(e) => setListenPort(Number(e.target.value))}
              />
              <div className="text-muted-foreground text-sm">Default: 8888</div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4">
              <div className="flex items-start gap-3">
                <Lock className={`mt-0.5 size-5 ${mitmEnabled ? "text-emerald-500" : "text-muted-foreground"}`} />
                <div className="space-y-0.5">
                  <div className="font-medium">HTTPS interception (MITM)</div>
                  <div className="text-muted-foreground text-sm">Decrypt HTTPS traffic</div>
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

            <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4">
              <div className="flex items-start gap-3">
                <Wifi
                  className={`mt-0.5 size-5 ${autoApplySystemProxy ? "text-emerald-500" : "text-muted-foreground"}`}
                />
                <div className="space-y-0.5">
                  <div className="font-medium">Auto apply system proxy</div>
                  <div className="text-muted-foreground text-sm">Apply system proxy when the agent starts</div>
                </div>
              </div>
              <Switch
                checked={autoApplySystemProxy}
                onCheckedChange={(checked) => setAutoApplySystemProxy(Boolean(checked))}
              />
            </div>

            <Button
              type="button"
              size="lg"
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
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4 text-muted-foreground" />
            Notes
          </CardTitle>
          <CardDescription>After starting the agent, configure your browser or OS to use it.</CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <div className="text-muted-foreground text-sm">
            Default address: <span className="font-mono text-foreground">127.0.0.1:{listenPort}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
