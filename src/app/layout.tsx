import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "moncradle | Nurturing Little Lives",
  description: "Premium Healthcare & Baby Nutrition Web Platform",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "moncradle",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
import { AuthProvider } from "@/context/AuthContext";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav/MobileBottomNav";
import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";

import { ReduxProvider } from "@/store/Provider";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { Toaster } from "react-hot-toast";
import { Preloader } from "@/components/layout/Preloader";

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
        <Preloader />
        <ReactQueryProvider>
          <ReduxProvider>
            <AuthProvider>
              <Header />
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {children}
                <Footer />
              </div>
              <MobileBottomNav />
            </AuthProvider>
          </ReduxProvider>
        </ReactQueryProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#171717',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0,0,0,0.05)',
              border: '1px solid #e5e5e5',
            },
            success: {
              iconTheme: {
                primary: '#10B981', // Industry standard success green
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444', // Standard error red
                secondary: '#ffffff',
              },
            }
          }}
        />
      </body>
    </html>
  );
}

