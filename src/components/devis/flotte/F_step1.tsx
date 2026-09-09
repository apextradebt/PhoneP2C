import { DeviceGrade } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface F_step1Interface {
    addBulkItem: () => void,
    bulkItems: { model: string; grade: DeviceGrade; quantity: number; }[],
    updateBulkItem: (index: number, field: string, value: any) => void,
    allModels: { brand: string; model: string; basePrice: number; repairs: Record<string, number>; }[],
    removeBulkItem: (index: number) => void,
}

export default function F_step1({ addBulkItem, bulkItems, updateBulkItem, allModels, removeBulkItem }: F_step1Interface) {

    return (
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
                {bulkItems.map((item: any, index: number) => (
                    <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[var(--brand-surface)] p-4 rounded-2xl shadow-sm">
                        <select
                            value={item.model}
                            onChange={e => updateBulkItem(index, 'model', e.target.value)}
                            className="flex-1 p-2 bg-[var(--color-brand-light)] rounded-xl outline-none font-medium"
                        >
                            {allModels.map(c => <option key={c.model} value={c.model}>{c.brand} {c.model}</option>)}
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
    )
}