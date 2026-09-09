import { Smartphone, Users } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface ChoiceInterface {
    setDevisType: Dispatch<SetStateAction<"unitaire" | "flotte" | null>>
    setStep: Dispatch<SetStateAction<number>>

}

export default function ChoiceReprise({ setDevisType, setStep }: ChoiceInterface) {

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Type de reprise</h2>
                <p className="text-sm text-gray-500">S'agit-il d'un client particulier (1 appareil) ou d'une flotte d'entreprise (plusieurs appareils) ?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <button
                    onClick={() => { setDevisType("unitaire"); setStep(1); }}
                    className="flex flex-col items-center gap-4 p-8 bg-[var(--color-brand-light)] rounded-[2rem] shadow-soft-active hover:shadow-soft transition-all text-[var(--color-brand-dark)] group"
                >
                    <div className="w-16 h-16 rounded-full bg-[var(--brand-surface)] shadow-inner-soft flex items-center justify-center group-hover:bg-[var(--color-brand-terracotta)] group-hover:text-white transition-colors">
                        <Smartphone className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-xl">Reprise Unitaire</span>
                </button>

                <button
                    onClick={() => { setDevisType("flotte"); setStep(1); }}
                    className="flex flex-col items-center gap-4 p-8 bg-[var(--color-brand-light)] rounded-[2rem] shadow-soft-active hover:shadow-soft transition-all text-[var(--color-brand-dark)] group"
                >
                    <div className="w-16 h-16 rounded-full bg-[var(--brand-surface)] shadow-inner-soft flex items-center justify-center group-hover:bg-[var(--color-brand-terracotta)] group-hover:text-white transition-colors">
                        <Users className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-xl">Reprise en Lot (Flotte)</span>
                </button>
            </div>
        </div>
    )
}