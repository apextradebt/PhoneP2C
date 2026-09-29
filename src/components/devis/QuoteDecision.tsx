import { useState } from "react";
import { Link } from "react-router-dom";
import { Banknote, CheckCircle2, Gift, Landmark, Loader2, Plus, Trash2, XCircle } from "lucide-react";
import type { Expertise, PaymentMethod } from "@/types";
import { CASH_PAYMENT_LIMIT, PAYMENT_METHODS, paymentLabel } from "@/lib/devisApi";
import { useTranslation } from "react-i18next";

const PAYMENT_ICONS: Record<PaymentMethod, typeof Landmark> = {
    virement: Landmark,
    especes: Banknote,
    bon_achat: Gift,
};

interface QuoteDecisionInterface {
    expertise: Expertise,
    /** Mode de paiement une fois le devis accepté et enregistré, sinon null. */
    acceptedPayment: PaymentMethod | null,
    /** Enregistre le devis accepté ; rejette avec un message en cas d'échec. */
    onAccept: (method: PaymentMethod) => Promise<void>,
    /** Abandonne le devis et repart d'un devis vierge. */
    onDiscard: () => void,
}

export default function QuoteDecision({ expertise, acceptedPayment, onAccept, onDiscard }: QuoteDecisionInterface) {
    const { t } = useTranslation();
    const [decision, setDecision] = useState<"idle" | "accept" | "refuse">("idle");
    const [method, setMethod] = useState<PaymentMethod | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const amount = expertise.totalProposedPrice;
    const cashAllowed = amount <= CASH_PAYMENT_LIMIT;

    const confirmAccept = async () => {
        if (!method) return;
        setSaving(true);
        setError(null);
        try {
            await onAccept(method);
        } catch (e) {
            setError(e instanceof Error ? e.message : t("devis.decision.save_error"));
        } finally {
            setSaving(false);
        }
    };

    const cardClass = "bg-(--brand-surface) rounded-3xl shadow-inner-soft p-6 flex flex-col gap-5";
    const ghostButton = "px-6 py-3 rounded-full font-semibold text-gray-500 hover:bg-[#E8E1D9]/50 transition-all whitespace-nowrap";

    if (acceptedPayment) {
        return (
            <div className={cardClass}>
                <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold">{t("devis.decision.saved")}</h3>
                        <p className="text-sm text-gray-500">
                            {t("devis.decision.saved_desc", { amount, method: paymentLabel(t, acceptedPayment).toLowerCase(), id: expertise.id })}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Link to="/logistique" state={{ tab: "commandes" }} className={`${ghostButton} text-center`}>
                        {t("devis.decision.view_orders")}
                    </Link>
                    <button
                        onClick={onDiscard}
                        className="flex items-center justify-center gap-2 bg-(--color-brand-dark) text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        {t("devis.decision.new_quote")}
                    </button>
                </div>
            </div>
        );
    }

    if (decision === "refuse") {
        return (
            <div className={cardClass}>
                <div>
                    <h3 className="text-lg font-bold">{t("devis.decision.refuse_title")}</h3>
                    <p className="text-sm text-gray-500">
                        {t("devis.decision.refuse_desc", { id: expertise.id })}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button onClick={() => setDecision("idle")} className={ghostButton}>{t("common.cancel")}</button>
                    <button
                        onClick={onDiscard}
                        className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                        <Trash2 className="w-5 h-5" />
                        {t("devis.decision.delete")}
                    </button>
                </div>
            </div>
        );
    }

    if (decision === "accept") {
        return (
            <div className={cardClass}>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                        <h3 className="text-lg font-bold">{t("devis.decision.payment_title")}</h3>
                        <p className="text-sm text-gray-500">{t("devis.decision.payment_desc")}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                        {t("devis.decision.amount_to_pay")} <span className="block sm:inline text-2xl font-bold text-(--color-brand-terracotta) sm:ml-2">{amount} €</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map(m => {
                        const Icon = PAYMENT_ICONS[m];
                        const disabled = m === "especes" && !cashAllowed;
                        return (
                            <button
                                key={m}
                                type="button"
                                disabled={disabled}
                                onClick={() => setMethod(m)}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 font-semibold text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${method === m ? "bg-(--color-brand-light) border-(--color-brand-terracotta) text-(--color-brand-terracotta) shadow-inner-soft" : "bg-(--color-brand-light) border-transparent text-(--color-brand-dark) shadow-soft-active hover:shadow-soft"}`}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span className="text-sm">{paymentLabel(t, m)}</span>
                            </button>
                        );
                    })}
                </div>

                {!cashAllowed && (
                    <p className="text-xs text-gray-500">
                        {t("devis.decision.cash_unavailable", { limit: CASH_PAYMENT_LIMIT })}
                    </p>
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button onClick={() => { setDecision("idle"); setError(null); }} disabled={saving} className={ghostButton}>{t("common.cancel")}</button>
                    <button
                        onClick={confirmAccept}
                        disabled={!method || saving}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        {saving ? t("devis.decision.saving") : t("devis.decision.confirm_payment")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`${cardClass} md:flex-row md:items-center md:justify-between`}>
            <div>
                <h3 className="text-lg font-bold">{t("devis.decision.title")}</h3>
                <p className="text-sm text-gray-500">{t("devis.decision.offer")} <span className="font-bold text-(--color-brand-dark)">{amount} €</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => setDecision("refuse")}
                    className="flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 px-6 py-3 rounded-full font-bold hover:bg-red-50 transition-colors whitespace-nowrap"
                >
                    <XCircle className="w-5 h-5" />
                    {t("devis.decision.refuse")}
                </button>
                <button
                    onClick={() => setDecision("accept")}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {t("devis.decision.accept")}
                </button>
            </div>
        </div>
    );
}
