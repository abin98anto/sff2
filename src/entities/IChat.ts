import ICourse from "./ICourse";
import IMessage from "./IMessage";
import { IUser } from "./IUser";

export default interface IChat {
  _id: string;
  tutorId: string | IUser;
  studentId: string | IUser;
  courseId: ICourse | string;
  messages: string[];
  lastMessage?: IMessage | null;
}
