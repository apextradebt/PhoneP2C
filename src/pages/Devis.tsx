"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronRight, Smartphone, Laptop, FileText, CheckCircle, Search, Users, Plus, Trash2, Download, TrendingDown, Shield, Zap, BarChart2, Loader2, User } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { ClientDraft, DeviceCategory, DeviceGrade, DevisItem, Expertise, PaymentMethod } from "@/types";
import { saveAcceptedDevis } from "@/lib/devisApi";
import { monthLabel } from "@/lib/format";
import { useCatalog } from "@/lib/CatalogContext";
import { LAPTOP_MODELS, getLaptop } from "@/lib/laptopCatalog";
import { GRADE_DISCOUNTS, STRATEGY_MODIFIERS, fetchMarketPrices, referencePrice } from "@/lib/market";
import { useTranslation } from "react-i18next";

import ChoiceReprise from "@/components/devis/ChoiceReprise";
import F_step1 from "@/components/devis/flotte/F_step1";
import U_steap1 from "@/components/devis/unitaire/U_step1";
import U_step2, { COULEURS_PAR_DEFAUT } from "@/components/devis/unitaire/U_step2";
import U_step4 from "@/components/devis/unitaire/U_step4";
import ClientInfo, { EMPTY_CLIENT, isClientComplete } from "@/components/devis/ClientInfo";
import FinalStep from "@/components/FinalStep";
import NavigationButton from "./NavigationButton";

