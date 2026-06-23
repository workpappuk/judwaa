"use client";

import { ThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";

import { store } from "@/store";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
}
