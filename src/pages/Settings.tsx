import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/ThemeProvider";
import { Moon, Sun, Monitor } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-gray-500 font-medium text-sm">{t('settings.desc')}</p>
      </header>

      <div className="flex flex-col gap-6">
        <div className="bg-[var(--color-brand-light)] p-8 rounded-[2rem] shadow-soft flex flex-col gap-6">
          <h2 className="text-xl font-bold">{t('settings.appearance')}</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === 'light' ? 'border-[var(--color-brand-terracotta)] bg-[var(--color-brand-terracotta)]/5 shadow-inner-soft' : 'border-transparent bg-[var(--background)] shadow-soft hover:shadow-soft-hover'
              }`}
            >
              <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`} />
              <span className={`text-sm font-semibold ${theme === 'light' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`}>{t('settings.theme_light')}</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === 'dark' ? 'border-[var(--color-brand-terracotta)] bg-[var(--color-brand-terracotta)]/5 shadow-inner-soft' : 'border-transparent bg-[var(--background)] shadow-soft hover:shadow-soft-hover'
              }`}
            >
              <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`} />
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`}>{t('settings.theme_dark')}</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === 'system' ? 'border-[var(--color-brand-terracotta)] bg-[var(--color-brand-terracotta)]/5 shadow-inner-soft' : 'border-transparent bg-[var(--background)] shadow-soft hover:shadow-soft-hover'
              }`}
            >
              <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`} />
              <span className={`text-sm font-semibold ${theme === 'system' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`}>{t('settings.theme_system')}</span>
            </button>
          </div>
        </div>

        <div className="bg-[var(--color-brand-light)] p-8 rounded-[2rem] shadow-soft flex flex-col gap-6">
          <h2 className="text-xl font-bold">Profil Boutique (Marque Blanche)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Nom de la boutique</label>
              <input type="text" defaultValue="RepriseStore Paris" className="p-3 rounded-xl bg-[var(--brand-surface)] shadow-inner-soft outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">SIRET</label>
              <input type="text" defaultValue="123 456 789 00012" className="p-3 rounded-xl bg-[var(--brand-surface)] shadow-inner-soft outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-brand-light)] p-8 rounded-[2rem] shadow-soft flex flex-col gap-6">
          <h2 className="text-xl font-bold">Règles de Pricing</h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 bg-[var(--brand-surface)] rounded-xl shadow-sm">
              <span className="font-medium text-sm">Marge par défaut (%)</span>
              <input type="number" defaultValue={20} className="w-20 p-2 text-center rounded-lg bg-[#E8E1D9]/30 outline-none" />
            </div>
            <div className="flex items-center justify-between p-4 bg-[var(--brand-surface)] rounded-xl shadow-sm">
              <span className="font-medium text-sm">Décote "Micro-rayures" (%)</span>
              <input type="number" defaultValue={15} className="w-20 p-2 text-center rounded-lg bg-[#E8E1D9]/30 outline-none" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="bg-[var(--color-brand-dark)] text-white px-8 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
