import i18n from "@/i18n";
import colorNamesEn from "@/data/colorNames.en.json";

// Mise en forme dépendant de la langue de l'interface. Les composants qui les
// appellent pendant leur rendu utilisent useTranslation(), donc se re-rendent
// quand la langue change.

const LOCALES: Record<string, string> = { fr: "fr-FR", en: "en-GB", fi: "fi-FI" };
const locale = () => LOCALES[i18n.language] ?? "fr-FR";

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale());

export const formatDateTime = (iso: string) => new Date(iso).toLocaleString(locale());

/** Libellé court d'un mois pour les graphiques, ex. « oct. '26 » / « Oct '26 ». */
export const monthLabel = (d: Date) =>
    `${d.toLocaleDateString(locale(), { month: "short" })} '${String(d.getFullYear()).slice(-2)}`;

/**
 * Les coloris du catalogue (et donc des devis enregistrés) sont stockés en
 * français. Dans les autres langues on affiche le nom commercial anglais
 * (pas de traduction finnoise des coloris pour l'instant).
 */
export const colorLabel = (name: string) =>
    i18n.language === "fr" ? name : (colorNamesEn as Record<string, string>)[name] ?? name;
