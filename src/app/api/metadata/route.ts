import { getMetadata } from "@/src/lib/admin-metadata";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const metadata = await getMetadata();

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error fetching metadata from S3:", error);

    return NextResponse.json(
      { error: `Error fetching metadata! ${error}` },
      { status: 500 },
    );
  }
}
