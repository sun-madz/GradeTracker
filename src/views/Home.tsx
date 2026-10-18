import type { AppData } from '../types';
import { cumulative, currentSemester, fmt, gpaLabels, latest, moduleStats } from '../grading';
import { Chevron, GradePill, Ring } from '../ui';
import type { SyncState } from '../store';

export function Home({ data, go, sync }: { data: AppData; go: (h: string) => void; sync: SyncState }) {
  const rows = cumulative(data);
  const L = gpaLabels(data);
  const last = [...rows].reverse().find((r) => r.cgpa !== null);
  const cgpa = last?.cgpa ?? null;
  const exempt = rows.length ? rows[rows.length - 1].cumExempt : 0;
  const credits = (last?.cumCredits ?? 0) + exempt;
  const goal = data.settings.creditsToGraduate;
  const round = data.settings.roundMarks;
  const cur = currentSemester(data);
  const curPred = cur ? latest(cumulative(data, cur.id)) : null;
  const curRow = cur ? cumulative(data, cur.id).find((r) => r.semester.id === cur.id) : null;

  return (
    <div className="page">
      <div className="hero-card">
        <div className="hc-top"><span className="hc-title">My grades</span><SyncDot sync={sync} /></div>
        <Ring value={cgpa}>
          <div className="ring-value">{fmt(cgpa)}</div>
          <div className="ring-label">{L.cgpa}</div>
        </Ring>
        <div className="hc-sub">out of 4.00</div>
        {goal ? (
          <div className="progress on-accent" aria-label="Credits towards graduation">
            <div className="progress-bar"><span style={{ width: `${Math.min(100, (credits / goal) * 100)}%` }} /></div>
            <div className="progress-text">{credits} / {goal} credits to graduate</div>
          </div>
        ) : null}
      </div>

      {cur ? (
        <>
          <button className="section-head link-head" onClick={() => go(`#/s/${cur.id}`)}>
            <h2>This semester · {cur.name}</h2><Chevron />
          </button>
          {curRow && curRow.stats.status === 'predicted' && curRow.stats.gpa !== null && (
            <div className="cur-pred">Predicted <b>{fmt(curRow.stats.gpa)}</b> {L.gpa} · <b>{fmt(curPred?.cgpa)}</b> {L.cgpa}</div>
          )}
          {cur.modules.length === 0 && <p className="empty">No modules yet. Open the semester to add them.</p>}
          <div className="list">
            {cur.modules.map((m) => {
              const st = moduleStats(m, round);
              return (
                <button key={m.id} className="card row-card" onClick={() => go(`#/s/${cur.id}/m/${m.id}`)}>
                  <div className="rc-main">
                    <div className="rc-title">{m.name}</div>
                    <div className="rc-sub">
                      {m.code ? `${m.code} · ` : ''}{m.credits} cr{st.exempt || st.confirmed ? '' : ` · ${st.projected !== null ? `${fmt(st.projected, 1)}%` : st.fromExpected ? `Target ${st.predicted}` : 'No marks yet'}`}
                      {st.exempt && <span className="tag ex">Credit transfer</span>}
                      {st.confirmed && <span className="tag ok">Transcript</span>}
                    </div>
                  </div>
                  <GradePill letter={st.used} confirmed={st.confirmed} exempt={st.exempt} />
                  <Chevron />
                </button>
              );
            })}
          </div>
        </>
      ) : rows.length > 0 ? <p className="empty">All your semesters are confirmed. Pick a current semester in Settings.</p>
        : <p className="empty">No semesters yet. Add one on the Semesters tab.</p>}

    </div>
  );
}

export function SyncDot({ sync }: { sync: SyncState }) {
  if (sync.status === 'off') return null;
  const label = { idle: 'Sheet linked', pending: 'Saving…', syncing: 'Syncing…', ok: 'Synced to Sheet', error: 'Sync failed' }[sync.status];
  return <span className={`sync-dot s-${sync.status}`} title={sync.error ?? label}><i />{label}</span>;
}
