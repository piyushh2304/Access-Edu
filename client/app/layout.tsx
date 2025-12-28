"use client";
import "./globals.css";

import type { Metadata } from "next";
import { Poppins, Josefin_Sans } from "next/font/google";
import { ThemeProvider } from "./utils/theme-provider";
import { Toaster } from "react-hot-toast";
import { Providers } from "./Provider"; // ✅ use the same name as your actual file export
import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import Loader from "./components/Loader";
import useAuth from "./hooks/useAuth";
import socketIO from "socket.io-client";

import { SpeechProvider } from "./SpeechProvider"; // Import SpeechProvider
import { AccessibilityProvider } from "./contexts/AccessibilityProvider"; // Import AccessibilityProvider

const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socket = socketIO(ENDPOINT, { transports: ["websocket"] });

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-Poppins",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-Josefin",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${poppins.variable} ${josefin.variable} bg-no-repeat bg-cover duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <SessionProvider>
              <AccessibilityProvider>
                <SpeechProvider> {/* Wrap with SpeechProvider */}
                  <Custom>{children}</Custom>
                </SpeechProvider>
              </AccessibilityProvider>
              <Toaster 
                position="bottom-right" 
                reverseOrder={false}
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </SessionProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

  const Custom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { } = useAuth();
  const [isClient, setIsClient] = React.useState(false);

  useEffect(() => {
    setIsClient(true);
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
};
