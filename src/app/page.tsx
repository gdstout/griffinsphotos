import { getImageUrl, getMetadata } from "../lib/api";
import { ImageMetadata } from "../lib/types";
import GallerySingle from "./(components)/GallerySingle";

export const dynamic = "force-dynamic";

function shuffle<T>(array: T[]) {
  let currentIndex = array.length;
  let randomIndex: number;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

export default async function Home() {
  const metadata: ImageMetadata[] = await getMetadata();
  shuffle(metadata);

  const firstImg = await getImageUrl(metadata[0].filename);

  return <GallerySingle metadata={metadata} imgUrl={firstImg} />;
}
