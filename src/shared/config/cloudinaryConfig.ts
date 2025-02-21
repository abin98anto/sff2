import axios from "axios";
import comments from "../constants/comments";
import API from "../constants/API";

const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    const response = await axios.post(API.CLOUDI_UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(comments.FILE_UPLOAD_SUCC);
    return response.data.secure_url;
  } catch (error) {
    console.error(comments.FILE_UPLOAD_FAIL, error);
    throw new Error(comments.FILE_UPLOAD_FAIL);
  }
};

export default uploadToCloudinary;
