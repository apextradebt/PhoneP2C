"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function ConnexionPage() {
  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-[var(--color-brand-dark)]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/connexion-bg.jpg" 
          alt="Connexion background" 
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-dark)]/80 via-[var(--color-brand-dark)]/95 to-[var(--color-brand-dark)]" />
      </div>

      {/* Content Box */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-12 mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-700 ease-out">
        <div className="w-20 h-20 bg-[var(--color-brand-terracotta)]/20 rounded-full flex items-center justify-center mb-6 shadow-inner-soft">
          <div className="w-14 h-14 bg-[var(--color-brand-terracotta)] rounded-full flex items-center justify-center shadow-soft">
            <Lock className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Accès Restreint</h1>
        
        <p className="text-gray-300 font-medium mb-10 leading-relaxed text-sm">
          Vous devez être connecté pour accéder à cette ressource.
        </p>

        <Link 
          href="/auth/login"
          className="w-full flex items-center justify-center gap-3 bg-[var(--color-brand-terracotta)] text-white px-8 py-4 rounded-full font-bold shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5 transition-all duration-300 text-lg"
        >
          Se connecter
        </Link>

        <div className="mt-8 text-xs text-white/50 font-medium uppercase tracking-widest">
          B2C Reprise App
        </div>
      </div>
    </div>
  );
}
