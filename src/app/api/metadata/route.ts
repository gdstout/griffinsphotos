import { ImageMetadata } from "@/src/lib/types";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { NextResponse } from "next/server";

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION
});

export async function GET() {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: "metadata.json",
        });

        const res = await s3.send(command);
        const metadata: ImageMetadata[] = JSON.parse(await res.Body!.transformToString());

        return NextResponse.json(metadata);
    } catch (error) {
        console.error("Error fetching metadata from S3: ", error);
        return NextResponse.json({error: "Error fetching metadata!"}, {status: 500})
    }
}