import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Grid,
  Paper,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import "./Profile.scss";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import Loading from "../../../components/common/Loading/Loading";
import { useSnackbar } from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import { comments } from "../../../shared/constants/comments";
import {
  handleFileUpload,
  validateImageFile,
} from "../../../shared/utils/cloudinary/fileUpload";
import { updateUser } from "../../../redux/thunks/user/userUpdateServices";
import { uploadToCloudinary } from "../../../shared/config/cloudinaryConfig";
import { UploadIcon } from "lucide-react";

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

  // Image upload.
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

  // Resume upload.
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

  return (
    <Box className="profile-section">
      <Typography variant="h4" className="profile-header">
        Profile Settings
      </Typography>

      {/* Profile Picture Section */}
      <Box className="profile-picture-container">
        <Box className="profile-picture-section">
          <Avatar src={profileImage || ""} className="profile-avatar" />
          <Box className="profile-picture-actions">
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
                className="change-photo-btn"
                onClick={handleImageUploadClick}
              >
                Change Photo
              </Button>
            </label>
            <IconButton
              color="error"
              size="small"
              className="delete-photo-btn"
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

      <Grid container spacing={4} className="main-content">
        <Grid item xs={12} md={6} className="left-column">
          <form>
            <Box className="basic-info-section">
              <Typography variant="h6" gutterBottom className="section-title">
                Personal Information
              </Typography>
              <TextField
                fullWidth
                label="Name"
                name="name"
                variant="outlined"
                className="form-field"
                value={formData.name}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                variant="outlined"
                type="email"
                className="form-field"
                value={formData.email}
                onChange={handleChange}
              />
            </Box>

            <Box className="resume-section">
              <Typography variant="h6" gutterBottom className="section-title">
                Resume
              </Typography>
              <Box className="resume-content">
                {resume ? (
                  <Box className="current-resume">
                    <Button
                      variant="text"
                      // onClick={() => setIsModalOpen(true)}
                      style={{ textTransform: "none" }}
                    >
                      View Resume
                    </Button>
                    <IconButton
                      color="error"
                      size="small"
                      // onClick={deleteResume}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography className="text-content">
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
                    className="upload-btn"
                  >
                    Upload Resume
                  </Button>
                </label>
              </Box>
            </Box>

            <Box className="action-buttons personal-info-actions">
              <Button
                variant="contained"
                color="primary"
                className="save-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loading /> : "Save Personal Info"}
              </Button>
              <Button variant="outlined" className="cancel-btn">
                Cancel
              </Button>
            </Box>
          </form>
        </Grid>

        {/* Right Column - Password Change */}
        <Grid item xs={12} md={6} className="right-column">
          <Paper className="password-section">
            <Typography variant="h6" gutterBottom className="section-title">
              Change Password
            </Typography>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              variant="outlined"
              className="form-field"
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              variant="outlined"
              className="form-field"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              variant="outlined"
              className="form-field"
            />
            <Box className="action-buttons password-actions">
              <Button variant="contained" color="primary" className="save-btn">
                Change Password
              </Button>
              <Button variant="outlined" className="cancel-btn">
                Cancel
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

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
