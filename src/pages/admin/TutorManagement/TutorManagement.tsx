import { Plus, Trash2, CircleDollarSign } from "lucide-react";
import DataTable, {
  type Column,
} from "../../../components/common/Table/DataTable";
import type { IUser } from "../../../entities/IUser";
import useSnackbar from "../../../hooks/useSnackbar";
import { useCallback, useRef, useState } from "react";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import CustomModal from "../../../components/common/Modal/CustomModal/CustomModal";
import "./TutorManagement.scss";
import ResumeModal from "../../../components/common/Modal/ResumeModal/ResumeModal";
import comments from "../../../shared/constants/comments";
import ICourse from "../../../entities/ICourse";
import { ICourseNew } from "../../tutor/Dashboard/TutorDashboard";

interface TableData {
  data: Partial<IUser>[];
  total: number;
}

const TutorManagement = () => {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const refetchData = useRef<(() => void) | undefined>();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<IUser | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [unverifiedTutors, setUnverifiedTutors] = useState<IUser[]>([]);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [confirmApprovalOpen, setConfirmApprovalOpen] = useState(false);
  const [confirmDenialOpen, setConfirmDenialOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<IUser | null>(null);
  const [denialReason, setDenialReason] = useState<string>("");

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedTutorForCourses, setSelectedTutorForCourses] =
    useState<IUser | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [tutorToPay, setTutorToPay] = useState<IUser | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");

  const columns: Column<IUser>[] = [
    {
      key: "slNo",
      label: comments.TUTOR_COL_SLNO,
      render: (_, index: number) => index + 1,
    },
    {
      key: "name",
      label: comments.TUTOR_COL_NAME,
    },
    {
      key: "students.length",
      label: comments.TUTOR_COL_STUDENTS,
      render: (item: IUser) => item.students?.length || 0,
    },
    {
      key: "isActive",
      label: comments.TUTOR_COL_STATUS,
      render: (item: IUser) => (
        <span
          className={`status-badge ${item.isActive ? "active" : "inactive"}`}
        >
          {item.isActive ? comments.STATUS_ACTIVE : comments.STATUS_INACTIVE}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: comments.TUTOR_COL_JOINED,
      render: (item: IUser) =>
        new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(item.createdAt)),
    },
    {
      key: "actions",
      label: comments.TUTOR_COL_ACTIONS,
      render: (row: IUser) => (
        <div className="action-buttons">
          <button
            onClick={() => selectCoursesForTutor(row)}
            className="action-button assign"
            title="Assign Courses"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => handleBlockUser(row)}
            className="action-button delete"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => handlePayTutor(row)}
            className="action-button delete"
          >
            <CircleDollarSign size={16} />
          </button>
        </div>
      ),
    },
  ];

  // input: click on money buton.
  // output: open payment modal
  const handlePayTutor = (user: IUser) => {
    setTutorToPay(user);
    setPaymentAmount("");
    setIsPaymentModalOpen(true);
  };

  // New function to handle payment submission
  const handleConfirmPayment = async () => {
    try {
      if (!tutorToPay || !tutorToPay._id) {
        showSnackbar("No tutor selected", "error");
        return;
      }

      // Validate input is a valid number
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        showSnackbar("Please enter a valid payment amount", "error");
        return;
      }

      // Call API to update tutor's wallet
      await axiosInstance.put(`/admin/add-money`, {
        userId: tutorToPay._id,
        amount, // This will be added to the current wallet amount on the server
      });

      showSnackbar(
        `Payment of ${amount} successfully added to ${tutorToPay.name}'s wallet`,
        "success"
      );
      setIsPaymentModalOpen(false);
      setTutorToPay(null);
      setPaymentAmount("");

      // Refresh the data
      if (refetchData.current) {
        refetchData.current();
      }
    } catch (err) {
      showSnackbar("Failed to process payment", "error");
      console.error("Payment processing error:", err);
    }
  };

  // Function to handle numeric input only
  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setPaymentAmount(value);
    }
  };

  const fetchVerifiedTutors = useCallback(
    async (queryParams: any): Promise<TableData> => {
      try {
        const response = await axiosInstance.get(`${API.USERS_LIST}/tutor`, {
          params: {
            isVerified: true,
            page: queryParams.page,
            limit: queryParams.limit,
            search: queryParams.search,
          },
        });
console.log("the response", response.data);
        return {
          data: response.data || [],
          total: response.data.total || 0,
        };
      } catch (err) {
        showSnackbar(comments.TUTOR_FETCH_ERROR, "error");
        console.error(comments.TUTOR_FETCH_ERROR_LOG, err);
        return { data: [], total: 0 };
      }
    },
    []
  );

  const fetchUnverifiedTutors = useCallback(
    async (
      queryParams: any = { page: 1, limit: 100, search: "" }
    ): Promise<void> => {
      try {
        const response = await axiosInstance.get(`${API.USERS_LIST}/tutor`, {
          params: {
            isVerified: false,
            page: queryParams.page,
            limit: queryParams.limit,
            search: queryParams.search,
          },
        });
        setUnverifiedTutors(response.data || []);
      } catch (err) {
        showSnackbar(comments.UNVERIFIED_TUTOR_FETCH_ERROR, "error");
        console.error(comments.UNVERIFIED_TUTOR_FETCH_ERROR_LOG, err);
      }
    },
    []
  );

  const handleBlockUser = (user: IUser) => {
    setUserToBlock(user);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    try {
      if (!userToBlock || !userToBlock._id) {
        showSnackbar(comments.NO_USER_SELECTED, "error");
        return;
      }
      await axiosInstance.put(`${API.USER_BLOCK}/${userToBlock._id}`);
      const action = userToBlock.isActive
        ? comments.USER_BLOCKED
        : comments.USER_UNBLOCKED;
      showSnackbar(
        `${comments.USER_STATUS_UPDATE_PREFIX} ${action}`,
        "success"
      );
      setIsConfirmModalOpen(false);
      setUserToBlock(null);
      if (refetchData.current) {
        refetchData.current();
      }
    } catch (err) {
      showSnackbar(comments.USER_STATUS_UPDATE_ERROR, "error");
      console.error(comments.USER_STATUS_UPDATE_ERROR_LOG, err);
    }
  };

  const handleOpenApproveModal = () => {
    fetchUnverifiedTutors();
    setIsApproveModalOpen(true);
  };

  const handleViewResume = (resumeLink: string | undefined) => {
    if (resumeLink) {
      setResumeUrl(resumeLink);
      setResumeModalOpen(true);
    } else {
      showSnackbar(comments.NO_RESUME_AVAILABLE, "error");
    }
  };

  const handleCloseResumeModal = () => {
    setResumeModalOpen(false);
    setResumeUrl(null);
  };

  const handleApproveClick = (tutor: IUser) => {
    setSelectedTutor(tutor);
    setConfirmApprovalOpen(true);
  };

  const handleDenyClick = (tutor: IUser) => {
    setSelectedTutor(tutor);
    setDenialReason("");
    setConfirmDenialOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (selectedTutor?._id) {
      try {
        await axiosInstance.put(`${API.TUTOR_APPROVE}/${selectedTutor._id}`, {
          isVerified: true,
        });
        showSnackbar(comments.TUTOR_APPROVED_SUCCESS, "success");
        fetchUnverifiedTutors();
        if (refetchData.current) {
          refetchData.current();
        }
      } catch (error) {
        showSnackbar(comments.TUTOR_APPROVE_ERROR, "error");
        console.error(comments.TUTOR_APPROVE_ERROR_LOG, error);
      }
    }
    setConfirmApprovalOpen(false);
    setSelectedTutor(null);
  };

  const handleConfirmDenial = async () => {
    if (selectedTutor?._id) {
      if (!denialReason.trim()) {
        showSnackbar(comments.DENIAL_REASON_REQUIRED, "error");
        return;
      }
      try {
        await axiosInstance.put(`${API.TUTOR_DENY}/${selectedTutor._id}`, {
          isVerified: false,
          reason: denialReason,
        });
        showSnackbar(comments.TUTOR_DENIED_SUCCESS, "success");
        fetchUnverifiedTutors();
        if (refetchData.current) {
          refetchData.current();
        }
      } catch (error) {
        showSnackbar(comments.TUTOR_DENY_ERROR, "error");
        console.error(comments.TUTOR_DENY_ERROR_LOG, error);
      }
    }
    setConfirmDenialOpen(false);
    setSelectedTutor(null);
    setDenialReason("");
  };

  const tutorsAssignedCourses = async (tutorId: string) => {
    try {
      const response = await axiosInstance.get("/course/");
      const coursesData = response.data.data.data;
      setCourses(coursesData);

      const transformCourses = coursesData.map((course: ICourse) => ({
        ...course,
        tutors: course.tutors
          ? course.tutors.map((tutor: IUser) =>
              typeof tutor === "string" ? tutor : tutor._id ?? ""
            )
          : [],
      }));

      console.log("transformed courses", transformCourses);

      const assignedCourses = transformCourses
        .filter((course: ICourseNew) => course.tutors?.includes(tutorId))
        .map((course: ICourse) => course._id as string);

      console.log("assigned courses IDs", assignedCourses);
      setSelectedCourses(assignedCourses);
      console.log("first", selectedCourses);
    } catch (error) {
      showSnackbar("Error finding tutor's already assigned courses", "error");
      console.log("error finding tutor's already assigned courses", error);
    }
  };

  const selectCoursesForTutor = (tutor: IUser) => {
    setSelectedTutorForCourses(tutor);
    setSelectedCourses([]);
    tutorsAssignedCourses(tutor._id as string);
    setIsCourseModalOpen(true);
  };

  const handleCourseCheckboxChange = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleConfirmCourseAssignment = async () => {
    try {
      if (!selectedTutorForCourses?._id) {
        showSnackbar("No tutor selected", "error");
        return;
      }

      await axiosInstance.post(
        `${API.USERS_LIST}/tutor/${selectedTutorForCourses._id}/courses`,
        {
          courseIds: selectedCourses,
        }
      );

      showSnackbar("Courses assigned successfully", "success");
      setIsCourseModalOpen(false);
      setSelectedTutorForCourses(null);
      setSelectedCourses([]);

      if (refetchData.current) {
        refetchData.current();
      }
    } catch (err) {
      showSnackbar("Failed to assign courses", "error");
      console.error("Error assigning courses:", err);
    }
  };

  return (
    <div className="tutor-management">
      <div className="tutor-container">
        <div className="header">
          <h1>{comments.TUTOR_MANAGEMENT_TITLE}</h1>
          <button className="add-button" onClick={handleOpenApproveModal}>
            <Plus size={16} />
            {comments.APPROVE_TUTOR_BUTTON}
          </button>
        </div>
        <DataTable
          columns={columns as Column<Record<string, any>>[]}
          fetchData={fetchVerifiedTutors}
          pageSize={10}
          initialSort={{ field: "createdAt", order: "desc" }}
          refetchRef={refetchData}
        />
      </div>

      {/* user block/unblock modal */}
      <CustomModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setUserToBlock(null);
        }}
        header={comments.CONFIRM_ACTION_HEADER}
        buttons={[
          {
            text: userToBlock?.isActive
              ? comments.BLOCK_BUTTON
              : comments.UNBLOCK_BUTTON,
            onClick: handleConfirmBlock,
            variant: "primary",
          },
          {
            text: comments.CANCEL_BUTTON,
            onClick: () => {
              setIsConfirmModalOpen(false);
              setUserToBlock(null);
            },
            variant: "secondary",
          },
        ]}
      >
        <p>
          {comments.CONFIRM_BLOCK_MESSAGE_PREFIX}{" "}
          {userToBlock?.isActive
            ? comments.BLOCK_ACTION
            : comments.UNBLOCK_ACTION}{" "}
          {comments.CONFIRM_BLOCK_MESSAGE_SUFFIX} "{userToBlock?.name}"?
        </p>
      </CustomModal>

      {/* approve tutor modal */}
      <CustomModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        header={comments.APPROVE_TUTOR_HEADER}
        buttons={[
          {
            text: comments.CLOSE_BUTTON,
            onClick: () => setIsApproveModalOpen(false),
            variant: "secondary",
          },
        ]}
        className="wide"
      >
        <div className="tutors-table">
          <table>
            <thead>
              <tr>
                <th>{comments.TUTOR_COL_SLNO}</th>
                <th>{comments.TUTOR_COL_NAME}</th>
                <th>{comments.TUTOR_COL_EMAIL}</th>
                <th>{comments.TUTOR_COL_ACTIONS}</th>
              </tr>
            </thead>
            <tbody>
              {unverifiedTutors.map((tutor, index) => (
                <tr key={tutor._id || `tutor-${index}`}>
                  <td>{index + 1}</td>
                  <td>{tutor.name}</td>
                  <td>{tutor.email}</td>
                  <td>
                    <button
                      className="view-resume-btn"
                      onClick={() => handleViewResume(tutor.resume)}
                    >
                      {comments.VIEW_RESUME_BUTTON}
                    </button>
                    <button
                      className="approve-btn"
                      onClick={() => handleApproveClick(tutor)}
                    >
                      {comments.APPROVE_BUTTON}
                    </button>
                    <button
                      className="deny-btn"
                      onClick={() => handleDenyClick(tutor)}
                    >
                      {comments.DENY_BUTTON}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CustomModal>

      <ResumeModal
        isOpen={resumeModalOpen}
        onClose={handleCloseResumeModal}
        resumeUrl={resumeUrl || ""}
      />

      {/* Aprove/Deny modal */}
      <CustomModal
        isOpen={confirmApprovalOpen}
        onClose={() => setConfirmApprovalOpen(false)}
        header={comments.CONFIRM_APPROVAL_HEADER}
        buttons={[
          {
            text: comments.YES_APPROVE_BUTTON,
            onClick: handleConfirmApproval,
            variant: "primary",
          },
          {
            text: comments.CANCEL_BUTTON,
            onClick: () => setConfirmApprovalOpen(false),
            variant: "secondary",
          },
        ]}
      >
        <p>
          {comments.CONFIRM_APPROVE_MESSAGE_PREFIX} {selectedTutor?.name}{" "}
          {comments.CONFIRM_APPROVE_MESSAGE_SUFFIX}
        </p>
      </CustomModal>

      {/* Deny message modal */}
      <CustomModal
        isOpen={confirmDenialOpen}
        onClose={() => setConfirmDenialOpen(false)}
        header={comments.CONFIRM_DENIAL_HEADER}
        buttons={[
          {
            text: comments.YES_DENY_BUTTON,
            onClick: handleConfirmDenial,
            variant: "primary",
          },
          {
            text: comments.CANCEL_BUTTON,
            onClick: () => setConfirmDenialOpen(false),
            variant: "secondary",
          },
        ]}
      >
        <p>
          {comments.CONFIRM_DENY_MESSAGE_PREFIX} {selectedTutor?.name}
          {comments.CONFIRM_DENY_MESSAGE_SUFFIX}
        </p>
        <div style={{ marginTop: "10px" }}>
          <label htmlFor="denialReason">{comments.DENIAL_REASON_LABEL}</label>
          <textarea
            id="denialReason"
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            placeholder={comments.DENIAL_REASON_PLACEHOLDER}
            rows={4}
            style={{ width: "100%", marginTop: "5px" }}
          />
        </div>
      </CustomModal>

      {/* Assign tutor to course modal */}
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
      <CustomModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setSelectedTutorForCourses(null);
          setSelectedCourses([]);
        }}
        header={`Assign Courses to ${selectedTutorForCourses?.name || "Tutor"}`}
        buttons={[
          {
            text: "Assign",
            onClick: handleConfirmCourseAssignment,
            variant: "primary",
          },
          {
            text: "Cancel",
            onClick: () => {
              setIsCourseModalOpen(false);
              setSelectedTutorForCourses(null);
              setSelectedCourses([]);
            },
            variant: "secondary",
          },
        ]}
      >
        <div className="course-checklist">
          {courses.length === 0 ? (
            <p>Loading courses...</p>
          ) : (
            courses.map((course: ICourse) => (
              <div key={course._id} className="course-item">
                <input
                  type="checkbox"
                  id={`course-${course._id}`}
                  checked={selectedCourses.includes(course._id as string)}
                  onChange={() =>
                    handleCourseCheckboxChange(course._id as string)
                  }
                />
                <label htmlFor={`course-${course._id}`}>
                  <strong>{course.title}</strong>
                </label>
              </div>
            ))
          )}
        </div>
      </CustomModal>

      {/* Payment Modal */}
      <CustomModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setTutorToPay(null);
          setPaymentAmount("");
        }}
        header="Pay Tutor"
        buttons={[
          {
            text: "Pay Tutor",
            onClick: handleConfirmPayment,
            variant: "primary",
          },
          {
            text: "Cancel",
            onClick: () => {
              setIsPaymentModalOpen(false);
              setTutorToPay(null);
              setPaymentAmount("");
            },
            variant: "secondary",
          },
        ]}
      >
        <div className="payment-form">
          <p>Enter the amount to add to {tutorToPay?.name}'s wallet:</p>
          <div className="input-group" style={{ marginTop: "15px" }}>
            <label htmlFor="paymentAmount">Amount:</label>
            <input
              type="text"
              id="paymentAmount"
              value={paymentAmount}
              onChange={handlePaymentInputChange}
              placeholder="0.00"
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default TutorManagement;
