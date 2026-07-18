"use client";

import { Box, Container } from "@mui/material";

import { AppLeftSidebar } from "@/components/app-left-sidebar";
import { Navbar } from "@/components/navbar";
import { useAppSelector } from "@/store/hooks";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);

  return (
    <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <AppLeftSidebar />
      <Container maxWidth="xl" sx={{ transition: "padding 0.2s", pl: { lg: isSidebarOpen ? "300px" : undefined }, pt: 1 }}>
        {children}
      </Container>
    </Box>
  );
}
