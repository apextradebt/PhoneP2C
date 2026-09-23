import { Smartphone } from "lucide-react";
import { DeviceGrade, DeviceStatus, DevisItem } from "@/types";

interface PhoneOrderInterface {
    id: string,
    status: DeviceStatus,
    type: "unitaire" | "flotte",
    items: DevisItem[];
    client: {
        firstName: string;
        lastName: string;
    };
    totalProposedPrice: number;
    onClick: () => void;
}

export default function PhoneOrder({ id, status, type, items, client, totalProposedPrice, onClick }: PhoneOrderInterface) {
    const statusColor = status === "En attente" ? "bg-yellow-100 text-yellow-700" :
        status === "Reçu" ? "bg-blue-100 text-blue-700" :
            "bg-purple-100 text-purple-700";
    return (
        <div
            key={id}
            onClick={onClick}
            className="bg-[var(--brand-surface)] p-6 rounded-[2rem] shadow-sm flex flex-col gap-4 group hover:shadow-soft transition-all cursor-pointer border border-transparent hover:border-[#E8E1D9]"
        >
            <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-[1.2rem] bg-[#E8E1D9] shadow-inner-soft flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-[var(--color-brand-dark)]/70" />
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>
                    {status}
                </span>
            </div>
            <div>
                <h3 className="font-bold text-lg">{type === "flotte" ? "Lot Flotte" : items[0].device.model}</h3>
                <p className="text-gray-400 text-xs font-mono mt-1">{id} • {client.firstName} {client.lastName}</p>
            </div>
            <div className="mt-auto pt-4 border-t border-[#E8E1D9]/50 flex justify-between items-end">
                <span className="text-sm text-gray-500 font-medium">Prix proposé</span>
                <span className="text-xl font-bold text-[var(--color-brand-terracotta)]">{totalProposedPrice} €</span>
            </div>
        </div>

    )
}