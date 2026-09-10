import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Nexus Copilot | AI Trading Assistant",
  description:
    "An educational, gamified AI trading copilot that teaches technical analysis, expected value, and risk management on live markets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="bg-base-bg text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
