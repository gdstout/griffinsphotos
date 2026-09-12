import Image from "next/image";
import { getImageUrl, getMetadata } from "../lib/api";
import { ImageMetadata } from "../lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let imageUrl = "";
  try {
    const metadata: ImageMetadata[] = await getMetadata();
    imageUrl = await getImageUrl("lookout.JPEG");
  } catch (error) {
    console.log("Error fetching data:", error);
  }

  if (imageUrl !== "") {
    return (
      <div>
        <Image alt="Hello, world!" src={imageUrl} fill={true} />
      </div>
    );
  } else {
    return <div>Error</div>;
  }
}
