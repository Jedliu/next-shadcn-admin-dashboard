import data from "./_components/data.json";
import { DataTable } from "./_components/data-table";

export default function Page() {
  return (
    <div className="@container/main flex h-full min-h-0 flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Workbench</h1>
        <p className="text-sm text-muted-foreground">Track work items, ownership, and current status.</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <DataTable data={data} />
      </div>
    </div>
  );
}
