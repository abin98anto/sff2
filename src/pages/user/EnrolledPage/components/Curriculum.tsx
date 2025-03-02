import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, CheckIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

import "./Curriculum.scss";
import Modal from "./Modal";
import { ILesson, ISection } from "../../../../entities/ICourse";
import axiosInstance from "../../../../shared/config/axiosConfig";
import IEnrollment from "../../../../entities/IEnrollment";

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
  onLectureComplete,
  onLectureUncomplete,
  currentLessonId,
}) => {
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLecture, setCurrentLecture] = useState<ILesson | null>(null);
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);

  // Populate curriculum details.
  const courseId = useLocation().pathname.split("/")[2];
  const [enrollmentDetails, setEnrollmentDetails] =
    useState<IEnrollment | null>(null);
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
      setCompletedLectures(response.data.data.completedLessons);
    } catch (error) {
      console.error("Error fetching completed lessons:", error);
    }
  }, [location]);

  useEffect(() => {
    fetchCompletedLessons();
  }, [fetchCompletedLessons]);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Lesson completion functions.
  const isLectureCompleted = (lectureId: string): boolean => {
    return completedLectures.includes(lectureId);
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
      await axiosInstance.put("/enrollment/update", {
        updates,
      });
    } catch (error) {
      console.log("error updating completed lesson", error);
    }
  };
  const handleConfirmComplete = async () => {
    if (currentLecture && currentLecture._id) {
      try {
        const lessonId = currentLecture._id;
        let updatedCompletedLessons = [];
        !enrollmentDetails?.completedLessons
          ? updatedCompletedLessons.push(lessonId)
          : (updatedCompletedLessons = [
              ...enrollmentDetails?.completedLessons!,
              lessonId,
            ]);
        lessonUpdate(updatedCompletedLessons);
        setCompletedLectures((prev) => [...prev, lessonId]);
        onLectureComplete(lessonId);
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
        const updatedCompletedLessons = completedLectures.filter(
          (id) => id !== lessonId
        );
        lessonUpdate(updatedCompletedLessons);
        setCompletedLectures((prev) => prev.filter((id) => id !== lessonId));
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
