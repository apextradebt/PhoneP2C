import { DeviceCategory, DeviceGrade } from "@/types";
import { BarChart2, Loader2, Search, Shield, TrendingDown, Zap } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { colorLabel } from "@/lib/format";

interface U_step4Interface {
    deviceCategory: DeviceCategory,
    marketResults: any,
    ventesResults: { total_offres: number; offres: { revendeur: string; prix: number }[] } | null,
    unitColor: string,
    unitCapacity: string,
    selectedModel: string,
    isFetchingPrices: boolean,
    unitGrade: DeviceGrade,
    unitairePricing: {
        valNet: number;
        safePrice: number;
        marketPrice: number;
        aggressivePrice: number;
        chartData: {
            name: string;
            Valeur: number;
        }[];
        forecastFromModel: boolean;
        avgVente: number | null;
        margeSafe: number | null;
        margeMarket: number | null;
        margeAggressive: number | null;
    } | null
    ,
    pricingStrategy: "safe" | "market" | "aggressive",
    setPricingStrategy: Dispatch<SetStateAction<"safe" | "market" | "aggressive">>,
}


// Détail des échecs par revendeur (timeout scraper, site indisponible...) —
// évite de confondre "vraiment aucune offre" avec "les agents ont tous planté".
function DetailErreurs({ erreurs }: { erreurs: { revendeur: string; erreur: string }[] }) {
    return (
        <ul className="text-xs text-left inline-block space-y-1 mt-2 mx-auto">
            {erreurs.map((e, i) => (
                <li key={i}><span className="font-semibold">{e.revendeur}</span> : {e.erreur}</li>
            ))}
        </ul>
    );
}

function MarketEmptyState({ marketResults, erreurs, emptyMessage, errorIntro }: { marketResults: any, erreurs?: { revendeur: string; erreur: string }[], emptyMessage: string, errorIntro: string }) {
    const { t } = useTranslation();
    if (marketResults?.fetchFailed) {
        return (
            <div className="text-center py-6 text-gray-500">
                <p className="font-semibold text-red-500">{t('devis.strategy.server_unreachable')}</p>
                <p className="text-xs mt-1">{t('devis.strategy.check_backend')}</p>
            </div>
        );
    }
    if (erreurs && erreurs.length > 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                <p>{errorIntro}</p>
                <DetailErreurs erreurs={erreurs} />
            </div>
        );
    }
    return (
        <div className="text-center py-6 text-gray-500">
            {emptyMessage}
        </div>
    );
}

function MargeBadge({ marge }: { marge: number | null }) {
    const { t } = useTranslation();
    if (marge === null) {
        return <span className="text-[11px] text-gray-400 mt-1">{t('devis.strategy.margin_none')}</span>;
    }
    const positive = marge >= 0;
    return (
        <span className={`text-[11px] font-semibold mt-1 ${positive ? "text-emerald-600" : "text-red-500"}`}>
            {t('devis.strategy.margin', { value: `${positive ? "+" : ""}${marge}` })}
        </span>
    );
}

