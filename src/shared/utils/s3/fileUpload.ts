import s3, { S3_BUCKET, REGION } from "../../config/s3Config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const uploadFileToS3 = async (file: File): Promise<string | null> => {
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

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: fileKey,
        ContentType: file.type,
      }),
      { expiresIn: 60 }
    );

    console.log("Upload URL:", uploadUrl);

    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    console.log("response ...", response);

    if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

    return `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${fileKey}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return null;
  }
};

export default uploadFileToS3;

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
