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
import comments from "../../../shared/constants/comments";

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
      label: comments.USER_COL_SLNO,
      render: (_, index: number) => index + 1,
    },
    {
      key: "name",
      label: comments.USER_COL_NAME,
    },
    {
      key: "isActive",
      label: comments.USER_COL_STATUS,
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
      label: comments.USER_COL_JOINED,
      render: (item: IUser) =>
        new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(item.createdAt)),
    },
    {
      key: "actions",
      label: comments.USER_COL_ACTIONS,
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
        showSnackbar(comments.USER_FETCH_ERROR, "error");
        console.error(comments.USER_FETCH_ERROR_LOG, err);
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
        showSnackbar(comments.NO_USER_SELECTED, "error");
        return;
      }

      await axiosInstance.put(`${API.USER_BLOCK}/${userToBlock._id}`);
      const action = userToBlock.isActive
        ? comments.USER_BLOCKED
        : comments.USER_UNBLOCKED;
      showSnackbar(
        `${comments.USER_STATUS_UPDATE_PREFIX} ${action} ${comments.USER_STATUS_UPDATE_SUFFIX}`,
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

  return (
    <div className="user-management">
      <div className="user-container">
        <div className="header">
          <h1>{comments.USER_MANAGEMENT_TITLE}</h1>
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
