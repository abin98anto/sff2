import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./slices/userSlice";

const store = configureStore({
  reducer: userReducer,
});

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
