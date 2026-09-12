import Image from "next/image";
import { getImageUrl, getMetadata } from "../lib/api";
import { ImageMetadata } from "../lib/types";

export default async function Home() {
  const metadata: ImageMetadata[] = await getMetadata();
  const imageUrl: string = await getImageUrl("lookout.JPEG");

  return (
    <div>
      <Image alt="Hello, world!" src={imageUrl} fill={true} />
    </div>
  );
}
