import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import { IUser } from "../../../entities/IUser";
import LoginData from "../../../entities/misc/LoginData";
import VerifyOTPData from "../../../entities/misc/verifyOtpData";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import comments from "../../../shared/constants/comments";

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

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      console.log("logout in fe")
      const result = await axiosInstance.post(API.USER_LOGOUT);
      const { persistor } = await import("../../store");
      persistor.purge();
      return result.data;
    } catch (error) {
      console.log(comments.LOGOUT_THNK_ERR, error);
      if (error instanceof AxiosError) {
        return rejectWithValue(error?.response?.data?.message);
      }
      return rejectWithValue(comments.SERVER_ERR);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/delete",
  async (email: string, { rejectWithValue }) => {
    try {
      const result = await axiosInstance.delete(
        `${API.USER_DELETE}?email=${email}`
      );
      return result.data;
    } catch (error) {
      console.log(comments.USER_DEL_THK_FAIL, error);
      if (error instanceof AxiosError) {
        return rejectWithValue(error?.response?.data?.message);
      }
    }
  }
);

// Google signup/login.
export const googleSignIn = createAsyncThunk(
  "user/googleSignIn",
  async (token: Partial<IUser>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/google", { token });
      // console.log("the response thunk", response);
      return {
        message: response.data.message,
        user: response.data.data,
      };
    } catch (error) {
      console.log("error signing with googel in thunk", error);
      return rejectWithValue("error signing with googel in thunk");
    }
  }
);
