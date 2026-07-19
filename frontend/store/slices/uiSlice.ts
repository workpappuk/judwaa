import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

interface UiState {
  themeMode: ThemeMode;
  isFullscreen: boolean;
  isAudioPlaying: boolean;
  isSidebarOpen: boolean;
  isSidebarPinned: boolean;
}

const initialState: UiState = {
  themeMode: "light",
  isFullscreen: false,
  isAudioPlaying: false,
  isSidebarOpen: false,
  isSidebarPinned: false,
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
    setIsSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setIsSidebarPinned: (state, action: PayloadAction<boolean>) => {
      state.isSidebarPinned = action.payload;

      if (action.payload) {
        state.isSidebarOpen = true;
      }
    },
    toggleSidebarPinned: (state) => {
      state.isSidebarPinned = !state.isSidebarPinned;

      if (state.isSidebarPinned) {
        state.isSidebarOpen = true;
      }
    },
  },
});

export const {
  setThemeMode,
  toggleThemeMode,
  setIsFullscreen,
  toggleFullscreenState,
  setIsAudioPlaying,
  setIsSidebarOpen,
  toggleSidebar,
  setIsSidebarPinned,
  toggleSidebarPinned,
} = uiSlice.actions;
export default uiSlice.reducer;
