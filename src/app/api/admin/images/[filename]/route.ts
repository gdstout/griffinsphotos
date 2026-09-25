import { getMetadata, putMetadata } from "@/src/lib/admin-metadata";
import { isValidAuthToken } from "@/src/lib/auth";
import { NextRequest, NextResponse } from "next/server";

function authorize(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  return token && isValidAuthToken(token);
}

/**
 * Update an existing image's title and/or description
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename } = await params;
  const { title, description } = await request.json();
  const metadata = await getMetadata();

  const image = metadata.find((item) => item.filename === filename);

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  image.title = String(title ?? "").trim();
  image.description = String(description ?? "").trim();

  await putMetadata(metadata);

  return NextResponse.json(image);
}

/**
 * "Remove" an image by deleting it from the metadata. Does not remove it from s3
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename } = await params;
  const metadata = await getMetadata();
  const filteredMetadata = metadata.filter(
    (item) => item.filename !== filename,
  );

  if (filteredMetadata.length === metadata.length) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  await putMetadata(filteredMetadata);

  return NextResponse.json({ ok: true });
}
