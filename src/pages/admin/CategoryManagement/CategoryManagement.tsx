import { useState, useRef, useCallback } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import "./CategoryManagement.scss";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import comments from "../../../shared/constants/comments";
import ICategory from "../../../entities/misc/ICategory";
import DataTable, { Column } from "../../../components/common/Table/DataTable";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomModal from "../../../components/common/Modal/CustomModal/CustomModal";

interface CategoryFormData {
  _id?: string;
  name: string;
  isActive: boolean;
}

interface TableData {
  data: ICategory[];
  total: number;
}

const CategoryManagement = () => {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    isActive: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const refetchData = useRef<(() => void) | undefined>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns: Column<ICategory>[] = [
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
      render: (item: ICategory) => (
        <span
          className={`status-badge ${item.isActive ? "active" : "inactive"}`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (item: ICategory) =>
        new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(item.createdAt)),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: ICategory) => (
        <div className="action-buttons">
          <button
            onClick={() => handleEdit(row)}
            className="action-button edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => {
              setDeleteId(row._id);
              setIsDeleteModalOpen(true);
            }}
            className="action-button delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // input:initial load.
  // output: data to be displayed on table.
  const fetchTableData = useCallback(
    async (queryParams: any): Promise<TableData> => {
      try {
        const response = await axiosInstance.get(API.CATEGORY_GET, {
          params: {
            page: queryParams.page,
            limit: queryParams.limit,
            search: queryParams.search,
            sortField: queryParams.sortField,
            sortOrder: queryParams.sortOrder,
          },
        });

        return {
          data: response.data.data.data.data,
          total: response.data.data.data.total,
        };
      } catch (err) {
        showSnackbar(comments.CAT_FETCH_FAIL, "error");
        console.error(comments.CAT_FETCH_FAIL, err);
        return { data: [], total: 0 };
      }
    },
    []
  );

  // Add/Edit Category handlers
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        showSnackbar(comments.ALL_FIELDS_REQ, "error");
        return;
      }

      if (isEditing) {
        await axiosInstance.put(API.CATEGORY_UPDATE, formData);
        showSnackbar(comments.CAT_UPDATE_SUCC, "success");
      } else {
        await axiosInstance.post(API.CATEGORY_ADD, formData);
        showSnackbar(comments.CAT_ADD_SUCC, "success");
      }

      setIsAddModalOpen(false);
      resetForm();
      refetchData.current?.();
    } catch (err: any) {
      if (err.response?.status === 409) {
        showSnackbar(comments.CAT_NAME_DUP, "error");
      } else {
        showSnackbar(
          isEditing ? comments.CAT_UPDATE_FAIL : comments.CAT_ADD_FAIL,
          "error"
        );
      }
      console.error(
        isEditing ? comments.CAT_UPDATE_FAIL : comments.CAT_ADD_FAIL,
        err
      );
    }
  };

  // input: click on delete button.
  // output: delete category api call.
  const handleDelete = async () => {
    if (deleteId) {
      try {
        await axiosInstance.delete(API.CATEGORY_DELETE, {
          data: { _id: deleteId },
        });
        refetchData.current?.();
        setIsDeleteModalOpen(false);
        showSnackbar(comments.CAT_DELETE_SUCC, "success");
      } catch (err) {
        showSnackbar(comments.CAT_DELETE_FAIL, "error");
        console.error(comments.CAT_DELETE_FAIL, err);
      }
    }
  };

  // input: click on edit button.
  // output: open edit modal.
  const handleEdit = (category: ICategory) => {
    setFormData({
      _id: category._id,
      name: category.name,
      isActive: category.isActive,
    });
    setIsEditing(true);
    setIsAddModalOpen(true);
  };

  // input: click on cancel button.
  // output: close add/edit modal.
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  // input: click on cancel button.
  // output: close delete modal.
  const resetForm = () => {
    setFormData({
      name: "",
      isActive: true,
    });
    setIsEditing(false);
  };

  return (
    <div className="category-management">
      <div className="category-container">
        <div className="header">
          <h1>Category Management</h1>
          <button
            className="add-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        <DataTable
          columns={columns as Column<Record<string, any>>[]}
          fetchData={fetchTableData}
          pageSize={10}
          initialSort={{ field: "createdAt", order: "desc" }}
          refetchRef={refetchData}
        />

        {/* Add/Edit Modal */}
        <CustomModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          header={isEditing ? "Edit Category" : "Add Category"}
          buttons={[
            {
              text: "Cancel",
              onClick: handleCloseAddModal,
              variant: "secondary",
            },
            {
              text: isEditing ? "Update" : "Add",
              onClick: handleSubmit,
              variant: "primary",
            },
          ]}
        >
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="isActive">Status</label>
            <select
              id="isActive"
              value={formData.isActive.toString()}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.value === "true",
                })
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </CustomModal>

        {/* Unlist Confirmation Modal */}
        <CustomModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          header="Delete Category"
          buttons={[
            {
              text: "No",
              onClick: () => setIsDeleteModalOpen(false),
              variant: "secondary",
            },
            {
              text: "Yes",
              onClick: handleDelete,
              variant: "primary",
            },
          ]}
        >
          <p>Are you sure you want to delete this category?</p>
        </CustomModal>

        <CustomSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={hideSnackbar}
        />
      </div>
    </div>
  );
};

export default CategoryManagement;
