import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./CourseForm.scss";
import { ICourse } from "../../../../entities/ICourse";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  };
  const [formData, setFormData] = useState<ICourse>(initialCourseData);

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData) as ICourse;
      setFormData(parsedData);
      if (parsedData.curriculum && parsedData.curriculum.length > 0) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

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
    localStorage.removeItem(STORAGE_KEY);
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
        <h1>Add a Course</h1>
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
        />
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onYes={confirmCancel}
        onNo={() => setIsModalOpen(false)}
        title="Discard Course"
        content={comments.COURSE_DISCARD}
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
