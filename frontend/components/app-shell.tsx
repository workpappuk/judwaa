"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Box, Container, useMediaQuery, useTheme } from "@mui/material";

import { AppLeftSidebar } from "@/components/app-left-sidebar";
import { Navbar } from "@/components/navbar";
import { useAppSelector } from "@/store/hooks";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const contentLeftPadding = isDesktop && isSidebarOpen ? "300px" : undefined;

  useEffect(() => {
    // Defensive reset in case a modal/page leaves body scroll locked.
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, [pathname]);

  return (
    <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <AppLeftSidebar />
      <Container
        maxWidth="xl"
        sx={{
          pt: 1,
          pb: 2,
          transition: "padding 0.2s",
          pl: { lg: contentLeftPadding },
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
