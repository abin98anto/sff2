import { combineReducers, configureStore } from "@reduxjs/toolkit";

import userReducer from "./slices/userSlice";

const rootReducer = combineReducers({ user: userReducer });

const store = configureStore({
  reducer: rootReducer,
});

export type AppRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
