"use client";

import { FilePlus2, NotebookPen, UserPlus } from "lucide-react";

import { useQuickCreate } from "@/app/(main)/dashboard/_components/quick-create/quick-create-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function QuickCreateActions({ className }: { readonly className?: string }) {
  const { testInputValue, setTestInputValue } = useQuickCreate();

  return (
    <div className={cn("flex min-h-0 flex-col gap-2 overflow-y-auto", className)}>
      <Input
        placeholder="Test input (pin/unpin state)"
        value={testInputValue}
        onChange={(e) => setTestInputValue(e.target.value)}
      />
      <Button variant="outline" className="w-full justify-start">
        <FilePlus2 />
        New document
      </Button>
      <Button variant="outline" className="w-full justify-start">
        <NotebookPen />
        New task
      </Button>
      <Button variant="outline" className="w-full justify-start">
        <UserPlus />
        Invite user
      </Button>
    </div>
  );
}
