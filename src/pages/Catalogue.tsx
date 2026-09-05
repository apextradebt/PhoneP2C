"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, Save, Wrench, Battery, Monitor, Aperture, CircleDot, Smartphone } from "lucide-react";
import { useCatalog } from "@/lib/CatalogContext";

import { useTranslation } from "react-i18next";

type RepairKeys = "batterie" | "ecran" | "connecteurs" | "camera" | "boutons";

const REPAIR_ICONS: Record<RepairKeys, any> = {
  batterie: Battery,
  ecran: Monitor,
  connecteurs: Wrench,
  camera: Aperture,
  boutons: CircleDot,
};

export default function CataloguePage() {
  const { t } = useTranslation();
  const { catalog, updateRepairs } = useCatalog();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [editedRepairs, setEditedRepairs] = useState<Record<string, number> | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const brands = catalog.brands;
  const repairLabels = catalog.repairLabels;

  const currentBrand = useMemo(() => brands.find(b => b.name === selectedBrand), [selectedBrand, brands]);

  const filteredModels = useMemo(() => {
    if (!currentBrand) return [];
    if (!searchQuery) return currentBrand.models;
    return currentBrand.models.filter(m =>
      m.model.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentBrand, searchQuery]);

  const currentModel = useMemo(() => {
    if (!currentBrand || !selectedModelName) return null;
    return currentBrand.models.find(m => m.model === selectedModelName) || null;
  }, [currentBrand, selectedModelName]);

  const globalFilteredModels = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const q = globalSearch.toLowerCase();
    return brands.flatMap(brand =>
      brand.models
        .filter(m => m.model.toLowerCase().includes(q) || brand.name.toLowerCase().includes(q))
        .map(m => ({ ...m, brandName: brand.name }))
    );
  }, [globalSearch, brands]);

  const handleSelectModel = (modelName: string, brandName?: string) => {
    const brand = brandName ? brands.find(b => b.name === brandName) : currentBrand;
    const model = brand?.models.find(m => m.model === modelName);
    if (model && brand) {
      setSelectedBrand(brand.name);
      setSelectedModelName(modelName);
      setEditedRepairs({ ...model.repairs });
      setSavedMessage(false);
      setGlobalSearch("");
    }
  };

  const handleRepairChange = (key: string, value: number) => {
    if (editedRepairs) {
      setEditedRepairs({ ...editedRepairs, [key]: value });
      setSavedMessage(false);
    }
  };

  const handleSave = () => {
    if (selectedBrand && selectedModelName && editedRepairs) {
      updateRepairs(selectedBrand, selectedModelName, editedRepairs);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }
  };

  // Brand selection screen
  if (!selectedBrand) {
    return (
      <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('catalogue.title')}</h1>
          <p className="text-gray-500 font-medium text-sm">{t('catalogue.desc')}</p>
        </header>

        <div className="relative max-w-lg">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder={t('catalogue.search')}
            className="w-full pl-10 pr-4 py-3 bg-white/40 rounded-2xl shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)] font-medium"
          />
        </div>

        {globalSearch.trim() ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalFilteredModels.length > 0 ? globalFilteredModels.map((model) => (
              <button
                key={`${model.brandName}-${model.model}`}
                onClick={() => handleSelectModel(model.model, model.brandName)}
                className="bg-white/40 p-5 rounded-2xl shadow-soft flex items-center gap-4 text-left hover:bg-white hover:shadow-soft-hover hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-12 h-12 rounded-[1.2rem] bg-[#E8E1D9] shadow-inner-soft flex items-center justify-center shrink-0 group-hover:bg-[var(--color-brand-terracotta)] transition-colors">
                  <Smartphone className="w-5 h-5 text-[var(--color-brand-dark)]/70 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--color-brand-dark)] truncate">{model.model}</p>
                  <p className="text-sm text-gray-500 font-medium">{model.brandName} • {model.basePrice} €</p>
                </div>
              </button>
            )) : (
              <div className="col-span-full text-center py-10 text-gray-500 font-medium">
                Aucun modèle trouvé pour "{globalSearch}"
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <button
                key={brand.name}
                onClick={() => { setSelectedBrand(brand.name); setSearchQuery(""); }}
                className="bg-white/40 p-6 rounded-[2rem] shadow-soft flex flex-col items-center justify-center gap-3 h-36 cursor-pointer hover:bg-white hover:shadow-soft-hover hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[#E8E1D9] flex items-center justify-center shadow-inner-soft group-hover:bg-[var(--color-brand-terracotta)] transition-colors">
                  <Smartphone className="w-6 h-6 text-[var(--color-brand-dark)] group-hover:text-white transition-colors" />
                </div>
                <span className="text-xl font-bold text-[var(--color-brand-dark)]">{brand.name}</span>
                <span className="text-xs text-gray-400 font-medium">{brand.models.length} modèles</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Model list + detail view
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <header className="flex items-center gap-4">
        <button
          onClick={() => {
            if (selectedModelName) {
              setSelectedModelName(null);
              setEditedRepairs(null);
            } else {
              setSelectedBrand(null);
            }
          }}
          className="w-10 h-10 rounded-full bg-white/60 shadow-soft flex items-center justify-center text-gray-500 hover:text-[var(--color-brand-dark)] hover:bg-white transition-all shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">{selectedBrand}</h1>
          <p className="text-gray-500 font-medium text-sm">
            {selectedModelName ? selectedModelName : `${currentBrand?.models.length} modèles disponibles`}
          </p>
        </div>
      </header>

      {!selectedModelName ? (
        /* Model list */
        <div className="flex flex-col gap-6">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un modèle..."
              className="w-full pl-10 pr-4 py-3 bg-white/40 rounded-2xl shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)] font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <button
                key={model.model}
                onClick={() => handleSelectModel(model.model)}
                className="bg-white/40 p-5 rounded-2xl shadow-soft flex items-center gap-4 text-left hover:bg-white hover:shadow-soft-hover hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-12 h-12 rounded-[1.2rem] bg-[#E8E1D9] shadow-inner-soft flex items-center justify-center shrink-0 group-hover:bg-[var(--color-brand-terracotta)] transition-colors">
                  <Smartphone className="w-5 h-5 text-[var(--color-brand-dark)]/70 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--color-brand-dark)] truncate">{model.model}</p>
                  <p className="text-sm text-gray-500 font-medium">Prix de base : {model.basePrice} €</p>
                </div>
              </button>
            ))}

            {filteredModels.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500 font-medium">
                Aucun modèle trouvé pour "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Model detail — edit repairs */
        currentModel && editedRepairs && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Summary card */}
            <div className="bg-white/40 p-6 sm:p-8 rounded-[2rem] shadow-soft flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--color-brand-terracotta)]/10 flex items-center justify-center shrink-0">
                <Smartphone className="w-8 h-8 text-[var(--color-brand-terracotta)]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[var(--color-brand-dark)]">{currentModel.model}</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  {selectedBrand} • Prix de base : <span className="text-[var(--color-brand-terracotta)] font-bold">{currentModel.basePrice} €</span>
                </p>
              </div>
            </div>

            {/* Repair costs */}
            <div className="bg-white/40 p-6 sm:p-8 rounded-[2rem] shadow-soft">
              <h3 className="font-bold text-lg text-[var(--color-brand-dark)] mb-6 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[var(--color-brand-terracotta)]" />
                Coûts de réparation
              </h3>

              <div className="flex flex-col gap-4">
                {Object.entries(editedRepairs).map(([key, value]) => {
                  const Icon = REPAIR_ICONS[key as RepairKeys] || Wrench;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-4 bg-[var(--color-brand-light)] p-4 rounded-2xl shadow-inner-soft"
                    >
                      <div className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[var(--color-brand-terracotta)]" />
                      </div>
                      <span className="flex-1 font-semibold text-[var(--color-brand-dark)] text-sm">
                        {repairLabels[key] || key}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handleRepairChange(key, parseInt(e.target.value) || 0)}
                          min={0}
                          className="w-24 text-right p-2 bg-white rounded-xl outline-none font-bold text-[var(--color-brand-terracotta)] shadow-soft text-sm focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all"
                        />
                        <span className="text-sm font-bold text-gray-400">€</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E8E1D9]">
                <div className="flex items-center gap-2">
                  {savedMessage && (
                    <span className="text-sm text-green-600 font-semibold animate-in fade-in">
                      ✓ Modifications sauvegardées
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[var(--color-brand-dark)] text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
