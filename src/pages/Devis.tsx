"use client";

import { useState, useMemo } from "react";
import { ChevronRight, Smartphone, Wrench, FileText, CheckCircle, Search, Users, Plus, Trash2, Download, TrendingDown, Shield, Zap, BarChart2 } from "lucide-react";
import { DevisPDF } from "../components/DevisPDF";
import { DeviceGrade, DevisItem, Expertise } from "@/types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

// Mock catalog for pricing
const CATALOG = [
  { brand: "Apple", model: "iPhone 14 Pro", basePrice: 800 },
  { brand: "Apple", model: "iPhone 13", basePrice: 450 },
  { brand: "Samsung", model: "Galaxy S22", basePrice: 400 },
  { brand: "Google", model: "Pixel 7", basePrice: 350 },
];

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
  const [step, setStep] = useState(0);
  const [devisType, setDevisType] = useState<"unitaire" | "flotte" | null>(null);

  // State for Flotte (Bulk)
  const [bulkItems, setBulkItems] = useState<{ model: string, grade: DeviceGrade, quantity: number }[]>([
    { model: "iPhone 14 Pro", grade: "B", quantity: 5 }
  ]);

  // State for Unitaire
  const [selectedModel, setSelectedModel] = useState("");
  const [unitGrade, setUnitGrade] = useState<DeviceGrade>("A");
  const [repairs, setRepairs] = useState<{ name: string, price: number }[]>([]);
  const [pricingStrategy, setPricingStrategy] = useState<"safe" | "market" | "aggressive">("market");

  // Calculations for Unitaire Pricing Step
  const unitairePricing = useMemo(() => {
    if (devisType !== "unitaire" || !selectedModel) return null;

    const cat = CATALOG.find(c => c.model === selectedModel);
    const base = cat ? cat.basePrice : 0;
    const gradePrice = Math.round(base * (1 - GRADE_DISCOUNTS[unitGrade]));
    const repairsTotal = repairs.reduce((acc, r) => acc + r.price, 0);
    const valNet = Math.max(0, gradePrice - repairsTotal);

    const safePrice = Math.round(valNet * STRATEGY_MODIFIERS.safe);
    const marketPrice = Math.round(valNet * STRATEGY_MODIFIERS.market);
    const aggressivePrice = Math.round(valNet * STRATEGY_MODIFIERS.aggressive);

    // Mock Depreciation Data (6 months)
    const currentMonth = new Date().getMonth();
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const m = (currentMonth + i) % 12;
      // depreciates by ~2.5% per month exponentially
      const predictedVal = Math.round(valNet * Math.pow(0.975, i));
      return {
        name: i === 0 ? "Actuel" : months[m],
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
  }, [devisType, selectedModel, unitGrade, repairs]);

  // Calculate final Expertise object
  const expertise: Expertise = useMemo(() => {
    let items: DevisItem[] = [];

    if (devisType === "flotte") {
      items = bulkItems.map((bi, i) => {
        const cat = CATALOG.find(c => c.model === bi.model);
        const base = cat ? cat.basePrice : 0;
        const unitPrice = Math.round(base * (1 - GRADE_DISCOUNTS[bi.grade]));
        return {
          id: `item-${i}`,
          grade: bi.grade,
          quantity: bi.quantity,
          unitPrice,
          device: { id: `d-${i}`, model: bi.model, brand: cat?.brand || "Inconnu", basePrice: base }
        };
      });
    } else {
      const cat = CATALOG.find(c => c.model === selectedModel);
      const base = cat ? cat.basePrice : 0;

      let unitPrice = 0;
      if (unitairePricing) {
        if (pricingStrategy === "safe") unitPrice = unitairePricing.safePrice;
        if (pricingStrategy === "market") unitPrice = unitairePricing.marketPrice;
        if (pricingStrategy === "aggressive") unitPrice = unitairePricing.aggressivePrice;
      }

      items = [{
        id: "item-unit",
        grade: unitGrade,
        quantity: 1,
        unitPrice,
        repairs: repairs.map(r => r.name),
        device: { id: "d-u", model: selectedModel, brand: cat?.brand || "Inconnu", basePrice: base }
      }];
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
  }, [devisType, bulkItems, selectedModel, unitGrade, repairs, pricingStrategy, unitairePricing]);

  const addBulkItem = () => setBulkItems([...bulkItems, { model: "iPhone 13", grade: "B", quantity: 1 }]);
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
        <h1 className="text-3xl font-bold tracking-tight">Nouveau Devis</h1>
        <p className="text-gray-500 font-medium text-sm">Créez une nouvelle offre de reprise (Unitaire ou Lot).</p>
      </header>

      {/* Stepper (Only show if type is selected) */}
      {devisType && (
        <div className="flex items-center justify-between relative px-2 sm:px-8">
          <div className="absolute left-6 right-6 sm:left-8 sm:right-8 top-1/2 -translate-y-1/2 h-1 bg-[#E8E1D9] -z-10 rounded-full" />

          <div className="flex flex-col items-center gap-2 sm:gap-3 bg-[var(--color-brand-light)] px-2 sm:px-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 1 ? "bg-[var(--color-brand-terracotta)] text-white shadow-soft" : "bg-[var(--color-brand-light)] text-gray-400 shadow-inner-soft"}`}>
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${step >= 1 ? "text-[var(--color-brand-dark)]" : "text-gray-400"}`}>Appareils</span>
          </div>

          {devisType === "unitaire" && (
            <>
              <div className="flex flex-col items-center gap-2 sm:gap-3 bg-[var(--color-brand-light)] px-2 sm:px-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 2 ? "bg-[var(--color-brand-terracotta)] text-white shadow-soft" : "bg-[var(--color-brand-light)] text-gray-400 shadow-inner-soft"}`}>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${step >= 2 ? "text-[var(--color-brand-dark)]" : "text-gray-400"}`}>Diagnostic</span>
              </div>
              <div className="flex flex-col items-center gap-2 sm:gap-3 bg-[var(--color-brand-light)] px-2 sm:px-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 3 ? "bg-[var(--color-brand-terracotta)] text-white shadow-soft" : "bg-[var(--color-brand-light)] text-gray-400 shadow-inner-soft"}`}>
                  <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${step >= 3 ? "text-[var(--color-brand-dark)]" : "text-gray-400"}`}>Prestations</span>
              </div>
              <div className="flex flex-col items-center gap-2 sm:gap-3 bg-[var(--color-brand-light)] px-2 sm:px-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 4 ? "bg-[var(--color-brand-terracotta)] text-white shadow-soft" : "bg-[var(--color-brand-light)] text-gray-400 shadow-inner-soft"}`}>
                  <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${step >= 4 ? "text-[var(--color-brand-dark)]" : "text-gray-400"}`}>Stratégie</span>
              </div>
            </>
          )}

          <div className="flex flex-col items-center gap-2 sm:gap-3 bg-[var(--color-brand-light)] px-2 sm:px-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${currentStepLabel === 5 ? "bg-[var(--color-brand-terracotta)] text-white shadow-soft" : "bg-[var(--color-brand-light)] text-gray-400 shadow-inner-soft"}`}>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${currentStepLabel === 5 ? "text-[var(--color-brand-dark)]" : "text-gray-400"}`}>Devis PDF</span>
          </div>
        </div>
      )}

      <main className="bg-[var(--color-brand-light)] p-6 md:p-10 rounded-[2rem] shadow-soft min-h-[400px]">
        {/* Step 0: Choice */}
        {step === 0 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Type de reprise</h2>
              <p className="text-sm text-gray-500">S'agit-il d'un client particulier (1 appareil) ou d'une flotte d'entreprise (plusieurs appareils) ?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <button
                onClick={() => { setDevisType("unitaire"); setStep(1); }}
                className="flex flex-col items-center gap-4 p-8 bg-[var(--color-brand-light)] rounded-[2rem] shadow-soft-active hover:shadow-soft transition-all text-[var(--color-brand-dark)] group"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-inner-soft flex items-center justify-center group-hover:bg-[var(--color-brand-terracotta)] group-hover:text-white transition-colors">
                  <Smartphone className="w-8 h-8" />
                </div>
                <span className="font-bold text-xl">Reprise Unitaire</span>
              </button>

              <button
                onClick={() => { setDevisType("flotte"); setStep(1); }}
                className="flex flex-col items-center gap-4 p-8 bg-[var(--color-brand-light)] rounded-[2rem] shadow-soft-active hover:shadow-soft transition-all text-[var(--color-brand-dark)] group"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-inner-soft flex items-center justify-center group-hover:bg-[var(--color-brand-terracotta)] group-hover:text-white transition-colors">
                  <Users className="w-8 h-8" />
                </div>
                <span className="font-bold text-xl">Reprise en Lot (Flotte)</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Flotte Devices */}
        {step === 1 && devisType === "flotte" && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold mb-1">Marchandise (Lot)</h2>
                <p className="text-sm text-gray-500">Ajoutez les lignes de téléphones pour ce devis de flotte.</p>
              </div>
              <button onClick={addBulkItem} className="flex items-center gap-2 text-sm font-bold text-[var(--color-brand-terracotta)] hover:underline">
                <Plus className="w-4 h-4" /> Ajouter Ligne
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {bulkItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
                  <select
                    value={item.model}
                    onChange={e => updateBulkItem(index, 'model', e.target.value)}
                    className="flex-1 p-2 bg-[var(--color-brand-light)] rounded-xl outline-none font-medium"
                  >
                    {CATALOG.map(c => <option key={c.model} value={c.model}>{c.brand} {c.model}</option>)}
                  </select>

                  <select
                    value={item.grade}
                    onChange={e => updateBulkItem(index, 'grade', e.target.value)}
                    className="w-24 p-2 bg-[var(--color-brand-light)] rounded-xl outline-none font-medium text-center"
                  >
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                    <option value="D">Grade D</option>
                  </select>

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateBulkItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-20 p-2 bg-[var(--color-brand-light)] rounded-xl outline-none font-medium text-center"
                  />

                  <button onClick={() => removeBulkItem(index)} className="p-3 sm:p-2 bg-red-50 sm:bg-transparent text-red-500 hover:bg-red-100 sm:hover:bg-red-50 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Unitaire Device */}
        {step === 1 && devisType === "unitaire" && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Quel appareil souhaitez-vous reprendre ?</h2>
              <p className="text-sm text-gray-500">Sélectionnez le modèle.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATALOG.map((cat, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedModel(cat.model)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer text-center font-medium transition-all ${selectedModel === cat.model
                      ? "bg-[var(--color-brand-light)] shadow-inner-soft border-[var(--color-brand-terracotta)] text-[var(--color-brand-terracotta)]"
                      : "bg-[var(--color-brand-light)] shadow-soft-active hover:shadow-soft border-transparent text-[var(--color-brand-dark)]"
                    }`}
                >
                  {cat.model}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Unitaire Grade */}
        {step === 2 && devisType === "unitaire" && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Diagnostic Global (Grade)</h2>
              <p className="text-sm text-gray-500">Évaluez l'état général de l'appareil (impacte le prix de base).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { grade: "A", desc: "Comme neuf (0%)" },
                { grade: "B", desc: "Micro-rayures (-15%)" },
                { grade: "C", desc: "Rayures marquées (-30%)" },
                { grade: "D", desc: "Cassé (-50%)" },
              ].map((g, i) => (
                <div
                  key={i}
                  onClick={() => setUnitGrade(g.grade as DeviceGrade)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${unitGrade === g.grade
                      ? "bg-[var(--color-brand-light)] shadow-inner-soft border-[var(--color-brand-terracotta)]"
                      : "bg-[var(--color-brand-light)] shadow-soft-active hover:shadow-soft border-transparent"
                    }`}
                >
                  <h3 className="font-bold text-lg text-[var(--color-brand-dark)]">Grade {g.grade}</h3>
                  <p className="text-sm text-gray-500">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Unitaire Repairs */}
        {step === 3 && devisType === "unitaire" && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Prestations & Main d'œuvre</h2>
              <p className="text-sm text-gray-500">Ajoutez des réparations nécessaires avant revente.</p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { name: "Remplacement Batterie", price: 45 },
                { name: "Changement Écran", price: 120 },
                { name: "Nettoyage Connecteurs", price: 15 },
              ].map((opt, i) => {
                const isSelected = repairs.some(r => r.name === opt.name);
                return (
                  <label key={i} className={`flex items-center justify-between p-5 bg-[var(--color-brand-light)] rounded-2xl shadow-soft-active cursor-pointer transition-all border-2 ${isSelected ? "border-[var(--color-brand-terracotta)] shadow-inner-soft" : "border-transparent hover:shadow-soft"}`}>
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setRepairs([...repairs, opt]);
                          else setRepairs(repairs.filter(r => r.name !== opt.name));
                        }}
                        className="w-5 h-5 accent-[var(--color-brand-terracotta)]"
                      />
                      <span className="font-semibold">{opt.name}</span>
                    </div>
                    <span className="text-[var(--color-brand-terracotta)] font-bold">{opt.price} €</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4: Market Strategy & Prediction (Unitaire Only) */}
        {step === 4 && devisType === "unitaire" && unitairePricing && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4">
            <header>
              <h2 className="text-2xl font-bold mb-2">Stratégie & Analyse Marché</h2>
              <p className="text-sm text-gray-500">
                La valeur moyenne constatée pour ce {selectedModel} (Grade {unitGrade}) après réparations est de <span className="font-bold text-[var(--color-brand-dark)]">{unitairePricing.valNet} €</span>.
              </p>
            </header>

            {/* Sources du marché */}
            <div className="bg-[var(--color-brand-light)] p-6 rounded-2xl shadow-inner-soft">
              <h3 className="font-bold text-[var(--color-brand-dark)] mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-[var(--color-brand-terracotta)]" />
                Sources du marché en temps réel
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {unitairePricing.marketSources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-4 rounded-xl shadow-sm border-2 border-transparent hover:border-[var(--color-brand-terracotta)] hover:shadow-soft flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                  >
                    <span className="text-xs text-gray-500 font-semibold group-hover:text-[var(--color-brand-terracotta)] transition-colors leading-tight">{source.name}</span>
                    <span className="text-lg md:text-xl font-bold text-[var(--color-brand-dark)]">{source.price} €</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setPricingStrategy("safe")}
                className={`flex flex-col items-start gap-4 p-6 rounded-2xl border-2 transition-all text-left ${pricingStrategy === "safe"
                    ? "bg-[var(--color-brand-light)] shadow-inner-soft border-blue-400"
                    : "bg-[var(--color-brand-light)] shadow-soft-active hover:shadow-soft border-transparent"
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner-soft">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-900">Sécurisée</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-3">Risque minimal face à la dépréciation.</p>
                  <span className="text-3xl font-bold text-blue-600">{unitairePricing.safePrice} €</span>
                </div>
              </button>

              <button
                onClick={() => setPricingStrategy("market")}
                className={`flex flex-col items-start gap-4 p-6 rounded-2xl border-2 transition-all text-left ${pricingStrategy === "market"
                    ? "bg-[var(--color-brand-light)] shadow-inner-soft border-[var(--color-brand-terracotta)]"
                    : "bg-[var(--color-brand-light)] shadow-soft-active hover:shadow-soft border-transparent"
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-terracotta)]/20 flex items-center justify-center text-[var(--color-brand-terracotta)] shadow-inner-soft">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-brand-terracotta)]">Marché</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-3">Prix juste selon la cotation actuelle.</p>
                  <span className="text-3xl font-bold text-[var(--color-brand-terracotta)]">{unitairePricing.marketPrice} €</span>
                </div>
              </button>

              <button
                onClick={() => setPricingStrategy("aggressive")}
                className={`flex flex-col items-start gap-4 p-6 rounded-2xl border-2 transition-all text-left ${pricingStrategy === "aggressive"
                    ? "bg-[var(--color-brand-light)] shadow-inner-soft border-orange-400"
                    : "bg-[var(--color-brand-light)] shadow-soft-active hover:shadow-soft border-transparent"
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner-soft">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-900">Agressive</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-3">Pour être sûr de remporter la reprise.</p>
                  <span className="text-3xl font-bold text-orange-600">{unitairePricing.aggressivePrice} €</span>
                </div>
              </button>
            </div>

            <div className="p-8 rounded-[2rem] bg-[var(--color-brand-light)] shadow-inner-soft mt-4">
              <h3 className="font-bold text-[var(--color-brand-dark)] mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[var(--color-brand-terracotta)]" />
                Prédiction de Dépréciation (Prochains 6 mois)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={unitairePricing.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E07A5F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E1D9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '8px 8px 16px #d4d4dc, -8px -8px 16px #ffffff' }}
                    itemStyle={{ color: '#1E1E24', fontWeight: 'bold' }}
                    formatter={(val: any) => [`${val} €`, 'Valeur estimée']}
                  />
                  <ReferenceLine y={unitairePricing.marketPrice} stroke="#E07A5F" strokeDasharray="3 3" label={{ position: 'top', value: 'Votre offre', fill: '#E07A5F', fontSize: 10 }} />
                  <Area type="monotone" dataKey="Valeur" stroke="#E07A5F" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Final Step: PDF Preview */}
        {currentStepLabel === 5 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Devis Prêt !</h2>
                <p className="text-sm text-gray-500">Prévisualisez le devis professionnel ci-dessous.</p>
              </div>
              <PDFDownloadLink document={<DevisPDF expertise={expertise} />} fileName={`Devis_${expertise.id}.pdf`}>
                {({ loading }) => (
                  <button disabled={loading} className="flex items-center gap-2 bg-[var(--color-brand-dark)] text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity">
                    <Download className="w-5 h-5" />
                    {loading ? "Génération..." : "Télécharger PDF"}
                  </button>
                )}
              </PDFDownloadLink>
            </div>

            <div className="bg-white rounded-3xl shadow-inner-soft overflow-hidden h-[600px] p-4">
              <PDFViewer width="100%" height="100%" className="border-0 rounded-2xl">
                <DevisPDF expertise={expertise} />
              </PDFViewer>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step > 0 && (
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8 md:mt-12 pt-6 border-t border-[#E8E1D9]">
            <button
              onClick={() => {
                if (step === 1) setStep(0);
                else setStep(s => Math.max(1, s - 1));
              }}
              className="w-full sm:w-auto px-6 py-4 sm:py-3 font-semibold text-gray-500 hover:bg-[#E8E1D9]/50 rounded-2xl sm:rounded-full transition-all text-center"
            >
              Retour
            </button>

            {step < maxSteps && (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={(devisType === "unitaire" && step === 1 && !selectedModel) || (devisType === "flotte" && bulkItems.length === 0)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-brand-dark)] text-white px-8 py-4 sm:py-3 rounded-2xl sm:rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Étape suivante
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
