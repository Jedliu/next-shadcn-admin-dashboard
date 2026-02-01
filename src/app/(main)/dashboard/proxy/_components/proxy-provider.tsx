"use client";

import * as React from "react";

type ProxyStatus = "running" | "stopped";
type SystemProxyStatus = "unset" | "set";

type ProxyState = {
  // Agent
  agentStatus: ProxyStatus;
  listenPort: number;
  mitmEnabled: boolean;
  autoApplySystemProxy: boolean;

  // System proxy
  systemProxyStatus: SystemProxyStatus;
  systemProxyHost: string;
  systemProxyPort: number;
  originalSystemProxy: { host: string; port: number; status: SystemProxyStatus } | null;

  // Certificates (MITM)
  certInstalled: boolean;
  certPath: string;
};

type ProxyActions = {
  setListenPort: (port: number) => void;
  setMitmEnabled: (next: boolean) => void;
  setAutoApplySystemProxy: (next: boolean) => void;

  startAgent: () => void;
  stopAgent: () => void;
  toggleAgent: () => void;

  setSystemProxyHost: (host: string) => void;
  setSystemProxyPort: (port: number) => void;
  applySystemProxy: () => void;
  restoreSystemProxy: () => void;
  clearSystemProxy: () => void;

  refreshCertStatus: () => void;
  deleteCert: () => void;
  openCertFolder: () => void;
};

const ProxyContext = React.createContext<(ProxyState & ProxyActions) | null>(null);

function clampPort(raw: number) {
  const v = Number.isFinite(raw) ? Math.round(raw) : 0;
  return Math.max(1, Math.min(65535, v));
}

export function ProxyProvider({ children }: { children: React.ReactNode }) {
  const [agentStatus, setAgentStatus] = React.useState<ProxyStatus>("stopped");
  const [listenPort, setListenPort] = React.useState(8888);
  const [mitmEnabled, setMitmEnabled] = React.useState(true);
  const [autoApplySystemProxy, setAutoApplySystemProxy] = React.useState(false);

  const [systemProxyStatus, setSystemProxyStatus] = React.useState<SystemProxyStatus>("unset");
  const [systemProxyHost, setSystemProxyHost] = React.useState("127.0.0.1");
  const [systemProxyPort, setSystemProxyPort] = React.useState(8888);
  const [originalSystemProxy, setOriginalSystemProxy] = React.useState<ProxyState["originalSystemProxy"]>(null);

  const [certInstalled, setCertInstalled] = React.useState(true);
  const [certPath] = React.useState("~/.sysproxy/certs/ca.crt");

  const applySystemProxy = React.useCallback(() => {
    setOriginalSystemProxy(
      (prev) => prev ?? { host: systemProxyHost, port: systemProxyPort, status: systemProxyStatus },
    );
    setSystemProxyStatus("set");
  }, [systemProxyHost, systemProxyPort, systemProxyStatus]);

  const restoreSystemProxy = React.useCallback(() => {
    if (!originalSystemProxy) {
      setSystemProxyStatus("unset");
      return;
    }
    setSystemProxyHost(originalSystemProxy.host);
    setSystemProxyPort(originalSystemProxy.port);
    setSystemProxyStatus(originalSystemProxy.status);
  }, [originalSystemProxy]);

  const clearSystemProxy = React.useCallback(() => {
    setSystemProxyStatus("unset");
  }, []);

  const startAgent = React.useCallback(() => {
    setAgentStatus("running");
    if (autoApplySystemProxy) {
      setSystemProxyHost("127.0.0.1");
      setSystemProxyPort(clampPort(listenPort));
      applySystemProxy();
    }
  }, [applySystemProxy, autoApplySystemProxy, listenPort]);

  const stopAgent = React.useCallback(() => {
    setAgentStatus("stopped");
    if (autoApplySystemProxy) {
      restoreSystemProxy();
    }
  }, [autoApplySystemProxy, restoreSystemProxy]);

  React.useEffect(() => {
    if (agentStatus !== "running") return;
    if (!autoApplySystemProxy) return;
    setSystemProxyHost("127.0.0.1");
    setSystemProxyPort(clampPort(listenPort));
    applySystemProxy();
  }, [agentStatus, applySystemProxy, autoApplySystemProxy, listenPort]);

  const refreshCertStatus = React.useCallback(() => {
    // Demo: no-op. In Tauri, this would query the system keychain / filesystem.
    setCertInstalled((v) => v);
  }, []);

  const deleteCert = React.useCallback(() => {
    setCertInstalled(false);
    if (mitmEnabled) setMitmEnabled(false);
  }, [mitmEnabled]);

  const openCertFolder = React.useCallback(() => {
    // Demo: no-op. In Tauri, this would open a folder in the OS file explorer.
  }, []);

  const value: ProxyState & ProxyActions = {
    agentStatus,
    listenPort,
    mitmEnabled,
    autoApplySystemProxy,
    systemProxyStatus,
    systemProxyHost,
    systemProxyPort,
    originalSystemProxy,
    certInstalled,
    certPath,

    setListenPort: (port) => setListenPort(clampPort(port)),
    setMitmEnabled,
    setAutoApplySystemProxy,

    startAgent,
    stopAgent,
    toggleAgent: () => (agentStatus === "running" ? stopAgent() : startAgent()),

    setSystemProxyHost,
    setSystemProxyPort: (port) => setSystemProxyPort(clampPort(port)),
    applySystemProxy,
    restoreSystemProxy,
    clearSystemProxy,

    refreshCertStatus,
    deleteCert,
    openCertFolder,
  };

  return <ProxyContext.Provider value={value}>{children}</ProxyContext.Provider>;
}

export function useProxy() {
  const ctx = React.useContext(ProxyContext);
  if (!ctx) throw new Error("useProxy must be used within ProxyProvider");
  return ctx;
}
