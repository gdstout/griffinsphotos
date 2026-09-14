import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const fileName = searchParams.get("img");

  if (!fileName) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ url, expiresIn: 3600 });
  } catch (error) {
    console.error("Error getting image URL: ", error);
    return NextResponse.json(
      { error: "Error creating image URL" },
      { status: 500 },
    );
  }
}
