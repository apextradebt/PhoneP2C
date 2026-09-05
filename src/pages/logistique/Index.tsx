"use client";

import { useState } from "react";
import { mockExpertises } from "@/lib/mockData";
import { Expertise } from "@/types";
import { Smartphone, User, Tag, PenTool, X } from "lucide-react";
import CommandesPage from "./Commandes";
import NotificationsPage from "./Notifications";
import { useTranslation } from "react-i18next";

const columnConfigs = [
  { id: "En attente", title: "En attente" },
  { id: "Reçu", title: "Reçu" },
  { id: "Expertisé", title: "Expertisé" },
  { id: "Terminé", title: "Terminé" },
];

export default function LogistiquePage() {
  const { t } = useTranslation();
  const [columns, setColumns] = useState(() => {
    return columnConfigs.map(col => ({
      ...col,
      items: mockExpertises.filter(exp => exp.status === col.id)
    }));
  });
  const [draggedItem, setDraggedItem] = useState<{ id: string, sourceColId: string } | null>(null);
  const [selectedExpertise, setSelectedExpertise] = useState<Expertise | null>(null);
  const [activeTab, setActiveTab] = useState<'expertises' | 'commandes' | 'notifications'>('expertises');

  const handleDragStart = (e: React.DragEvent, itemId: string, colId: string) => {
    setDraggedItem({ id: itemId, sourceColId: colId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.sourceColId === targetColId) {
      setDraggedItem(null);
      return;
    }

    setColumns(prev => {
      // Create deep copy
      const newCols = prev.map(c => ({ ...c, items: [...c.items] }));
      const sourceCol = newCols.find(c => c.id === draggedItem.sourceColId);
      const targetCol = newCols.find(c => c.id === targetColId);

      if (sourceCol && targetCol) {
        const itemIndex = sourceCol.items.findIndex(i => i.id === draggedItem.id);
        if (itemIndex > -1) {
          const item = sourceCol.items[itemIndex];
          sourceCol.items.splice(itemIndex, 1);
          // update status
          const updatedItem = { ...item, status: targetCol.id as any };
          targetCol.items.push(updatedItem);
        }
      }
      return newCols;
    });

    setDraggedItem(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex gap-6 mb-2 border-b border-[#E8E1D9] pb-4 px-2">
        <button
          onClick={() => setActiveTab('expertises')}
          className={`px-4 py-2 font-bold transition-all relative ${activeTab === 'expertises' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-400 hover:text-[var(--color-brand-dark)]'}`}
        >
          {t('logistics.tab_expertises')}
          {activeTab === 'expertises' && <div className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-[var(--color-brand-terracotta)] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('commandes')}
          className={`px-4 py-2 font-bold transition-all relative ${activeTab === 'commandes' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-400 hover:text-[var(--color-brand-dark)]'}`}
        >
          {t('logistics.tab_orders')}
          {activeTab === 'commandes' && <div className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-[var(--color-brand-terracotta)] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-bold transition-all relative ${activeTab === 'notifications' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-400 hover:text-[var(--color-brand-dark)]'}`}
        >
          {t('logistics.tab_notifications')}
          {activeTab === 'notifications' && <div className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-[var(--color-brand-terracotta)] rounded-t-full" />}
        </button>
      </div>

      <div className="flex-1">
        {activeTab === 'expertises' && (
          <div className="flex gap-6 h-full pt-4 pb-4">
            {columns.map((col) => (
              <div
                key={col.id}
                className="flex-shrink-0 w-80 bg-white/40 p-6 rounded-[2rem] shadow-soft flex flex-col gap-4 min-h-[500px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <h3 className="font-bold text-[var(--color-brand-dark)] flex items-center justify-between">
                  {col.title}
                  <span className="bg-[#E8E1D9] text-xs px-2 py-1 rounded-full">{col.items.length}</span>
                </h3>

                <div className="flex flex-col gap-4 mt-2 flex-1 min-h-[50px]">
                  {col.items.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id, col.id)}
                      onClick={() => setSelectedExpertise(item)}
                      className="bg-[var(--color-brand-light)] p-5 rounded-2xl shadow-sm hover:shadow-soft transition-all cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-[#E8E1D9] flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm text-[var(--color-brand-terracotta)]">{item.id}</p>
                        <span className="text-[10px] text-gray-400 font-medium">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-brand-dark)] truncate">{item.type === "flotte" ? "Lot Flotte" : item.items[0].device.model}</p>
                        <p className="text-xs text-gray-500 truncate">{item.client.firstName} {item.client.lastName}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#E8E1D9]/50 flex justify-between items-end">
                        <span className="text-xs text-gray-500 font-medium">Prix proposé</span>
                        <span className="text-sm font-bold text-[var(--color-brand-terracotta)]">{item.totalProposedPrice} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'commandes' && <CommandesPage />}
        {activeTab === 'notifications' && <NotificationsPage />}
      </div>

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
  )
}
