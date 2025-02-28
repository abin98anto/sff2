import React, { useState, useEffect, useCallback } from "react";
import "./Curriculum.scss";
import { ChevronDown, ChevronUp, CheckIcon } from "lucide-react";
import Modal from "./Modal";
import { useSelector } from "react-redux";
import { AppRootState } from "../../../../redux/store";
import { useLocation } from "react-router-dom";
import { ILesson, ISection } from "../../../../entities/ICourse";
import axiosInstance from "../../../../shared/config/axiosConfig";

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

  const user = useSelector((state: AppRootState) => state.user);
  const location = useLocation().search.split("=")[1];
  const userId = user.userInfo?._id;

  const fetchCompletedLessons = useCallback(async () => {
    if (!userId || !location) {
      console.error("User ID or Course ID is missing");
      return;
    }

    try {
      const response = await axiosInstance.post(`/completed-lessons`, {
        userId,
        courseId: location,
      });
      setCompletedLectures(response.data.user);
    } catch (error) {
      console.error("Error fetching completed lessons:", error);
    }
  }, [userId, location]);

  useEffect(() => {
    fetchCompletedLessons();
  }, [fetchCompletedLessons]);

  const isLectureCompleted = (lectureId: string): boolean => {
    return completedLectures.includes(lectureId);
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleCheckboxClick = async (e: React.MouseEvent, lecture: ILesson) => {
    e.stopPropagation();
    setCurrentLecture(lecture);
    setIsModalOpen(true);
  };

  const handleConfirmComplete = async () => {
    if (currentLecture && currentLecture._id) {
      const lessonId = currentLecture._id;

      try {
        await axiosInstance.post("/lesson", {
          userId,
          courseId: location,
          lesson: lessonId,
        });
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
      const lessonId = currentLecture._id;

      try {
        await axiosInstance.post("/uncomplete-lesson", {
          userId,
          courseId: location,
          lesson: lessonId,
        });
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
