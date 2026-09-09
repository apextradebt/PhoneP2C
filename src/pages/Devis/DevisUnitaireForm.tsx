import U_step1 from "@/components/devis/unitaire/U_step1"
import U_step2 from "@/components/devis/unitaire/U_step2"
import U_step3 from "@/components/devis/unitaire/U_step3"
import U_step4 from "@/components/devis/unitaire/U_step4"
import { DeviceGrade } from "@/types"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

interface DevisUnitaireInterface {
    deviceSearch: string,
    setDeviceSearch: React.Dispatch<React.SetStateAction<string>>,
    filteredModels: {
        brand: string;
        model: string;
        basePrice: number;
        repairs: Record<string, number>;
    }[],
    setSelectedModel: React.Dispatch<React.SetStateAction<string>>,
    setRepairs: React.Dispatch<React.SetStateAction<{
        name: string;
        price: number;
    }[]>>,
    selectedModel: string,
    unitCapacity: string,
    unitColor: string,
    unitGrade: DeviceGrade,
    setUnitCapacity: React.Dispatch<React.SetStateAction<string>>,
    setUnitColor: React.Dispatch<React.SetStateAction<string>>,
    setUnitGrade: React.Dispatch<React.SetStateAction<string>>,
    getRepairOptions: (selectedModel: string) => {
        name: string;
        price: number;
    }[],
    unitairePricing: any,
    isFetchingPrices: boolean,
    marketResults: any,
    pricingStrategy: "safe" | "market" | "aggressive",
    setPricingStrategy: Dispatch<SetStateAction<"safe" | "market" | "aggressive">>,
    step: number,
}

export default function DevisUnitaireForm({ step, deviceSearch, setDeviceSearch, filteredModels, setSelectedModel, selectedModel, unitCapacity, unitColor, unitGrade, setUnitCapacity, setUnitColor, setUnitGrade, getRepairOptions, unitairePricing, isFetchingPrices, marketResults, pricingStrategy, setPricingStrategy }: DevisUnitaireInterface) {

    const [repairs, setRepairs] = useState<{ name: string, price: number }[]>([]);


    useEffect(() => {

    }, [step])

    return (
        <>
            {/* Step 1: Unitaire Device */}
            {step === 1 && (
                <U_step1 deviceSearch={deviceSearch} setDeviceSearch={setDeviceSearch} filteredModels={filteredModels} setSelectedModel={setSelectedModel} setRepairs={setRepairs} selectedModel={selectedModel} />
            )}

            {/* Step 2: Unitaire Caractéristiques & Diagnostic */}
            {step === 2 && (
                <U_step2 unitCapacity={unitCapacity} unitColor={unitColor} unitGrade={unitGrade} setUnitCapacity={setUnitCapacity} setUnitColor={setUnitColor} setUnitGrade={setUnitGrade} />
            )}

            {/* Step 3: Unitaire Repairs */}
            {step === 3 && (
                <U_step3 selectedModel={selectedModel} repairs={repairs} setRepairs={setRepairs} getRepairOptions={getRepairOptions} />
            )}

            {/* Step 4: Market Strategy & Prediction (Unitaire Only) */}
            {step === 4 && unitairePricing && (
                <U_step4 unitairePricing={unitairePricing} selectedModel={selectedModel} unitCapacity={unitCapacity} unitColor={unitColor} unitGrade={unitGrade} isFetchingPrices={isFetchingPrices} marketResults={marketResults} pricingStrategy={pricingStrategy} setPricingStrategy={setPricingStrategy} />
            )
            }
        </>

    )
}