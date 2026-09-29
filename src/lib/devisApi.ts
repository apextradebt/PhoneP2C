import { useCallback, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import type { TFunction } from "i18next";
import i18n from "@/i18n";
import type { Expedition, Expertise, OrderStatus, PaymentMethod } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const PAYMENT_METHODS: PaymentMethod[] = ["virement", "especes", "bon_achat"];

export const paymentLabel = (t: TFunction, method: PaymentMethod) => t(`payment.${method}`);

/** Plafond des paiements en espèces d'un professionnel (art. L112-6 et D112-3 du Code monétaire et financier). */
export const CASH_PAYMENT_LIMIT = 1000;

async function request<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
    let res: Response;
    try {
        res = await fetch(`${API_URL}${path}`, {
            ...init,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers },
        });
    } catch {
        throw new Error(i18n.t("common.network_error"));
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || i18n.t("common.server_error", { status: res.status }));
    return body as T;
}

export const saveAcceptedDevis = (token: string, expertise: Expertise, method: PaymentMethod) =>
    request<{ devis: Expertise }>(token, "/api/devis", {
        method: "POST",
        body: JSON.stringify({ expertise, payment: { method } }),
    }).then(r => r.devis);

export const fetchDevis = (token: string) =>
    request<{ devis: Expertise[] }>(token, "/api/devis").then(r => r.devis);

export const updateDevisStatus = (token: string, id: string, status: OrderStatus) =>
    request<{ status: OrderStatus, at: string }>(token, `/api/devis/${encodeURIComponent(id)}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
    });

export const fetchExpeditions = (token: string) =>
    request<{ expeditions: Expedition[] }>(token, "/api/expeditions").then(r => r.expeditions);

export type NewExpedition = { orderIds: string[], facility: string, carrier?: string, trackingNumber?: string };

export const createExpedition = (token: string, input: NewExpedition) =>
    request<{ expedition: Expedition }>(token, "/api/expeditions", {
        method: "POST",
        body: JSON.stringify(input),
    }).then(r => r.expedition);

export const receiveExpedition = (token: string, id: string) =>
    request<{ updated: number, receivedAt: string }>(token, `/api/expeditions/${encodeURIComponent(id)}/receive`, { method: "PUT" });

/** Charge une liste depuis l'API avec le token de l'utilisateur ; `reload` la recharge. */
/** `fallbackErrorKey` : clé de traduction affichée si l'erreur n'a pas de message. */
function useApiList<T>(fetcher: (token: string) => Promise<T[]>, fallbackErrorKey: string) {
    const { getAccessTokenSilently } = useAuth0();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const list = await fetcher(await getAccessTokenSilently());
                if (!cancelled) { setData(list); setError(null); }
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : i18n.t(fallbackErrorKey));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [getAccessTokenSilently, fetcher, fallbackErrorKey, version]);

    const reload = useCallback(() => setVersion(v => v + 1), []);
    return { data, setData, loading, error, setError, reload, getAccessTokenSilently };
}

/** Commandes du magasin (devis acceptés depuis la page Devis). */
export function useDevisList() {
    const { data: devis, setData, loading, error, setError, reload, getAccessTokenSilently } = useApiList(fetchDevis, "orders.load_error");

    /** Fait passer une commande expédiée à l'étape suivante (retour du centre de traitement). */
    const advanceStatus = useCallback(async (id: string, status: OrderStatus) => {
        try {
            const { at } = await updateDevisStatus(await getAccessTokenSilently(), id, status);
            setData(list => list.map(d => d.id === id
                ? { ...d, status, statusHistory: [...(d.statusHistory ?? []), { status, at }] }
                : d));
        } catch (e) {
            setError(e instanceof Error ? e.message : i18n.t("orders.status_error"));
            throw e;
        }
    }, [getAccessTokenSilently, setData, setError]);

    return { devis, loading, error, reload, advanceStatus };
}

/** Expéditions du magasin vers les centres de traitement. */
export function useExpeditions() {
    const { data: expeditions, setData, loading, error, reload, getAccessTokenSilently } = useApiList(fetchExpeditions, "shipments.load_error");

    const create = useCallback(async (input: NewExpedition) => {
        const expedition = await createExpedition(await getAccessTokenSilently(), input);
        setData(list => [expedition, ...list]);
        return expedition;
    }, [getAccessTokenSilently, setData]);

    const receive = useCallback(async (id: string) => {
        const { receivedAt } = await receiveExpedition(await getAccessTokenSilently(), id);
        setData(list => list.map(e => e.id === id ? { ...e, receivedAt } : e));
    }, [getAccessTokenSilently, setData]);

    return { expeditions, loading, error, reload, create, receive };
}
