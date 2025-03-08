import { useState, useRef, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import axiosInstance from "../../../shared/config/axiosConfig";
import DataTable, { Column } from "../../../components/common/Table/DataTable";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomModal from "../../../components/common/Modal/CustomModal/CustomModal";
import "./MyStudents.scss";
import { EnrollStatus } from "../../../entities/misc/enrollStatus";

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
}

interface IEnrollment {
  _id: string;
  status: string;
  startDate: string;
  // Add other enrollment properties as needed
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
      label: "Sl No.",
      render: (_, index: number) => index + 1,
    },
    {
      key: "studentName",
      label: "Student Name",
      render: (item: IStudentData) => item.studentId.name,
    },
    {
      key: "courseName",
      label: "Course Name",
      render: (item: IStudentData) => item.courseId.title,
    },
    {
      key: "startDate",
      label: "Start Date",
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
      label: "Status",
      render: (item: IStudentData) => (
        <span
          className={`status-badge ${
            item.enrollment?.status === "Active" ? "active" : "inactive"
          }`}
        >
          {item.enrollment?.status || "Pending"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
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
        const chatResponse = await axiosInstance.get(`/chat/student-list`, {
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
                  "/enrollment/get-enroll-details",
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
        showSnackbar("Failed to fetch student data", "error");
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
      const response = await axiosInstance.put("/enrollment/update", {
        updates: {
          _id: selectedStudent.enrollment?._id,
          status: EnrollStatus.PASSED,
        },
      });
      console.log("the yes res", response.data);
      if (response.data.success) {
        showSnackbar(
          isPassed
            ? "Student successfully passed the review!"
            : "Student has not passed the review",
          isPassed ? "success" : "error"
        );

        // Refresh the table data
        if (refetchData.current) {
          refetchData.current();
        }
      } else {
        showSnackbar(
          "Failed to submit review: " + response.data.message,
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showSnackbar("Failed to submit review", "error");
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
          <h1>My Students</h1>
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
          header="Student Review"
          className="review-modal"
          buttons={[
            {
              text: "Yes, Pass",
              onClick: () => handleReviewSubmit(true),
              variant: "primary",
            },
            {
              text: "No, Fail",
              onClick: () => handleReviewSubmit(false),
              variant: "secondary",
            },
          ]}
        >
          <div className="review-confirmation">
            <p>
              Has student <strong>{selectedStudent?.studentId.name}</strong>{" "}
              passed your review for the course{" "}
              <strong>{selectedStudent?.courseId.title}</strong>?
            </p>
            {isLoading && (
              <div className="loading-indicator">Processing...</div>
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
