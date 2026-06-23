import type { Metadata } from "next";
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
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </body>
    </html>
  );
}
