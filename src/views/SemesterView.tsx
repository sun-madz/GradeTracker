import { useMemo, useState } from 'react';
import type { AppData, Semester } from '../types';
import { cumulative, fmt, moduleStats } from '../grading';
import { Chevron, GradePill, Icon, NumInput, Sheet, TopBar } from '../ui';
import { newModule } from '../store';
import { LIBRARY } from '../taylors';

export function SemesterView({ data, sem, update, go }: { data: AppData; sem: Semester; update: (fn: (d: AppData) => void) => void; go: (h: string) => void }) {
  const round = data.settings.roundMarks;
  const row = cumulative(data).find((r) => r.semester.id === sem.id)!;
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState('');
  const edit = (fn: (s: Semester) => void) => update((d) => { const s = d.semesters.find((x) => x.id === sem.id); if (s) fn(s); });

  const taken = new Set(data.semesters.flatMap((s) => s.modules.map((m) => m.name.toLowerCase())));
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return LIBRARY.filter((m) => !taken.has(m.name.toLowerCase()) && (!t || m.name.toLowerCase().includes(t) || m.group.toLowerCase().includes(t)));
  }, [q, taken]);

  const addModule = (name: string, credits = 4) => {
    const m = newModule(name, credits);
    edit((s) => { s.modules.push(m); });
    setAdding(false); setQ('');
    go(`#/s/${sem.id}/m/${m.id}`);
  };

  return (
    <div className="page">
      <TopBar back={() => go('#/')} title={sem.name} right={<button className="icon-btn" onClick={() => setEditing(true)} aria-label="Semester options"><Icon name="more" /></button>} />
      <div className="hero compact">
        <div className="hero-label">Semester GPA</div>
        <div className="hero-value">{fmt(row.stats.gpa)}</div>
        <div className="hero-sub">{row.stats.credits} credits · {row.stats.confirmed}/{row.stats.modules} confirmed · CGPA {fmt(row.cgpa)}</div>
      </div>

      <div className="section-head"><h2>Modules</h2></div>
      {sem.modules.length === 0 && <p className="empty">Add the modules you're taking this semester.</p>}
      <div className="list">
        {sem.modules.map((m) => {
          const st = moduleStats(m, round);
          return (
            <button key={m.id} className="card row-card" onClick={() => go(`#/s/${sem.id}/m/${m.id}`)}>
              <div className="rc-main">
                <div className="rc-title">{m.name}</div>
                <div className="rc-sub">
                  {m.credits} cr · {st.projected === null ? 'No marks yet' : `${fmt(st.projected, 1)}%`}
                  {!m.countsInGPA && <span className="tag">Not in GPA</span>}
                  {st.confirmed ? <span className="tag ok">Transcript</span> : st.projected !== null && !st.complete ? <span className="tag">In progress</span> : null}
                </div>
              </div>
              <GradePill letter={st.used} confirmed={st.confirmed} />
              <Chevron />
            </button>
          );
        })}
      </div>
      <button className="add-btn" onClick={() => setAdding(true)}><Icon name="plus" /> Add module</button>

      <Sheet open={adding} onClose={() => setAdding(false)} title="Add module">
        <input className="text" placeholder="Search Taylor's modules or type your own" value={q} onChange={(e) => setQ(e.target.value)} />
        {q.trim() && <button className="row lib-row custom" onClick={() => addModule(q.trim())}><span>Add “{q.trim()}”</span><Icon name="plus" /></button>}
        <div className="lib-list">
          {results.map((m) => (
            <button key={m.name} className="row lib-row" onClick={() => addModule(m.name, m.credits)}>
              <span className="lib-name">{m.name}<small>{m.group}</small></span><Icon name="plus" />
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Semester">
        <label className="field"><span>Name</span><input className="text" value={sem.name} onChange={(e) => edit((s) => { s.name = e.target.value; })} /></label>
        <p className="hint">From your transcript (optional). When filled, these replace the calculated running CGPA from this semester on.</p>
        <div className="two">
          <label className="field"><span>Official CGPA</span><NumInput value={sem.officialCGPA ?? null} onChange={(v) => edit((s) => { s.officialCGPA = v; })} placeholder="e.g. 3.21" /></label>
          <label className="field"><span>Total credits</span><NumInput value={sem.officialCredits ?? null} onChange={(v) => edit((s) => { s.officialCredits = v; })} placeholder="e.g. 25" /></label>
        </div>
        <button className="danger" onClick={() => {
          if (!confirm(`Delete ${sem.name} and all its modules?`)) return;
          update((d) => { d.semesters = d.semesters.filter((s) => s.id !== sem.id); });
          go('#/');
        }}>Delete semester</button>
      </Sheet>
    </div>
  );
}
