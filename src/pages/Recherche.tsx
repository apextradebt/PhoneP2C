import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth0 } from "@auth0/auth0-react";
import { ArrowDownRight, ArrowUpRight, ExternalLink, History, Loader2, Search, Shield, Smartphone, TrendingDown, X, Zap } from "lucide-react";
import { useCatalog, type CatalogModel } from "@/lib/CatalogContext";
import { CAPACITES_PAR_DEFAUT, COULEURS_PAR_DEFAUT } from "@/components/devis/unitaire/U_step2";
import { STRATEGY_MODIFIERS, average, fetchMarketPrices, referencePrice, type MarketOffer, type MarketPrices, type MarketQuery, type PricingStrategy } from "@/lib/market";
import { colorLabel, formatDate, formatDateTime } from "@/lib/format";
import type { DeviceGrade } from "@/types";

type Lookup = MarketQuery & { state: "running" | "done" | "failed"; prices: MarketPrices | null };
type Recent = MarketQuery & { price: number; at: string };

const HISTORY_KEY = "b2c-quick-history";
const GRADES: DeviceGrade[] = ["A", "B", "C", "D"];
const STRATEGIES: { key: PricingStrategy; icon: typeof Shield; color: string }[] = [
  { key: "safe", icon: Shield, color: "text-blue-600" },
  { key: "market", icon: TrendingDown, color: "text-(--color-brand-terracotta)" },
  { key: "aggressive", icon: Zap, color: "text-orange-600" },
];

const capacitiesOf = (m?: CatalogModel) => (m?.storageOptions?.length ? m.storageOptions : CAPACITES_PAR_DEFAUT);
const colorsOf = (m?: CatalogModel) => (m?.colors?.length ? m.colors : COULEURS_PAR_DEFAUT);
const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const sameQuery = (a: MarketQuery, b: MarketQuery) =>
  a.brand === b.brand && a.model === b.model && a.storage === b.storage && a.color === b.color && a.grade === b.grade;

function loadHistory(): Recent[] {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

/** Lit « iPhone 13 128 Go grade B » : le texte du modèle, plus la capacité et le grade s'ils sont écrits. */
function readQuery(text: string): { terms: string; storage?: string; grade?: DeviceGrade } {
  let rest = ` ${text} `;
  let storage: string | undefined;
  let grade: DeviceGrade | undefined;
  const g = rest.match(/\sgrade\s*([a-d])(?=\s)/i);
  if (g) {
    grade = g[1].toUpperCase() as DeviceGrade;
    rest = rest.replace(g[0], " ");
  }
  const c = rest.match(/\s(\d+)\s*(go|gb|to|tb)(?=\s)/i) ?? rest.match(/\s(32|64|128|256|512)(?=\s)/);
  if (c) {
    storage = /t/i.test(c[2] ?? "") ? `${c[1]}TB` : `${c[1]}GB`;
    rest = rest.replace(c[0], " ");
  }
  return { terms: rest.trim().replace(/\s+/g, " "), storage, grade };
}

/** Modèles du catalogue correspondant à la saisie : nom exact, puis début du nom, puis le reste. */
function suggest(models: CatalogModel[], terms: string, limit = 8) {
  const q = normalize(terms);
  if (!q) return [];
  const tokens = q.split(" ");
  const compact = q.replace(/\s+/g, "");
  return models
    .flatMap((m, i) => {
      const model = normalize(m.model);
      const hay = `${normalize(m.brand)} ${model}`;
      if (!tokens.every(tk => hay.includes(tk)) && !hay.replace(/\s+/g, "").includes(compact)) return [];
      const rank = model === q ? 0 : model.startsWith(q) || hay.startsWith(q) ? 1 : hay.includes(q) ? 2 : 3;
      return [{ m, rank, i }];
    })
    .sort((a, b) => a.rank - b.rank || a.m.model.length - b.m.model.length || a.i - b.i)
    .slice(0, limit)
    .map(x => x.m);
}

/** Même calcul que l'étape « Stratégie » du devis unitaire. */
function pricingOf(lookup: Lookup, basePrice: number) {
  const offres = lookup.prices?.offres ?? [];
  const ventes = lookup.prices?.ventes ?? [];
  const reference = Math.max(0, referencePrice(offres, basePrice, lookup.grade));
  const resale = average(ventes.map(v => v.prix));
  return {
    reference, resale, offres, ventes,
    margin: resale !== null ? resale - reference : null,
    strategies: STRATEGIES.map(s => {
      const price = Math.round(reference * STRATEGY_MODIFIERS[s.key]);
      return { ...s, price, margin: resale !== null ? resale - price : null };
    }),
  };
}

const pillClass = (active: boolean) =>
  `border-2 rounded-xl font-semibold transition-all ${active
    ? "bg-(--color-brand-light) border-(--color-brand-terracotta) text-(--color-brand-terracotta) shadow-inner-soft"
    : "bg-(--color-brand-light) border-transparent text-(--color-brand-dark) shadow-soft-active hover:shadow-soft"}`;

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="px-2.5 py-1 rounded-full bg-brand-terracotta/10 text-(--color-brand-terracotta) text-xs font-semibold whitespace-nowrap">{children}</span>
);

