"use client";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Smartphone, CheckCircle, Clock, Search, Plus, X, User, Tag, Calendar, PenTool } from "lucide-react";
import { mockExpertises } from "@/lib/mockData";
import { mockActivities } from "@/lib/mockActivities";
import { Expertise } from "@/types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDevisDrawerOpen, setIsNewDevisDrawerOpen] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState<Expertise | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const { user } = useAuth0();
  const filteredExpertises = mockExpertises.filter(exp =>
    exp.items.some(item => item.device.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
    exp.items.some(item => item.device.imei?.includes(searchQuery)) ||
    exp.client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-12 relative overflow-hidden h-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Vue d'ensemble</h1>
          <p className="text-gray-500 font-medium text-sm">Bienvenue sur votre espace de gestion des reprises.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-brand-light)] rounded-full shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)] font-medium"
            />
          </div>
          <Link to="/devis" className="flex items-center justify-center gap-2 bg-[var(--color-brand-terracotta)] text-white px-6 py-3 rounded-full font-medium shadow-soft hover:opacity-90 transition-opacity whitespace-nowrap">
            <Plus className="w-5 h-5" />
            Nouveau Devis
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Téléphones Expertisés", value: "124", label: "+12% ce mois-ci" },
          { title: "Valeur de Reprise", value: "24,500 €", label: "Marge moy: 28%" },
          { title: "En attente de réception", value: "18", label: "Colis en transit" }
        ].map((kpi, i) => (
          <div key={i} className="bg-[var(--color-brand-light)] p-8 rounded-[2rem] shadow-soft flex flex-col gap-2">
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
              {searchQuery ? `Résultats (${filteredExpertises.length})` : "Dernières Expertises"}
            </h2>
            {!searchQuery && <button className="text-[var(--color-brand-terracotta)] text-sm font-medium hover:underline">Voir tout</button>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredExpertises.map((exp) => {
              const statusColor =
                exp.status === "Terminé" ? "bg-green-100 text-green-700" :
                  exp.status === "En attente" ? "bg-orange-100 text-orange-700" :
                    exp.status === "Reçu" ? "bg-blue-100 text-blue-700" :
                      "bg-purple-100 text-purple-700";

              return (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExpertise(exp)}
                  className="bg-[var(--color-brand-light)] p-6 rounded-[2rem] shadow-soft flex flex-col gap-4 group hover:shadow-soft-hover transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-[1.2rem] bg-[#E8E1D9] shadow-inner-soft flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-[var(--color-brand-dark)]/70" />
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>
                      {exp.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{exp.type === "flotte" ? "Lot Flotte" : exp.items[0].device.model}</h3>
                    <p className="text-gray-400 text-xs font-mono mt-1">{exp.id} • {exp.client.firstName} {exp.client.lastName}</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-[#E8E1D9]/50 flex justify-between items-end">
                    <span className="text-sm text-gray-500 font-medium">Prix proposé</span>
                    <span className="text-xl font-bold text-[var(--color-brand-terracotta)]">{exp.totalProposedPrice} €</span>
                  </div>
                </div>
              )
            })}

            {filteredExpertises.length === 0 && (
              <div className="col-span-1 sm:col-span-2 text-center py-10 text-gray-500 font-medium">
                Aucun résultat pour "{searchQuery}"
              </div>
            )}
          </div>
        </section>

        {/* Timeline (Activités récentes) */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Activités Récentes</h2>
            <Link to="/logistique/notifications" className="text-[var(--color-brand-terracotta)] text-sm font-medium hover:underline">Voir tout</Link>
          </div>

          <div className="bg-[var(--color-brand-light)] p-4 rounded-[2rem] shadow-soft flex flex-col gap-2 h-full">
            {mockActivities.slice(0, 4).map((activity, i) => (
              <div
                key={i}
                onClick={() => setSelectedActivity(activity)}
                className="flex items-center gap-4 p-4 hover:bg-white/60 rounded-2xl transition-all cursor-pointer w-full overflow-hidden border border-transparent hover:border-[#E8E1D9]"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-bold text-sm text-[var(--color-brand-dark)] whitespace-nowrap">{activity.title}</span>
                  <span className="text-gray-300 text-xs hidden sm:inline">-</span>
                  <span className="text-xs text-gray-500 truncate hidden sm:inline">{activity.desc}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-2 bg-white/50 px-2 py-1 rounded-md">{activity.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Nouveau Devis Drawer (Slide-up on mobile, Slide-over on desktop) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isNewDevisDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-[var(--color-brand-dark)]/40 backdrop-blur-sm" onClick={() => setIsNewDevisDrawerOpen(false)} />
        <div
          className={`absolute bottom-0 md:bottom-auto md:top-0 right-0 w-full md:w-[600px] 
            h-[85vh] md:h-full rounded-t-[2rem] md:rounded-none
            bg-[var(--color-brand-light)] shadow-[0_-8px_24px_rgba(0,0,0,0.1)] md:shadow-[-8px_0_24px_rgba(0,0,0,0.1)] 
            transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
            ${isNewDevisDrawerOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'} 
            flex flex-col`}
        >
          {/* Mobile drag handle */}
          <div className="md:hidden w-full flex justify-center pt-4 pb-2" onClick={() => setIsNewDevisDrawerOpen(false)}>
            <div className="w-12 h-1.5 rounded-full bg-[#E8E1D9]"></div>
          </div>

          <div className="flex items-center justify-between px-6 pb-6 pt-2 md:p-8 border-b border-[#E8E1D9]">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Nouveau Devis Rapide</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Saisissez les premières informations.</p>
            </div>
            <button
              onClick={() => setIsNewDevisDrawerOpen(false)}
              className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto flex-1">
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-sm">Modèle de l'appareil</label>
              <input type="text" placeholder="Ex: iPhone 13 Pro" className="p-4 bg-white rounded-2xl shadow-inner-soft focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 font-medium w-full text-base" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="font-semibold text-sm">IMEI / Numéro de série</label>
              <div className="relative">
                <input type="text" placeholder="Saisir ou scanner l'IMEI" className="p-4 bg-white rounded-2xl shadow-inner-soft focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 font-medium w-full text-base" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#E8E1D9] text-[var(--color-brand-dark)] text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[var(--color-brand-terracotta)] hover:text-white transition-colors">
                  SCAN
                </button>
              </div>
            </div>

            <div className="mt-auto pt-4 pb-safe">
              <button
                onClick={() => window.location.href = '/devis'}
                className="w-full bg-[var(--color-brand-dark)] text-white px-6 py-4 rounded-2xl font-bold shadow-soft hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Lancer le tunnel d'expertise
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expertise Details Modal (Centered) */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${selectedExpertise ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-[var(--color-brand-dark)]/40 backdrop-blur-sm" onClick={() => setSelectedExpertise(null)} />

        {selectedExpertise && (
          <div className="bg-[var(--color-brand-light)] rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#E8E1D9] text-[var(--color-brand-dark)] font-mono text-xs px-2 py-1 rounded-md">{selectedExpertise.id}</span>
                    <span className="bg-green-100 text-green-700 font-semibold text-xs px-2 py-1 rounded-full">{selectedExpertise.status}</span>
                    <span className="bg-blue-100 text-blue-700 font-semibold text-xs px-2 py-1 rounded-full">{selectedExpertise.type === "flotte" ? "Flotte" : "Unitaire"}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-[var(--color-brand-dark)]">
                    {selectedExpertise.type === "flotte" ? "Reprise Flotte B2B" : selectedExpertise.items[0].device.model}
                  </h2>
                  {selectedExpertise.type === "unitaire" && (
                    <p className="text-gray-500 font-medium mt-1">{selectedExpertise.items[0].device.storage} • {selectedExpertise.items[0].device.color}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedExpertise(null)}
                  className="w-10 h-10 rounded-full bg-[var(--color-brand-light)] shadow-soft flex items-center justify-center text-gray-500 hover:text-[var(--color-brand-dark)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col gap-4 bg-[var(--color-brand-light)] p-5 rounded-2xl shadow-inner-soft">
                  <h3 className="flex items-center gap-2 font-bold text-[var(--color-brand-dark)]"><User className="w-4 h-4 text-[var(--color-brand-terracotta)]" /> Client</h3>
                  <div className="text-sm flex flex-col gap-1 text-gray-600">
                    <p className="font-semibold text-[var(--color-brand-dark)]">{selectedExpertise.client.firstName} {selectedExpertise.client.lastName}</p>
                    <p>{selectedExpertise.client.email}</p>
                    <p>{selectedExpertise.client.phone}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-[var(--color-brand-light)] p-5 rounded-2xl shadow-inner-soft">
                  <h3 className="flex items-center gap-2 font-bold text-[var(--color-brand-dark)]"><Tag className="w-4 h-4 text-[var(--color-brand-terracotta)]" /> {selectedExpertise.type === "flotte" ? "Appareils" : "Identification"}</h3>
                  <div className="text-sm flex flex-col gap-1 text-gray-600">
                    {selectedExpertise.items.map((item, i) => (
                      <p key={i}><span className="font-medium">{item.quantity}x {item.device.model}</span> (Grade {item.grade})</p>
                    ))}
                    {selectedExpertise.type === "unitaire" && selectedExpertise.items[0].device.imei && (
                      <p className="mt-2"><span className="font-medium">IMEI :</span> {selectedExpertise.items[0].device.imei}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <h3 className="flex items-center gap-2 font-bold text-[var(--color-brand-dark)]"><PenTool className="w-4 h-4 text-[var(--color-brand-terracotta)]" /> Réparations prévues</h3>
                {selectedExpertise.items.some(i => i.repairs && i.repairs.length > 0) ? (
                  <div className="flex gap-2 flex-wrap">
                    {selectedExpertise.items.flatMap(i => i.repairs || []).map((rep, i) => (
                      <span key={i} className="bg-[var(--color-brand-light)] px-3 py-1 rounded-full text-xs font-semibold text-[var(--color-brand-terracotta)] shadow-soft">{rep}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune réparation prévue.</p>
                )}
              </div>

              <div className="mt-4 pt-6 border-t border-[#E8E1D9] flex justify-between items-end">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Total</p>
                  <p className="text-lg font-semibold text-gray-500">{selectedExpertise.items.reduce((acc, i) => acc + i.quantity, 0)} Appareil(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--color-brand-bois)] text-xs font-medium uppercase tracking-wider mb-1">Offre de Reprise</p>
                  <p className="text-4xl font-bold text-[var(--color-brand-terracotta)]">{selectedExpertise.totalProposedPrice} €</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/40 border-t border-[#E8E1D9] flex justify-end gap-4">
              <button className="px-6 py-2 font-semibold text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors">Imprimer Devis</button>
              <button className="bg-[var(--color-brand-dark)] text-white px-6 py-2 rounded-full font-bold shadow-soft hover:opacity-90">Envoyer Étiquette</button>
            </div>
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
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

    </div>
  );
}
