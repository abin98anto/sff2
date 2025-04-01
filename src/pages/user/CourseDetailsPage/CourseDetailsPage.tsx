import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Play, FileText, Star } from "lucide-react";

import "./CourseDetailsPage.scss";
import ICourse from "../../../entities/ICourse";
import axiosInstance from "../../../shared/config/axiosConfig";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import Loading from "../../../components/common/Loading/Loading";
import { useAppSelector } from "../../../hooks/reduxHooks";
import IEnrollment from "../../../entities/IEnrollment";
import { EnrollStatus } from "../../../entities/misc/enrollStatus";
import API from "../../../shared/constants/API";
import { IUser } from "../../../entities/IUser";

interface IReview {
  _id?: string;
  userId: {
    _id: string;
    name: string;
    picture?: string;
  };
  ratings: number;
  comments: string;
  createdAt: string;
}

const CourseDetailsPage: React.FC = () => {
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const formatDurationToHours = (seconds: number): string => {
    if (!seconds) return "0h";
    const hours = (seconds / 60).toFixed(2);
    return `${hours} min`;
  };

  // Fetching course details
  const { courseId } = useParams<{ courseId: string }>();
  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/course/${courseId}`);
      console.log("first", response.data.data);

      const tutors = await axiosInstance.get(API.TUTORS_GET);
      // console.log("tutus", tutors.data);

      const filteredTutors = tutors.data.filter((tutor: IUser) => {
        return response.data.data.tutors.includes(tutor._id);
      });
      setTutors(filteredTutors);
      // console.log("fild tuts", filteredTutors);

      setCourse(response.data.data);
      console.log(course);
      setLoading(false);
    } catch (err) {
      const errorMessage = "Error fetching course details";
      showSnackbar(errorMessage, "error");
      setLoading(false);
      console.error(errorMessage, err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchCourse();
  }, [courseId]);

  // Curriculum section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };
  const expandAllSections = () => {
    if (!course?.curriculum) return;

    const allSectionIds = course.curriculum.reduce((acc, section) => {
      if (section._id) {
        acc[section._id] = true;
      }
      return acc;
    }, {} as { [key: string]: boolean });

    setExpandedSections(allSectionIds);
  };
  const collapseAllSections = () => {
    setExpandedSections({});
  };

  // Duration calculation
  const getTotalStats = () => {
    if (!course?.curriculum) {
      return { sections: 0, lessons: 0, totalDuration: "0h" };
    }

    const sections = course.curriculum.length;
    const lessons = course.totalLessons || 0;
    const totalDuration = course.totalDuration || 0;

    return {
      sections,
      lessons,
      totalDuration: formatDurationToHours(totalDuration),
    };
  };
  const { sections, lessons, totalDuration } = getTotalStats();

  const { userInfo } = useAppSelector((state) => state.user);
  const navigate = useNavigate();

  const checkSubscriptionStatus = async (): Promise<boolean> => {
    try {
      const response = await axiosInstance.get("/order/sub-check");
      return !!response.data.data;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  };

  const handleCourseEnroll = async () => {
    try {
      if (!userInfo) {
        showSnackbar("Please login to continue", "error");
        return;
      }

      const hasSubscription = await checkSubscriptionStatus();
      if (!hasSubscription) {
        showSnackbar(
          "You need an active subscription to enroll in this course",
          "error"
        );
        return;
      }

      setLoading(true);
      const data: Partial<IEnrollment> = {
        courseId: course?._id,
        enrolledAt: new Date(),
        status: EnrollStatus.PENDING,
        completedLessons: [],
      };
      await axiosInstance.post("/enrollment/add", data);
      navigate("/study/" + data.courseId);
      setLoading(false);
    } catch (error) {
      console.log("Error enrolling course in the front end:", error);
      showSnackbar("Error enrolling in the course", "error");
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get(`/review/${courseId}`);
      setReviews(response.data.data || []);
    } catch (err) {
      console.error("Error fetching course reviews:", err);
    }
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i < rating ? "#FFD700" : "none"}
          color={i < rating ? "#FFD700" : "#6b7280"}
        />
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  const calculateAverageRating = (): number => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce(
      (sum, review) => sum + review.ratings,
      0
    );
    return parseFloat((totalRating / reviews.length).toFixed(1));
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="course-header">
        {course?.thumbnail && (
          <img
            className="course-image"
            src={course.thumbnail}
            alt={course.title}
          />
        )}
        <div className="course-info">
          <h1>{course?.title}</h1>
          <p>{course?.subtitle}</p>
          <p>
            Category:{" "}
            {typeof course?.category === "string"
              ? course.category
              : course?.category.name}
          </p>
          <p>Language: {course?.language}</p>
          <p>Duration: {formatDurationToHours(course?.totalDuration || 0)}</p>
          <button className="start-course-button" onClick={handleCourseEnroll}>
            Start Course
          </button>
        </div>
      </div>

      <div className="course-description">
        <h2>About this course</h2>
        <p>{course?.description}</p>

        <div className="course-tutors">
          <h2>Course Tutors</h2>
          <div className="tutors-list">
            {tutors.length > 0 ? (
              tutors.map((tutor) => (
                <div className="tutor-item" key={tutor._id}>
                  <div className="tutor-avatar">
                    {tutor.picture ? (
                      <img
                        src={tutor.picture}
                        alt={tutor.name}
                        className="tutor-image"
                      />
                    ) : (
                      <div className="tutor-avatar-placeholder">
                        {tutor.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="tutor-info">
                    <h3 className="tutor-name">{tutor.name}</h3>
                    <h3 className="tutor-name">{tutor.email}</h3>
                    {tutor.bio && <p className="tutor-bio">{tutor.bio}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p>No tutors assigned to this course.</p>
            )}
          </div>
        </div>
      </div>

      <div className="course-curriculum">
        <div className="curriculum-header">
          <div className="course-stats">
            {sections} sections • {lessons} lessons • {totalDuration} total
            hours
          </div>
          <button
            className="expand-button"
            onClick={
              Object.keys(expandedSections).length === sections
                ? collapseAllSections
                : expandAllSections
            }
          >
            {Object.keys(expandedSections).length === sections
              ? "Collapse all sections"
              : "Expand all sections"}
          </button>
        </div>

        {course?.curriculum.map((section) => (
          <div className="section" key={section._id}>
            <div
              className="cdp-section-header"
              onClick={() => toggleSection(section._id || "")}
            >
              <div className="section-info">
                <div className="chevron-icon">
                  {expandedSections[section._id || ""] ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
                <div>
                  <h3>{section.name}</h3>
                  <div className="section-meta">
                    {section.lessons?.length || 0} lessons •{" "}
                    {formatDurationToHours(section.duration || 0)}
                  </div>
                </div>
              </div>
            </div>
            {expandedSections[section._id || ""] && section.lessons && (
              <div className="lecture-list">
                {section.lessons.map((lesson, index) => (
                  <div className="lecture-item" key={lesson._id || index}>
                    <div className="lecture-info">
                      <div className="lecture-icon">
                        {lesson.videoUrl ? (
                          <Play size={16} />
                        ) : (
                          <FileText size={16} />
                        )}
                      </div>
                      <span className="lecture-title">{lesson.name}</span>
                    </div>
                    <div className="lecture-meta">
                      {lesson.duration && (
                        <span className="duration">
                          {formatDurationToHours(lesson.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Course Reviews Section */}
      <div className="course-reviews">
        <h2>Student Reviews</h2>

        {reviews.length > 0 ? (
          <>
            <div className="reviews-summary">
              <div className="average-rating">
                <span className="rating-number">
                  {calculateAverageRating()}
                </span>
                {renderStarRating(calculateAverageRating())}
                <span className="review-count">({reviews.length} reviews)</span>
              </div>
            </div>

            <div className="reviews-list">
              {(showAllReviews ? reviews : reviews.slice(0, 2)).map(
                (review) => (
                  <div className="review-item" key={review._id}>
                    <div className="review-header">
                      <div className="reviewer-info">
                        {review.userId.picture ? (
                          <img
                            src={review.userId.picture}
                            alt={review.userId.name}
                            className="reviewer-avatar"
                          />
                        ) : (
                          <div className="reviewer-avatar-placeholder">
                            {review.userId.name.charAt(0)}
                          </div>
                        )}
                        <div className="reviewer-details">
                          <div className="reviewer-name">
                            {review.userId.name}
                          </div>
                          <div className="review-date">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                      {renderStarRating(review.ratings)}
                    </div>
                    <div className="review-comment">{review.comments}</div>
                  </div>
                )
              )}
            </div>

            {reviews.length > 2 && (
              <button
                className="show-more-reviews"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews
                  ? "Show less"
                  : `Show all ${reviews.length} reviews`}
              </button>
            )}
          </>
        ) : (
          <div className="no-reviews">
            <p>There are no reviews yet for this course.</p>
          </div>
        )}
      </div>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default CourseDetailsPage;