/**
 * Cotation express d'un téléphone : on choisit le modèle, la capacité, le
 * coloris et le grade, et les agents relèvent les prix de rachat et de revente
 * du marché — sans passer par l'assistant de devis.
 */
export default function RecherchePage() {
  const { t } = useTranslation();
  const { allModels, getModel } = useCatalog();
  const { getAccessTokenSilently } = useAuth0();

  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [notFound, setNotFound] = useState(false);
  const [config, setConfig] = useState<MarketQuery | null>(null);
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [history, setHistory] = useState<Recent[]>(loadHistory);
  const runId = useRef(0);
  const priceButton = useRef<HTMLButtonElement>(null);

  const query = readQuery(text);
  const suggestions = useMemo(() => suggest(allModels, readQuery(text).terms), [allModels, text]);
  const selected = config ? getModel(config.model) : undefined;
  const running = lookup?.state === "running";
  const pricing = lookup && lookup.state !== "running" ? pricingOf(lookup, getModel(lookup.model)?.basePrice ?? 0) : null;

  const update = (patch: Partial<MarketQuery>) => setConfig(c => c && { ...c, ...patch });

  // Capacité et coloris gardés s'ils existent pour le nouveau modèle ; ce qui est écrit dans la recherche prime.
  const choose = (m: CatalogModel) => {
    const typed = readQuery(text);
    const capacities = capacitiesOf(m);
    const colors = colorsOf(m);
    setConfig(c => ({
      brand: m.brand,
      model: m.model,
      storage: typed.storage && capacities.includes(typed.storage) ? typed.storage : c && capacities.includes(c.storage) ? c.storage : capacities[0],
      color: c && colors.some(x => x.name === c.color) ? c.color : colors[0].name,
      grade: typed.grade ?? c?.grade ?? "A",
    }));
    setText(`${m.brand} ${m.model}`);
    setOpen(false);
    setActive(-1);
    setNotFound(false);
    // Entrée enchaîne directement sur « Obtenir le prix ».
    setTimeout(() => priceButton.current?.focus(), 0);
  };

  const submit = () => {
    const pick = suggestions[active] ?? suggestions[0];
    if (pick) choose(pick);
    else if (text.trim()) {
      setNotFound(true);
      setOpen(false);
    }
  };

  const remember = (q: MarketQuery, price: number) =>
    setHistory(h => {
      const next = [{ ...q, price, at: new Date().toISOString() }, ...h.filter(x => !sameQuery(x, q))].slice(0, 10);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* stockage bloqué */ }
      return next;
    });

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* stockage bloqué */ }
  };

  const run = async (q: MarketQuery) => {
    const id = ++runId.current;
    setLookup({ ...q, state: "running", prices: null });
    let token = "";
    try {
      token = await getAccessTokenSilently();
    } catch {
      // pas de jeton : on tente quand même l'appel
    }
    let next: Lookup;
    try {
      next = { ...q, state: "done", prices: await fetchMarketPrices(token, q) };
    } catch (error) {
      console.error(error);
      next = { ...q, state: "failed", prices: null };
    }
    if (id !== runId.current) return; // une recherche plus récente a été lancée entre-temps
    setLookup(next);
    if (next.state === "done") remember(q, pricingOf(next, getModel(q.model)?.basePrice ?? 0).reference);
  };

  const replay = (h: Recent) => {
    const q: MarketQuery = { brand: h.brand, model: h.model, storage: h.storage, color: h.color, grade: h.grade };
    setConfig(q);
    setText(`${h.brand} ${h.model}`);
    setNotFound(false);
    run(q);
  };

  const colorHex = selected && config ? colorsOf(selected).find(c => c.name === config.color)?.hex : undefined;

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('quick.title')}</h1>
        <p className="text-gray-500 font-medium text-sm">{t('quick.desc')}</p>
      </header>

      <section className="bg-(--color-brand-light) p-6 md:p-8 rounded-[2rem] shadow-soft flex flex-col gap-6">
        <form className="relative" onSubmit={e => { e.preventDefault(); submit(); }}>
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            autoFocus
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls="quick-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={open && active >= 0 ? `quick-s-${active}` : undefined}
            aria-label={t('quick.placeholder')}
            autoComplete="off"
            value={text}
            onChange={e => { setText(e.target.value); setOpen(true); setActive(-1); setNotFound(false); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={e => {
              if (e.key === "ArrowDown" && suggestions.length) { e.preventDefault(); setOpen(true); setActive(a => (a + 1) % suggestions.length); }
              else if (e.key === "ArrowUp" && suggestions.length) { e.preventDefault(); setOpen(true); setActive(a => (a <= 0 ? suggestions.length - 1 : a - 1)); }
              else if (e.key === "Escape") { setOpen(false); setActive(-1); }
            }}
            placeholder={t('quick.placeholder')}
            className="w-full pl-11 pr-4 py-3.5 bg-(--brand-surface)/40 rounded-2xl shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta/50 transition-all text-(--color-brand-dark) font-medium"
          />
          {open && suggestions.length > 0 && (
            <ul id="quick-suggestions" role="listbox" aria-label={t('quick.suggestions')}
              className="absolute z-30 left-0 right-0 mt-2 bg-(--brand-surface) rounded-2xl shadow-soft p-2 max-h-80 overflow-y-auto">
              {suggestions.map((m, i) => (
                <li key={`${m.brand}::${m.model}`} id={`quick-s-${i}`} role="option" aria-selected={i === active}
                  onMouseDown={e => { e.preventDefault(); choose(m); }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm ${i === active ? "bg-brand-terracotta/10" : ""}`}>
                  <Smartphone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="flex-1 min-w-0 truncate">
                    <span className="text-gray-400">{m.brand} </span>
                    <span className="font-semibold text-(--color-brand-dark)">{m.model}</span>
                  </span>
                  {query.storage && capacitiesOf(m).includes(query.storage) && <Chip>{query.storage}</Chip>}
                  {query.grade && <Chip>{t('common.grade', { grade: query.grade })}</Chip>}
                </li>
              ))}
            </ul>
          )}
        </form>

        {notFound && <p role="alert" className="text-sm font-medium text-amber-600">{t('common.no_model_found', { query: text.trim() })}</p>}

        {config && (
          <div className="flex flex-col gap-6 pt-6 border-t border-brand-lin">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('quick.device')}</span>
              <span className="text-lg font-bold">{config.brand} {config.model}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_16rem] gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">{t('devis.diag.capacity')}</h3>
                <div className="flex flex-wrap gap-3">
                  {capacitiesOf(selected).map(cap => (
                    <button key={cap} type="button" aria-pressed={config.storage === cap} onClick={() => update({ storage: cap })}
                      className={`px-4 py-2.5 text-sm ${pillClass(config.storage === cap)}`}>
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="quick-color" className="block text-sm font-semibold text-gray-500 mb-3">{t('devis.diag.color')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-brand-lin pointer-events-none" style={{ backgroundColor: colorHex }} />
                  <select id="quick-color" value={config.color} onChange={e => update({ color: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-(--brand-surface) rounded-xl text-sm font-medium shadow-sm border border-transparent focus:outline-none focus:border-(--color-brand-terracotta) text-(--color-brand-dark)">
                    {colorsOf(selected).map(c => <option key={c.name} value={c.name}>{colorLabel(c.name)}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">{t('devis.diag.grade_title')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GRADES.map(g => (
                  <button key={g} type="button" aria-pressed={config.grade === g} onClick={() => update({ grade: g })}
                    className={`px-4 py-3 text-left ${pillClass(config.grade === g)}`}>
                    <span className="block">{t('common.grade', { grade: g })}</span>
                    <span className="block text-xs font-medium text-gray-500">{t(`grades.${g}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button ref={priceButton} type="button" disabled={running} onClick={() => run(config)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-(--color-brand-dark) text-(--color-brand-light) px-8 py-3.5 rounded-2xl sm:rounded-full font-bold shadow-soft hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-terracotta/40">
                {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {running ? t('quick.running') : t('quick.get_price')}
              </button>
            </div>
          </div>
        )}
      </section>

      {lookup && (
        <section className="flex flex-col gap-6" aria-live="polite">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold">{lookup.brand} {lookup.model}</h2>
            <div className="flex flex-wrap gap-1.5">
              <Chip>{lookup.storage}</Chip>
              <Chip>{colorLabel(lookup.color)}</Chip>
              <Chip>{t('common.grade', { grade: lookup.grade })}</Chip>
            </div>
            {lookup.prices?.date && (
              <span className="text-xs text-gray-400 font-medium sm:ml-auto">{t('quick.as_of', { date: formatDateTime(lookup.prices.date) })}</span>
            )}
          </div>

          {!pricing ? (
            <div className="bg-(--color-brand-light) rounded-[2rem] shadow-soft py-16 px-6 flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-12 h-12 text-(--color-brand-terracotta) animate-spin" />
              <h3 className="text-xl font-bold">{t('quick.running')}</h3>
              <p className="text-sm text-gray-500 max-w-md">{t('quick.running_desc')}</p>
            </div>
          ) : (
            <>
              {lookup.state === "failed" && (
                <div role="alert" className="rounded-2xl bg-red-500/10 px-5 py-4 text-sm">
                  <p className="font-semibold text-red-600">{t('devis.strategy.server_unreachable')}</p>
                  <p className="text-gray-500 mt-1">{t('devis.strategy.check_backend')}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-[2rem] border-2 border-(--color-brand-terracotta) shadow-inner-soft flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-(--color-brand-terracotta)">{t('quick.offer')}</span>
                  <span className="text-4xl font-bold tabular-nums">{pricing.reference} €</span>
                  <span className="text-xs text-gray-500 font-medium">
                    {pricing.offres.length > 0 ? t('quick.offer_market', { count: pricing.offres.length }) : t('quick.offer_estimate')}
                  </span>
                </div>
                <div className="p-6 rounded-[2rem] shadow-soft flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('quick.resale')}</span>
                  <span className="text-4xl font-bold tabular-nums">{pricing.resale !== null ? `${pricing.resale} €` : "—"}</span>
                  <span className="text-xs text-gray-500 font-medium">
                    {pricing.ventes.length > 0 ? t('quick.resale_hint', { count: pricing.ventes.length }) : t('quick.no_resale')}
                  </span>
                </div>
                <div className="p-6 rounded-[2rem] shadow-soft flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('quick.margin')}</span>
                  <span className={`text-4xl font-bold tabular-nums ${pricing.margin === null ? "" : pricing.margin >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {pricing.margin !== null ? `${pricing.margin >= 0 ? "+" : ""}${pricing.margin} €` : "—"}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{t('quick.margin_hint')}</span>
                </div>
              </div>

              <div className="bg-(--color-brand-light) p-6 md:p-8 rounded-[2rem] shadow-soft flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">{t('quick.strategies')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {pricing.strategies.map(s => (
                      <div key={s.key} className="p-5 rounded-2xl shadow-soft-active flex items-center gap-4">
                        <s.icon className={`w-5 h-5 shrink-0 ${s.color}`} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold">{t(`devis.strategy.${s.key}`)}</span>
                          <span className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.price} €</span>
                          {s.margin === null ? (
                            <span className="text-[11px] text-gray-400">{t('devis.strategy.margin_none')}</span>
                          ) : (
                            <span className={`text-[11px] font-semibold ${s.margin >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                              {t('devis.strategy.margin', { value: `${s.margin >= 0 ? "+" : ""}${s.margin}` })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <OfferList title={t('quick.buyback_offers')} icon={ArrowDownRight} offers={pricing.offres} order="desc" />
                  <OfferList title={t('quick.resale_offers')} icon={ArrowUpRight} offers={pricing.ventes} order="asc" />
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {history.length > 0 && (
        <section className="bg-(--color-brand-light) p-6 rounded-[2rem] shadow-soft flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-(--color-brand-terracotta)" /> {t('quick.recent')}
            </h2>
            <button type="button" onClick={clearHistory} className="text-xs font-medium text-gray-500 hover:text-(--color-brand-dark) inline-flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> {t('quick.clear_recent')}
            </button>
          </div>
          <ul className="flex flex-col divide-y divide-brand-lin">
            {history.map(h => (
              <li key={`${h.brand}::${h.model}::${h.storage}::${h.color}::${h.grade}`}>
                <button type="button" disabled={running} onClick={() => replay(h)}
                  className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 py-3 px-3 rounded-xl text-left text-sm hover:bg-(--brand-surface)/60 transition-colors disabled:opacity-50">
                  <span className="font-semibold">{h.brand} {h.model}</span>
                  <span className="text-xs text-gray-500">{h.storage} · {colorLabel(h.color)} · {t('common.grade', { grade: h.grade })}</span>
                  <span className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatDate(h.at)}</span>
                    <span className="font-bold tabular-nums">{h.price} €</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function OfferList({ title, icon: Icon, offers, order }: { title: string; icon: typeof Shield; offers: MarketOffer[]; order: "asc" | "desc" }) {
  const { t } = useTranslation();
  const sorted = [...offers].sort((a, b) => (order === "desc" ? b.prix - a.prix : a.prix - b.prix));

  return (
    <div className="p-6 rounded-2xl shadow-inner-soft flex flex-col gap-2">
      <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
        <Icon className="w-4 h-4 text-(--color-brand-terracotta)" /> {title}
      </h3>
      {sorted.length > 0 ? (
        <ul className="divide-y divide-brand-lin">
          {sorted.map((o, i) => (
            <li key={`${o.revendeur}-${i}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              {o.lien ? (
                <a href={o.lien} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-(--color-brand-terracotta) inline-flex items-center gap-1.5 min-w-0">
                  <span className="truncate">{o.revendeur}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                </a>
              ) : (
                <span className="font-medium truncate">{o.revendeur}</span>
              )}
              <span className="font-bold tabular-nums">{o.prix} €</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 py-3">{t('quick.none')}</p>
      )}
    </div>
  );
}
