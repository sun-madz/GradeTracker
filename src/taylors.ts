// Programme information for Taylor's University – Bachelor of Computer Science (Honours), 120 credits.
// Sources: the student's Taylor's study guide (September 2025 intake) and the programme page on
// university.taylors.edu.my. The semester layout is a suggestion, not a fixed structure.

import type { Plan } from './types';
import { ELECTIVE_CLUSTERS, ELECTIVES_NEEDED, EXTENSION_PACKAGES, MINOR_PACKAGES, SECOND_MAJORS } from './flexible';

export interface LibModule { name: string; group: string; credits: number; code?: string }

export const PROGRAMME = {
  name: "Bachelor of Computer Science (Honours)",
  school: 'School of Computer Science',
  duration: '3 years, full time · 120 credits',
  intakes: 'February, April, September',
  calendar:
    "Each year has two long semesters and one short semester. The study guide suggests when to take each module, but you can arrange your own semesters.",
  source: 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html',
};

// Module codes and credits from the study guide (the last digit of a Taylor's code is its credit hours).
export const KNOWN_CODES: Record<string, string> = {
  'database systems': 'ITS62904',
  'computer architecture and organisation': 'ITS62704',
  'object oriented programming': 'ITS63304',
  'discrete structures': 'ITS66204',
  'emotional intelligence in action': 'UCM60103',
  'bahasa melayu komunikasi 2': 'MPU3142',
  'penghayatan etika dan peradaban': 'MPU3182',
  'falsafah dan isu semasa': 'MPU3192',
  'kursus integriti dan antirasuah': 'MPU3412',
  'principles of software engineering': 'ITS64604',
  'advanced programming': 'ITS66704',
  'data structures and algorithms': 'ITS60504',
  'operating systems': 'CSC61504',
  'systems analysis and design': 'CSC61404',
  'social innovation project': 'UCM60303',
  'computer networks': 'CSC61604',
  'bahasa kebangsaan a': 'MPU3232',
  'ideating start-up': 'BUS61104',
  'machine learning and intelligent system': 'CSC61304',
  'capstone project i': 'PRJ63504',
  'human computer interaction': 'ITS63504',
  'professional practices and information security': 'ITS67204',
  'capstone project ii': 'PRJ63604',
  'industrial training': 'IND60308',
  'statistical inference and modelling': 'ITS66804',
  'computer vision and natural language processing': 'ITS69204',
  'internet of things': 'ITS67404',
};

// Other spellings of the same module (study guide vs website).
const ALIASES: Record<string, string> = {
  'computer architecture and organization': 'computer architecture and organisation',
  'system analysis & design': 'systems analysis and design',
  'system analysis and design': 'systems analysis and design',
  'systems analysis & design': 'systems analysis and design',
  'machine learning and intelligent systems': 'machine learning and intelligent system',
  'emotional intelligence in action (ei)': 'emotional intelligence in action',
  'kursus integriti dan antirasuah (kiar)': 'kursus integriti dan antirasuah',
  'statistical inference and modeling': 'statistical inference and modelling',
};
const BY_CODE = new Map(Object.entries(KNOWN_CODES).map(([n, c]) => [c.toLowerCase(), n]));

// The lower-case canonical name for a module, using its code first, then known spellings.
export function canonName(name: string, code?: string): string {
  const c = code?.trim().toLowerCase();
  if (c && BY_CODE.has(c)) return BY_CODE.get(c)!;
  const n = name.trim().toLowerCase().replace(/\s+/g, ' ');
  return ALIASES[n] ?? n;
}
export const codeFor = (name: string) => KNOWN_CODES[canonName(name)];

// Credit hours: from the code's last digit when there is a code, otherwise known values, otherwise 4.
const CREDITS: Record<string, number> = { 'industrial training': 8, 'youth and leadership in malaysia': 2, 'community impact and engagement': 2,
  'falsafah dan cabaran semasa': 2, 'aspirasi negara bangsa': 2, 'citra malaysia': 2 };
