import React, { useState } from "react";
import UserSignup from "./UserSignup";
import TutorSignup from "./TutorSignup";
import OtpVerification from "./OtpVerification";
import UserLogin from "./UserLogin";
import TutorLogin from "./TutorLogin";
import "./AuthModal.scss";
import { images } from "../../../shared/constants/images";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialSection: AuthSection;
};

type AuthSection =
  | "userSignup"
  | "tutorSignup"
  | "otp"
  | "userLogin"
  | "tutorLogin";

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialSection,
}) => {
  const [currentSection, setCurrentSection] =
    useState<AuthSection>(initialSection);

  if (!isOpen) return null;

  const getImageForSection = (section: AuthSection) => {
    switch (section) {
      case "userSignup":
        return images.ROCKET_SIGNUP;
      case "tutorSignup":
        return images.TUTOR_SIGNUP;
      case "otp":
        return images.OTP;
      case "userLogin":
        return images.LOGIN_IMG;
      case "tutorLogin":
        return images.TUTOR_LOGIN;
      default:
        return images.ROCKET_SIGNUP;
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case "userSignup":
        return <UserSignup />;
      case "tutorSignup":
        return <TutorSignup />;
      case "otp":
        return <OtpVerification />;
      case "userLogin":
        return <UserLogin />;
      case "tutorLogin":
        return <TutorLogin heading="Tutor Login" />;
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div className="auth-modal-content">
          <div className="auth-form">{renderSection()}</div>
          <div className="auth-image">
            <img
              src={getImageForSection(currentSection) || "/placeholder.svg"}
              alt="Auth illustration"
            />
          </div>
        </div>
        <div className="auth-links">
          {currentSection === "userLogin" && (
            <>
              <button onClick={() => setCurrentSection("userSignup")}>
                Sign Up
              </button>
              <button onClick={() => setCurrentSection("tutorLogin")}>
                Tutor Login
              </button>
            </>
          )}
          {currentSection === "tutorLogin" && (
            <>
              <button onClick={() => setCurrentSection("userLogin")}>
                User Login
              </button>
              <button onClick={() => setCurrentSection("tutorSignup")}>
                Tutor Sign Up
              </button>
            </>
          )}
          {currentSection === "userSignup" && (
            <>
              <button onClick={() => setCurrentSection("userLogin")}>
                Login
              </button>
              <button onClick={() => setCurrentSection("tutorSignup")}>
                Tutor Sign Up
              </button>
            </>
          )}
          {currentSection === "tutorSignup" && (
            <>
              <button onClick={() => setCurrentSection("tutorLogin")}>
                Tutor Login
              </button>
              <button onClick={() => setCurrentSection("userSignup")}>
                User Sign Up
              </button>
            </>
          )}
          {currentSection === "otp" && (
            <>
              <button onClick={() => setCurrentSection("userLogin")}>
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;