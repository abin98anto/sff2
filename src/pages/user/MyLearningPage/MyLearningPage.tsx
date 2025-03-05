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

const MyLearningPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<ICourse[]>([]);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const coursesPerPage = 8;

  const { userInfo } = useAppSelector((state: AppRootState) => state.user);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/enrollment/user-enrollments", {
        params: {
          page,
          limit: coursesPerPage,
        },
      });

      const pendingEnrollments = response.data.data.filter(
        (enrollment: IEnrollment) => enrollment.status === "pending"
      );

      setEnrolledCourses(
        pendingEnrollments.map((enrollment: IEnrollment) => enrollment.courseId)
      );

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

  if (loading) return <Loading />;

  // Handle both string IDs and populated category objects
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

        <div className="course-grid">
          {enrolledCourses.map((course) => (
            <div key={course._id} className="course-card">
              <img
                src={course.thumbnail || "/placeholder.svg"}
                alt={course.title}
              />

              <div className="course-info">
                <Link
                  to={`/study/${course._id}`}
                  key={course._id}
                  className="course-card-link"
                >
                  <h2>{course.title}</h2>
                  <p>Language: {course.language}</p>
                  <p className="subtitle">{course.subtitle}</p>
                  <p className="category">
                    Category:{" "}
                    {getCategoryName(course.category as string | ICategory)}
                  </p>
                  <p>Duration: {course.totalDuration}</p>
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
