import { createAsyncThunk } from "@reduxjs/toolkit";
import { IUser } from "../../entities/IUser";
import { axiosInstance } from "../../shared/config/axiosConfig";
import { API } from "../../shared/constants/API";
import { comments } from "../../shared/constants/comments";
import { VerifyOTPData } from "../../entities/misc/verifyOtpData";
import { AxiosError } from "axios";
import { LoginData } from "../../entities/misc/LoginData";

export const sendOTP = createAsyncThunk(
  "user/sendOTP",
  async (userData: IUser, { rejectWithValue }) => {
    try {
      const result = await axiosInstance.post(API.OTP_SENT, userData);
      return result.data;
    } catch (error: any) {
      console.error(comments.SIGNUP_THNK_FAIL, error);
      if (error?.response?.data?.message === comments.EMAIL_TAKEN) {
        console.log(comments.EMAIL_TAKEN);
        return rejectWithValue(comments.EMAIL_TAKEN);
      }
      return rejectWithValue(comments.SERVER_ERR);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "user/verifyOTP",
  async (data: VerifyOTPData, { rejectWithValue }) => {
    try {
      const result = await axiosInstance.post(API.OTP_VERIFY, { data });
      return result.data;
    } catch (error) {
      console.log(comments.VERIFY_OTP_THUNK_FAIL, error);
      if (error instanceof AxiosError) {
        return rejectWithValue(error?.response?.data?.message);
      }
      return rejectWithValue(comments.SERVER_ERR);
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (userData: LoginData, { rejectWithValue }) => {
    try {
      const result = await axiosInstance.post(API.USER_LOGIN, { userData });
      return result.data;
    } catch (error) {
      console.log(comments.LOGIN_THNK_FAIL, error);
      if (error instanceof AxiosError) {
        return rejectWithValue(error?.response?.data?.message);
      }
      return rejectWithValue(comments.SERVER_ERR);
    }
  }
);
