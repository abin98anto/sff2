import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./CourseManagement.scss";
import ICourse from "../../../entities/ICourse";
import useSnackbar from "../../../hooks/useSnackbar";
import DataTable, { Column } from "../../../components/common/Table/DataTable";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import ConfirmationModal from "../../../components/common/Modal/ConfirmationModal/ConfirmationModal";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import comments from "../../../shared/constants/comments";
import { IUser } from "../../../entities/IUser";

interface TableData {
  data: ICourse[];
  total: number;
}

const CourseManagement = () => {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [toggleId, setToggleId] = useState<string | null>(null);
  const [toggleCourse, setToggleCourse] = useState<ICourse | null>(null);
  const refetchData = useRef<(() => void) | undefined>();
  const navigate = useNavigate();

  const handleEdit = (row: ICourse) => {
    navigate(`/admin/edit-course/${row._id}`, { state: { course: row } });
  };

  const addCourse = () => {
    navigate("/admin/add-course");
  };

  // Populating the table.
  const columns: Column<ICourse>[] = [
    {
      key: "slNo",
      label: "Sl No.",
      render: (_, index: number) => index + 1,
    },
    {
      key: "title",
      label: "Name",
      render: (item: ICourse) => item.title || "No title",
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
          {item.tutors && item.tutors.length > 0 ? (
            item.tutors.map((tutor: IUser, index: number) => (
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
              setToggleId(row._id || "");
              setToggleCourse(row);
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

        const courses =
          response.data.data.courses || response.data.data.data || [];
        const total =
          response.data.data.total || response.data.data.data.total || 0;

        return {
          data: courses,
          total: total,
        };
      } catch (err) {
        showSnackbar(comments.COURSE_FETCH_FAIL, "error");
        console.error(comments.COURSE_FETCH_FAIL, err);
        return { data: [], total: 0 };
      }
    },
    [showSnackbar]
  );

  // Toggling course status.
  const handleToggle = async () => {
    if (!toggleId || !toggleCourse) return;

    try {
      const updatedStatus = !toggleCourse.isActive;
      const response = await axiosInstance.put(API.COURSE_UPDATE, {
        _id: toggleId,
        isActive: updatedStatus,
      });

      if (response.data.success) {
        showSnackbar(
          `Course ${updatedStatus ? "listed" : "unlisted"} successfully`,
          "success"
        );
        if (refetchData.current) {
          refetchData.current();
        }
      }
    } catch (error) {
      console.error("Error updating course status:", error);
      showSnackbar("Failed to update course status", "error");
    } finally {
      setToggleModalOpen(false);
      setToggleId(null);
      setToggleCourse(null);
    }
  };

  return (
    <div className="course-management">
      <div className="course-container">
        <h1>Course Management</h1>
        <button className="add-button" onClick={addCourse}>
          <Plus size={16} />
          Add Course
        </button>

        <DataTable
          columns={columns as Column<Record<string, any>>[]}
          fetchData={fetchTableData}
          pageSize={10}
          initialSort={{ field: "title", order: "asc" }}
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
