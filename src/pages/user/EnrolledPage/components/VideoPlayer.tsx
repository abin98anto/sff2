import React, { useRef, useEffect } from "react";
import "./VideoPlayer.scss";
import { ChevronRight, FileText } from "lucide-react";
// import { Lesson } from "../../../../entities/courses/Course";
import { useSelector } from "react-redux";
import { AppRootState } from "../../../../redux/store";
import { useLocation } from "react-router-dom";
import { ILesson } from "../../../../entities/ICourse";
import axiosInstance from "../../../../shared/config/axiosConfig";
// import axiosInstance from "../../../../utils/axiosConfig";

interface VideoPlayerProps {
  videoUrl?: string;
  thumbnail?: string;
  onNextLesson: () => void;
  onLectureComplete: (lessonId: string) => void;
  currentLesson: ILesson | null;
  courseName: string;
  courseDescription: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  onNextLesson,
  onLectureComplete,
  currentLesson,
  courseName,
  courseDescription,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const user = useSelector((state: AppRootState) => state.user);
  const location = useLocation().search.split("=")[1];

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleEnded = async () => {
        if (currentLesson) {
          const userId = user.userInfo?._id as string;
          const courseId = location;
          const lesson = currentLesson._id;

          await axiosInstance.post("/lesson", {
            userId,
            courseId,
            lesson,
          });
          onLectureComplete(currentLesson._id as string);
        }
      };
      video.addEventListener("ended", handleEnded);
      return () => {
        video.removeEventListener("ended", handleEnded);
      };
    }
  }, [currentLesson, onLectureComplete]);

  const handlePdfDownload = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="video-player-container">
      <div className="video-container">
        {videoUrl ? (
          <div className="video-wrapper">
            <video
              ref={videoRef}
              controls
              className="video-player"
              key={videoUrl}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button className="next-button" onClick={onNextLesson}>
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <div className="thumbnail-container">
            <img
              src={
                thumbnail ||
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Dsuu93GOHN2Zkjc3MlGqL4tqMSoDC6.png"
              }
              alt="Course thumbnail"
              className="thumbnail"
            />
          </div>
        )}
      </div>
      <div className="video-info">
        {currentLesson ? (
          <>
            <h2 className="lesson-name">{currentLesson.name}</h2>
            <p className="course-name">{courseName}</p>
            {currentLesson.pdfUrls && currentLesson.pdfUrls.length > 0 && (
              <div className="pdf-links">
                <h3>Lesson Resources:</h3>
                <ul>
                  {currentLesson.pdfUrls.map((pdfUrl, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handlePdfDownload(pdfUrl)}
                        className="pdf-download-button"
                      >
                        <FileText size={16} />
                        <span>PDF {index + 1}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="course-title">{courseName}</h2>
            <p className="course-description">{courseDescription}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
