import { IUser } from "../IUser";

export interface IUserState {
  loading: boolean;
  message: string;
  error: string;
  userInfo: IUser | null;
  isAuthenticated?: boolean;
}
