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
      <div className="relative h-[75vh] w-[60vw] flex items-center justify-center">
        <div>
          <p>{metadata[currentIndex].title}</p>
        </div>
        <img
          alt="img"
          className="h-auto max-h-full w-auto max-w-full border border-taupe-300 p-1.5 object-contain"
          src={currentImgUrl}
        />
      </div>
    </div>
  );
}
