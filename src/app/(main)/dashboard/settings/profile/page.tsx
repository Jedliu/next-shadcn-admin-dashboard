import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-base">Profile</h2>
        <p className="text-muted-foreground text-sm">Update your profile information.</p>
      </div>
      <Separator />
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="display-name" className="font-medium text-xs">
            Display name
          </Label>
          <Input id="display-name" placeholder="Studio Admin" className="h-8 text-sm" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email" className="font-medium text-xs">
            Email
          </Label>
          <Input id="email" type="email" placeholder="admin@example.com" className="h-8 text-sm" />
        </div>
      </div>
    </div>
  );
}
