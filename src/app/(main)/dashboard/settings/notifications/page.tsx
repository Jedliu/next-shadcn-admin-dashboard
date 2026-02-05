import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-base">Notifications</h2>
        <p className="text-muted-foreground text-sm">Choose what you want to be notified about.</p>
      </div>
      <Separator />
      <div className="divide-y rounded-lg border bg-background">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="space-y-0.5">
            <div className="font-medium text-sm">Product updates</div>
            <div className="text-muted-foreground text-xs">News and feature announcements.</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="space-y-0.5">
            <div className="font-medium text-sm">Security alerts</div>
            <div className="text-muted-foreground text-xs">Critical changes to your account.</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="space-y-0.5">
            <div className="font-medium text-sm">Marketing emails</div>
            <div className="text-muted-foreground text-xs">Tips, newsletters, and promotions.</div>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
}
