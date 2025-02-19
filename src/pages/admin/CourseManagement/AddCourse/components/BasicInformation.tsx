import { useEffect, useState } from "react";
import type { BasicInfo } from "../form-types";
import "../CourseForm.scss";
import { axiosInstance } from "../../../../../shared/config/axiosConfig";
import { API } from "../../../../../shared/constants/API";
import { comments } from "../../../../../shared/constants/comments";
import { ICategory } from "../../../../../entities/misc/ICategory";
import Loading from "../../../../../components/common/Loading/Loading";
import {
  handleFileUpload,
  validateImageFile,
} from "../../../../../shared/utils/cloudinary/fileUpload";
import {
  AlertCircle,
  DeleteIcon,
  EditIcon,
  ImageIcon,
  UploadIcon,
} from "lucide-react";

interface BasicInformationProps {
  data: BasicInfo;
  onUpdate: (data: Partial<BasicInfo>) => void;
  onNext: () => void;
  onCancel: () => void;
  setError: (error: string) => void;
}

const BasicInformation = ({
  data,
  onUpdate,
  onNext,
  onCancel,
  setError,
}: BasicInformationProps) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API.CATEGORY_GET);
      if (response.data && response.data.data.data.data) {
        setCategories(response.data.data.data.data);
      } else {
        setError(comments.NO_CAT_RECIVIED);
      }
    } catch (err) {
      console.error(comments.CAT_FETCH_FAIL, err);
      setError(comments.CAT_FETCH_FAIL);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof BasicInfo, value: string) => {
    onUpdate({ [field]: value });
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await handleFileUpload(file, {
        validateFile: validateImageFile,
        onUploadStart: () => setIsUploading(true),
        onUploadEnd: () => setIsUploading(false),
      });

      if (result.success && result.url) {
        onUpdate({
          thumbnail: result.url,
        });
      } else {
        console.log(comments.IMG_UPLOAD_FAIL, result.error);
        setError(comments.IMG_UPLOAD_FAIL);
      }
    } catch (error) {
      setError(comments.IMG_UPLOAD_FAIL);
      setIsUploading(false);
    }
  };

  const handleDeleteThumbnail = () => {
    onUpdate({
      thumbnail: "",
    });
  };

  const handleEditThumbnail = () => {
    document.getElementById("thumbnailInput")?.click();
  };

  const validateForm = () => {
    if (!data.title.trim()) {
      setError(comments.TITLE_REQ);
      return false;
    }
    if (!data.subtitle.trim()) {
      setError(comments.SUBTITLE_REQ);
      return false;
    }
    if (!data.category) {
      setError(comments.CAT_REQ);
      return false;
    }
    if (!data.topic.trim()) {
      setError(comments.TOPIC_REQ);
      return false;
    }
    if (!data.language) {
      setError(comments.LANG_REQ);
      return false;
    }
    if (!data.description.trim()) {
      setError(comments.DESCRIPTION_RQ);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="form-container">
      <div className="form-left">
        <h2>Basic Information</h2>

        <div className="form-group">
          <input
            id="title"
            type="text"
            value={data.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Your course title"
            maxLength={80}
          />
          <label htmlFor="title">Title</label>
          <div className="character-count">
            <AlertCircle size={12} />
            <span>{data.title.length}/80</span>
          </div>
        </div>

        <div className="form-group">
          <input
            id="subtitle"
            type="text"
            value={data.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            placeholder="Your course subtitle"
            maxLength={120}
          />
          <label htmlFor="subtitle">Subtitle</label>
          <div className="character-count">
            <AlertCircle size={12} />
            <span>{data.subtitle.length}/120</span>
          </div>
        </div>

        <div className="form-group">
          <select
            id="category"
            value={data.category}
            onChange={(e) => handleChange("category", e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select a category...</option>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {isLoading ? "Loading categories..." : comments.NO_CAT_RECIVIED}
              </option>
            )}
          </select>
          <label htmlFor="category">Course Category</label>
        </div>

        <div className="form-group">
          <input
            id="topic"
            type="text"
            value={data.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
            placeholder={comments.TOPIC_PLACEHOLDER}
          />
          <label htmlFor="topic">Course Topic</label>
        </div>

        <div className="form-group">
          <select
            id="language"
            value={data.language}
            onChange={(e) => handleChange("language", e.target.value)}
          >
            <option value="">Select a language...</option>
            <option value="english">English</option>
            <option value="malayalam">Malayalam</option>
            <option value="hindi">Hindi</option>
          </select>
          <label htmlFor="language">Course Language</label>
        </div>

        <div className="form-group">
          <textarea
            id="description"
            value={data.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={comments.DESCRIPTION_PLACEHOLDER}
            rows={6}
          />
          <label htmlFor="description">Course Description</label>
          <div className="character-count">
            <AlertCircle size={12} />
            <span>{data.description.length}/500</span>
          </div>
        </div>

        <div className="button-group">
          <button onClick={onCancel} className="secondary">
            Cancel
          </button>
          <button
            onClick={handleNext}
            className="primary"
            disabled={isUploading}
          >
            Save & Next
          </button>
        </div>
      </div>

      <div className="form-right">
        <div className="thumbnail-section">
          {data.thumbnail ? (
            <div className="thumbnail-display">
              <img
                src={data.thumbnail}
                alt="Course Thumbnail"
                className="thumbnail-img"
              />
              <div className="thumbnail-buttons">
                <button onClick={handleEditThumbnail} className="edit-button">
                  <EditIcon size={16} />
                </button>
                <button
                  onClick={handleDeleteThumbnail}
                  className="delete-button"
                >
                  <DeleteIcon size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-section">
              <div className="upload-icon">
                <ImageIcon size={48} />
              </div>
              <div className="upload-text">
                {isUploading ? <Loading /> : comments.THUMBNAIL_DEFAULT}
              </div>
            </div>
          )}
          <label className="upload-button">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              style={{ display: "none" }}
              id="thumbnailInput"
            />
            <UploadIcon size={16} />
            {isUploading ? "Uploading..." : "Upload Thumbnail"}
          </label>
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;
