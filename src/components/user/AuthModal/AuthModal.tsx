import type React from "react";
import { useState } from "react";
import UserLogin from "./UserLogin";
import UserSignup from "./UserSignup";
import OtpVerification from "./OtpVerification";
import "./AuthModal.scss";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import { resetUserInfo } from "../../../redux/slices/userSlice";
import images from "../../../shared/constants/images";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { AppRootState } from "../../../redux/store";
import comments from "../../../shared/constants/comments";

type AuthSection = "signup" | "otp" | "login";
type UserRole = "user" | "tutor";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection: AuthSection;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialSection,
}) => {
  const [currentSection, setCurrentSection] =
    useState<AuthSection>(initialSection);
  const [userRole, setUserRole] = useState<UserRole>("user");

  const { userInfo } = useAppSelector((state: AppRootState) => state.user);

  const dispatch = useAppDispatch();

  const handleClose = async () => {
    if (currentSection === "otp") {
      try {
        await axiosInstance.delete(
          `${API.USER_DELETE}?email=${userInfo?.email}`
        );
        dispatch(resetUserInfo());
      } catch (error) {
        console.error(comments.USER_DEL_FAIL, error);
      }
    }
    setCurrentSection("login");
    setUserRole("user");
    onClose();
  };

  const handleVerificationSuccess = () => {
    setCurrentSection("login");
  };

  const getImageForSection = (section: AuthSection, role: UserRole) => {
    switch (section) {
      case "signup":
        return role === "tutor" ? images.TUTOR_SIGNUP : images.ROCKET_SIGNUP;
      case "otp":
        return role === "tutor" ? images.TUTOR_SIGNUP : images.ROCKET_SIGNUP;
      case "login":
        return role === "tutor" ? images.TUTOR_LOGIN : images.LOGIN_IMG;
      default:
        return images.ROCKET_SIGNUP;
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case "signup":
        return (
          <UserSignup
            onSignupSuccess={() => setCurrentSection("otp")}
            userRole={userRole}
            image={getImageForSection(currentSection, userRole)}
          />
        );
      case "otp":
        return (
          <OtpVerification onVerificationSuccess={handleVerificationSuccess} />
        );
      case "login":
        return (
          <UserLogin
            userRole={userRole}
            image={getImageForSection(currentSection, userRole)}
            onClose={onClose}
          />
        );
    }
  };

  const renderAuthLinks = () => {
    switch (currentSection) {
      case "login":
        return (
          <>
            <button onClick={() => setCurrentSection("signup")}>Sign Up</button>
            <button
              onClick={() => {
                setUserRole(userRole === "user" ? "tutor" : "user");
              }}
            >
              {userRole === "user" ? "Tutor Login" : "User Login"}
            </button>
          </>
        );
      case "signup":
        return (
          <>
            <button onClick={() => setCurrentSection("login")}>Login</button>
            <button
              onClick={() => {
                setUserRole(userRole === "user" ? "tutor" : "user");
              }}
            >
              {userRole === "user" ? "Tutor Sign Up" : "User Sign Up"}
            </button>
          </>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

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
              src={
                getImageForSection(currentSection, userRole) ||
                "/placeholder.svg"
              }
              alt="Auth illustration"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
