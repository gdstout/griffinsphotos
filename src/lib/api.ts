import axios from "axios";
import {
  ImageMetadata,
  ImageMetadataEnriched,
  ImageUrlResponse,
} from "./types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @returns metadata.json as array of image metadata
 */
export async function getMetadata(): Promise<ImageMetadata[]> {
  const response = await api.get<ImageMetadata[]>("/metadata");

  return response.data;
}

/**
 *
 * @param filename
 * @returns signed URL for loading an image
 */
export async function getImageUrl(filename: string): Promise<string> {
  const response = await api.get<ImageUrlResponse>(
    `/image?img=${encodeURIComponent(filename)}`,
  );

  return response.data.url;
}

/**
 *
 */
export async function enrichMetadata(
  metadata: ImageMetadata[],
): Promise<ImageMetadataEnriched[]> {
  const response = await api.post<ImageMetadataEnriched[]>(`/all-image-urls`, {
    metadata,
  });

  return response.data;
}
