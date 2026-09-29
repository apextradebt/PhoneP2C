"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Loader2, PackageCheck, Send, X } from "lucide-react";
import { useDevisList, useExpeditions } from "@/lib/devisApi";
import { deviceCount, ORDER_STATUSES, shipmentStatus, statusClassName, statusLabel } from "@/lib/orderStatus";
import { colorLabel, formatDate } from "@/lib/format";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Expedition, Expertise } from "@/types";
import PhoneOrderModal from "@/components/modal/PhoneOrderModal";

const CARRIERS = ["Colissimo", "Chronopost", "Posti", "Matkahuolto", "DHL Express", "UPS", "DPD", "GLS", "FedEx"];
const LAST_FACILITY_KEY = "logistique-last-facility";

function readLastFacility() {
  try {
    return localStorage.getItem(LAST_FACILITY_KEY) ?? "";
  } catch {
    return "";
  }
}

function orderLabel(t: TFunction, order: Expertise) {
  if (order.type === "flotte") return `${t("common.fleet_batch")} · ${t("common.devices", { count: deviceCount(order) })}`;
  const d = order.items[0].device;
  return [d.model, d.storage, d.color && colorLabel(d.color)].filter(Boolean).join(" · ");
}

const clientLabel = (order: Expertise) =>
  order.client.company || `${order.client.firstName} ${order.client.lastName}`;

const inputClass = "w-full p-3 rounded-xl bg-[var(--color-brand-light)] shadow-inner-soft outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-sm font-medium text-[var(--color-brand-dark)]";

