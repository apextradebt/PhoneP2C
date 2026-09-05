"use client";

import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import { Search, UserCog, Shield, ShieldAlert, Check } from "lucide-react";
import initialUsersData from "../data/userExample.json";

interface UserData {
  nom: string;
  prenom: string;
  email: string;
  magasin: string;
  role: string;
}

export default function UsersPage() {
  const { user } = useAuth0();
  const { t } = useTranslation();
  
  // Assume the API or Auth0 returns a role. For testing, fallback to 'admin'.
  const currentUserRole = (user as any)?.role || 'admin';
  const hasAccess = currentUserRole === 'admin' || currentUserRole === 'manager';

  const [usersList, setUsersList] = useState<UserData[]>(initialUsersData as UserData[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-brand-dark)]">{t('users.access_denied')}</h1>
        <p className="text-gray-500 font-medium">{t('users.access_denied_desc')}</p>
      </div>
    );
  }

  const filteredUsers = usersList.filter(u => 
    u.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.prenom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.magasin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (u: UserData) => {
    setEditingEmail(u.email);
    setNewRole(u.role);
  };

  const saveRole = (email: string) => {
    setUsersList(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
    setEditingEmail(null);
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-12 w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('users.title')}</h1>
          <p className="text-gray-500 font-medium text-sm">{t('users.desc')}</p>
        </div>
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('users.search')}
            className="w-full pl-10 pr-4 py-3 bg-[var(--color-brand-light)] rounded-full shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)] font-medium"
          />
        </div>
      </header>

      <div className="bg-[var(--color-brand-light)] p-2 sm:p-6 rounded-[2rem] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E1D9]">
                <th className="py-4 px-4 text-sm font-bold text-[var(--color-brand-dark)] uppercase tracking-wider">{t('users.col_name')}</th>
                <th className="py-4 px-4 text-sm font-bold text-[var(--color-brand-dark)] uppercase tracking-wider">{t('users.col_email')}</th>
                <th className="py-4 px-4 text-sm font-bold text-[var(--color-brand-dark)] uppercase tracking-wider">{t('users.col_workshop')}</th>
                <th className="py-4 px-4 text-sm font-bold text-[var(--color-brand-dark)] uppercase tracking-wider">{t('users.col_role')}</th>
                <th className="py-4 px-4 text-sm font-bold text-[var(--color-brand-dark)] uppercase tracking-wider text-right">{t('users.col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr key={idx} className="border-b border-[#E8E1D9]/50 hover:bg-white/40 transition-colors group">
                  <td className="py-4 px-4 font-semibold text-[var(--color-brand-dark)]">
                    {u.prenom} {u.nom}
                  </td>
                  <td className="py-4 px-4 text-gray-500 font-medium">{u.email}</td>
                  <td className="py-4 px-4 text-gray-500">{u.magasin}</td>
                  <td className="py-4 px-4">
                    {editingEmail === u.email ? (
                      <select 
                        value={newRole} 
                        onChange={(e) => setNewRole(e.target.value)}
                        className="bg-white border border-[#E8E1D9] rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employe">Employé</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        u.role === 'admin' ? 'bg-[var(--color-brand-terracotta)]/10 text-[var(--color-brand-terracotta)]' :
                        u.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {editingEmail === u.email ? (
                      <button 
                        onClick={() => saveRole(u.email)}
                        className="inline-flex items-center gap-1 bg-[var(--color-brand-terracotta)] text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-soft"
                      >
                        <Check className="w-4 h-4" /> {t('users.save')}
                      </button>
                    ) : (
                      <button 
                        onClick={() => startEditing(u)}
                        className="p-2 text-gray-400 hover:text-[var(--color-brand-terracotta)] hover:bg-[var(--color-brand-terracotta)]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title={t('users.edit_role')}
                      >
                        <UserCog className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
