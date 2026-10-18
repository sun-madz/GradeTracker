import { PROGRAMME, SPECIALISATIONS, UNIVERSITY_CORE, YEARS, FLEXIBLE } from '../taylors';
import { SCALE } from '../grading';
import { GradePill } from '../ui';

export function Programme() {
  return (
    <div className="page">
      <div className="page-title"><h1>Programme</h1><p className="muted">{PROGRAMME.name}</p></div>

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
      <p className="hint">GPA = Σ(credits × grade points) ÷ Σ credits. Module lists are from Taylor's website and may change, so check with your faculty. <a href={PROGRAMME.source} target="_blank" rel="noreferrer">Source</a></p>
    </div>
  );
}
