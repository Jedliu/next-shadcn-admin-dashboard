import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Display</CardTitle>
        <CardDescription>Choose density and readability options.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label>Content density</Label>
          <RadioGroup defaultValue="comfortable" className="grid gap-2">
            <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
              <RadioGroupItem value="comfortable" id="density-comfortable" />
              <Label htmlFor="density-comfortable" className="font-normal">
                Comfortable
              </Label>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
              <RadioGroupItem value="compact" id="density-compact" />
              <Label htmlFor="density-compact" className="font-normal">
                Compact
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
