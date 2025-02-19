import { useState, useEffect } from "react";
import type { FormData } from "./form-types";
import BasicInformation from "./components/BasicInformation";
import { Curriculum } from "./components/Curriculum";
import { ProgressSteps } from "./components/ProgressSteps";
import { useNavigate } from "react-router-dom";
import "./CourseForm.scss";
import { useSnackbar } from "../../../../hooks/useSnackbar";
import ConfirmationModal from "../../../../components/common/Modal/ConfirmationModal/ConfirmationModal";
import { comments } from "../../../../shared/constants/comments";
import CustomSnackbar from "../../../../components/common/CustomSnackbar";
import { API } from "../../../../shared/constants/API";

const STORAGE_KEY = "courseFormData";

export default function CourseForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const initialCourseData: FormData = {
    basicInfo: {
      title: "",
      subtitle: "",
      category: "",
      topic: "",
      language: "",
      duration: "",
      thumbnail: null,
      description: "",
    },
    curriculum: {
      sections: [],
    },
  };
  const [formData, setFormData] = useState<FormData>(initialCourseData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData(parsedData);
      if (
        parsedData.curriculum &&
        parsedData.curriculum.sections &&
        parsedData.curriculum.sections.length > 0
      ) {
        setCurrentStep(2); // Now there are only 2 steps
      } else {
        setCurrentStep(1);
      }
    }
  }, []);

  useEffect(() => {
    // Since we're no longer using advanceInfo, we just store basicInfo and curriculum
    const dataToStore = {
      ...formData,
      basicInfo: {
        ...formData.basicInfo,
        thumbnail: formData.basicInfo.thumbnail
          ? "thumbnail_placeholder"
          : null,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [formData]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 2)); // Only 2 steps now
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

  const updateFormData = (
    section: keyof FormData,
    data: Partial<FormData[keyof FormData]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
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
          data={formData.basicInfo}
          onUpdate={(data) => updateFormData("basicInfo", data)}
          onNext={handleNext}
          onCancel={handleCancel}
          setError={handleError}
        />
      )}
      {currentStep === 2 && (
        <Curriculum
          data={formData.curriculum}
          onUpdate={(data) => updateFormData("curriculum", data)}
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
}
