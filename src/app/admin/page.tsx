import { isAdminAuthenticated } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import Admin from "../(components)/Admin";
import { ImageMetadata, ImageMetadataEnriched } from "@/src/lib/types";
import { enrichMetadata, getMetadata } from "@/src/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }

  const metadata: ImageMetadata[] = await getMetadata();
  const metadataEnriched: ImageMetadataEnriched[] =
    await enrichMetadata(metadata);

  return <Admin metadata={metadata} metadataEnriched={metadataEnriched} />;
}
