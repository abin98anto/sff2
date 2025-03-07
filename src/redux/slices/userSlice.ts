import { createSlice } from "@reduxjs/toolkit";

import IUserState from "../../entities/misc/IUserState";
import {
  googleSignIn,
  login,
  logout,
  sendOTP,
  verifyOTP,
} from "../thunks/user/userAuthServices";
import comments from "../../shared/constants/comments";
import { updateUser } from "../thunks/user/userUpdateServices";

const initialState: IUserState = {
  loading: false,
  message: "",
  error: "",
  userInfo: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    resetUserInfo: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP.
      .addCase(sendOTP.pending, (state, action) => {
        state.loading = true;
        state.message = "";
        state.error = "";
        state.userInfo = action.meta.arg;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
        state.message = comments.OTP_SUCC;
        state.error = "";
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.message = action.payload as string;
        state.error = action.payload as string;
        state.userInfo = null;
      })

      // Verify OTP.
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.message = "";
      })
      .addCase(verifyOTP.rejected, (state) => {
        state.loading = false;
        state.message = comments.VERIFY_OTP_FAIL;
      })

      // User/Tutor Login.
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userInfo = action.payload.data;
        state.error = "";
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // User Logout.
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.message = "";
        state.error = "";
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
      })

      // Update User.
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload.data;
      })
      .addCase(updateUser.rejected, (state) => {
        state.loading = false;
      })

      // Google Auth
      .addCase(googleSignIn.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        console.log(action.payload);
        state.loading = false;
        state.isAuthenticated = true;
        state.error = "";
        state.userInfo = action.payload.user.userData;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "error in google sign in - slice";
      });
  },
});

export const { setUserInfo, resetUserInfo } = userSlice.actions;
export default userSlice.reducer;
