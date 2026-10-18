import { useMemo, useState } from 'react';
import type { AppData, Semester } from '../types';
import { cumulative, fmt, moduleStats } from '../grading';
import { Chevron, GradePill, Icon, NumInput, Sheet, Toggle, TopBar } from '../ui';
import { newModule, useDraft } from '../store';
import { LIBRARY, planGroups, tidySemesterName } from '../taylors';

export function SemesterView({ data, sem, update, go }: { data: AppData; sem: Semester; update: (fn: (d: AppData) => void) => void; go: (h: string) => void }) {
  const round = data.settings.roundMarks;
  const row = cumulative(data).find((r) => r.semester.id === sem.id)!;
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<{ name: string; credits: number | null; exempt: boolean } | null>(null);

  const taken = useMemo(() => new Set(data.semesters.flatMap((s) => s.modules.map((m) => m.name.toLowerCase()))), [data.semesters]);
  const mine = useMemo(() => new Set(planGroups(data.plan).flatMap((g) => g.modules)), [data.plan]);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return LIBRARY
      .filter((m) => !taken.has(m.name.toLowerCase()) && (!t || m.name.toLowerCase().includes(t) || m.group.toLowerCase().includes(t)))
      .sort((a, b) => Number(mine.has(b.name)) - Number(mine.has(a.name)));
  }, [q, taken, mine]);

  const closeAdd = () => { setAdding(false); setPicked(null); setQ(''); };
  const submitModule = () => {
    if (!picked || !picked.name.trim()) return;
    const m = newModule(picked.name.trim(), picked.credits ?? 4, true, picked.exempt);
    update((d) => { d.semesters.find((s) => s.id === sem.id)?.modules.push(m); });
    closeAdd();
    go(`#/s/${sem.id}/m/${m.id}`);
  };

  const exemptCr = row.stats.exemptCredits;

  return (
    <div className="page">
      <TopBar back={() => go('#/')} title={sem.name} right={<button className="icon-btn" onClick={() => setEditing(true)} aria-label="Semester options"><Icon name="more" /></button>} />
      <div className="hero compact">
        <div className="hero-label">Semester GPA</div>
        <div className="hero-value">{fmt(row.stats.gpa)}</div>
        <div className="hero-sub">{row.stats.credits} credits{exemptCr ? ` + ${exemptCr} exempted` : ''} · {row.stats.confirmed}/{row.stats.modules - row.stats.exempt} confirmed · CGPA {fmt(row.cgpa)}</div>
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
                  {m.credits} cr{st.exempt ? '' : ` · ${st.projected === null ? 'No marks yet' : `${fmt(st.projected, 1)}%`}`}
                  {st.exempt && <span className="tag ex">Credit transfer</span>}
                  {!st.exempt && !m.countsInGPA && <span className="tag">Not in GPA</span>}
                  {st.confirmed ? <span className="tag ok">Transcript</span> : !st.exempt && st.projected !== null && !st.complete ? <span className="tag">In progress</span> : null}
                </div>
              </div>
              <GradePill letter={st.used} confirmed={st.confirmed} exempt={st.exempt} />
              <Chevron />
            </button>
          );
        })}
      </div>
      <button className="add-btn" onClick={() => setAdding(true)}><Icon name="plus" /> Add module</button>

      <Sheet open={adding} onClose={closeAdd} title={picked ? 'New module' : 'Add module'}>
        {picked ? (
          <>
            <label className="field"><span>Module name</span>
              <input className="text" value={picked.name} onChange={(e) => setPicked({ ...picked, name: e.target.value })} /></label>
            <label className="field"><span>Credits</span>
              <NumInput value={picked.credits} onChange={(v) => setPicked({ ...picked, credits: v })} placeholder="4" /></label>
            <div className="card"><Toggle on={picked.exempt} onChange={(v) => setPicked({ ...picked, exempt: v })} label="Exempted (credit transfer)" /></div>
            <p className="form-note">{picked.exempt ? 'Credits count towards graduation, with no grade and no effect on GPA.' : 'Starts with Mid Term 30%, Group Project 30% and Final 40%. You can change these after adding.'}</p>
            <button className="primary" disabled={!picked.name.trim()} onClick={submitModule}>Add module</button>
            <button className="link block" onClick={() => setPicked(null)}>Back to list</button>
          </>
        ) : (
          <>
            <input className="text" placeholder="Search Taylor's modules or type your own" value={q} onChange={(e) => setQ(e.target.value)} />
            {q.trim() && <button className="row lib-row custom" onClick={() => setPicked({ name: q.trim(), credits: 4, exempt: false })}><span>Add “{q.trim()}”</span><Icon name="plus" /></button>}
            <div className="lib-list">
              {results.map((m) => (
                <button key={m.name} className="row lib-row" onClick={() => setPicked({ name: m.name, credits: m.credits, exempt: false })}>
                  <span className="lib-name">{m.name}<small>{mine.has(m.name) && data.plan.specialisation ? 'In your plan · ' : ''}{m.group}</small></span><Icon name="plus" />
                </button>
              ))}
            </div>
          </>
        )}
      </Sheet>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Semester">
        <SemesterForm sem={sem} onSave={(s) => { update((d) => { const i = d.semesters.findIndex((x) => x.id === sem.id); d.semesters[i] = { ...d.semesters[i], ...s }; }); setEditing(false); }} />
        <button className="danger" onClick={() => {
          if (!confirm(`Delete ${sem.name} and all its modules?`)) return;
          update((d) => { d.semesters = d.semesters.filter((s) => s.id !== sem.id); });
          go('#/');
        }}>Delete semester</button>
      </Sheet>
    </div>
  );
}

function SemesterForm({ sem, onSave }: { sem: Semester; onSave: (s: Pick<Semester, 'name' | 'officialCGPA' | 'officialCredits'>) => void }) {
  const src = { name: sem.name, officialCGPA: sem.officialCGPA ?? null, officialCredits: sem.officialCredits ?? null };
  const { draft, edit, dirty } = useDraft(src, sem.id, false);
  return (
    <>
      <label className="field"><span>Name</span><input className="text" value={draft.name} onChange={(e) => edit((s) => { s.name = e.target.value; })} placeholder="e.g. Year 2 Semester 1" /></label>
      <p className="hint">From your transcript (optional). When filled, these replace the calculated running CGPA from this semester on.</p>
      <div className="two">
        <label className="field"><span>Official CGPA</span><NumInput value={draft.officialCGPA} onChange={(v) => edit((s) => { s.officialCGPA = v; })} placeholder="e.g. 3.21" /></label>
        <label className="field"><span>Total credits</span><NumInput value={draft.officialCredits} onChange={(v) => edit((s) => { s.officialCredits = v; })} placeholder="e.g. 25" /></label>
      </div>
      <button className="primary" disabled={!dirty || !draft.name.trim()} onClick={() => onSave({ ...draft, name: tidySemesterName(draft.name) })}>Save</button>
    </>
  );
}
