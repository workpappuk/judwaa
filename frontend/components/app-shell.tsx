"use client";

import { AppLeftSidebar } from "@/components/app-left-sidebar";
import { Navbar } from "@/components/navbar";
import { useAppSelector } from "@/store/hooks";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);

  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <AppLeftSidebar />
      <div className={`container mx-auto transition-[padding] duration-200 ${isSidebarOpen ? "lg:pl-72" : ""}`}>
        {children}
      </div>
    </div>
  );
}
