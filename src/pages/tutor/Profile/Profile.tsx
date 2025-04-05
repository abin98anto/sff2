import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Grid,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { UploadIcon } from "lucide-react";

import "./Profile.scss";
import Loading from "../../../components/common/Loading/Loading";
import ResumeModal from "../../../components/common/Modal/ResumeModal/ResumeModal";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import useSnackbar from "../../../hooks/useSnackbar";
import comments from "../../../shared/constants/comments";
import uploadToCloudinary from "../../../shared/config/cloudinaryConfig";
import handleFileUpload, {
  validateImageFile,
} from "../../../shared/utils/cloudinary/fileUpload";
import { updateUser } from "../../../redux/thunks/user/userUpdateServices";

const ProfileSection = () => {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  let { userInfo } = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
      });
      setProfileImage(userInfo.picture || "");
    }
  }, [userInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [profileImage, setProfileImage] = useState(userInfo?.picture || "");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUploadClick = () => {
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

      setLoading(true);

      const { success, url, error } = await handleFileUpload(file, {
        validateFile: validateImageFile,
      });

      setLoading(false);

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
    }
  };

  const [resume, setResume] = useState<string | null>(userInfo?.resume || null);
  const handleResumeChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const resumeUrl = await uploadToCloudinary(file);
      setResume(resumeUrl);
      const updatedUser = await dispatch(updateUser({ resume: resumeUrl }));
      if (updatedUser) {
        setResume(resumeUrl);
        showSnackbar(comments.RESUME_UPLOAD_SUCC, "success");
      }
    } catch (error) {
      console.error(comments.RESUME_UPLOAD_FAIL, error);
      showSnackbar(comments.RESUME_UPLOAD_FAIL, "error");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete resume.
  const deleteResume = async () => {
    try {
      const updatedUser = await dispatch(updateUser({ resume: "" }));
      if (updatedUser) {
        setResume(null);
        showSnackbar(comments.RESUME_DELETE_SUCC, "success");
      }
    } catch (error) {
      showSnackbar(comments.RESUME_DELETE_FAIL, "error");
    }
  };

  // Form submit.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await dispatch(updateUser(formData)).unwrap();
      if (updatedUser) {
        showSnackbar(comments.USR_UPDATED_SUCC, "success");
      }
    } catch (error) {
      showSnackbar(comments.USR_UPDATED_FAIL, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="tutor-profile-section">
      <Typography variant="h4" className="tutor-profile-header">
        Profile Settings
      </Typography>

      {/* Profile Picture Section */}
      <Box className="tutor-profile-picture-container">
        <Box className="tutor-profile-picture-section">
          <Avatar src={profileImage || ""} className="tutor-profile-avatar" />
          <Box className="tutor-profile-picture-actions">
            <input
              type="file"
              accept="image/*"
              id="profile-image-input"
              hidden
              onChange={handleImageChange}
            />
            <label htmlFor="profile-image-input">
              <Button
                component="span"
                startIcon={<EditIcon />}
                variant="outlined"
                className="tutor-change-photo-btn"
                onClick={handleImageUploadClick}
              >
                Change Photo
              </Button>
            </label>
            <IconButton
              color="error"
              size="small"
              className="tutor-delete-photo-btn"
              disabled={
                !userInfo?.picture ||
                userInfo?.picture === "/default-avatar.png"
              }
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4} className="tutor-main-content">
        <Grid item xs={12} md={6} className="tutor-left-column">
          <form onSubmit={handleSubmit}>
            <Box className="tutor-basic-info-section">
              <Typography
                variant="h6"
                gutterBottom
                className="tutor-section-title"
              >
                Personal Information
              </Typography>
              <TextField
                fullWidth
                label="Name"
                name="name"
                variant="outlined"
                className="tutor-form-field"
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                variant="outlined"
                type="email"
                className="tutor-form-field"
                value={formData.email}
                onChange={handleChange}
              />
            </Box>

            <Box className="tutor-resume-section">
              <Typography
                variant="h6"
                gutterBottom
                className="tutor-section-title"
              >
                Resume
              </Typography>
              <Box className="tutor-resume-content">
                {resume ? (
                  <Box className="tutor-current-resume">
                    <Button
                      variant="text"
                      onClick={() => setIsModalOpen(true)}
                      style={{ textTransform: "none" }}
                    >
                      View Resume
                    </Button>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={deleteResume}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography className="tutor-text-content">
                    No resume uploaded
                  </Typography>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  id="resume-input"
                  hidden
                  onChange={handleResumeChange}
                />
                <label htmlFor="resume-input">
                  <Button
                    component="span"
                    startIcon={<UploadIcon />}
                    variant="outlined"
                    className="tutor-upload-btn"
                  >
                    Upload Resume
                  </Button>
                </label>
              </Box>
            </Box>

            <Box className="tutor-action-buttons tutor-personal-info-actions">
              <Button
                variant="contained"
                color="primary"
                className="tutor-save-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loading /> : "Save Personal Info"}
              </Button>
              <Button variant="outlined" className="tutor-cancel-btn">
                Cancel
              </Button>
            </Box>
          </form>
        </Grid>
      </Grid>

      {resume && (
        <ResumeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          resumeUrl={resume}
        />
      )}

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </Box>
  );
};

export default ProfileSection;