export function creditsFor(name: string, code?: string): number {
  const c = (code || codeFor(name) || '').trim();
  const d = c.match(/(\d)$/);
  if (d && Number(d[1]) > 0) return Number(d[1]);
  return CREDITS[canonName(name)] ?? 4;
}

const core = (names: string[], group: string): LibModule[] => names.map((name) => ({ name, group, credits: creditsFor(name), code: codeFor(name) }));

// Programme structure from the study guide. "Specialisation" modules are required for every specialisation.
export const YEARS: { title: string; groups: { title: string; modules: string[] }[] }[] = [
  {
    title: 'Year 1',
    groups: [
      { title: 'Common core', modules: ['Database Systems', 'Computer Architecture and Organisation', 'Object Oriented Programming', 'Discrete Structures',
        'Principles of Software Engineering', 'Data Structures and Algorithms', 'Operating Systems', 'Systems Analysis and Design'] },
      { title: 'Specialisation', modules: ['Advanced Programming'] },
    ],
  },
  {
    title: 'Year 2',
    groups: [
      { title: 'Common core', modules: ['Computer Networks'] },
      { title: 'Specialisation', modules: ['Machine Learning and Intelligent System', 'Ideating Start-up'] },
      { title: 'Plus', modules: ['4 modules from your specialisation', '5 complementary modules (extension, minor or free electives)'] },
    ],
  },
  {
    title: 'Year 3 · Pick one track',
    groups: [
      { title: 'Conventional', modules: ['Capstone Project I', 'Human Computer Interaction', 'Professional Practices and Information Security', 'Capstone Project II', 'Industrial Training'] },
      { title: 'Work-Based Learning', modules: ['Human Computer Interaction', 'Professional Practices and Information Security', 'Industrial Project I', 'Industrial Project II'] },
      { title: 'Technopreneurship', modules: ['Human Computer Interaction', 'Technopreneurship Project I', 'Professional Practices and Information Security', 'Technopreneurship Project II'] },
    ],
  },
];
const Y1_CORE = YEARS[0].groups[0].modules;
const PROG_SPEC = [...YEARS[0].groups[1].modules, ...YEARS[1].groups[1].modules];
const Y2_CORE = YEARS[1].groups[0].modules;

export const SPECIALISATIONS: { title: string; modules: string[] }[] = [
  { title: 'Data Science', modules: ['Statistical Inference and Modelling', 'Data Science Principles', 'Data Mining', 'Big Data Technologies'] },
  { title: 'Artificial Intelligence', modules: ['Computer Vision and Natural Language Processing', 'Data Analytics and Machine Learning', 'Cognitive Computing and Applications', 'Big Data Technologies'] },
  { title: 'Cyber Security', modules: ['Computer and Network Security', 'Computer Intrusion Detection', 'Computer Crime and Digital Evidence', 'Wireless Networks and Security'] },
  { title: 'Mobile Computing', modules: ['Introduction to Mobile Computing', 'Mobile Applications Development', 'Wireless Networks and Security', 'Internet of Things'] },
];

// University core (MPU). The study guide list (September 2025 intake)…
export const UNIVERSITY_CORE_EARLIER = {
  all: ['Emotional Intelligence in Action', 'Falsafah dan Isu Semasa', 'Kursus Integriti dan Antirasuah', 'Social Innovation Project'],
  malaysian: ['Penghayatan Etika dan Peradaban'],
  international: ['Bahasa Melayu Komunikasi 2'],
};
// …and the newer list on Taylor's website.
export const UNIVERSITY_CORE = {
  all: ['Kursus Integriti dan Antirasuah', 'Emotional Intelligence in Action', 'Youth and Leadership in Malaysia', 'Community Impact and Engagement'],
  malaysian: ['Falsafah dan Cabaran Semasa', 'Aspirasi Negara Bangsa'],
  international: ['Bahasa Melayu Komunikasi 2', 'Citra Malaysia'],
};
export const coreFor = (v?: 'current' | 'earlier') => (v === 'current' ? UNIVERSITY_CORE : UNIVERSITY_CORE_EARLIER);

