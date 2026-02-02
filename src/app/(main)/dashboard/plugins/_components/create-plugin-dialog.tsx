"use client";

import * as React from "react";

import {
  ChevronsUpDown,
  CirclePlay,
  Eraser,
  FileCode2,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Save,
  SquareTerminal,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CreatePluginDialogProps {
  onClose: () => void;
  onSave?: (plugin: { name: string; description: string }) => void;
}

export function CreatePluginDialog({ onClose, onSave }: CreatePluginDialogProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isLogsCollapsed, setIsLogsCollapsed] = React.useState(false);
  const sidebarPanelRef = React.useRef<React.ComponentRef<typeof ResizablePanel>>(null);
  const logsPanelRef = React.useRef<React.ComponentRef<typeof ResizablePanel>>(null);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [logs, setLogs] = React.useState<string[]>([
    "[System] Plugin environment initialized.",
    "[System] Ready to capture traffic.",
  ]);

  const toggleSidebar = () => {
    const panel = sidebarPanelRef.current;
    if (panel) {
      if (isSidebarCollapsed) {
        panel.expand();
      } else {
        panel.collapse();
      }
    }
  };

  const toggleLogs = () => {
    const panel = logsPanelRef.current;
    if (panel) {
      if (isLogsCollapsed) {
        panel.expand();
      } else {
        panel.collapse();
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-background shadow-lg">
      {/* Top Header Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                  {isSidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-2">
            <FileCode2 className="size-5 text-primary" />
            <span className="font-semibold">New Plugin</span>
            {name && <span className="text-muted-foreground text-sm">/ {name}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-8 gap-2"
            onClick={() => {
              onSave?.({ name, description });
              onClose();
            }}
          >
            <Save className="size-4" />
            Save & Install
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar: Basic Info */}
          <ResizablePanel
            ref={sidebarPanelRef}
            defaultSize={20}
            minSize={15}
            maxSize={30}
            collapsible
            onCollapse={() => setIsSidebarCollapsed(true)}
            onExpand={() => setIsSidebarCollapsed(false)}
            className={cn(
              "flex flex-col border-r bg-muted/10 transition-[width]",
              isSidebarCollapsed && "min-w-0 border-r-0",
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex h-10 items-center justify-between border-b px-4 py-2">
                <span className="font-medium text-xs uppercase tracking-wider">Info</span>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="plugin-name">Name</Label>
                    <Input
                      id="plugin-name"
                      placeholder="e.g. auth-injector"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="plugin-desc">Description</Label>
                    <Textarea
                      id="plugin-desc"
                      placeholder="Describe what this plugin does..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[80px] resize-none bg-background"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Triggers</Label>
                    <div className="grid gap-2 rounded-md border bg-background p-3">
                      <div className="flex items-center gap-2">
                        <Checkbox id="trigger-req" defaultChecked />
                        <Label htmlFor="trigger-req" className="font-normal">
                          On Request
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="trigger-res" />
                        <Label htmlFor="trigger-res" className="font-normal">
                          On Response
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className={isSidebarCollapsed ? "hidden" : "flex"} />

          {/* Right Main Area */}
          <ResizablePanel defaultSize={80} className="flex min-w-0 flex-col">
            {/* Debug Address Bar */}
            <div className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CirclePlay className="size-4" />
                <span className="font-medium text-sm">Debug Target:</span>
              </div>
              <div className="flex flex-1 items-center rounded-md border bg-muted/20 px-3">
                <span className="text-muted-foreground text-sm">GET</span>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <input
                  className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="https://api.example.com/v1/resource"
                  defaultValue="https://api.studio-admin.dev/v1/test"
                />
              </div>
              <Button size="sm" variant="secondary" className="h-8">
                <Play className="mr-1 size-3.5 fill-current" />
                Run
              </Button>
            </div>

            {/* Code + Logs Split */}
            <div className="min-h-0 flex-1">
              <ResizablePanelGroup direction="vertical">
                {/* Code Editor Area */}
                <ResizablePanel defaultSize={75} className="flex flex-col">
                  <div className="flex h-full flex-col bg-[#1e1e1e] text-white">
                    <div className="flex items-center justify-between border-[#333] border-b px-4 py-2 text-[#999] text-xs">
                      <span>script.js</span>
                      <span>JavaScript</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm leading-relaxed opacity-90">
                      <p>
                        <span className="text-purple-400">export default</span>{" "}
                        <span className="text-blue-400">async function</span> handleRequest(context) {"{"}
                      </p>
                      <p className="pl-4 text-gray-400">{/* Add your logic here */}</p>
                      <p className="pl-4">const headers = context.request.headers;</p>
                      <p className="pl-4">
                        headers.set(<span className="text-green-400">'X-Custom-Auth'</span>,{" "}
                        <span className="text-green-400">'Bearer token123'</span>);
                      </p>
                      <p className="pl-4 text-gray-400">{/* console.log("Header injected"); */}</p>
                      <p>{"}"}</p>
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Logs Area */}
                <ResizablePanel
                  ref={logsPanelRef}
                  defaultSize={25}
                  minSize={10}
                  collapsible
                  onCollapse={() => setIsLogsCollapsed(true)}
                  onExpand={() => setIsLogsCollapsed(false)}
                  className={cn("flex flex-col bg-muted/10", isLogsCollapsed && "min-h-0")}
                >
                  <div className="flex h-9 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
                    <div className="flex items-center gap-2">
                      <SquareTerminal className="size-4 text-muted-foreground" />
                      <span className="font-medium text-xs uppercase tracking-wider">Console / Logs</span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        Output
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLogs([])}>
                        <Eraser className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleLogs}>
                        <ChevronsUpDown className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2 font-mono text-xs">
                      {logs.length === 0 ? (
                        <div className="p-2 text-muted-foreground italic">
                          No logs yet. Run the script to see output.
                        </div>
                      ) : (
                        logs.map((log, i) => (
                          <div
                            key={`${log}-${i}`}
                            className="border-border/50 border-b px-2 py-1 last:border-0 hover:bg-muted/50"
                          >
                            <span className="mr-2 text-muted-foreground opacity-50">
                              {new Date().toLocaleTimeString()}
                            </span>
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
