import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { AppData } from '../types';
import { ACCENTS, MENU_COLORS, MenuGroup, MenuRow, NumInput, SaveBar, Toggle, TopBar } from '../ui';
import { emptyData, newSemester, normalise, useDraft, type SyncState } from '../store';
import { SEMESTER_TEMPLATE } from '../taylors';
import { pullFromSheet } from '../sync';
import { currentSemester } from '../grading';
import { SyncDot } from './Home';

export function Settings({ data, update, replace, sync, syncNow, section, go }: {
  data: AppData; update: (fn: (d: AppData) => void) => void; replace: (d: AppData | null) => void; sync: SyncState; syncNow: () => void;
  section?: string; go: (h: string) => void;
}) {
  const saved = data.settings;
  const { draft: s, edit, dirty, reset } = useDraft(saved, 'settings');
  const set = <K extends keyof AppData['settings']>(k: K, v: AppData['settings'][K]) => edit((d) => { d[k] = v; });
  const save = () => update((d) => { d.settings = structuredClone(s); });
  useEffect(() => () => { document.documentElement.dataset.accent = data.settings.accent ?? 'green'; }, [data.settings.accent]);
  const autoCur = currentSemester({ ...data, settings: { ...data.settings, currentSemesterId: null } });
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const restore = async () => {
    if (!confirm('Replace everything in the app with the copy saved in your Google Sheet?')) return;
    setMsg('Loading…');
    try {
      const got = await pullFromSheet(saved.sheetUrl, saved.sheetKey);
      if (!got) { setMsg('The sheet has no saved data yet.'); return; }
      const d = normalise(got); d.settings = { ...d.settings, sheetUrl: saved.sheetUrl, sheetKey: saved.sheetKey };
      replace(d); setMsg('Restored from Google Sheet.');
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not reach the sheet.'); }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ ...data, settings: { ...data.settings, sheetKey: '' } }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `grades-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (f: File) => {
    try {
      const d = normalise(JSON.parse(await f.text()));
      d.settings = { ...d.settings, sheetUrl: saved.sheetUrl || d.settings.sheetUrl, sheetKey: saved.sheetKey };
      replace(d); setMsg(`Imported ${d.semesters.length} semesters.`);
    } catch { setMsg("That file couldn't be read."); }
  };

  const useTemplate = () => {
    const have = new Set(data.semesters.map((x) => x.name));
    const missing = SEMESTER_TEMPLATE.filter((n) => !have.has(n));
    if (!missing.length) { setMsg('All template semesters are already there.'); return; }
    if (data.semesters.length && !confirm(`Add ${missing.length} missing semester${missing.length === 1 ? '' : 's'} from the 3-year plan? Your existing grades are kept.`)) return;
    update((d) => {
      const byName = new Map(d.semesters.map((x) => [x.name, x]));
      const ordered = SEMESTER_TEMPLATE.map((n) => byName.get(n) ?? newSemester(n));
      const extras = d.semesters.filter((x) => !SEMESTER_TEMPLATE.includes(x.name));
      d.semesters = [...ordered, ...extras];
    });
    setMsg(`Added ${missing.length} semester${missing.length === 1 ? '' : 's'}.`);
  };

  const startBlank = () => {
    if (!confirm('Erase all semesters and grades on this device? Your Google Sheet link and plan are kept, and the sheet itself is not touched.')) return;
    const d = emptyData(); d.settings = structuredClone(saved); d.plan = structuredClone(data.plan);
    replace(d); setMsg('All grades erased.');
  };

  const sub = (title: string, body: ReactNode) => (
    <div className="page">
      <TopBar back={() => go('#/settings')} title={title} />
      {body}
      <SaveBar show={dirty} onSave={save} onDiscard={() => { reset(); document.documentElement.dataset.accent = data.settings.accent ?? 'green'; }} />
      {msg && <p className="toast" onAnimationEnd={() => setMsg('')}>{msg}</p>}
    </div>
  );
  const ACCENT_NAMES: Record<string, string> = { green: 'Green', orange: 'Orange', purple: 'Purple', blue: 'Blue' };
  const syncLabel = !saved.sheetUrl ? 'Not linked' : sync.status === 'error' ? 'Sync failed' : sync.status === 'ok' ? 'Synced' : 'Linked';

  if (section === 'sheet') return sub('Google Sheet', <>
    <div className="card pad">
      <label className="field"><span>Apps Script web app link</span>
        <input className="text" placeholder="https://script.google.com/macros/s/…/exec" value={s.sheetUrl} onChange={(e) => set('sheetUrl', e.target.value.trim())} /></label>
      <label className="field"><span>Sync password</span>
        <input className="text" type="password" placeholder="Same as SECRET in the script" value={s.sheetKey} onChange={(e) => set('sheetKey', e.target.value)} /></label>
      <Toggle on={s.autoSync} onChange={(v) => set('autoSync', v)} label="Sync automatically when you save" />
      <div className="btn-row">
        <button className="primary" disabled={!saved.sheetUrl || dirty} onClick={syncNow}>Sync now</button>
        <button className="secondary" disabled={!saved.sheetUrl || dirty} onClick={restore}>Restore from Sheet</button>
      </div>
      {dirty && <p className="form-note">Save your changes before syncing.</p>}
      {sync.status === 'error' && <p className="warn">{sync.error}</p>}
      <div style={{ marginTop: 12 }}><SyncDot sync={sync} /></div>
    </div>
    <details className="howto card pad">
      <summary>How to link a sheet</summary>
      <ol>
        <li>Create a Google Sheet, then open <b>Extensions → Apps Script</b>.</li>
        <li>Paste in the <code>Code.gs</code> file that came with the app. Change <code>SECRET</code> to a password of your choice.</li>
        <li><b>Deploy → New deployment → Web app</b>. Set "Execute as" to <b>Me</b> and "Who has access" to <b>Anyone</b>.</li>
        <li>Copy the link ending in <code>/exec</code> into the box above, and type the same password.</li>
      </ol>
      <p className="hint">The sheet gets Overview, Modules and Assessments tabs, which are rewritten on every sync. A hidden tab keeps a full copy for restoring.</p>
    </details>
  </>);

  if (section === 'colour') return sub('Colour', <>
    <div className="card pad">
      <div className="swatches">
        {(Object.keys(ACCENTS) as (keyof typeof ACCENTS)[]).map((k) => (
          <button key={k} className={`swatch ${(s.accent ?? 'green') === k ? 'on' : ''}`} style={{ background: ACCENTS[k] }} aria-label={k}
            onClick={() => { set('accent', k); document.documentElement.dataset.accent = k; }} />
        ))}
      </div>
    </div>
    <p className="hint">Used for the summary card, buttons and highlights. Light and dark mode follow your phone.</p>
  </>);

  if (section === 'semester') return sub('Current semester', <>
    <label className="field"><span>Shown first on the Grades screen</span>
      <select className="text" value={s.currentSemesterId ?? ''} onChange={(e) => set('currentSemesterId', e.target.value || null)}>
        <option value="">Automatic{autoCur ? ` (${autoCur.name})` : ''}</option>
        {data.semesters.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select></label>
    <p className="hint">Automatic picks the first semester that isn't fully confirmed yet.</p>
  </>);

  if (section === 'grading') return sub('Grading', <>
    <div className="card">
      <Toggle on={s.roundMarks} onChange={(v) => set('roundMarks', v)} label="Round total mark before grading (79.5 → A)" />
      <Toggle on={s.yearWeighting !== false} onChange={(v) => set('yearWeighting', v)} label="Year-level weighting (WGPA / WCGPA)" />
    </div>
    <p className="hint">Taylor's bachelor's degrees from January 2021 intakes use WGPA and WCGPA, which weight Year 1, 2 and 3 modules at 20%, 30% and 50%. Turn this off for plain credit-weighted GPA and CGPA.</p>
    <label className="field"><span>Credits needed to graduate (optional)</span>
      <NumInput value={s.creditsToGraduate} onChange={(v) => set('creditsToGraduate', v)} placeholder="e.g. 120" /></label>
  </>);

  if (section === 'data') return sub('Backup and reset', <>
    <div className="section-head"><h2>Backup</h2></div>
    <div className="card pad">
      <p className="hint tight">Your grades are saved on this device. Keep a backup with Google Sheet sync or a file export.</p>
      <div className="stack">
        <button className="secondary" onClick={exportJson}>Export backup file</button>
        <button className="secondary" onClick={() => file.current?.click()}>Import a backup file</button>
      </div>
      <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }} />
    </div>
    <div className="section-head"><h2>Start over</h2></div>
    <div className="card pad">
      <p className="hint tight">The same options as the welcome screen. Your Google Sheet link and plan are kept.</p>
      <div className="stack">
        <button className="primary" onClick={useTemplate}>Use Taylor's 3-year plan</button>
        <button className="secondary" disabled={!saved.sheetUrl || dirty} onClick={restore}>Restore from Google Sheet</button>
        <button className="secondary" onClick={startBlank}>Start blank</button>
      </div>
      <button className="danger" onClick={startBlank}>Erase all data</button>
    </div>
  </>);

  const cur = autoCur && !s.currentSemesterId ? `Automatic · ${autoCur.name}` : data.semesters.find((x) => x.id === s.currentSemesterId)?.name ?? 'Automatic';
  return (
    <div className="page">
      <div className="page-title big"><h1>Settings</h1></div>
      <MenuGroup>
        <MenuRow icon="cloud" color={MENU_COLORS.blue} title="Google Sheet" sub={syncLabel} onClick={() => go('#/settings/sheet')} />
        <MenuRow icon="archive" color={MENU_COLORS.indigo} title="Backup and reset" sub="Export, import, start over" onClick={() => go('#/settings/data')} />
      </MenuGroup>
      <MenuGroup>
        <MenuRow icon="clock" color={MENU_COLORS.orange} title="Current semester" sub={cur} onClick={() => go('#/settings/semester')} />
        <MenuRow icon="sliders" color={MENU_COLORS.purple} title="Grading" sub={`${s.yearWeighting !== false ? 'WGPA weighting on' : 'Plain GPA'} · rounding ${s.roundMarks ? 'on' : 'off'}`} onClick={() => go('#/settings/grading')} />
      </MenuGroup>
      <MenuGroup>
        <MenuRow icon="palette" color={MENU_COLORS.pink} title="Colour" sub={ACCENT_NAMES[s.accent ?? 'green']} onClick={() => go('#/settings/colour')} />
      </MenuGroup>
      <p className="hint" style={{ textAlign: 'center', marginTop: 24 }}>Grade Tracker · version {__APP_VERSION__}</p>
      <SaveBar show={dirty} onSave={save} onDiscard={() => { reset(); document.documentElement.dataset.accent = data.settings.accent ?? 'green'; }} />
      {msg && <p className="toast" onAnimationEnd={() => setMsg('')}>{msg}</p>}
    </div>
  );
}
