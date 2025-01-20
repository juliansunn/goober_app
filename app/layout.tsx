import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "@/components/theme-provider";

import SessionProvider from "@/lib/session-provider";
import { getServerSession } from "next-auth";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";
import { WorkoutProvider } from "./contexts/WorkoutContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Goobers",
  description: "AI Workout Management",
  icons: {
    icon: "/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: [],
        variables: { colorPrimary: "#1E4FD8" },
        layout: {
          animations: true,
          logoPlacement: "outside",
        },
        elements: {
          userButtonBox: "text-white",
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider session={session}>
              <Providers>
                <WorkoutProvider>
                  <Toaster />
                  {children}
                </WorkoutProvider>
              </Providers>
            </SessionProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
