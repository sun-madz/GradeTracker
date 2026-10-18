import { useState } from 'react';
import type { AppData, Module, Semester } from '../types';
import { fmt, levelOf, moduleStats } from '../grading';
import { YEAR_WEIGHT, autoLevel } from '../taylors';
import { GradePill, Icon, LetterPicker, NumInput, SaveBar, Sheet, Toggle, TopBar } from '../ui';
import { confirmLeave, guard, uid, useDraft } from '../store';

export function ModuleView({ data, sem, mod, update, go }: {
  data: AppData; sem: Semester; mod: Module; update: (fn: (d: AppData) => void) => void; go: (h: string) => void;
}) {
  const { draft, edit, dirty, reset } = useDraft(mod, mod.id);
  const st = moduleStats(draft, data.settings.roundMarks);
  const [menu, setMenu] = useState(false);
  const [moveTo, setMoveTo] = useState(sem.id);

  const save = (targetSem = sem.id) => {
    update((d) => {
      const from = d.semesters.find((s) => s.id === sem.id)!;
      const idx = from.modules.findIndex((m) => m.id === mod.id);
      if (idx < 0) return;
      if (targetSem === sem.id) from.modules[idx] = structuredClone(draft);
      else { from.modules.splice(idx, 1); d.semesters.find((s) => s.id === targetSem)!.modules.push(structuredClone(draft)); }
    });
  };
  const back = () => { if (confirmLeave()) { guard.dirty = false; go(`#/s/${sem.id}`); } };

  const needText = (() => {
    const n = st.needed;
    if (!n || !draft.target) return null;
    if (n.kind === 'pct') return <>You need <b>{fmt(n.value, 1)}%</b> on the remaining {fmt(st.totalWeight - st.weightAssessed, 0)}% of marks for {draft.target}.</>;
    if (n.kind === 'secured') return <>{draft.target} is already secured.</>;
    if (n.kind === 'out') return <>{draft.target} is out of reach. Even 100% on what's left won't get there.</>;
    if (n.kind === 'achieved') return <>You reached {draft.target}.</>;
    return <>You finished below {draft.target}.</>;
  })();

  return (
    <div className="page">
      <TopBar back={back} title={sem.name} right={<button className="icon-btn" onClick={() => { setMoveTo(sem.id); setMenu(true); }} aria-label="Module options"><Icon name="more" /></button>} />

      <div className="mod-head">
        <textarea className="title-input" rows={1} value={draft.name} aria-label="Module name"
          ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
          onChange={(e) => edit((m) => { m.name = e.target.value.replace(/\n/g, ' '); })} />
        <input className="code-input" value={draft.code ?? ''} placeholder="Add module code" aria-label="Module code" autoCapitalize="characters"
          onChange={(e) => edit((m) => { m.code = e.target.value.toUpperCase(); })} />
        <div className="mod-summary">
          <GradePill letter={st.used} confirmed={st.confirmed} exempt={st.exempt} size="lg" />
          <div>
            <div className="big-num">{st.exempt ? `${draft.credits} cr` : st.projected === null ? '—' : `${fmt(st.projected, 1)}%`}</div>
            <div className="muted small">
              {st.exempt ? 'Exempted · credit transfer'
                : st.confirmed ? `Transcript grade${st.predicted && st.predicted !== draft.transcript ? ` · predicted ${st.predicted}` : st.predicted ? ' · matches prediction' : ''}`
                : st.fromExpected ? 'Expected grade · no marks yet' : st.projected === null ? 'Enter marks or an expected grade'
                : st.complete ? 'Predicted · all marks in' : `Projected at your current pace · ${fmt(st.secured, 1)} marks banked`}
            </div>
          </div>
        </div>
        {!st.exempt && data.settings.yearWeighting !== false && <p className="muted small" style={{ margin: '10px 2px 0' }}>Year {levelOf(draft, sem)} module · weighted {YEAR_WEIGHT[levelOf(draft, sem)] * 100}% in WGPA</p>}
        {!st.exempt && st.weightAssessed > 0 && st.totalWeight > 0 && (
          <div className="progress slim"><div className="progress-bar"><span style={{ width: `${Math.min(100, (st.weightAssessed / st.totalWeight) * 100)}%` }} /></div>
            <div className="progress-text">{fmt(st.weightAssessed, 0)}% of the module marked</div></div>
        )}
      </div>

      {st.exempt ? (
        <>
          <div className="section-head"><h2>Credit transfer</h2></div>
          <div className="card exempt-card">
            <div>
              <b>You're exempted from this module</b>
              <p>Its {draft.credits} credits count towards graduation but have no grade, so they don't affect your GPA or CGPA.</p>
            </div>
          </div>
          <button className="add-btn" onClick={() => edit((m) => { m.exempt = false; })}>Remove exemption</button>
        </>
      ) : (
        <>
          <div className="section-head"><h2>Assessments</h2><span className="muted small">score / out of</span></div>
          <div className="card">
            {draft.assessments.map((a, i) => {
              const out = a.outOf ?? a.weight;
              return (
                <div key={a.id} className="assess">
                  <input className="assess-name" value={a.name} placeholder="Assessment" onChange={(e) => edit((m) => { m.assessments[i].name = e.target.value; })} />
                  <div className="assess-weight"><NumInput value={a.weight} onChange={(v) => edit((m) => { m.assessments[i].weight = v ?? 0; })} ariaLabel="Weight" /><span>%</span></div>
                  <div className="assess-score">
                    <NumInput value={a.score} onChange={(v) => edit((m) => { m.assessments[i].score = v; })} placeholder="–" ariaLabel="Score" />
                    <span>/</span>
                    <NumInput value={a.outOf} onChange={(v) => edit((m) => { m.assessments[i].outOf = v; })} placeholder={String(out || '')} ariaLabel="Out of" />
                  </div>
                  <button className="icon-btn subtle" aria-label="Remove assessment" onClick={() => edit((m) => { m.assessments.splice(i, 1); })}><Icon name="trash" /></button>
                </div>
              );
            })}
            <button className="add-inline" onClick={() => edit((m) => { m.assessments.push({ id: uid(), name: '', weight: 0, score: null, outOf: null }); })}><Icon name="plus" /> Add assessment</button>
          </div>
          <p className="hint">Leave "out of" blank to enter the mark as its contribution (e.g. 18.5 out of a 30% midterm).</p>
          {st.warnings.map((w) => <p key={w} className="warn">{w}</p>)}

          {!draft.transcript && (
            <>
              <div className="section-head"><h2>Expected grade</h2></div>
              <div className="card pad">
                <p className="hint tight">No marks yet? Pick the grade you expect. It's used for your predicted {data.settings.yearWeighting !== false ? 'WGPA and WCGPA' : 'GPA and CGPA'} until you enter marks.</p>
                <LetterPicker value={draft.expected ?? null} onChange={(l) => edit((m) => { m.expected = l; })} />
                {st.projected !== null && draft.expected && <p className="form-note">You've entered marks, so the prediction now uses them ({st.predicted}) instead.</p>}
              </div>
            </>
          )}

          <div className="section-head"><h2>Target grade</h2></div>
          <div className="card pad">
            <LetterPicker value={draft.target} onChange={(l) => edit((m) => { m.target = l; })} />
            {needText && <p className="need">{needText}</p>}
          </div>

          <div className="section-head"><h2>Transcript grade</h2></div>
          <div className="card pad">
            <p className="hint tight">Once results are out, pick the letter grade on your transcript. It replaces the prediction in your GPA.</p>
            <LetterPicker value={draft.transcript} onChange={(l) => edit((m) => { m.transcript = l; })} />
          </div>
        </>
      )}

      <SaveBar show={dirty} onSave={() => save()} onDiscard={reset} />

      <Sheet open={menu} onClose={() => setMenu(false)} title="Module settings">
        <label className="field"><span>Credits</span><NumInput value={draft.credits} onChange={(v) => edit((m) => { m.credits = v ?? 0; })} /></label>
        <div className="card">
          <Toggle on={!!draft.exempt} onChange={(v) => edit((m) => { m.exempt = v; })} label="Exempted (credit transfer)" />
          {!draft.exempt && <Toggle on={draft.countsInGPA} onChange={(v) => edit((m) => { m.countsInGPA = v; })} label="Counts towards GPA" />}
        </div>
        {!draft.exempt && (
          <div className="form-block" style={{ marginTop: 14 }}>
            <div className="form-label">Year level (for WGPA weighting)</div>
            <div className="choice">
              <button className={`chip ${!draft.yearLevel ? 'on' : ''}`} onClick={() => edit((m) => { m.yearLevel = null; })}>Auto · Year {autoLevel(draft.name, sem.name)}</button>
              {([1, 2, 3] as const).map((y) => (
                <button key={y} className={`chip ${draft.yearLevel === y ? 'on' : ''}`} onClick={() => edit((m) => { m.yearLevel = y; })}>Year {y} · {YEAR_WEIGHT[y] * 100}%</button>
              ))}
            </div>
            <p className="form-note">Taylor's weights each module by its year level: Year 1 counts 20%, Year 2 counts 30% and Year 3 counts 50%. Pick the level from the programme structure, not the semester you took it in.</p>
          </div>
        )}
        <label className="field"><span>Semester</span>
          <select className="text" value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
            {data.semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <button className="primary" onClick={() => {
          save(moveTo); guard.dirty = false; setMenu(false);
          if (moveTo !== sem.id) go(`#/s/${moveTo}/m/${mod.id}`);
        }}>Save</button>
        <button className="danger" onClick={() => {
          if (!confirm(`Delete ${mod.name}?`)) return;
          guard.dirty = false;
          update((d) => { const s = d.semesters.find((x) => x.id === sem.id)!; s.modules = s.modules.filter((m) => m.id !== mod.id); });
          go(`#/s/${sem.id}`);
        }}>Delete module</button>
      </Sheet>
    </div>
  );
}
