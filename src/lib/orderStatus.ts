import type { TFunction } from "i18next";
import type { DeviceStatus, Expertise, OrderStatus } from "@/types";

/**
 * Étapes du cycle de vie d'une commande, dans l'ordre. `id` est la valeur
 * enregistrée en base (en français) ; `key` sert aux traductions
 * (`orderStatus.<key>.label` / `.description`).
 */
export const ORDER_STATUSES: { id: OrderStatus, key: string, className: string }[] = [
    { id: "En boutique", key: "in_store", className: "bg-amber-100 text-amber-700" },
    { id: "Expédié", key: "shipped", className: "bg-blue-100 text-blue-700" },
    { id: "Réceptionné", key: "received", className: "bg-indigo-100 text-indigo-700" },
    { id: "En traitement", key: "processing", className: "bg-purple-100 text-purple-700" },
    { id: "Clôturé", key: "closed", className: "bg-green-100 text-green-700" },
];

const ORDER_IDS = ORDER_STATUSES.map(s => s.id);

const statusKey = (status: DeviceStatus) => ORDER_STATUSES.find(s => s.id === status)?.key ?? "quote_sent";

export const statusLabel = (t: TFunction, status: DeviceStatus) => t(`orderStatus.${statusKey(status)}.label`);

export const statusDescription = (t: TFunction, status: DeviceStatus) => t(`orderStatus.${statusKey(status)}.description`);

export const statusClassName = (status: DeviceStatus) =>
    ORDER_STATUSES.find(s => s.id === status)?.className ?? "bg-gray-100 text-gray-600";

/**
 * Étape que la boutique peut déclarer à la main (retours du centre de traitement).
 * « En boutique » → « Expédié » passe uniquement par la création d'une expédition.
 */
export function nextManualStatus(status: DeviceStatus): OrderStatus | null {
    const i = ORDER_IDS.indexOf(status as OrderStatus);
    return i >= 1 && i < ORDER_IDS.length - 1 ? ORDER_IDS[i + 1] : null;
}

/** Statut d'une expédition : celui de sa commande la moins avancée. */
export function shipmentStatus(orders: Expertise[]): OrderStatus {
    const ranks = orders.map(o => ORDER_IDS.indexOf(o.status as OrderStatus)).filter(i => i >= 0);
    return ranks.length ? ORDER_IDS[Math.min(...ranks)] : "Expédié";
}

export const deviceCount = (order: Expertise) => order.items.reduce((n, it) => n + it.quantity, 0);
