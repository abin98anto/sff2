import { createAsyncThunk } from "@reduxjs/toolkit";
import { IUser } from "../../entities/IUser";
import { axiosInstance } from "../../shared/config/axiosConfig";
import { API } from "../../shared/constants/API";
import { comments } from "../../shared/constants/comments";

// Async thunk to handle sign-up
export const sendOTP = createAsyncThunk(
  "user/sendOTP",
  async (userData: IUser, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API.OTP_SENT, userData);
      return response.data;
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
  async (otp: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API.OTP_VERIFY, otp);
      return response.data;
    } catch (error) {
      console.log(comments.VERIFY_OTP_THUNK_FAIL);
      return rejectWithValue(comments.VERIFY_OTP_THUNK_FAIL);
    }
  }
);
