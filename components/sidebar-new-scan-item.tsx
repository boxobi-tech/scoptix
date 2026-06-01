"use client";

import { IconPlusCircle } from "@/components/ui-icons";
import { NewScanDialog } from "@/components/new-scan-dialog";

export function SidebarNewScanItem({ classic = false }: { classic?: boolean }) {
  return (
    <NewScanDialog
      renderTrigger={({ onClick }) => (
        <button
          type="button"
          onClick={onClick}
          className={[
            "scx-sidebar-item group w-full text-left",
            classic ? "text-muted hover:text-cream" : "",
          ].join(" ")}
        >
          <IconPlusCircle
            className={[
              "mr-2.5 size-3.5 shrink-0",
              classic ? "text-muted group-hover:text-accent/90" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <span className="truncate">New Scan</span>
        </button>
      )}
    />
  );
}
