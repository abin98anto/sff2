import { useEffect, useState } from "react";
import CustomSnackbar from "../../../../components/common/CustomSnackbar";
import Loading from "../../../../components/common/Loading/Loading";
import CourseViewer from "../../../user/EnrolledPage/components/CourseViewer";
import axiosInstance from "../../../../shared/config/axiosConfig";
import { useParams } from "react-router-dom";
import useSnackbar from "../../../../hooks/useSnackbar";
import ICourse from "../../../../entities/ICourse";

const StudyCourse = () => {
  const [courseData, setCourseData] = useState<ICourse>();
  const [isLoading, setIsLoading] = useState(true);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

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
      showSnackbar(errorMessage, "error");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  if (isLoading) return <Loading />;
  if (!courseData) return <div>No course data available</div>;

  return (
    <>
      <CourseViewer course={courseData} />
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </>
  );
};

export default StudyCourse;
