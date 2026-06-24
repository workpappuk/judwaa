import { configureStore } from "@reduxjs/toolkit";

import uiReducer from "@/store/slices/uiSlice";
import tradingReducer from "@/store/slices/tradingSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    trading: tradingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
