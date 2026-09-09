"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Smartphone, ClipboardList, Truck, LineChart, Settings, Menu, X, LogOut, Globe, Users } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/lib/UserContext";

const navigationKeys = [
  { key: "sidebar.overview", href: "/", icon: LayoutDashboard },
  { key: "sidebar.expertise", href: "/devis", icon: ClipboardList },
  { key: "sidebar.catalog", href: "/catalogue", icon: Smartphone },
  { key: "sidebar.logistics", href: "/logistique", icon: Truck },
  { key: "sidebar.market", href: "/marche", icon: LineChart },
  { key: "sidebar.settings", href: "/settings", icon: Settings },

];

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth0();
  const { t, i18n } = useTranslation();
  const { userData, loading } = useUser()
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-(--color-brand-light) p-4 border-b border-brand-lin sticky top-0 z-40 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <img src="/PhoneP2C/NexusLogo.svg" alt="NexusLogo" className="w-10 h-10" />
          <span className="font-bold text-lg tracking-tight text-(--color-brand-dark)">
            Nexus Back
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-gray-500 hover:text-(--color-brand-dark) transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-full z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        group w-64 md:w-22 md:hover:w-64 
        bg-(--color-brand-light) md:border-r border-brand-lin p-6 flex flex-col gap-8 shadow-[4px_0_24px_rgba(216,216,221,0.2)] overflow-hidden shrink-0
      `}>
        {/* Desktop Logo */}
        <div className="hidden md:flex items-center gap-4">
          <img src="/PhoneP2C/NexusLogo.svg" alt="NexusLogo" className="w-10 h-10" />
          <span className="font-bold text-xl tracking-tight text-(--color-brand-dark) opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Nexus Back
          </span>
        </div>

        {/* Mobile Logo inside Sidebar */}
        <div className="md:hidden flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <img src="/PhoneP2C/NexusLogo.svg" alt="NexusLogo" className="w-10 h-10" />
            <span className="font-bold text-xl tracking-tight text-(--color-brand-dark) whitespace-nowrap">
              Nexus Back
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-(--color-brand-dark)">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-3 mt-4 md:mt-0 overflow-y-auto">
          {navigationKeys.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.key}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-[1rem] transition-all duration-300 ${isActive
                  ? "bg-(--color-brand-light) shadow-soft-active text-(--color-brand-terracotta) font-medium"
                  : "text-gray-500 hover:bg-(--color-brand-light) hover:shadow-soft hover:text-(--color-brand-dark)"
                  }`}
              >
                <div className="flex items-center justify-center w-5">
                  <item.icon
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`relative right-1.5 w-5 h-5 ${isActive ? "text-(--color-brand-terracotta)" : ""}`}
                  />
                </div>
                <span className={`opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap`}>
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-brand-lin flex flex-col gap-4">

          {/* Users Button - Only visible for Admin/Manager */}
          {((userData as any)?.role === 'admin' || (userData as any)?.role === 'manager') && (
            <Link
              to="/users"
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-3 rounded-[1rem] transition-all duration-300 ${pathname === '/users'
                ? "bg-(--color-brand-light) shadow-soft-active text-(--color-brand-terracotta) font-medium"
                : "text-gray-500 hover:bg-(--color-brand-light) hover:shadow-soft hover:text-(--color-brand-dark)"
                }`}
            >
              <div className="flex items-center justify-center min-w-5">
                <Users
                  strokeWidth={pathname === '/users' ? 2.5 : 1.5}
                  className={`relative right-1.5 w-5 h-5 ${pathname === '/users' ? "text-(--color-brand-terracotta)" : ""}`}
                />
              </div>
              <span className={`opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap`}>
                {t("sidebar.users")}
              </span>
            </Link>
          )}

          {/* Language Toggle */}


          <button
            onClick={toggleLanguage}
            className="flex items-center px-4 py-2 rounded-xl text-gray-500 hover:bg-(--color-brand-light) hover:shadow-soft hover:text-(--color-brand-dark) transition-all duration-300 w-full group/lang"
          >
            <div className="flex items-center justify-center min-w-5">
              <Globe className="w-5 h-5 relative right-1.5" strokeWidth={1.5} />
            </div>
            <span className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium text-sm">
              {i18n.language === 'fr' ? 'English' : 'Français'}
            </span>
          </button>

          <div className="flex items-center overflow-hidden p-2 -mx-2 rounded-xl group/profile">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 min-w-10 rounded-full bg-brand-lin shadow-inner-soft shrink-0 flex items-center justify-center overflow-hidden">
                  {user?.picture ? (
                    <img src={user.picture} alt={userData?.nom || "Profile"} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-(--color-brand-dark) font-bold text-sm">
                      {userData?.nom?.charAt(0).toUpperCase() || "M"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  <span className="text-sm font-medium text-(--color-brand-dark) capitalize">
                    {user?.email ? user.email.split('@')[0].replace('.', ' ') : (userData?.nom || "Manager")}
                  </span>
                  <span className="mt-1 bg-brand-terracotta/10 text-(--color-brand-terracotta) text-[10px] font-bold px-2 py-0.5 rounded-full w-max uppercase tracking-wider">
                    {(userData?.role)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } })}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 ml-2 p-1.5 hover:bg-brand-terracotta/10 rounded-full group-hover/profile:text-(--color-brand-terracotta) outline-none"
              >
                <LogOut className="w-5 h-5 text-gray-400 group-hover/profile:text-(--color-brand-terracotta) transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
