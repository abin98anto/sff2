import type React from "react";
import "./UserProfile.scss";
import { Avatar, Box } from "@mui/material";

import { PencilIcon, LockIcon } from "./Icons";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import { useRef, useState } from "react";
import handleFileUpload, {
  validateImageFile,
} from "../../../shared/utils/cloudinary/fileUpload";
import comments from "../../../shared/constants/comments";
import { updateUser } from "../../../redux/thunks/user/userUpdateServices";
import CustomModal from "../../../components/common/Modal/CustomModal/CustomModal";
import axiosInstance from "../../../shared/config/axiosConfig";

const UserProfile: React.FC = () => {
  const { userInfo } = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  // Image upload.
  const dispatch = useAppDispatch();
  const [profileImage, setProfileImage] = useState(userInfo?.picture || "");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUploadClick = () => {
    setLoading(true);
    console.log("changing profile image", loading);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const { success, url, error } = await handleFileUpload(file, {
        validateFile: validateImageFile,
      });

      if (!success || !url) {
        showSnackbar(error || comments.IMG_UPLOAD_FAIL, "error");
        return;
      }

      setProfileImage(url);
      showSnackbar(comments.IMG_UPLOAD_SUCC, "success");
      const updatedUser = await dispatch(updateUser({ picture: url })).unwrap();

      if (updatedUser) {
        setProfileImage(url);
        showSnackbar(comments.IMG_UPLOAD_SUCC, "success");
      }
    } catch (err) {
      showSnackbar(comments.IMG_UPLOAD_FAIL, "error");
    } finally {
      setLoading(false);
    }
  };

  // Change password modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showSnackbar("New password and confirm password do not match", "error");
      return;
    }

    try {
      const response = await axiosInstance.put("/change-password", {
        currentPassword,
        newPassword,
      });
      
      if (response.data.success) {
        showSnackbar("Password changed successfully!", "success");
        setIsModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showSnackbar(response.data.message || "Failed to change password", "error");
      }
    } catch (err) {
      showSnackbar("Error changing password", "error");
    }
  };

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Settings</h2>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item active">
            <a href="#account">Account</a>
          </li>
          <li className="sidebar-menu-item">
            <a href="#courses">My Courses</a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="page-title">Account</h1>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-image-container">
            <Avatar
              src={profileImage}
              sx={{
                width: 300,
                height: 300,
                border: "2px solid #primary.main",
              }}
            />
            <Box className="profile-picture-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                id="profile-image-input"
                hidden
                onChange={handleImageChange}
              />
              <button
                className="edit-profile-button"
                onClick={handleImageUploadClick}
              >
                <PencilIcon />
              </button>
            </Box>
          </div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                value={userInfo?.name}
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={userInfo?.email}
                  readOnly
                />
                <LockIcon />
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="action-cards">
            <div className="action-card" onClick={() => setIsModalOpen(true)}>
              <div className="action-card-icon">
                <LockIcon />
              </div>
              <h3 className="action-card-title">Change password</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        header="Change Password"
        className="change-password-modal"
        buttons={[
          {
            text: "Cancel",
            onClick: () => setIsModalOpen(false),
            variant: "secondary",
          },
          {
            text: "Change Password",
            onClick: handleChangePassword,
            variant: "primary",
          },
        ]}
      >
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </CustomModal>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default UserProfile;
