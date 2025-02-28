import enrollStatus from "./misc/enrollStatus";

export default interface IEnrollment {
  _id?: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  status: enrollStatus;
  completedLessons: string[];
  completedAt?: Date;
  quitAt?: Date;
}
