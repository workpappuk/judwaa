import type { Metadata } from "next";

import { Navbar } from "@/components/navbar";

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
    <html
      lang="en"
      className={`h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <div className="min-h-full flex flex-col">
            <Navbar />
            <div className="container mx-auto ">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
