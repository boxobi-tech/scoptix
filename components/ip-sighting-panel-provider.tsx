"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { IpSightingPanel } from "@/components/ip-sighting-panel";

type IpSightingPanelContextValue = {
  ipResolutionId: string | null;
  openIpPanel: (id: string) => void;
  closeIpPanel: () => void;
};

const IpSightingPanelContext = createContext<IpSightingPanelContextValue | null>(null);

export function IpSightingPanelProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [ipResolutionId, setIpResolutionId] = useState<string | null>(null);

  const closeIpPanel = useCallback(() => setIpResolutionId(null), []);
  const openIpPanel = useCallback((id: string) => {
    if (id) setIpResolutionId(id);
  }, []);

  useEffect(() => {
    setIpResolutionId(null);
  }, [pathname]);

  const value = useMemo(
    () => ({ ipResolutionId, openIpPanel, closeIpPanel }),
    [ipResolutionId, openIpPanel, closeIpPanel],
  );

  return (
    <IpSightingPanelContext.Provider value={value}>
      {children}
      {ipResolutionId ? (
        <IpSightingPanel ipResolutionId={ipResolutionId} onClose={closeIpPanel} />
      ) : null}
    </IpSightingPanelContext.Provider>
  );
}

export function useIpSightingPanel() {
  const ctx = useContext(IpSightingPanelContext);
  if (!ctx) {
    throw new Error("useIpSightingPanel must be used within IpSightingPanelProvider");
  }
  return ctx;
}
