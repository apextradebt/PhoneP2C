"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Filter, X } from "lucide-react";
import { mockActivities } from "@/lib/mockActivities";

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);

  const filteredActivities = mockActivities.filter(act =>
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une notification, un devis..."
            className="w-full pl-10 pr-4 py-3 bg-[var(--color-brand-light)] rounded-2xl shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)] font-medium"
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] px-6 py-3 rounded-2xl font-medium shadow-soft hover:shadow-soft-hover transition-all">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
      </div>
      <div className="bg-[var(--color-brand-light)] p-4 sm:p-8 rounded-[2rem] shadow-soft flex flex-col gap-2">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, i) => (
            <Link
              key={activity.id}
              to="/logistique"
              onClick={() => setSelectedActivity(activity)}
              className="flex items-center gap-4 p-4 hover:bg-white/60 rounded-2xl transition-all cursor-pointer w-full overflow-hidden border border-transparent hover:border-[#E8E1D9]"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                <activity.icon className={`w-6 h-6 ${activity.color}`} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-[var(--color-brand-dark)] truncate">{activity.title}</span>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap bg-white/50 px-2 py-1 rounded-md">{activity.time}</span>
                </div>
                <span className="text-sm text-gray-500 truncate mt-1">{activity.desc}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 font-medium">
            Aucune notification trouvée pour "{searchQuery}"
          </div>
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
                  <div className="w-12 h-12 rounded-[1.2rem] bg-white shadow-soft flex items-center justify-center shrink-0">
                    <selectedActivity.icon className={`w-6 h-6 ${selectedActivity.color}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-brand-dark)]">{selectedActivity.title}</h2>
                    <span className="text-sm text-gray-500 font-medium">{selectedActivity.time}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white/60 p-5 rounded-2xl border border-[#E8E1D9] flex flex-col gap-2">
                <p className="text-sm text-[var(--color-brand-dark)] font-medium leading-relaxed">{selectedActivity.desc}</p>
                <div className="h-[1px] w-full bg-[#E8E1D9] my-1" />
                <p className="text-sm text-gray-600 leading-relaxed">{selectedActivity.details}</p>
              </div>
            </div>

            <div className="p-6 bg-white/40 border-t border-[#E8E1D9] flex justify-end">
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
    </>

  );
}
