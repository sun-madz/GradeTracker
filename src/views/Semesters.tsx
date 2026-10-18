import { useState } from 'react';
import type { AppData } from '../types';
import { cumulative, currentSemester, fmt, gpaLabels } from '../grading';
import { Chevron, Icon, Sheet } from '../ui';
import { newSemester } from '../store';
import { SEMESTER_TEMPLATE, semesterYear, tidySemesterName } from '../taylors';

const semCredits = (s: { modules: { credits: number }[] }) => s.modules.reduce((n, m) => n + (Number.isFinite(m.credits) ? m.credits : 0), 0);

export function Semesters({ data, update, go }: { data: AppData; update: (fn: (d: AppData) => void) => void; go: (h: string) => void }) {
  const rows = cumulative(data);
  const L = gpaLabels(data);
  const cur = currentSemester(data);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [open, setOpen] = useState<Set<string>>(() => new Set(cur ? [`y${semesterYear(cur.name) ?? ''}`] : []));
  const used = new Set(data.semesters.map((s) => s.name));
  const suggestions = SEMESTER_TEMPLATE.filter((s) => !used.has(s));

  const groups: { key: string; title: string; rows: typeof rows }[] = [];
  for (const r of rows) {
    const y = semesterYear(r.semester.name);
    const key = y ? `y${y}` : 'other';
    let g = groups.find((x) => x.key === key);
    if (!g) { g = { key, title: y ? `Year ${y}` : 'Other', rows: [] }; groups.push(g); }
    g.rows.push(r);
  }
  const allOpen = groups.length > 0 && groups.every((g) => open.has(g.key));
  const toggle = (k: string) => setOpen((o) => { const n = new Set(o); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const add = (n: string) => {
    if (!n.trim()) return;
    const s = newSemester(tidySemesterName(n));
    update((d) => { d.semesters.push(s); });
    setAdding(false); setName('');
    go(`#/s/${s.id}`);
  };

  return (
    <div className="page">
      <div className="page-title big"><h1>Semesters</h1></div>
      <div className="section-head">
        <h2>By year</h2>
        {groups.length > 0 && <button className="link small" onClick={() => setOpen(allOpen ? new Set() : new Set(groups.map((g) => g.key)))}>{allOpen ? 'Collapse all' : 'Show all'}</button>}
      </div>
      {rows.length === 0 && <p className="empty">No semesters yet. Add your first one below.</p>}
      <div className="list">
        {groups.map((g) => {
          let wc = 0, wp = 0, cr = 0;
          g.rows.forEach((r) => { wc += r.stats.wCredits; wp += r.stats.wPoints; cr += semCredits(r.semester); });
          const done = g.rows.every((r) => r.stats.status === 'final' || r.stats.status === 'empty') && g.rows.some((r) => r.stats.status === 'final');
          const hasCur = cur && g.rows.some((r) => r.semester.id === cur.id);
          const isOpen = open.has(g.key);
          return (
            <div key={g.key} className={`card year ${isOpen ? 'open' : ''}`}>
              <button className="row-card year-head" onClick={() => toggle(g.key)} aria-expanded={isOpen}>
                <div className="rc-main">
                  <div className="rc-title">{g.title}</div>
                  <div className="rc-sub">
                    {g.rows.length} semester{g.rows.length === 1 ? '' : 's'} · {cr} cr
                    {hasCur && <span className="tag">Current</span>}
                    {done && <span className="tag ok">Final</span>}
                  </div>
                </div>
                <div className="rc-value"><div className="rc-num">{fmt(wc ? wp / wc : null)}</div><div className="rc-cap">{L.gpa}</div></div>
                <span className={`caret ${isOpen ? 'up' : ''}`}><Chevron /></span>
              </button>
              {isOpen && g.rows.map((r) => (
                <button key={r.semester.id} className="row-card sem-row" onClick={() => go(`#/s/${r.semester.id}`)}>
                  <div className="rc-main">
                    <div className="rc-title">{r.semester.name}</div>
                    <div className="rc-sub">
                      {r.stats.modules} module{r.stats.modules === 1 ? '' : 's'} · {semCredits(r.semester)} cr
                      {r.stats.status === 'final' && <span className="tag ok">Final</span>}
                      {r.stats.status === 'predicted' && <span className="tag">In progress</span>}
                      {r.official && <span className="tag ok">Official {L.cgpa}</span>}
                    </div>
                  </div>
                  <div className="rc-value"><div className="rc-num">{fmt(r.stats.gpa)}</div><div className="rc-cap">{L.gpa}</div></div>
                  <Chevron />
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <button className="add-btn" onClick={() => setAdding(true)}><Icon name="plus" /> Add semester</button>

      <Sheet open={adding} onClose={() => setAdding(false)} title="New semester" action={{ label: 'Add', onClick: () => add(name), disabled: !name.trim() }}>
        <div className="field">
          <input className="text" autoFocus placeholder="e.g. Year 2 Semester 1" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add(name)} />
        </div>
        {suggestions.length > 0 && <div className="chips-wrap">{suggestions.slice(0, 6).map((s) => <button key={s} className={`chip ${name === s ? 'on' : ''}`} onClick={() => setName(s)}>{s}</button>)}</div>}
        {name.trim() && tidySemesterName(name) !== name.trim() && <p className="form-note">Will be saved as “{tidySemesterName(name)}”</p>}
      </Sheet>
    </div>
  );
}
