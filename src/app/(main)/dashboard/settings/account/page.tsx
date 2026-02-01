import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage account security and credentials.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="current-password">Current password</Label>
          <Input id="current-password" type="password" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" type="password" />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button">Update password</Button>
          <Button type="button" variant="secondary">
            Enable 2FA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
