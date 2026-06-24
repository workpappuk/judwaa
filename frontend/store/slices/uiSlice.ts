import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

interface UiState {
  themeMode: ThemeMode;
  isFullscreen: boolean;
  isAudioPlaying: boolean;
}

const initialState: UiState = {
  themeMode: "light",
  isFullscreen: false,
  isAudioPlaying: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === "dark" ? "light" : "dark";
    },
    setIsFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },
    toggleFullscreenState: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    setIsAudioPlaying: (state, action: PayloadAction<boolean>) => {
      state.isAudioPlaying = action.payload;
    },
  },
});

export const { setThemeMode, toggleThemeMode, setIsFullscreen, toggleFullscreenState, setIsAudioPlaying } = uiSlice.actions;
export default uiSlice.reducer;
