"use client";

import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import AuthWrapper from "./AuthWrapper";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isConnexionPage = pathname === "/connexion";

  if (isConnexionPage) {
    return (
      <main className="flex-1 w-full h-full p-0">
        {children}
      </main>
    );
  }

  return (
    <AuthWrapper>
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </AuthWrapper>
  );
}
