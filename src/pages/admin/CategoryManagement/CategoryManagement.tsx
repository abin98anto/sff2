import { useState, useRef, useCallback } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import "./CategoryManagement.scss";
import { axiosInstance } from "../../../shared/config/axiosConfig";
import AddModal from "../../../components/common/Modal/AddModal/AddModal";
import Placeholder from "../../../components/common/Placeholder/Placeholder";
import { API } from "../../../shared/constants/API";
import { comments } from "../../../shared/constants/comments";
import type { ICategory } from "../../../entities/misc/ICategory";
import DataTable, { Column } from "../../../components/common/Table/DataTable";
import ConfirmationModal from "../../../components/common/Modal/ConfirmationModal/ConfirmationModal";

interface CategoryFormData {
  _id?: string;
  name: string;
  isActive: boolean;
}

interface TableData {
  data: ICategory[];
  total: number;
}

export default function CategoryManagement() {
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        new Date(item.createdAt).toLocaleDateString(),
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
        setError(comments.CAT_FETCH_FAIL);
        console.error(comments.CAT_FETCH_FAIL, err);
        return { data: [], total: 0 };
      }
    },
    []
  );

  const handleAdd = async () => {
    try {
      await axiosInstance.post(API.CATEGORY_ADD, formData);
      setIsModalOpen(false);
      resetForm();
      refetchData.current?.();
    } catch (err) {
      console.error(comments.CAT_ADD_FAIL, err);
      setError(comments.CAT_ADD_FAIL);
    }
  };

  const handleUpdate = async () => {
    try {
      await axiosInstance.put(API.CATEGORY_UPDATE, formData);
      setIsModalOpen(false);
      resetForm();
      refetchData.current?.();
    } catch (err) {
      console.error(comments.CAT_UPDATE_FAIL, err);
      setError(comments.CAT_UPDATE_FAIL);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await axiosInstance.delete(API.CATEGORY_DELETE, {
          data: { _id: deleteId },
        });
        refetchData.current?.();
        setIsDeleteModalOpen(false);
      } catch (err) {
        console.error(comments.CAT_DELETE_FAIL, err);
        setError(comments.CAT_DELETE_FAIL);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      isActive: true,
    });
    setIsEditing(false);
  };

  const handleEdit = (category: ICategory) => {
    setFormData({
      _id: category._id,
      name: category.name,
      isActive: category.isActive,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <div className="category-management">
      <div className="category-container">
        <h1>Category Management</h1>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Add Category
        </button>

        {error ? (
          <Placeholder message={error} />
        ) : (
          <DataTable
            columns={columns as Column<Record<string, any>>[]}
            fetchData={fetchTableData}
            pageSize={10}
            initialSort={{ field: "createdAt", order: "desc" }}
            refetchRef={refetchData}
          />
        )}

        <AddModal
          isOpen={isModalOpen}
          title={isEditing ? "Edit Category" : "Add Category"}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          onSubmit={(e) => {
            e.preventDefault();
            isEditing ? handleUpdate() : handleAdd();
          }}
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
        </AddModal>
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Delete Category"
          content="Are you sure you want to delete this category?"
          onYes={handleDelete}
          onNo={() => setIsDeleteModalOpen(false)}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      </div>
    </div>
  );
}
