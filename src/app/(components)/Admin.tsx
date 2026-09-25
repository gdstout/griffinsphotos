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
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const selectedImage = images.find(
    (image) => image.filename === selectedFilename,
  );

  async function saveImage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedImage || isSaving) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/images/${encodeURIComponent(selectedImage.filename)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ title, description }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to save image");
      }

      setImages((current) =>
        current.map((image) =>
          image.filename === selectedImage.filename
            ? { ...image, title: result.title, description: result.description }
            : image,
        ),
      );
      setSelectedFilename(null);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to save image",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteImage() {
    if (!selectedImage || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/images/${encodeURIComponent(selectedImage.filename)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to delete image");
      }

      setImages((current) =>
        current.filter((image) => image.filename !== selectedImage.filename),
      );
      setSelectedFilename(null);
      setIsConfirmingDelete(false);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Failed to delete image",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function addImage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newImageFile || isUploading) {
      return;
    }

    setIsUploading(true);

    const formData = new FormData(event.currentTarget);
    formData.set("image", newImageFile);

    try {
      const response = await fetch("/api/admin/images", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to upload image");
      }

      window.location.reload();
    } catch (error) {
      setIsUploading(false);
      console.error("Image upload failed:", error);
      window.alert(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    }
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
                    disabled={isSaving || isDeleting}
                    className="border border-taupe-300 px-3 py-1 transition hover:bg-taupe-300 hover:text-taupe-950 disabled:cursor-wait disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
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
                        disabled={isDeleting}
                        className="border border-red-500 px-3 py-1 text-red-500 transition hover:bg-red-500 hover:text-taupe-950 disabled:cursor-wait disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting..." : "Confirm Delete"}
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
      <div
        className="relative box-border flex aspect-square min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden border border-taupe-300 p-1.5 [@media(max-aspect-ratio:3/4)]:p-1"
        onClick={() => setIsAddingImage(true)}
      >
        {!isAddingImage ? (
          "+ Add Image"
        ) : (
          <form
            onSubmit={addImage}
            onClick={(event) => event.stopPropagation()}
            className="absolute inset-0 flex flex-col justify-center gap-3 bg-taupe-950/5 p-4"
          >
            {isUploading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-taupe-950/90">
                <span>Uploading...</span>
              </div>
            )}

            <label className="flex flex-col gap-1 text-sm">
              Image
              <input
                type="file"
                name="image"
                accept="image/*"
                required
                onChange={(event) =>
                  setNewImageFile(event.target.files?.[0] ?? null)
                }
                className="text-xs file:mr-3 file:cursor-pointer file:border file:border-taupe-300 file:bg-transparent file:px-3 file:py-1 file:text-xs file:text-inherit file:transition hover:file:bg-taupe-300 hover:file:text-taupe-950"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Rename File
              <input
                name="fileRename"
                className="border border-taupe-300 bg-taupe-950/20 px-2 py-1 outline-none focus:border-taupe-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Title *
              <input
                name="title"
                required
                className="border border-taupe-300 bg-taupe-950/20 px-2 py-1 outline-none focus:border-taupe-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Description
              <textarea
                name="description"
                rows={3}
                className="resize-none border border-taupe-300 bg-taupe-950/20 px-2 py-1 outline-none focus:border-taupe-100"
              />
            </label>

            <button
              type="submit"
              disabled={isUploading}
              className="border border-taupe-300 px-3 py-1 transition hover:bg-taupe-300 hover:text-taupe-950 disabled:cursor-wait disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Add"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
