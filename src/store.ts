import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppData, Assessment, Module, Semester } from './types';
import { pushToSheet } from './sync';
import { DEFAULT_ASSESSMENTS } from './taylors';

const KEY = 'grade-tracker-v1';

export const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyData = (): AppData => ({
  version: 1,
  semesters: [],
  settings: { roundMarks: false, sheetUrl: '', sheetKey: '', autoSync: true, creditsToGraduate: null },
  updatedAt: new Date().toISOString(),
});

export function newModule(name: string, credits = 4, withDefaults = true): Module {
  return {
    id: uid(), name, credits, countsInGPA: true, transcript: null, target: null,
    assessments: withDefaults ? DEFAULT_ASSESSMENTS.map((a) => ({ id: uid(), name: a.name, weight: a.weight, score: null, outOf: null })) : [],
  };
}

export const newSemester = (name: string): Semester => ({ id: uid(), name, modules: [], officialCGPA: null, officialCredits: null });

// Fill in anything missing so older / hand-edited files still load.
export function normalise(raw: unknown): AppData {
  const base = emptyData();
  const d = (raw ?? {}) as Partial<AppData>;
  return {
    version: 1,
    settings: { ...base.settings, ...(d.settings ?? {}) },
    updatedAt: d.updatedAt ?? base.updatedAt,
    semesters: (d.semesters ?? []).map((s) => ({
      ...newSemester(s.name ?? 'Semester'), ...s, id: s.id ?? uid(),
      modules: (s.modules ?? []).map((m) => ({
        ...newModule(m.name ?? 'Module', 4, false), ...m, id: m.id ?? uid(),
        assessments: (m.assessments ?? []).map((a: Partial<Assessment>) => ({ id: uid(), name: '', weight: 0, score: null, outOf: null, ...a })),
      })),
    })),
  };
}

function load(): AppData | null {
  try {
    const s = localStorage.getItem(KEY);
    return s ? normalise(JSON.parse(s)) : null;
  } catch { return null; }
}

export type SyncState = { status: 'off' | 'idle' | 'pending' | 'syncing' | 'ok' | 'error'; at?: string; error?: string };

export function useStore() {
  const [data, setData] = useState<AppData | null>(() => load());
  const [sync, setSync] = useState<SyncState>({ status: 'off' });
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef(data);
  latest.current = data;

  useEffect(() => {
    if (!data) return;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
  }, [data]);

  const syncNow = useCallback(async () => {
    const d = latest.current;
    if (!d?.settings.sheetUrl) { setSync({ status: 'off' }); return; }
    setSync({ status: 'syncing' });
    try {
      await pushToSheet(d);
      setSync({ status: 'ok', at: new Date().toISOString() });
    } catch (e) {
      setSync({ status: 'error', error: e instanceof Error ? e.message : String(e) });
    }
  }, []);

  const schedule = useCallback((d: AppData) => {
    if (!d.settings.sheetUrl || !d.settings.autoSync) return;
    setSync((s) => ({ ...s, status: 'pending' }));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(syncNow, 2500);
  }, [syncNow]);

  const update = useCallback((fn: (d: AppData) => void) => {
    setData((prev) => {
      const next = structuredClone(prev ?? emptyData());
      fn(next);
      next.updatedAt = new Date().toISOString();
      schedule(next);
      return next;
    });
  }, [schedule]);

  const replace = useCallback((d: AppData | null) => { setData(d); if (d) schedule(d); }, [schedule]);

  // Retry a pending sync when the phone comes back online.
  useEffect(() => {
    const on = () => { if (latest.current?.settings.sheetUrl) syncNow(); };
    window.addEventListener('online', on);
    return () => window.removeEventListener('online', on);
  }, [syncNow]);

  return { data, update, replace, sync, syncNow };
}
