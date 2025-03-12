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
import AddModal from "../../../../../components/common/Modal/AddModal/AddModal";
import ICourse, { ISection, ILesson } from "../../../../../entities/ICourse";
import handleFileUpload, {
  validatePdfFile,
  validateVideoFile,
} from "../../../../../shared/utils/cloudinary/fileUpload";
import comments from "../../../../../shared/constants/comments";
import axiosInstance from "../../../../../shared/config/axiosConfig";
import API from "../../../../../shared/constants/API";
import Loading from "../../../../../components/common/Loading/Loading";
import CustomModal from "../../../../../components/common/Modal/CustomModal/CustomModal";

interface CurriculumProps {
  data: ISection[];
  onUpdate: (data: ISection[]) => void;
  onPrevious: () => void;
  onCancel: () => void;
  setError: (error: string) => void;
  courseFormData: ICourse;
  isEditMode?: boolean;
  showSnackbar?: (message: string, severity: "success" | "error") => void;
}

const Curriculum = ({
  data,
  onUpdate,
  onPrevious,
  onCancel,
  setError,
  courseFormData,
  isEditMode = false,
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
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [deletingItemType, setDeletingItemType] = useState<
    "section" | "lesson" | null
  >(null);
  const [editingName, setEditingName] = useState("");
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonVideo, setNewLessonVideo] = useState<File | null>(null);
  const [newLessonPdfs, setNewLessonPdfs] = useState<File[]>([]);
  const [_, setNewLessonDuration] = useState<number>(0);
  const [publishing, setPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSections(data || []);
  }, [data]);

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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateVideoFile(file)) {
      setNewLessonVideo(file);
      await updateLessonDuration(file);
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

    // Extract video duration
    const videoDuration = await updateLessonDuration(newLessonVideo);

    setIsLoading(true);
    const videoUploadResult = await handleFileUpload(newLessonVideo, {
      onUploadStart: () => setIsLoading(true),
      onUploadEnd: () => setIsLoading(false),
      validateFile: validateVideoFile,
    });

    if (!videoUploadResult.success) {
      console.log(comments.VIDEO_UPLOAD_FAIL, videoUploadResult.error);
      setError(comments.VIDEO_UPLOAD_FAIL);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const pdfUploadPromises = newLessonPdfs.map((pdf) =>
      handleFileUpload(pdf, { validateFile: validatePdfFile })
    );
    const pdfUploadResults = await Promise.all(pdfUploadPromises);
    setIsLoading(false);

    const pdfUrls = pdfUploadResults
      .filter((result) => result.success)
      .map((result) => result.url as string);

    const newLessonId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newLesson: ILesson = {
      _id: newLessonId,
      name: newLessonName,
      videoUrl: videoUploadResult.url as string,
      pdfUrls,
      duration: videoDuration,
    };

    // Create copy of sections to modify
    const updatedSections = [...sections];

    // Update the specific section with the new lesson
    if (editingSectionIndex !== null) {
      // Add new lesson to the section
      updatedSections[editingSectionIndex].lessons.push(newLesson);

      // Update the section's duration
      updatedSections[editingSectionIndex].duration = calculateSectionDuration(
        updatedSections[editingSectionIndex].lessons
      );
    }

    setSections(updatedSections);
    onUpdate(updatedSections);
    setIsAddLessonModalOpen(false);
    setIsLoading(false);
    resetLessonForm();
  };

  const handleUpdateLesson = async () => {
    if (!newLessonName.trim()) {
      setError(comments.LESSON_REQ);
      return;
    }

    // Default to existing values if not updating the video
    const currentLesson =
      editingSectionIndex !== null && editingLessonId
        ? sections[editingSectionIndex].lessons.find(
            (l) => l._id === editingLessonId
          )
        : null;

    let videoUrl = currentLesson?.videoUrl || "";
    let videoDuration = currentLesson?.duration || 0;

    if (newLessonVideo) {
      // If updating video, get the new duration
      videoDuration = await updateLessonDuration(newLessonVideo);

      setIsLoading(true);
      const videoUploadResult = await handleFileUpload(newLessonVideo, {
        onUploadStart: () => setIsLoading(true),
        onUploadEnd: () => setIsLoading(false),
        validateFile: validateVideoFile,
      });

      if (!videoUploadResult.success) {
        console.log(comments.VIDEO_UPLOAD_FAIL, videoUploadResult.error);
        setError(comments.VIDEO_UPLOAD_FAIL);
        setIsLoading(false);
        return;
      }
      videoUrl = videoUploadResult.url as string;
    }

    setIsLoading(true);
    const pdfUploadPromises = newLessonPdfs.map((pdf) =>
      handleFileUpload(pdf, { validateFile: validatePdfFile })
    );
    const pdfUploadResults = await Promise.all(pdfUploadPromises);
    setIsLoading(false);

    const newPdfUrls = pdfUploadResults
      .filter((result) => result.success)
      .map((result) => result.url as string);

    // Create a copy of the sections array
    const updatedSections = [...sections];

    // Update the specific lesson
    if (editingSectionIndex !== null && editingLessonId) {
      const sectionToUpdate = updatedSections[editingSectionIndex];
      const lessonIndex = sectionToUpdate.lessons.findIndex(
        (lesson) => lesson._id === editingLessonId
      );

      if (lessonIndex !== -1) {
        // Update the lesson properties
        sectionToUpdate.lessons[lessonIndex] = {
          ...sectionToUpdate.lessons[lessonIndex],
          name: newLessonName,
          videoUrl: videoUrl,
          pdfUrls: [
            ...sectionToUpdate.lessons[lessonIndex].pdfUrls,
            ...newPdfUrls,
          ],
          duration: videoDuration,
        };

        // Recalculate section duration
        sectionToUpdate.duration = calculateSectionDuration(
          sectionToUpdate.lessons
        );
      }
    }

    setSections(updatedSections);
    onUpdate(updatedSections);
    setIsEditLessonModalOpen(false);
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
    return true;
  };

  const prepareCourseDataForBackend = (formData: ICourse): ICourse => {
    const cleanedCurriculum = formData.curriculum.map((section: ISection) => ({
      ...section,
      lessons: section.lessons.map((lesson: ILesson) => {
        const { _id, ...rest } = lesson;
        return rest;
      }),
    }));

    const totalDuration = cleanedCurriculum.reduce(
      (total: number, section: ISection) => total + section.duration,
      0
    );

    return {
      ...formData,
      curriculum: cleanedCurriculum,
      totalLessons: cleanedCurriculum.reduce(
        (total: number, section: ISection) => total + section.lessons.length,
        0
      ),
      totalDuration: totalDuration,
    };
  };

  const handlePublish = async () => {
    if (validateForm()) {
      try {
        setPublishing(true);
        const formattedData = prepareCourseDataForBackend(courseFormData);
        let response;

        if (isEditMode) {
          response = await axiosInstance.put(API.COURSE_UPDATE, {
            _id: courseFormData._id,
            ...formattedData,
          });
          console.log(comments.COURSE_UPDATE_SUCC, response.data);
          setError(comments.COURSE_UPDATED);
        } else {
          response = await axiosInstance.post(API.COURSE_ADD, formattedData);
          console.log(comments.COURSE_PUB_SUCC, response.data);
          setError(comments.COURSE_UPDATED);
          localStorage.removeItem("courseFormData");
        }

        setIsSuccessModalOpen(true);

        setTimeout(() => {
          navigate(API.COURSE_MNGMT);
        }, 4000);
      } catch (error) {
        console.error(
          isEditMode ? comments.COURSE_UPDATE_FAIL : comments.COURSE_PUB_FAIL,
          error
        );
        setError(
          isEditMode ? comments.COURSE_UPDATE_FAIL : comments.COURSE_PUB_FAIL
        );
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
    setEditingLessonId(lessonId.toString());
    const section = sections[sectionIndex];
    const lesson = section?.lessons.find((l) => l._id === lessonId.toString());
    if (lesson) {
      setNewLessonName(lesson.name);
      setNewLessonPdfs([]);
      setNewLessonDuration(lesson.duration);
      setIsEditLessonModalOpen(true);
    }
  };

  const handleRemoveExistingPdf = (
    sectionIndex: number,
    lessonId: string | number,
    pdfUrl: string
  ) => {
    const updatedSections = [...sections];

    const section = updatedSections[sectionIndex];
    const lessonIndex = section.lessons.findIndex(
      (lesson) => lesson._id === lessonId.toString()
    );

    if (lessonIndex !== -1) {
      // Remove the PDF URL
      section.lessons[lessonIndex].pdfUrls = section.lessons[
        lessonIndex
      ].pdfUrls.filter((url) => url !== pdfUrl);

      // No need to update section duration here as PDF removal doesn't affect duration
      // But we'll recalculate anyway to ensure consistency
      section.duration = calculateSectionDuration(section.lessons);
    }

    setSections(updatedSections);
    onUpdate(updatedSections);
  };

  const handleDeleteClick = (
    type: "section" | "lesson",
    sectionIndex: number,
    lessonId?: string | number
  ) => {
    setEditingSectionIndex(sectionIndex);
    setEditingLessonId(lessonId?.toString() || null);
    setDeletingItemType(type);
    setIsDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = () => {
    const updatedSections = [...sections];

    if (deletingItemType === "section" && editingSectionIndex !== null) {
      // Remove the section
      updatedSections.splice(editingSectionIndex, 1);
    } else if (
      deletingItemType === "lesson" &&
      editingSectionIndex !== null &&
      editingLessonId
    ) {
      // Find the lesson index
      const lessonIndex = updatedSections[
        editingSectionIndex
      ].lessons.findIndex((lesson) => lesson._id === editingLessonId);

      if (lessonIndex !== -1) {
        // Remove the lesson
        updatedSections[editingSectionIndex].lessons.splice(lessonIndex, 1);

        // Update section duration
        updatedSections[editingSectionIndex].duration =
          calculateSectionDuration(
            updatedSections[editingSectionIndex].lessons
          );
      }
    }

    setSections(updatedSections);
    onUpdate(updatedSections);
    setIsDeleteConfirmationOpen(false);
    setDeletingItemType(null);
    setEditingSectionIndex(null);
    setEditingLessonId(null);
  };

  // Function to extract video duration from a file
  const extractVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // Function to update lesson duration when a video is uploaded
  const updateLessonDuration = async (file: File | null): Promise<number> => {
    if (!file) return 0;
    try {
      const duration = await extractVideoDuration(file);
      setNewLessonDuration(duration);
      return duration;
    } catch (error) {
      console.error("Error extracting video duration:", error);
      return 0;
    }
  };

  const calculateSectionDuration = (lessons: ILesson[]): number => {
    return lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  };

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <Loading />
        </div>
      )}
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
                  <button
                    onClick={() => handleEditClick(section, sectionIndex)}
                  >
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
                <div
                  key={lesson._id || `lesson-${index}`}
                  className="lecture-item"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span>
                      Lecture {String(index + 1).padStart(2, "0")}:{" "}
                      {lesson.name} ({lesson.duration}s)
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() =>
                        handleEditLessonClick(
                          sectionIndex,
                          lesson._id || `lesson-${index}`
                        )
                      }
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteClick(
                          "lesson",
                          sectionIndex,
                          lesson._id || `lesson-${index}`
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

        {/* Edit Section Modal. */}
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

        {/* Add Lesson Modal */}
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
              {/* <div className="input-group">
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
              </div> */}
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
                <button onClick={handleCreateLesson}>
                  {comments.ADD_LESSSON}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Lesson Modal */}
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
              {/* <div className="input-group">
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
              </div> */}
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
                <button onClick={handleUpdateLesson}>
                  {comments.LESSON_UPDATE}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Lesson/ Section Modal */}
        {isDeleteConfirmationOpen && (
          <CustomModal
            isOpen={isDeleteConfirmationOpen}
            onClose={() => setIsDeleteConfirmationOpen(false)}
            header={`Confirm Deletion`}
            buttons={[
              {
                text: "Cancel",
                onClick: () => setIsDeleteConfirmationOpen(false),
                variant: "secondary",
              },
              {
                text: "Delete",
                onClick: handleConfirmDelete,
                variant: "primary",
              },
            ]}
          >
            <p>Are you sure you want to delete this {deletingItemType}?</p>
            <p>This action cannot be undone.</p>
          </CustomModal>
        )}

        {/*  Success Modal  */}
        {isSuccessModalOpen && (
          <CustomModal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
            header="Success"
            buttons={[
              {
                text: "OK",
                onClick: () => {
                  setIsSuccessModalOpen(false);
                  navigate(API.COURSE_MNGMT);
                },
                variant: "primary",
              },
            ]}
          >
            <div className="success-modal-content">
              <CheckCircle size={64} style={{ marginBottom: "1rem" }} />
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                Course Created Successfully!
              </h2>
              <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                Your course has been published. Redirecting to course
                management...
              </p>
            </div>
          </CustomModal>
        )}

        {/* Update Success Modal message */}
        {isSuccessModalOpen && (
          <CustomModal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
            header="Success"
            buttons={[
              {
                text: "OK",
                onClick: () => {
                  setIsSuccessModalOpen(false);
                  navigate(API.COURSE_MNGMT);
                },
                variant: "primary",
              },
            ]}
          >
            <div className="success-modal-content">
              <CheckCircle size={64} style={{ marginBottom: "1rem" }} />
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                {isEditMode
                  ? "Course Updated Successfully!"
                  : "Course Created Successfully!"}
              </h2>
              <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                Your course has been {isEditMode ? "updated" : "published"}.
                Redirecting to course management...
              </p>
            </div>
          </CustomModal>
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
            {publishing ? <Loading /> : comments.COURSE_PUB}
          </button>
        </div>
      </div>
    </>
  );
};

export default Curriculum;
