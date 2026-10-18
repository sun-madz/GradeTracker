// Programme information for Taylor's University – Bachelor of Computer Science (Honours).
// Source: university.taylors.edu.my programme page (checked Oct 2026). Information is subject to change.
// Credit values are defaults (4 for most modules) – edit them in the app if your transcript differs.

export interface LibModule { name: string; group: string; credits: number }

export const PROGRAMME = {
  name: "Bachelor of Computer Science (Honours)",
  school: 'School of Computer Science',
  duration: '3 years, full time',
  intakes: 'February, April, September',
  calendar:
    "Each year has two long semesters plus a shorter one (the April term). Most students label them Sem 1, Short Sem and Sem 2.",
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
export const SEMESTER_TEMPLATE = ['Y1 S1', 'Y1 Short', 'Y1 S2', 'Y2 S1', 'Y2 Short', 'Y2 S2', 'Y3 S1', 'Y3 Short', 'Y3 S2'];

// Starting assessment split for a new module (edit per module)
export const DEFAULT_ASSESSMENTS = [
  { name: 'Mid Term', weight: 30 },
  { name: 'Group Project', weight: 30 },
  { name: 'Final', weight: 40 },
];
