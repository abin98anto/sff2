import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import "./CourseManagement.scss";
import DataTable, { Column } from "../../../components/common/Table/DataTable";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import { useSnackbar } from "../../../hooks/useSnackbar";
import { ICourse } from "../../../entities/ICourse";
import ConfirmationModal from "../../../components/common/Modal/ConfirmationModal/ConfirmationModal";
import { axiosInstance } from "../../../shared/config/axiosConfig";
import { API } from "../../../shared/constants/API";
import { comments } from "../../../shared/constants/comments";

interface TableData {
  data: ICourse[];
  total: number;
}

const CourseManagement = () => {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [_, setToggleId] = useState<string | null>(null);

  const [toggleCourse, setToggleCourse] = useState<ICourse | null>(null);
  setToggleCourse(null);

  const refetchData = useRef<(() => void) | undefined>();

  const handleEdit = (row: ICourse) => {
    console.log(row);
  };
  const handleToggle = () => {};

  const columns: Column<ICourse>[] = [
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
      render: (item: ICourse) => (
        <span
          className={`status-badge ${item.isActive ? "active" : "inactive"}`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "tutors",
      label: "Tutors Assigned",
      render: (item: ICourse) => (
        <div className="tutors-list">
          {item?.tutors && item.tutors.length > 0 ? (
            item.tutors.map((tutor, index) => (
              <span key={tutor._id}>
                {tutor.name}
                {index < item.tutors!.length - 1 && ", "}
              </span>
            ))
          ) : (
            <span>No tutors assigned</span>
          )}
        </div>
      ),
    },
    {
      key: "enrollmentCount",
      label: "Total Enrolled",
      render: (item: ICourse) => item.enrollmentCount,
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (item: ICourse) =>
        new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(item.createdAt)),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: ICourse) => (
        <div className="action-buttons">
          <button
            onClick={() => handleEdit(row)}
            className="action-button edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => {
              setToggleId(row._id);
              setToggleModalOpen(true);
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
        const response = await axiosInstance.get(API.COURSE_GET, {
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
        showSnackbar(comments.COURSE_FETCH_FAIL, "error");
        console.error(comments.COURSE_FETCH_FAIL, err);
        return { data: [], total: 0 };
      }
    },
    []
  );

  return (
    <div className="course-management">
      <div className="course-container">
        <h1>Course Management</h1>
        <button className="add-button">
          <Plus size={16} />
          Add Course
        </button>

        <DataTable
          columns={columns as Column<Record<string, any>>[]}
          fetchData={fetchTableData}
          pageSize={10}
          initialSort={{ field: "createdAt", order: "desc" }}
          refetchRef={refetchData}
        />

        <ConfirmationModal
          isOpen={toggleModalOpen}
          title={toggleCourse?.isActive ? "Unlist Course" : "List Course"}
          content={`Are you sure you want to ${
            toggleCourse?.isActive ? "unlist" : "list"
          } this course?`}
          onYes={handleToggle}
          onNo={() => setToggleModalOpen(false)}
          onClose={() => setToggleModalOpen(false)}
        />

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

export default CourseManagement;
