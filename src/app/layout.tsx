import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import LayoutContent from "./components/LayoutContent";

const poppins = Poppins({
  variable: "--font-sans-app",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reprise App",
  description: "Application de gestion de reprise d'appareils électroniques",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} antialiased h-full`}>
      <body className="flex flex-col md:flex-row h-full min-h-screen bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]">
        <Auth0Provider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </Auth0Provider>
      </body>
    </html>
  );
}
