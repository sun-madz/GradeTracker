import { useState } from 'react';
import type { AppData, Module, Semester } from '../types';
import { findRetake, fmt, isFail, levelOf, moduleStats } from '../grading';
import { YEAR_WEIGHT, autoLevel } from '../taylors';
import { Collapse, GradePill, Icon, LetterPicker, NumInput, SaveBar, Sheet, Toggle, TopBar } from '../ui';
import { confirmLeave, guard, newModule, uid, useDraft } from '../store';

export function ModuleView({ data, sem, mod, update, go }: {
  data: AppData; sem: Semester; mod: Module; update: (fn: (d: AppData) => void) => void; go: (h: string) => void;
}) {
  const { draft, edit, dirty, reset } = useDraft(mod, mod.id);
  const st = moduleStats(draft, data.settings.roundMarks);
  const [menu, setMenu] = useState(false);
  const [openPanel, setOpenPanel] = useState<'target' | 'transcript' | null>(null);
  const [retaking, setRetaking] = useState(false);
  const laterSems = data.semesters.slice(data.semesters.findIndex((s) => s.id === sem.id) + 1);
  const [retakeSem, setRetakeSem] = useState(laterSems[0]?.id ?? '');
  const retake = findRetake(data, mod.id);
  const original = mod.retakeOf ? data.semesters.flatMap((s) => s.modules.map((m) => ({ s, m }))).find((x) => x.m.id === mod.retakeOf) : undefined;
  const addRetake = () => {
    if (!retakeSem) return;
    const m = { ...newModule(mod.name, mod.credits, true, false, mod.code), yearLevel: mod.yearLevel ?? null, retakeOf: mod.id };
    update((d) => { d.semesters.find((s) => s.id === retakeSem)?.modules.push(m); });
    setRetaking(false);
    go(`#/s/${retakeSem}/m/${m.id}`);
  };
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
  const saveSettings = () => {
    save(moveTo); guard.dirty = false; setMenu(false);
    if (moveTo !== sem.id) go(`#/s/${moveTo}/m/${mod.id}`);
  };
  const back = () => { if (confirmLeave()) { guard.dirty = false; go(`#/s/${sem.id}`); } };

  const needText = (() => {
    const n = st.needed;
    if (!n || !draft.target) return null;
    if (n.kind === 'pct') return <>You need <b>{fmt(n.value, 1)}%</b> on {st.weightAssessed > 0 ? `the remaining ${fmt((st.totalWeight || 100) - st.weightAssessed, 0)}% of marks` : 'the module overall'} for {draft.target}.</>;
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
                : st.fromExpected ? 'Target grade · no marks yet' : st.projected === null ? 'Set a target grade or enter marks'
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

          <div className="section-head"><h2>Grades</h2></div>
          <Collapse title="Target grade" value={draft.target ?? 'None'} open={openPanel === 'target'} onToggle={() => setOpenPanel(openPanel === 'target' ? null : 'target')}>
            <p className="hint tight">{st.projected === null
              ? `The grade you're aiming for. Until you enter marks, it's used for your predicted ${data.settings.yearWeighting !== false ? 'WGPA and WCGPA' : 'GPA and CGPA'}.`
              : "The grade you're aiming for. Your prediction now comes from your marks."}</p>
            <LetterPicker value={draft.target} onChange={(l) => edit((m) => { m.target = l; m.expected = null; })} />
          </Collapse>
          {needText && <p className="need small-need">{needText}</p>}
          <Collapse title="Transcript grade" value={draft.transcript ?? 'Not released'} open={openPanel === 'transcript'} onToggle={() => setOpenPanel(openPanel === 'transcript' ? null : 'transcript')}>
            <p className="hint tight">Once results are out, pick the letter grade on your transcript. It replaces the prediction in your GPA.</p>
            <LetterPicker value={draft.transcript} onChange={(l) => edit((m) => { m.transcript = l; })} />
          </Collapse>

          {original && (
            <div className="card pad retake-card">
              <b>Retake of {original.m.name}</b>
              <p>Failed in {original.s.name} ({original.m.transcript}). Once this attempt has a transcript grade, it replaces that grade in your WCGPA.</p>
            </div>
          )}
          {isFail(mod.transcript) && (
            <div className="card pad retake-card fail">
              {retake ? (<>
                <b>Retaken in {retake.sem.name}</b>
                <p>{retake.mod.transcript ? `The retake's ${retake.mod.transcript} replaces this ${mod.transcript} in your WCGPA.` : "When the retake's transcript grade is in, it replaces this grade in your WCGPA."} This semester's WGPA stays as on your transcript.</p>
                <button className="secondary" onClick={() => go(`#/s/${retake.sem.id}/m/${retake.mod.id}`)}>Open the retake</button>
              </>) : (<>
                <b>{mod.transcript} is a fail grade</b>
                <p>Add a retake to a later semester. Once the retake has a transcript grade, it replaces this one in your WCGPA.</p>
                <button className="primary" onClick={() => { setRetakeSem(laterSems[0]?.id ?? data.semesters[0].id); setRetaking(true); }}>Add retake</button>
              </>)}
            </div>
          )}
        </>
      )}

      <Sheet open={retaking} onClose={() => setRetaking(false)} title="Retake module" action={{ label: 'Add', onClick: addRetake, disabled: !retakeSem }}>
        <p className="add-to-name">{mod.name}{mod.code ? ` · ${mod.code}` : ''}</p>
        <label className="field"><span>Semester</span>
          <select className="text" value={retakeSem} onChange={(e) => setRetakeSem(e.target.value)}>
            {(laterSems.length ? laterSems : data.semesters).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select></label>
        <p className="form-note">Same credits and year level as the original. You can enter marks and a target grade for it like any module.</p>
      </Sheet>

      <SaveBar show={dirty} onSave={() => save()} onDiscard={reset} />

      <Sheet open={menu} onClose={() => setMenu(false)} title="Module settings" action={{ label: 'Save', onClick: saveSettings }}>
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
        <button className="primary" onClick={saveSettings}>Save</button>
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
