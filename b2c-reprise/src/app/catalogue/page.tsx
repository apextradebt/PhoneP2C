export default function CataloguePage() {
  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Catalogue Appareils</h1>
        <p className="text-gray-500 font-medium text-sm">Gérez les modèles de téléphones et les règles de prix par défaut.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {['Apple', 'Samsung', 'Google', 'Xiaomi', 'Oppo', 'OnePlus'].map((brand) => (
          <div key={brand} className="bg-white/40 p-6 rounded-[2rem] shadow-soft flex items-center justify-center h-32 cursor-pointer hover:bg-white transition-all text-xl font-bold text-[var(--color-brand-dark)]">
            {brand}
          </div>
        ))}
      </div>
    </div>
  );
}
