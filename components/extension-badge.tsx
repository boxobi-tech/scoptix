import { extensionBadgeClassName } from "@/lib/extension-badge-style";

export function ExtensionBadge({
  ext,
  className,
}: {
  ext: string | null | undefined;
  className?: string;
}) {
  const label = ext?.trim() || "—";

  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase",
        extensionBadgeClassName(ext),
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}
