import { Plus, Trash2 } from "lucide-react";
import DataTable, { Column } from "../../../components/common/Table/DataTable";
import { IUser } from "../../../entities/IUser";
import useSnackbar from "../../../hooks/useSnackbar";
import { useCallback, useRef, useState } from "react";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import CustomModal from "../../../components/common/Modal/CustomModal/CustomModal";
import "./TutorManagement.scss";
import ResumeModal from "../../../components/common/Modal/ResumeModal/ResumeModal";

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

  const columns: Column<IUser>[] = [
    {
      key: "slNo",
      label: "Sl No.",
      render: (_, index: number) => index + 1,
    },
    {
      key: "name",
      label: "Name",
    },
    {
      key: "students.length",
      label: "Students",
      render: (item: IUser) => item.students?.length || 0,
    },
    { key: "reviewsTaken", label: "Reviews Taken" },
    { key: "sessionsTaken", label: "Sessions Taken" },
    {
      key: "isActive",
      label: "Status",
      render: (item: IUser) => (
        <span
          className={`status-badge ${item.isActive ? "active" : "inactive"}`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (item: IUser) =>
        new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(item.createdAt)),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: IUser) => (
        <div className="action-buttons">
          <button
            onClick={() => handleBlockUser(row)}
            className="action-button delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

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

        return {
          data: response.data || [],
          total: response.data.total || 0,
        };
      } catch (err) {
        showSnackbar("Error fetching tutor details", "error");
        console.error("Error fetching tutor details", err);
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
        showSnackbar("Error fetching unverified tutor details", "error");
        console.error("Error fetching unverified tutor details", err);
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
        showSnackbar("No user selected to block/unblock", "error");
        return;
      }
      await axiosInstance.put(`${API.USER_BLOCK}/${userToBlock._id}`);
      const action = userToBlock.isActive ? "blocked" : "unblocked";
      showSnackbar(`User ${action} successfully`, "success");
      setIsConfirmModalOpen(false);
      setUserToBlock(null);
      if (refetchData.current) {
        refetchData.current();
      }
    } catch (err) {
      showSnackbar("Error updating user status", "error");
      console.error("Error updating user status", err);
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
      showSnackbar("No resume available for this tutor", "error");
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
        showSnackbar("Tutor approved successfully", "success");
        fetchUnverifiedTutors();
        if (refetchData.current) {
          refetchData.current();
        }
      } catch (error) {
        showSnackbar("Error approving tutor", "error");
        console.error("Error approving tutor", error);
      }
    }
    setConfirmApprovalOpen(false);
    setSelectedTutor(null);
  };

  const handleConfirmDenial = async () => {
    if (selectedTutor?._id) {
      if (!denialReason.trim()) {
        showSnackbar("Please provide a reason for denial", "error");
        return;
      }
      try {
        await axiosInstance.put(`${API.TUTOR_DENY}/${selectedTutor._id}`, {
          isVerified: false,
          reason: denialReason,
        });
        showSnackbar("Tutor denied successfully", "success");
        fetchUnverifiedTutors();
        if (refetchData.current) {
          refetchData.current();
        }
      } catch (error) {
        showSnackbar("Error denying tutor", "error");
        console.error("Error denying tutor", error);
      }
    }
    setConfirmDenialOpen(false);
    setSelectedTutor(null);
    setDenialReason("");
  };

  return (
    <div className="tutor-management">
      <div className="tutor-container">
        <div className="header">
          <h1>Tutor Management</h1>
          <button className="add-button" onClick={handleOpenApproveModal}>
            <Plus size={16} />
            Approve Tutor
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

      <CustomModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setUserToBlock(null);
        }}
        header="Confirm Action"
        buttons={[
          {
            text: userToBlock?.isActive ? "Block" : "Unblock",
            onClick: handleConfirmBlock,
            variant: "primary",
          },
          {
            text: "Cancel",
            onClick: () => {
              setIsConfirmModalOpen(false);
              setUserToBlock(null);
            },
            variant: "secondary",
          },
        ]}
      >
        <p>
          Are you sure you want to {userToBlock?.isActive ? "block" : "unblock"}{" "}
          the user "{userToBlock?.name}"?
        </p>
      </CustomModal>

      <CustomModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        header="Approve Tutor"
        buttons={[
          {
            text: "Close",
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
                <th>Sl No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
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
                      View Resume
                    </button>
                    <button
                      className="approve-btn"
                      onClick={() => handleApproveClick(tutor)}
                    >
                      Approve
                    </button>
                    <button
                      className="deny-btn"
                      onClick={() => handleDenyClick(tutor)}
                    >
                      Deny
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

      <CustomModal
        isOpen={confirmApprovalOpen}
        onClose={() => setConfirmApprovalOpen(false)}
        header="Confirm Approval"
        buttons={[
          {
            text: "Yes, Approve",
            onClick: handleConfirmApproval,
            variant: "primary",
          },
          {
            text: "Cancel",
            onClick: () => setConfirmApprovalOpen(false),
            variant: "secondary",
          },
        ]}
      >
        <p>
          Are you sure you want to approve {selectedTutor?.name} as a tutor?
        </p>
      </CustomModal>

      <CustomModal
        isOpen={confirmDenialOpen}
        onClose={() => setConfirmDenialOpen(false)}
        header="Confirm Denial"
        buttons={[
          {
            text: "Yes, Deny",
            onClick: handleConfirmDenial,
            variant: "primary",
          },
          {
            text: "Cancel",
            onClick: () => setConfirmDenialOpen(false),
            variant: "secondary",
          },
        ]}
      >
        <p>
          Are you sure you want to deny {selectedTutor?.name}'s request to
          become a tutor?
        </p>
        <div style={{ marginTop: "10px" }}>
          <label htmlFor="denialReason">Reason for denial:</label>
          <textarea
            id="denialReason"
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            placeholder="Enter the reason for denying this tutor"
            rows={4}
            style={{ width: "100%", marginTop: "5px" }}
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

export default TutorManagement;
