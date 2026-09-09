import { Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface U_steap1Interface {
    deviceSearch: string,
    setDeviceSearch: Dispatch<SetStateAction<string>>,
    filteredModels: {
        brand: string;
        model: string;
        basePrice: number;
        repairs: Record<string, number>;
    }[],
    setSelectedModel: Dispatch<SetStateAction<string>>,
    setRepairs: Dispatch<SetStateAction<{
        name: string;
        price: number;
    }[]>>,
    selectedModel: string,
}

export default function U_step1({ deviceSearch, setDeviceSearch, filteredModels, setSelectedModel, setRepairs, selectedModel }: U_steap1Interface) {

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h2 className="text-xl font-bold mb-1">Quel appareil souhaitez-vous reprendre ?</h2>
                <p className="text-sm text-gray-500">Sélectionnez le modèle.</p>
            </div>

            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                    placeholder="Rechercher un modèle..."
                    className="w-full pl-10 pr-4 py-3 bg-(--brand-surface)/40 rounded-2xl shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 transition-all text-[var(--color-brand-dark)] font-medium"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-125 overflow-y-auto pr-2">
                {filteredModels.map((cat: any, i: number) => (
                    <div
                        key={i}
                        onClick={() => { setSelectedModel(cat.model); setRepairs([]); }}
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
                        Aucun modèle trouvé pour "{deviceSearch}"
                    </div>
                )}
            </div>
        </div>
    )
}