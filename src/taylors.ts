// Programme information for Taylor's University – Bachelor of Computer Science (Honours).
// Source: university.taylors.edu.my programme page (checked Oct 2026). Information is subject to change.
// Credit values are defaults (4 for most modules) – edit them in the app if your transcript differs.

import type { Plan } from './types';
import { ELECTIVE_CLUSTERS, ELECTIVES_NEEDED, EXTENSION_PACKAGES, MINOR_PACKAGES, SECOND_MAJORS } from './flexible';

export interface LibModule { name: string; group: string; credits: number; code?: string }

export const PROGRAMME = {
  name: "Bachelor of Computer Science (Honours)",
  school: 'School of Computer Science',
  duration: '3 years, full time',
  intakes: 'February, April, September',
  calendar:
    "Taylor's doesn't publish a semester count. The suggested plan uses two long semesters and one short semester per year, and you can rename or remove any of them.",
  source: 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html',
};

const core = (names: string[], group: string, credits = 4): LibModule[] => names.map((name) => ({ name, group, credits, code: KNOWN_CODES[name.toLowerCase()] }));

export const YEARS: { title: string; groups: { title: string; modules: string[] }[] }[] = [
  {
    title: 'Year 1 · Common core',
    groups: [{
      title: 'Core',
      modules: ['Database Systems', 'Computer Architecture and Organisation', 'Object Oriented Programming', 'Discrete Structures',
        'Principles of Software Engineering', 'Systems Analysis and Design', 'Data Structures and Algorithms', 'Operating Systems', 'Advanced Programming'],
    }],
  },
  {
    title: 'Year 2',
    groups: [{ title: 'Core', modules: ['Computer Networks', 'Machine Learning and Intelligent System', 'Ideating Start-up'] },
      { title: 'Plus', modules: ['Your specialisation modules (below)'] }],
  },
  {
    title: 'Year 3 · Pick one track',
    groups: [
      { title: 'Conventional', modules: ['Capstone Project I', 'Capstone Project II', 'Human Computer Interaction', 'Professional Practices and Information Security'] },
      { title: 'Work-Based Learning', modules: ['Human Computer Interaction', 'Professional Practices and Information Security', 'Industrial Project I', 'Industrial Project II'] },
      { title: 'Technopreneurship', modules: ['Human Computer Interaction', 'Technopreneurship Project I', 'Professional Practices and Information Security', 'Technopreneurship Project II'] },
    ],
  },
];

export const SPECIALISATIONS: { title: string; modules: string[] }[] = [
  { title: 'Data Science', modules: ['Statistical Inference and Modelling', 'Data Science Principles', 'Data Mining', 'Big Data Technologies'] },
  { title: 'Artificial Intelligence', modules: ['Computer Vision and Natural Language Processing', 'Data Analytics and Machine Learning', 'Cognitive Computing and Applications', 'Big Data Technologies'] },
  { title: 'Cyber Security', modules: ['Computer and Network Security', 'Computer Intrusion Detection', 'Computer Crime and Digital Evidence', 'Wireless Networks and Security'] },
  { title: 'Mobile Computing', modules: ['Introduction to Mobile Computing', 'Mobile Applications Development', 'Wireless Networks and Security', 'Internet of Things'] },
];

// University core (MPU) – the current list on Taylor's website…
export const UNIVERSITY_CORE = {
  all: ['Kursus Integriti dan Antirasuah', 'Emotional Intelligence in Action', 'Youth and Leadership in Malaysia', 'Community Impact and Engagement'],
  malaysian: ['Falsafah dan Cabaran Semasa', 'Aspirasi Negara Bangsa'],
  international: ['Bahasa Melayu Komunikasi 2', 'Citra Malaysia'],
};
// …and the list for earlier intakes (includes Social Innovation Project).
export const UNIVERSITY_CORE_EARLIER = {
  all: ['Falsafah dan Isu Semasa', 'Emotional Intelligence in Action', 'Kursus Integriti dan Antirasuah', 'Social Innovation Project'],
  malaysian: ['Penghayatan Etika dan Peradaban'],
  international: ['Bahasa Melayu Komunikasi 2'],
};
export const coreFor = (v?: 'current' | 'earlier') => (v === 'earlier' ? UNIVERSITY_CORE_EARLIER : UNIVERSITY_CORE);

// Module codes known so far. Codes can change between intakes, so they're only suggestions – edit them in the app.
export const KNOWN_CODES: Record<string, string> = {
  'data structures and algorithms': 'ITS60504',
  'systems analysis and design': 'CSC61404',
  'machine learning and intelligent system': 'CSC61304',
  'statistical inference and modelling': 'ITS66804',
  'computer vision and natural language processing': 'ITS69204',
  'internet of things': 'ITS67404',
};
export const codeFor = (name: string) => KNOWN_CODES[name.trim().toLowerCase()];

export const FLEXIBLE = [
  'Choose one: five free electives, a minor (5 modules) or a second major (12 modules)',
  'Plus an extension package of 5 modules, which must be different from your specialisation',
];

const uniq = (l: LibModule[]) => l.filter((m, i) => l.findIndex((x) => x.name === m.name) === i);

