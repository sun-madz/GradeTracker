import type { AppData, Letter, Module, Semester } from './types';
import { YEAR_WEIGHT, autoLevel } from './taylors';

// Taylor's University undergraduate grading scale
export const SCALE: { letter: Letter; min: number; max: number; points: number; label: string }[] = [
  { letter: 'A', min: 80, max: 100, points: 4.0, label: 'Excellent' },
  { letter: 'A-', min: 75, max: 79, points: 3.67, label: 'Very good' },
  { letter: 'B+', min: 70, max: 74, points: 3.33, label: 'Good' },
  { letter: 'B', min: 65, max: 69, points: 3.0, label: 'Good' },
  { letter: 'B-', min: 60, max: 64, points: 2.67, label: 'Pass' },
  { letter: 'C+', min: 55, max: 59, points: 2.33, label: 'Pass' },
  { letter: 'C', min: 50, max: 54, points: 2.0, label: 'Lowest pass' },
  { letter: 'D+', min: 47, max: 49, points: 1.67, label: 'Marginal fail' },
  { letter: 'D', min: 44, max: 46, points: 1.33, label: 'Marginal fail' },
  { letter: 'D-', min: 40, max: 43, points: 1.0, label: 'Marginal fail' },
  { letter: 'F', min: 0, max: 39, points: 0, label: 'Fail' },
];
export const LETTERS = SCALE.map((s) => s.letter);

export const pointsOf = (l: Letter) => SCALE.find((s) => s.letter === l)!.points;
// C is the lowest pass at Taylor's; D+, D, D- and F are fails.
export const isFail = (l: Letter | null | undefined) => !!l && pointsOf(l) < 2;
export const minOf = (l: Letter) => SCALE.find((s) => s.letter === l)!.min;

export function letterFor(mark: number, round: boolean): Letter {
  const m = round ? Math.round(mark) : mark;
  return (SCALE.find((s) => m >= s.min) ?? SCALE[SCALE.length - 1]).letter;
}

export const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export interface ModuleStats {
  totalWeight: number;
  weightAssessed: number;
  secured: number;              // marks banked out of 100
  projected: number | null;     // % if you keep your current average
  predicted: Letter | null;
  fromExpected: boolean;        // prediction comes from your expected grade, not marks
  used: Letter | null;          // transcript if present, else predicted
  points: number | null;
  confirmed: boolean;
  complete: boolean;
  exempt: boolean;
  needed: { kind: 'pct'; value: number } | { kind: 'secured' | 'out' | 'achieved' | 'missed' } | null;
  warnings: string[];
}

export function moduleStats(m: Module, round: boolean): ModuleStats {
  if (m.exempt) {
    return { totalWeight: 0, weightAssessed: 0, secured: 0, projected: null, predicted: null, fromExpected: false, used: null, points: null,
      confirmed: false, complete: true, exempt: true, needed: null, warnings: [] };
  }
  let totalWeight = 0, weightAssessed = 0, secured = 0;
  const warnings: string[] = [];
  for (const a of m.assessments) {
    const w = isNum(a.weight) ? a.weight : 0;
    totalWeight += w;
    if (isNum(a.score)) {
      const out = isNum(a.outOf) && a.outOf > 0 ? a.outOf : w;
      if (a.score > out) warnings.push(`${a.name || 'An assessment'}: score is higher than its total`);
      weightAssessed += w;
      secured += out > 0 ? (a.score / out) * w : 0;
    }
  }
  if (m.assessments.length && Math.abs(totalWeight - 100) > 0.01) warnings.push(`Weights add up to ${+totalWeight.toFixed(2)}%, not 100%`);
  const projected = weightAssessed > 0 ? (secured / weightAssessed) * 100 : null;
  const complete = totalWeight > 0 && weightAssessed >= totalWeight;
  const goal = m.target ?? m.expected ?? null;   // target grade doubles as the prediction until marks exist
  const fromExpected = projected === null && !!goal;
  const predicted = projected === null ? goal : letterFor(projected, round);
  const used = m.transcript ?? predicted;
  const points = used ? pointsOf(used) : null;

  let needed: ModuleStats['needed'] = null;
  if (m.target) {
    const goal = minOf(m.target) - (round ? 0.5 : 0);
    const remaining = Math.max(0, (totalWeight || 100) - weightAssessed);
    if (remaining <= 0) needed = { kind: secured >= goal ? 'achieved' : 'missed' };
    else {
      const v = (goal - secured) / remaining;
      needed = v <= 0 ? { kind: 'secured' } : v > 1 ? { kind: 'out' } : { kind: 'pct', value: v * 100 };
    }
  }
  return { totalWeight, weightAssessed, secured, projected, predicted, fromExpected, used, points, confirmed: !!m.transcript, complete, exempt: false, needed, warnings };
}

