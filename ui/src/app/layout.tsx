import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DhanMITR — AI-Powered Personal Finance Companion",
  description: "Intelligent personal financial planning, tax guidance, budget optimization, and voice advisory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
