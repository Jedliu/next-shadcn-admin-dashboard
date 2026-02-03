"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function HudStats({ className }: { className?: string }) {
  // In a real app, these would be real stats. Here we mock them.
  const [stats, setStats] = React.useState({
    cpu: 12,
    mem: 45,
    net: 1.2,
    fps: 60,
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * (40 - 10) + 10),
        mem: Math.floor(Math.random() * (60 - 40) + 40),
        net: Number((Math.random() * (5 - 0.5) + 0.5).toFixed(1)),
        fps: Math.floor(Math.random() * (62 - 58) + 58),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "hidden items-center gap-4 text-xs font-mono opacity-80",
        // Only show when the theme preset is 'tech'.
        // We use a CSS selector approach for zero-runtime cost on other themes.
        "[html[data-theme-preset='tech']_&]:flex",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-muted-foreground">SYS.ONLINE</span>
      </div>
      <div className="flex gap-3 text-[10px] sm:text-xs">
        <div className="flex gap-1">
          <span className="text-muted-foreground">CPU</span>
          <span className="text-primary">{stats.cpu}%</span>
        </div>
        <div className="flex gap-1 border-l border-border pl-3">
          <span className="text-muted-foreground">MEM</span>
          <span className="text-primary">{stats.mem}%</span>
        </div>
        <div className="flex gap-1 border-l border-border pl-3">
          <span className="text-muted-foreground">NET</span>
          <span className="text-primary">{stats.net}MB/s</span>
        </div>
        <div className="flex gap-1 border-l border-border pl-3 hidden sm:flex">
          <span className="text-muted-foreground">FPS</span>
          <span className="text-primary">{stats.fps}</span>
        </div>
      </div>
    </div>
  );
}
