"use client";

import Image from "next/image";
import { useState } from "react";
import { BookIcon, WatchlistIcon } from "@/core/components/icons";
import { noPosterLabel, posterLabel } from "../constants";
import type { MediaType } from "../types";

type PosterProps = {
  url: string | null;
  title: string;
  mediaType: MediaType;
  /** Width the image takes on screen, as `<img sizes>` reads it. */
  sizes: string;
  /** Hidden from screen readers, for a thumbnail next to the title it shows. */
  decorative?: boolean;
  className?: string;
};

/**
 * A poster or cover at 2:3. Without one, or when it fails to load, a stand-in
 * with the icon of the type takes its place.
 */
export function Poster({ url, title, mediaType, sizes, decorative, className }: PosterProps) {
  // Remembers which url failed, so a new one gets its chance
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const Icon = mediaType === "book" ? BookIcon : WatchlistIcon;

  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-paper ${className ?? ""}`}
    >
      {url && url !== failedUrl ? (
        <Image
          src={url}
          alt={decorative ? "" : posterLabel(title, mediaType)}
          fill
          sizes={sizes}
          // The catalogs already serve the size asked for
          unoptimized
          className="object-cover"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <div
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : noPosterLabel(title, mediaType)}
          aria-hidden={decorative || undefined}
          className="flex h-full items-center justify-center bg-ink/5 text-ink-muted/50"
        >
          <Icon className="h-1/3 w-1/3 max-h-12 max-w-12" />
        </div>
      )}
    </div>
  );
}
