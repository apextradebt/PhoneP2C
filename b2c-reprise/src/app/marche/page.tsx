export default function MarchePage() {
  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Veille Marché</h1>
        <p className="text-gray-500 font-medium text-sm">Prix de référence scrappés en temps réel pour l'ajustement de vos offres.</p>
      </header>

      <div className="bg-[var(--color-brand-light)] p-8 rounded-[2rem] shadow-soft flex flex-col gap-6">
        <h2 className="text-xl font-bold">Tendances des Prix de Reprise</h2>
        <div className="h-64 border-2 border-dashed border-[#E8E1D9] rounded-2xl flex items-center justify-center text-gray-400 font-medium">
          [Graphique d'évolution des prix de marché]
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/40 p-6 rounded-[2rem] shadow-soft">
          <h3 className="font-bold mb-4">Top Baisses Récents</h3>
          <ul className="space-y-3">
            <li className="flex justify-between text-sm"><span className="text-gray-500">iPhone 13 Pro</span><span className="text-red-500 font-medium">-15 € (BackMarket)</span></li>
            <li className="flex justify-between text-sm"><span className="text-gray-500">Samsung S21</span><span className="text-red-500 font-medium">-8 € (Amazon Renewed)</span></li>
          </ul>
        </div>
        
        <div className="bg-white/40 p-6 rounded-[2rem] shadow-soft">
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
