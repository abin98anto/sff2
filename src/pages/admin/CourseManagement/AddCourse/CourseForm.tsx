// CourseForm.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./CourseForm.scss";
import ICourse from "../../../../entities/ICourse";
import BasicInformation from "./components/BasicInformation";
import Curriculum from "./components/Curriculum";
import ProgressSteps from "./components/ProgressSteps";
import useSnackbar from "../../../../hooks/useSnackbar";
import ConfirmationModal from "../../../../components/common/Modal/ConfirmationModal/ConfirmationModal";
import comments from "../../../../shared/constants/comments";
import CustomSnackbar from "../../../../components/common/CustomSnackbar";
import API from "../../../../shared/constants/API";

const STORAGE_KEY = "courseFormData";

const CourseForm = () => {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, _] = useState(!!id);

  const initialCourseData: ICourse = {
    title: "",
    subtitle: "",
    category: "",
    topic: "",
    language: "",
    level: "",
    prerequisites: "",
    thumbnail: "",
    description: "",
    curriculum: [],
    tutors: [],
    totalDuration: 0,
    totalLessons: 0,
    enrollmentCount: 0,
    isActive: false,
    createdAt: Date.now(),
  };
  const [formData, setFormData] = useState<ICourse>(initialCourseData);

  useEffect(() => {
    if (isEditMode && location.state?.course) {
      setFormData(location.state.course);
      setCurrentStep(location.state.course.curriculum.length > 0 ? 2 : 1);
    } else {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData) as ICourse;
        setFormData(parsedData);
        setCurrentStep(parsedData.curriculum.length > 0 ? 2 : 1);
      }
    }
  }, [isEditMode, location.state]);

  useEffect(() => {
    if (!isEditMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isEditMode]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCancel = () => {
    setIsModalOpen(true);
  };

  const confirmCancel = () => {
    setFormData(initialCourseData);
    setCurrentStep(1);
    if (!isEditMode) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsModalOpen(false);
    navigate(API.COURSE_MNGMT);
  };

  const updateFormData = (data: Partial<ICourse>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleError = (errorMessage: string) => {
    showSnackbar(errorMessage, "error");
  };

  return (
    <div className="course-form">
      <div className="header">
        <h1>{isEditMode ? "Edit Course" : "Add a Course"}</h1>
      </div>

      <ProgressSteps currentStep={currentStep} />

      {currentStep === 1 && (
        <BasicInformation
          data={formData}
          onUpdate={updateFormData}
          onNext={handleNext}
          onCancel={handleCancel}
          setError={handleError}
        />
      )}
      {currentStep === 2 && (
        <Curriculum
          data={formData.curriculum}
          onUpdate={(curriculumData) =>
            updateFormData({ curriculum: curriculumData })
          }
          onPrevious={handlePrevious}
          onCancel={handleCancel}
          setError={handleError}
          courseFormData={formData}
          isEditMode={isEditMode}
          showSnackbar={showSnackbar}
        />
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onYes={confirmCancel}
        onNo={() => setIsModalOpen(false)}
        title={isEditMode ? "Discard Changes" : "Discard Course"}
        content={
          isEditMode ? comments.COURSE_EDIT_DISCARD : comments.COURSE_DISCARD
        }
      />

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default CourseForm;
