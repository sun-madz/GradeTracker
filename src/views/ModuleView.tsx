import { useState } from 'react';
import type { AppData, Module, Semester } from '../types';
import { fmt, moduleStats } from '../grading';
import { GradePill, Icon, LetterPicker, NumInput, Sheet, Toggle, TopBar } from '../ui';
import { uid } from '../store';

export function ModuleView({ data, sem, mod, update, go }: {
  data: AppData; sem: Semester; mod: Module; update: (fn: (d: AppData) => void) => void; go: (h: string) => void;
}) {
  const st = moduleStats(mod, data.settings.roundMarks);
  const [menu, setMenu] = useState(false);
  const edit = (fn: (m: Module) => void) => update((d) => {
    const m = d.semesters.find((s) => s.id === sem.id)?.modules.find((x) => x.id === mod.id);
    if (m) fn(m);
  });
  const back = () => go(`#/s/${sem.id}`);

  const needText = (() => {
    const n = st.needed;
    if (!n || !mod.target) return null;
    if (n.kind === 'pct') return <>You need <b>{fmt(n.value, 1)}%</b> on the remaining {fmt(st.totalWeight - st.weightAssessed, 0)}% of marks for {mod.target}.</>;
    if (n.kind === 'secured') return <>{mod.target} is already secured.</>;
    if (n.kind === 'out') return <>{mod.target} is out of reach. Even 100% on what's left won't get there.</>;
    if (n.kind === 'achieved') return <>You reached {mod.target}.</>;
    return <>You finished below {mod.target}.</>;
  })();

  return (
    <div className="page">
      <TopBar back={back} title={sem.name} right={<button className="icon-btn" onClick={() => setMenu(true)} aria-label="Module options"><Icon name="more" /></button>} />

      <div className="mod-head">
        <textarea className="title-input" rows={1} value={mod.name} ref={(el) => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }} onChange={(e) => edit((m) => { m.name = e.target.value.replace(/\n/g, " "); })} aria-label="Module name" />
        <div className="mod-summary">
          <GradePill letter={st.used} confirmed={st.confirmed} size="lg" />
          <div>
            <div className="big-num">{st.projected === null ? '—' : `${fmt(st.projected, 1)}%`}</div>
            <div className="muted small">
              {st.confirmed ? `Transcript grade${st.predicted && st.predicted !== mod.transcript ? ` · predicted ${st.predicted}` : st.predicted ? ' · matches prediction' : ''}`
                : st.projected === null ? 'Enter a mark to see a prediction'
                : st.complete ? 'Predicted · all marks in' : `Projected at your current pace · ${fmt(st.secured, 1)} marks banked`}
            </div>
          </div>
        </div>
        {st.weightAssessed > 0 && st.totalWeight > 0 && (
          <div className="progress slim"><div className="progress-bar"><span style={{ width: `${Math.min(100, (st.weightAssessed / st.totalWeight) * 100)}%` }} /></div>
            <div className="progress-text">{fmt(st.weightAssessed, 0)}% of the module marked</div></div>
        )}
      </div>

      <div className="section-head"><h2>Assessments</h2><span className="muted small">score / out of</span></div>
      <div className="card">
        {mod.assessments.map((a, i) => {
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

      <div className="section-head"><h2>Target grade</h2></div>
      <div className="card pad">
        <LetterPicker value={mod.target} onChange={(l) => edit((m) => { m.target = l; })} />
        {needText && <p className="need">{needText}</p>}
      </div>

      <div className="section-head"><h2>Transcript grade</h2></div>
      <div className="card pad">
        <p className="hint tight">Once results are out, pick the letter grade on your transcript. It replaces the prediction in your GPA.</p>
        <LetterPicker value={mod.transcript} onChange={(l) => edit((m) => { m.transcript = l; })} />
      </div>

      <Sheet open={menu} onClose={() => setMenu(false)} title="Module settings">
        <label className="field"><span>Credits</span><NumInput value={mod.credits} onChange={(v) => edit((m) => { m.credits = v ?? 0; })} /></label>
        <div className="card"><Toggle on={mod.countsInGPA} onChange={(v) => edit((m) => { m.countsInGPA = v; })} label="Counts towards GPA" /></div>
        <label className="field"><span>Move to semester</span>
          <select className="text" value={sem.id} onChange={(e) => {
            const to = e.target.value;
            update((d) => {
              const from = d.semesters.find((s) => s.id === sem.id)!; const dest = d.semesters.find((s) => s.id === to)!;
              const idx = from.modules.findIndex((m) => m.id === mod.id);
              dest.modules.push(...from.modules.splice(idx, 1));
            });
            setMenu(false); go(`#/s/${to}/m/${mod.id}`);
          }}>
            {data.semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <button className="danger" onClick={() => {
          if (!confirm(`Delete ${mod.name}?`)) return;
          update((d) => { const s = d.semesters.find((x) => x.id === sem.id)!; s.modules = s.modules.filter((m) => m.id !== mod.id); });
          back();
        }}>Delete module</button>
      </Sheet>
    </div>
  );
}
