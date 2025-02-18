import AWS from "aws-sdk";

export const S3_BUCKET = import.meta.env.VITE_AWS_BUCKET;
const REGION = import.meta.env.VITE_AWS_REGION;
const ACCESS_KEY = import.meta.env.VITE_AWS_ACCESS;
const SECRET_KEY = import.meta.env.VITE_AWS_SECRET;

AWS.config.update({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
  region: REGION,
});

export const s3 = new AWS.S3();
