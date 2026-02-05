import data from "./_components/data.json";
import { DataTable } from "./_components/data-table";

export default function Page() {
  return (
    <div className="@container/main flex h-full min-h-0 flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl tracking-tight">Workspace</h1>
        <p className="text-muted-foreground text-sm">
          View real-time or historical traffic logs, edit traffic entries, and inspect traffic details.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <DataTable data={data} />
      </div>
    </div>
  );
}
