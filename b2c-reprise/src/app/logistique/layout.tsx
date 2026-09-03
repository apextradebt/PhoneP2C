"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LogistiqueLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const tabs = [
    { name: "Kanban", href: "/logistique" },
    { name: "Toutes les commandes", href: "/logistique/commandes" },
    { name: "Notifications", href: "/logistique/notifications" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12 h-full">
      <header className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logistique</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Gérez vos envois, réceptions et alertes.</p>
        </div>
        
        <div className="flex gap-4 border-b border-[#E8E1D9] pb-[-1px] overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const isActive = pathname === tab.href;
            return (
              <Link 
                key={tab.href}
                href={tab.href}
                className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${isActive ? 'border-[var(--color-brand-terracotta)] text-[var(--color-brand-terracotta)]' : 'border-transparent text-gray-500 hover:text-[var(--color-brand-dark)]'}`}
              >
                {tab.name}
              </Link>
            )
          })}
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