export const FLEXIBLE = [
  'Complementary study: 5 modules, from one extension package, one minor or five free electives',
  'Or a second major (12 modules), which raises the total to 148 credits',
];

const uniq = (l: LibModule[]) => l.filter((m, i) => l.findIndex((x) => x.name === m.name) === i);

export const LIBRARY: LibModule[] = uniq([
  ...core(Y1_CORE, 'Year 1 core'),
  ...core(PROG_SPEC, 'Programme specialisation'),
  ...core(Y2_CORE, 'Year 2 core'),
  ...YEARS[2].groups.flatMap((g) => core(g.modules, `Year 3 · ${g.title}`)),
  ...SPECIALISATIONS.flatMap((s) => core(s.modules, `Specialisation · ${s.title}`)),
  ...core([...UNIVERSITY_CORE_EARLIER.all, ...UNIVERSITY_CORE_EARLIER.malaysian, ...UNIVERSITY_CORE_EARLIER.international, 'Bahasa Kebangsaan A'], 'University core (MPU)'),
  ...core([...UNIVERSITY_CORE.all, ...UNIVERSITY_CORE.malaysian, ...UNIVERSITY_CORE.international], 'University core · newer list'),
  ...EXTENSION_PACKAGES.flatMap((e) => core(e.modules, `Extension · ${e.name}`)),
  ...MINOR_PACKAGES.flatMap((m) => core(m.modules, `Minor · ${m.name}`)),
  ...SECOND_MAJORS.flatMap((m) => core(m.modules, `Second major · ${m.name}`)),
  ...ELECTIVE_CLUSTERS.flatMap((c) => core(c.modules, `Free elective · ${c.short}`)),
]);

// Suggested semester names for a 3-year plan
export const SEMESTER_TEMPLATE = [1, 2, 3].flatMap((y) => [`Year ${y} Semester 1`, `Year ${y} Short Semester`, `Year ${y} Semester 2`]);

// Turns shorthand like "Y1S1", "y2 s2", "Y1 S.5" or "Y1 Short" into "Year 1 Semester 1" etc.
export function tidySemesterName(raw: string): string {
  const t = raw.trim().replace(/\s+/g, ' ');
  const m = t.match(/^y(?:ear)?\s*(\d)\s*[,\-]?\s*(?:s(?:em(?:ester)?)?\s*)?(\.5|0?\.5|short(?: sem(?:ester)?)?|\d)$/i);
  if (!m) return t;
  const [, y, s] = m;
  return /5|short/i.test(s) ? `Year ${y} Short Semester` : `Year ${y} Semester ${s}`;
}

export const TRACKS = YEARS[2].groups.map((g) => g.title);
export const EXTENSION_NAMES = EXTENSION_PACKAGES.map((e) => e.name);

// Extension packages allowed for each specialisation (must differ from the specialisation)
export const EXTENSIONS: Record<string, string[]> = {
  'Data Science': ['Mobile Computing', 'Cyber Security', 'Internet Technologies', 'Artificial Intelligence', 'Digital Transformation'],
  'Artificial Intelligence': ['Mobile Computing', 'Cyber Security', 'Internet Technologies', 'Business Intelligence and Analytics', 'Data Science'],
  'Cyber Security': ['Data Science', 'Artificial Intelligence', 'Business Intelligence and Analytics', 'Mobile Computing', 'Digital Transformation'],
  'Mobile Computing': ['Data Science', 'Artificial Intelligence', 'Business Intelligence and Analytics', 'Cyber Security', 'Digital Transformation'],
};

export const MINORS = MINOR_PACKAGES.map((m) => m.name);
export const SECOND_MAJOR_NAMES = SECOND_MAJORS.map((m) => m.name);

