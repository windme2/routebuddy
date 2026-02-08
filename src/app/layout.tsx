import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RouteBuddy - วางแผนทริปและจัดการงบประมาณ",
  description: "ระบบวางแผนการเดินทางและบริหารงบประมาณกลุ่มแบบ Offline-First ที่เชื่อมโยงกิจกรรมเข้ากับค่าใช้จ่าย",
};

import Providers from "@/components/Providers";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={`${prompt.variable} font-sans antialiased bg-[#fafafa] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-50 via-[#fafafa] to-zinc-100/80 text-zinc-900 selection:bg-blue-500/30 selection:text-blue-900`}
      >
        <Providers>
          <PageTransition>
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </PageTransition>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

