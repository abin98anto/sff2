import uploadToCloudinary from "../../config/cloudinaryConfig";

interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  return allowedTypes.includes(file.type) && file.size < 5 * 1024 * 1024;
};

export const validatePdfFile = (file: File): boolean => {
  const allowedTypes = ["application/pdf"];
  return allowedTypes.includes(file.type) && file.size < 10 * 1024 * 1024;
};

export const validateVideoFile = (file: File): boolean => {
  const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
  const maxSize = 100 * 1024 * 1024; // 100 MB
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

const handleFileUpload = async (
  file: File,
  options: {
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    validateFile?: (file: File) => boolean;
  } = {}
): Promise<FileUploadResult> => {
  const { onUploadStart, onUploadEnd, validateFile } = options;

  if (!file) {
    return { success: false, error: "No file selected" };
  }

  if (validateFile && !validateFile(file)) {
    return { success: false, error: "Invalid file" };
  }

  try {
    onUploadStart?.();
    const cloudinaryUrl = await uploadToCloudinary(file);
    onUploadEnd?.();

    return {
      success: true,
      url: cloudinaryUrl,
    };
  } catch (error) {
    console.error("Upload failed", error);
    onUploadEnd?.();

    return {
      success: false,
      error: "Failed to upload file",
    };
  }
};

export default handleFileUpload;