export default function U_step4({ deviceCategory, setPricingStrategy, marketResults, ventesResults, unitColor, unitCapacity, selectedModel, isFetchingPrices, unitGrade, unitairePricing, pricingStrategy }: U_step4Interface) {
    const { t } = useTranslation();
    // Les PC passent par orchestrateur-pc : autres revendeurs, et pas de coloris.
    const isLaptop = deviceCategory === "laptop";

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4">
            {isFetchingPrices ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <Loader2 className="w-16 h-16 text-(--color-brand-terracotta) animate-spin" />
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-(--color-brand-dark) mb-3">{t('devis.strategy.analysing')}</h2>
                        <p className="text-gray-500 max-w-md mx-auto">{t(isLaptop ? 'devis.strategy.analysing_desc_pc' : 'devis.strategy.analysing_desc', { model: selectedModel, capacity: unitCapacity })}</p>
                    </div>
                </div>
            ) : (
                <>
                    <header>
                        <h2 className="text-2xl font-bold mb-2">{t('devis.strategy.title')}</h2>
                        <p className="text-sm text-gray-500">
                            {isLaptop
                                ? t('devis.strategy.base_value_pc', { model: selectedModel, capacity: unitCapacity, grade: unitGrade })
                                : t('devis.strategy.base_value', { model: selectedModel, capacity: unitCapacity, color: colorLabel(unitColor), grade: unitGrade })} <span className="font-bold text-(--color-brand-dark)">{unitairePricing?.valNet} €</span>.
                        </p>
                    </header>

                    {/* Sources du marché */}
                    <div className="bg-(--color-brand-light) p-6 rounded-2xl shadow-inner-soft">
                        <h3 className="font-bold text-(--color-brand-dark) mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                            <Search className="w-4 h-4 text-(--color-brand-terracotta)" />
                            {t('devis.strategy.live_sources')}
                        </h3>

                        {marketResults?.resultats?.offres?.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {marketResults.resultats.offres.map((source: any, i: number) => (
                                    <a
                                        key={i}
                                        href={source.lien}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-(--brand-surface) p-4 rounded-xl shadow-sm border-2 border-transparent hover:border-(--color-brand-terracotta) hover:shadow-soft flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                                    >
                                        <span className="text-xs text-gray-500 font-semibold group-hover:text-(--color-brand-terracotta) transition-colors leading-tight">{source.revendeur}</span>
                                        <span className="text-lg md:text-xl font-bold text-(--color-brand-dark)">{source.prix} €</span>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <MarketEmptyState
                                marketResults={marketResults}
                                erreurs={marketResults?.erreurs}
                                emptyMessage={t('devis.strategy.no_offers')}
                                errorIntro={t('devis.strategy.offers_failed')}
                            />
                        )}
                    </div>

                    {/* Sources de revente (benchmark marge) */}
                    <div className="bg-(--color-brand-light) p-6 rounded-2xl shadow-inner-soft">
                        <h3 className="font-bold text-(--color-brand-dark) mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-(--color-brand-terracotta) rotate-180" />
                            {t(isLaptop ? 'devis.strategy.resale_prices_pc' : 'devis.strategy.resale_prices')}
                        </h3>

                        {ventesResults?.offres && ventesResults.offres.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {ventesResults.offres.map((source, i) => (
                                    <div
                                        key={i}
                                        className="bg-(--brand-surface) p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center gap-2"
                                    >
                                        <span className="text-xs text-gray-500 font-semibold leading-tight">{source.revendeur}</span>
                                        <span className="text-lg md:text-xl font-bold text-(--color-brand-dark)">{source.prix} €</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <MarketEmptyState
                                marketResults={marketResults}
                                erreurs={marketResults?.ventesErreurs}
                                emptyMessage={t('devis.strategy.no_resale')}
                                errorIntro={t('devis.strategy.resale_failed')}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button
                            onClick={() => setPricingStrategy("safe")}
                            className={`flex flex-col items-start gap-4 p-6 rounded-2xl border-2 transition-all text-left ${pricingStrategy === "safe"
                                ? "bg-(--color-brand-light) shadow-inner-soft border-blue-400"
                                : "bg-(--color-brand-light) shadow-soft-active hover:shadow-soft border-transparent"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner-soft">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-blue-900">{t('devis.strategy.safe')}</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-3">{t('devis.strategy.safe_desc')}</p>
                                <span className="text-3xl font-bold text-blue-600">{unitairePricing?.safePrice} €</span>
                                <MargeBadge marge={unitairePricing?.margeSafe ?? null} />
                            </div>
                        </button>

                        <button
                            onClick={() => setPricingStrategy("market")}
                            className={`flex flex-col items-start gap-4 p-6 rounded-2xl border-2 transition-all text-left ${pricingStrategy === "market"
                                ? "bg-(--color-brand-light) shadow-inner-soft border-(--color-brand-terracotta)"
                                : "bg-(--color-brand-light) shadow-soft-active hover:shadow-soft border-transparent"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-brand-terracotta/20 flex items-center justify-center text-(--color-brand-terracotta) shadow-inner-soft">
                                <TrendingDown className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-(--color-brand-terracotta)">{t('devis.strategy.market')}</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-3">{t('devis.strategy.market_desc')}</p>
                                <span className="text-3xl font-bold text-(--color-brand-terracotta)">{unitairePricing?.marketPrice} €</span>
                                <MargeBadge marge={unitairePricing?.margeMarket ?? null} />
                            </div>
                        </button>

                        <button
                            onClick={() => setPricingStrategy("aggressive")}
                            className={`flex flex-col items-start gap-4 p-6 rounded-2xl border-2 transition-all text-left ${pricingStrategy === "aggressive"
                                ? "bg-(--color-brand-light) shadow-inner-soft border-orange-400"
                                : "bg-(--color-brand-light) shadow-soft-active hover:shadow-soft border-transparent"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner-soft">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-orange-900">{t('devis.strategy.aggressive')}</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-3">{t('devis.strategy.aggressive_desc')}</p>
                                <span className="text-3xl font-bold text-orange-600">{unitairePricing?.aggressivePrice} €</span>
                                <MargeBadge marge={unitairePricing?.margeAggressive ?? null} />
                            </div>
                        </button>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-(--color-brand-light) shadow-inner-soft mt-4">
                        <h3 className="font-bold text-(--color-brand-dark) mb-6 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-(--color-brand-terracotta)" />
                            {t('devis.strategy.forecast_title')}
                            <span className={`ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${unitairePricing?.forecastFromModel ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
                                {unitairePricing?.forecastFromModel ? t('devis.strategy.ai_model') : t('devis.strategy.estimate')}
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={unitairePricing?.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#E07A5F" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E1D9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '8px 8px 16px #d4d4dc, -8px -8px 16px #ffffff' }}
                                    itemStyle={{ color: '#1E1E24', fontWeight: 'bold' }}
                                    formatter={(val: any) => [`${val} €`, t('common.estimated_value')]}
                                />
                                <ReferenceLine y={unitairePricing?.marketPrice} stroke="#E07A5F" strokeDasharray="3 3" label={{ position: 'top', value: t('devis.strategy.your_offer'), fill: '#E07A5F', fontSize: 10 }} />
                                <Area type="monotone" dataKey="Valeur" stroke="#E07A5F" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

        </div>
    )
}