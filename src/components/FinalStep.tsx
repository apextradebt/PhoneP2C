import { PDFDownloadLink, PDFViewer, usePDF } from "@react-pdf/renderer";
import { DevisPDF } from "./DevisPDF";
import { Download, ExternalLink } from "lucide-react";
import { DeviceGrade, DevisItem, Expertise } from "@/types";
import { useMemo } from "react";

interface FinalStepInterface {
    devisType: "unitaire" | "flotte" | null,
    bulkItems: {
        model: string;
        grade: DeviceGrade;
        quantity: number;
    }[],
    getModel: (modelName: string) => {
        brand: string;
        model: string;
        basePrice: number;
        repairs: Record<string, number>;
    } | undefined,
    selectedModel: string,
    marketResults: any,
    pricingStrategy: "safe" | "market" | "aggressive",
    unitGrade: DeviceGrade,
    repairs: {
        name: string;
        price: number;
    }[],
    unitairePricing: {
        valNet: number;
        safePrice: number;
        marketPrice: number;
        aggressivePrice: number;
        chartData: {
            name: string;
            Valeur: number;
        }[]; marketSources: {
            name: string;
            price: number;
            url: string;
            trend: string;
        }[];
    } | null,
}

const GRADE_DISCOUNTS: Record<DeviceGrade, number> = {
    "A": 0,    // 0% discount
    "B": 0.15, // 15% discount
    "C": 0.30, // 30% discount
    "D": 0.50, // 50% discount
};

const STRATEGY_MODIFIERS = {
    "safe": 0.85,      // -15% (marge très forte)
    "market": 1.0,     // Prix standard
    "aggressive": 1.10 // +10% (marge faible, très attractif)
};

export default function FinalStep({ unitairePricing, devisType, bulkItems, getModel, selectedModel, marketResults, pricingStrategy, unitGrade, repairs }: FinalStepInterface) {

    const expertise: Expertise = useMemo(() => {
        let items: DevisItem[] = [];

        if (devisType === "flotte") {
            items = bulkItems.map((bi, i: number) => {
                const catModel = getModel(bi.model);
                const base = catModel ? catModel.basePrice : 0;
                const unitPrice = Math.round(base * (1 - GRADE_DISCOUNTS[bi.grade]));
                return {
                    id: `item-${i}`,
                    grade: bi.grade,
                    quantity: bi.quantity,
                    unitPrice,
                    device: { id: `d-${i}`, model: bi.model, brand: catModel?.brand || "Inconnu", basePrice: base }
                };
            });
        } else {
            const catModel = getModel(selectedModel);
            const base = catModel ? catModel.basePrice : 0;

            let gradePrice = 0;
            if (marketResults?.resultats?.offres && marketResults.resultats.offres.length > 0) {
                const prices = marketResults.resultats.offres.map((o: any) => o.prix);
                gradePrice = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);
            } else {
                gradePrice = Math.round(base * (1 - GRADE_DISCOUNTS[unitGrade]));
            }

            let baseDevicePrice = gradePrice;
            if (pricingStrategy === "safe") baseDevicePrice = Math.round(gradePrice * STRATEGY_MODIFIERS.safe);
            if (pricingStrategy === "market") baseDevicePrice = Math.round(gradePrice * STRATEGY_MODIFIERS.market);
            if (pricingStrategy === "aggressive") baseDevicePrice = Math.round(gradePrice * STRATEGY_MODIFIERS.aggressive);

            items = [{
                id: "item-unit",
                grade: unitGrade,
                quantity: 1,
                unitPrice: baseDevicePrice,
                repairs: repairs,
                device: { id: "d-u", model: selectedModel, brand: catModel?.brand || "Inconnu", basePrice: base }
            }];

            repairs.forEach((r, i: number) => {
                let repairPrice = -r.price;
                if (pricingStrategy === "safe") repairPrice = Math.round(-r.price * STRATEGY_MODIFIERS.safe);
                if (pricingStrategy === "market") repairPrice = Math.round(-r.price * STRATEGY_MODIFIERS.market);
                if (pricingStrategy === "aggressive") repairPrice = Math.round(-r.price * STRATEGY_MODIFIERS.aggressive);

                items.push({
                    id: `rep-${i}`,
                    grade: "A" as DeviceGrade,
                    quantity: 1,
                    unitPrice: repairPrice,
                    device: { id: `r-${i}`, model: r.name, brand: "Prestation", basePrice: r.price }
                });
            });
        }

        const totalProposedPrice = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

        return {
            id: `DEV-${Math.floor(Math.random() * 10000)}`,
            date: new Date().toISOString(),
            status: "Devis Envoyé",
            type: devisType || "unitaire",
            totalProposedPrice,
            items,
            client: {
                id: "c-draft",
                firstName: "Client",
                lastName: "Prospect",
                email: "client@example.com",
                phone: "06 00 00 00 00",
                company: devisType === "flotte" ? "Entreprise XYZ" : undefined
            }
        };
    }, [devisType, bulkItems, selectedModel, unitGrade, repairs, pricingStrategy, unitairePricing, getModel]);


    const [instance] = usePDF({ document: <DevisPDF expertise={expertise} /> });

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Devis Prêt !</h2>
                    <p className="text-sm text-gray-500">Prévisualisez le devis professionnel ci-dessous.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {instance.url && (
                        <a
                            href={instance.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-(--color-brand-terracotta) text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity"
                        >
                            <ExternalLink className="w-5 h-5" />
                            Ouvrir le PDF
                        </a>
                    )}
                    <PDFDownloadLink document={<DevisPDF expertise={expertise} />} fileName={`Devis_${expertise.id}.pdf`}>
                        {({ loading }) => (
                            <button disabled={loading} className="w-full flex items-center justify-center gap-2 bg-(--color-brand-dark) text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity">
                                <Download className="w-5 h-5" />
                                {loading ? "Génération..." : "Télécharger"}
                            </button>
                        )}
                    </PDFDownloadLink>
                </div>
            </div>

            <div className="hidden md:block bg-[var(--brand-surface)] rounded-3xl shadow-inner-soft overflow-hidden h-[600px] p-4">
                {instance.url ? (
                    <iframe src={`${instance.url}#view=FitH`} width="100%" height="100%" className="border-0 rounded-2xl" title="Devis PDF" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                        Génération du PDF en cours...
                    </div>
                )}
            </div>
        </div>
    )
}