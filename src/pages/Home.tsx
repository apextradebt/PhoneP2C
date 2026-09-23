"use client";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Smartphone, CheckCircle, Clock, Search, Plus, X, User, Tag, Calendar, PenTool } from "lucide-react";
import { mockExpertises } from "@/lib/mockData";
import { mockActivities } from "@/lib/mockActivities";
import { Expertise } from "@/types";

import { useTranslation } from "react-i18next";
import PhoneOrder from "@/components/PhoneOrder";
import PhoneOrderModal from "@/components/modal/PhoneOrderModal";

export default function Home() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDevisDrawerOpen, setIsNewDevisDrawerOpen] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState<Expertise | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const filteredExpertises = mockExpertises.filter(exp =>
    exp.items.some(item => item.device.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
    exp.items.some(item => item.device.imei?.includes(searchQuery)) ||
    exp.client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10 pb-12 relative h-full">

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('home.overview')}</h1>
          <p className="text-gray-500 font-medium text-sm">{t('home.welcome')}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('home.search')}
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-brand-light)] rounded-full shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)] font-medium"
            />
          </div>
          <Link to="/devis" className="flex items-center justify-center gap-2 bg-[var(--color-brand-terracotta)] text-white px-6 py-3 rounded-full font-medium shadow-soft hover:opacity-90 transition-opacity whitespace-nowrap">
            <Plus className="w-5 h-5" />
            {t('home.new_quote')}
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: t('home.kpi_phones'), value: "124", label: "+12% ce mois-ci" },
          { title: t('home.kpi_value'), value: "24,500 €", label: "Marge moy: 28%" },
          { title: t('home.kpi_waiting'), value: "18", label: "Colis en transit" }
        ].map((kpi, i) => (
          <div key={i} className="p-8 rounded-[2rem] shadow-soft flex flex-col gap-2">
            <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">{kpi.title}</h3>
            <span className="text-4xl font-bold text-[var(--color-brand-dark)]">{kpi.value}</span>
            <span className="text-xs text-[var(--color-brand-bois)] font-medium mt-2">{kpi.label}</span>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dernières Expertises */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {searchQuery ? `${t('home.results')} (${filteredExpertises.length})` : t('home.latest_expertises')}
            </h2>
            {!searchQuery && <Link to="/logistique" state={{ tab: 'commandes' }} className="text-[var(--color-brand-terracotta)] text-sm font-medium hover:underline">{t('home.see_all')}</Link>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredExpertises.map((exp) => {

              return (
                <PhoneOrder
                  key={exp.id}
                  id={exp.id}
                  status={exp.status}
                  type={exp.type}
                  items={exp.items}
                  client={exp.client}
                  totalProposedPrice={exp.totalProposedPrice}
                  onClick={() => setSelectedExpertise(exp)}
                />
              );

            })}

            {filteredExpertises.length === 0 && (
              <div className="col-span-1 sm:col-span-2 text-center py-10 text-gray-500 font-medium">
                {t('home.no_results')} "{searchQuery}"
              </div>
            )}
          </div>
        </section>

        {/* Timeline (Activités récentes) */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{t('home.recent_activities')}</h2>
            <Link to="/logistique" state={{ tab: 'notifications' }} className="text-[var(--color-brand-terracotta)] text-sm font-medium hover:underline">{t('home.see_all')}</Link>
          </div>

          <div className="bg-[var(--color-brand-light)] p-4 rounded-[2rem] shadow-soft flex flex-col gap-2 h-full">
            {mockActivities.slice(0, 4).map((activity, i) => (
              <div
                key={i}
                onClick={() => setSelectedActivity(activity)}
                className="flex items-center gap-4 p-4 hover:bg-[var(--brand-surface)]/60 rounded-2xl transition-all cursor-pointer w-full overflow-hidden border border-transparent hover:border-[#E8E1D9]"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--brand-surface)] shadow-sm flex items-center justify-center shrink-0">
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-bold text-sm text-[var(--color-brand-dark)] whitespace-nowrap">{activity.title}</span>
                  <span className="text-gray-300 text-xs hidden sm:inline">-</span>
                  <span className="text-xs text-gray-500 truncate hidden sm:inline">{activity.desc}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-2 bg-[var(--brand-surface)]/50 px-2 py-1 rounded-md">{activity.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>


      {/* Expertise Details Modal (Centered) */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${selectedExpertise ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-[var(--color-brand-dark)]/40 backdrop-blur-sm" onClick={() => setSelectedExpertise(null)} />

        {selectedExpertise && (
          <PhoneOrderModal expertise={selectedExpertise} onClose={() => setSelectedExpertise(null)} />
        )}
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${selectedActivity ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-[var(--color-brand-dark)]/40 backdrop-blur-sm" onClick={() => setSelectedActivity(null)} />

        {selectedActivity && (
          <div className="bg-[var(--color-brand-light)] rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.2rem] bg-[var(--brand-surface)] shadow-soft flex items-center justify-center shrink-0">
                    <selectedActivity.icon className={`w-6 h-6 ${selectedActivity.color}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-brand-dark)]">{selectedActivity.title}</h2>
                    <span className="text-sm text-gray-500 font-medium">{selectedActivity.time}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="w-10 h-10 rounded-full bg-[var(--brand-surface)] shadow-soft flex items-center justify-center text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[var(--brand-surface)]/60 p-5 rounded-2xl border border-[#E8E1D9] flex flex-col gap-2">
                <p className="text-sm text-[var(--color-brand-dark)] font-medium leading-relaxed">{selectedActivity.desc}</p>
                <div className="h-[1px] w-full bg-[#E8E1D9] my-1" />
                <p className="text-sm text-gray-600 leading-relaxed">{selectedActivity.details}</p>
              </div>
            </div>

            <div className="p-6 bg-[var(--brand-surface)]/40 border-t border-[#E8E1D9] flex justify-end">
              <button
                onClick={() => setSelectedActivity(null)}
                className="bg-[var(--color-brand-dark)] text-white px-6 py-2 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
