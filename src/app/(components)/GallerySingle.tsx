"use client";

/* eslint-disable @next/next/no-img-element */
import { getImageUrl } from "@/src/lib/api";
import { ImageMetadata } from "@/src/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

const STATIONARY_DELAY_MS = 500;
const AUTO_ADVANCE_DELAY_MS = 7500;

interface GallerySingleProps {
  metadata: ImageMetadata[];
  imgUrl: string;
  queryParamImage?: boolean;
}

export default function GallerySingle({
  metadata,
  imgUrl,
  queryParamImage,
}: GallerySingleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImgUrl, setCurrentImgUrl] = useState(imgUrl);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);
  const [showNavigation, setShowNavigation] = useState(true);
  const prefetchedImages = useRef(new Map<number, Promise<string>>());

  // state used for keeping track of auto advance
  const autoAdvanceTimer = useRef<number | null>(null);
  const stationaryTimer = useRef<number | null>(null);
  const autoAdvanceGeneration = useRef(0);
  const currentIndexRef = useRef(0);
  const mouseX = useRef<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [showAdvanceIndicator, setShowAdvanceIndicator] = useState(false);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current !== null) {
        window.clearTimeout(autoAdvanceTimer.current);
      }
      if (stationaryTimer.current !== null) {
        window.clearTimeout(stationaryTimer.current);
      }
    };
  }, []);

  /**
   * handle the initial navigation divs that show the user where to click
   */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShowNavigation(false);
      clearAutoAdvanceTimer();
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, []);

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

  async function handleClick(
    e: React.MouseEvent<HTMLDivElement>,
    reschedule = true,
  ) {
    const isLeftSide = e.clientX < window.innerWidth / 2;
    const targetIndex = isLeftSide
      ? (currentIndexRef.current - 1 + metadata.length) % metadata.length
      : (currentIndexRef.current + 1) % metadata.length;
    const targetUrl = await prefetchImage(targetIndex);

    currentIndexRef.current = targetIndex;
    setCurrentIndex(targetIndex);
    setCurrentImgUrl(targetUrl);

    if (reschedule) {
      scheduleAutoAdvance();
    }
  }

  /**
   * reset timers for auto advance
   * removes css class that depicts a circular loader
   */
  function clearAutoAdvanceTimer() {
    autoAdvanceGeneration.current += 1;

    if (autoAdvanceTimer.current !== null) {
      window.clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }

    if (stationaryTimer.current !== null) {
      window.clearTimeout(stationaryTimer.current);
      stationaryTimer.current = null;
    }

    setShowAdvanceIndicator(false);
    indicatorRef.current?.classList.remove("advance-indicator-active");
  }

  /**
   * handle scheduling and resetting of timers for auto advance using window.setTimeout()
   */
  function scheduleAutoAdvance() {
    clearAutoAdvanceTimer();

    if (
      window.matchMedia("(pointer: coarse)").matches ||
      mouseX.current === null ||
      mouseX.current <= window.innerWidth / 2
    ) {
      return;
    }

    setShowAdvanceIndicator(true);

    const generation = autoAdvanceGeneration.current;

    stationaryTimer.current = window.setTimeout(() => {
      if (generation !== autoAdvanceGeneration.current) {
        return;
      }

      const indicator = indicatorRef.current;
      if (indicator) {
        indicator.classList.remove("advance-indicator-active");
        void indicator.offsetWidth;
        indicator.classList.add("advance-indicator-active");
      }

      stationaryTimer.current = null;
      autoAdvanceTimer.current = window.setTimeout(async () => {
        if (generation !== autoAdvanceGeneration.current) {
          return;
        }

        autoAdvanceTimer.current = null;
        const event = {
          clientX: mouseX.current,
        } as React.MouseEvent<HTMLDivElement>;

        await handleClick(event, false);

        if (generation === autoAdvanceGeneration.current) {
          scheduleAutoAdvance();
        }
      }, AUTO_ADVANCE_DELAY_MS);
    }, STATIONARY_DELAY_MS);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    // prevent mobile devices from triggering a timer
    if (window.matchMedia("(pointer: coarse)").matches) {
      clearAutoAdvanceTimer();
      return;
    }

    mouseX.current = e.clientX;
    galleryRef.current?.style.setProperty("--mouse-x", `${e.clientX}px`);
    galleryRef.current?.style.setProperty("--mouse-y", `${e.clientY}px`);

    // change the cursor if we are on the right side of the screen
    if (e.clientX > window.innerWidth / 2) {
      galleryRef.current?.classList.add("gallery-cursor-hidden");
      indicatorRef.current?.classList.add("custom-cursor-visible");
    } else {
      galleryRef.current?.classList.remove("gallery-cursor-hidden");
      indicatorRef.current?.classList.remove("custom-cursor-visible");
    }

    scheduleAutoAdvance();
  }

  return (
    <div
      ref={galleryRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.current = null;
        clearAutoAdvanceTimer();
        galleryRef.current?.classList.remove("gallery-cursor-hidden");
        indicatorRef.current?.classList.remove("custom-cursor-visible");
      }}
      className="relative flex min-h-0 flex-1 items-center justify-center"
    >
      {/* countdown indicator for auto advance */}
      <div
        ref={indicatorRef}
        aria-hidden="true"
        className={`advance-indicator pointer-events-none fixed top-(--mouse-y) left-(--mouse-x) z-999 h-6 w-6 translate-x-[-50%] translate-y-[-40%] rounded-full border-2 border-taupe-300 opacity-0 ${showAdvanceIndicator ? "advance-indicator-active" : ""}`}
      />
      {/* set of divs to show how the navigation works, disappear after 3 seconds */}
      {queryParamImage !== true && (
        <div
          className={`absolute inset-0 z-10 grid h-full w-full grid-cols-2 text-8xl transition-opacity duration-3000 ${showNavigation ? "opacity-100" : "pointer-events-none opacity-0"} [@media(max-aspect-ratio:3/4)]:text-5xl`}
        >
          {queryParamImage !== undefined ? (
            <div className="col-span-2 flex items-center justify-center bg-red-950/40 text-3xl text-wrap">
              the specified image does not exist
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center bg-mauve-800/90">
                previous
              </div>
              <div className="flex items-center justify-center bg-slate-900/90">
                next
              </div>
            </>
          )}
        </div>
      )}
      <div className="m-8 [@media(max-aspect-ratio:3/4)]:m-0 [@media(max-aspect-ratio:3/4)]:max-w-[95vw]">
        <img
          alt="img"
          className={`h-auto max-h-[80vh] w-auto max-w-full justify-self-end border border-taupe-300 object-contain p-1.5 ${loadedImageUrl === currentImgUrl ? "opacity-100" : "opacity-0"} [@media(max-aspect-ratio:3/4)]:col-span-1`}
          src={currentImgUrl}
          onLoad={() => setLoadedImageUrl(currentImgUrl)}
        />
      </div>
    </div>
  );
}
