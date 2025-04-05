import { useEffect, useState } from "react";
import {
  AlertCircle,
  DeleteIcon,
  EditIcon,
  ImageIcon,
  UploadIcon,
} from "lucide-react";

import "../CourseForm.scss";
import Loading from "../../../../../components/common/Loading/Loading";
import ICategory from "../../../../../entities/misc/ICategory";
import ICourse from "../../../../../entities/ICourse";
import comments from "../../../../../shared/constants/comments";
import axiosInstance from "../../../../../shared/config/axiosConfig";
import API from "../../../../../shared/constants/API";
import handleFileUpload, {
  validateImageFile,
} from "../../../../../shared/utils/cloudinary/fileUpload";

interface BasicInformationProps {
  data: ICourse;
  onUpdate: (data: Partial<ICourse>) => void;
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

  // Fetching categories.
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API.CATEGORY_GET);
      if (response.data && response.data.data.data.data) {
        setCategories(response.data.data.data.data);
      } else {
        setError(comments.NO_CAT_RECIVIED);
        setCategories([]);
      }
    } catch (err) {
      console.error(comments.CAT_FETCH_FAIL, err);
      setError(comments.CAT_FETCH_FAIL);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle field value changes.
  const handleChange = (field: keyof ICourse, value: string) => {
    onUpdate({ [field]: value });
  };

  // Upload thumbnail.
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const result = await handleFileUpload(file, {
        validateFile: validateImageFile,
        onUploadStart: () => setIsUploading(true),
        onUploadEnd: () => setIsUploading(false),
      });

      if (result.success && result.url) {
        onUpdate({ thumbnail: result.url });
      } else {
        console.log(comments.IMG_UPLOAD_FAIL, result.error);
        setError(comments.IMG_UPLOAD_FAIL);
      }
    } catch (error) {
      setError(comments.IMG_UPLOAD_FAIL);
      setIsUploading(false);
    }
  };

  // Delete thumbnail.
  const handleDeleteThumbnail = () => {
    onUpdate({ thumbnail: "" });
  };

  // Change thumbnail
  const handleEditThumbnail = () => {
    document.getElementById("thumbnailInput")?.click();
  };

  // Form validation.
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
    if (!data.level.trim()) {
      setError(comments.LEVEL_REQ);
      return false;
    }
    if (!data.thumbnail) {
      setError(comments.THUMBNAIL_REQ);
      return false;
    }
    return true;
  };

  // Handle next button click.
  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <>
      <div className="form-container">
        <div className="form-left">
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

          <div className="form-group double">
            <div>
              <select
                id="category"
                value={data.category as string}
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
                    {comments.NO_CAT_RECIVIED}
                  </option>
                )}
              </select>
              <label htmlFor="category">Course Category</label>
            </div>
            <div>
              <select
                id="level"
                value={data.level}
                onChange={(e) => handleChange("level", e.target.value)}
              >
                <option value="">Select a level...</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <label htmlFor="level">Course Level</label>
            </div>
            <div>
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
          </div>

          <div className="form-group">
            <input
              id="topic"
              type="text"
              value={data.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
              placeholder={comments.TOPIC_PLACEHOLDER}
            />
            <label htmlFor="topic">Course Topic (separated by comma)</label>
          </div>

          <div className="form-group">
            <input
              id="prerequisites"
              type="text"
              value={data.prerequisites}
              onChange={(e) => handleChange("prerequisites", e.target.value)}
              placeholder={comments.PREREQ_PH}
            />
            <label htmlFor="prerequisites">
              Prerequisites (separated by comma)
            </label>
          </div>
          <div className="form-group">
            <textarea
              id="description"
              value={data.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={comments.DESCRIPTION_PLACEHOLDER}
              rows={6}
              maxLength={500}
            />
            <label htmlFor="description">Course Description</label>
            <div className="character-count">
              <AlertCircle size={12} />
              <span>{data.description.length}/500</span>
            </div>
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
                <label className="upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    style={{ display: "none" }}
                    id="thumbnailInput"
                  />
                  <UploadIcon size={16} />
                  Upload Thumbnail
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="button-group">
        <button onClick={onCancel} className="secondary">
          Cancel
        </button>
        <button onClick={handleNext} className="primary" disabled={isUploading}>
          Save & Next
        </button>
      </div>
    </>
  );
};

export default BasicInformation;
