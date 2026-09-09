"use client";

import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import { Search, UserCog, Shield, ShieldAlert, Check, UserPlus, X } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import type { User } from "@/types/user";

export default function UsersPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const { t } = useTranslation();
  const { userData, loading } = useUser()
  const url = import.meta.env.VITE_API_URL;

  const currentUserRole = userData?.role;
  const hasAccess = currentUserRole === 'admin' || currentUserRole === 'manager';

  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    magasin: "",
    role: "employe"
  });

  const fetchUsers = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_IDENTIFIER
        }
      });
      const res = await fetch(`${url}/api/users/market`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchUsers();
    }
  }, [hasAccess]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${url}/api/users/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ nom: "", prenom: "", email: "", magasin: "", role: "employe" });
        fetchUsers();
      } else {
        console.error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const startEditing = (u: User) => {
    setEditingEmail(u.email);
    setNewRole(u.role);
  };

  const saveRole = (email: string) => {
    setUsersList(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
    setEditingEmail(null);
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-12 w-full relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('users.title')}</h1>
          <p className="text-gray-500 font-medium text-sm">{t('users.desc')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('users.search')}
              className="w-full pl-10 pr-4 py-3 bg-[var(--color-brand-light)] rounded-full shadow-inner-soft text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)] font-medium"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[var(--color-brand-terracotta)] text-white px-5 py-3 rounded-full text-sm font-bold shadow-soft hover:opacity-90 transition-opacity whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <UserPlus className="w-4 h-4" />
            Créer un utilisateur
          </button>
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
                <tr key={idx} className="border-b border-[#E8E1D9]/50 hover:bg-[var(--brand-surface)]/40 transition-colors group">
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
                        className="bg-[var(--brand-surface)] border border-[#E8E1D9] rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employe">Employé</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${u.role === 'admin' ? 'bg-[var(--color-brand-terracotta)]/10 text-[var(--color-brand-terracotta)]' :
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-[var(--brand-surface)] w-full max-w-md h-full shadow-2xl flex flex-col relative z-10 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-[#E8E1D9]">
              <h2 className="text-xl font-bold text-[var(--color-brand-dark)]">Créer un utilisateur</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-500 hover:text-[var(--color-brand-dark)] hover:bg-black/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--color-brand-dark)]">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--color-brand-light)] border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)]"
                  placeholder="Prénom"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--color-brand-dark)]">Nom</label>
                <input
                  type="text"
                  name="nom"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--color-brand-light)] border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)]"
                  placeholder="Nom"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--color-brand-dark)]">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--color-brand-light)] border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)]"
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--color-brand-dark)]">Magasin</label>
                <input
                  type="text"
                  name="magasin"
                  required
                  value={formData.magasin}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--color-brand-light)] border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)]"
                  placeholder="Nom du magasin"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--color-brand-dark)]">Rôle</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--color-brand-light)] border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-[var(--color-brand-dark)]"
                >
                  <option value="employe">Employé</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mt-auto pt-6 border-t border-[#E8E1D9] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-black/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-[var(--color-brand-terracotta)] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-soft hover:opacity-90 transition-opacity"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

