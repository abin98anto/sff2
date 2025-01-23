import type React from "react";
import { useState } from "react";
import UserSignup from "./UserSignup";
import TutorSignup from "./TutorSignup";
import OtpVerification from "./OtpVerification";
import UserLogin from "./UserLogin";
import TutorLogin from "./TutorLogin";
import "./AuthModal.scss";
import { images } from "../../../shared/constants/images";
import { axiosInstance } from "../../../shared/config/axiosConfig";
import { API } from "../../../shared/constants/API";
import { useSelector } from "react-redux";
import { AppRootState } from "../../../redux/store";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { resetUserInfo } from "../../../redux/slices/userSlice";

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

  const { userInfo } = useSelector((state: AppRootState) => state.user);
  const dispatch = useAppDispatch();

  const handleClose = async () => {
    if (currentSection === "otp") {
      try {
        await axiosInstance.delete(
          `${API.USER_DELETE}?email=${userInfo?.email}`
        );
        dispatch(resetUserInfo());
      } catch (error) {
        console.error("Error during API call:", error);
      }
    }
    setCurrentSection("userLogin");
    onClose();
  };

  if (!isOpen) return null;

  const getImageForSection = (section: AuthSection) => {
    switch (section) {
      case "userSignup":
        return images.ROCKET_SIGNUP;
      case "tutorSignup":
        return images.TUTOR_SIGNUP;
      case "otp":
        return images.ROCKET_SIGNUP;
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
        return <UserSignup onSignupSuccess={() => setCurrentSection("otp")} />;
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

  const renderAuthLinks = () => {
    switch (currentSection) {
      case "userLogin":
        return (
          <>
            <button onClick={() => setCurrentSection("userSignup")}>
              Sign Up
            </button>
            <button onClick={() => setCurrentSection("tutorLogin")}>
              Tutor Login
            </button>
          </>
        );
      case "tutorLogin":
        return (
          <>
            <button onClick={() => setCurrentSection("userLogin")}>
              User Login
            </button>
            <button onClick={() => setCurrentSection("tutorSignup")}>
              Tutor Sign Up
            </button>
          </>
        );
      case "userSignup":
        return (
          <>
            <button onClick={() => setCurrentSection("userLogin")}>
              Login
            </button>
            <button onClick={() => setCurrentSection("tutorSignup")}>
              Tutor Sign Up
            </button>
          </>
        );
      case "tutorSignup":
        return (
          <>
            <button onClick={() => setCurrentSection("tutorLogin")}>
              Tutor Login
            </button>
            <button onClick={() => setCurrentSection("userSignup")}>
              User Sign Up
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={handleClose}>
          &times;
        </button>
        <div className="auth-modal-content">
          <div className="auth-form-container">
            <div className="auth-form">{renderSection()}</div>
            <div className="auth-links">{renderAuthLinks()}</div>
          </div>
          <div className="auth-image">
            <img
              src={getImageForSection(currentSection) || "/placeholder.svg"}
              alt="Auth illustration"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
