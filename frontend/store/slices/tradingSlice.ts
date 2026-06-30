import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { FnOPositionDraft } from "@/types/trading";

interface TradingState {
  draftPositions: FnOPositionDraft[];
  hydrated: boolean;
}

const initialState: TradingState = {
  draftPositions: [],
  hydrated: false,
};

const tradingSlice = createSlice({
  name: "trading",
  initialState,
  reducers: {
    setDraftPositions: (state, action: PayloadAction<FnOPositionDraft[]>) => {
      state.draftPositions = action.payload;
    },
    updateDraftPosition: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<FnOPositionDraft> }>,
    ) => {
      const target = state.draftPositions.find((position) => position.id === action.payload.id);
      if (!target) {
        return;
      }

      Object.assign(target, action.payload.changes);
    },
    removeDraftPosition: (state, action: PayloadAction<string>) => {
      state.draftPositions = state.draftPositions.filter((position) => position.id !== action.payload);
    },
    markDraftPositionsHydrated: (state) => {
      state.hydrated = true;
    },
    clearDraftPositions: (state) => {
      state.draftPositions = [];
    },
  },
});

export const {
  setDraftPositions,
  updateDraftPosition,
  removeDraftPosition,
  markDraftPositionsHydrated,
  clearDraftPositions,
} = tradingSlice.actions;
export default tradingSlice.reducer;