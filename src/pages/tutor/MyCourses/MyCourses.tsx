import { useEffect, useState } from "react";
import ICourse from "../../../entities/ICourse";
import { ICategory } from "../../../entities/ICategory";
import useSnackbar from "../../../hooks/useSnackbar";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import comments from "../../../shared/constants/comments";
import Loading from "../../../components/common/Loading/Loading";
import { Link } from "react-router-dom";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { IUser } from "../../../entities/IUser";
import { ICourseNew } from "../Dashboard/TutorDashboard";

const MyCourses = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useAppSelector((state) => state.user);
  const userId = userInfo?._id as string;
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await axiosInstance.get(API.CATEGORY_GET);
      const fetchedCategories = categoriesResponse.data.data.data.data;

      const validCategories = Array.isArray(fetchedCategories)
        ? fetchedCategories
        : [];

      setCategories([{ _id: "All", name: "All" }, ...validCategories]);
    } catch (err) {
      showSnackbar(comments.CAT_FETCH_FAIL, "error");
      console.error(comments.CAT_FETCH_FAIL, err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get(API.COURSE_GET);
      const courses = response.data.data.data.map((course: ICourse) => ({
        ...course,
        tutors: course.tutors!.map((tutor: Partial<IUser>) => tutor._id),
      }));

      const tutorCourses = courses
        .map((course: ICourseNew) => {
          if (course.tutors?.includes(userId)) {
            return course;
          }
        })
        .filter((courses: string) => courses !== undefined);

      //   console.log("tut's cours", tutorCourses);
      setCourses(tutorCourses);
    } catch (error) {
      console.log("error fetching tutors courses", error);
    }
  };

  const getCategoryName = (category: string | ICategory) => {
    if (typeof category === "string") {
      const foundCategory = categories.find((cat) => cat._id === category);
      return foundCategory ? foundCategory.name : "Unknown";
    }
    return category.name || "Unknown";
  };

  useEffect(() => {
    setLoading(true);
    fetchCategories();
    fetchCourses();
    setLoading(false);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="courses-page">
      <div className="container">
        <h1 className="tutor-courses-heading" style={{ color: "white" }}>
          My Courses
        </h1>

        <div className="course-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course._id} className="course-card">
                <Link
                  to={`/course/${course._id}`}
                  key={course._id}
                  className="course-card-link"
                >
                  <img src={course.thumbnail} alt={course.title} />

                  <div className="course-info">
                    <h2>{course.title}</h2>
                    <p>Language: {course.language}</p>
                    <p className="subtitle">{course.subtitle}</p>
                    <p className="category">
                      Category:{" "}
                      {getCategoryName(course.category as string | ICategory)}
                    </p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="no-courses">
              <p>You don't have any courses yet.</p>
            </div>
          )}
        </div>
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

export default MyCourses;
