import { ChevronRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface Props {
    step: number;
    setStep: Dispatch<SetStateAction<number>>;
    maxSteps: number;
    devisType: "unitaire" | "flotte" | null;
    selectedModel: any;
    bulkItems: any[];
}

export default function NavigationButton({ step, setStep, maxSteps, devisType, selectedModel, bulkItems }: Props) {

    return (
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8 md:mt-12 pt-6 border-t border-[#E8E1D9]">
            <button
                onClick={() => {
                    if (step === 1) setStep(0);
                    else setStep((s: number) => Math.max(1, s - 1));
                }}
                className="w-full sm:w-auto px-6 py-4 sm:py-3 font-semibold text-gray-500 hover:bg-[#E8E1D9]/50 rounded-2xl sm:rounded-full transition-all text-center"
            >
                Retour
            </button>

            {step < maxSteps && (
                <button
                    onClick={() => setStep(s => s + 1)}
                    disabled={(devisType === "unitaire" && step === 1 && !selectedModel) || (devisType === "flotte" && bulkItems.length === 0)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-brand-dark)] text-white px-8 py-4 sm:py-3 rounded-2xl sm:rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    Étape suivante
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </div>
    )
}