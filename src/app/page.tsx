import { getImageUrl, getMetadata } from "../lib/api";
import { ImageMetadata } from "../lib/types";
import GallerySingle from "./(components)/GallerySingle";

export const dynamic = "force-dynamic";

export function shuffle<T>(array: T[]) {
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ image?: string }>;
}) {
  const params = await searchParams;
  let queryParamImage = undefined;

  const metadata: ImageMetadata[] = await getMetadata();
  shuffle(metadata);

  if (params.image) {
    const i = metadata.findIndex((item) => item.filename === params.image);
    if (i >= 0) {
      [metadata[i], metadata[0]] = [metadata[0], metadata[i]];
      queryParamImage = true;
    } else {
      queryParamImage = false;
    }
  }

  const firstImg = await getImageUrl(metadata[0].filename);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <GallerySingle
        metadata={metadata}
        imgUrl={firstImg}
        queryParamImage={queryParamImage}
      />
    </div>
  );
}
