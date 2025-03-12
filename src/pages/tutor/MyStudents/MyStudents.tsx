import { useState, useRef, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import axiosInstance from "../../../shared/config/axiosConfig";
import DataTable, { Column } from "../../../components/common/Table/DataTable";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomModal from "../../../components/common/Modal/CustomModal/CustomModal";
import "./MyStudents.scss";
import { EnrollStatus } from "../../../entities/misc/enrollStatus";
import comments from "../../../shared/constants/comments";
import API from "../../../shared/constants/API";

// Define your interfaces
interface IStudent {
  _id: string;
  name: string;
  email: string;
  reviewsTaken: number;
  sessionsTaken: number;
}

interface ICourse {
  _id: string;
  title: string;
  subtitle: string;
  category: string;
  topic: string;
  totalLessons: number;
}

interface IEnrollment {
  _id: string;
  status: string;
  startDate: string;
  completedLessons: string[];
}

interface IStudentData {
  _id: string;
  studentId: IStudent;
  tutorId: string;
  courseId: ICourse;
  messages: string[];
  createdAt: string;
  updatedAt: string;
  enrollment: IEnrollment | null;
  __v: number;
}

interface TableData {
  data: IStudentData[];
  total: number;
}

const MyStudents = () => {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const [selectedStudent, setSelectedStudent] = useState<IStudentData | null>(
    null
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const refetchData = useRef<(() => void) | undefined>();

  // Populate Table columns
  const columns: Column<IStudentData>[] = [
    {
      key: "slNo",
      label: comments.STUDENT_COL_SLNO,
      render: (_, index: number) => index + 1,
    },
    {
      key: "studentName",
      label: comments.STUDENT_COL_NAME,
      render: (item: IStudentData) => item.studentId.name,
    },
    {
      key: "courseName",
      label: comments.STUDENT_COL_COURSE,
      render: (item: IStudentData) => item.courseId.title,
    },
    {
      key: "startDate",
      label: comments.STUDENT_COL_START_DATE,
      render: (item: IStudentData) => {
        const date = item.enrollment?.startDate || item.createdAt;
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(date));
      },
    },
    {
      key: "status",
      label: comments.STUDENT_COL_STATUS,
      render: (item: IStudentData) => (
        <span
          className={`status-badge ${
            item.enrollment?.status === comments.STUDENT_STATUS_ACTIVE
              ? "active"
              : "inactive"
          }`}
        >
          {item.enrollment?.status || comments.STUDENT_STATUS_PENDING}
        </span>
      ),
    },
    {
      key: "completionPercentage",
      label: "Completion",
      render: (item: IStudentData) => {
        if (!item.enrollment || !item.courseId.totalLessons) {
          return "0%";
        }

        const completedLessons = item.enrollment.completedLessons?.length || 0;
        const totalLessons = item.courseId.totalLessons || 0;

        if (totalLessons === 0) return "0%";

        const percentage = Math.round((completedLessons / totalLessons) * 100);

        return (
          <div className="completion-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span>{percentage}%</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: comments.STUDENT_COL_ACTIONS,
      render: (row: IStudentData) => (
        <div className="action-buttons">
          {row.enrollment?.status?.toLowerCase() === "completed" && (
            <button
              onClick={() => handleReviewOpen(row)}
              className="action-button review"
              title="Review Student"
            >
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const fetchTableData = useCallback(
    async (queryParams: any): Promise<TableData> => {
      try {
        // First fetch the chat list
        const chatResponse = await axiosInstance.get(API.CHAT_STUDENT_LIST, {
          params: {
            page: queryParams.page,
            limit: queryParams.limit,
            search: queryParams.search,
            sortField: queryParams.sortField,
            sortOrder: queryParams.sortOrder,
          },
        });

        if (chatResponse.data.success && chatResponse.data.data.length > 0) {
          const chatData = chatResponse.data.data;

          // For each chat, fetch enrollment details
          const studentsWithEnrollments = await Promise.all(
            chatData.map(async (chat: any) => {
              try {
                const enrollmentResponse = await axiosInstance.post(
                  API.ENROLLMENT_GET_DETAILS,
                  {
                    courseId: chat.courseId._id,
                    userId: chat.studentId._id,
                  }
                );

                return {
                  ...chat,
                  enrollment: enrollmentResponse.data.success
                    ? enrollmentResponse.data.data
                    : null,
                };
              } catch (error) {
                console.error("Error fetching enrollment:", error);
                return {
                  ...chat,
                  enrollment: null,
                };
              }
            })
          );

          return {
            data: studentsWithEnrollments,
            total: chatResponse.data.total || studentsWithEnrollments.length,
          };
        }

        return { data: [], total: 0 };
      } catch (error) {
        showSnackbar(comments.STUDENT_FETCH_ERROR, "error");
        console.error("Error fetching students:", error);
        return { data: [], total: 0 };
      }
    },
    [showSnackbar]
  );

  const handleReviewOpen = (student: IStudentData) => {
    setSelectedStudent(student);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (isPassed: boolean) => {
    if (!selectedStudent) return;

    setIsLoading(true);

    try {
      const response = await axiosInstance.put(API.ENROLLMENT_UPDATE, {
        updates: {
          _id: selectedStudent.enrollment?._id,
          status: EnrollStatus.PASSED,
        },
      });
      console.log("the yes res", response.data);
      if (response.data.success) {
        showSnackbar(
          isPassed
            ? comments.STUDENT_REVIEW_SUCCESS
            : comments.STUDENT_REVIEW_FAIL,
          isPassed ? "success" : "error"
        );

        // Refresh the table data
        if (refetchData.current) {
          refetchData.current();
        }
      } else {
        showSnackbar(
          comments.STUDENT_REVIEW_ERROR + ": " + response.data.message,
          "error"
        );
      }
    } catch (error) {
      console.error(comments.STUDENT_REVIEW_ERROR, error);
      showSnackbar(comments.STUDENT_REVIEW_ERROR, "error");
    } finally {
      setIsLoading(false);
      setIsReviewModalOpen(false);
    }
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="my-students">
      <div className="students-container">
        <div className="header">
          <h1>{comments.MY_STUDENTS_TITLE}</h1>
        </div>

        <DataTable
          columns={columns as Column<Record<string, any>>[]}
          fetchData={fetchTableData}
          pageSize={10}
          initialSort={{ field: "createdAt", order: "desc" }}
          refetchRef={refetchData}
        />

        {/* Review Confirmation Modal */}
        <CustomModal
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
          header={comments.STUDENT_REVIEW_TITLE}
          className="review-modal"
          buttons={[
            {
              text: comments.STUDENT_REVIEW_PASS_BUTTON,
              onClick: () => handleReviewSubmit(true),
              variant: "primary",
            },
            {
              text: comments.STUDENT_REVIEW_FAIL_BUTTON,
              onClick: () => closeReviewModal(),
              variant: "secondary",
            },
          ]}
        >
          <div className="review-confirmation">
            <p>
              {comments.STUDENT_REVIEW_CONFIRMATION}{" "}
              <strong>{selectedStudent?.studentId.name}</strong>{" "}
              {comments.STUDENT_REVIEW_PASSED}{" "}
              <strong>{selectedStudent?.courseId.title}</strong>?
            </p>
            {isLoading && (
              <div className="loading-indicator">
                {comments.STUDENT_REVIEW_PROCESSING}
              </div>
            )}
          </div>
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

export default MyStudents;
