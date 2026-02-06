"use client";

import * as React from "react";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input,textarea,[contenteditable='true'],[role='textbox'],[role='searchbox']"));
}

export function DisableGlobalSelectAll() {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key !== "a" && event.key !== "A") return;
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  return null;
}
