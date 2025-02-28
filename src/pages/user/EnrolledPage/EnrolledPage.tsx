import { useEffect, useState } from "react";
import CourseViewer from "./components/CourseViewer";
import { useParams } from "react-router-dom";
import ICourse from "../../../entities/ICourse";
import axiosInstance from "../../../shared/config/axiosConfig";
import Loading from "../../../components/common/Loading/Loading";

const EnrolledPage = () => {
  const [courseData, setCourseData] = useState<ICourse>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { courseId } = useParams<{ courseId: string }>();

  const fetchCourseData = async () => {
    try {
      const response = await axiosInstance.get(`/course/${courseId}`);
      setCourseData(response.data.data);
      setIsLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "error getting the course details.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!courseData) return <div>No course data available</div>;

  return <CourseViewer course={courseData} />;
};

export default EnrolledPage;