export interface PlanGroup {
  key: string;
  title: string;
  modules: string[];          // fixed: all required · pool: options to pick from · electives: full catalogue
  pick?: number;              // how many are needed from a pool
  kind: 'fixed' | 'pool' | 'electives';
  note?: string;
}

// The modules a student needs, based on their choices (31 modules / 120 credits on the conventional track).
export function planGroups(p: Plan): PlanGroup[] {
  const g: PlanGroup[] = [
    { key: 'y1', kind: 'fixed', title: 'Year 1 core', modules: Y1_CORE },
    { key: 'ps', kind: 'fixed', title: 'Programme specialisation', modules: PROG_SPEC },
    { key: 'y2', kind: 'fixed', title: 'Year 2 core', modules: Y2_CORE },
  ];
  const spec = SPECIALISATIONS.find((s) => s.title === p.specialisation);
  if (spec) g.push({ key: 'spec', kind: 'fixed', title: `Specialisation · ${spec.title}`, modules: spec.modules });
  const track = YEARS[2].groups.find((t) => t.title === p.track);
  if (track) g.push({ key: 'y3', kind: 'fixed', title: `Year 3 · ${track.title}`, modules: track.modules });
  const UC = coreFor(p.coreVersion);
  const uc = [...UC.all, ...(p.studentType === 'malaysian' ? UC.malaysian : p.studentType === 'international' ? UC.international : [])];
  g.push({ key: 'uc', kind: 'fixed', title: 'University core (MPU)', modules: uc, note: p.studentType ? undefined : 'Choose Malaysian or international in your plan to see the full list.' });
  const fixed = new Set(g.flatMap((x) => x.modules.map((m) => m.toLowerCase())));

  // Complementary study – one choice of 5 modules (or a second major).
  const flex = p.flexible ?? (p.extension && p.extension !== 'none' ? 'extension' : null);
  if (flex === 'extension') {
    const ext = EXTENSION_PACKAGES.find((e) => e.name === p.extension);
    if (ext) {
      const overlap = ext.modules.filter((m) => fixed.has(m.toLowerCase()));
      const pool = ext.modules.filter((m) => !fixed.has(m.toLowerCase()));
      g.push({ key: 'ext', kind: 'pool', title: `Extension · ${ext.name}`, modules: pool, pick: Math.min(ext.pick, pool.length),
        note: overlap.length ? `${overlap.join(', ')} ${overlap.length > 1 ? 'are' : 'is'} already in your programme. Taylor's asks you to replace overlaps with another module from the package, so check with your faculty.` : undefined });
    } else g.push({ key: 'ext', kind: 'pool', title: 'Extension · not chosen', modules: [], pick: 5, note: 'Choose your extension package in My plan.' });
  }
  if (flex === 'electives') {
    const all = ELECTIVE_CLUSTERS.flatMap((c) => c.modules).filter((m) => !fixed.has(m.toLowerCase()));
    g.push({ key: 'elec', kind: 'electives', title: 'Free electives', modules: [...new Set(all)], pick: ELECTIVES_NEEDED,
      note: 'Pick 5 across the three clusters (AHSS, BSM, STS), ideally at least one from each.' });
  }
  if (flex === 'minor') {
    const mi = MINOR_PACKAGES.find((m) => m.name === p.minor);
    g.push(mi ? { key: 'minor', kind: 'pool', title: `Minor · ${mi.name}`, modules: mi.modules.filter((m) => !fixed.has(m.toLowerCase())), pick: mi.pick, note: mi.note }
      : { key: 'minor', kind: 'pool', title: 'Minor · not chosen', modules: [], pick: 5, note: 'Choose your minor in My plan.' });
  }
  if (flex === 'second-major') {
    const sm = SECOND_MAJORS.find((m) => m.name === p.secondMajor);
    g.push(sm ? { key: 'sm', kind: 'pool', title: `Second major · ${sm.name}`, modules: sm.modules, pick: sm.pick, note: sm.note }
      : { key: 'sm', kind: 'pool', title: 'Second major · not chosen', modules: [], pick: 12, note: 'Choose your second major in My plan.' });
  }
  return g;
}

