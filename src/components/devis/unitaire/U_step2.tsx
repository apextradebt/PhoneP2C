import { DeviceCategory, DeviceGrade } from "@/types";
import type { PhoneColor } from "@/lib/CatalogContext";
import { colorLabel } from "@/lib/format";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

// Repli utilisé pour les marques dont on n'a pas encore audité les capacités
// réellement commercialisées (voir storageOptions dans phones.json).
export const CAPACITES_PAR_DEFAUT = ["64GB", "128GB", "256GB", "512GB", "1TB"];

// Repli générique pour les modèles dont les coloris officiels ne sont pas
// encore renseignés (voir colors dans phones.json).
export const COULEURS_PAR_DEFAUT: PhoneColor[] = [
    { name: "Noir", hex: "#1F1F21" },
    { name: "Blanc", hex: "#F5F5F0" },
    { name: "Gris", hex: "#8E8E93" },
    { name: "Argent", hex: "#D6D6D6" },
    { name: "Or", hex: "#E6CFA0" },
    { name: "Bleu", hex: "#3B6EA8" },
    { name: "Vert", hex: "#4F7A55" },
    { name: "Rouge", hex: "#B3272D" },
    { name: "Rose", hex: "#F2B8C6" },
    { name: "Violet", hex: "#7E5AA6" },
];

// Un IMEI fait 15 chiffres, le dernier étant une clé de Luhn.
function imeiChecksumOk(imei: string) {
    let sum = 0;
    for (let i = 0; i < 15; i++) {
        let d = Number(imei[i]);
        if (i % 2 === 1) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
    }
    return sum % 10 === 0;
}

function imeiWarning(t: TFunction, imei: string) {
    if (imei === "") return null;
    if (imei.length < 15) return t("devis.diag.imei_length", { count: imei.length });
    if (!imeiChecksumOk(imei)) return t("devis.diag.imei_checksum");
    return null;
}

interface U_step2Interface {
    deviceCategory: DeviceCategory,
    setUnitCapacity: (unitCapacity: string) => void,
    unitCapacity: string,
    setUnitColor: (unitColor: string) => void,
    unitColor: string,
    setUnitGrade: (unitGrade: DeviceGrade) => void,
    unitGrade: DeviceGrade,
    unitImei: string,
    setUnitImei: (unitImei: string) => void,
    unitSerial: string,
    setUnitSerial: (unitSerial: string) => void,
    storageOptions?: string[],
    colorOptions?: PhoneColor[],
}

export default function U_step2({ deviceCategory, setUnitCapacity, unitCapacity, setUnitColor, unitColor, setUnitGrade, unitGrade, unitImei, setUnitImei, unitSerial, setUnitSerial, storageOptions, colorOptions }: U_step2Interface) {
    const isLaptop = deviceCategory === "laptop";
    const capacites = storageOptions && storageOptions.length > 0 ? storageOptions : CAPACITES_PAR_DEFAUT;
    const couleurs = colorOptions && colorOptions.length > 0 ? colorOptions : COULEURS_PAR_DEFAUT;
    const { t } = useTranslation();
    const warning = isLaptop ? null : imeiWarning(t, unitImei);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h2 className="text-xl font-bold mb-1">{t('devis.diag.title')}</h2>
                <p className="text-sm text-gray-500">{t('devis.diag.desc')}</p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Un téléphone s'identifie par son IMEI, un PC par son numéro de série */}
                <div>
                    <h3 className="font-bold text-lg mb-3">
                        {t(isLaptop ? 'devis.diag.serial' : 'devis.diag.imei')} <span className="text-sm font-medium text-gray-400">({t('common.optional_lower')})</span>
                    </h3>
                    <input
                        type="text"
                        inputMode={isLaptop ? "text" : "numeric"}
                        autoComplete="off"
                        value={isLaptop ? unitSerial : unitImei}
                        onChange={e => isLaptop
                            ? setUnitSerial(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30))
                            : setUnitImei(e.target.value.replace(/\D/g, "").slice(0, 15))}
                        placeholder={t(isLaptop ? 'devis.diag.serial_placeholder' : 'devis.diag.imei_placeholder')}
                        className="w-full max-w-md p-3 rounded-xl bg-(--brand-surface) shadow-inner-soft outline-none focus:ring-2 focus:ring-(--color-brand-terracotta)/50 transition-all text-sm font-medium tracking-wider text-(--color-brand-dark)"
                    />
                    <p className={`text-xs mt-2 ${warning ? "text-amber-600" : "text-gray-400"}`}>
                        {warning ?? t(isLaptop ? 'devis.diag.serial_hint' : 'devis.diag.imei_hint')}
                    </p>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-3">{t('devis.diag.capacity')}</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {capacites.map(cap => (
                            <button
                                key={cap}
                                onClick={() => setUnitCapacity(cap)}
                                className={`p-3 rounded-xl border-2 font-semibold transition-all ${unitCapacity === cap ? "bg-(--color-brand-light) border-(--color-brand-terracotta) text-(--color-brand-terracotta) shadow-inner-soft" : "bg-(--color-brand-light) border-transparent text-(--color-brand-dark) shadow-soft-active hover:shadow-soft"}`}
                            >
                                {cap}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Le coloris n'entre pas dans la cotation d'un PC */}
                {!isLaptop && <div>
                    <h3 className="font-bold text-lg mb-3">{t('devis.diag.color')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {couleurs.map(color => (
                            <button
                                key={color.name}
                                onClick={() => setUnitColor(color.name)}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 font-semibold transition-all ${unitColor === color.name ? "bg-(--color-brand-light) border-(--color-brand-terracotta) text-(--color-brand-terracotta) shadow-inner-soft" : "bg-(--color-brand-light) border-transparent text-(--color-brand-dark) shadow-soft-active hover:shadow-soft"}`}
                            >
                                <div className="w-6 h-6 rounded-full border shadow-sm flex items-center justify-center bg-white shrink-0">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.hex }} />
                                </div>
                                <span className="text-sm truncate">{colorLabel(color.name)}</span>
                            </button>
                        ))}
                    </div>
                </div>}

                <div>
                    <h3 className="font-bold text-lg mb-3">{t('devis.diag.grade_title')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(["A", "B", "C", "D"] as const).map(grade => ({ grade, desc: t(`grades.${grade}`) })).map((g, i) => (
                            <div
                                key={i}
                                onClick={() => setUnitGrade(g.grade as DeviceGrade)}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${unitGrade === g.grade
                                    ? "bg-(--color-brand-light) border-(--color-brand-terracotta) text-(--color-brand-terracotta) shadow-inner-soft"
                                    : "bg-(--color-brand-light) border-transparent text-(--color-brand-dark) shadow-soft-active hover:shadow-soft"
                                    }`}
                            >
                                <h3 className="font-bold text-lg text-(--color-brand-dark)">{t('common.grade', { grade: g.grade })}</h3>
                                <p className="text-sm text-gray-500">{g.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}