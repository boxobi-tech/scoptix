import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { AppShellChrome } from "@/components/app-shell-chrome";
import { IpSightingPanelProvider } from "@/components/ip-sighting-panel-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <IpSightingPanelProvider>
      <div className="relative min-h-screen">
        <AppShellChrome />

        <div className="relative z-10 flex h-[100dvh] min-h-0 overflow-hidden">
          <Suspense fallback={<aside className="scx-sidebar w-[220px] shrink-0" />}>
            <Sidebar />
          </Suspense>
          <div className="scx-main-shell flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </IpSightingPanelProvider>
  );
}
