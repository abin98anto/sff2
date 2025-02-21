import { CheckIcon } from "lucide-react";
import "../CourseForm.scss";

interface Step {
  id: number;
  name: string;
}

interface ProgressStepsProps {
  currentStep: number;
}

const ProgressSteps = ({ currentStep }: ProgressStepsProps) => {
  const steps: Step[] = [
    { id: 1, name: "Basic Information" },
    { id: 2, name: "Curriculum" },
  ];

  return (
    <div className="progress-steps-container">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`step-box ${currentStep > step.id ? "completed" : ""} ${
            currentStep === step.id ? "active" : ""
          }`}
        >
          <div
            className={`step-icon ${currentStep > step.id ? "completed" : ""}`}
          >
            {currentStep > step.id ? <CheckIcon size={12} /> : step.id}
          </div>
          <span
            className={`step-text ${currentStep > step.id ? "completed" : ""} ${
              currentStep === step.id ? "active" : ""
            }`}
          >
            {step.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;
