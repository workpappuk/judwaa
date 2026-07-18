import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Judwaa",
  description: "Judwaa is a platform that allows users to create and share their own content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
