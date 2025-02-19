// ProgressSteps.tsx
import { CheckIcon } from "lucide-react";
import "../CourseForm.scss";

interface Step {
  id: number;
  name: string;
  progress: string;
}

interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps: Step[] = [
    { id: 1, name: "Basic Information", progress: "" },
    { id: 2, name: "Curriculum", progress: "" },
  ];

  return (
    <div className="progress-steps-container">
      {steps.map((step: Step) => (
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
          <span className="step-progress">{step.progress}</span>
        </div>
      ))}
    </div>
  );
}
