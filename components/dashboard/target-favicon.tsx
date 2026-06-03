"use client";

import Image from "next/image";
import { useState } from "react";
import { IconGlobe } from "@/components/ui-icons";
import { googleFaviconUrl } from "@/lib/target-favicon-url";

export function TargetFavicon({ domain }: { domain: string }) {
  const [failed, setFailed] = useState(false);
  const host = domain.trim();

  if (!host || failed) {
    return <IconGlobe className="size-4 shrink-0 text-muted" aria-hidden />;
  }

  return (
    <Image
      src={googleFaviconUrl(host)}
      alt=""
      width={16}
      height={16}
      className="size-4 shrink-0 rounded-sm object-contain"
      loading="lazy"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}
