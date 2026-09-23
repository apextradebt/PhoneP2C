"use client";

import { useState } from "react";
import { Search, Filter, X, Smartphone, User, Tag, PenTool } from "lucide-react";
import { mockExpertises } from "@/lib/mockData";
import { Expertise } from "@/types";
import PhoneOrder from "@/components/PhoneOrder";
import PhoneOrderModal from "@/components/modal/PhoneOrderModal";

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
            className="w-full pl-10 pr-4 py-3 bg-[var(--brand-surface)]/40 rounded-2xl shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)] font-medium"
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-[var(--brand-surface)]/40 text-[var(--color-brand-dark)] px-6 py-3 rounded-2xl font-medium shadow-soft hover:shadow-soft-hover transition-all">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      <div className="bg-[var(--brand-surface)]/40 p-4 sm:p-8 rounded-[2rem] shadow-soft flex flex-col gap-4 flex-1 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <PhoneOrderModal expertise={selectedExpertise} onClose={() => setSelectedExpertise(null)} />
        )}
      </div>
    </div>
  );
}
