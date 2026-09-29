import type { DeviceCategory, DeviceGrade } from "@/types";

// Tarification commune au devis unitaire et à la recherche rapide.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const GRADE_DISCOUNTS: Record<DeviceGrade, number> = {
  "A": 0,    // 0% discount
  "B": 0.15, // 15% discount
  "C": 0.30, // 30% discount
  "D": 0.50, // 50% discount
};

export const STRATEGY_MODIFIERS = {
  "safe": 0.85,      // -15% (marge très forte)
  "market": 1.0,     // Prix standard
  "aggressive": 1.10 // +10% (marge faible, très attractif)
};

export type PricingStrategy = keyof typeof STRATEGY_MODIFIERS;

/** Offre relevée chez un revendeur (rachat ou revente). */
export type MarketOffer = { revendeur: string; prix: number; lien?: string };

export type MarketPrices = {
  /** Prix de rachat proposés par la concurrence. */
  offres: MarketOffer[];
  /** Prix de revente constatés (Back Market, CertiDeal, Recommerce). */
  ventes: MarketOffer[];
  /** Date du relevé : le backend réutilise un relevé de moins d'une semaine. */
  date?: string;
};

/** Sans catégorie : un téléphone. */
export type MarketQuery = { brand: string; model: string; storage: string; color: string; grade: DeviceGrade; category?: DeviceCategory };

const GRADE_STATES: Record<DeviceGrade, string> = { A: "parfait_etat", B: "tres_bon_etat", C: "bon_etat", D: "etat_correct" };

/** Coloris au format attendu par les agents, ex. « Bleu Alpin » → « bleu-alpin ». */
const colorSlug = (color: string) =>
  color.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Prix du marché pour un téléphone ou un PC. Le backend répond depuis son
 * relevé de la semaine s'il en a un, sinon lance ses agents de scraping
 * (orchestrateur.js pour les téléphones, orchestrateur-pc.js pour les PC ;
 * compter ~1 min). Renvoie null si aucun relevé ; lève une erreur si le
 * serveur ne répond pas.
 */
export async function fetchMarketPrices(token: string, q: MarketQuery): Promise<MarketPrices | null> {
  // Un PC est décrit comme le fait nexusb2b (marque en minuscules, sans
  // coloris) pour partager le même relevé LaptopsHistory.
  const isLaptop = q.category === "laptop";
  const response = await fetch(`${API_URL}/api/market/prices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      devices: [{
        brand: isLaptop ? q.brand.toLowerCase() : q.brand,
        model: q.model,
        color: isLaptop ? "" : colorSlug(q.color),
        storage: q.storage.replace("GB", "").replace("TB", "000"),
        grade: GRADE_STATES[q.grade],
        type: isLaptop ? "laptops" : "phones"
      }]
    })
  });

  if (!response.ok) throw new Error("Erreur api");
  const body = await response.json();
  const devices = [...(body.knownDevices || []), ...(body.newlyScrapedDevices || [])];
  const price = devices.length > 0 ? devices[0].price : null;
  return price ? { offres: price.offres || [], ventes: price.ventes || [], date: price.date } : null;
}

export const average = (xs: number[]) =>
  xs.length > 0 ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null;

/**
 * Valeur de rachat de référence : moyenne des offres de la concurrence, ou à
 * défaut le prix catalogue décoté selon le grade.
 */
export const referencePrice = (offres: MarketOffer[], basePrice: number, grade: DeviceGrade) =>
  average(offres.map(o => o.prix)) ?? Math.round(basePrice * (1 - GRADE_DISCOUNTS[grade]));
