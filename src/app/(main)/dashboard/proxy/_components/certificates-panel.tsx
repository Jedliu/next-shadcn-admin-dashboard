"use client";

import { ExternalLink, Info, RefreshCcw, ShieldCheck, ShieldX, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useProxy } from "./proxy-provider";

export function CertificatesPanel() {
  const { certInstalled, certPath, refreshCertStatus, deleteCert, openCertFolder } = useProxy();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-base">Certificates</h2>
        <p className="text-muted-foreground text-sm">Manage trust certificates used for HTTPS interception.</p>
      </div>
      <Separator />

      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between gap-4 border-b p-4">
          <div className="flex items-center gap-2">
            {certInstalled ? (
              <ShieldCheck className="size-4 text-emerald-600" />
            ) : (
              <ShieldX className="size-4 text-destructive" />
            )}
            <div className="font-medium text-sm">Certificate status</div>
          </div>
          <Button type="button" size="icon-sm" variant="ghost" onClick={refreshCertStatus} title="Refresh">
            <RefreshCcw className="size-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <div className="px-4 py-3">
          {certInstalled ? (
            <Badge variant="secondary">Installed</Badge>
          ) : (
            <Badge variant="destructive">Not installed</Badge>
          )}
        </div>
        <div className="border-t px-4 py-3">
          <div className="text-muted-foreground text-xs">Certificate path</div>
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0 flex-1 truncate font-mono text-sm">{certPath}</div>
            <Button
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              variant="link"
              type="button"
              onClick={openCertFolder}
            >
              Open folder <ExternalLink />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="destructive" onClick={deleteCert} disabled={!certInstalled}>
          <Trash2 />
          Delete certificate
        </Button>
      </div>

      <div className="rounded-lg border bg-background">
        <div className="flex items-center gap-2 border-b p-4">
          <Info className="size-4 text-muted-foreground" />
          <div className="font-medium text-sm">Notes</div>
        </div>
        <div className="px-4 py-3 text-muted-foreground text-xs">
          To intercept HTTPS traffic, install a self-signed CA certificate into the system trust store. After
          installation, the agent can decrypt and inspect HTTPS requests.
        </div>
      </div>
    </div>
  );
}
