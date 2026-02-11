"use client";

import * as React from "react";

import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemCount?: number;
  itemLabel?: string;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemCount = 1,
  itemLabel,
}: DeleteConfirmDialogProps) {
  // Cache all display values when dialog opens to prevent content change during close animation
  const [cached, setCached] = React.useState({
    itemCount,
    itemLabel,
    title,
    description,
  });

  React.useEffect(() => {
    if (open) {
      setCached({ itemCount, itemLabel, title, description });
    }
  }, [open, itemCount, itemLabel, title, description]);

  // Always use cached values for display to prevent flicker during close animation
  const displayCount = cached.itemCount;
  const displayLabel = cached.itemLabel;
  const displayTitle = cached.title;
  const displayDescription = cached.description;

  const defaultTitle = displayCount > 1 ? "Delete items?" : "Delete item?";
  const defaultDescription =
    displayCount > 1
      ? `This will delete ${displayCount} records permanently.`
      : displayLabel
        ? `This will delete ${displayLabel} permanently.`
        : "This will delete this item permanently.";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>{displayTitle ?? defaultTitle}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This action cannot be undone! {displayDescription ?? defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
