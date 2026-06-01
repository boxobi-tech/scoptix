export function PageHeader({
  eyebrow,
  eyebrowTone = "accent",
  title,
  description,
  titleClassName,
}: {
  eyebrow?: string;
  /** Uses theme tokens so hue slider + dark/light both affect the label. */
  eyebrowTone?: "accent" | "warn";
  title: string;
  description?: string;
  titleClassName?: string;
}) {
  const eyebrowColorClass = eyebrowTone === "warn" ? "text-page-eyebrow-warn" : "text-page-eyebrow-accent";

  return (
    <div>
      {eyebrow ? (
        <p className={["text-[10px] font-semibold uppercase tracking-[0.25em]", eyebrowColorClass].join(" ")}>
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={["text-2xl font-semibold tracking-tight text-cream", eyebrow ? "mt-1" : "", titleClassName ?? ""]
          .filter(Boolean)
          .join(" ")}
      >
        {title}
      </h1>
      {description ? <p className="mt-2 max-w-2xl text-[13px] text-muted">{description}</p> : null}
    </div>
  );
}
