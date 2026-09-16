"use client";

/* eslint-disable @next/next/no-img-element */
import { ImageMetadataEnriched } from "@/src/lib/types";
import Link from "next/link";
import { useState } from "react";

export default function GalleryAll({
  metadataEnriched,
}: {
  metadataEnriched: ImageMetadataEnriched[];
}) {
  const [wideImages, setWideImages] = useState<Set<string>>(new Set());
  const [tallImages, setTallImages] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  return (
    <div className="m-4 grid grid-flow-row-dense grid-cols-2 gap-4 [@media(max-aspect-ratio:3/4)]:m-1 [@media(max-aspect-ratio:3/4)]:gap-1">
      {metadataEnriched.map((img) => {
        return (
          <div
            key={img.filename}
            className={`relative box-border flex min-h-0 min-w-0 items-center justify-center overflow-hidden border border-taupe-300 p-0.5 md:p-1.5 ${wideImages.has(img.filename) ? "col-span-2 col-start-1 aspect-2/1" : tallImages.has(img.filename) ? "row-span-2 aspect-auto h-[calc(100vw-2rem)] max-md:h-[calc(100vw-0.5rem)]" : "aspect-square"}`}
          >
            <Link
              className="block min-h-0 min-w-0 flex-1 self-stretch overflow-hidden"
              href={`/?image=${encodeURIComponent(img.filename)}`}
            >
              <img
                alt={img.filename}
                src={img.urlInfo.url}
                loading="lazy"
                decoding="async"
                className={`block h-full min-h-0 w-full object-cover transition-opacity duration-700 ${loadedImages.has(img.filename) ? "opacity-100" : "opacity-0"}`}
                onLoad={(event) => {
                  const image = event.currentTarget;

                  setLoadedImages((current) => {
                    const next = new Set(current);
                    next.add(img.filename);
                    return next;
                  });

                  if (image.naturalWidth / image.naturalHeight > 1.5) {
                    setWideImages((current) => {
                      const next = new Set(current);
                      next.add(img.filename);
                      return next;
                    });
                  } else if (image.naturalHeight / image.naturalWidth > 1.5) {
                    setTallImages((current) => {
                      const next = new Set(current);
                      next.add(img.filename);
                      return next;
                    });
                  }
                }}
              />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
