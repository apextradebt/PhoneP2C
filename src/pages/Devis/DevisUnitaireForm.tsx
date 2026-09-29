import U_step1 from "@/components/devis/unitaire/U_step1"
import U_step2 from "@/components/devis/unitaire/U_step2"
import U_step4 from "@/components/devis/unitaire/U_step4"
import { DeviceCategory, DeviceGrade } from "@/types"
import { Dispatch, SetStateAction, useEffect } from "react"

interface DevisUnitaireInterface {
    deviceCategory: DeviceCategory,
    onDeviceCategoryChange: (category: DeviceCategory) => void,
    deviceSearch: string,
    setDeviceSearch: React.Dispatch<React.SetStateAction<string>>,
    filteredModels: {
        brand: string;
        model: string;
        basePrice: number;
        repairs: Record<string, number>;
    }[],
    setSelectedModel: React.Dispatch<React.SetStateAction<string>>,
    selectedModel: string,
    unitCapacity: string,
    unitColor: string,
    unitGrade: DeviceGrade,
    setUnitCapacity: React.Dispatch<React.SetStateAction<string>>,
    setUnitColor: React.Dispatch<React.SetStateAction<string>>,
    setUnitGrade: React.Dispatch<React.SetStateAction<string>>,
    unitImei: string,
    setUnitImei: React.Dispatch<React.SetStateAction<string>>,
    unitSerial: string,
    setUnitSerial: React.Dispatch<React.SetStateAction<string>>,
    unitairePricing: any,
    isFetchingPrices: boolean,
    marketResults: any,
    ventesResults: any,
    pricingStrategy: "safe" | "market" | "aggressive",
    setPricingStrategy: Dispatch<SetStateAction<"safe" | "market" | "aggressive">>,
    step: number,
}

export default function DevisUnitaireForm({ step, deviceCategory, onDeviceCategoryChange, unitSerial, setUnitSerial, deviceSearch, setDeviceSearch, filteredModels, setSelectedModel, selectedModel, unitCapacity, unitColor, unitGrade, setUnitCapacity, setUnitColor, setUnitGrade, unitImei, setUnitImei, unitairePricing, isFetchingPrices, marketResults, ventesResults, pricingStrategy, setPricingStrategy }: DevisUnitaireInterface) {

    useEffect(() => {

    }, [step])

    return (
        <>
            {/* Step 1: Unitaire Device */}
            {step === 1 && (
                <U_step1 deviceCategory={deviceCategory} onDeviceCategoryChange={onDeviceCategoryChange} deviceSearch={deviceSearch} setDeviceSearch={setDeviceSearch} filteredModels={filteredModels} setSelectedModel={setSelectedModel} selectedModel={selectedModel} />
            )}

            {/* Step 2: Unitaire Caractéristiques & Diagnostic */}
            {step === 2 && (
                <U_step2 deviceCategory={deviceCategory} unitSerial={unitSerial} setUnitSerial={setUnitSerial} unitCapacity={unitCapacity} unitColor={unitColor} unitGrade={unitGrade} setUnitCapacity={setUnitCapacity} setUnitColor={setUnitColor} setUnitGrade={setUnitGrade} unitImei={unitImei} setUnitImei={setUnitImei} />
            )}

            {/* Step 3: Market Strategy & Prediction (Unitaire Only) */}
            {step === 3 && unitairePricing && (
                <U_step4 deviceCategory={deviceCategory} unitairePricing={unitairePricing} selectedModel={selectedModel} unitCapacity={unitCapacity} unitColor={unitColor} unitGrade={unitGrade} isFetchingPrices={isFetchingPrices} marketResults={marketResults} ventesResults={ventesResults} pricingStrategy={pricingStrategy} setPricingStrategy={setPricingStrategy} />
            )
            }
        </>

    )
}