export const levelOf = (m: Module, s: Semester): 1 | 2 | 3 => m.yearLevel ?? autoLevel(m.name, s.name, m.code);

export interface SemesterStats {
  credits: number;           // credits counted in GPA
  wCredits: number;          // credits × year weight (or plain credits when weighting is off)
  wPoints: number;           // grade points × weighted credits
  exemptCredits: number;     // credits earned through credit transfer
  gpa: number | null;
  modules: number;
  confirmed: number;
  exempt: number;
  status: 'empty' | 'predicted' | 'final';
}

// includePredicted = false → only transcript (confirmed) grades count.
export function semesterStats(s: Semester, round: boolean, weighted = true, includePredicted = true): SemesterStats {
  let qp = 0, credits = 0, wc = 0, confirmed = 0, exempt = 0, exemptCredits = 0;
  for (const m of s.modules) {
    const st = moduleStats(m, round);
    if (st.confirmed) confirmed++;
    if (st.exempt) { exempt++; exemptCredits += isNum(m.credits) ? m.credits : 0; continue; }
    if (!includePredicted && !st.confirmed) continue;
    if (m.countsInGPA && st.points !== null && isNum(m.credits)) {
      const w = m.credits * (weighted ? YEAR_WEIGHT[levelOf(m, s)] : 1);
      qp += st.points * w; wc += w; credits += m.credits;
    }
  }
  const n = s.modules.length;
  return {
    credits, wCredits: wc, wPoints: qp, exemptCredits, gpa: wc ? qp / wc : null, modules: n, confirmed, exempt,
    status: n === 0 ? 'empty' : confirmed + exempt === n ? 'final' : 'predicted',
  };
}

export interface CumulativeRow { semester: Semester; stats: SemesterStats; cumCredits: number; cumExempt: number; cgpa: number | null; official: boolean }

// Confirmed transcript grades only, everywhere. Pass predictFor (a semester id) to also count
// that one semester's predicted grades – used only on that semester's screen.
export function cumulative(d: AppData, predictFor?: string): CumulativeRow[] {
  const round = d.settings.roundMarks;
  const weighted = d.settings.yearWeighting !== false;
  // Running totals: plain credits for display, weighted credits/points for the (W)CGPA.
  let cc = 0, ce = 0, wc = 0, wp = 0, cg: number | null = null;
  const replaced = supersededIds(d, predictFor);
  // Where each failed attempt was counted, so a retake can take it back out from its own semester onwards.
  const counted = new Map<string, { c: number; w: number; p: number }>();
  return d.semesters.map((s) => {
    const stats = semesterStats(s, round, weighted, s.id === predictFor);            // the semester's own WGPA
    ce += stats.exemptCredits;
    cc += stats.credits; wc += stats.wCredits; wp += stats.wPoints;
    for (const m of s.modules) {
      if (replaced.has(m.id)) {
        const st = moduleStats(m, round);
        if (st.points !== null && m.countsInGPA && isNum(m.credits)) {
          const w = m.credits * (weighted ? YEAR_WEIGHT[levelOf(m, s)] : 1);
          counted.set(m.id, { c: m.credits, w, p: st.points * w });
        }
      }
      if (m.retakeOf && replaced.has(m.retakeOf) && counted.has(m.retakeOf)) {
        const o = counted.get(m.retakeOf)!;   // the retake now counts instead of the fail
        cc -= o.c; wc -= o.w; wp -= o.p; counted.delete(m.retakeOf);
      }
    }
    const official = isNum(s.officialCGPA);
    if (official) {
      // Anchor to the transcript: keep the weighted credits, rescale the points to match.
      if (isNum(s.officialCredits)) cc = s.officialCredits;
      cg = s.officialCGPA!;
      if (wc === 0 && isNum(s.officialCredits)) wc = s.officialCredits * YEAR_WEIGHT[1];
      wp = cg * wc;
    } else if (wc > 0) {
      cg = wp / wc;
    }
    return { semester: s, stats, cumCredits: cc, cumExempt: ce, cgpa: cg, official };
  });
}

