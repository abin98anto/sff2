import { useCallback, useRef, useState } from "react";
import ISubscription from "../../../entities/ISubscription";
import useSnackbar from "../../../hooks/useSnackbar";
import DataTable, { Column } from "../../../components/common/Table/DataTable";
import { Pencil, Plus, Trash2 } from "lucide-react";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import "./SubscriptionManagement.scss";
import CustomModal from "../../../components/common/Modal/CustomModal/CustomModal";

interface SubscriptionFormData {
  _id?: string;
  name: string;
  description: string;
  features: {
    hasVideoCall: boolean;
    hasChat: boolean;
    hasCertificate: boolean;
  };
  userCount: number;
  price: number;
  discountPrice: number;
  discountStartDate?: Date | null;
  discountExpiry?: Date | null;
  isCreated: Date;
  isActive: boolean;
}

interface TableData {
  data: ISubscription[];
  total: number;
}

const initialState: SubscriptionFormData = {
  name: "",
  description: "",
  features: { hasVideoCall: false, hasChat: false, hasCertificate: false },
  userCount: 0,
  price: 0,
  discountPrice: 0,
  discountStartDate: null,
  discountExpiry: null,
  isCreated: new Date(),
  isActive: true,
};

const SubscriptionManagement = () => {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const [isModalOpen, setIsModalOpen] = useState(false); // For add/edit modal
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // For confirmation modal
  const [formData, setFormData] = useState<SubscriptionFormData>(initialState);
  const [subscriptionToToggle, setSubscriptionToToggle] =
    useState<ISubscription | null>(null);
  const refetchData = useRef<(() => void) | undefined>();

  //   Populate table.
  const columns: Column<ISubscription>[] = [
    { key: "slNo", label: "Sl No.", render: (_, index: number) => index + 1 },
    { key: "name", label: "Name" },
    {
      key: "features",
      label: "Features",
      render: (item: ISubscription) => {
        const trueFeatures = [];
        if (item.features.hasVideoCall) trueFeatures.push("Video Call");
        if (item.features.hasChat) trueFeatures.push("Chat");
        if (item.features.hasCertificate) trueFeatures.push("Certificate");
        return (
          <ul>
            {trueFeatures.length > 0 ? (
              trueFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))
            ) : (
              <li>None</li>
            )}
          </ul>
        );
      },
    },
    { key: "price", label: "Price" },
    { key: "discountPrice", label: "Discount Price" },
    {
      key: "users.length",
      label: "User Count",
      render: (item: ISubscription) => item.users.length,
    },
    {
      key: "isActive",
      label: "Status",
      render: (item: ISubscription) => (
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
      render: (item: ISubscription) =>
        new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(item.createdAt)),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: ISubscription) => (
        <div className="action-buttons">
          <button
            className="action-button edit"
            onClick={() => handleEdit(row)}
          >
            <Pencil size={16} />
          </button>
          <button
            className="action-button delete"
            onClick={() => handleToggleActive(row)}
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
        const response = await axiosInstance.get(API.SUBSCRIPTION_GET, {
          params: {
            page: queryParams.page,
            limit: queryParams.limit,
            search: queryParams.search,
            sortField: queryParams.sortField,
            sortOrder: queryParams.sortOrder,
          },
        });
        return {
          data: response.data.data.data || [],
          total: response.data.data.total || 0,
        };
      } catch (err) {
        showSnackbar("Error fetching subscription data", "error");
        console.error("Error fetching subscription data", err);
        return { data: [], total: 0 };
      }
    },
    []
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        features: { ...prev.features, [name]: checked },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "price" || name === "discountPrice" ? Number(value) : value,
      }));
    }
  };

  //   Add/edit subscription.
  const handleDateChange = (name: string, date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleEdit = (subscription: ISubscription) => {
    setFormData({
      ...subscription,
      price: subscription.price ?? 0,
      discountPrice: subscription.discountPrice ?? 0,
      discountStartDate: subscription.discountStartDate
        ? new Date(subscription.discountStartDate)
        : null,
      discountExpiry: subscription.discountValidity
        ? new Date(subscription.discountValidity)
        : null,
      isCreated: new Date(subscription.createdAt),
      userCount: subscription.users.length,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        showSnackbar("Name is required", "error");
        return;
      }
      if (formData.price < 0 || formData.discountPrice < 0) {
        showSnackbar("Price and discount price must be non-negative", "error");
        return;
      }
      if (
        formData.discountStartDate &&
        formData.discountExpiry &&
        formData.discountStartDate >= formData.discountExpiry
      ) {
        showSnackbar("Expiry date must be after start date", "error");
        return;
      }

      const payload = {
        ...formData,
        discountValidity: formData.discountExpiry || undefined,
      };

      if (isEditMode) {
        await axiosInstance.put(API.SUBSCRIPTION_UPDATE, {
          ...payload,
          _id: formData._id,
        });
        showSnackbar("Subscription updated successfully", "success");
      } else {
        await axiosInstance.post(API.SUBSCRIPTION_ADD, payload);
        showSnackbar("Subscription added successfully", "success");
      }

      setFormData(initialState);
      setIsModalOpen(false);
      setIsEditMode(false);
      if (refetchData.current) {
        refetchData.current();
      } else {
        console.warn("refetchData is not available");
      }
    } catch (err) {
      showSnackbar(
        `Error ${isEditMode ? "updating" : "adding"} subscription`,
        "error"
      );
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} subscription`,
        err
      );
    }
  };

  //   Toggle status
  const handleToggleActive = (subscription: ISubscription) => {
    setSubscriptionToToggle(subscription);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!subscriptionToToggle || !subscriptionToToggle._id) {
      showSnackbar("No subscription selected", "error");
      return;
    }

    try {
      const newStatus = !subscriptionToToggle.isActive;
      await axiosInstance.put(API.SUBSCRIPTION_UPDATE, {
        ...subscriptionToToggle,
        isActive: newStatus,
      });
      showSnackbar(
        `Subscription ${newStatus ? "listed" : "unlisted"} successfully`,
        "success"
      );
      setIsConfirmModalOpen(false);
      setSubscriptionToToggle(null);
      if (refetchData.current) {
        refetchData.current();
      } else {
        console.warn("refetchData is not available");
      }
    } catch (err) {
      showSnackbar("Error toggling subscription status", "error");
      console.error("Error toggling subscription status", err);
    }
  };

  return (
    <div className="subscription-management">
      <div className="subscription-container">
        <div className="header">
          <h1>Subscription Management</h1>
          <button
            className="add-button"
            onClick={() => {
              setIsEditMode(false);
              setFormData(initialState);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} />
            Add Subscription
          </button>
        </div>

        <DataTable
          columns={columns as Column<Record<string, any>>[]}
          fetchData={fetchTableData}
          pageSize={10}
          initialSort={{ field: "createdAt", order: "desc" }}
          refetchRef={refetchData}
        />
      </div>

      {/* Edit / Add Subscription Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setFormData(initialState);
        }}
        header={isEditMode ? "Edit Subscription" : "Add Subscription"}
        buttons={[
          { text: "Save", onClick: handleSubmit, variant: "primary" },
          {
            text: "Cancel",
            onClick: () => {
              setIsModalOpen(false);
              setIsEditMode(false);
              setFormData(initialState);
            },
            variant: "secondary",
          },
        ]}
        className="wide"
      >
        <form className="subscription-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter subscription name"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter the description"
            />
          </div>

          <div className="form-group">
            <label>Features</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="hasVideoCall"
                  checked={formData.features.hasVideoCall}
                  onChange={handleInputChange}
                />
                Video Call
              </label>
              <label>
                <input
                  type="checkbox"
                  name="hasChat"
                  checked={formData.features.hasChat}
                  onChange={handleInputChange}
                />
                Chat
              </label>
              <label>
                <input
                  type="checkbox"
                  name="hasCertificate"
                  checked={formData.features.hasCertificate}
                  onChange={handleInputChange}
                />
                Certificate
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              placeholder="Enter price"
            />
          </div>

          <div className="form-group">
            <label>Discount Price</label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleInputChange}
              min="0"
              placeholder="Enter discount price"
            />
          </div>

          <div className="form-group">
            <label>Discount Start Date</label>
            <input
              type="date"
              name="discountStartDate"
              value={
                formData.discountStartDate
                  ? formData.discountStartDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                handleDateChange(
                  "discountStartDate",
                  e.target.value ? new Date(e.target.value) : null
                )
              }
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="form-group">
            <label>Discount Expiry Date</label>
            <input
              type="date"
              name="discountExpiry"
              value={
                formData.discountExpiry
                  ? formData.discountExpiry.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                handleDateChange(
                  "discountExpiry",
                  e.target.value ? new Date(e.target.value) : null
                )
              }
              min={
                formData.discountStartDate
                  ? formData.discountStartDate.toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
            />
          </div>
        </form>
      </CustomModal>

      {/* Confirmation Modal for Toggling Active Status */}
      <CustomModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSubscriptionToToggle(null);
        }}
        header="Confirm Action"
        buttons={[
          {
            text: subscriptionToToggle?.isActive ? "Unlist" : "List",
            onClick: handleConfirmToggle,
            variant: "primary",
          },
          {
            text: "Cancel",
            onClick: () => {
              setIsConfirmModalOpen(false);
              setSubscriptionToToggle(null);
            },
            variant: "secondary",
          },
        ]}
      >
        <p>
          Are you sure you want to{" "}
          {subscriptionToToggle?.isActive ? "unlist" : "list"} the subscription
          "{subscriptionToToggle?.name}"?
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

export default SubscriptionManagement;
