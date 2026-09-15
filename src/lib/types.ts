export interface ImageMetadata {
  filename: string;
  title: string;
  description: string;
}

export interface ImageMetadataEnriched extends ImageMetadata {
  urlInfo: ImageUrlResponse;
}

export interface ImageUrlResponse {
  url: string;
  expiresIn: number;
}
