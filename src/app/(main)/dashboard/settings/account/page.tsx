import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-base">Account</h2>
        <p className="text-muted-foreground text-sm">Manage account security and credentials.</p>
      </div>
      <Separator />
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="current-password" className="font-medium text-xs">
            Current password
          </Label>
          <Input id="current-password" type="password" className="h-8 text-sm" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new-password" className="font-medium text-xs">
            New password
          </Label>
          <Input id="new-password" type="password" className="h-8 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm">
            Update password
          </Button>
          <Button type="button" variant="secondary" size="sm">
            Enable 2FA
          </Button>
        </div>
      </div>
    </div>
  );
}
