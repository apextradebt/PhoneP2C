"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronRight, Smartphone, Wrench, FileText, CheckCircle, Search, Users, Plus, Trash2, Download, TrendingDown, Shield, Zap, BarChart2, Loader2 } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { DeviceGrade, DevisItem, Expertise } from "@/types";
import { useCatalog } from "@/lib/CatalogContext";
import { useTranslation } from "react-i18next";

import ChoiceReprise from "@/components/devis/ChoiceReprise";
import F_step1 from "@/components/devis/flotte/F_step1";
import U_steap1 from "@/components/devis/unitaire/U_step1";
import U_step2 from "@/components/devis/unitaire/U_step2";
import U_step3 from "@/components/devis/unitaire/U_step3";
import U_step4 from "@/components/devis/unitaire/U_step4";
import FinalStep from "@/components/FinalStep";
import NavigationButton from "./NavigationButton";

const GRADE_DISCOUNTS: Record<DeviceGrade, number> = {
  "A": 0,    // 0% discount
  "B": 0.15, // 15% discount
  "C": 0.30, // 30% discount
  "D": 0.50, // 50% discount
};

const STRATEGY_MODIFIERS = {
  "safe": 0.85,      // -15% (marge très forte)
  "market": 1.0,     // Prix standard
  "aggressive": 1.10 // +10% (marge faible, très attractif)
};