export function gradeTone(l: Letter | null): string {
  if (!l) return 'none';
  if (l.startsWith('A')) return 'a';
  if (l.startsWith('B')) return 'b';
  if (l.startsWith('C')) return 'c';
  return 'f';
}

export const fmt = (n: number | null | undefined, dp = 2) => (isNum(n) ? n.toFixed(dp) : '—');

export const gpaLabels = (d: AppData) => (d.settings.yearWeighting !== false ? { gpa: 'WGPA', cgpa: 'WCGPA' } : { gpa: 'GPA', cgpa: 'CGPA' });

// Latest standing across all semesters (the last running value).
export const latest = (rows: CumulativeRow[]) => [...rows].reverse().find((r) => r.cgpa !== null) ?? null;

export interface LevelFit { changes: { id: string; name: string; from: 1 | 2 | 3; to: 1 | 2 | 3 }[]; value: number }

// Finds year levels for this semester's confirmed modules that reproduce the transcript WGPA,
// preferring the fewest changes. Returns null when nothing matches (then credits or grades differ).
export function fitLevels(s: Semester, round: boolean, target: number): LevelFit | null {
  const mods = s.modules.map((m) => ({ m, st: moduleStats(m, round) }))
    .filter(({ m, st }) => !st.exempt && st.confirmed && m.countsInGPA && st.points !== null && isNum(m.credits));
  if (!mods.length || mods.length > 8) return null;
  const cur = mods.map(({ m }) => levelOf(m, s));
  let best: { lv: (1 | 2 | 3)[]; n: number; v: number } | null = null;
  const total = 3 ** mods.length;
  for (let k = 0; k < total; k++) {
    let x = k; const lv: (1 | 2 | 3)[] = [];
    for (let i = 0; i < mods.length; i++) { lv.push(((x % 3) + 1) as 1 | 2 | 3); x = Math.floor(x / 3); }
    let wp = 0, wc = 0;
    mods.forEach(({ m, st }, i) => { const w = m.credits * YEAR_WEIGHT[lv[i]]; wp += st.points! * w; wc += w; });
    const v = wp / wc;
    if (Math.abs(Math.round(v * 100) / 100 - target) > 0.0001) continue;
    const n = lv.filter((l, i) => l !== cur[i]).length;
    if (!best || n < best.n) best = { lv, n, v };
  }
  if (!best) return null;
  return { value: best.v, changes: mods.map(({ m }, i) => ({ id: m.id, name: m.name, from: cur[i], to: best!.lv[i] })).filter((c) => c.from !== c.to) };
}

// Failed attempts that a retake replaces in the running WCGPA: the retake has a transcript grade,
// or (on that semester's own screen) a predicted grade.
export function supersededIds(d: AppData, predictFor?: string): Set<string> {
  const out = new Set<string>();
  for (const s of d.semesters) for (const m of s.modules) {
    if (!m.retakeOf) continue;
    const st = moduleStats(m, d.settings.roundMarks);
    if (st.confirmed || (s.id === predictFor && st.points !== null)) out.add(m.retakeOf);
  }
  return out;
}

export function findRetake(d: AppData, id: string): { sem: Semester; mod: Module } | null {
  for (const sem of d.semesters) for (const mod of sem.modules) if (mod.retakeOf === id) return { sem, mod };
  return null;
}
