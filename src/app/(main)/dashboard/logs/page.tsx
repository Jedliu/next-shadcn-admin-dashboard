import type { Metadata } from "next";

import { LogsPanel } from "./_components/logs-panel";

export const metadata: Metadata = {
  title: "Logs",
};

export default function Page() {
  return <LogsPanel />;
}
