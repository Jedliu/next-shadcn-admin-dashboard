"use client";

import * as React from "react";

type FloatingPanelPosition = { top: number; right: number; bottom: number };

type UseFloatingPanelOptions = {
  isMobile: boolean;
  open: boolean;
  anchorSelector: string;
  enabled?: boolean;
  animationMs?: number;
};

export function useFloatingPanel({
  isMobile,
  open,
  anchorSelector,
  enabled = true,
  animationMs = 500,
}: UseFloatingPanelOptions) {
  const isMountedRef = React.useRef(false);
  const unmountTimeoutRef = React.useRef<number | null>(null);
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
  const [position, setPosition] = React.useState<FloatingPanelPosition | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (isMobile || !enabled) {
      setPortalTarget(null);
      return;
    }
    setPortalTarget(document.body);
  }, [enabled, isMobile]);

  React.useEffect(() => {
    if (isMobile || !enabled) {
      setPosition(null);
      return;
    }
    if (!open) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!isMountedRef.current) return;
        const anchor = document.querySelector<HTMLElement>(anchorSelector);
        const rect = anchor?.getBoundingClientRect();
        if (!rect) return;
        setPosition({
          top: Math.round(rect.top),
          right: Math.max(0, Math.round(window.innerWidth - rect.right)),
          bottom: Math.max(0, Math.round(window.innerHeight - rect.bottom)),
        });
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    const anchor = document.querySelector<HTMLElement>(anchorSelector);
    const ro = anchor ? new ResizeObserver(update) : null;
    if (anchor && ro) ro.observe(anchor);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      ro?.disconnect();
    };
  }, [anchorSelector, enabled, isMobile, open]);

  React.useEffect(() => {
    if (isMobile || !enabled) {
      if (unmountTimeoutRef.current) {
        window.clearTimeout(unmountTimeoutRef.current);
        unmountTimeoutRef.current = null;
      }
      setVisible(false);
      setMounted(false);
      return;
    }
    if (unmountTimeoutRef.current) {
      window.clearTimeout(unmountTimeoutRef.current);
      unmountTimeoutRef.current = null;
    }

    if (open) {
      setMounted(true);
      setVisible(false);
      return;
    }

    setVisible(false);
    unmountTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setMounted(false);
    }, animationMs);

    return () => {
      if (unmountTimeoutRef.current) {
        window.clearTimeout(unmountTimeoutRef.current);
        unmountTimeoutRef.current = null;
      }
    };
  }, [animationMs, enabled, isMobile, open]);

  React.useEffect(() => {
    if (isMobile || !enabled) return;
    if (!mounted || !position) return;
    const raf = requestAnimationFrame(() => {
      if (!isMountedRef.current) return;
      setVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [enabled, isMobile, mounted, position]);

  return { portalTarget, position, mounted, visible };
}
