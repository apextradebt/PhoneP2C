import type { Grade, Match, QuoteLine, RawLine } from "@/types";
import { parseGrade } from "@/lib/parse";
import { normalize } from "@/lib/match";

const variantKey = (v: QuoteLine["variant"]) => [v.cpu, v.ram, v.storage].map((x) => x || "?").join("|");

/**
 * Collapse matched lines into quote lines: same model + same variant + same grade → one line, quantities summed.
 * Unmatched lines are grouped by their normalised text so the same unknown device is only reviewed once.
 */
export function groupLines(lines: RawLine[], matches: Match[], defaultGrade: Grade): QuoteLine[] {
  const groups = new Map<string, QuoteLine>();
  lines.forEach((line, i) => {
    const m = matches[i];
    const parsed = parseGrade(line.gradeRaw);
    const grade = parsed ?? defaultGrade;
    const identity = m.ref ? `${m.ref.id}|${variantKey(m.variant)}` : `?|${normalize(line.model || line.text)}`;
    const key = `${identity}|${grade}`;
    const existing = groups.get(key);
    if (existing) {
      existing.quantity += line.quantity;
      existing.sourceRows.push(line.row);
      for (const w of m.warnings) if (!existing.warnings.includes(w)) existing.warnings.push(w);
      existing.score = Math.min(existing.score, m.score);
      return;
    }
    groups.set(key, {
      key,
      refId: m.ref?.id,
      category: m.ref?.category,
      brand: m.ref?.brand || line.brand || "",
      model: m.ref?.model || line.model || line.text,
      variant: m.variant,
      grade,
      gradeAssumed: !parsed,
      quantity: line.quantity,
      status: m.status,
      score: m.score,
      warnings: [...m.warnings],
      sourceRows: [line.row],
      sampleText: line.text,
      priceState: "idle",
      agentResults: [],
    });
  });
  return sortLines([...groups.values()]);
}

/** After manual edits two lines can describe the same device: merge them again (prices are re-fetched). */
export function mergeDuplicates(lines: QuoteLine[]): QuoteLine[] {
  const out = new Map<string, QuoteLine>();
  for (const l of lines) {
    const identity = l.refId ? `${l.refId}|${variantKey(l.variant)}` : `?|${normalize(l.model)}`;
    const key = `${identity}|${l.grade}`;
    const prev = out.get(key);
    if (!prev) {
      out.set(key, { ...l, key });
      continue;
    }
    out.set(key, {
      ...prev,
      quantity: prev.quantity + l.quantity,
      sourceRows: [...prev.sourceRows, ...l.sourceRows],
      warnings: [...new Set([...prev.warnings, ...l.warnings])],
      gradeAssumed: prev.gradeAssumed || l.gradeAssumed,
      priceState: "idle",
      agentResults: [],
    });
  }
  return sortLines([...out.values()]);
}

const GRADE_ORDER = "ABCDE";

/** Laptops first, then phones; within each: brand, model, variant, grade. Unmatched lines last. */
export function sortLines(lines: QuoteLine[]): QuoteLine[] {
  const cat = (l: QuoteLine) => (l.status === "unmatched" ? 2 : l.category === "laptop" ? 0 : 1);
  return [...lines].sort(
    (a, b) =>
      cat(a) - cat(b) ||
      a.brand.localeCompare(b.brand) ||
      a.model.localeCompare(b.model, undefined, { numeric: true }) ||
      variantKey(a.variant).localeCompare(variantKey(b.variant), undefined, { numeric: true }) ||
      GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade)
  );
}
