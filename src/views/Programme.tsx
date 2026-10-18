import { useState } from 'react';
import type { AppData, Flexible, Plan } from '../types';
import { EXTENSIONS, FLEXIBLE, MINORS, PROGRAMME, SPECIALISATIONS, TRACKS, UNIVERSITY_CORE, YEARS, planGroups } from '../taylors';
import { SCALE, moduleStats } from '../grading';
import { GradePill, Sheet } from '../ui';
import { useDraft } from '../store';

type Status = { kind: 'exempt' | 'done' | 'progress' | 'planned'; label: string; sem: string; grade?: ReturnType<typeof moduleStats>['used']; confirmed?: boolean };

function statusMap(d: AppData) {
  const map = new Map<string, Status>();
  for (const s of d.semesters) for (const m of s.modules) {
    const st = moduleStats(m, d.settings.roundMarks);
    const k = m.name.trim().toLowerCase();
    const v: Status = st.exempt ? { kind: 'exempt', label: 'Exempted', sem: s.name }
      : st.confirmed ? { kind: 'done', label: 'Done', sem: s.name, grade: st.used, confirmed: true }
      : st.projected !== null ? { kind: 'progress', label: st.complete ? 'Awaiting result' : 'In progress', sem: s.name, grade: st.used }
      : { kind: 'planned', label: 'Planned', sem: s.name };
    map.set(k, v);
  }
  return map;
}

const flexLabel: Record<Flexible, string> = { electives: 'Five free electives', minor: 'A minor', 'second-major': 'A second major' };

