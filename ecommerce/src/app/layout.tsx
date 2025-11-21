import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { Toaster } from "@/components/ui/toaster"

import { Providers } from "@/providers";
import { Theme } from "@/components/toggle-theme";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qrchat",
  description: "Faça seu pedido rápido e fácil ! ",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased light`} suppressHydrationWarning>
        <Theme>
          <Providers >
            {children}
          </Providers>
        </Theme>
        <Toaster />
      </body>
    </html>
  );
}
