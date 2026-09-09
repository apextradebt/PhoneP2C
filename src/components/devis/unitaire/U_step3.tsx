import { Dispatch, SetStateAction } from "react";

interface U_step3Interface {
    selectedModel: string;
    repairs: {
        name: string;
        price: number;
    }[];
    setRepairs: Dispatch<SetStateAction<{ name: string; price: number; }[]>>
    getRepairOptions: (selectedModel: string) => {
        name: string;
        price: number;
    }[];
}

export default function U_step3({ selectedModel, repairs, setRepairs, getRepairOptions }: U_step3Interface) {

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h2 className="text-xl font-bold mb-1">Prestations & Main d'œuvre</h2>
                <p className="text-sm text-gray-500">Coûts de réparation issus du catalogue pour <span className="font-bold text-(--color-brand-dark)">{selectedModel}</span>.</p>
            </div>

            <div className="flex flex-col gap-4">
                {getRepairOptions(selectedModel).map((opt, i) => {
                    const isSelected = repairs.some(r => r.name === opt.name);
                    return (
                        <label key={i} className={`flex items-center justify-between p-5 bg-(--color-brand-light) rounded-2xl shadow-soft-active cursor-pointer transition-all border-2 ${isSelected ? "border-(--color-brand-terracotta) shadow-inner-soft" : "border-transparent hover:shadow-soft"}`}>
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        if (e.target.checked) setRepairs([...repairs, opt]);
                                        else setRepairs(repairs.filter(r => r.name !== opt.name));
                                    }}
                                    className="w-5 h-5 accent-(--color-brand-terracotta)"
                                />
                                <span className="font-semibold">{opt.name}</span>
                            </div>
                            <span className="text-(--color-brand-terracotta) font-bold">{opt.price} €</span>
                        </label>
                    )
                })}
            </div>
        </div>
    )
}