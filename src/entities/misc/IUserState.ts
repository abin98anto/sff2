import { IUser } from "../IUser";

export default interface IUserState {
  loading: boolean;
  message: string;
  error: string;
  userInfo: IUser | null;
  isAuthenticated?: boolean;
}
