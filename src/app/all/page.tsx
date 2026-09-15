import { enrichMetadata, getMetadata } from "@/src/lib/api";
import { ImageMetadata } from "@/src/lib/types";
import { shuffle } from "../page";
import GalleryAll from "../(components)/GalleryAll";

export default async function All() {
  const metadata: ImageMetadata[] = await getMetadata();
  shuffle(metadata);

  const metadataEnriched = await enrichMetadata(metadata);

  return <GalleryAll metadataEnriched={metadataEnriched} />;
}
