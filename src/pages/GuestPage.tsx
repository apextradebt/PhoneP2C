import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "@/lib/UserContext";
import { useTranslation } from "react-i18next";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function GuestPage() {
  const { logout } = useAuth0();
  const { userData, refreshUserData } = useUser();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    // Small delay so the user sees the spinner
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-[var(--color-brand-dark)]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/PhoneP2C/auth-bg.jpg"
          alt="Guest background"
          className="object-cover opacity-40 mix-blend-overlay w-full h-full absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-dark)] via-transparent to-[var(--color-brand-dark)]/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg p-10 sm:p-14 mx-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-700 ease-out">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-amber-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          {t('guest.title')}
        </h1>

        <p className="text-gray-300/80 font-medium mb-8 leading-relaxed text-sm max-w-sm">
          {t('guest.desc')}
        </p>

        {/* Email display */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            {t('guest.your_email')}
          </p>
          <p className="text-white font-semibold text-sm">
            {userData?.email || '—'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-brand-terracotta)] text-white px-6 py-3.5 rounded-full font-bold shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('guest.refresh')}
          </button>

          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3.5 rounded-full font-bold hover:bg-white/20 transition-all duration-300 border border-white/10"
          >
            <LogOut className="w-4 h-4" />
            {t('guest.logout')}
          </button>
        </div>

        <div className="mt-8 text-xs text-white/30 font-medium uppercase tracking-widest">
          B2C Reprise App
        </div>
      </div>
    </div>
  );
}
