import { useRef, useState } from 'react';
import type { AppData } from '../types';
import { NumInput, Toggle } from '../ui';
import { emptyData, normalise, type SyncState } from '../store';
import { pullFromSheet } from '../sync';
import { SyncDot } from './Home';

export function Settings({ data, update, replace, sync, syncNow }: {
  data: AppData; update: (fn: (d: AppData) => void) => void; replace: (d: AppData | null) => void; sync: SyncState; syncNow: () => void;
}) {
  const s = data.settings;
  const set = <K extends keyof AppData['settings']>(k: K, v: AppData['settings'][K]) => update((d) => { d.settings[k] = v; });
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const restore = async () => {
    if (!confirm('Replace everything in the app with the copy saved in your Google Sheet?')) return;
    setMsg('Loading…');
    try {
      const got = await pullFromSheet(s.sheetUrl, s.sheetKey);
      if (!got) { setMsg('The sheet has no saved data yet.'); return; }
      const d = normalise(got); d.settings = { ...d.settings, sheetUrl: s.sheetUrl, sheetKey: s.sheetKey };
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
      d.settings = { ...d.settings, sheetUrl: s.sheetUrl || d.settings.sheetUrl, sheetKey: s.sheetKey };
      replace(d); setMsg(`Imported ${d.semesters.length} semesters.`);
    } catch { setMsg("That file couldn't be read."); }
  };

  return (
    <div className="page">
      <div className="page-title"><h1>Settings</h1></div>

      <div className="section-head"><h2>Google Sheet</h2><SyncDot sync={sync} /></div>
      <div className="card pad">
        <label className="field"><span>Apps Script web app link</span>
          <input className="text" placeholder="https://script.google.com/macros/s/…/exec" value={s.sheetUrl} onChange={(e) => set('sheetUrl', e.target.value.trim())} /></label>
        <label className="field"><span>Sync password</span>
          <input className="text" type="password" placeholder="Same as SECRET in the script" value={s.sheetKey} onChange={(e) => set('sheetKey', e.target.value)} /></label>
        <Toggle on={s.autoSync} onChange={(v) => set('autoSync', v)} label="Sync automatically after each change" />
        <div className="btn-row">
          <button className="primary" disabled={!s.sheetUrl} onClick={syncNow}>Sync now</button>
          <button className="secondary" disabled={!s.sheetUrl} onClick={restore}>Restore from Sheet</button>
        </div>
        {sync.status === 'error' && <p className="warn">{sync.error}</p>}
        <details className="howto">
          <summary>How to link a sheet</summary>
          <ol>
            <li>Create a Google Sheet, then open <b>Extensions → Apps Script</b>.</li>
            <li>Paste in the <code>Code.gs</code> file that came with the app. Change <code>SECRET</code> to a password of your choice.</li>
            <li><b>Deploy → New deployment → Web app</b>. Set "Execute as" to <b>Me</b> and "Who has access" to <b>Anyone</b>.</li>
            <li>Copy the link ending in <code>/exec</code> into the box above, and type the same password.</li>
          </ol>
          <p className="hint">The sheet gets Overview, Modules and Assessments tabs, which are rewritten on every sync. A hidden tab keeps a full copy for restoring.</p>
        </details>
      </div>

      <div className="section-head"><h2>Grading</h2></div>
      <div className="card">
        <Toggle on={s.roundMarks} onChange={(v) => set('roundMarks', v)} label="Round total mark before grading (79.5 → A)" />
      </div>
      <label className="field"><span>Credits needed to graduate (optional)</span>
        <NumInput value={s.creditsToGraduate} onChange={(v) => set('creditsToGraduate', v)} placeholder="Check your programme handbook" /></label>

      <div className="section-head"><h2>Data</h2></div>
      <div className="card pad">
        <p className="hint tight">Your grades are saved on this device. Keep a backup with Google Sheet sync or a file export.</p>
        <div className="btn-row">
          <button className="secondary" onClick={exportJson}>Export file</button>
          <button className="secondary" onClick={() => file.current?.click()}>Import file</button>
        </div>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }} />
        <button className="danger" onClick={() => { if (confirm('Erase all grades on this device? Your Google Sheet is not touched.')) replace(emptyData()); }}>Erase all data</button>
      </div>
      {msg && <p className="toast" onAnimationEnd={() => setMsg('')}>{msg}</p>}
    </div>
  );
}
