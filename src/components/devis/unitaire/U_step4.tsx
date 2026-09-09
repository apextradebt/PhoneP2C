import { DeviceGrade } from "@/types";
import { BarChart2, Loader2, Search, Shield, TrendingDown, Zap } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface U_step4Interface {
    marketResults: any,
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
        marketSources: {
            name: string;
            price: number;
            url: string;
            trend: string;
        }[];
    } | null
    ,
    pricingStrategy: "safe" | "market" | "aggressive",
    setPricingStrategy: Dispatch<SetStateAction<"safe" | "market" | "aggressive">>,
}


export default function U_step4({ setPricingStrategy, marketResults, unitColor, unitCapacity, selectedModel, isFetchingPrices, unitGrade, unitairePricing, pricingStrategy }: U_step4Interface) {

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4">
            {isFetchingPrices ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <Loader2 className="w-16 h-16 text-(--color-brand-terracotta) animate-spin" />
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-(--color-brand-dark) mb-3">Analyse du marché en cours...</h2>
                        <p className="text-gray-500 max-w-md mx-auto">Nos agents parcourent le web (BackMarket, EasyCash, Rebuy...) pour extraire la meilleure stratégie de prix pour votre {selectedModel} ({unitCapacity}).</p>
                    </div>
                </div>
            ) : (
                <>
                    <header>
                        <h2 className="text-2xl font-bold mb-2">Stratégie & Analyse Marché</h2>
                        <p className="text-sm text-gray-500">
                            La valeur de base calculée pour ce {selectedModel} ({unitCapacity}, {unitColor}, Grade {unitGrade}) après réparations est de <span className="font-bold text-(--color-brand-dark)">{unitairePricing?.valNet} €</span>.
                        </p>
                    </header>

                    {/* Sources du marché */}
                    <div className="bg-(--color-brand-light) p-6 rounded-2xl shadow-inner-soft">
                        <h3 className="font-bold text-(--color-brand-dark) mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                            <Search className="w-4 h-4 text-(--color-brand-terracotta)" />
                            Sources du marché en temps réel
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
                            <div className="text-center py-6 text-gray-500">
                                Aucune offre trouvée sur le marché en temps réel.
                            </div>
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
                                <h3 className="font-bold text-lg text-blue-900">Sécurisée</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-3">Risque minimal face à la dépréciation.</p>
                                <span className="text-3xl font-bold text-blue-600">{unitairePricing?.safePrice} €</span>
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
                                <h3 className="font-bold text-lg text-(--color-brand-terracotta)">Marché</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-3">Prix juste selon la cotation actuelle.</p>
                                <span className="text-3xl font-bold text-(--color-brand-terracotta)">{unitairePricing?.marketPrice} €</span>
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
                                <h3 className="font-bold text-lg text-orange-900">Agressive</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-3">Pour être sûr de remporter la reprise.</p>
                                <span className="text-3xl font-bold text-orange-600">{unitairePricing?.aggressivePrice} €</span>
                            </div>
                        </button>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-(--color-brand-light) shadow-inner-soft mt-4">
                        <h3 className="font-bold text-(--color-brand-dark) mb-6 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-(--color-brand-terracotta)" />
                            Prédiction de Dépréciation (Évolution par semestre)
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
                                    formatter={(val: any) => [`${val} €`, 'Valeur estimée']}
                                />
                                <ReferenceLine y={unitairePricing?.marketPrice} stroke="#E07A5F" strokeDasharray="3 3" label={{ position: 'top', value: 'Votre offre', fill: '#E07A5F', fontSize: 10 }} />
                                <Area type="monotone" dataKey="Valeur" stroke="#E07A5F" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

        </div>
    )
}