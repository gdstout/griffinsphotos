"use client";

/* eslint-disable @next/next/no-img-element */
import { ImageMetadata, ImageMetadataEnriched } from "@/src/lib/types";
import { useState } from "react";

interface AdminProps {
  metadata: ImageMetadata[];
  metadataEnriched: ImageMetadataEnriched[];
}
export default function Admin({ metadata, metadataEnriched }: AdminProps) {
  const [images, setImages] = useState(metadataEnriched);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const selectedImage = images.find(
    (image) => image.filename === selectedFilename,
  );

  function saveImage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedImage) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");

    setImages((current) =>
      current.map((image) =>
        image.filename === selectedImage.filename
          ? { ...image, title, description }
          : image,
      ),
    );
    setSelectedFilename(null);
  }

  function deleteImage() {
    if (!selectedImage) {
      return;
    }

    setImages((current) =>
      current.filter((image) => image.filename !== selectedImage.filename),
    );
    setSelectedFilename(null);
    setIsConfirmingDelete(false);
  }

  return (
    <div className="m-4 grid grid-flow-row-dense grid-cols-2 gap-4 lg:mx-auto lg:max-w-[65vw] [@media(max-aspect-ratio:3/4)]:m-1 [@media(max-aspect-ratio:3/4)]:grid-cols-1 [@media(max-aspect-ratio:3/4)]:gap-1">
      {images.map((img) => {
        return (
          <div
            key={img.filename}
            className="relative box-border flex aspect-square min-h-0 min-w-0 items-center justify-center overflow-hidden border border-taupe-300 p-1.5 [@media(max-aspect-ratio:3/4)]:p-1"
          >
            <img
              alt={img.filename}
              src={img.urlInfo.url}
              loading="lazy"
              decoding="async"
              className={`block h-full min-h-0 w-full object-contain transition-opacity duration-700 ${loadedImages.has(img.filename) ? "opacity-100" : "opacity-0"}`}
              onLoad={() => {
                setLoadedImages((current) => {
                  const next = new Set(current);
                  next.add(img.filename);
                  return next;
                });
              }}
            />
            <button
              type="button"
              aria-label={`Edit ${img.filename}`}
              onClick={() => {
                setSelectedFilename(img.filename);
                setIsConfirmingDelete(false);
              }}
              className="absolute inset-0 cursor-pointer"
            />
            {selectedFilename === img.filename && (
              <form
                onSubmit={saveImage}
                className="absolute inset-0 isolate z-10 flex flex-col justify-center gap-3 bg-taupe-950/5 p-4"
              >
                <label className="flex flex-col gap-1 text-sm">
                  Title
                  <input
                    name="title"
                    defaultValue={img.title}
                    className="border border-taupe-300 bg-taupe-950/20 px-2 py-1 outline-none focus:border-taupe-100"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Description
                  <textarea
                    name="description"
                    defaultValue={img.description}
                    rows={3}
                    className="resize-none border border-taupe-300 bg-taupe-950/20 px-2 py-1 outline-none focus:border-taupe-100"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="border border-taupe-300 px-3 py-1 transition hover:bg-taupe-300 hover:text-taupe-950"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="border border-red-500 px-3 py-1 text-red-500 transition hover:bg-red-500 hover:text-taupe-950"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFilename(null)}
                    className="px-3 py-1 transition hover:opacity-70"
                  >
                    Cancel
                  </button>
                </div>
                {isConfirmingDelete && (
                  <div
                    role="alertdialog"
                    aria-label="Confirm image deletion"
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-taupe-950/90 p-4 text-center"
                  >
                    <p>Are you sure about that?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={deleteImage}
                        className="border border-red-500 px-3 py-1 text-red-500 transition hover:bg-red-500 hover:text-taupe-950"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(false)}
                        className="border border-taupe-300 px-3 py-1 transition hover:bg-taupe-300 hover:text-taupe-950"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
