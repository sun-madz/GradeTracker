import { useState } from 'react';
import type { AppData } from '../types';
import { cumulative, fmt } from '../grading';
import { Chevron, Icon, Sheet } from '../ui';
import { newSemester } from '../store';
import { SEMESTER_TEMPLATE } from '../taylors';
import type { SyncState } from '../store';

export function Home({ data, update, go, sync }: { data: AppData; update: (fn: (d: AppData) => void) => void; go: (h: string) => void; sync: SyncState }) {
  const rows = cumulative(data);
  const last = [...rows].reverse().find((r) => r.cgpa !== null);
  const cgpa = last?.cgpa ?? null;
  const credits = last?.cumCredits ?? 0;
  const anyPredicted = rows.some((r) => r.stats.status === 'predicted');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const goal = data.settings.creditsToGraduate;

  const used = new Set(data.semesters.map((s) => s.name));
  const suggestions = SEMESTER_TEMPLATE.filter((s) => !used.has(s));

  const add = (n: string) => {
    if (!n.trim()) return;
    const s = newSemester(n.trim());
    update((d) => { d.semesters.push(s); });
    setAdding(false); setName('');
    go(`#/s/${s.id}`);
  };

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-label">CGPA <SyncDot sync={sync} /></div>
        <div className="hero-value">{fmt(cgpa)}</div>
        <div className="hero-sub">
          {credits} credits{anyPredicted ? ' · includes predictions' : cgpa !== null ? ' · confirmed' : ''}
        </div>
        {goal ? (
          <div className="progress" aria-label="Credits towards graduation">
            <div className="progress-bar"><span style={{ width: `${Math.min(100, (credits / goal) * 100)}%` }} /></div>
            <div className="progress-text">{credits} / {goal} credits to graduate</div>
          </div>
        ) : null}
      </div>

      <div className="section-head"><h2>Semesters</h2></div>
      {rows.length === 0 && <p className="empty">No semesters yet. Add your first one below.</p>}
      <div className="list">
        {rows.map((r) => (
          <button key={r.semester.id} className="card row-card" onClick={() => go(`#/s/${r.semester.id}`)}>
            <div className="rc-main">
              <div className="rc-title">{r.semester.name}</div>
              <div className="rc-sub">
                {r.stats.modules} module{r.stats.modules === 1 ? '' : 's'} · {r.stats.credits} cr
                {r.stats.status === 'final' && <span className="tag ok">Final</span>}
                {r.stats.status === 'predicted' && <span className="tag">Predicted</span>}
                {r.official && <span className="tag ok">Official CGPA</span>}
              </div>
            </div>
            <div className="rc-value">
              <div className="rc-num">{fmt(r.stats.gpa)}</div>
              <div className="rc-cap">GPA</div>
            </div>
            <Chevron />
          </button>
        ))}
      </div>
      <button className="add-btn" onClick={() => setAdding(true)}><Icon name="plus" /> Add semester</button>

      <Sheet open={adding} onClose={() => setAdding(false)} title="New semester">
        <div className="field">
          <input className="text" autoFocus placeholder="e.g. Y2 S1" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add(name)} />
        </div>
        {suggestions.length > 0 && <div className="chips-wrap">{suggestions.map((s) => <button key={s} className="chip" onClick={() => add(s)}>{s}</button>)}</div>}
        <button className="primary" disabled={!name.trim()} onClick={() => add(name)}>Add</button>
      </Sheet>
    </div>
  );
}

export function SyncDot({ sync }: { sync: SyncState }) {
  if (sync.status === 'off') return null;
  const label = { idle: 'Sheet linked', pending: 'Saving…', syncing: 'Syncing…', ok: 'Synced to Sheet', error: 'Sync failed' }[sync.status];
  return <span className={`sync-dot s-${sync.status}`} title={sync.error ?? label}><i />{label}</span>;
}
