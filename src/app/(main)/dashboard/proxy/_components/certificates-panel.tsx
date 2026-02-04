"use client";

import { ExternalLink, Info, RefreshCcw, ShieldCheck, ShieldX, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useProxy } from "./proxy-provider";

export function CertificatesPanel() {
  const { certInstalled, certPath, refreshCertStatus, deleteCert, openCertFolder } = useProxy();

  return (
    <div className="flex flex-col gap-4">
      <Card className="py-4">
        <CardHeader className="px-5">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              {certInstalled ? (
                <ShieldCheck className="size-4 text-emerald-600" />
              ) : (
                <ShieldX className="size-4 text-destructive" />
              )}
              Certificate status
            </CardTitle>
            <Button type="button" size="icon-sm" variant="ghost" onClick={refreshCertStatus} title="Refresh">
              <RefreshCcw className="size-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
          <CardDescription>
            {certInstalled ? (
              <Badge variant="secondary">Installed</Badge>
            ) : (
              <Badge variant="destructive">Not installed</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5">
          <div className="grid gap-2">
            <div className="text-muted-foreground text-sm">Certificate path</div>
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1 truncate font-mono text-sm">{certPath}</div>
              <Button
                className="-ml-3 mr-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                variant="link"
                type="button"
                onClick={openCertFolder}
              >
                Open Folder <ExternalLink />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="lg" variant="destructive" onClick={deleteCert} disabled={!certInstalled}>
          <Trash2 />
          Delete certificate
        </Button>
      </div>

      <Card className="py-4">
        <CardHeader className="px-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4 text-muted-foreground" />
            Notes
          </CardTitle>
          <CardDescription>
            To intercept HTTPS traffic, install a self-signed CA certificate into the system trust store. After
            installation, the agent can decrypt and inspect HTTPS requests.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