// N° lisible et quasi unique : date du jour + 4 chiffres (ex. DEV-260929-4821).
function newDevisId() {
  const d = new Date();
  const ymd = `${d.getFullYear() % 100}`.padStart(2, "0") + `${d.getMonth() + 1}`.padStart(2, "0") + `${d.getDate()}`.padStart(2, "0");
  return `DEV-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Refuser un devis (ou en démarrer un nouveau après acceptation) remonte
// l'assistant pour repartir d'un état entièrement vierge.
export default function DevisPage() {
  const [session, setSession] = useState(0);
  return <DevisWizard key={session} onReset={() => setSession(s => s + 1)} />;
}

function DevisWizard({ onReset }: { onReset: () => void }) {
  const { t, i18n } = useTranslation();
  const { allModels, getModel } = useCatalog();
  const [step, setStep] = useState(0);
  const [devisType, setDevisType] = useState<"unitaire" | "flotte" | null>(null);

  // State for Flotte (Bulk)
  const firstModel = allModels[0]?.model || "";
  const [bulkItems, setBulkItems] = useState<{ model: string, grade: DeviceGrade, quantity: number }[]>([
    { model: firstModel, grade: "B", quantity: 5 }
  ]);

  // State for Unitaire
  const { getAccessTokenSilently } = useAuth0();
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>("phone");
  const isLaptop = deviceCategory === "laptop";
  const [selectedModel, setSelectedModel] = useState("");
  const [unitGrade, setUnitGrade] = useState<DeviceGrade>("A");
  const [unitCapacity, setUnitCapacity] = useState<string>("128GB");
  const [unitColor, setUnitColor] = useState<string>("Noir");
  const [unitImei, setUnitImei] = useState("");
  const [unitSerial, setUnitSerial] = useState("");
  const [pricingStrategy, setPricingStrategy] = useState<"safe" | "market" | "aggressive">("market");
  const [deviceSearch, setDeviceSearch] = useState("");

  // State for Client (commun aux deux parcours)
  const [client, setClient] = useState<ClientDraft>(EMPTY_CLIENT);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [acceptedPayment, setAcceptedPayment] = useState<PaymentMethod | null>(null);

  // Un devis de flotte s'adresse par défaut à une entreprise, un devis unitaire à un particulier.
  useEffect(() => {
    if (devisType) setClient(c => ({ ...c, customerType: devisType === "flotte" ? "professionnel" : "particulier" }));
  }, [devisType]);

  // State for Market Fetch
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [marketResults, setMarketResults] = useState<any>(null);
  const [ventesResults, setVentesResults] = useState<{ total_offres: number; offres: { revendeur: string; prix: number }[] } | null>(null);
  const [priceForecast, setPriceForecast] = useState<{ forecast: { month: number; retention: number }[] } | null>(null);

  // Le parcours unitaire pioche dans le catalogue téléphones ou PC selon la catégorie choisie.
  const unitCatalog = isLaptop ? LAPTOP_MODELS : allModels;
  const unitModel = isLaptop ? getLaptop(selectedModel) : getModel(selectedModel);

  const filteredModels = useMemo(() => {
    if (!deviceSearch.trim()) return unitCatalog;
    const q = deviceSearch.toLowerCase();
    return unitCatalog.filter(m => m.model.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q));
  }, [unitCatalog, deviceSearch]);

  // Changer de catégorie change de catalogue : le modèle choisi et la recherche n'ont plus de sens.
  const changeDeviceCategory = (category: DeviceCategory) => {
    if (category === deviceCategory) return;
    setDeviceCategory(category);
    setSelectedModel("");
    setDeviceSearch("");
  };

  // Calculations for Unitaire Pricing Step
  const unitairePricing = useMemo(() => {
    if (devisType !== "unitaire" || !selectedModel) return null;

    const base = unitModel ? unitModel.basePrice : 0;

    const gradePrice = referencePrice(marketResults?.resultats?.offres ?? [], base, unitGrade);

    const valNet = Math.max(0, gradePrice);

    const safePrice = Math.round(valNet * STRATEGY_MODIFIERS.safe);
    const marketPrice = Math.round(valNet * STRATEGY_MODIFIERS.market);
    const aggressivePrice = Math.round(valNet * STRATEGY_MODIFIERS.aggressive);

    // Marge = prix de revente moyen constaté chez la concurrence (Back Market,
    // CertiDeal, Recommerce) - prix de rachat proposé au client.
    // Donne au staff une estimation de rentabilité par stratégie, pas juste le
    // montant de l'offre.
    const ventesOffres = ventesResults?.offres || [];
    const avgVente = ventesOffres.length > 0
      ? Math.round(ventesOffres.reduce((acc: number, o: any) => acc + o.prix, 0) / ventesOffres.length)
      : null;

    const margeSafe = avgVente !== null ? avgVente - safePrice : null;
    const margeMarket = avgVente !== null ? avgVente - marketPrice : null;
    const margeAggressive = avgVente !== null ? avgVente - aggressivePrice : null;

    // Prédiction de dépréciation à 12 mois — issue du modèle de deep learning
    // (ml/) quand disponible, sinon repli sur une courbe forfaitaire (-2.5%/mois).
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const forecastMonths = priceForecast?.forecast;
    const isForecastFromModel = Array.isArray(forecastMonths) && forecastMonths.length === 12;

    const chartData = Array.from({ length: 13 }).map((_, i) => {
      const d = new Date(currentYear, currentMonth + i, 1);

      let value = valNet;
      if (i > 0) {
        const retention = isForecastFromModel ? forecastMonths![i - 1].retention : Math.pow(0.975, i);
        value = Math.round(valNet * retention);
      }

      return { name: i === 0 ? t("common.now") : monthLabel(d), Valeur: value };
    });

    return {
      valNet, safePrice, marketPrice, aggressivePrice, chartData,
      forecastFromModel: isForecastFromModel,
      avgVente, margeSafe, margeMarket, margeAggressive,
    };
  }, [devisType, selectedModel, unitGrade, unitModel, marketResults, priceForecast, ventesResults, t, i18n.language]);

  // Trigger market fetch when reaching Step 3 (Stratégie) for Unitaire
  useEffect(() => {
    if (step === 3 && devisType === "unitaire" && !marketResults && !isFetchingPrices) {
      const fetchPrices = async () => {
        setIsFetchingPrices(true);
        try {
          let token = "";
          try {
            token = await getAccessTokenSilently();
          } catch (e) { console.error("No token", e); }

          const brand = unitModel?.brand || (selectedModel.toLowerCase().includes('iphone') ? 'apple' : 'samsung');

          const data = await fetchMarketPrices(token, { brand, model: selectedModel, storage: unitCapacity, color: unitColor, grade: unitGrade, category: deviceCategory });

          setMarketResults({ resultats: { offres: data?.offres || [] } });
          setVentesResults(data?.ventes ? { total_offres: data.ventes.length, offres: data.ventes } : null);

          try {
            const forecastRes = await fetch(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/market/forecast?marque=${encodeURIComponent(brand)}&modele=${encodeURIComponent(selectedModel)}`,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            setPriceForecast(forecastRes.ok ? await forecastRes.json() : null);
          } catch (forecastError) {
            console.error(forecastError);
            setPriceForecast(null);
          }
        } catch (error) {
          console.error(error);
          setMarketResults({ resultats: { offres: [] }, fetchFailed: true });
          setVentesResults(null);
        } finally {
          setIsFetchingPrices(false);
        }
      };

      fetchPrices();
    }
  }, [step, devisType, selectedModel, unitColor, unitCapacity, unitGrade, deviceCategory, getAccessTokenSilently, unitModel, marketResults, isFetchingPrices]);

  // Reset market results if dependencies change
  useEffect(() => {
    setMarketResults(null);
    setVentesResults(null);
    setPriceForecast(null);
  }, [selectedModel, unitColor, unitCapacity, unitGrade]);

  // Un modèle n'a pas forcément été vendu dans la capacité / le coloris
  // actuellement sélectionnés (ex. iPhone 16 Pro Max n'existe pas en 128 Go,
  // ni en « Violet ») : s'ils deviennent invalides en changeant de modèle, on
  // retombe sur la première option réellement proposée pour éviter une
  // recherche de marché vouée à échouer sur tous les revendeurs.
  useEffect(() => {
    const options = unitModel?.storageOptions;
    if (options && options.length > 0 && !options.includes(unitCapacity)) {
      setUnitCapacity(options[0]);
    }
    const colors = unitModel?.colors && unitModel.colors.length > 0 ? unitModel.colors : COULEURS_PAR_DEFAUT;
    if (!colors.some(c => c.name === unitColor)) {
      setUnitColor(colors[0].name);
    }
  }, [unitModel]);
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
      const base = unitModel ? unitModel.basePrice : 0;

      const gradePrice = referencePrice(marketResults?.resultats?.offres ?? [], base, unitGrade);

      let baseDevicePrice = gradePrice;
      if (pricingStrategy === "safe") baseDevicePrice = Math.round(gradePrice * STRATEGY_MODIFIERS.safe);
      if (pricingStrategy === "market") baseDevicePrice = Math.round(gradePrice * STRATEGY_MODIFIERS.market);
      if (pricingStrategy === "aggressive") baseDevicePrice = Math.round(gradePrice * STRATEGY_MODIFIERS.aggressive);

      items = [{
        id: "item-unit",
        grade: unitGrade,
        quantity: 1,
        unitPrice: baseDevicePrice,
        device: {
          id: "d-u",
          category: deviceCategory,
          model: selectedModel,
          brand: unitModel?.brand || "Inconnu",
          basePrice: base,
          storage: unitCapacity,
          // Un PC n'est identifié ni par son coloris ni par un IMEI.
          color: isLaptop ? undefined : unitColor,
          imei: isLaptop ? undefined : unitImei || undefined,
          serialNumber: isLaptop ? unitSerial.trim() || undefined : undefined,
        }
      }];
    }

    const totalProposedPrice = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const isPro = client.customerType === "professionnel";
    const opt = (value: string) => value.trim() || undefined;

    return {
      id: newDevisId(),
      date: new Date().toISOString(),
      status: "Devis Envoyé",
      type: devisType || "unitaire",
      totalProposedPrice,
      items,
      notes: opt(quoteNotes),
      client: {
        id: "c-draft",
        customerType: client.customerType,
        firstName: client.firstName.trim(),
        lastName: client.lastName.trim(),
        email: client.email.trim(),
        phone: client.phone.trim(),
        company: isPro ? opt(client.company) : undefined,
        siret: isPro ? opt(client.siret) : undefined,
        address: opt(client.address),
        postalCode: opt(client.postalCode),
        city: opt(client.city),
      }
    };
  }, [devisType, bulkItems, selectedModel, unitGrade, unitCapacity, unitColor, unitImei, unitSerial, deviceCategory, isLaptop, pricingStrategy, getModel, unitModel, marketResults, client, quoteNotes]);

  const addBulkItem = () => setBulkItems([...bulkItems, { model: firstModel, grade: "B", quantity: 1 }]);
  const updateBulkItem = (index: number, field: string, value: any) => {
    const newItems = [...bulkItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setBulkItems(newItems);
  };
  const removeBulkItem = (index: number) => setBulkItems(bulkItems.filter((_, i) => i !== index));

  const steps = devisType === "flotte"
    ? [
      { label: t("devis.steps.devices"), icon: Smartphone },
      { label: t("devis.steps.client"), icon: User },
      { label: t("devis.steps.pdf"), icon: FileText },
    ]
    : [
      { label: t("devis.steps.devices"), icon: isLaptop ? Laptop : Smartphone },
      { label: t("devis.steps.diagnostic"), icon: CheckCircle },
      { label: t("devis.steps.strategy"), icon: BarChart2 },
      { label: t("devis.steps.client"), icon: User },
      { label: t("devis.steps.pdf"), icon: FileText },
    ];
  const maxSteps = steps.length;
  const clientStep = maxSteps - 1;
  const isFinalStep = step > 0 && step === maxSteps;

  // Le client accepte : on enregistre le devis tel qu'imprimé, avec le mode de paiement.
  const handleAccept = async (method: PaymentMethod) => {
    const token = await getAccessTokenSilently();
    await saveAcceptedDevis(token, expertise, method);
    setAcceptedPayment(method);
  };

  const nextDisabled =
    (devisType === "unitaire" && step === 1 && !selectedModel) ||
    (devisType === "flotte" && step === 1 && bulkItems.length === 0) ||
    (step === clientStep && !isClientComplete(client));

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

          {steps.map(({ label, icon: Icon }, i) => (
            <div key={label} className="flex flex-col items-center gap-2 sm:gap-3 bg-(--color-brand-light) px-2 sm:px-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-colors ${step >= i + 1 ? "bg-(--color-brand-terracotta) text-white shadow-soft" : "bg-(--color-brand-light) text-gray-400 shadow-inner-soft"}`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${step >= i + 1 ? "text-(--color-brand-dark)" : "text-gray-400"}`}>{label}</span>
            </div>
          ))}
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
          <U_steap1 deviceCategory={deviceCategory} onDeviceCategoryChange={changeDeviceCategory} deviceSearch={deviceSearch} setDeviceSearch={setDeviceSearch} filteredModels={filteredModels} setSelectedModel={setSelectedModel} selectedModel={selectedModel} />
        )}

        {/* Step 2: Unitaire Caractéristiques & Diagnostic */}
        {step === 2 && devisType === "unitaire" && (
          <U_step2 deviceCategory={deviceCategory} unitCapacity={unitCapacity} unitColor={unitColor} unitGrade={unitGrade} setUnitCapacity={setUnitCapacity} setUnitColor={setUnitColor} setUnitGrade={setUnitGrade} unitImei={unitImei} setUnitImei={setUnitImei} unitSerial={unitSerial} setUnitSerial={setUnitSerial} storageOptions={unitModel?.storageOptions} colorOptions={unitModel?.colors} />
        )}

        {/* Step 3: Market Strategy & Prediction (Unitaire Only) */}
        {step === 3 && devisType === "unitaire" && unitairePricing && (
          <U_step4 deviceCategory={deviceCategory} unitairePricing={unitairePricing} selectedModel={selectedModel} unitCapacity={unitCapacity} unitColor={unitColor} unitGrade={unitGrade} isFetchingPrices={isFetchingPrices} marketResults={marketResults} ventesResults={ventesResults} pricingStrategy={pricingStrategy} setPricingStrategy={setPricingStrategy} />
        )
        }

        {/* Avant-dernière étape : Informations client (les deux parcours) */}
        {step === clientStep && devisType && (
          <ClientInfo client={client} setClient={setClient} notes={quoteNotes} setNotes={setQuoteNotes} />
        )}

        {/* Final Step: PDF Preview */}
        {
          isFinalStep && (
            <FinalStep expertise={expertise} acceptedPayment={acceptedPayment} onAccept={handleAccept} onDiscard={onReset} />
          )
        }

        {/* Navigation buttons (masqués une fois le devis accepté : il est enregistré tel quel) */}
        {
          step > 0 && !acceptedPayment && (
            <NavigationButton step={step} setStep={setStep} maxSteps={maxSteps} nextDisabled={nextDisabled} />
          )
        }
      </main >
    </div >
  );
}
