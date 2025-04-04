import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, CheckIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

import "./Curriculum.scss";
import Modal from "./Modal";
import { ILesson, ISection } from "../../../../entities/ICourse";
import axiosInstance from "../../../../shared/config/axiosConfig";
import IEnrollment from "../../../../entities/IEnrollment";
import { EnrollStatus } from "../../../../entities/misc/enrollStatus";

interface CurriculumProps {
  sections: ISection[] | undefined;
  onVideoSelect: (videoUrl: string, lesson: ILesson) => void;
  completedLectures: string[];
  onLectureComplete: (lectureId: string) => void;
  onLectureUncomplete: (lectureId: string) => void;
  currentLessonId: string | undefined;
}

const Curriculum: React.FC<CurriculumProps> = ({
  sections,
  onVideoSelect,
  completedLectures: propCompletedLectures,
  onLectureComplete,
  onLectureUncomplete,
  currentLessonId,
}) => {
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLecture, setCurrentLecture] = useState<ILesson | null>(null);
  const [localCompletedLectures, setLocalCompletedLectures] = useState<
    string[]
  >([]);
  const [enrollmentDetails, setEnrollmentDetails] =
    useState<IEnrollment | null>(null);

  const location = useLocation();
  const courseId = location.pathname.split("/")[2];

  // Fetch completed lessons
  const fetchCompletedLessons = useCallback(async () => {
    try {
      if (!courseId) {
        console.error("Course ID is missing");
        return;
      }
      const response = await axiosInstance.post(`/enrollment/without-id`, {
        courseId,
      });
      setEnrollmentDetails(response.data.data);

      // Instead of setting state directly from API response,
      // we'll use this to initialize our local state if needed
      if (
        propCompletedLectures.length === 0 &&
        response.data.data.completedLessons?.length > 0
      ) {
        setLocalCompletedLectures(response.data.data.completedLessons || []);
        // Sync with parent if we got data from API but parent doesn't have it
        response.data.data.completedLessons?.forEach((lectureId: string) => {
          onLectureComplete(lectureId);
        });
      }
    } catch (error) {
      console.error("Error fetching completed lessons:", error);
    }
  }, [courseId, onLectureComplete, propCompletedLectures.length]);

  // Keep local state in sync with props
  useEffect(() => {
    setLocalCompletedLectures(propCompletedLectures);
  }, [propCompletedLectures]);

  useEffect(() => {
    fetchCompletedLessons();
  }, [fetchCompletedLessons]);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Calculate total lessons in the course
  const getTotalLessons = (): number => {
    return (
      sections?.reduce((total, section) => total + section.lessons.length, 0) ||
      0
    );
  };

  // Check if course is fully completed
  const isCourseCompleted = (updatedCompletedLessons: string[]): boolean => {
    const totalLessons = getTotalLessons();
    return updatedCompletedLessons.length === totalLessons;
  };

  // Update enrollment status to completed
  const updateEnrollmentStatus = async () => {
    try {
      const updates: Partial<IEnrollment> = {
        _id: enrollmentDetails?._id,
        status: EnrollStatus.COMPLETED,
      };
      await axiosInstance.put("/enrollment/update", { updates });
      console.log("Enrollment status updated to completed");
    } catch (error) {
      console.error("Error updating enrollment status:", error);
    }
  };

  // Lesson completion functions
  const isLectureCompleted = (lectureId: string): boolean => {
    return localCompletedLectures.includes(lectureId);
  };

  const handleCheckboxClick = async (e: React.MouseEvent, lecture: ILesson) => {
    e.stopPropagation();
    setCurrentLecture(lecture);
    setIsModalOpen(true);
  };

  const lessonUpdate = async (updatedCompletedLessons: string[]) => {
    try {
      const updates: Partial<IEnrollment> = {
        _id: enrollmentDetails?._id,
        completedLessons: updatedCompletedLessons,
      };
      await axiosInstance.put("/enrollment/update", { updates });
    } catch (error) {
      console.log("Error updating completed lesson:", error);
    }
  };

  const handleConfirmComplete = async () => {
    if (currentLecture && currentLecture._id) {
      try {
        const lessonId = currentLecture._id;
        let updatedCompletedLessons = [];
        if (!enrollmentDetails?.completedLessons) {
          updatedCompletedLessons = [lessonId];
        } else {
          updatedCompletedLessons = [...localCompletedLectures, lessonId];
        }

        // Remove duplicates (in case lessonId is already in the list)
        updatedCompletedLessons = [...new Set(updatedCompletedLessons)];

        await lessonUpdate(updatedCompletedLessons);
        // We don't need this anymore as we're syncing with the parent
        // setLocalCompletedLectures(updatedCompletedLessons);

        // This will eventually update the prop and our local state via useEffect
        onLectureComplete(lessonId);

        // Check if course is completed and update status
        if (isCourseCompleted(updatedCompletedLessons)) {
          await updateEnrollmentStatus();
        }
      } catch (error) {
        console.error("Error completing lecture:", error);
      }
    }
    setIsModalOpen(false);
  };

  const handleConfirmUncomplete = async () => {
    if (currentLecture && currentLecture._id) {
      try {
        const lessonId = currentLecture._id;
        const updatedCompletedLectures = localCompletedLectures.filter(
          (id) => id !== lessonId
        );
        await lessonUpdate(updatedCompletedLectures);
        // We don't need this anymore as we're syncing with the parent
        // setLocalCompletedLectures(updatedCompletedLectures);

        // This will eventually update the prop and our local state via useEffect
        onLectureUncomplete(lessonId);
      } catch (error) {
        console.error("Error uncompleting lecture:", error);
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="curriculum">
      <h2 className="curriculum-title">Course content</h2>
      <div className="sections">
        {sections?.map((section, index) => (
          <div key={index} className="section">
            <button
              className="section-header"
              onClick={() => toggleSection(index)}
            >
              <div className="section-title">
                <span>
                  Section {index + 1}: {section.name}
                </span>
                <span className="section-info">
                  {section.lessons.length} lecture
                  {section.lessons.length > 1 ? "s" : ""}
                </span>
              </div>
              {expandedSections.includes(index) ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {expandedSections.includes(index) && (
              <div className="lectures">
                {section.lessons.map((lecture, lectureIndex) => (
                  <button
                    key={lectureIndex}
                    className={`lecture ${
                      currentLessonId === lecture._id ? "current-lesson" : ""
                    }`}
                    onClick={() =>
                      lecture.videoUrl &&
                      onVideoSelect(lecture.videoUrl, lecture)
                    }
                  >
                    <div
                      className={`lecture-checkbox ${
                        lecture._id && isLectureCompleted(lecture._id)
                          ? "completed"
                          : ""
                      }`}
                      onClick={(e) => handleCheckboxClick(e, lecture)}
                    >
                      {lecture._id && isLectureCompleted(lecture._id) && (
                        <CheckIcon size={16} />
                      )}
                    </div>
                    <span className="lecture-name">{lecture.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={
          currentLecture &&
          currentLecture._id &&
          isLectureCompleted(currentLecture._id)
            ? handleConfirmUncomplete
            : handleConfirmComplete
        }
        message={
          currentLecture &&
          currentLecture._id &&
          isLectureCompleted(currentLecture._id)
            ? "Do you want to mark this lesson as incomplete?"
            : "Have you completed this lesson?"
        }
      />
    </div>
  );
};

export default Curriculum;
