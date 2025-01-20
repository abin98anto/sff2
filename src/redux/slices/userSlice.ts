import { createSlice } from "@reduxjs/toolkit";
import { IUserState } from "../../entities/misc/IUserState";
import { signUpUser } from "../thunks/userSignupServices";
import { comments } from "../../shared/constants/comments";

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state, action) => {
        state.loading = true;
        state.message = "";
        state.error = "";
        state.userInfo = action.meta.arg;
      })
      .addCase(signUpUser.fulfilled, (state) => {
        state.loading = false;
        state.message = comments.OTP_SUCC;
        state.error = "";
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.message = action.payload as string;
        state.error = action.payload as string;
        state.userInfo = null;
      });
  },
});

export const { setUserInfo } = userSlice.actions;
export default userSlice.reducer;
