export type Letter = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D+' | 'D' | 'D-' | 'F';

export interface Assessment {
  id: string;
  name: string;
  weight: number;          // % of module total, e.g. 30
  score: number | null;    // what you got
  outOf: number | null;    // what it was marked out of (defaults to weight)
}

export interface Module {
  id: string;
  code?: string;
  name: string;
  credits: number;
  countsInGPA: boolean;
  exempt?: boolean;            // exempted through credit transfer – earns credits, no grade
  yearLevel?: 1 | 2 | 3 | null; // module's year level for WGPA weighting (null = automatic)
  assessments: Assessment[];
  transcript: Letter | null;   // official letter grade once released
  target: Letter | null;
  expected?: Letter | null;
  retakeOf?: string | null;    // id of the failed attempt this module retakes    // your own predicted grade, used when there are no marks yet
}

export interface Semester {
  id: string;
  name: string;
  modules: Module[];
  officialCGPA?: number | null;     // CGPA printed on transcript after this semester
  officialCredits?: number | null;  // total credits printed on transcript after this semester
  transcriptWGPA?: number | null;   // semester WGPA printed on transcript (for checking)
}

export interface Settings {
  roundMarks: boolean;
  sheetUrl: string;
  sheetKey: string;
  autoSync: boolean;
  creditsToGraduate: number | null;
  yearWeighting: boolean;       // Taylor's WGPA/WCGPA (20:30:50 by year level)
}

export type Flexible = 'extension' | 'electives' | 'minor' | 'second-major';

export interface Plan {
  studentType: 'malaysian' | 'international' | null;
  specialisation: string | null;
  track: string | null;
  extension: string | null;      // extension package name, or 'none'
  flexible: Flexible | null;
  minor: string | null;
  secondMajor: string;
  electives: string[];          // free electives you plan to take
  coreVersion?: 'current' | 'earlier'; // which university core list applies to your intake
}

export interface AppData {
  version: 1;
  semesters: Semester[];
  settings: Settings;
  plan: Plan;
  updatedAt: string;
}
