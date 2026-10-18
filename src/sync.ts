import type { AppData } from './types';
import { cumulative, moduleStats, isNum } from './grading';

// Builds the tables written to the Google Sheet. Values are computed here so the
// Apps Script stays tiny and the sheet always matches what the app shows.
export function sheetTables(d: AppData) {
  const round = d.settings.roundMarks;
  const overview: (string | number)[][] = [['Semester', 'Credits', 'Semester GPA', 'Status', 'Confirmed', 'Cumulative credits', 'CGPA', 'Basis']];
  const modules: (string | number)[][] = [['Semester', 'Module', 'Credits', 'Counts in GPA', 'Weight assessed %', 'Projected %', 'Predicted', 'Transcript', 'Grade used', 'Points', 'Status']];
  const assessments: (string | number)[][] = [['Semester', 'Module', 'Assessment', 'Weight %', 'Score', 'Out of', 'Contribution']];
  const r2 = (n: number | null) => (isNum(n) ? Math.round(n * 100) / 100 : '');

  for (const row of cumulative(d)) {
    const s = row.semester;
    overview.push([s.name, row.stats.credits, r2(row.stats.gpa), row.stats.status, `${row.stats.confirmed}/${row.stats.modules}`,
      row.cumCredits, r2(row.cgpa), row.official ? 'Official (transcript)' : row.stats.status === 'final' ? 'Transcript grades' : 'Includes predictions']);
    for (const m of s.modules) {
      const st = moduleStats(m, round);
      modules.push([s.name, m.name, m.credits, m.countsInGPA ? 'Yes' : 'No', r2(st.weightAssessed), r2(st.projected), st.predicted ?? '',
        m.transcript ?? '', st.used ?? '', r2(st.points), st.confirmed ? 'Confirmed' : st.complete ? 'Predicted – all marks in' : 'Predicted – in progress']);
      for (const a of m.assessments) {
        const out = isNum(a.outOf) && a.outOf > 0 ? a.outOf : a.weight;
        assessments.push([s.name, m.name, a.name, a.weight, isNum(a.score) ? a.score : '', out,
          isNum(a.score) && out ? r2((a.score / out) * a.weight) : '']);
      }
    }
  }
  return { overview, modules, assessments };
}

// Apps Script web apps accept "simple" text/plain POSTs without a CORS preflight.
export async function pushToSheet(d: AppData): Promise<void> {
  const { sheetUrl, sheetKey } = d.settings;
  if (!sheetUrl) throw new Error('No Google Sheet link set');
  const res = await fetch(sheetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'save', key: sheetKey, data: d, tables: sheetTables(d) }),
  });
  const out = await res.json().catch(() => null);
  if (!out || !out.ok) throw new Error(out?.error || `Sheet replied with ${res.status}`);
}

export async function pullFromSheet(url: string, key: string): Promise<AppData | null> {
  const res = await fetch(`${url}?action=load&key=${encodeURIComponent(key)}`);
  const out = await res.json();
  if (!out.ok) throw new Error(out.error || 'Could not read sheet');
  return out.data ?? null;
}
