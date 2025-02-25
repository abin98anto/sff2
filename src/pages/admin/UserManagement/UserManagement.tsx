import { Trash2 } from "lucide-react";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import { IUser } from "../../../entities/IUser";
import useSnackbar from "../../../hooks/useSnackbar";
import DataTable, { Column } from "../../../components/common/Table/DataTable";
import { useCallback, useRef, useState } from "react";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import "./UserManagement.scss";
import CustomModal from "../../../components/common/Modal/CustomModal/CustomModal";

interface TableData {
  data: Partial<IUser>[];
  total: number;
}

const UserManagement = () => {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const refetchData = useRef<(() => void) | undefined>();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<IUser | null>(null);

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

  const fetchTableData = useCallback(
    async (queryParams: any): Promise<TableData> => {
      try {
        const response = await axiosInstance.get(`${API.USERS_LIST}/user`, {
          params: {
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
        showSnackbar("Error fetching student details", "error");
        console.error("Error fetching student details", err);
        return { data: [], total: 0 };
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

  return (
    <div className="user-management">
      <div className="user-container">
        <div className="header">
          <h1>User Management</h1>
        </div>
        <DataTable
          columns={columns as Column<Record<string, any>>[]}
          fetchData={fetchTableData}
          pageSize={10}
          initialSort={{ field: "createdAt", order: "desc" }}
          refetchRef={refetchData}
        />
      </div>

      {/* Confirmation Modal for Blocking/Unblocking User */}
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

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default UserManagement;
