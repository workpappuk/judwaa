import type { Metadata } from "next";
import localFont from "next/font/local";

import { AppShell } from "@/components/app-shell";

import { Providers } from "./providers";
import "./globals.css";

const roboto = localFont({
  src: [
    { path: "../font/roboto/Roboto-Regular.ttf", weight: "400", style: "normal" },
    { path: "../font/roboto/Roboto-Medium.ttf", weight: "500", style: "normal" },
    { path: "../font/roboto/Roboto-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["Segoe UI", "-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "Arial", "sans-serif"],
});

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
      <body className={roboto.variable}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
