import { useState } from "react";
import { Expertise, OrderStatus } from "@/types";
import { paymentLabel } from "@/lib/devisApi";
import { nextManualStatus, ORDER_STATUSES, statusClassName, statusDescription, statusLabel } from "@/lib/orderStatus";
import { colorLabel, formatDate } from "@/lib/format";
import { useTranslation } from "react-i18next";
import { ArrowRight, Loader2, Tag, Truck, User, X } from "lucide-react";

interface PhoneOrderModalInterface {
    expertise: Expertise;
    onClose: () => void;
    /** Fourni là où la boutique peut faire avancer la commande (retours du centre de traitement). */
    onAdvance?: (id: string, status: OrderStatus) => Promise<void>;
}

export default function PhoneOrderModal({ expertise, onClose, onAdvance }: PhoneOrderModalInterface) {
    const { t } = useTranslation();
    const [advancing, setAdvancing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentIndex = ORDER_STATUSES.findIndex(s => s.id === expertise.status);
    const next = nextManualStatus(expertise.status);
    const reachedAt = (status: OrderStatus) =>
        expertise.statusHistory?.find(h => h.status === status)?.at
        ?? (status === "En boutique" ? expertise.acceptedAt : undefined);

    const advance = async () => {
        if (!next || !onAdvance) return;
        setAdvancing(true);
        setError(null);
        try {
            await onAdvance(expertise.id, next);
        } catch (e) {
            setError(e instanceof Error ? e.message : t("orders.status_error"));
        } finally {
            setAdvancing(false);
        }
    };

    return (
        <div className="bg-[var(--color-brand-light)] rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-[#E8E1D9] text-[var(--color-brand-dark)] font-mono text-xs px-2 py-1 rounded-md">{expertise.id}</span>
                            <span className={`font-semibold text-xs px-2 py-1 rounded-full ${statusClassName(expertise.status)}`}>{statusLabel(t, expertise.status)}</span>
                            <span className="bg-blue-100 text-blue-700 font-semibold text-xs px-2 py-1 rounded-full">{t(expertise.type === "flotte" ? "common.type_fleet" : "common.type_unit")}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-[var(--color-brand-dark)]">
                            {expertise.type === "flotte" ? t("orders.fleet_title") : expertise.items[0].device.model}
                        </h2>
                        {expertise.type === "unitaire" && (
                            <p className="text-gray-500 font-medium mt-1">{[expertise.items[0].device.storage, expertise.items[0].device.color && colorLabel(expertise.items[0].device.color)].filter(Boolean).join(" • ")}</p>
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
                        <h3 className="flex items-center gap-2 font-bold text-[var(--color-brand-dark)]"><User className="w-4 h-4 text-[var(--color-brand-terracotta)]" /> {t("orders.client")}</h3>
                        <div className="text-sm flex flex-col gap-1 text-gray-600">
                            {expertise.client.company && <p className="font-semibold text-[var(--color-brand-dark)]">{expertise.client.company}</p>}
                            <p className="font-semibold text-[var(--color-brand-dark)]">{expertise.client.firstName} {expertise.client.lastName}</p>
                            <p>{expertise.client.email}</p>
                            <p>{expertise.client.phone}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 bg-[var(--color-brand-light)] p-5 rounded-2xl shadow-inner-soft">
                        <h3 className="flex items-center gap-2 font-bold text-[var(--color-brand-dark)]"><Tag className="w-4 h-4 text-[var(--color-brand-terracotta)]" /> {t(expertise.type === "flotte" ? "orders.devices" : "orders.identification")}</h3>
                        <div className="text-sm flex flex-col gap-1 text-gray-600">
                            {expertise.items.filter(item => item.device.brand !== "Prestation").map((item, i) => (
                                <p key={i}><span className="font-medium">{item.quantity}x {item.device.model}</span> ({t("common.grade", { grade: item.grade })})</p>
                            ))}
                            {expertise.type === "unitaire" && expertise.items[0].device.imei && (
                                <p className="mt-2"><span className="font-medium">{t("orders.imei_label")}</span> {expertise.items[0].device.imei}</p>
                            )}
                            {expertise.type === "unitaire" && expertise.items[0].device.serialNumber && (
                                <p className="mt-2"><span className="font-medium">{t("orders.serial_label")}</span> {expertise.items[0].device.serialNumber}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                    <h3 className="flex items-center justify-between gap-2 font-bold text-[var(--color-brand-dark)]">
                        <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-[var(--color-brand-terracotta)]" /> {t("orders.tracking")}</span>
                        {expertise.shipmentId && <span className="font-mono text-xs font-medium text-gray-500">{expertise.shipmentId}</span>}
                    </h3>
                    <ol className="relative grid grid-cols-5 gap-2">
                        <div className="absolute top-1.5 left-[10%] right-[10%] h-0.5 bg-[#E8E1D9]" />
                        {ORDER_STATUSES.map((s, i) => {
                            const reached = i <= currentIndex;
                            const at = reached ? reachedAt(s.id) : undefined;
                            return (
                                <li key={s.id} className="relative flex flex-col items-center text-center gap-1" title={statusDescription(t, s.id)}>
                                    <span className={`w-3.5 h-3.5 rounded-full border-2 border-[var(--color-brand-light)] ${reached ? "bg-[var(--color-brand-terracotta)]" : "bg-[#E8E1D9]"}`} />
                                    <span className={`text-xs font-semibold ${reached ? "text-[var(--color-brand-dark)]" : "text-gray-400"}`}>{statusLabel(t, s.id)}</span>
                                    <span className="text-[10px] text-gray-400 h-3">{at ? formatDate(at) : ""}</span>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <div className="mt-4 pt-6 border-t border-[#E8E1D9] flex justify-between items-end">
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{t("orders.total")}</p>
                        <p className="text-lg font-semibold text-gray-500">{t("common.devices", { count: expertise.items.reduce((acc, i) => acc + i.quantity, 0) })}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[var(--color-brand-bois)] text-xs font-medium uppercase tracking-wider mb-1">{t("orders.trade_offer")}</p>
                        <p className="text-4xl font-bold text-[var(--color-brand-terracotta)]">{expertise.totalProposedPrice} €</p>
                        {expertise.payment && (
                            <p className="text-xs text-gray-500 font-medium mt-1">
                                {t("orders.paid_by", { method: paymentLabel(t, expertise.payment.method).toLowerCase(), date: formatDate(expertise.payment.paidAt) })}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {onAdvance && (next || expertise.status === "En boutique") && (
                <div className="p-6 bg-[var(--brand-surface)]/40 border-t border-[#E8E1D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                        {error
                            ? <span className="text-red-600">{error}</span>
                            : next
                                ? t("orders.next_step", { description: statusDescription(t, next).toLowerCase() })
                                : t("orders.in_store_hint", { status: statusLabel(t, "Expédié") })}
                    </p>
                    {next && (
                        <button
                            onClick={advance}
                            disabled={advancing}
                            className="flex items-center justify-center gap-2 bg-[var(--color-brand-dark)] text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                        >
                            {advancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            {t("orders.advance", { status: statusLabel(t, next) })}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
