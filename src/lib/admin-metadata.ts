import { ImageMetadata } from "@/src/lib/types";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucket = process.env.AWS_BUCKET_NAME;

export async function getMetadata(): Promise<ImageMetadata[]> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: "metadata.json",
    }),
  );

  return JSON.parse(await response.Body!.transformToString());
}

export async function putMetadata(metadata: ImageMetadata[]) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: "metadata.json",
      Body: JSON.stringify(metadata, null, 2),
      ContentType: "application/json",
    }),
  );
}