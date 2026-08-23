import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "DhanMITR — AI Personal Finance & Voice Companion",
  description: "Intelligent personal finance assistant with real-time tracking, OTT subscriptions, insurance analytics, and conversational voice guidance.",
};

// Applies the persisted theme before first paint to prevent a
// white flash (FOUC) on pages rendered in dark mode.
const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('dhanmitr_theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-white transition-colors duration-200">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