export const LIBRARY: LibModule[] = uniq([
  ...core(YEARS[0].groups[0].modules, 'Year 1 core'),
  ...core(YEARS[1].groups[0].modules, 'Year 2 core'),
  ...YEARS[2].groups.flatMap((g) => core(g.modules, `Year 3 · ${g.title}`)),
  ...SPECIALISATIONS.flatMap((s) => core(s.modules, `Specialisation · ${s.title}`)),
  ...core([...UNIVERSITY_CORE.all, ...UNIVERSITY_CORE.malaysian, ...UNIVERSITY_CORE.international, 'Bahasa Kebangsaan A'], 'University core'),
  ...core([...UNIVERSITY_CORE_EARLIER.all, ...UNIVERSITY_CORE_EARLIER.malaysian], 'University core · earlier intakes'),
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

// The modules a student needs, based on their choices.
export function planGroups(p: Plan): PlanGroup[] {
  const g: PlanGroup[] = [
    { key: 'y1', kind: 'fixed', title: 'Year 1 core', modules: YEARS[0].groups[0].modules },
    { key: 'y2', kind: 'fixed', title: 'Year 2 core', modules: YEARS[1].groups[0].modules },
  ];
  const spec = SPECIALISATIONS.find((s) => s.title === p.specialisation);
  if (spec) g.push({ key: 'spec', kind: 'fixed', title: `Specialisation · ${spec.title}`, modules: spec.modules });
  const fixedSoFar = new Set(g.flatMap((x) => x.modules.map((m) => m.toLowerCase())));
  if (p.extension && p.extension !== 'none') {
    const ext = EXTENSION_PACKAGES.find((e) => e.name === p.extension);
    if (ext) {
      const overlap = ext.modules.filter((m) => fixedSoFar.has(m.toLowerCase()));
      const pool = ext.modules.filter((m) => !fixedSoFar.has(m.toLowerCase()));
      g.push({ key: 'ext', kind: 'pool', title: `Extension · ${ext.name}`, modules: pool, pick: Math.min(ext.pick, pool.length),
        note: overlap.length ? `${overlap.join(', ')} ${overlap.length > 1 ? 'are' : 'is'} already in your programme. Taylor's asks you to replace overlaps with another module from the package, so check with your faculty.` : undefined });
    }
  }
  const track = YEARS[2].groups.find((t) => t.title === p.track);
  if (track) g.push({ key: 'y3', kind: 'fixed', title: `Year 3 · ${track.title}`, modules: track.modules });
  const UC = coreFor(p.coreVersion);
  const uc = [...UC.all, ...(p.studentType === 'malaysian' ? UC.malaysian : p.studentType === 'international' ? UC.international : [])];
  g.push({ key: 'uc', kind: 'fixed', title: 'University core', modules: uc, note: p.studentType ? undefined : 'Choose Malaysian or international in your plan to see the full list.' });
  const taken = new Set(g.filter((x) => x.kind === 'fixed').flatMap((x) => x.modules.map((m) => m.toLowerCase())));
  if (p.flexible === 'electives') {
    const all = ELECTIVE_CLUSTERS.flatMap((c) => c.modules).filter((m) => !taken.has(m.toLowerCase()));
    g.push({ key: 'elec', kind: 'electives', title: 'Free electives', modules: [...new Set(all)], pick: ELECTIVES_NEEDED,
      note: 'Pick 5 across the three clusters (AHSS, BSM, STS), ideally at least one from each.' });
  }
  if (p.flexible === 'minor') {
    const mi = MINOR_PACKAGES.find((m) => m.name === p.minor);
    g.push(mi ? { key: 'minor', kind: 'pool', title: `Minor · ${mi.name}`, modules: mi.modules.filter((m) => !taken.has(m.toLowerCase())), pick: mi.pick, note: mi.note }
      : { key: 'minor', kind: 'pool', title: 'Minor · not chosen', modules: [], pick: 5, note: 'Choose your minor in My plan.' });
  }
  if (p.flexible === 'second-major') {
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
const LEVELS = new Map<string, 1 | 2 | 3>();
YEARS[0].groups[0].modules.forEach((m) => LEVELS.set(m.toLowerCase(), 1));
YEARS[1].groups[0].modules.forEach((m) => LEVELS.set(m.toLowerCase(), 2));
SPECIALISATIONS.forEach((sp) => sp.modules.forEach((m) => { if (!LEVELS.has(m.toLowerCase())) LEVELS.set(m.toLowerCase(), 2); }));
YEARS[2].groups.forEach((g) => g.modules.forEach((m) => LEVELS.set(m.toLowerCase(), 3)));

export const YEAR_WEIGHT: Record<1 | 2 | 3, number> = { 1: 0.2, 2: 0.3, 3: 0.5 };

export function semesterYear(name: string): 1 | 2 | 3 | null {
  const m = name.match(/year\s*(\d)/i);
  if (!m) return null;
  return Math.min(3, Math.max(1, Number(m[1]))) as 1 | 2 | 3;
}

// Automatic level: the programme structure first, otherwise the year of the semester it's in.
export function autoLevel(moduleName: string, semesterName: string): 1 | 2 | 3 {
  return LEVELS.get(moduleName.trim().toLowerCase()) ?? semesterYear(semesterName) ?? 1;
}
