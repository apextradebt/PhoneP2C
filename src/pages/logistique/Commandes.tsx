"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useDevisList } from "@/lib/devisApi";
import { ORDER_STATUSES, statusDescription, statusLabel } from "@/lib/orderStatus";
import { useTranslation } from "react-i18next";
import { OrderStatus } from "@/types";
import PhoneOrder from "@/components/PhoneOrder";
import PhoneOrderModal from "@/components/modal/PhoneOrderModal";

export default function CommandesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { devis, loading, error, advanceStatus } = useDevisList();

  // La fenêtre de détail suit la liste, pour refléter un changement de statut.
  const selectedExpertise = devis.find(d => d.id === selectedId) ?? null;

  const q = searchQuery.toLowerCase();
  const matchesSearch = devis.filter(exp =>
    exp.items.some(item => item.device.model.toLowerCase().includes(q)) ||
    exp.items.some(item => item.device.imei?.includes(searchQuery)) ||
    exp.items.some(item => item.device.serialNumber?.toLowerCase().includes(q)) ||
    exp.client.lastName.toLowerCase().includes(q) ||
    exp.client.firstName.toLowerCase().includes(q) ||
    (exp.client.company ?? "").toLowerCase().includes(q) ||
    exp.id.toLowerCase().includes(q) ||
    (exp.shipmentId ?? "").toLowerCase().includes(q)
  );
  const filteredExpertises = statusFilter === "all" ? matchesSearch : matchesSearch.filter(exp => exp.status === statusFilter);

  const chip = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${active
      ? "bg-[var(--color-brand-dark)] text-white shadow-soft"
      : "bg-[var(--brand-surface)]/40 text-[var(--color-brand-dark)] shadow-soft-active hover:shadow-soft"}`;

  return (
    <div className="flex flex-col gap-6 h-full pb-4 ">
      <div className="flex flex-col gap-4 mb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('orders.search')}
            className="w-full pl-10 pr-4 py-3 bg-[var(--brand-surface)]/40 rounded-2xl shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)] font-medium"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setStatusFilter("all")} className={chip(statusFilter === "all")}>
            {t('orders.all')} <span className="text-xs opacity-70">{matchesSearch.length}</span>
          </button>
          {ORDER_STATUSES.map(s => (
            <button key={s.id} onClick={() => setStatusFilter(s.id)} className={chip(statusFilter === s.id)} title={statusDescription(t, s.id)}>
              {statusLabel(t, s.id)} <span className="text-xs opacity-70">{matchesSearch.filter(exp => exp.status === s.id).length}</span>
            </button>
          ))}
        </div>
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
                onClick={() => setSelectedId(exp.id)}
              />
            )
          })}

          {filteredExpertises.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500 font-medium">
              {loading ? t('orders.loading')
                : error ? error
                  : searchQuery ? t('common.no_results_for', { query: searchQuery })
                    : statusFilter !== "all" ? t('orders.none_status', { status: statusLabel(t, statusFilter) })
                      : t('orders.none')}
            </div>
          )}
        </div>
      </div>

      {/* Expertise Details Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${selectedExpertise ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-[var(--color-brand-dark)]/40 backdrop-blur-sm" onClick={() => setSelectedId(null)} />

        {selectedExpertise && (
          <PhoneOrderModal key={selectedExpertise.id} expertise={selectedExpertise} onClose={() => setSelectedId(null)} onAdvance={advanceStatus} />
        )}
      </div>
    </div>
  );
}
