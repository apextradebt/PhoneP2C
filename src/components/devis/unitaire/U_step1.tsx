import { Laptop, Search, Smartphone } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { DeviceCategory } from "@/types";

const CATEGORIES = [
    { value: "phone", icon: Smartphone, label: "devis.device.phone" },
    { value: "laptop", icon: Laptop, label: "devis.device.laptop" },
] as const;

interface U_steap1Interface {
    deviceCategory: DeviceCategory,
    onDeviceCategoryChange: (category: DeviceCategory) => void,
    deviceSearch: string,
    setDeviceSearch: Dispatch<SetStateAction<string>>,
    filteredModels: {
        brand: string;
        model: string;
    }[],
    setSelectedModel: Dispatch<SetStateAction<string>>,
    selectedModel: string,
}

export default function U_step1({ deviceCategory, onDeviceCategoryChange, deviceSearch, setDeviceSearch, filteredModels, setSelectedModel, selectedModel }: U_steap1Interface) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h2 className="text-xl font-bold mb-1">{t('devis.device.title')}</h2>
                <p className="text-sm text-gray-500">{t('devis.device.desc')}</p>
            </div>

            {/* Téléphone ou PC : change le catalogue et l'orchestrateur appelé à l'étape Stratégie */}
            <div role="radiogroup" aria-label={t('devis.device.category')} className="inline-flex self-start p-1 gap-1 rounded-2xl bg-(--brand-surface)/40 shadow-inner-soft">
                {CATEGORIES.map(({ value, icon: Icon, label }) => (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={deviceCategory === value}
                        onClick={() => onDeviceCategoryChange(value)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${deviceCategory === value
                            ? "bg-(--color-brand-terracotta) text-white shadow-soft"
                            : "text-gray-500 hover:text-(--color-brand-dark)"
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {t(label)}
                    </button>
                ))}
            </div>

            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                    placeholder={t('common.search_model')}
                    className="w-full pl-10 pr-4 py-3 bg-(--brand-surface)/40 rounded-2xl shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 transition-all text-[var(--color-brand-dark)] font-medium"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-125 overflow-y-auto pr-2">
                {filteredModels.map((cat: any, i: number) => (
                    <div
                        key={i}
                        onClick={() => setSelectedModel(cat.model)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer text-center font-medium transition-all ${selectedModel === cat.model
                            ? "bg-(--color-brand-light) shadow-inner-soft border-(--color-brand-terracotta) text-(--color-brand-terracotta)"
                            : "bg-(--color-brand-light) shadow-soft-active hover:shadow-soft border-transparent text-(--color-brand-dark)"
                            }`}
                    >
                        <span className="text-xs text-gray-400 block mb-1">{cat.brand}</span>
                        {cat.model}
                    </div>
                ))}
                {filteredModels.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500 font-medium">
                        {t('common.no_model_found', { query: deviceSearch })}
                    </div>
                )}
            </div>
        </div>
    )
}