export default function DevisPage() {
  const { t } = useTranslation();
  const { allModels, getModel, getRepairOptions } = useCatalog();
  const [step, setStep] = useState(0);
  const [devisType, setDevisType] = useState<"unitaire" | "flotte" | null>(null);

  // State for Flotte (Bulk)
  const firstModel = allModels[0]?.model || "";
  const [bulkItems, setBulkItems] = useState<{ model: string, grade: DeviceGrade, quantity: number }[]>([
    { model: firstModel, grade: "B", quantity: 5 }
  ]);

  // State for Unitaire
  const { getAccessTokenSilently } = useAuth0();
  const [selectedModel, setSelectedModel] = useState("");
  const [unitGrade, setUnitGrade] = useState<DeviceGrade>("A");
  const [unitCapacity, setUnitCapacity] = useState<string>("128GB");
  const [unitColor, setUnitColor] = useState<string>("Noir Sidéral");
  const [repairs, setRepairs] = useState<{ name: string, price: number }[]>([]);
  const [pricingStrategy, setPricingStrategy] = useState<"safe" | "market" | "aggressive">("market");
  const [deviceSearch, setDeviceSearch] = useState("");

  // State for Market Fetch
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [marketResults, setMarketResults] = useState<any>(null);

  const filteredModels = useMemo(() => {
    if (!deviceSearch.trim()) return allModels;
    const q = deviceSearch.toLowerCase();
    return allModels.filter(m => m.model.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q));
  }, [allModels, deviceSearch]);

  // Calculations for Unitaire Pricing Step
  const unitairePricing = useMemo(() => {
    if (devisType !== "unitaire" || !selectedModel) return null;

    const catModel = getModel(selectedModel);
    const base = catModel ? catModel.basePrice : 0;

    let gradePrice = 0;
    if (marketResults?.resultats?.offres && marketResults.resultats.offres.length > 0) {
      const prices = marketResults.resultats.offres.map((o: any) => o.prix);
      gradePrice = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);
    } else {
      gradePrice = Math.round(base * (1 - GRADE_DISCOUNTS[unitGrade]));
    }

    const repairsTotal = repairs.reduce((acc, r) => acc + r.price, 0);
    const valNet = Math.max(0, gradePrice - repairsTotal);

    const safePrice = Math.round(valNet * STRATEGY_MODIFIERS.safe);
    const marketPrice = Math.round(valNet * STRATEGY_MODIFIERS.market);
    const aggressivePrice = Math.round(valNet * STRATEGY_MODIFIERS.aggressive);

    // Mock Depreciation Data (6-month intervals)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const totalMonthsAdded = i * 6;
      const d = new Date(currentYear, currentMonth + totalMonthsAdded, 1);
      const m = d.getMonth();
      const y = d.getFullYear().toString().slice(-2);

      // depreciates by ~2.5% per month
      const predictedVal = Math.round(valNet * Math.pow(0.975, totalMonthsAdded));
      return {
        name: i === 0 ? "Actuel" : `${months[m]} '${y}`,
        Valeur: predictedVal
      };
    });

    // Dynamic URLs based on Model & Grade
    const searchSlug = encodeURIComponent(`${selectedModel.toLowerCase()} grade ${unitGrade.toLowerCase()}`);

    // Mock Market Sources (justifying the valNet)
    const marketSources = [
      { name: "BackMarket", price: valNet + 25, url: `https://www.backmarket.fr/fr-fr/search?q=${searchSlug}`, trend: "up" },
      { name: "Amazon Renewed", price: valNet + 5, url: `https://www.amazon.fr/s?k=${searchSlug}+renewed`, trend: "stable" },
      { name: "Certideal", price: Math.max(0, valNet - 15), url: `https://certideal.com/search?q=${searchSlug}`, trend: "down" },
      { name: "Rakuten", price: valNet + 12, url: `https://fr.shopping.rakuten.com/search/${searchSlug}`, trend: "up" }
    ];

    return { valNet, safePrice, marketPrice, aggressivePrice, chartData, marketSources };
  }, [devisType, selectedModel, unitGrade, repairs, getModel]);

  // Trigger market fetch when reaching Step 4 for Unitaire
  useEffect(() => {
    if (step === 4 && devisType === "unitaire" && !marketResults && !isFetchingPrices) {
      const fetchPrices = async () => {
        setIsFetchingPrices(true);
        try {
          let token = "";
          try {
            token = await getAccessTokenSilently();
          } catch (e) { console.error("No token", e); }

          const catModel = getModel(selectedModel);
          const brand = catModel?.brand || (selectedModel.toLowerCase().includes('iphone') ? 'apple' : 'samsung');

          const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/market/prices`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              marque: brand,
              modele: selectedModel,
              couleur: unitColor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" ", "-"),
              capacite: unitCapacity.replace("GB", "").replace("TB", "000"),
              grade: unitGrade === "A" ? "parfait_etat" : unitGrade === "B" ? "tres_bon_etat" : unitGrade === "C" ? "bon_etat" : "etat_correct"
            })
          });

          if (!response.ok) throw new Error("Erreur api");
          const data = await response.json();
          setMarketResults(data);
        } catch (error) {
          console.error(error);
          setMarketResults({ resultats: { offres: [] } });
        } finally {
          setIsFetchingPrices(false);
        }
      };

      fetchPrices();
    }
  }, [step, devisType, selectedModel, unitColor, unitCapacity, unitGrade, getAccessTokenSilently, getModel, marketResults, isFetchingPrices]);

  // Reset market results if dependencies change
  useEffect(() => {
    setMarketResults(null);
  }, [selectedModel, unitColor, unitCapacity, unitGrade]);
  // Calculate final Expertise object
  const expertise: Expertise = useMemo(() => {
    let items: DevisItem[] = [];

    if (devisType === "flotte") {
      items = bulkItems.map((bi, i) => {
        const catModel = getModel(bi.model);
        const base = catModel ? catModel.basePrice : 0;
        const unitPrice = Math.round(base * (1 - GRADE_DISCOUNTS[bi.grade]));
        return {
          id: `item-${i}`,
          grade: bi.grade,
          quantity: bi.quantity,
          unitPrice,
          device: { id: `d-${i}`, model: bi.model, brand: catModel?.brand || "Inconnu", basePrice: base }
        };
      });
    } else {
      const catModel = getModel(selectedModel);
      const base = catModel ? catModel.basePrice : 0;

      let gradePrice = 0;
      if (marketResults?.resultats?.offres && marketResults.resultats.offres.length > 0) {
        const prices = marketResults.resultats.offres.map((o: any) => o.prix);
        gradePrice = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);
      } else {
        gradePrice = Math.round(base * (1 - GRADE_DISCOUNTS[unitGrade]));
      }

      let baseDevicePrice = gradePrice;
      if (pricingStrategy === "safe") baseDevicePrice = Math.round(gradePrice * STRATEGY_MODIFIERS.safe);
      if (pricingStrategy === "market") baseDevicePrice = Math.round(gradePrice * STRATEGY_MODIFIERS.market);
      if (pricingStrategy === "aggressive") baseDevicePrice = Math.round(gradePrice * STRATEGY_MODIFIERS.aggressive);

      items = [{
        id: "item-unit",
        grade: unitGrade,
        quantity: 1,
        unitPrice: baseDevicePrice,
        repairs: repairs,
        device: { id: "d-u", model: selectedModel, brand: catModel?.brand || "Inconnu", basePrice: base }
      }];

      repairs.forEach((r, i) => {
        let repairPrice = -r.price;
        if (pricingStrategy === "safe") repairPrice = Math.round(-r.price * STRATEGY_MODIFIERS.safe);
        if (pricingStrategy === "market") repairPrice = Math.round(-r.price * STRATEGY_MODIFIERS.market);
        if (pricingStrategy === "aggressive") repairPrice = Math.round(-r.price * STRATEGY_MODIFIERS.aggressive);

        items.push({
          id: `rep-${i}`,
          grade: "A" as DeviceGrade,
          quantity: 1,
          unitPrice: repairPrice,
          device: { id: `r-${i}`, model: r.name, brand: "Prestation", basePrice: r.price }
        });
      });
    }

    const totalProposedPrice = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

    return {
      id: `DEV-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      status: "Devis Envoyé",
      type: devisType || "unitaire",
      totalProposedPrice,
      items,
      client: {
        id: "c-draft",
        firstName: "Client",
        lastName: "Prospect",
        email: "client@example.com",
        phone: "06 00 00 00 00",
        company: devisType === "flotte" ? "Entreprise XYZ" : undefined
      }
    };
  }, [devisType, bulkItems, selectedModel, unitGrade, repairs, pricingStrategy, unitairePricing, getModel]);

  const addBulkItem = () => setBulkItems([...bulkItems, { model: firstModel, grade: "B", quantity: 1 }]);
  const updateBulkItem = (index: number, field: string, value: any) => {
    const newItems = [...bulkItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setBulkItems(newItems);
  };
  const removeBulkItem = (index: number) => setBulkItems(bulkItems.filter((_, i) => i !== index));

  const maxSteps = devisType === "flotte" ? 2 : 5;
  const currentStepLabel = devisType === "flotte" && step === 2 ? 5 : step;

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('devis.title')}</h1>
        <p className="text-gray-500 font-medium text-sm">{t('devis.desc')}</p>
      </header>

      {/* Stepper (Only show if type is selected) */}
      {devisType && (
        <div className="flex items-center justify-between relative px-2 sm:px-8">
          <div className="absolute left-6 right-6 sm:left-8 sm:right-8 top-1/2 -translate-y-1/2 h-1 bg-brand-lin -z-10 rounded-full" />

          <div className="flex flex-col items-center gap-2 sm:gap-3 bg-(--color-brand-light) px-2 sm:px-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 1 ? "bg-(--color-brand-terracotta) text-white shadow-soft" : "bg-(--color-brand-light) text-gray-400 shadow-inner-soft"}`}>
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${step >= 1 ? "text-(--color-brand-dark)" : "text-gray-400"}`}>Appareils</span>
          </div>

          {devisType === "unitaire" && (
            <>
              <div className="flex flex-col items-center gap-2 sm:gap-3 bg-(--color-brand-light) px-2 sm:px-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 2 ? "bg-(--color-brand-terracotta) text-white shadow-soft" : "bg-(--color-brand-light) text-gray-400 shadow-inner-soft"}`}>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${step >= 2 ? "text-(--color-brand-dark)" : "text-gray-400"}`}>Diagnostic</span>
              </div>
              <div className="flex flex-col items-center gap-2 sm:gap-3 bg-(--color-brand-light) px-2 sm:px-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 3 ? "bg-(--color-brand-terracotta) text-white shadow-soft" : "bg-(--color-brand-light) text-gray-400 shadow-inner-soft"}`}>
                  <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${step >= 3 ? "text-(--color-brand-dark)" : "text-gray-400"}`}>Prestations</span>
              </div>
              <div className="flex flex-col items-center gap-2 sm:gap-3 bg-(--color-brand-light) px-2 sm:px-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 4 ? "bg-(--color-brand-terracotta) text-white shadow-soft" : "bg-(--color-brand-light) text-gray-400 shadow-inner-soft"}`}>
                  <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${step >= 4 ? "text-(--color-brand-dark)" : "text-gray-400"}`}>Stratégie</span>
              </div>
            </>
          )}

          <div className="flex flex-col items-center gap-2 sm:gap-3 bg-(--color-brand-light) px-2 sm:px-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${currentStepLabel === 5 ? "bg-(--color-brand-terracotta) text-white shadow-soft" : "bg-(--color-brand-light) text-gray-400 shadow-inner-soft"}`}>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${currentStepLabel === 5 ? "text-(--color-brand-dark)" : "text-gray-400"}`}>Devis PDF</span>
          </div>
        </div>
      )}

      <main className="bg-(--color-brand-light) p-6 md:p-10 rounded-[2rem] shadow-soft min-h-100">
        {/* Step 0: Choice */}
        {step === 0 && (
          <ChoiceReprise setDevisType={setDevisType} setStep={setStep} />
        )}

        {/* Step 1: Flotte Devices */}
        {step === 1 && devisType === "flotte" && (
          <F_step1 addBulkItem={addBulkItem} bulkItems={bulkItems} updateBulkItem={updateBulkItem} allModels={allModels} removeBulkItem={removeBulkItem} />
        )}

        {/* Step 1: Unitaire Device */}
        {step === 1 && devisType === "unitaire" && (
          <U_steap1 deviceSearch={deviceSearch} setDeviceSearch={setDeviceSearch} filteredModels={filteredModels} setSelectedModel={setSelectedModel} setRepairs={setRepairs} selectedModel={selectedModel} />
        )}

        {/* Step 2: Unitaire Caractéristiques & Diagnostic */}
        {step === 2 && devisType === "unitaire" && (
          <U_step2 unitCapacity={unitCapacity} unitColor={unitColor} unitGrade={unitGrade} setUnitCapacity={setUnitCapacity} setUnitColor={setUnitColor} setUnitGrade={setUnitGrade} />
        )}

        {/* Step 3: Unitaire Repairs */}
        {step === 3 && devisType === "unitaire" && (
          <U_step3 selectedModel={selectedModel} repairs={repairs} setRepairs={setRepairs} getRepairOptions={getRepairOptions} />
        )}

        {/* Step 4: Market Strategy & Prediction (Unitaire Only) */}
        {step === 4 && devisType === "unitaire" && unitairePricing && (
          <U_step4 unitairePricing={unitairePricing} selectedModel={selectedModel} unitCapacity={unitCapacity} unitColor={unitColor} unitGrade={unitGrade} isFetchingPrices={isFetchingPrices} marketResults={marketResults} pricingStrategy={pricingStrategy} setPricingStrategy={setPricingStrategy} />
        )
        }

        {/* Final Step: PDF Preview */}
        {
          currentStepLabel === 5 && (
            <FinalStep devisType={devisType} bulkItems={bulkItems} getModel={getModel} selectedModel={selectedModel} marketResults={marketResults} pricingStrategy={pricingStrategy} unitGrade={unitGrade} repairs={repairs} unitairePricing={unitairePricing} />
          )
        }

        {/* Navigation buttons */}
        {
          step > 0 && (
            <NavigationButton step={step} setStep={setStep} maxSteps={maxSteps} devisType={devisType} selectedModel={selectedModel} bulkItems={bulkItems} />
          )
        }
      </main >
    </div >
  );
}
