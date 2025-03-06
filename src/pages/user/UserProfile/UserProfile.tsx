import type React from "react";
import "./UserProfile.scss";
import { Avatar, Box } from "@mui/material";
import { PencilIcon, LockIcon, DownloadIcon } from "./Icons";
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
// import DataTable, {
//   Column,
// } from "../../../components/common/DataTable/DataTable";
import { format } from "date-fns";
import DataTable from "../../../components/common/Table/DataTable";
import generateCertificate from "../../../shared/utils/certificate-generation/generateCertificate";

// Interface for enrollment data
interface CourseInfo {
  _id: string;
  name: string;
  startDate: string;
}

interface IEnrollment {
  _id: string;
  userId: string;
  courseId: CourseInfo;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TableData<T = any> {
  data: T[];
  total: number;
}

// interface QueryParams {
//   page: number;
//   limit: number;
//   search: string;
//   sortField?: string;
//   sortOrder?: "asc" | "desc";
//   filters?: Record<string, string>;
// }

const UserProfile: React.FC = () => {
  const { userInfo } = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState<"account" | "courses">("account");

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
        showSnackbar(
          response.data.message || "Failed to change password",
          "error"
        );
      }
    } catch (err) {
      showSnackbar("Error changing password", "error");
    }
  };

  // Fetch user courses - explicitly typed to match the DataTable's expected types
  const fetchUserCourses = async (): Promise<TableData<IEnrollment>> => {
    try {
      // const { page, limit, search, sortField, sortOrder } = params;
      let url = `/enrollment/user-enrollments`;

      // if (search) {
      //   url += `&search=${search}`;
      // }

      // if (sortField && sortOrder) {
      //   url += `&sortField=${sortField}&sortOrder=${sortOrder}`;
      // }

      const response = await axiosInstance.get(url);
      console.log("the response0", response.data.data);
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
      };
    } catch (error) {
      console.error("Error fetching user courses:", error);
      showSnackbar("Failed to fetch courses", "error");
      return { data: [], total: 0 };
    }
  };

  // Handle certificate download
  const handleCertificateDownload = async (
    enrollmentId: string,
    courseName: string
  ) => {
    try {
      // Show a loading message
      showSnackbar("Generating certificate...", "success");

      // First, try to fetch the certificate data from the server
      const response = await axiosInstance.get(`/enrollment/${enrollmentId}`);
      const enrollmentData = response.data.data;

      if (!enrollmentData) {
        throw new Error("Could not retrieve enrollment data");
      }

      // Format the completion date
      const completionDate = enrollmentData.completedDate
        ? format(new Date(enrollmentData.completedDate), "MMMM dd, yyyy")
        : format(new Date(), "MMMM dd, yyyy");

      console.log("Certificate data prepared:", {
        userName: userInfo?.name,
        courseName,
        completionDate,
        enrollmentId,
      });

      // Prepare the certificate data
      const certificateData = {
        userName: userInfo?.name || "Student",
        courseName: courseName,
        completionDate: completionDate,
        enrollmentId: enrollmentId,
      };

      // Generate and download the certificate
      await generateCertificate(certificateData);

      // Show success message after a slight delay to ensure download has started
      setTimeout(() => {
        showSnackbar("Certificate generated successfully", "success");
      }, 1000);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      showSnackbar(
        "Failed to generate certificate. Please try again.",
        "error"
      );

      // Add fallback server-side generation here if you have that functionality
    }
  };

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Settings</h2>
        <ul className="sidebar-menu">
          <li
            className={`sidebar-menu-item ${
              activeTab === "account" ? "active" : ""
            }`}
          >
            <a
              href="#account"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("account");
              }}
            >
              Account
            </a>
          </li>
          <li
            className={`sidebar-menu-item ${
              activeTab === "courses" ? "active" : ""
            }`}
          >
            <a
              href="#courses"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("courses");
              }}
            >
              My Courses
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === "account" ? (
          <>
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
                <div
                  className="action-card"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="action-card-icon">
                    <LockIcon />
                  </div>
                  <h3 className="action-card-title">Change password</h3>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="courses-container">
            <h1 className="page-title">My Courses</h1>
            {/* Using the generic type parameter to specify IEnrollment */}
            <DataTable
              columns={[
                {
                  key: "slNo",
                  label: "Sl No",
                  render: (_, index) => index + 1,
                },
                {
                  key: "courseName",
                  label: "Course Name",
                  render: (row) => row.courseId.title,
                },
                {
                  key: "startDate",
                  label: "Start Date",
                  render: (row) => {
                    console.log("ene enee erow", row);
                    // Check if startDate exists and is valid
                    if (!row.enrolledAt) {
                      return "N/A"; // Return a fallback if no date
                    }

                    try {
                      return format(new Date(row.enrolledAt), "MMM dd, yyyy");
                    } catch (error) {
                      console.error("Invalid date:", row.enrolledAt);
                      return "Invalid date"; // Return a fallback for invalid dates
                    }
                  },
                },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => (
                    <span
                      className={`status-badge ${row.status.toLowerCase()}`}
                    >
                      {row.status}
                    </span>
                  ),
                },
                {
                  key: "certificate",
                  label: "Certificate",
                  render: (row) =>
                    row.status.toLowerCase() === "passed" ? (
                      <button
                        className="download-button"
                        onClick={() =>
                          handleCertificateDownload(row._id, row.courseId.title)
                        }
                      >
                        <DownloadIcon /> Download
                      </button>
                    ) : (
                      <span className="not-available">Not Available</span>
                    ),
                },
              ]}
              fetchData={fetchUserCourses}
              pageSize={5}
              initialSort={{ field: "startDate", order: "desc" }}
            />
          </div>
        )}
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
