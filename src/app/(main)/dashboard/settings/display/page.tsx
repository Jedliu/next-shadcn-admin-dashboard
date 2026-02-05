import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-base">Display</h2>
        <p className="text-muted-foreground text-sm">Choose density and readability options.</p>
      </div>
      <Separator />
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label className="font-medium text-xs">Content density</Label>
          <RadioGroup defaultValue="comfortable" className="grid gap-2">
            <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
              <RadioGroupItem value="comfortable" id="density-comfortable" />
              <Label htmlFor="density-comfortable" className="font-normal text-sm">
                Comfortable
              </Label>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
              <RadioGroupItem value="compact" id="density-compact" />
              <Label htmlFor="density-compact" className="font-normal text-sm">
                Compact
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
