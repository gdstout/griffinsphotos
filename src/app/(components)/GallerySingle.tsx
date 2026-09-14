"use client";

/* eslint-disable @next/next/no-img-element */
import { getImageUrl } from "@/src/lib/api";
import { ImageMetadata } from "@/src/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface GallerySingleProps {
  metadata: ImageMetadata[];
  imgUrl: string;
}

export default function GallerySingle({
  metadata,
  imgUrl,
}: GallerySingleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImgUrl, setCurrentImgUrl] = useState(imgUrl);
  const prefetchedImages = useRef(new Map<number, Promise<string>>());

  const prefetchImage = useCallback(
    (index: number): Promise<string> => {
      const existingImage = prefetchedImages.current.get(index);

      if (existingImage) {
        return existingImage;
      }

      const imagePromise = getImageUrl(metadata[index].filename).then((url) => {
        // load the next image into the browser cache
        const image = new window.Image();
        image.src = url;

        return url;
      });

      prefetchedImages.current.set(index, imagePromise);

      return imagePromise;
    },
    [metadata],
  );

  useEffect(() => {
    const nextIndex = (currentIndex + 1) % metadata.length;
    void prefetchImage(nextIndex);
  }, [currentIndex, metadata.length, prefetchImage]);

  async function showNextImage() {
    const nextIndex = (currentIndex + 1) % metadata.length;
    const nextUrl = await prefetchImage(nextIndex);

    setCurrentIndex(nextIndex);
    setCurrentImgUrl(nextUrl);
  }

  return (
    <div
      onClick={showNextImage}
      className="flex min-h-screen items-center justify-center "
    >
      <div
        className="relative max-w-[75vw] grid grid-cols-5 items-center justify-center gap-8 p-8 
          [@media(max-aspect-ratio:3/4)]:grid-cols-1
          [@media(max-aspect-ratio:3/4)]:max-w-[95vw]
          [@media(max-aspect-ratio:3/4)]:p-0
          [@media(max-aspect-ratio:3/4)]:justify-end"
      >
        <div className="[@media(max-aspect-ratio:3/4)]:order-2 [@media(max-aspect-ratio:3/4)]:text-center">
          <h2
            className="font-bold text-xl
            [@media(max-aspect-ratio:3/4)]:text-lg"
          >
            {metadata[currentIndex].title}
          </h2>
          <p className="text-s [@media(max-aspect-ratio:3/4)]:text-xs">
            {metadata[currentIndex].description}
          </p>
        </div>
        <img
          alt="img"
          className="order-1 col-span-4 h-auto max-h-[80vh] w-auto max-w-full border border-taupe-300 p-1.5 object-contain 
            [@media(max-aspect-ratio:3/4)]:col-span-1"
          src={currentImgUrl}
        />
      </div>
    </div>
  );
}
