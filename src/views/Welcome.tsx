import { useRef, useState } from 'react';
import type { AppData } from '../types';
import { emptyData, newSemester, normalise } from '../store';
import { pullFromSheet } from '../sync';
import { SEMESTER_TEMPLATE } from '../taylors';

export function Welcome({ replace }: { replace: (d: AppData) => void }) {
  const [mode, setMode] = useState<'menu' | 'sheet'>('menu');
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [err, setErr] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const startTemplate = () => {
    const d = emptyData();
    d.semesters = SEMESTER_TEMPLATE.map(newSemester);
    replace(d);
  };
  const fromSheet = async () => {
    setErr('');
    try {
      const got = await pullFromSheet(url.trim(), key);
      const d = got ? normalise(got) : emptyData();
      d.settings = { ...d.settings, sheetUrl: url.trim(), sheetKey: key };
      replace(d);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not reach the sheet'); }
  };

  return (
    <div className="page welcome">
      <img className="welcome-mark" src="/logo-mark.png" alt="" width="72" height="72" />
      <h1>Grade Tracker</h1>
      <p className="muted">Predict your grades, add transcript results when they're out, and track your CGPA. Built around Taylor's University grading.</p>

      {mode === 'menu' ? (
        <div className="welcome-actions">
          <button className="primary" onClick={startTemplate}>Start with Taylor's 3-year plan</button>
          <button className="secondary" onClick={() => replace(emptyData())}>Start blank</button>
          <button className="secondary" onClick={() => setMode('sheet')}>Restore from Google Sheet</button>
          <button className="link" onClick={() => file.current?.click()}>Import a backup file</button>
          <input ref={file} type="file" accept=".json,application/json" hidden onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            try { replace(normalise(JSON.parse(await f.text()))); } catch { setErr("That file couldn't be read."); }
          }} />
        </div>
      ) : (
        <div className="welcome-actions">
          <input className="text" placeholder="Apps Script link (…/exec)" value={url} onChange={(e) => setUrl(e.target.value)} />
          <input className="text" type="password" placeholder="Sync password" value={key} onChange={(e) => setKey(e.target.value)} />
          <button className="primary" disabled={!url.trim()} onClick={fromSheet}>Connect</button>
          <button className="link" onClick={() => setMode('menu')}>Back</button>
        </div>
      )}
      {err && <p className="warn">{err}</p>}
    </div>
  );
}
