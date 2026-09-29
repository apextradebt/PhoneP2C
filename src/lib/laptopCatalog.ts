import laptopsData from "@/data/laptops.json";
import type { CatalogModel } from "@/lib/CatalogContext";

// Référentiel PC repris du B2B (nexusb2b/src/data/laptops*.json) : mêmes noms
// de modèles, donc même cache LaptopsHistory côté backend.
// Pas de prix catalogue : la valeur d'un PC vient uniquement des agents
// d'orchestrateur-pc (basePrice à 0, aucune réparation référencée).
export const LAPTOP_MODELS: CatalogModel[] = laptopsData.models.map((m) => ({
  brand: m.brand,
  model: m.model,
  basePrice: 0,
  storageOptions: m.storageOptions,
  repairs: {},
}));

export const getLaptop = (modelName: string) => LAPTOP_MODELS.find((m) => m.model === modelName);
