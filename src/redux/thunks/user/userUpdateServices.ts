import { createAsyncThunk } from "@reduxjs/toolkit";
import { IUser } from "../../../entities/IUser";
import { axiosInstance } from "../../../shared/config/axiosConfig";
import { API } from "../../../shared/constants/API";
import { comments } from "../../../shared/constants/comments";
import { AxiosError } from "axios";

export const updateUser = createAsyncThunk(
  "user/update",
  async (userData: Partial<IUser>, { rejectWithValue }) => {
    try {
      const result = await axiosInstance.put(API.USER_UPDATE, userData);
      return result.data;
    } catch (error) {
      console.log(comments.USER_UPDATE_THK_FAIL, error);
      if (error instanceof AxiosError) {
        return rejectWithValue(error?.response?.data?.message);
      }
    }
  }
);
