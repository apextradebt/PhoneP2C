"use client";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CommandesPage from "./Commandes";
import ExpeditionsPage from "./Expeditions";
import NotificationsPage from "./Notifications";
import { useTranslation } from "react-i18next";

type Tab = 'commandes' | 'expeditions' | 'notifications';
const TABS: Tab[] = ['commandes', 'expeditions', 'notifications'];

// Les liens d'autres pages peuvent cibler un onglet via `state.tab` ; un onglet
// inconnu (ex. l'ancien tableau « expertises ») retombe sur les commandes.
const tabFromState = (state: unknown): Tab | null => {
  const tab = (state as { tab?: string } | null)?.tab;
  return TABS.includes(tab as Tab) ? tab as Tab : null;
};

export default function LogistiquePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(tabFromState(location.state) ?? 'commandes');

  useEffect(() => {
    const tab = tabFromState(location.state);
    if (tab) setActiveTab(tab);
  }, [location.state]);

  const labels: Record<Tab, string> = {
    commandes: t('logistics.tab_orders'),
    expeditions: t('logistics.tab_shipments'),
    notifications: t('logistics.tab_notifications'),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex gap-6 mb-2 border-b border-[#E8E1D9] pb-4 px-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold transition-all relative ${activeTab === tab ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-400 hover:text-[var(--color-brand-dark)]'}`}
          >
            {labels[tab]}
            {activeTab === tab && <div className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-[var(--color-brand-terracotta)] rounded-t-full" />}
          </button>
        ))}
      </div>

      <div className="flex-1 pt-4">
        {activeTab === 'commandes' && <CommandesPage />}
        {activeTab === 'expeditions' && <ExpeditionsPage />}
        {activeTab === 'notifications' && <NotificationsPage />}
      </div>
    </div>
  )
}
