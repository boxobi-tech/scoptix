import Link from "next/link";

export function ScanResultsModeSwitch({
  scanId,
  active,
}: {
  scanId: string;
  active: "snapshot" | "compare";
}) {
  const items = [
    {
      key: "snapshot" as const,
      href: `/scans/${scanId}/observed`,
      title: "Snapshot",
      hint: "What this scan observed at run time.",
    },
    {
      key: "compare" as const,
      href: `/scans/${scanId}/compare`,
      title: "Compare",
      hint: "Changes vs. another completed scan.",
    },
  ];

  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-black/10 p-1"
      role="tablist"
      aria-label="Results view"
    >
      {items.map((item) => {
        const isActive = item.key === active;

        return (
          <Link
            key={item.key}
            href={item.href}
            role="tab"
            aria-selected={isActive}
            title={item.hint}
            className={[
              "rounded-lg px-4 py-2.5 text-[13px] font-medium transition-colors",
              isActive
                ? "bg-accent/15 text-cream shadow-glass ring-1 ring-accent/25"
                : "text-muted hover:bg-[var(--nav-hover-bg)] hover:text-cream",
            ].join(" ")}
          >
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
