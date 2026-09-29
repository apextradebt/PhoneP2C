import { useState, type ChangeEvent, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Building2, User } from "lucide-react";
import type { ClientDraft, CustomerType } from "@/types";
import { useTranslation } from "react-i18next";

export const EMPTY_CLIENT: ClientDraft = {
    customerType: "particulier",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    siret: "",
    address: "",
    postalCode: "",
    city: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isEmailValid = (email: string) => email.trim() === "" || EMAIL_RE.test(email.trim());

/** Minimum requis pour éditer un devis : identité du client (+ société pour un pro). */
export function isClientComplete(client: ClientDraft) {
    return client.firstName.trim() !== ""
        && client.lastName.trim() !== ""
        && (client.customerType !== "professionnel" || client.company.trim() !== "")
        && isEmailValid(client.email);
}

const inputClass = "w-full p-3 rounded-xl bg-(--brand-surface) shadow-inner-soft outline-none focus:ring-2 focus:ring-(--color-brand-terracotta)/50 transition-all text-sm font-medium text-(--color-brand-dark)";

function Field({ label, required, hint, className, children }: { label: string, required?: boolean, hint?: ReactNode, className?: string, children: ReactNode }) {
    return (
        <label className={`flex flex-col gap-2 ${className ?? ""}`}>
            <span className="text-sm font-semibold text-(--color-brand-dark)">
                {label}{required && <span className="text-(--color-brand-terracotta)"> *</span>}
            </span>
            {children}
            {hint}
        </label>
    );
}

interface ClientInfoInterface {
    client: ClientDraft,
    setClient: Dispatch<SetStateAction<ClientDraft>>,
    notes: string,
    setNotes: Dispatch<SetStateAction<string>>,
}

export default function ClientInfo({ client, setClient, notes, setNotes }: ClientInfoInterface) {
    const { t } = useTranslation();
    const [emailTouched, setEmailTouched] = useState(false);
    const isPro = client.customerType === "professionnel";

    const bind = (field: Exclude<keyof ClientDraft, "customerType">) => ({
        value: client[field],
        onChange: (e: ChangeEvent<HTMLInputElement>) => setClient(c => ({ ...c, [field]: e.target.value })),
        className: inputClass,
        autoComplete: "off",
    });

    const siretDigits = client.siret.replace(/\s/g, "");
    const showEmailError = emailTouched && !isEmailValid(client.email);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h2 className="text-xl font-bold mb-1">{t('devis.client.title')}</h2>
                <p className="text-sm text-gray-500">{t('devis.client.desc')}</p>
            </div>

            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-3 max-w-md">
                    {([
                        { type: "particulier", label: t("devis.client.individual"), icon: User },
                        { type: "professionnel", label: t("devis.client.business"), icon: Building2 },
                    ] as { type: CustomerType, label: string, icon: typeof User }[]).map(({ type, label, icon: Icon }) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setClient(c => ({ ...c, customerType: type }))}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-semibold transition-all ${client.customerType === type ? "bg-(--color-brand-light) border-(--color-brand-terracotta) text-(--color-brand-terracotta) shadow-inner-soft" : "bg-(--color-brand-light) border-transparent text-(--color-brand-dark) shadow-soft-active hover:shadow-soft"}`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isPro && (
                        <>
                            <Field label={t("devis.client.company")} required>
                                <input type="text" placeholder={t("devis.client.company_placeholder")} {...bind("company")} />
                            </Field>
                            <Field
                                label={t("devis.client.siret")}
                                hint={siretDigits !== "" && !/^\d{14}$/.test(siretDigits) && (
                                    <span className="text-xs text-amber-600">{t("devis.client.siret_length", { count: siretDigits.length })}</span>
                                )}
                            >
                                <input type="text" inputMode="numeric" placeholder={t("devis.client.siret_placeholder")} {...bind("siret")} />
                            </Field>
                        </>
                    )}

                    <Field label={t(isPro ? "devis.client.contact_firstname" : "devis.client.firstname")} required>
                        <input type="text" {...bind("firstName")} />
                    </Field>
                    <Field label={t(isPro ? "devis.client.contact_lastname" : "devis.client.lastname")} required>
                        <input type="text" {...bind("lastName")} />
                    </Field>

                    <Field
                        label={t("devis.client.email")}
                        hint={showEmailError && <span className="text-xs text-red-500">{t("devis.client.email_invalid")}</span>}
                    >
                        <input type="email" placeholder={t("devis.client.email_placeholder")} {...bind("email")} onBlur={() => setEmailTouched(true)} />
                    </Field>
                    <Field label={t("devis.client.phone")}>
                        <input type="tel" placeholder="06 12 34 56 78" {...bind("phone")} />
                    </Field>

                    <Field label={t("devis.client.address")} className="sm:col-span-2">
                        <input type="text" placeholder={t("devis.client.address_placeholder")} {...bind("address")} />
                    </Field>
                    <Field label={t("devis.client.postal_code")}>
                        <input type="text" inputMode="numeric" maxLength={10} {...bind("postalCode")} />
                    </Field>
                    <Field label={t("devis.client.city")}>
                        <input type="text" {...bind("city")} />
                    </Field>

                    <Field label={t("devis.client.notes")} className="sm:col-span-2" hint={<span className="text-xs text-gray-400">{t("devis.client.notes_hint")}</span>}>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder={t("devis.client.notes_placeholder")}
                            className={`${inputClass} resize-none`}
                        />
                    </Field>
                </div>

                {!isClientComplete(client) && (
                    <p className="text-xs text-gray-500">
                        <span className="text-(--color-brand-terracotta)">*</span> {t("devis.client.required")}
                    </p>
                )}
            </div>
        </div>
    );
}
