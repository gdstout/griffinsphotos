import axios from "axios";
import { ImageMetadata, ImageUrlResponse } from "./types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getMetadata(): Promise<ImageMetadata[]> {
  const response = await api.get<ImageMetadata[]>("/metadata");

  return response.data;
}

export async function getImageUrl(filename: string): Promise<string> {
  const response = await api.get<ImageUrlResponse>(
    `/image?img=${encodeURIComponent(filename)}`,
  );

  return response.data.url;
}