export function Programme({ data, update }: { data: AppData; update: (fn: (d: AppData) => void) => void }) {
  const [editing, setEditing] = useState(false);
  const p = data.plan;
  const status = statusMap(data);
  const groups = planGroups(p);
  const hasPlan = !!(p.specialisation || p.track || p.flexible || p.studentType);
  const all = groups.flatMap((g) => g.modules);
  const doneCount = all.filter((m) => { const s = status.get(m.toLowerCase()); return s && (s.kind === 'done' || s.kind === 'exempt'); }).length;

  return (
    <div className="page">
      <div className="page-title"><h1>Programme</h1><p className="muted">{PROGRAMME.name}</p></div>

      <div className="section-head"><h2>My plan</h2><button className="link small" onClick={() => setEditing(true)}>{hasPlan ? 'Edit' : 'Set up'}</button></div>
      <div className="card facts">
        <div><span>Specialisation</span><b>{p.specialisation ?? 'Not chosen'}</b></div>
        <div><span>Extension</span><b>{p.extension === 'none' ? 'None' : p.extension ?? 'Not chosen'}</b></div>
        <div><span>Year 3 track</span><b>{p.track ?? 'Not chosen'}</b></div>
        <div><span>Flexible education</span><b>{p.flexible === 'minor' ? `Minor · ${p.minor ?? '—'}` : p.flexible === 'second-major' ? `Second major${p.secondMajor ? ` · ${p.secondMajor}` : ''}` : p.flexible ? flexLabel[p.flexible] : 'Not chosen'}</b></div>
        <div><span>Student</span><b>{p.studentType === 'malaysian' ? 'Malaysian' : p.studentType === 'international' ? 'International' : 'Not chosen'}</b></div>
      </div>

      <div className="section-head"><h2>My modules</h2><span className="muted small">{doneCount} of {all.length} done</span></div>
      <div className="progress slim" style={{ margin: '0 4px 10px' }}><div className="progress-bar"><span style={{ width: `${all.length ? (doneCount / all.length) * 100 : 0}%` }} /></div></div>
      {groups.map((g) => (
        <div key={g.title} className="card pad group">
          <div className="group-title">{g.title}</div>
          {g.modules.length > 0 && (
            <ul className="mod-list check">
              {g.modules.map((m) => {
                const s = status.get(m.toLowerCase());
                return (
                  <li key={m}>
                    <span className={`dot ${s?.kind ?? 'todo'}`} />
                    <span className="cl-name">{m}{s && <small>{s.label} · {s.sem}</small>}</span>
                    {s?.kind === 'exempt' ? <GradePill letter={null} exempt /> : s?.grade ? <GradePill letter={s.grade} confirmed={s.confirmed} /> : null}
                  </li>
                );
              })}
            </ul>
          )}
          {g.note && <p className="form-note">{g.note}</p>}
        </div>
      ))}
      <p className="hint">A module is ticked when its name matches a module in one of your semesters.</p>

      <div className="section-head"><h2>About the programme</h2></div>
      <div className="card facts">
        <div><span>Duration</span><b>{PROGRAMME.duration}</b></div>
        <div><span>Intakes</span><b>{PROGRAMME.intakes}</b></div>
        <div><span>School</span><b>{PROGRAMME.school}</b></div>
      </div>
      <p className="hint">{PROGRAMME.calendar}</p>

      {YEARS.map((y) => (
        <section key={y.title}>
          <div className="section-head"><h2>{y.title}</h2></div>
          {y.groups.map((g) => (
            <div key={g.title} className="card pad group">
              {y.groups.length > 1 && <div className="group-title">{g.title}</div>}
              <ul className="mod-list">{g.modules.map((m) => <li key={m}>{m}</li>)}</ul>
            </div>
          ))}
        </section>
      ))}

      <div className="section-head"><h2>Specialisations · pick one</h2></div>
      {SPECIALISATIONS.map((s) => (
        <div key={s.title} className="card pad group">
          <div className="group-title">{s.title}</div>
          <ul className="mod-list">{s.modules.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      ))}

      <div className="section-head"><h2>University core</h2></div>
      <div className="card pad group">
        <div className="group-title">All students</div><ul className="mod-list">{UNIVERSITY_CORE.all.map((m) => <li key={m}>{m}</li>)}</ul>
        <div className="group-title">Malaysian students</div><ul className="mod-list">{UNIVERSITY_CORE.malaysian.map((m) => <li key={m}>{m}</li>)}</ul>
        <div className="group-title">International students</div><ul className="mod-list">{UNIVERSITY_CORE.international.map((m) => <li key={m}>{m}</li>)}</ul>
      </div>

      <div className="section-head"><h2>Flexible education</h2></div>
      <div className="card pad"><ul className="mod-list">{FLEXIBLE.map((m) => <li key={m}>{m}</li>)}</ul></div>

      <div className="section-head"><h2>Grading scale</h2></div>
      <div className="card">
        {SCALE.map((s) => (
          <div key={s.letter} className="scale-row">
            <GradePill letter={s.letter} confirmed />
            <span className="scale-range">{s.min}–{s.max}</span>
            <span className="scale-label muted">{s.label}</span>
            <b>{s.points.toFixed(2)}</b>
          </div>
        ))}
      </div>
      <p className="hint">GPA = Σ(credits × grade points) ÷ Σ credits. Credit-transfer exemptions earn credits but carry no grade. Module lists are from Taylor's website and may change, so check with your faculty. <a href={PROGRAMME.source} target="_blank" rel="noreferrer">Source</a></p>

      <Sheet open={editing} onClose={() => setEditing(false)} title="My plan">
        <PlanForm plan={p} onSave={(np) => { update((d) => { d.plan = np; }); setEditing(false); }} />
      </Sheet>
    </div>
  );
}

function Choice<T extends string>({ options, value, onChange, labels }: { options: T[]; value: T | null; onChange: (v: T) => void; labels?: Partial<Record<T, string>> }) {
  return (
    <div className="choice">
      {options.map((o) => <button key={o} className={`chip ${value === o ? 'on' : ''}`} onClick={() => onChange(o)}>{labels?.[o] ?? o}</button>)}
    </div>
  );
}

function PlanForm({ plan, onSave }: { plan: Plan; onSave: (p: Plan) => void }) {
  const { draft, edit, dirty } = useDraft(plan, 'plan', false);
  const extOptions = draft.specialisation ? ['none', ...EXTENSIONS[draft.specialisation]] : [];
  return (
    <>
      <div className="form-block"><div className="form-label">Specialisation</div>
        <Choice options={SPECIALISATIONS.map((s) => s.title)} value={draft.specialisation}
          onChange={(v) => edit((p) => { p.specialisation = v; if (p.extension && p.extension !== 'none' && !EXTENSIONS[v].includes(p.extension)) p.extension = null; })} /></div>

      <div className="form-block"><div className="form-label">Extension package</div>
        {draft.specialisation
          ? <Choice options={extOptions} value={draft.extension} labels={{ none: 'No extension' }} onChange={(v) => edit((p) => { p.extension = v; })} />
          : <p className="form-note">Choose a specialisation first. Your extension must be different from it.</p>}</div>

      <div className="form-block"><div className="form-label">Year 3 track</div>
        <Choice options={TRACKS} value={draft.track} onChange={(v) => edit((p) => { p.track = v; })} /></div>

      <div className="form-block"><div className="form-label">Flexible education</div>
        <Choice options={['electives', 'minor', 'second-major'] as Flexible[]} value={draft.flexible}
          labels={{ electives: 'Free electives', minor: 'Minor', 'second-major': 'Second major' }} onChange={(v) => edit((p) => { p.flexible = v; })} />
        {draft.flexible === 'minor' && <div style={{ marginTop: 10 }}><Choice options={MINORS} value={draft.minor} onChange={(v) => edit((p) => { p.minor = v; })} /></div>}
        {draft.flexible === 'second-major' && <input className="text" style={{ marginTop: 10 }} placeholder="Which second major?" value={draft.secondMajor} onChange={(e) => edit((p) => { p.secondMajor = e.target.value; })} />}
      </div>

      <div className="form-block"><div className="form-label">Student</div>
        <Choice options={['malaysian', 'international'] as ('malaysian' | 'international')[]} value={draft.studentType}
          labels={{ malaysian: 'Malaysian', international: 'International' }} onChange={(v) => edit((p) => { p.studentType = v; })} />
        <p className="form-note">Decides which university core modules you take.</p></div>

      <button className="primary" disabled={!dirty} onClick={() => onSave(draft)}>Save plan</button>
    </>
  );
}
