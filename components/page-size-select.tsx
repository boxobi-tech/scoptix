"use client";

import { useRouter } from "next/navigation";

type PageSizeOption = {
  size: number;
  href: string;
};

export function PageSizeSelect({
  value,
  options,
}: {
  value: number;
  options: PageSizeOption[];
}) {
  const router = useRouter();

  return (
    <select
      value={value}
      onChange={(e) => {
        const next = options.find((o) => o.size === Number(e.target.value));
        if (next) router.push(next.href);
      }}
      aria-label="Rows per page"
      className="ui-input-field w-12 cursor-pointer rounded-lg border border-line py-1.5 pl-1.5 pr-5 text-center font-mono text-[11px] text-cream outline-none focus:ring-1 focus:ring-accent/30"
    >
      {options.map(({ size }) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
  );
}
