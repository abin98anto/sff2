import { s3, S3_BUCKET } from "../../config/s3Config";
import { comments } from "../../constants/comments";

export const deleteFileFromS3 = async (fileUrl: string): Promise<boolean> => {
  try {
    const urlParts = new URL(fileUrl);
    const fileKey = urlParts.pathname.substring(1);

    const params = {
      Bucket: S3_BUCKET,
      Key: fileKey,
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error(comments.S3_DELETE_ERR, error);
    return false;
  }
};
