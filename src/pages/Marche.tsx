import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth0 } from "@auth0/auth0-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, TrendingUp } from "lucide-react";
import { useCatalog } from "@/lib/CatalogContext";

type ForecastMonth = { month: number; retention: number; predictedPrice: number };
type ForecastDoc = {
  brand: string;
  model: string;
  basePrice: number;
  repairabilityScore: number;
  materialsIndex: { level: number; trendPctPerMonth?: number; trend_pct_per_month?: number; source: string };
  forecast: ForecastMonth[];
  generatedAt: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function MarchePage() {
  const { t } = useTranslation();
  const { catalog } = useCatalog();
  const { getAccessTokenSilently } = useAuth0();

  const [selectedBrand, setSelectedBrand] = useState(catalog.brands[0]?.name || "");
  const modelsForBrand = useMemo(
    () => catalog.brands.find((b) => b.name === selectedBrand)?.models || [],
    [catalog.brands, selectedBrand]
  );
  const [selectedModel, setSelectedModel] = useState(modelsForBrand[0]?.model || "");

  const [forecast, setForecast] = useState<ForecastDoc | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Garde le modèle sélectionné cohérent avec la marque choisie
  useEffect(() => {
    if (modelsForBrand.length > 0 && !modelsForBrand.some((m) => m.model === selectedModel)) {
      setSelectedModel(modelsForBrand[0].model);
    }
  }, [modelsForBrand, selectedModel]);

  useEffect(() => {
    if (!selectedBrand || !selectedModel) return;

    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        let token = "";
        try {
          token = await getAccessTokenSilently();
        } catch {
          // pas connecté / pas de token : on tente quand même l'appel
        }

        const res = await fetch(
          `${API_URL}/api/market/forecast?marque=${encodeURIComponent(selectedBrand)}&modele=${encodeURIComponent(selectedModel)}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        if (!res.ok) {
          if (!cancelled) {
            setForecast(null);
            setErrorMsg(
              res.status === 404
                ? "Aucune prévision disponible pour ce modèle. Lancez `npm run predict` côté backend."
                : "Erreur lors de la récupération de la prévision."
            );
          }
          return;
        }

        const data = await res.json();
        if (!cancelled) setForecast(data);
      } catch {
        if (!cancelled) setErrorMsg("Impossible de contacter le serveur de prévisions.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [selectedBrand, selectedModel, getAccessTokenSilently]);

  const chartData = useMemo(() => {
    if (!forecast) return [];
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const now = new Date();

    return [
      { name: "Actuel", Valeur: forecast.basePrice },
      ...forecast.forecast.map((f) => {
        const d = new Date(now.getFullYear(), now.getMonth() + f.month, 1);
        return { name: `${months[d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`, Valeur: f.predictedPrice };
      }),
    ];
  }, [forecast]);

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('marche.title')}</h1>
        <p className="text-gray-500 font-medium text-sm">{t('marche.desc')}</p>
      </header>

      <div className="bg-[var(--color-brand-light)] p-8 rounded-[2rem] shadow-soft flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-(--color-brand-terracotta)" />
            Évolution de prix prévue (12 mois) — modèle IA
          </h2>

          <div className="flex gap-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-[var(--brand-surface)] rounded-xl px-4 py-2 text-sm font-medium shadow-sm border border-transparent focus:outline-none focus:border-(--color-brand-terracotta)"
            >
              {catalog.brands.map((b) => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[var(--brand-surface)] rounded-xl px-4 py-2 text-sm font-medium shadow-sm border border-transparent focus:outline-none focus:border-(--color-brand-terracotta)"
            >
              {modelsForBrand.map((m) => (
                <option key={m.model} value={m.model}>{m.model}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center gap-3 text-gray-400 font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement de la prévision...
          </div>
        ) : errorMsg ? (
          <div className="h-64 border-2 border-dashed border-[#E8E1D9] rounded-2xl flex items-center justify-center text-gray-400 font-medium text-center px-6">
            {errorMsg}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMarche" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E07A5F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E1D9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none' }}
                itemStyle={{ color: '#1E1E24', fontWeight: 'bold' }}
                formatter={(val: any) => [`${val} €`, 'Valeur estimée']}
              />
              <Area type="monotone" dataKey="Valeur" stroke="#E07A5F" strokeWidth={3} fillOpacity={1} fill="url(#colorMarche)" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {forecast && (
          <p className="text-xs text-gray-400">
            Facteurs pris en compte : tendance de la marque, réparabilité économique ({Math.round(forecast.repairabilityScore * 100)}%),
            indice matières premières ({forecast.materialsIndex.source === "live" ? "live" : "estimation statique"}).
            Généré le {new Date(forecast.generatedAt).toLocaleString('fr-FR')}.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--brand-surface)]/40 p-6 rounded-[2rem] shadow-soft">
          <h3 className="font-bold mb-4">Top Baisses Récents</h3>
          <ul className="space-y-3">
            <li className="flex justify-between text-sm"><span className="text-gray-500">iPhone 13 Pro</span><span className="text-red-500 font-medium">-15 € (BackMarket)</span></li>
            <li className="flex justify-between text-sm"><span className="text-gray-500">Samsung S21</span><span className="text-red-500 font-medium">-8 € (Amazon Renewed)</span></li>
          </ul>
        </div>

        <div className="bg-[var(--brand-surface)]/40 p-6 rounded-[2rem] shadow-soft">
          <h3 className="font-bold mb-4">Sources Synchronisées</h3>
          <ul className="space-y-3">
            <li className="flex justify-between text-sm"><span className="text-gray-500">BackMarket API</span><span className="text-green-500 font-medium">À jour (il y a 2h)</span></li>
            <li className="flex justify-between text-sm"><span className="text-gray-500">Certideal Scraper</span><span className="text-green-500 font-medium">À jour (il y a 5h)</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
