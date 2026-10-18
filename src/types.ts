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
  assessments: Assessment[];
  transcript: Letter | null;   // official letter grade once released
  target: Letter | null;
}

export interface Semester {
  id: string;
  name: string;
  modules: Module[];
  officialCGPA?: number | null;     // CGPA printed on transcript after this semester
  officialCredits?: number | null;  // total credits printed on transcript after this semester
}

export interface Settings {
  roundMarks: boolean;
  sheetUrl: string;
  sheetKey: string;
  autoSync: boolean;
  creditsToGraduate: number | null;
}

export interface AppData {
  version: 1;
  semesters: Semester[];
  settings: Settings;
  updatedAt: string;
}
