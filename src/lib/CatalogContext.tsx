"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import phonesDataRaw from "@/data/phones.json";

// Types
export type PhoneModel = {
  model: string;
  basePrice: number;
  repairs: Record<string, number>;
};

export type PhoneBrand = {
  name: string;
  models: PhoneModel[];
};

export type CatalogData = {
  brands: PhoneBrand[];
  repairLabels: Record<string, string>;
};

type CatalogContextType = {
  catalog: CatalogData;
  /** Flat list of all models with their brand name */
  allModels: { brand: string; model: string; basePrice: number; repairs: Record<string, number> }[];
  /** Get a specific model by name */
  getModel: (modelName: string) => { brand: string; model: string; basePrice: number; repairs: Record<string, number> } | undefined;
  /** Get repair options for a specific model, using catalog labels */
  getRepairOptions: (modelName: string) => { name: string; price: number }[];
  /** Update repair costs for a specific model and persist */
  updateRepairs: (brandName: string, modelName: string, repairs: Record<string, number>) => void;
};

const STORAGE_KEY = "b2c-catalog-overrides";

const CatalogContext = createContext<CatalogContextType | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  // Load overrides from localStorage
  const [overrides, setOverrides] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist overrides
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  // Build merged catalog (raw data + overrides)
  const catalog: CatalogData = useMemo(() => {
    const merged: CatalogData = {
      repairLabels: phonesDataRaw.repairLabels,
      brands: phonesDataRaw.brands.map((brand) => ({
        name: brand.name,
        models: brand.models.map((model) => {
          const overrideKey = `${brand.name}::${model.model}`;
          const overrideRepairs = overrides[overrideKey];
          return {
            ...model,
            repairs: overrideRepairs ? { ...model.repairs, ...overrideRepairs } : { ...model.repairs },
          };
        }),
      })),
    };
    return merged;
  }, [overrides]);

  // Flat list
  const allModels = useMemo(() => {
    return catalog.brands.flatMap((brand) =>
      brand.models.map((model) => ({
        brand: brand.name,
        model: model.model,
        basePrice: model.basePrice,
        repairs: model.repairs,
      }))
    );
  }, [catalog]);

  const getModel = (modelName: string) => {
    return allModels.find((m) => m.model === modelName);
  };

  const getRepairOptions = (modelName: string) => {
    const model = getModel(modelName);
    if (!model) return [];
    return Object.entries(model.repairs).map(([key, price]) => ({
      name: catalog.repairLabels[key] || key,
      price,
    }));
  };

  const updateRepairs = (brandName: string, modelName: string, repairs: Record<string, number>) => {
    const overrideKey = `${brandName}::${modelName}`;
    setOverrides((prev) => ({
      ...prev,
      [overrideKey]: repairs,
    }));
  };

  return (
    <CatalogContext.Provider value={{ catalog, allModels, getModel, getRepairOptions, updateRepairs }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
