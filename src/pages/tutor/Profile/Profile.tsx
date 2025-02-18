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
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";

import "./Profile.scss";
import { useAppSelector } from "../../../hooks/reduxHooks";

const ProfileSection = () => {
  const { userInfo, loading } = useAppSelector((state) => state.user);
  console.log("the user ", userInfo);

  return (
    <Box className="profile-section">
      <Typography variant="h4" className="profile-header">
        Profile Settings
      </Typography>

      {/* Profile Picture Section */}
      <Box className="profile-picture-container">
        <Box className="profile-picture-section">
          <Avatar src={userInfo?.picture || ""} className="profile-avatar" />
          <Box className="profile-picture-actions">
            <input
              type="file"
              accept="image/*"
              id="profile-image-input"
              hidden
              // onChange={handleImageChange}
            />
            <label htmlFor="profile-image-input">
              <Button
                component="span"
                startIcon={<EditIcon />}
                variant="outlined"
                className="change-photo-btn"
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
              // onClick={deleteImage}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4} className="main-content">
        <Grid item xs={12} md={6} className="left-column">
          {/* <form onSubmit={handleSubmit(onSubmitPersonalInfo)}> */}
          <form>
            <Box className="basic-info-section">
              <Typography variant="h6" gutterBottom className="section-title">
                Personal Information
              </Typography>
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                className="form-field"
                InputLabelProps={{
                  className: "field-label",
                }}
                InputProps={{
                  className: "input-field",
                }}
              />
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
                className="form-field"
                InputLabelProps={{
                  className: "field-label",
                }}
                InputProps={{
                  className: "input-field",
                }}
              />
            </Box>

            <Box className="resume-section">
              <Typography variant="h6" gutterBottom className="section-title">
                Resume
              </Typography>
              <Box className="resume-content">
                {userInfo?.resume ? (
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
                      <span>delete</span>
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
                  // onChange={handleResumeChange}
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
                // disabled={loading}
              >
                {loading ? "Saving..." : "Save Personal Info"}
              </Button>
              <Button
                variant="outlined"
                className="cancel-btn"
                // onClick={handleCancel}
                // disabled={loading}
              >
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
              InputLabelProps={{
                className: "field-label",
              }}
              InputProps={{
                className: "input-field",
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              variant="outlined"
              className="form-field"
              InputLabelProps={{
                className: "field-label",
              }}
              InputProps={{
                className: "input-field",
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              variant="outlined"
              className="form-field"
              InputLabelProps={{
                className: "field-label",
              }}
              InputProps={{
                className: "input-field",
              }}
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
    </Box>
  );
};

export default ProfileSection;
