import { IUser } from "./IUser";

export default interface IMessage {
  _id?: string;
  chatId: string;
  senderId: string | IUser;
  receiverId: string | IUser;
  content: string;
  contentType: string;
  isRead: boolean;
  timestamp: Date;
}
