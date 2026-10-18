import { useMemo, useState } from 'react';
import type { AppData, Semester } from '../types';
import { cumulative, fmt, gpaLabels, levelOf, moduleStats } from '../grading';
import { Chevron, GradePill, Icon, NumInput, Sheet, Toggle, TopBar } from '../ui';
import { newModule, useDraft } from '../store';
import { LIBRARY, planGroups, semesterYear, tidySemesterName } from '../taylors';

export function SemesterView({ data, sem, update, go }: { data: AppData; sem: Semester; update: (fn: (d: AppData) => void) => void; go: (h: string) => void }) {
  const round = data.settings.roundMarks;
  const row = cumulative(data).find((r) => r.semester.id === sem.id)!;
  const L = gpaLabels(data);
  const weighted = data.settings.yearWeighting !== false;
  const semYear = semesterYear(sem.name);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<{ name: string; code: string; credits: number | null; exempt: boolean } | null>(null);

  const takenIn = useMemo(() => new Map(data.semesters.flatMap((s) => s.modules.map((m) => [m.name.toLowerCase(), s.name] as const))), [data.semesters]);
  const mine = useMemo(() => new Set(planGroups(data.plan).flatMap((g) => g.modules)), [data.plan]);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return LIBRARY
      .filter((m) => !t || m.name.toLowerCase().includes(t) || m.group.toLowerCase().includes(t) || (m.code ?? '').toLowerCase().includes(t))
      .sort((a, b) => Number(takenIn.has(a.name.toLowerCase())) - Number(takenIn.has(b.name.toLowerCase())) || Number(mine.has(b.name)) - Number(mine.has(a.name)));
  }, [q, takenIn, mine]);

  const closeAdd = () => { setAdding(false); setPicked(null); setQ(''); };
  const submitModule = () => {
    if (!picked || !picked.name.trim()) return;
    const m = newModule(picked.name.trim(), picked.credits ?? 4, true, picked.exempt, picked.code);
    update((d) => { d.semesters.find((s) => s.id === sem.id)?.modules.push(m); });
    closeAdd();
    go(`#/s/${sem.id}/m/${m.id}`);
  };

  const exemptCr = row.stats.exemptCredits;

  return (
    <div className="page">
      <TopBar back={() => go('#/')} title={sem.name} right={<button className="icon-btn" onClick={() => setEditing(true)} aria-label="Semester options"><Icon name="more" /></button>} />
      <div className="hero compact">
        {row.stats.status === 'predicted' && <div className="pred-chip">Predicted</div>}
        <div className="duo">
          <div><div className="hero-label">{L.gpa}</div><div className="duo-value">{fmt(row.stats.gpa)}</div><div className="duo-cap">this semester</div></div>
          <div><div className="hero-label">{L.cgpa}</div><div className="duo-value">{fmt(row.cgpa)}</div><div className="duo-cap">after this semester</div></div>
        </div>
        <div className="hero-sub">{row.stats.credits} credits{exemptCr ? ` + ${exemptCr} exempted` : ''} · {row.stats.confirmed}/{row.stats.modules - row.stats.exempt} confirmed</div>
        {row.stats.modules > 0 && row.stats.gpa === null && <p className="form-note" style={{ textAlign: 'center' }}>Add marks or an expected grade to a module to see a prediction.</p>}
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
                  {m.code ? `${m.code} · ` : ''}{m.credits} cr{st.exempt || st.confirmed ? '' : ` · ${st.projected !== null ? `${fmt(st.projected, 1)}%` : st.fromExpected ? `Expected ${st.predicted}` : 'No marks yet'}`}
                  {st.exempt && <span className="tag ex">Credit transfer</span>}
                  {weighted && !st.exempt && levelOf(m, sem) !== semYear && <span className="tag">Year {levelOf(m, sem)} module</span>}
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
            <label className="field"><span>Module code (optional)</span>
              <input className="text" value={picked.code} placeholder="e.g. CSC61304" autoCapitalize="characters" onChange={(e) => setPicked({ ...picked, code: e.target.value.toUpperCase() })} /></label>
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
            {q.trim() && <button className="row lib-row custom" onClick={() => setPicked({ name: q.trim(), code: '', credits: 4, exempt: false })}><span>Add “{q.trim()}”</span><Icon name="plus" /></button>}
            <div className="lib-list">
              {results.map((m) => (
                <button key={m.name} className={`row lib-row ${takenIn.has(m.name.toLowerCase()) ? 'taken' : ''}`} disabled={takenIn.has(m.name.toLowerCase())}
                  onClick={() => setPicked({ name: m.name, code: m.code ?? '', credits: m.credits, exempt: false })}>
                  <span className="lib-name">{m.name}<small>{takenIn.has(m.name.toLowerCase()) ? `Already in ${takenIn.get(m.name.toLowerCase())} · ` : mine.has(m.name) && data.plan.specialisation ? 'In your plan · ' : ''}{m.code ? `${m.code} · ` : ''}{m.group}</small></span>
                  {takenIn.has(m.name.toLowerCase()) ? <span className="tag ok">Added</span> : <Icon name="plus" />}
                </button>
              ))}
            </div>
          </>
        )}
      </Sheet>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Semester">
        <SemesterForm sem={sem} cgpaLabel={L.cgpa} onSave={(s) => { update((d) => { const i = d.semesters.findIndex((x) => x.id === sem.id); d.semesters[i] = { ...d.semesters[i], ...s }; }); setEditing(false); }} />
        <button className="danger" onClick={() => {
          if (!confirm(`Delete ${sem.name} and all its modules?`)) return;
          update((d) => { d.semesters = d.semesters.filter((s) => s.id !== sem.id); });
          go('#/');
        }}>Delete semester</button>
      </Sheet>
    </div>
  );
}

function SemesterForm({ sem, onSave, cgpaLabel }: { sem: Semester; cgpaLabel: string; onSave: (s: Pick<Semester, 'name' | 'officialCGPA' | 'officialCredits'>) => void }) {
  const src = { name: sem.name, officialCGPA: sem.officialCGPA ?? null, officialCredits: sem.officialCredits ?? null };
  const { draft, edit, dirty } = useDraft(src, sem.id, false);
  return (
    <>
      <label className="field"><span>Name</span><input className="text" value={draft.name} onChange={(e) => edit((s) => { s.name = e.target.value; })} placeholder="e.g. Year 2 Semester 1" /></label>
      <p className="hint">From your transcript (optional). When filled, they replace the calculated running figure from this semester onwards.</p>
      <div className="two">
        <label className="field"><span>Official {cgpaLabel}</span><NumInput value={draft.officialCGPA} onChange={(v) => edit((s) => { s.officialCGPA = v; })} placeholder="e.g. 3.21" /></label>
        <label className="field"><span>Total credits</span><NumInput value={draft.officialCredits} onChange={(v) => edit((s) => { s.officialCredits = v; })} placeholder="e.g. 25" /></label>
      </div>
      <button className="primary" disabled={!dirty || !draft.name.trim()} onClick={() => onSave({ ...draft, name: tidySemesterName(draft.name) })}>Save</button>
    </>
  );
}
