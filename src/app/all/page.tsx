import { getMetadata } from "@/src/lib/api";
import { ImageMetadata } from "@/src/lib/types";
import { shuffle } from "../page";

export default async function All() {
  const metadata: ImageMetadata[] = await getMetadata();
  shuffle(metadata);

  return <div>Hello!</div>;
}
