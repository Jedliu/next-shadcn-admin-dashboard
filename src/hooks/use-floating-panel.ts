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
    let observedAnchor: HTMLElement | null = null;
    let ro: ResizeObserver | null = null;

    const ensureObserver = (anchor: HTMLElement | null) => {
      if (anchor === observedAnchor) return;
      ro?.disconnect();
      ro = null;
      observedAnchor = anchor;
      if (anchor) {
        ro = new ResizeObserver(update);
        ro.observe(anchor);
      }
    };

    const updatePosition = (rect: DOMRect) => {
      const next = {
        top: Math.round(rect.top),
        right: Math.max(0, Math.round(window.innerWidth - rect.right)),
        bottom: Math.max(0, Math.round(window.innerHeight - rect.bottom)),
      };
      setPosition((prev) =>
        prev && prev.top === next.top && prev.right === next.right && prev.bottom === next.bottom ? prev : next,
      );
    };

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!isMountedRef.current) return;
        const anchor = document.querySelector<HTMLElement>(anchorSelector);
        if (!anchor || !anchor.isConnected) {
          ensureObserver(null);
          setPosition(null);
          return;
        }
        ensureObserver(anchor);
        const rect = anchor.getBoundingClientRect();
        if (!rect) return;
        updatePosition(rect);
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { capture: true, passive: true });

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
