import { ImageMetadata, ImageMetadataEnriched } from "@/src/lib/types";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const metadata: ImageMetadata[] = body.metadata;

    if (!metadata) {
      return NextResponse.json(
        { error: "Missing request body" },
        { status: 400 },
      );
    }

    const enrichedImageMetadata = await Promise.all(
      metadata.map(async (img) => {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `images/${img.filename}`,
        });

        try {
          const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
          return {
            ...img,
            urlInfo: { url, expiresIn: 3600 },
          };
        } catch (e) {
          console.error(
            `Failed fetching signed URL for images/${img.filename}`,
          );
        }
      }),
    );

    return NextResponse.json(enrichedImageMetadata);
  } catch (e) {
    return NextResponse.json(
      { error: "Error fetching signed URLs!", e },
      { status: 400 },
    );
  }
}
