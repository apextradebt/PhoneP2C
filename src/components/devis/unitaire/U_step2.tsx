import { DeviceGrade } from "@/types";

interface U_step2Interface {
    setUnitCapacity: (unitCapacity: string) => void,
    unitCapacity: string,
    setUnitColor: (unitColor: string) => void,
    unitColor: string,
    setUnitGrade: (unitGrade: DeviceGrade) => void,
    unitGrade: DeviceGrade,
}

export default function U_step2({ setUnitCapacity, unitCapacity, setUnitColor, unitColor, setUnitGrade, unitGrade }: U_step2Interface) {

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h2 className="text-xl font-bold mb-1">Caractéristiques & Diagnostic</h2>
                <p className="text-sm text-gray-500">Précisez les caractéristiques et l'état de l'appareil.</p>
            </div>

            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="font-bold text-lg mb-3">Capacité</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {["64GB", "128GB", "256GB", "512GB", "1TB"].map(cap => (
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

                <div>
                    <h3 className="font-bold text-lg mb-3">Couleur</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { name: "Noir Sidéral", code: "#333333" },
                            { name: "Argent", code: "#E3E4E5" },
                            { name: "Or", code: "#FAD6BD" },
                            { name: "Bleu", code: "#2B475D" },
                            { name: "Vert", code: "#3C4B3E" },
                            { name: "Rouge", code: "#A5282C" },
                            { name: "Blanc", code: "#F9F6EF" },
                            { name: "Violet", code: "#B6A1C4" },
                        ].map(color => (
                            <button
                                key={color.name}
                                onClick={() => setUnitColor(color.name)}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 font-semibold transition-all ${unitColor === color.name ? "bg-(--color-brand-light) border-(--color-brand-terracotta) text-(--color-brand-terracotta) shadow-inner-soft" : "bg-(--color-brand-light) border-transparent text-(--color-brand-dark) shadow-soft-active hover:shadow-soft"}`}
                            >
                                <div className="w-6 h-6 rounded-full border shadow-sm flex items-center justify-center bg-white shrink-0">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.code }} />
                                </div>
                                <span className="text-sm truncate">{color.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-3">État Global (Grade)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { grade: "A", desc: "Comme neuf (0%)" },
                            { grade: "B", desc: "Micro-rayures (-15%)" },
                            { grade: "C", desc: "Rayures marquées (-30%)" },
                            { grade: "D", desc: "Cassé (-50%)" },
                        ].map((g, i) => (
                            <div
                                key={i}
                                onClick={() => setUnitGrade(g.grade as DeviceGrade)}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${unitGrade === g.grade
                                    ? "bg-(--color-brand-light) border-(--color-brand-terracotta) text-(--color-brand-terracotta) shadow-inner-soft"
                                    : "bg-(--color-brand-light) border-transparent text-(--color-brand-dark) shadow-soft-active hover:shadow-soft"
                                    }`}
                            >
                                <h3 className="font-bold text-lg text-(--color-brand-dark)">Grade {g.grade}</h3>
                                <p className="text-sm text-gray-500">{g.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}