import { Users, BookOpen, DollarSign, OctagonAlert } from "lucide-react";
import "./TutorDashboard.scss";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { useEffect, useState } from "react";
import axiosInstance from "../../../shared/config/axiosConfig";
import ICourse, { ISection } from "../../../entities/ICourse";
import { IUser } from "../../../entities/IUser";
import { ICategory } from "../../../entities/ICategory";
import userRoles from "../../../entities/misc/userRole";
import enrollStatus, {
  EnrollStatus,
} from "../../../entities/misc/enrollStatus";
import IEnrollment from "../../../entities/IEnrollment";

export interface ICourseNew {
  createdAt: string | number | Date;
  _id?: string;
  title: string;
  subtitle: string;
  category: string | ICategory;
  topic: string;
  language: string;
  level: string;
  prerequisites: string;
  thumbnail: string;
  description: string;
  curriculum: ISection[];
  tutors: string[];
  totalDuration: number;
  totalLessons: number;
  enrollmentCount: number;
  isActive: Boolean;
}

interface IEnrollmentNew {
  _id?: string;
  userId: IUser;
  courseId: ICourse;
  enrolledAt: Date;
  status: enrollStatus;
  completedLessons: string[];
  completedAt?: Date;
  updatedAt: string;
  quitAt?: Date;
}

const TutorDashboard = () => {
  const { userInfo } = useAppSelector((state) => state.user);
  const [assignedCourses, setAssignedCourses] = useState<string[]>([]);
  const [completedStudents, setCompletedStudents] = useState<IEnrollmentNew[]>(
    []
  );
  const [balance, setBalance] = useState(0);

  const getAssignedCoursesCount = async (userId: string) => {
    try {
      const response = await axiosInstance.get("/course");
      const courses = response.data.data.data.map((course: ICourse) => ({
        ...course,
        tutors: course.tutors!.map((tutor: Partial<IUser>) => tutor._id),
      }));

      const tutorCourses = courses
        .map((course: ICourseNew) => {
          if (course.tutors?.includes(userId)) {
            return course._id;
          }
        })
        .filter((courses: string) => courses !== undefined);

      setAssignedCourses(tutorCourses);
    } catch (error) {
      console.log("error calculating assigned courses count", error);
      return 0;
    }
  };

  const getCompletedStudentsList = async () => {
    try {
      const enrollments = await axiosInstance.get("/enrollment/");

      const assignedStudents = enrollments.data.data.filter(
        (enrollment: IEnrollment) => {
          if (assignedCourses.includes(enrollment.courseId)) return enrollment;
        }
      );

      const completedEnrollments = assignedStudents.filter(
        (enrollment: IEnrollment) => {
          if (enrollment.status === EnrollStatus.COMPLETED) return enrollment;
        }
      );

      const students = await axiosInstance.get(
        `/admin/users/${userRoles.USER}`
      );

      const courses = await axiosInstance.get("/course");

      const updatedEnrollments = completedEnrollments.map(
        (enrollment: IEnrollment) => {
          const student = students.data.find(
            (student: IUser) => student._id === enrollment.userId
          );
          const course = courses.data.data.data.find(
            (course: ICourse) => course._id === enrollment.courseId
          );

          return {
            ...enrollment,
            userId: student
              ? { _id: student._id, name: student.name }
              : enrollment.userId,
            courseId: course
              ? { _id: course._id, title: course.title }
              : enrollment.courseId,
          };
        }
      );

      setCompletedStudents(updatedEnrollments);
    } catch (error) {
      console.log("error fetching course completed students", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const updateWallet = async () => {
    try {
      const response = await axiosInstance.get(`/get-balance/${userInfo?._id}`);
      setBalance(response.data.data.wallet);
    } catch (error) {
      console.log("error updating wallet", error);
    }
  };
  useEffect(() => {
    updateWallet();
  }, []);

  useEffect(() => {
    getAssignedCoursesCount(userInfo?._id as string);
  }, [userInfo]);

  useEffect(() => {
    if (assignedCourses.length > 0) {
      getCompletedStudentsList();
    }
  }, [assignedCourses]);

  return (
    <div className="tutor-dashboard">
      <h1 className="tutor-dashboard__heading">Dashboard</h1>
      <div className="tutor-dashboard__stats">
        <div className="tutor-stat-box">
          <div className="tutor-stat-box__icon-container">
            <Users className="tutor-stat-box__icon" />
          </div>
          <div className="tutor-stat-box__content">
            <h3 className="tutor-stat-box__title">Student Count</h3>
            <p className="tutor-stat-box__value">
              {userInfo?.students?.length || 0}
            </p>
          </div>
        </div>

        <div className="tutor-stat-box">
          <div className="tutor-stat-box__icon-container">
            <BookOpen className="tutor-stat-box__icon" />
          </div>
          <div className="tutor-stat-box__content">
            <h3 className="tutor-stat-box__title">Courses Assigned</h3>
            <p className="tutor-stat-box__value">{assignedCourses.length}</p>
          </div>
        </div>

        <div className="tutor-stat-box">
          <div className="tutor-stat-box__icon-container">
            <DollarSign className="tutor-stat-box__icon" />
          </div>
          <div className="tutor-stat-box__content">
            <h3 className="tutor-stat-box__title">Total Earnings</h3>
            <p className="tutor-stat-box__value">₹{balance}</p>
          </div>
        </div>
      </div>

      <div className="tutor-dashboard__chart-container">
        <div className="tutor-dashboard__chart-header">
          <h2 className="tutor-dashboard__chart-title">
            <OctagonAlert className="tutor-dashboard__chart-icon" />
            Pending Reviews
          </h2>
        </div>

        <div className="tutor-dashboard__chart">
          {completedStudents.length > 0 ? (
            <div className="completed-students-table">
              <table>
                <thead>
                  <tr>
                    <th>Sl No</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Date Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {completedStudents.map((student, index: number) => (
                    <tr key={student._id}>
                      <td>{index + 1}</td>
                      <td>{student.userId.name}</td>
                      <td>{student.courseId.title}</td>
                      <td>{formatDate(student.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data-message">
              No completed courses available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
