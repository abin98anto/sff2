import { useState, useEffect } from "react";
import type { FormData } from "./form-types";
import { BasicInformation } from "./components/basic-information";
import { AdvanceInformation } from "./components/advance-information";
import { Curriculum } from "./components/curriculum";
import { ProgressSteps } from "./components/progress-steps";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { FormContainer, Header } from "./StyledComponents";
import { useNavigate } from "react-router-dom";
import { API } from "../../../../shared/constants/API";
import { comments } from "../../../../shared/constants/comments";
import { useSnackbar } from "../../../../hooks/useSnackbar";
import CustomSnackbar from "../../../../components/common/CustomSnackbar";

const STORAGE_KEY = "courseFormData";

const CourseForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    basicInfo: {
      title: "",
      subtitle: "",
      category: "",
      topic: "",
      language: "",
      duration: "",
    },
    advanceInfo: {
      thumbnail: null,
      description: "",
    },
    curriculum: {
      sections: [],
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setCurrentStep(3);
      } else if (
        parsedData.advanceInfo &&
        (parsedData.advanceInfo.description || parsedData.advanceInfo.thumbnail)
      ) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
    }
  }, []);

  useEffect(() => {
    const dataToStore = {
      ...formData,
      advanceInfo: {
        ...formData.advanceInfo,
        thumbnail: formData.advanceInfo.thumbnail
          ? "thumbnail_placeholder"
          : null,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [formData]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCancel = () => {
    setIsModalOpen(true);
  };

  const confirmCancel = () => {
    setFormData({
      basicInfo: {
        title: "",
        subtitle: "",
        category: "",
        topic: "",
        language: "",
        duration: "",
      },
      advanceInfo: {
        thumbnail: null,
        description: "",
      },
      curriculum: {
        sections: [],
      },
    });
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
    setError(errorMessage);
  };

  return (
    <FormContainer>
      <Header>
        <h1>Add a Course</h1>
      </Header>

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
        <AdvanceInformation
          data={formData.advanceInfo}
          onUpdate={(data) => updateFormData("advanceInfo", data)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onCancel={handleCancel}
          setError={handleError}
        />
      )}

      {currentStep === 3 && (
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
        onConfirm={confirmCancel}
        title="Discard Course"
        message={comments.COURSE_UNLIST}
      />

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </FormContainer>
  );
};

export default CourseForm;
