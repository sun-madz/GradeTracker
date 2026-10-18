import { useMemo, useState } from 'react';
import type { AppData, Semester } from '../types';
import { cumulative, fitLevels, fmt, gpaLabels, isFail, latest, levelOf, moduleStats, supersededIds } from '../grading';
import { Chevron, GradePill, Icon, NumInput, Sheet, Toggle, TopBar } from '../ui';
import { newModule, useDraft } from '../store';
import { LIBRARY, canonName, creditsFor, planGroups, semesterYear, tidySemesterName } from '../taylors';

export function SemesterView({ data, sem, update, go }: { data: AppData; sem: Semester; update: (fn: (d: AppData) => void) => void; go: (h: string) => void }) {
  const round = data.settings.roundMarks;
  const replaced = supersededIds(data);
  const rows = cumulative(data);                // confirmed grades only
  const predRows = cumulative(data, sem.id);     // + this semester's predictions
  const idx = rows.findIndex((r) => r.semester.id === sem.id);
  const row = rows[idx];
  const predRow = predRows[idx];
  const current = latest(rows);
  const predicted = latest(predRows);
  // Current WGPA = the most recent semester whose grades are all confirmed.
  const lastFinal = [...rows].reverse().find((r) => r.stats.status === 'final' && r.stats.gpa !== null);
  const L = gpaLabels(data);
  const weighted = data.settings.yearWeighting !== false;
  const semYear = semesterYear(sem.name);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<{ name: string; code: string; credits: number | null; exempt: boolean } | null>(null);

  const takenIn = useMemo(() => new Map(data.semesters.flatMap((s) => s.modules.map((m) => [canonName(m.name, m.code), s.name] as const))), [data.semesters]);
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
      <div className="hero-card sem-card">
        {row.stats.status === 'predicted' ? (
          <div className="duo">
            <Stat label="Current" big={current?.cgpa} bigCap={L.cgpa} small={lastFinal?.stats.gpa} smallCap={L.gpa} />
            <Stat label="Predicted" accent big={predicted?.cgpa} bigCap={L.cgpa} small={predRow.stats.gpa} smallCap={L.gpa} />
          </div>
        ) : (
          <div className="duo">
            <Stat label="This semester" big={row.stats.gpa} bigCap={L.gpa} />
            <Stat label="Overall" big={row.cgpa} bigCap={L.cgpa} />
          </div>
        )}
        {sem.transcriptWGPA != null && row.stats.status === 'final' && (
          <div className={`tcheck ${row.stats.gpa !== null && Math.abs(Math.round(row.stats.gpa * 100) / 100 - sem.transcriptWGPA) < 0.0001 ? 'ok' : 'off'}`}>
            Transcript {fmt(sem.transcriptWGPA)} {row.stats.gpa !== null && Math.abs(Math.round(row.stats.gpa * 100) / 100 - sem.transcriptWGPA) < 0.0001 ? '✓ matches' : '· doesn\'t match yet'}
          </div>
        )}
        <div className="hero-sub">
          {predRow.stats.credits + exemptCr} cr · {row.stats.confirmed} of {row.stats.modules - row.stats.exempt} confirmed
          {row.stats.status === 'predicted' && predRow.stats.gpa === null && <><br />Set target grades to see a prediction</>}
        </div>
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
                  {m.code ? `${m.code} · ` : ''}{m.credits} cr{st.exempt || st.confirmed ? '' : ` · ${st.projected !== null ? `${fmt(st.projected, 1)}%` : st.fromExpected ? `Target ${st.predicted}` : 'No marks yet'}`}
                  {st.exempt && <span className="tag ex">Credit transfer</span>}
                  {m.retakeOf && <span className="tag">Retake</span>}
                  {replaced.has(m.id) ? <span className="tag ok">Replaced by retake</span> : isFail(m.transcript) ? <span className="tag fail">Retake needed</span> : null}
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

      <Sheet open={adding} onClose={closeAdd} title={picked ? 'New module' : 'Add module'} action={picked ? { label: 'Add', onClick: submitModule, disabled: !picked.name.trim() } : undefined}>
        {picked ? (
          <>
            <label className="field"><span>Module name</span>
              <input className="text" value={picked.name} onChange={(e) => setPicked({ ...picked, name: e.target.value })} /></label>
            <label className="field"><span>Module code (optional)</span>
              <input className="text" value={picked.code} placeholder="e.g. CSC61304" autoCapitalize="characters" onChange={(e) => { const code = e.target.value.toUpperCase().trim(); setPicked({ ...picked, code, credits: /\d$/.test(code) && Number(code.slice(-1)) > 0 ? creditsFor(picked.name, code) : picked.credits }); }} /></label>
            <label className="field"><span>Credits</span>
              <NumInput value={picked.credits} onChange={(v) => setPicked({ ...picked, credits: v })} placeholder="4" /></label>
            <div className="card"><Toggle on={picked.exempt} onChange={(v) => setPicked({ ...picked, exempt: v })} label="Exempted (credit transfer)" /></div>
            <p className="form-note">{picked.exempt ? 'Credits count towards graduation, with no grade and no effect on GPA.' : 'Starts with Mid Term 30%, Group Project 30% and Final 40%. You can change these after adding.'}</p>
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
        <SemesterForm sem={sem} cgpaLabel={L.cgpa} gpaLabel={L.gpa} appWGPA={row.stats.gpa} round={data.settings.roundMarks}
          onApplyLevels={(changes) => update((d) => { const se = d.semesters.find((x) => x.id === sem.id)!; changes.forEach((c) => { const m = se.modules.find((x) => x.id === c.id); if (m) m.yearLevel = c.to; }); })}
          onSave={(s) => { update((d) => { const i = d.semesters.findIndex((x) => x.id === sem.id); d.semesters[i] = { ...d.semesters[i], ...s }; }); setEditing(false); }} />
        <button className="danger" onClick={() => {
          if (!confirm(`Delete ${sem.name} and all its modules?`)) return;
          update((d) => { d.semesters = d.semesters.filter((s) => s.id !== sem.id); });
          go('#/');
        }}>Delete semester</button>
      </Sheet>
    </div>
  );
}

function SemesterForm({ sem, onSave, cgpaLabel, gpaLabel, appWGPA, round, onApplyLevels }: {
  sem: Semester; cgpaLabel: string; gpaLabel: string; appWGPA: number | null; round: boolean;
  onApplyLevels: (c: { id: string; to: 1 | 2 | 3 }[]) => void;
  onSave: (s: Pick<Semester, 'name' | 'officialCGPA' | 'officialCredits' | 'transcriptWGPA'>) => void;
}) {
  const src = { name: sem.name, officialCGPA: sem.officialCGPA ?? null, officialCredits: sem.officialCredits ?? null, transcriptWGPA: sem.transcriptWGPA ?? null };
  const { draft, edit, dirty } = useDraft(src, sem.id, false);
  const t = draft.transcriptWGPA;
  const matches = t !== null && appWGPA !== null && Math.abs(Math.round(appWGPA * 100) / 100 - t) < 0.0001;
  const fit = t !== null && !matches ? fitLevels(sem, round, t) : null;
  return (
    <>
      <label className="field"><span>Name</span><input className="text" value={draft.name} onChange={(e) => edit((s) => { s.name = e.target.value; })} placeholder="e.g. Year 2 Semester 1" /></label>

      <div className="form-block" style={{ marginTop: 18 }}>
        <div className="form-label">Check against your transcript</div>
        <label className="field" style={{ margin: 0 }}><span>{gpaLabel} on your transcript for this semester</span>
          <NumInput value={draft.transcriptWGPA} onChange={(v) => edit((s) => { s.transcriptWGPA = v; })} placeholder="e.g. 2.10" /></label>
        {t !== null && (
          <div className={`check ${matches ? 'ok' : 'off'}`}>
            {matches ? <>Matches the app ({fmt(appWGPA)}).</> : <>
              The app shows <b>{fmt(appWGPA)}</b>, but your transcript says <b>{fmt(t)}</b>.
              {fit ? (fit.changes.length ? <>
                <div style={{ marginTop: 8 }}>It matches if you change these year levels:</div>
                <ul>{fit.changes.map((c) => <li key={c.id}>{c.name}: Year {c.from} → <b>Year {c.to}</b></li>)}</ul>
                <button className="secondary" onClick={() => onApplyLevels(fit.changes)}>Apply these year levels</button>
              </> : null) : <div style={{ marginTop: 8 }}>No mix of year levels gives {fmt(t)}, so a module's credits or grade must differ from your transcript. Check each module here against it.</div>}
            </>}
          </div>
        )}
      </div>

      <p className="hint">Official {cgpaLabel} from your transcript (optional). When filled, it replaces the calculated figure from this semester onwards.</p>
      <div className="two">
        <label className="field"><span>Official {cgpaLabel}</span><NumInput value={draft.officialCGPA} onChange={(v) => edit((s) => { s.officialCGPA = v; })} placeholder="e.g. 2.70" /></label>
        <label className="field"><span>Total credits</span><NumInput value={draft.officialCredits} onChange={(v) => edit((s) => { s.officialCredits = v; })} placeholder="e.g. 48" /></label>
      </div>
      <button className="primary" disabled={!dirty || !draft.name.trim()} onClick={() => onSave({ ...draft, name: tidySemesterName(draft.name) })}>Save</button>
    </>
  );
}

function Stat({ label, big, bigCap, small, smallCap, accent }: { label: string; big?: number | null; bigCap: string; small?: number | null; smallCap?: string; accent?: boolean }) {
  return (
    <div className={`stat ${accent ? 'accent' : ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-big">{fmt(big)}</div>
      <div className="stat-cap">{bigCap}</div>
      {smallCap && <div className="stat-small"><b>{fmt(small)}</b> {smallCap}</div>}
    </div>
  );
}
