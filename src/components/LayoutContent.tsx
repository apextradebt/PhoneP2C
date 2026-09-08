"use client";

import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import AuthWrapper from "./AuthWrapper";
import GuestPage from "@/pages/GuestPage";
import { useUser } from "@/lib/UserContext";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isConnexionPage = pathname === "/connexion";
  const { userData, loading } = useUser();

  if (isConnexionPage) {
    return (
      <main className="flex-1 w-full h-full p-0">
        {children}
      </main>
    );
  }

  return (
    <AuthWrapper>
      {/* Si l'utilisateur est pending → afficher la page invité */}
      {(!loading && userData?.role === 'pending') ? (
        <GuestPage />
      ) : (
        <div className="flex flex-col md:flex-row h-full min-h-screen bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] w-full">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      )}
    </AuthWrapper>
  );
}
