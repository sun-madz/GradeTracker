// Programme information for Taylor's University – Bachelor of Computer Science (Honours).
// Source: university.taylors.edu.my programme page (checked Oct 2026). Information is subject to change.
// Credit values are defaults (4 for most modules) – edit them in the app if your transcript differs.

import type { Plan } from './types';

export interface LibModule { name: string; group: string; credits: number }

export const PROGRAMME = {
  name: "Bachelor of Computer Science (Honours)",
  school: 'School of Computer Science',
  duration: '3 years, full time',
  intakes: 'February, April, September',
  calendar:
    "Taylor's doesn't publish a semester count. The suggested plan uses two long semesters and one short semester per year, and you can rename or remove any of them.",
  source: 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html',
};

const core = (names: string[], group: string, credits = 4): LibModule[] => names.map((name) => ({ name, group, credits }));

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

export const UNIVERSITY_CORE = {
  all: ['Kursus Integriti dan Antirasuah', 'Emotional Intelligence in Action', 'Youth and Leadership in Malaysia', 'Community Impact and Engagement'],
  malaysian: ['Falsafah dan Cabaran Semasa', 'Aspirasi Negara Bangsa'],
  international: ['Bahasa Melayu Komunikasi 2', 'Citra Malaysia'],
};

export const FLEXIBLE = [
  'Five free electives, or one minor, or a second major',
  'One extension package (must differ from your specialisation)',
];

const uniq = (l: LibModule[]) => l.filter((m, i) => l.findIndex((x) => x.name === m.name) === i);

export const LIBRARY: LibModule[] = uniq([
  ...core(YEARS[0].groups[0].modules, 'Year 1 core'),
  ...core(YEARS[1].groups[0].modules, 'Year 2 core'),
  ...YEARS[2].groups.flatMap((g) => core(g.modules, `Year 3 · ${g.title}`)),
  ...SPECIALISATIONS.flatMap((s) => core(s.modules, `Specialisation · ${s.title}`)),
  ...core([...UNIVERSITY_CORE.all, ...UNIVERSITY_CORE.malaysian, ...UNIVERSITY_CORE.international, 'Bahasa Kebangsaan A'], 'University core'),
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

export const MINORS = ['Accounting', 'Advertising and Brand Management', 'Creative Media Design', 'Entrepreneurship', 'Finance',
  'International Business', 'Management', 'Marketing'];

export interface PlanGroup { title: string; modules: string[]; note?: string; slots?: number }

// The modules a student needs, based on their choices.
export function planGroups(p: Plan): PlanGroup[] {
  const g: PlanGroup[] = [
    { title: 'Year 1 core', modules: YEARS[0].groups[0].modules },
    { title: 'Year 2 core', modules: YEARS[1].groups[0].modules },
  ];
  const spec = SPECIALISATIONS.find((s) => s.title === p.specialisation);
  if (spec) g.push({ title: `Specialisation · ${spec.title}`, modules: spec.modules });
  if (p.extension && p.extension !== 'none') {
    const ext = SPECIALISATIONS.find((s) => s.title === p.extension);
    const mods = ext ? ext.modules.filter((m) => !spec?.modules.includes(m)) : [];
    g.push({ title: `Extension · ${p.extension}`, modules: mods,
      note: ext ? undefined : "Taylor's website doesn't list this package's modules. Add them to your semesters as you take them." });
  }
  const track = YEARS[2].groups.find((t) => t.title === p.track);
  if (track) g.push({ title: `Year 3 · ${track.title}`, modules: track.modules });
  const uc = [...UNIVERSITY_CORE.all, ...(p.studentType === 'malaysian' ? UNIVERSITY_CORE.malaysian : p.studentType === 'international' ? UNIVERSITY_CORE.international : [])];
  g.push({ title: 'University core', modules: uc, note: p.studentType ? undefined : 'Choose Malaysian or international in your plan to see the full list.' });
  if (p.flexible === 'electives') g.push({ title: 'Free electives', modules: [], slots: 5, note: 'Choose five from Taylor\'s free electives.' });
  if (p.flexible === 'minor') g.push({ title: `Minor · ${p.minor ?? 'not chosen'}`, modules: [], note: 'Add your minor modules to your semesters as you take them.' });
  if (p.flexible === 'second-major') g.push({ title: `Second major${p.secondMajor ? ` · ${p.secondMajor}` : ''}`, modules: [], note: 'Add your second-major modules to your semesters as you take them.' });
  return g;
}

// Starting assessment split for a new module (edit per module)
export const DEFAULT_ASSESSMENTS = [
  { name: 'Mid Term', weight: 30 },
  { name: 'Group Project', weight: 30 },
  { name: 'Final', weight: 40 },
];
