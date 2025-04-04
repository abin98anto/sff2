export interface IUser {
  createdAt: string | number | Date;
  name: string;
  email: string;
  role?: string;
  password?: string | null;
  picture?: string;
  wallet?: number;
  isActive?: boolean;
  otp?: string | null;
  otpExpiry?: Date | null;
  resume?: string;
  students?: string[];
  isVerified?: boolean;
  _id?: string;
}
