import { usePDF } from "@react-pdf/renderer";
import { DevisPDF } from "./DevisPDF";
import QuoteDecision from "./devis/QuoteDecision";
import { Download, ExternalLink } from "lucide-react";
import { Expertise, PaymentMethod } from "@/types";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface FinalStepInterface {
    expertise: Expertise,
    acceptedPayment: PaymentMethod | null,
    onAccept: (method: PaymentMethod) => Promise<void>,
    onDiscard: () => void,
}

export default function FinalStep({ expertise, acceptedPayment, onAccept, onDiscard }: FinalStepInterface) {

    // Un seul rendu PDF, partagé par l'aperçu, « Ouvrir » et « Télécharger ».
    // L'ancien couple usePDF + <PDFDownloadLink document={<DevisPDF/>}> recréait
    // le document à chaque rendu : les deux instances se relançaient
    // mutuellement et régénéraient le PDF en boucle (« Maximum update depth »).
    // `t` change d'identité avec la langue : le PDF est alors régénéré dans la nouvelle langue.
    const { t } = useTranslation();
    const pdfDocument = useMemo(() => <DevisPDF expertise={expertise} t={t} />, [expertise, t]);
    const [instance, updateInstance] = usePDF();
    useEffect(() => updateInstance(pdfDocument), [pdfDocument, updateInstance]);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold mb-1">{t('devis.final.ready')}</h2>
                    <p className="text-sm text-gray-500">{t('devis.final.ready_desc')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {instance.url && (
                        <a
                            href={instance.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-(--color-brand-terracotta) text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            <ExternalLink className="w-5 h-5" />
                            {t('devis.final.open_pdf')}
                        </a>
                    )}
                    {instance.url ? (
                        <a
                            href={instance.url}
                            download={`Devis_${expertise.id}.pdf`}
                            className="w-full flex items-center justify-center gap-2 bg-(--color-brand-dark) text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            <Download className="w-5 h-5" />
                            {t('devis.final.download')}
                        </a>
                    ) : (
                        <button disabled className="w-full flex items-center justify-center gap-2 bg-(--color-brand-dark) text-white px-6 py-3 rounded-full font-bold shadow-soft opacity-50">
                            <Download className="w-5 h-5" />
                            {t('devis.final.generating')}
                        </button>
                    )}
                </div>
            </div>

            <div className="hidden md:block bg-[var(--brand-surface)] rounded-3xl shadow-inner-soft overflow-hidden h-[600px] p-4">
                {instance.url ? (
                    <iframe src={`${instance.url}#view=FitH`} width="100%" height="100%" className="border-0 rounded-2xl" title={t('devis.steps.pdf')} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                        {t('devis.final.generating_pdf')}
                    </div>
                )}
            </div>

            <QuoteDecision expertise={expertise} acceptedPayment={acceptedPayment} onAccept={onAccept} onDiscard={onDiscard} />
        </div>
    )
}