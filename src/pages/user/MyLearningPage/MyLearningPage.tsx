import { useState, useEffect } from "react";
import { SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";

import "./MyLearningPage.scss";
import { AppRootState } from "../../../redux/store";
import ICourse from "../../../entities/ICourse";
import { useAppSelector } from "../../../hooks/reduxHooks";
import axiosInstance from "../../../shared/config/axiosConfig";
import { ICategory } from "../../../entities/ICategory";
import IEnrollment from "../../../entities/IEnrollment";
import Loading from "../../../components/common/Loading/Loading";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import Pagination from "../../../components/common/Pagination/Pagination";

interface EnrolledCourseData {
  courseInfo: ICourse;
  enrollmentInfo: IEnrollment;
}

const MyLearningPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseData[]>(
    []
  );
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const coursesPerPage = 8;

  const { userInfo } = useAppSelector((state: AppRootState) => state.user);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/enrollment/user-enrollments/" + userInfo?._id,
        {
          params: {
            page,
            limit: coursesPerPage,
          },
        }
      );

      const pendingEnrollments = response.data.data.filter(
        (enrollment: IEnrollment) => enrollment.status === "pending"
      );

      if (
        pendingEnrollments.length > 0 &&
        typeof pendingEnrollments[0].courseId === "object"
      ) {
        setEnrolledCourses(
          pendingEnrollments.map((enrollment: IEnrollment) => ({
            courseInfo: enrollment.courseId as unknown as ICourse,
            enrollmentInfo: enrollment,
          }))
        );
      } else {
        const coursesWithEnrollments = await Promise.all(
          pendingEnrollments.map(async (enrollment: IEnrollment) => {
            try {
              const courseResponse = await axiosInstance.get(
                `/courses/${enrollment.courseId}`
              );
              const courseInfo = courseResponse.data.data;

              return {
                courseInfo,
                enrollmentInfo: enrollment,
              };
            } catch (error) {
              console.error(
                `Failed to fetch course ${enrollment.courseId}`,
                error
              );
              return null;
            }
          })
        );

        setEnrolledCourses(
          coursesWithEnrollments.filter((course) => course !== null)
        );
      }

      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      showSnackbar("Failed to fetch enrolled courses.", "error");
      setLoading(false);
      console.error("Failed to fetch enrolled courses.", err);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, userInfo?._id]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const calculateCompletionPercentage = (course: EnrolledCourseData) => {
    if (!course.enrollmentInfo || !course.courseInfo.totalLessons) {
      return 0;
    }

    const completedLessons =
      course.enrollmentInfo.completedLessons?.length || 0;
    const totalLessons = course.courseInfo.totalLessons || 0;

    if (totalLessons === 0) return 0;

    return Math.round((completedLessons / totalLessons) * 100);
  };

  if (loading) return <Loading />;

  const getCategoryName = (category: ICategory | string): string => {
    if (!category) return "Uncategorized";
    return typeof category === "object" ? category.name : "unknown";
  };

  return (
    <div className="my-learning-page">
      <div className="container">
        <h1>My Learning</h1>

        <div className="controls">
          <div className="search">
            <input type="text" placeholder="Search courses..." readOnly />
            <SearchIcon />
          </div>
        </div>

        {enrolledCourses.length > 0 ? (
          <>
            <div className="course-grid">
              {enrolledCourses.map((course) => (
                <div key={course.courseInfo._id} className="course-card">
                  <img
                    src={course.courseInfo.thumbnail || "/placeholder.svg"}
                    alt={course.courseInfo.title}
                  />

                  <div className="course-info">
                    <Link
                      to={`/study/${course.courseInfo._id}`}
                      key={course.courseInfo._id}
                      className="course-card-link"
                    >
                      <h2>{course.courseInfo.title}</h2>
                      <p>Language: {course.courseInfo.language}</p>
                      <p className="subtitle">{course.courseInfo.subtitle}</p>
                      <p className="category">
                        Category:{" "}
                        {getCategoryName(
                          course.courseInfo.category as string | ICategory
                        )}
                      </p>
                      <p>Duration: {course.courseInfo.totalDuration}</p>

                      <div className="completion-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${calculateCompletionPercentage(
                                course
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span>{calculateCompletionPercentage(course)}%</span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="empty-courses-placeholder">
            <div className="empty-state">
              <img src="/empty-courses.svg" alt="No courses" />
              <h2>No courses found</h2>
              <p>You haven't enrolled in any courses yet.</p>
              <Link to="/courses" className="browse-courses-btn">
                Browse Courses
              </Link>
            </div>
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

export default MyLearningPage;
