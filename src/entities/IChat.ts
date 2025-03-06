import ICourse from "./ICourse";
import { IUser } from "./IUser";

export default interface IChat {
  _id: string;
  tutorId: string | IUser;
  studentId: string | IUser;
  courseId: ICourse | string;
  messages: string[];
}
