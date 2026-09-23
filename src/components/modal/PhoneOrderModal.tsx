import { Expertise } from "@/types";
import { PenTool, Tag, User, X } from "lucide-react";

interface PhoneOrderModalInterface {
    expertise: Expertise;
    onClose: () => void;
}

export default function PhoneOrderModal({ expertise, onClose }: PhoneOrderModalInterface) {
    return (
        <div className="bg-[var(--color-brand-light)] rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-[#E8E1D9] text-[var(--color-brand-dark)] font-mono text-xs px-2 py-1 rounded-md">{expertise.id}</span>
                            <span className="bg-green-100 text-green-700 font-semibold text-xs px-2 py-1 rounded-full">{expertise.status}</span>
                            <span className="bg-blue-100 text-blue-700 font-semibold text-xs px-2 py-1 rounded-full">{expertise.type === "flotte" ? "Flotte" : "Unitaire"}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-[var(--color-brand-dark)]">
                            {expertise.type === "flotte" ? "Reprise Flotte B2B" : expertise.items[0].device.model}
                        </h2>
                        {expertise.type === "unitaire" && (
                            <p className="text-gray-500 font-medium mt-1">{expertise.items[0].device.storage} • {expertise.items[0].device.color}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-[var(--color-brand-light)] shadow-soft flex items-center justify-center text-gray-500 hover:text-[var(--color-brand-dark)]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    <div className="flex flex-col gap-4 bg-[var(--color-brand-light)] p-5 rounded-2xl shadow-inner-soft">
                        <h3 className="flex items-center gap-2 font-bold text-[var(--color-brand-dark)]"><User className="w-4 h-4 text-[var(--color-brand-terracotta)]" /> Client</h3>
                        <div className="text-sm flex flex-col gap-1 text-gray-600">
                            <p className="font-semibold text-[var(--color-brand-dark)]">{expertise.client.firstName} {expertise.client.lastName}</p>
                            <p>{expertise.client.email}</p>
                            <p>{expertise.client.phone}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 bg-[var(--color-brand-light)] p-5 rounded-2xl shadow-inner-soft">
                        <h3 className="flex items-center gap-2 font-bold text-[var(--color-brand-dark)]"><Tag className="w-4 h-4 text-[var(--color-brand-terracotta)]" /> {expertise.type === "flotte" ? "Appareils" : "Identification"}</h3>
                        <div className="text-sm flex flex-col gap-1 text-gray-600">
                            {expertise.items.filter(item => item.device.brand !== "Prestation").map((item, i) => (
                                <p key={i}><span className="font-medium">{item.quantity}x {item.device.model}</span> (Grade {item.grade})</p>
                            ))}
                            {expertise.type === "unitaire" && expertise.items[0].device.imei && (
                                <p className="mt-2"><span className="font-medium">IMEI :</span> {expertise.items[0].device.imei}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                    <h3 className="flex items-center gap-2 font-bold text-[var(--color-brand-dark)]"><PenTool className="w-4 h-4 text-[var(--color-brand-terracotta)]" /> Réparations prévues</h3>
                    {expertise.items.some(i => i.repairs && i.repairs.length > 0) ? (
                        <div className="flex gap-2 flex-wrap">
                            {expertise.items.flatMap(i => i.repairs || []).map((rep, i) => (
                                <span key={i} className="bg-[var(--color-brand-light)] px-3 py-1 rounded-full text-xs font-semibold text-[var(--color-brand-terracotta)] shadow-soft">{rep.name}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Aucune réparation prévue.</p>
                    )}
                </div>

                <div className="mt-4 pt-6 border-t border-[#E8E1D9] flex justify-between items-end">
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Total</p>
                        <p className="text-lg font-semibold text-gray-500">{expertise.items.reduce((acc, i) => acc + i.quantity, 0)} Appareil(s)</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[var(--color-brand-bois)] text-xs font-medium uppercase tracking-wider mb-1">Offre de Reprise</p>
                        <p className="text-4xl font-bold text-[var(--color-brand-terracotta)]">{expertise.totalProposedPrice} €</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-[var(--brand-surface)]/40 border-t border-[#E8E1D9] flex justify-end gap-4">
                <button className="px-6 py-2 font-semibold text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors">Imprimer Devis</button>
                <button className="bg-[var(--color-brand-dark)] text-white px-6 py-2 rounded-full font-bold shadow-soft hover:opacity-90">Envoyer Étiquette</button>
            </div>
        </div>
    )
}