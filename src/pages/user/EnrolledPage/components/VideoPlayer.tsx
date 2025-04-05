import React, { useRef, useEffect, useState } from "react";
import "./VideoPlayer.scss";
import { ChevronRight, FileText, Star } from "lucide-react";
import { useSelector } from "react-redux";
import { AppRootState } from "../../../../redux/store";
import { ILesson } from "../../../../entities/ICourse";
import axiosInstance from "../../../../shared/config/axiosConfig";
import CustomModal from "../../../../components/common/Modal/CustomModal/CustomModal";
import IReview from "../../../../entities/IReview";
import useSnackbar from "../../../../hooks/useSnackbar";
import CustomSnackbar from "../../../../components/common/CustomSnackbar";

interface VideoPlayerProps {
  videoUrl?: string;
  thumbnail?: string;
  onNextLesson: () => void;
  onLectureComplete: (lessonId: string) => void;
  currentLesson: ILesson | null;
  courseName: string;
  courseId: string;
  courseDescription: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  onNextLesson,
  onLectureComplete,
  currentLesson,
  courseName,
  courseId,
  courseDescription,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const user = useSelector((state: AppRootState) => state.user);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleEnded = async () => {
        if (currentLesson) {
          const userId = user.userInfo?._id as string;
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

  const handleOpenReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setRating(0);
    setHoveredRating(0);
    setReviewComment("");
  };

  const handleSubmitReview = async () => {
    try {
      const userId = user.userInfo?._id as string;
      const review: IReview = {
        userId,
        courseId,
        ratings: rating,
        comments: reviewComment,
      };

      await axiosInstance.post("/review/add", review);
      showSnackbar("Review submitted successfully!", "success");

      handleCloseReviewModal();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleStarHover = (hoveredStar: number) => {
    setHoveredRating(hoveredStar);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
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

      <button className="review-button" onClick={handleOpenReviewModal}>
        Submit Review
      </button>

      {/* Review Modal */}
      <CustomModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        header="Rate This Course"
        buttons={[
          {
            text: "Cancel",
            onClick: handleCloseReviewModal,
            variant: "secondary",
          },
          {
            text: "Submit",
            onClick: handleSubmitReview,
            variant: "primary",
          },
        ]}
      >
        <div className="review-modal-content">
          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className="star-wrapper"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
              >
                <Star
                  size={32}
                  fill={star <= (hoveredRating || rating) ? "#FFD700" : "none"}
                  color={star <= (hoveredRating || rating) ? "#FFD700" : "#ccc"}
                  className="star-icon"
                />
              </span>
            ))}
          </div>
          <div className="rating-text">
            {rating === 0
              ? "Rate this course"
              : `You've rated this course ${rating} star${
                  rating !== 1 ? "s" : ""
                }`}
          </div>
          <div className="form-group">
            <label htmlFor="review-comment">
              Share your experience (optional)
            </label>
            <textarea
              id="review-comment"
              className="review-textarea"
              placeholder="Tell us what you think about this course..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </CustomModal>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default VideoPlayer;
