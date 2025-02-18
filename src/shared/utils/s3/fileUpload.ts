import { comments } from "../../constants/comments";
import { s3, S3_BUCKET } from "../../config/s3Config";

export const uploadFileToS3 = async (file: File): Promise<string | null> => {
  try {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "video/mp4",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Invalid file type. Only images, PDFs, and MP4 videos are allowed."
      );
      return null;
    }

    const fileKey = `uploads/${Date.now()}-${file.name}`;

    const params = {
      Bucket: S3_BUCKET,
      Key: fileKey,
      Body: file,
      ACL: "public-read",
      ContentType: file.type,
    };

    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location;
  } catch (error) {
    console.error(comments.S3_UPLOAD_ERR, error);
    return null;
  }
};

/*
How to use:
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files && event.target.files.length > 0) {
    const file = event.target.files[0];
    const fileUrl = await uploadFileToS3(file);
    if (fileUrl) {
      console.log("File uploaded successfully:", fileUrl);
    }
  }
};


<input type="file" onChange={handleFileUpload} />
*/
