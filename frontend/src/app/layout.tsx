import "./globals.css";
import type { Metadata } from "next";
import { Geist, Playfair_Display, Dancing_Script } from "next/font/google";
import { cn } from '@/lib/utils';
import { WalletProvider } from "@/contexts/WalletContext";
import { UserDataProvider } from "@/contexts/UserDataContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BakeXP",
  description: "BakeXP: Track your baking XP, streaks, earn milestone NFTs, and grow your pixel garden. A delicious Starknet dApp for bakers!", // BakeXP description
  keywords: ["cakes", "pastries", "bakery", "custom cakes", "birthday cakes", "wedding cakes", "desserts"],
  authors: [{ name: "BakeXP" }],
  creator: "BakeXP",
  publisher: "BakeXP",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        geistSans.variable,
        playfair.variable,
        dancingScript.variable
      )}>
        <WalletProvider>
          <UserDataProvider>
            <main>{children}</main>
          </UserDataProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
