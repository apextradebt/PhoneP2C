import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth0 } from "@auth0/auth0-react";
import { useTheme } from "@/lib/ThemeProvider";
import { useUser } from "@/lib/UserContext";
import { useNotification } from "@/lib/NotificationContext";
import { Moon, Sun, Monitor, Eye, EyeOff, Trash2, Shield, Loader2 } from "lucide-react";

// ── Password strength calculator ──
function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-4
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { getAccessTokenSilently, logout } = useAuth0();
  const { userData, refreshUserData } = useUser();
  const { notify } = useNotification();

  // ── Profile editing ──
  const [editNom, setEditNom] = useState("");
  const [editPrenom, setEditPrenom] = useState("");
  const [profileDirty, setProfileDirty] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Initialize profile fields from userData
  const initProfile = () => {
    if (userData) {
      setEditNom(userData.nom);
      setEditPrenom(userData.prenom);
      setProfileDirty(false);
    }
  };

  // Lazy init
  if (userData && !profileDirty && editNom === "" && editPrenom === "") {
    initProfile();
  }

  // ── Email change ──
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // ── Password change ──
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const strengthLabel = [
    t('settings.strength_weak'),
    t('settings.strength_weak'),
    t('settings.strength_medium'),
    t('settings.strength_strong'),
    t('settings.strength_very_strong'),
  ][passwordStrength];

  const strengthColor = ['#ef4444', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'][passwordStrength];
  const strengthPercent = [0, 25, 50, 75, 100][passwordStrength];

  // ── Delete modal ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Handlers ──

  const handleSaveProfile = async () => {
    if (!userData) return;
    setProfileLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${process.env.VITE_API_URL}/api/users/edit/${encodeURIComponent(userData.auth0Id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nom: editNom, prenom: editPrenom })
      });

      if (res.ok) {
        notify('success', t('settings.profile_updated'));
        await refreshUserData();
        setProfileDirty(false);
      } else {
        const data = await res.json();
        notify('error', data.error || 'Error');
      }
    } catch (err) {
      notify('error', 'Network error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (newEmail !== confirmEmail) {
      notify('warning', t('settings.email_mismatch'));
      return;
    }
    if (!userData) return;
    setEmailLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${process.env.VITE_API_URL}/api/users/edit/${encodeURIComponent(userData.auth0Id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail })
      });

      if (res.ok) {
        notify('success', t('settings.email_updated'));
        setNewEmail("");
        setConfirmEmail("");
        await refreshUserData();
      } else {
        const data = await res.json();
        notify('error', data.error || 'Error');
      }
    } catch (err) {
      notify('error', 'Network error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      notify('warning', t('settings.password_mismatch'));
      return;
    }
    if (passwordStrength < 2) {
      notify('warning', t('settings.password_too_weak'));
      return;
    }
    setPasswordLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${process.env.VITE_API_URL}/api/users/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (res.ok) {
        notify('success', t('settings.password_updated'));
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        notify('error', data.error || 'Error');
      }
    } catch (err) {
      notify('error', 'Network error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${process.env.VITE_API_URL}/api/users/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        notify('success', t('settings.account_deleted'));
        setTimeout(() => {
          logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } });
        }, 1500);
      } else {
        const data = await res.json();
        notify('error', data.error || 'Error');
      }
    } catch (err) {
      notify('error', 'Network error');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  // ── Shared styles ──
  const inputClass = "w-full p-3 rounded-xl bg-[var(--brand-surface)] shadow-inner-soft outline-none focus:ring-2 focus:ring-[var(--color-brand-terracotta)]/50 transition-all text-sm";
  const sectionClass = "bg-[var(--color-brand-light)] p-8 rounded-[2rem] shadow-soft flex flex-col gap-6";
  const labelClass = "text-sm font-semibold text-[var(--color-brand-dark)]";

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-gray-500 font-medium text-sm">{t('settings.desc')}</p>
      </header>

      <div className="flex flex-col gap-6">

        {/* ══════════════════════════════════════════
            SECTION 1 — Mon Profil
            ══════════════════════════════════════════ */}
        <div className={sectionClass}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-brand-terracotta)] to-[var(--color-brand-dark)] flex items-center justify-center text-white text-xl font-bold shadow-soft shrink-0">
              {userData?.prenom?.charAt(0).toUpperCase()}{userData?.nom?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{t('settings.profile')}</h2>
              <p className="text-xs text-gray-400 font-medium">{userData?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>{t('settings.firstname')}</label>
              <input
                type="text"
                value={editPrenom}
                onChange={(e) => { setEditPrenom(e.target.value); setProfileDirty(true); }}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>{t('settings.lastname')}</label>
              <input
                type="text"
                value={editNom}
                onChange={(e) => { setEditNom(e.target.value); setProfileDirty(true); }}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>{t('settings.workshop')}</label>
              <input
                type="text"
                value={userData?.magasin || ''}
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>{t('settings.role')}</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--brand-surface)] shadow-inner-soft">
                <Shield className="w-4 h-4 text-[var(--color-brand-terracotta)]" />
                <span className="text-sm font-bold capitalize text-[var(--color-brand-terracotta)]">{userData?.role}</span>
              </div>
            </div>
          </div>

          {profileDirty && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="bg-[var(--color-brand-dark)] text-white px-6 py-2.5 rounded-full font-bold shadow-soft hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('settings.save_profile')}
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            SECTION 2 — Modifier l'email
            ══════════════════════════════════════════ */}
        <div className={sectionClass}>
          <h2 className="text-xl font-bold">{t('settings.email_section')}</h2>
          <p className="text-xs text-gray-400 -mt-4">
            {t('settings.email')} : <span className="font-semibold text-[var(--color-brand-dark)]">{userData?.email}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>{t('settings.new_email')}</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouveau@email.com"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>{t('settings.confirm_email')}</label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="nouveau@email.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUpdateEmail}
              disabled={emailLoading || !newEmail || !confirmEmail}
              className="bg-[var(--color-brand-dark)] text-white px-6 py-2.5 rounded-full font-bold shadow-soft hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('settings.update_email')}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 3 — Modifier le mot de passe
            ══════════════════════════════════════════ */}
        <div className={sectionClass}>
          <h2 className="text-xl font-bold">{t('settings.password_section')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>{t('settings.new_password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClass}>{t('settings.confirm_password')}</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password strength bar */}
          {newPassword.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${strengthPercent}%`,
                    backgroundColor: strengthColor,
                  }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: strengthColor }}>
                {strengthLabel}
              </span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleUpdatePassword}
              disabled={passwordLoading || !newPassword || !confirmPassword}
              className="bg-[var(--color-brand-dark)] text-white px-6 py-2.5 rounded-full font-bold shadow-soft hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('settings.update_password')}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 4 — Apparence
            ══════════════════════════════════════════ */}
        <div className={sectionClass}>
          <h2 className="text-xl font-bold">{t('settings.appearance')}</h2>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-[var(--color-brand-terracotta)] bg-[var(--color-brand-terracotta)]/5 shadow-inner-soft' : 'border-transparent bg-[var(--background)] shadow-soft hover:shadow-soft-hover'
                }`}
            >
              <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`} />
              <span className={`text-sm font-semibold ${theme === 'light' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`}>{t('settings.theme_light')}</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-[var(--color-brand-terracotta)] bg-[var(--color-brand-terracotta)]/5 shadow-inner-soft' : 'border-transparent bg-[var(--background)] shadow-soft hover:shadow-soft-hover'
                }`}
            >
              <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`} />
              <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`}>{t('settings.theme_dark')}</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-[var(--color-brand-terracotta)] bg-[var(--color-brand-terracotta)]/5 shadow-inner-soft' : 'border-transparent bg-[var(--background)] shadow-soft hover:shadow-soft-hover'
                }`}
            >
              <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`} />
              <span className={`text-sm font-semibold ${theme === 'system' ? 'text-[var(--color-brand-terracotta)]' : 'text-gray-500'}`}>{t('settings.theme_system')}</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 5 — Zone Dangereuse
            ══════════════════════════════════════════ */}
        <div className="bg-red-50 border-2 border-red-200 p-8 rounded-[2rem] flex flex-col gap-4">
          <h2 className="text-xl font-bold text-red-700">{t('settings.danger_zone')}</h2>
          <p className="text-sm text-red-500">{t('settings.delete_confirm_desc')}</p>
          <div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-6 py-2.5 rounded-full font-bold shadow-soft hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('settings.delete_account')}
            </button>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════
          DELETE CONFIRMATION MODAL
          ══════════════════════════════════════════ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-700">{t('settings.delete_confirm_title')}</h3>
            </div>

            <p className="text-sm text-gray-600">{t('settings.delete_confirm_desc')}</p>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">{t('settings.delete_confirm_label')}</label>
              <input
                type="email"
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                placeholder={userData?.email}
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmEmail(""); }}
                className="px-5 py-2.5 rounded-full font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmEmail !== userData?.email || deleteLoading}
                className="px-5 py-2.5 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('settings.delete_confirm_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
