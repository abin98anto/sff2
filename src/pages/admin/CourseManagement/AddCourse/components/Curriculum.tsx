import { useState, useEffect } from "react";
import {
  EditIcon,
  TrashIcon,
  PlusIcon,
  UploadIcon,
  XIcon,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "../CourseForm.scss";
import { ICourse, ISection, ILesson } from "../../../../../entities/ICourse";
import {
  handleFileUpload,
  validatePdfFile,
  validateVideoFile,
} from "../../../../../shared/utils/cloudinary/fileUpload";
import { comments } from "../../../../../shared/constants/comments";
import { axiosInstance } from "../../../../../shared/config/axiosConfig";
import { API } from "../../../../../shared/constants/API";
import AddModal from "../../../../../components/common/Modal/AddModal/AddModal";

interface CurriculumProps {
  data: ISection[];
  onUpdate: (data: ISection[]) => void;
  onPrevious: () => void;
  onCancel: () => void;
  setError: (error: string) => void;
  courseFormData: ICourse;
}

const Curriculum = ({
  data,
  onUpdate,
  onPrevious,
  onCancel,
  setError,
  courseFormData,
}: CurriculumProps) => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<ISection[]>(data || []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(
    null
  );
  const [editingLessonId, setEditingLessonId] = useState<
    string | number | null
  >(null);
  const [deletingItemType, setDeletingItemType] = useState<
    "section" | "lesson" | null
  >(null);
  const [editingName, setEditingName] = useState("");
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonVideo, setNewLessonVideo] = useState<File | null>(null);
  const [newLessonPdfs, setNewLessonPdfs] = useState<File[]>([]);
  const [newLessonDuration, setNewLessonDuration] = useState<number>(0); // New field for duration
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPdfs, setUploadingPdfs] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setSections(data || []);
  }, [data]);

  const calculateSectionDuration = (lessons: ILesson[]): number => {
    return lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  };

  const addSection = () => {
    const newSection: ISection = {
      name: "New Section",
      lessons: [],
      duration: 0,
    };
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    onUpdate(updatedSections);
  };

  const handleEditClick = (section: ISection, sectionIndex: number) => {
    setEditingSectionIndex(sectionIndex);
    setEditingName(section.name);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingSectionIndex === null) return;

    const updatedSections = sections.map((section, index) =>
      index === editingSectionIndex
        ? { ...section, name: editingName }
        : section
    );

    setSections(updatedSections);
    onUpdate(updatedSections);
    setIsEditModalOpen(false);
    setEditingSectionIndex(null);
    setEditingName("");
  };

  const handleAddLessonClick = (sectionIndex: number) => {
    setEditingSectionIndex(sectionIndex);
    setIsAddLessonModalOpen(true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateVideoFile(file)) {
      setNewLessonVideo(file);
      // Optionally, estimate duration from file metadata if available
      setNewLessonDuration(0); // Placeholder; update if duration is provided
    } else {
      setError(comments.INVALID_VIDEO);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validPdfs = Array.from(files).filter(validatePdfFile);
      setNewLessonPdfs((prev) => [...prev, ...validPdfs]);
    }
  };

  const handleRemovePdf = (index: number) => {
    setNewLessonPdfs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateLesson = async () => {
    if (!newLessonName.trim()) {
      setError(comments.LESSON_REQ);
      return;
    }

    if (!newLessonVideo) {
      setError(comments.VIDEO_REQ);
      return;
    }

    setUploadingVideo(true);
    const videoUploadResult = await handleFileUpload(newLessonVideo, {
      onUploadStart: () => setUploadingVideo(true),
      onUploadEnd: () => setUploadingVideo(false),
      validateFile: validateVideoFile,
    });

    if (!videoUploadResult.success) {
      console.log(comments.VIDEO_UPLOAD_FAIL, videoUploadResult.error);
      setError(comments.VIDEO_UPLOAD_FAIL);
      return;
    }

    setUploadingPdfs(true);
    const pdfUploadPromises = newLessonPdfs.map((pdf) =>
      handleFileUpload(pdf, { validateFile: validatePdfFile })
    );
    const pdfUploadResults = await Promise.all(pdfUploadPromises);
    setUploadingPdfs(false);

    const pdfUrls = pdfUploadResults
      .filter((result) => result.success)
      .map((result) => result.url as string);

    const newLesson: ILesson = {
      name: newLessonName,
      videoUrl: videoUploadResult.url as string,
      pdfUrls,
      duration: newLessonDuration, // Use user-provided duration
    };

    const updatedSections = sections.map((section, index) =>
      index === editingSectionIndex
        ? {
            ...section,
            lessons: [...section.lessons, newLesson],
            duration: calculateSectionDuration([...section.lessons, newLesson]),
          }
        : section
    );

    setSections(updatedSections);
    onUpdate(updatedSections);
    setIsAddLessonModalOpen(false);
    resetLessonForm();
  };

  const resetLessonForm = () => {
    setNewLessonName("");
    setNewLessonVideo(null);
    setNewLessonPdfs([]);
    setNewLessonDuration(0);
    setEditingSectionIndex(null);
    setEditingLessonId(null);
  };

  const validateForm = () => {
    if (sections.length === 0) {
      setError(comments.SECTION_REQ);
      return false;
    }
    for (const section of sections) {
      if (section.lessons.length === 0) {
        setError(comments.LESSON_REQ2);
        return false;
      }
    }
    return true;
  };

  const prepareCourseDataForBackend = (formData: ICourse) => {
    return {
      ...formData,
      curriculum: formData.curriculum,
      totalLessons: formData.curriculum.reduce(
        (total, section) => total + section.lessons.length,
        0
      ),
      totalDuration: formData.curriculum.reduce(
        (total, section) => total + section.duration,
        0
      ),
    };
  };

  const handlePublish = async () => {
    if (validateForm()) {
      try {
        setPublishing(true);
        const formattedData = prepareCourseDataForBackend(courseFormData);
        const response = await axiosInstance.post(
          API.COURSE_ADD,
          formattedData
        );
        console.log(comments.COURSE_PUB_SUCC, response.data);
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          navigate(API.COURSE_MNGMT);
        }, 4000);
      } catch (error) {
        console.error(comments.COURSE_PUB_FAIL, error);
        setError(comments.COURSE_PUB_FAIL);
      } finally {
        setPublishing(false);
      }
    }
  };

  const handleEditLessonClick = (
    sectionIndex: number,
    lessonId: string | number
  ) => {
    setEditingSectionIndex(sectionIndex);
    setEditingLessonId(lessonId);
    const section = sections[sectionIndex];
    const lesson = section?.lessons.find((l) => l._id === lessonId);
    if (lesson) {
      setNewLessonName(lesson.name);
      setNewLessonPdfs([]);
      setNewLessonDuration(lesson.duration);
      setIsEditLessonModalOpen(true);
    }
  };

  const handleUpdateLesson = async () => {
    if (!newLessonName.trim()) {
      setError(comments.LESSON_REQ);
      return;
    }

    let videoUrl = sections[editingSectionIndex!]?.lessons.find(
      (l) => l._id === editingLessonId
    )?.videoUrl;
    if (newLessonVideo) {
      setUploadingVideo(true);
      const videoUploadResult = await handleFileUpload(newLessonVideo, {
        onUploadStart: () => setUploadingVideo(true),
        onUploadEnd: () => setUploadingVideo(false),
        validateFile: validateVideoFile,
      });

      if (!videoUploadResult.success) {
        console.log(comments.VIDEO_UPLOAD_FAIL, videoUploadResult.error);
        setError(comments.VIDEO_UPLOAD_FAIL);
        return;
      }
      videoUrl = videoUploadResult.url as string;
    }

    setUploadingPdfs(true);
    const pdfUploadPromises = newLessonPdfs.map((pdf) =>
      handleFileUpload(pdf, { validateFile: validatePdfFile })
    );
    const pdfUploadResults = await Promise.all(pdfUploadPromises);
    setUploadingPdfs(false);

    const newPdfUrls = pdfUploadResults
      .filter((result) => result.success)
      .map((result) => result.url as string);

    const updatedSections = sections.map((section, index) => {
      if (index === editingSectionIndex) {
        const updatedLessons = section.lessons.map((lesson) => {
          if (lesson._id === editingLessonId) {
            return {
              ...lesson,
              name: newLessonName,
              videoUrl: videoUrl || lesson.videoUrl,
              pdfUrls: [...lesson.pdfUrls, ...newPdfUrls],
              duration: newLessonDuration,
            };
          }
          return lesson;
        });
        return {
          ...section,
          lessons: updatedLessons,
          duration: calculateSectionDuration(updatedLessons),
        };
      }
      return section;
    });

    setSections(updatedSections);
    onUpdate(updatedSections);
    setIsEditLessonModalOpen(false);
    resetLessonForm();
  };

  const handleRemoveExistingPdf = (
    sectionIndex: number,
    lessonId: string | number,
    pdfUrl: string
  ) => {
    const updatedSections = sections.map((section, index) => {
      if (index === sectionIndex) {
        const updatedLessons = section.lessons.map((lesson) => {
          if (lesson._id === lessonId) {
            return {
              ...lesson,
              pdfUrls: lesson.pdfUrls.filter((url) => url !== pdfUrl),
            };
          }
          return lesson;
        });
        return {
          ...section,
          lessons: updatedLessons,
          duration: calculateSectionDuration(updatedLessons),
        };
      }
      return section;
    });

    setSections(updatedSections);
    onUpdate(updatedSections);
  };

  const handleDeleteClick = (
    type: "section" | "lesson",
    sectionIndex: number,
    lessonId?: string | number
  ) => {
    setEditingSectionIndex(sectionIndex);
    setEditingLessonId(lessonId || null);
    setDeletingItemType(type);
    setIsDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingItemType === "section") {
      const updatedSections = sections.filter(
        (_, index) => index !== editingSectionIndex
      );
      setSections(updatedSections);
      onUpdate(updatedSections);
    } else if (
      deletingItemType === "lesson" &&
      editingSectionIndex !== null &&
      editingLessonId
    ) {
      const updatedSections = sections.map((section, index) => {
        if (index === editingSectionIndex) {
          const updatedLessons = section.lessons.filter(
            (lesson) => lesson._id !== editingLessonId
          );
          return {
            ...section,
            lessons: updatedLessons,
            duration: calculateSectionDuration(updatedLessons),
          };
        }
        return section;
      });
      setSections(updatedSections);
      onUpdate(updatedSections);
    }
    setIsDeleteConfirmationOpen(false);
    setDeletingItemType(null);
    setEditingSectionIndex(null);
    setEditingLessonId(null);
  };

  return (
    <div className="form-section">
      <h2>Course Curriculum</h2>

      <div className="curriculum-section">
        {sections.map((section: ISection, sectionIndex) => (
          <div key={section._id || sectionIndex} className="section-item">
            <div className="section-header">
              <h3>
                Section {String(sectionIndex + 1).padStart(2, "0")}:{" "}
                {section.name}
              </h3>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleAddLessonClick(sectionIndex)}>
                  <PlusIcon size={16} />
                </button>
                <button onClick={() => handleEditClick(section, sectionIndex)}>
                  <EditIcon size={16} />
                </button>
                <button
                  onClick={() => handleDeleteClick("section", sectionIndex)}
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
            {section.lessons.map((lesson, index) => (
              <div key={lesson._id || index} className="lecture-item">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>
                    Lecture {String(index + 1).padStart(2, "0")}: {lesson.name}{" "}
                    ({lesson.duration}s)
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() =>
                      handleEditLessonClick(sectionIndex, lesson._id || index)
                    }
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteClick(
                        "lesson",
                        sectionIndex,
                        lesson._id || index
                      )
                    }
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button className="add-section-button" onClick={addSection}>
        Add Section
      </button>

      {isEditModalOpen && (
        <AddModal
          isOpen={isEditModalOpen}
          title="Edit Section Name"
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSaveEdit}
        >
          <div className="input-group">
            <label htmlFor="sectionName">Name</label>
            <input
              id="sectionName"
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="input-group"
            />
          </div>
        </AddModal>
      )}

      {isAddLessonModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Add New Lesson</h2>
            <div className="input-group">
              <label htmlFor="lessonName">Lesson Name</label>
              <input
                id="lessonName"
                type="text"
                value={newLessonName}
                onChange={(e) => setNewLessonName(e.target.value)}
                className="input-group"
              />
            </div>
            <div className="input-group">
              <label htmlFor="lessonDuration">Duration (seconds)</label>
              <input
                id="lessonDuration"
                type="number"
                value={newLessonDuration}
                onChange={(e) =>
                  setNewLessonDuration(parseInt(e.target.value) || 0)
                }
                className="input-group"
              />
            </div>
            <div className="input-group">
              <label htmlFor="lessonVideo">Upload Video</label>
              <div className="upload-button">
                <input
                  id="lessonVideo"
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleVideoUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="lessonVideo">
                  <UploadIcon size={16} />
                  {newLessonVideo ? "Change Video" : "Upload Video"}
                </label>
                {newLessonVideo && <p>{newLessonVideo.name}</p>}
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="lessonPdfs">Upload PDFs</label>
              <div className="upload-button">
                <input
                  id="lessonPdfs"
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handlePdfUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="lessonPdfs">
                  <UploadIcon size={16} />
                  Upload PDFs
                </label>
              </div>
              <div className="file-list">
                {newLessonPdfs.map((pdf, index) => (
                  <div key={index} className="file-item">
                    <span>{pdf.name}</span>
                    <button onClick={() => handleRemovePdf(index)}>
                      <XIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-button-group">
              <button onClick={() => setIsAddLessonModalOpen(false)}>
                Cancel
              </button>
              <button
                onClick={handleCreateLesson}
                disabled={uploadingVideo || uploadingPdfs}
              >
                {uploadingVideo || uploadingPdfs
                  ? comments.UPLOADING
                  : comments.ADD_LESSSON}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditLessonModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Edit Lesson</h2>
            <div className="input-group">
              <label htmlFor="editLessonName">Lesson Name</label>
              <input
                id="editLessonName"
                type="text"
                value={newLessonName}
                onChange={(e) => setNewLessonName(e.target.value)}
                className="input-group"
              />
            </div>
            <div className="input-group">
              <label htmlFor="editLessonDuration">Duration (seconds)</label>
              <input
                id="editLessonDuration"
                type="number"
                value={newLessonDuration}
                onChange={(e) =>
                  setNewLessonDuration(parseInt(e.target.value) || 0)
                }
                className="input-group"
              />
            </div>
            <div className="input-group">
              <label htmlFor="editLessonVideo">Change Video</label>
              <div className="upload-button">
                <input
                  id="editLessonVideo"
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleVideoUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="editLessonVideo">
                  <UploadIcon size={16} />
                  {newLessonVideo
                    ? comments.VIDEO_CHANGE
                    : comments.VIDEO_UPLOAD}
                </label>
                {newLessonVideo && <p>{newLessonVideo.name}</p>}
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="editLessonPdfs">Add PDFs</label>
              <div className="upload-button">
                <input
                  id="editLessonPdfs"
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handlePdfUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="editLessonPdfs">
                  <UploadIcon size={16} />
                  Add PDFs
                </label>
              </div>
              <div className="file-list">
                {sections[editingSectionIndex!]?.lessons
                  .find((l) => l._id === editingLessonId)
                  ?.pdfUrls.map((pdfUrl, index) => (
                    <div key={index} className="file-item">
                      <span>{pdfUrl.split("/").pop()}</span>
                      <button
                        onClick={() =>
                          handleRemoveExistingPdf(
                            editingSectionIndex!,
                            editingLessonId!,
                            pdfUrl
                          )
                        }
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  ))}
                {newLessonPdfs.map((pdf, index) => (
                  <div key={`new-${index}`} className="file-item">
                    <span>{pdf.name}</span>
                    <button onClick={() => handleRemovePdf(index)}>
                      <XIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-button-group">
              <button onClick={() => setIsEditLessonModalOpen(false)}>
                Cancel
              </button>
              <button
                onClick={handleUpdateLesson}
                disabled={uploadingVideo || uploadingPdfs}
              >
                {uploadingVideo || uploadingPdfs
                  ? comments.UPLOADING
                  : comments.LESSON_UPDATE}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmationOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Confirm Deletion</h2>
            <p>Are you sure you want to delete this {deletingItemType}?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-button-group">
              <button onClick={() => setIsDeleteConfirmationOpen(false)}>
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{ backgroundColor: "red", color: "white" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{
              background: "linear-gradient(135deg, #4CAF50, #45a049)",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              color: "white",
              textAlign: "center",
            }}
          >
            <CheckCircle size={64} style={{ marginBottom: "1rem" }} />
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Course Created Successfully!
            </h2>
            <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>
              Your course has been published. Redirecting to course
              management...
            </p>
            <div
              style={{
                width: "100%",
                height: "4px",
                background: "rgba(255, 255, 255, 0.3)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "white",
                  animation: "progress 4s linear",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="button-group">
        <div>
          <button
            onClick={onCancel}
            className="secondary"
            style={{ marginRight: "1rem" }}
          >
            Cancel
          </button>
          <button onClick={onPrevious} className="secondary">
            Back
          </button>
        </div>
        <button
          onClick={handlePublish}
          className="primary"
          disabled={publishing}
        >
          {publishing ? comments.PUBLISHING : comments.COURSE_PUB}
        </button>
      </div>
    </div>
  );
};

export default Curriculum;
