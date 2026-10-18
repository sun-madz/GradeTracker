import type { AppData, Letter, Module, Semester } from './types';

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
  used: Letter | null;          // transcript if present, else predicted
  points: number | null;
  confirmed: boolean;
  complete: boolean;
  needed: { kind: 'pct'; value: number } | { kind: 'secured' | 'out' | 'achieved' | 'missed' } | null;
  warnings: string[];
}

export function moduleStats(m: Module, round: boolean): ModuleStats {
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
  const predicted = projected === null ? null : letterFor(projected, round);
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
  return { totalWeight, weightAssessed, secured, projected, predicted, used, points, confirmed: !!m.transcript, complete, needed, warnings };
}

export interface SemesterStats {
  credits: number;           // credits counted in GPA
  gpa: number | null;
  modules: number;
  confirmed: number;
  status: 'empty' | 'predicted' | 'final';
}

export function semesterStats(s: Semester, round: boolean): SemesterStats {
  let qp = 0, credits = 0, confirmed = 0;
  for (const m of s.modules) {
    const st = moduleStats(m, round);
    if (st.confirmed) confirmed++;
    if (m.countsInGPA && st.points !== null && isNum(m.credits)) { qp += st.points * m.credits; credits += m.credits; }
  }
  const n = s.modules.length;
  return {
    credits, gpa: credits ? qp / credits : null, modules: n, confirmed,
    status: n === 0 ? 'empty' : confirmed === n ? 'final' : 'predicted',
  };
}

export interface CumulativeRow { semester: Semester; stats: SemesterStats; cumCredits: number; cgpa: number | null; official: boolean }

export function cumulative(d: AppData): CumulativeRow[] {
  const round = d.settings.roundMarks;
  let cc = 0, cg: number | null = null;
  return d.semesters.map((s) => {
    const stats = semesterStats(s, round);
    const official = isNum(s.officialCGPA);
    if (official) {
      cc = isNum(s.officialCredits) ? s.officialCredits : cc + stats.credits;
      cg = s.officialCGPA!;
    } else if (stats.credits > 0) {
      const prev = (cg ?? 0) * cc;
      cc += stats.credits;
      cg = (prev + (stats.gpa ?? 0) * stats.credits) / cc;
    }
    return { semester: s, stats, cumCredits: cc, cgpa: cg, official };
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