export interface GroupProgress { group: PlanGroup; takenNames: string[]; remaining: string[]; needed: number; total: number }

// Works out what's left in each group, given the module names already in your semesters.
export function progress(groups: PlanGroup[], takenLower: Set<string>, electivePicks: string[] = []): GroupProgress[] {
  const claimed = new Set<string>();
  return groups.map((group) => {
    const inGroup = group.modules.filter((m) => takenLower.has(m.toLowerCase()) && !claimed.has(m.toLowerCase()));
    inGroup.forEach((m) => claimed.add(m.toLowerCase()));
    if (group.kind === 'fixed') {
      const remaining = group.modules.filter((m) => !takenLower.has(m.toLowerCase()));
      return { group, takenNames: inGroup, remaining, needed: remaining.length, total: group.modules.length };
    }
    const pick = group.pick ?? 0;
    const needed = Math.max(0, pick - inGroup.length);
    let options = group.modules.filter((m) => !takenLower.has(m.toLowerCase()));
    if (group.kind === 'electives') {
      const picks = electivePicks.filter((m) => !takenLower.has(m.toLowerCase()));
      options = needed ? picks : [];
    }
    return { group, takenNames: inGroup.slice(0, pick), remaining: needed ? options : [], needed, total: pick };
  });
}

// Starting assessment split for a new module (edit per module)
export const DEFAULT_ASSESSMENTS = [
  { name: 'Mid Term', weight: 30 },
  { name: 'Group Project', weight: 30 },
  { name: 'Final', weight: 40 },
];

// Year level of a module, for Taylor's WGPA weighting (Year 1 = 20%, Year 2 = 30%, Year 3 = 50%).
// Programme modules use the year the programme structure lists them in; specialisation modules are Year 2.
// Specialisation-category modules count as Year 2 even when taken in Year 1 (e.g. Advanced Programming).
const LEVELS = new Map<string, 1 | 2 | 3>();
Y1_CORE.forEach((m) => LEVELS.set(m.toLowerCase(), 1));
[...PROG_SPEC, ...Y2_CORE].forEach((m) => LEVELS.set(m.toLowerCase(), 2));
SPECIALISATIONS.forEach((sp) => sp.modules.forEach((m) => { if (!LEVELS.has(m.toLowerCase())) LEVELS.set(m.toLowerCase(), 2); }));
YEARS[2].groups.forEach((g) => g.modules.forEach((m) => LEVELS.set(m.toLowerCase(), 3)));
[...UNIVERSITY_CORE_EARLIER.all, ...UNIVERSITY_CORE_EARLIER.malaysian, ...UNIVERSITY_CORE_EARLIER.international].forEach((m) => LEVELS.set(m.toLowerCase(), 1));
LEVELS.set('bahasa kebangsaan a', 2);

export const YEAR_WEIGHT: Record<1 | 2 | 3, number> = { 1: 0.2, 2: 0.3, 3: 0.5 };

export function semesterYear(name: string): 1 | 2 | 3 | null {
  const m = name.match(/year\s*(\d)/i);
  if (!m) return null;
  return Math.min(3, Math.max(1, Number(m[1]))) as 1 | 2 | 3;
}

// Automatic level: the programme structure first, otherwise the year of the semester it's in.
export function autoLevel(moduleName: string, semesterName: string, code?: string): 1 | 2 | 3 {
  const n = canonName(moduleName, code);
  const exact = LEVELS.get(n);
  if (exact) return exact;
  // Close matches, e.g. "Statistical Inference" for "Statistical Inference and Modelling".
  if (n.length >= 8) for (const [k, v] of LEVELS) if (k.startsWith(n) || n.startsWith(k)) return v;
  return semesterYear(semesterName) ?? 1;
}
