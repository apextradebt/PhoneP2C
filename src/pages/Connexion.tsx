"use client";

import { useAuth0 } from "@auth0/auth0-react";

export default function ConnexionPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-[var(--color-brand-dark)]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/connexion-bg.jpg"
          alt="Connexion background"
          className="object-cover opacity-60 mix-blend-overlay w-full h-full absolute inset-0"
        />
        <div className="absolute inset-0 " />
      </div>

      {/* Content Box */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-12 mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-700 ease-out">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner-soft p-2">
          <img src="/PhoneP2C/NexusLogo.svg" alt="Nexus Logo" className="w-full h-full object-contain" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Accès Restreint</h1>

        <p className="text-gray-300 font-medium mb-10 leading-relaxed text-sm">
          Vous devez être connecté pour accéder à cette ressource.
        </p>

        <button
          onClick={() => loginWithRedirect({ authorizationParams: { prompt: "login" } })}
          className="w-full flex items-center justify-center gap-3 bg-[var(--color-brand-terracotta)] text-white px-8 py-4 rounded-full font-bold shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5 transition-all duration-300 text-lg"
        >
          Se connecter
        </button>

        <div className="mt-8 text-xs text-white/50 font-medium uppercase tracking-widest">
          B2C Reprise App
        </div>
      </div>
    </div>
  );
}
