import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/slices/authSlice";
import uiReducer from "@/store/slices/uiSlice";
import tradingReducer from "@/store/slices/tradingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    trading: tradingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
