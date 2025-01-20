import { createSlice } from "@reduxjs/toolkit";
import { IUserState } from "../../entities/misc/IUserState";
import { signUpUser } from "../thunks/userSignupServices";

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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        (state.loading = true),
          (state.message = ""),
          (state.error = ""),
          state.userInfo;
      })
      .addCase(signUpUser.fulfilled, (state) => {
        (state.loading = false),
          (state.message = ""),
          (state.error = ""),
          (state.userInfo = null);
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        (state.message = action.payload as string),
          (state.error = action.payload as string),
          state.userInfo;
      });
  },
});

export default userSlice.reducer;
