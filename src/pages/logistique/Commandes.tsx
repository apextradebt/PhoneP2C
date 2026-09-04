"use client";

import { useState } from "react";
import { Search, Filter, X, Smartphone, User, Tag, PenTool } from "lucide-react";
import { mockExpertises } from "@/lib/mockData";
import { Expertise } from "@/types";

export default function CommandesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<Expertise | null>(null);

  const filteredExpertises = mockExpertises.filter(exp =>
    exp.items.some(item => item.device.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
    exp.items.some(item => item.device.imei?.includes(searchQuery)) ||
    exp.client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 h-full pb-4 ">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une commande, un client..."
            className="w-full pl-10 pr-4 py-3 bg-white/40 rounded-2xl shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)] font-medium"
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-white/40 text-[var(--color-brand-dark)] px-6 py-3 rounded-2xl font-medium shadow-soft hover:shadow-soft-hover transition-all">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      <div className="bg-white/40 p-4 sm:p-8 rounded-[2rem] shadow-soft flex flex-col gap-4 flex-1 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col gap-4 group hover:shadow-soft transition-all cursor-pointer border border-transparent hover:border-[#E8E1D9]"
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
            <div className="col-span-full text-center py-10 text-gray-500 font-medium">
              Aucun résultat pour "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Expertise Details Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${selectedExpertise ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-[var(--color-brand-dark)]/40 backdrop-blur-sm" onClick={() => setSelectedExpertise(null)} />

        {selectedExpertise && (
          <div className="bg-[var(--color-brand-light)] rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
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
                    {selectedExpertise.items.filter(item => item.device.brand !== "Prestation").map((item, i) => (
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
                      <span key={i} className="bg-[var(--color-brand-light)] px-3 py-1 rounded-full text-xs font-semibold text-[var(--color-brand-terracotta)] shadow-soft">{rep.name}</span>
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
    </div>
  );
}
