import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4">
          <div className="space-y-0.5">
            <div className="font-medium">Product updates</div>
            <div className="text-sm text-muted-foreground">News and feature announcements.</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4">
          <div className="space-y-0.5">
            <div className="font-medium">Security alerts</div>
            <div className="text-sm text-muted-foreground">Critical changes to your account.</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4">
          <div className="space-y-0.5">
            <div className="font-medium">Marketing emails</div>
            <div className="text-sm text-muted-foreground">Tips, newsletters, and promotions.</div>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}
