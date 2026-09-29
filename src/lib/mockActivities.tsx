import { CheckCircle, Smartphone, Clock } from "lucide-react";
import type { TFunction } from "i18next";

// Textes dans les fichiers de traduction : activities.<key>.{title,desc,time,details}
export const mockActivities = [
  { id: 1, key: "parcel_received", icon: CheckCircle, color: "text-green-500" },
  { id: 2, key: "new_quote", icon: Smartphone, color: "text-[var(--color-brand-terracotta)]" },
  { id: 3, key: "label_generated", icon: Clock, color: "text-blue-500" },
  { id: 4, key: "prices_updated", icon: CheckCircle, color: "text-gray-400" },
  { id: 5, key: "payment_sent", icon: CheckCircle, color: "text-green-500" },
  { id: 6, key: "issue_reported", icon: Smartphone, color: "text-red-500" },
];

/** Activités avec leurs textes dans la langue courante. */
export const translatedActivities = (t: TFunction) =>
  mockActivities.map(a => ({
    ...a,
    title: t(`activities.${a.key}.title`),
    desc: t(`activities.${a.key}.desc`),
    time: t(`activities.${a.key}.time`),
    details: t(`activities.${a.key}.details`),
  }));