export default function ExpeditionsPage() {
  const { t } = useTranslation();
  const { devis, loading: ordersLoading, error: ordersError, reload: reloadOrders, advanceStatus } = useDevisList();
  const { expeditions, loading: expLoading, error: expError, create, receive } = useExpeditions();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [facility, setFacility] = useState(readLastFacility);
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<Expedition | null>(null);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [receiving, setReceiving] = useState<string | null>(null);
  const [receiveError, setReceiveError] = useState<{ id: string, message: string } | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const inShop = devis.filter(d => d.status === "En boutique");
  const chosen = inShop.filter(o => selected.has(o.id));
  const allChosen = inShop.length > 0 && chosen.length === inShop.length;
  const facilities = [...new Set(expeditions.map(e => e.facility))];
  const openOrder = devis.find(d => d.id === openOrderId) ?? null;

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const submit = async () => {
    if (chosen.length === 0 || !facility.trim()) return;
    setCreating(true);
    setFormError(null);
    try {
      const expedition = await create({
        orderIds: chosen.map(o => o.id),
        facility: facility.trim(),
        carrier: carrier.trim() || undefined,
        trackingNumber: tracking.trim() || undefined,
      });
      try { localStorage.setItem(LAST_FACILITY_KEY, facility.trim()); } catch { /* préférence facultative */ }
      setCreated(expedition);
      setSelected(new Set());
      setTracking("");
      reloadOrders();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : t("shipments.create_error"));
      reloadOrders();
    } finally {
      setCreating(false);
    }
  };

  const markReceived = async (id: string) => {
    setReceiving(id);
    setReceiveError(null);
    try {
      await receive(id);
      reloadOrders();
    } catch (e) {
      setReceiveError({ id, message: e instanceof Error ? e.message : t("shipments.receive_error") });
    } finally {
      setReceiving(null);
    }
  };

  const sectionClass = "bg-[var(--brand-surface)]/40 p-4 sm:p-8 rounded-[2rem] shadow-soft flex flex-col gap-5";

  return (
    <div className="flex flex-col gap-8 pb-4">
      {/* ── À expédier ── */}
      <section className={sectionClass}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold">{t('shipments.to_ship')}</h2>
            <p className="text-sm text-gray-500">{t('shipments.to_ship_desc')}</p>
          </div>
          {inShop.length > 0 && (
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-dark)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allChosen}
                onChange={() => setSelected(allChosen ? new Set() : new Set(inShop.map(o => o.id)))}
                className="w-4 h-4 accent-[var(--color-brand-terracotta)]"
              />
              {t('shipments.select_all', { count: inShop.length })}
            </label>
          )}
        </div>

        {created && (
          <div className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-green-50 text-green-800 text-sm">
            <span className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{t('shipments.created', { id: created.id, facility: created.facility, orders: t('common.orders', { count: created.orderIds.length }), status: statusLabel(t, "Expédié") })}</span>
            </span>
            <button onClick={() => setCreated(null)} className="shrink-0 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {inShop.map(o => {
            const checked = selected.has(o.id);
            return (
              <label
                key={o.id}
                className={`flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-brand-light)] shadow-sm cursor-pointer border-2 transition-all ${checked ? "border-[var(--color-brand-terracotta)]" : "border-transparent hover:border-[#E8E1D9]"}`}
              >
                <input type="checkbox" checked={checked} onChange={() => toggle(o.id)} className="w-5 h-5 shrink-0 accent-[var(--color-brand-terracotta)]" />
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[9rem_1fr_12rem] gap-1 sm:gap-4 sm:items-center">
                  <span className="font-mono text-xs text-gray-500">{o.id}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-sm text-[var(--color-brand-dark)] truncate">{orderLabel(t, o)}</span>
                    {o.type === "unitaire" && o.items[0].device.imei && (
                      <span className="block text-xs text-gray-400 font-mono">IMEI {o.items[0].device.imei}</span>
                    )}
                    {o.type === "unitaire" && o.items[0].device.serialNumber && (
                      <span className="block text-xs text-gray-400 font-mono">S/N {o.items[0].device.serialNumber}</span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 truncate">{clientLabel(o)}</span>
                </div>
                <span className="font-bold text-[var(--color-brand-terracotta)] whitespace-nowrap">{o.totalProposedPrice} €</span>
              </label>
            );
          })}
          {inShop.length === 0 && (
            <p className="text-center py-8 text-gray-500 font-medium">
              {ordersLoading ? t('orders.loading') : ordersError ?? t('shipments.none_in_store')}
            </p>
          )}
        </div>

        {inShop.length > 0 && (
          <div className="flex flex-col gap-4 pt-5 border-t border-[#E8E1D9]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-brand-dark)]">{t('shipments.facility')} <span className="text-[var(--color-brand-terracotta)]">*</span></span>
                <input list="logistique-facilities" value={facility} onChange={e => setFacility(e.target.value)} placeholder={t('shipments.facility_placeholder')} className={inputClass} />
                <datalist id="logistique-facilities">{facilities.map(f => <option key={f} value={f} />)}</datalist>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-brand-dark)]">{t('shipments.carrier')}</span>
                <input list="logistique-carriers" value={carrier} onChange={e => setCarrier(e.target.value)} placeholder={t('shipments.carrier_placeholder')} className={inputClass} />
                <datalist id="logistique-carriers">{CARRIERS.map(c => <option key={c} value={c} />)}</datalist>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--color-brand-dark)]">{t('shipments.tracking_number')}</span>
                <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder={t('common.optional')} className={inputClass} />
              </label>
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                {chosen.length === 0
                  ? t('shipments.none_selected')
                  : <b className="text-[var(--color-brand-dark)]">
                    {t('common.orders', { count: chosen.length })} · {t('common.devices', { count: chosen.reduce((n, o) => n + deviceCount(o), 0) })} · {chosen.reduce((n, o) => n + o.totalProposedPrice, 0)} €
                  </b>}
              </p>
              <button
                onClick={submit}
                disabled={chosen.length === 0 || !facility.trim() || creating}
                className="flex items-center justify-center gap-2 bg-[var(--color-brand-dark)] text-white px-6 py-3 rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {t('shipments.create')}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Historique ── */}
      <section className={sectionClass}>
        <div>
          <h2 className="text-xl font-bold">{t('shipments.history')}</h2>
          <p className="text-sm text-gray-500">{t('shipments.history_desc')}</p>
        </div>

        <div className="flex flex-col gap-4">
          {expeditions.map(exp => {
            const orders = devis.filter(d => d.shipmentId === exp.id);
            const status = shipmentStatus(orders);
            const canReceive = orders.some(o => o.status === "Expédié");
            const isOpen = expanded.has(exp.id);
            return (
              <div key={exp.id} className="bg-[var(--color-brand-light)] p-5 rounded-2xl shadow-sm flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[var(--color-brand-terracotta)]">{exp.id}</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClassName(status)}`}>{statusLabel(t, status)}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{t('shipments.created_on', { date: formatDate(exp.createdAt) })}</span>
                </div>

                <p className="text-sm text-gray-600">
                  <b className="text-[var(--color-brand-dark)]">{exp.facility}</b>
                  {exp.carrier && ` · ${exp.carrier}`}
                  {exp.trackingNumber && <> · {t('shipments.tracking')} <span className="font-mono">{exp.trackingNumber}</span></>}
                </p>
                <p className="text-xs text-gray-500">
                  {t('common.orders', { count: exp.orderIds.length })} · {t('common.devices', { count: exp.deviceCount })} · {exp.totalValue} €
                  {exp.receivedAt && ` · ${t('shipments.received_on', { date: formatDate(exp.receivedAt) })}`}
                </p>

                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.filter(s => s.id !== "En boutique").map(s => {
                    const n = orders.filter(o => o.status === s.id).length;
                    return n > 0 && (
                      <span key={s.id} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.className}`}>{n} {statusLabel(t, s.id)}</span>
                    );
                  })}
                </div>

                {receiveError?.id === exp.id && <p className="text-sm text-red-600">{receiveError.message}</p>}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    onClick={() => setExpanded(prev => { const next = new Set(prev); if (next.has(exp.id)) next.delete(exp.id); else next.add(exp.id); return next; })}
                    className="flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-terracotta)] hover:underline self-start"
                  >
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {t(isOpen ? 'shipments.hide_orders' : 'shipments.show_orders')}
                  </button>
                  {canReceive && (
                    <button
                      onClick={() => markReceived(exp.id)}
                      disabled={receiving === exp.id}
                      className="flex items-center justify-center gap-2 bg-[var(--color-brand-dark)] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-soft hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                    >
                      {receiving === exp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                      {t('shipments.mark_received')}
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="flex flex-col gap-2 pt-3 border-t border-[#E8E1D9]/60">
                    {orders.map(o => (
                      <button
                        key={o.id}
                        onClick={() => setOpenOrderId(o.id)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--brand-surface)]/60 text-left transition-colors"
                      >
                        <span className="font-mono text-xs text-gray-500 w-32 shrink-0">{o.id}</span>
                        <span className="flex-1 min-w-0 text-sm font-medium text-[var(--color-brand-dark)] truncate">{orderLabel(t, o)}</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusClassName(o.status)}`}>{statusLabel(t, o.status)}</span>
                      </button>
                    ))}
                    {orders.length === 0 && <p className="text-sm text-gray-500 p-3">{ordersLoading ? t('common.loading') : t('shipments.orders_not_found')}</p>}
                  </div>
                )}
              </div>
            );
          })}
          {expeditions.length === 0 && (
            <p className="text-center py-8 text-gray-500 font-medium">
              {expLoading ? t('shipments.loading') : expError ?? t('shipments.none')}
            </p>
          )}
        </div>
      </section>

      {/* Détail d'une commande d'expédition : permet de déclarer les étapes du centre de traitement */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${openOrder ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-[var(--color-brand-dark)]/40 backdrop-blur-sm" onClick={() => setOpenOrderId(null)} />
        {openOrder && (
          <PhoneOrderModal key={openOrder.id} expertise={openOrder} onClose={() => setOpenOrderId(null)} onAdvance={advanceStatus} />
        )}
      </div>
    </div>
  );
}
