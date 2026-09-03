"use client";

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, error, isLoading, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/connexion');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || (!user && !error)) {
    return (
      <div className="relative w-screen h-screen flex items-center justify-center bg-[var(--color-brand-dark)] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/auth-bg.jpg" 
            alt="Loading background" 
            className="object-cover opacity-60 w-full h-full absolute inset-0"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-dark)] via-transparent to-[var(--color-brand-dark)]/50 mix-blend-multiply" />
        </div>

        {/* Loading Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 animate-in fade-in duration-700">
          {/* A pulsing elegant loader */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-t-2 border-[var(--color-brand-terracotta)] animate-spin" />
            <div className="absolute inset-2 rounded-full border-r-2 border-[#E8E1D9] animate-spin-reverse" />
            <div className="absolute inset-4 rounded-full bg-[var(--color-brand-terracotta)]/20 pulse-slow" />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
              B2C Reprise
            </h2>
            <p className="text-[#E8E1D9]/70 text-sm font-medium animate-pulse">
              Authentification en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[var(--color-brand-dark)] text-white">
        <p>Erreur d'authentification : {error.message}</p>
      </div>
    );
  }

  // Once user is loaded and authenticated, render the app
  return <>{children}</>;
}
