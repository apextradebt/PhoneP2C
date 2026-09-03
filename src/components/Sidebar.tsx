"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Smartphone, ClipboardList, Truck, LineChart, Settings, Menu, X } from "lucide-react";

const navigation = [
  { name: "Vue d'ensemble", href: "/", icon: LayoutDashboard },
  { name: "Expertises & Devis", href: "/devis", icon: ClipboardList },
  { name: "Catalogue", href: "/catalogue", icon: Smartphone },
  { name: "Logistique", href: "/logistique", icon: Truck },
  { name: "Veille Marché", href: "/marche", icon: LineChart },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[var(--color-brand-light)] p-4 border-b border-[#E8E1D9] sticky top-0 z-40 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[0.8rem] bg-[var(--color-brand-terracotta)] shadow-soft flex items-center justify-center text-white font-bold text-sm shrink-0">
            R
          </div>
          <span className="font-bold text-lg tracking-tight text-[var(--color-brand-dark)]">
            RepriseApp
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-gray-500 hover:text-[var(--color-brand-dark)] transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[var(--color-brand-dark)]/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-full z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        group w-64 md:w-[88px] md:hover:w-64 
        bg-[var(--color-brand-light)] md:border-r border-[#E8E1D9] p-6 flex flex-col gap-8 shadow-[4px_0_24px_rgba(216,216,221,0.2)] overflow-hidden shrink-0
      `}>
        {/* Desktop Logo */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-10 h-10 min-w-[40px] rounded-[1rem] bg-[var(--color-brand-terracotta)] shadow-soft flex items-center justify-center text-white font-bold text-xl shrink-0">
            R
          </div>
          <span className="font-bold text-xl tracking-tight text-[var(--color-brand-dark)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            RepriseApp
          </span>
        </div>

        {/* Mobile Logo inside Sidebar */}
        <div className="md:hidden flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 min-w-[40px] rounded-[1rem] bg-[var(--color-brand-terracotta)] shadow-soft flex items-center justify-center text-white font-bold text-xl shrink-0">
              R
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--color-brand-dark)] whitespace-nowrap">
              RepriseApp
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-[var(--color-brand-dark)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-3 mt-4 md:mt-0 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-[1rem] transition-all duration-300 ${isActive
                  ? "bg-[var(--color-brand-light)] shadow-soft-active text-[var(--color-brand-terracotta)] font-medium"
                  : "text-gray-500 hover:bg-[var(--color-brand-light)] hover:shadow-soft hover:text-[var(--color-brand-dark)]"
                  }`}
              >
                <div className="flex items-center justify-center min-w-[20px]">
                  <item.icon
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`relative right-1.5 w-5 h-5 ${isActive ? "text-[var(--color-brand-terracotta)]" : ""}`}
                  />
                </div>
                <span className={`opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#E8E1D9] flex items-center overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 min-w-[40px] rounded-full bg-[#E8E1D9] shadow-inner-soft shrink-0 flex items-center justify-center overflow-hidden">
              <span className="text-[var(--color-brand-dark)] font-bold text-sm">M</span>
            </div>
            <div className="flex flex-col opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <span className="text-sm font-medium text-[var(--color-brand-dark)]">Manager</span>
              <span className="text-xs text-gray-500">Boutique Paris</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
