"use client";

import { ToastContainer } from "react-toastify";
import DashboardWrapper from "./dashboardWrapper";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const container = document.querySelector(
      ".your-scroll-container"
    ) as HTMLElement;
    const sensitivity = 0.05;

    if (container) {
      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
        container.scrollLeft += event.deltaX * sensitivity;
      };

      container.addEventListener("wheel", handleWheel);

      return () => {
        container.removeEventListener("wheel", handleWheel); 
      };
    }
  }, []);
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ToastContainer />
          <DashboardWrapper>{children}</DashboardWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
