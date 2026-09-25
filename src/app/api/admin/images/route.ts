import { ImageMetadata } from "@/src/lib/types";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { isValidAuthToken } from "@/src/lib/auth";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

const bucket = process.env.AWS_BUCKET_NAME;

function normalizeFilename(filename: string) {
  return filename
    .trim()
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "");
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token || !isValidAuthToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!bucket) {
    return NextResponse.json(
      { error: "AWS_BUCKET_NAME is not configured" },
      { status: 500 },
    );
  }

  let uploadedKey: string | null = null;

  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const filenameInput = String(formData.get("fileRename") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { error: "An image is required" },
        { status: 400 },
      );
    }

    const filename = normalizeFilename(filenameInput);

    if (!filename) {
      return NextResponse.json(
        { error: "A valid filename is required" },
        { status: 400 },
      );
    }

    const extension = image.name.match(/\.[^/.]+$/)?.[0].toLowerCase() ?? "";
    const finalFilename = `${filename}${extension}`;

    const metadataResponse = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: "metadata.json",
      }),
    );

    const metadata: ImageMetadata[] = JSON.parse(
      await metadataResponse.Body!.transformToString(),
    );

    const filenameExists = metadata.some(
      (item) => item.filename.toLowerCase() === finalFilename.toLowerCase(),
    );

    if (filenameExists) {
      return NextResponse.json(
        { error: "An image with that filename already exists" },
        { status: 409 },
      );
    }

    uploadedKey = finalFilename;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `images/${uploadedKey}`,
        Body: Buffer.from(await image.arrayBuffer()),
        ContentType: image.type || "application/octet-stream",
      }),
    );

    const newMetadata: ImageMetadata = {
      filename: finalFilename,
      title,
      description,
    };

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: "metadata.json",
        Body: JSON.stringify([...metadata, newMetadata], null, 2),
        ContentType: "application/json",
      }),
    );

    return NextResponse.json(newMetadata, { status: 201 });
  } catch (error) {
    if (uploadedKey) {
      await s3
        .send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: uploadedKey,
          }),
        )
        .catch(() => undefined);
    }

    console.error("Error uploading image:", error);

    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
