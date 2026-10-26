import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../lib/toast";
import { Navbar } from "../components/Navbar";

export const metadata: Metadata = {
  title: "OrbitWick Travel Photo Journal",
  description:
    "Capture, curate, and share your travel journeys with automated OpenRouter AI summaries and military-grade TOTP two-factor security.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <div className="page-wrapper">
              <Navbar />
              <main className="main-content">{children}</main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
