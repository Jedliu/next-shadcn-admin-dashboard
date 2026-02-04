"use client";

import * as React from "react";

type UsePointerResizeOptions = {
  direction?: "left" | "right";
  getWidth: () => number;
  setWidth: (width: number) => void;
  clamp: (width: number) => number;
};

export function usePointerResize({ direction = "left", getWidth, setWidth, clamp }: UsePointerResizeOptions) {
  const isResizingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(0);
  const prevUserSelectRef = React.useRef<string | null>(null);

  const onPointerDown = React.useCallback<React.PointerEventHandler<HTMLDivElement>>(
    (e) => {
      if (e.button !== 0) return;
      isResizingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = getWidth();
      prevUserSelectRef.current = document.body.style.userSelect;
      document.body.style.userSelect = "none";
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    },
    [getWidth],
  );

  const onPointerMove = React.useCallback<React.PointerEventHandler<HTMLDivElement>>(
    (e) => {
      if (!isResizingRef.current) return;
      const delta = direction === "left" ? startXRef.current - e.clientX : e.clientX - startXRef.current;
      setWidth(clamp(startWidthRef.current + delta));
    },
    [clamp, direction, setWidth],
  );

  const finishResize = React.useCallback((target?: HTMLDivElement, pointerId?: number) => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    document.body.style.userSelect = prevUserSelectRef.current ?? "";
    prevUserSelectRef.current = null;
    if (target && typeof pointerId === "number") {
      try {
        target.releasePointerCapture(pointerId);
      } catch {
        // ignore
      }
    }
  }, []);

  const onPointerUp = React.useCallback<React.PointerEventHandler<HTMLDivElement>>(
    (e) => {
      finishResize(e.currentTarget as HTMLDivElement, e.pointerId);
    },
    [finishResize],
  );

  const onPointerCancel = React.useCallback(() => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    document.body.style.userSelect = prevUserSelectRef.current ?? "";
    prevUserSelectRef.current = null;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
