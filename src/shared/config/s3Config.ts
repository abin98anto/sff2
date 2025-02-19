import { S3Client } from "@aws-sdk/client-s3";

export const S3_BUCKET = import.meta.env.VITE_AWS_BUCKET;
export const REGION = import.meta.env.VITE_AWS_REGION;
const ACCESS_KEY = import.meta.env.VITE_AWS_ACCESS;
const SECRET_KEY = import.meta.env.VITE_AWS_SECRET;

export const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});
