import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MONCRADEL | Nurturing Little Lives",
  description: "Premium Healthcare & Baby Nutrition Web Platform",
};

import { AuthProvider } from "@/context/AuthContext";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav/MobileBottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} font-sans h-full antialiased bg-[#FAFBFC]`}
      suppressHydrationWarning
    >
      <body className="h-[100dvh] overflow-hidden flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}

