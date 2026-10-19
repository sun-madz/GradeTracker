import { useMemo, useState, type ReactNode } from 'react';
import type { AppData, Flexible, Plan } from '../types';
import { EXTENSIONS, EXTENSION_NAMES, FLEXIBLE, INTAKE_MONTHS, PROGRAMME_SEMESTERS, canonName, completion, MINORS, PROGRAMME, SECOND_MAJOR_NAMES, SPECIALISATIONS, TRACKS, UNIVERSITY_CORE, UNIVERSITY_CORE_EARLIER, YEARS, planGroups, progress } from '../taylors';
import { ELECTIVE_CLUSTERS, ELECTIVES_NEEDED, FEG_SOURCE, RULES, electivesBySchool } from '../flexible';
import { SCALE, isFail, moduleStats } from '../grading';
import { Collapse, GradePill, Icon, MENU_COLORS, MenuGroup, MenuRow, NumInput, Sheet, Toggle, TopBar } from '../ui';
import { newModule, useDraft } from '../store';

type Status = { kind: 'exempt' | 'done' | 'progress' | 'planned' | 'failed'; label: string; sem: string; grade?: ReturnType<typeof moduleStats>['used']; confirmed?: boolean };

function statusMap(d: AppData) {
  const map = new Map<string, Status>();
  for (const s of d.semesters) for (const m of s.modules) {
    const st = moduleStats(m, d.settings.roundMarks);
    const k = canonName(m.name, m.code);
    const v: Status = st.exempt ? { kind: 'exempt', label: 'Exempted', sem: s.name }
      : st.confirmed && isFail(st.used) ? { kind: 'failed', label: 'Failed · retake needed', sem: s.name, grade: st.used, confirmed: true }
      : st.confirmed ? { kind: 'done', label: 'Done', sem: s.name, grade: st.used, confirmed: true }
      : st.projected !== null ? { kind: 'progress', label: st.complete ? 'Awaiting result' : 'In progress', sem: s.name, grade: st.used }
      : { kind: 'planned', label: 'Taking', sem: s.name };
    map.set(k, v);
  }
  return map;
}

const flexLabel: Record<Flexible, string> = { extension: 'Extension', electives: 'Free electives', minor: 'Minor', 'second-major': 'Second major' };
const CREDITS_PER_MODULE = 4;

export function Programme({ data, update, section, go }: { data: AppData; update: (fn: (d: AppData) => void) => void; section?: string; go: (h: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [editingIntake, setEditingIntake] = useState(false);
  const [openSchool, setOpenSchool] = useState<string | null>(null);
  const done = completion(data.plan);
  const [view, setView] = useState<'remaining' | 'all'>('remaining');
  const [adding, setAdding] = useState<string | null>(null);
  const [pickingElectives, setPickingElectives] = useState(false);
  const p = data.plan;
  const status = useMemo(() => statusMap(data), [data]);
  const groups = useMemo(() => planGroups(p), [p]);
  const prog = useMemo(() => progress(groups, new Set([...status].filter(([, v]) => v.kind !== 'failed').map(([k]) => k)), p.electives ?? []), [groups, status, p.electives]);
  const hasPlan = !!(p.specialisation || p.track || p.flexible || p.studentType);
  const left = prog.reduce((n, g) => n + g.needed, 0);
  const total = prog.reduce((n, g) => n + g.total, 0);

  const row = (m: string, withAdd: boolean) => {
    const s = status.get(m.toLowerCase());
    return (
      <li key={m}>
        <span className={`dot ${s?.kind ?? 'todo'}`} />
        <span className="cl-name">{m}{s && <small>{s.label} · {s.sem}</small>}</span>
        {s?.kind === 'exempt' ? <GradePill letter={null} exempt /> : s?.grade ? <GradePill letter={s.grade} confirmed={s.confirmed} /> : null}
        {!s && withAdd && <button className="icon-btn subtle add-mini" aria-label={`Add ${m} to a semester`} onClick={() => setAdding(m)}><Icon name="plus" /></button>}
      </li>
    );
  };

  const sheets = (<>
      <Sheet open={editingIntake} onClose={() => setEditingIntake(false)} title="Intake">
        <IntakeForm plan={p} onSave={(np) => { update((d) => { d.plan = { ...d.plan, ...np }; }); setEditingIntake(false); }} />
      </Sheet>

      <Sheet open={editing} onClose={() => setEditing(false)} title="My plan">
        <PlanForm plan={p} onSave={(np) => { update((d) => { d.plan = np; }); setEditing(false); }} />
      </Sheet>

      <Sheet open={!!adding} onClose={() => setAdding(null)} title="Add to a semester">
        {adding && <AddToSemester data={data} name={adding} onAdd={(semId, credits, exempt) => {
          const m = newModule(adding, credits ?? CREDITS_PER_MODULE, true, exempt);
          update((d) => { d.semesters.find((s) => s.id === semId)?.modules.push(m); });
          setAdding(null);
        }} />}
      </Sheet>

      <Sheet open={pickingElectives} onClose={() => setPickingElectives(false)} title="Free electives">
        <ElectivePicker plan={p} taken={new Set(status.keys())} onSave={(list) => { update((d) => { d.plan.electives = list; }); setPickingElectives(false); }} />
      </Sheet>
  </>);
  const sub = (title: string, content: ReactNode) => (
    <div className="page">
      <TopBar back={() => go('#/programme')} title={title} />
      {content}
      {sheets}
    </div>
  );
  const compLabel = (p.flexible ?? (p.extension && p.extension !== 'none' ? 'extension' : null)) === 'extension' ? `Extension · ${p.extension ?? '—'}` : p.flexible === 'minor' ? `Minor · ${p.minor ?? '—'}` : p.flexible === 'second-major' ? `Second major${p.secondMajor ? ` · ${p.secondMajor}` : ''}` : p.flexible ? flexLabel[p.flexible] : null;

  if (section === 'plan') return sub('My plan', <>
      <div className="card facts">
        <div><span>Specialisation</span><b>{p.specialisation ?? 'Not chosen'}</b></div>
        <div><span>Year 3 track</span><b>{p.track ?? 'Not chosen'}</b></div>
        <div><span>Complementary study</span><b>{(p.flexible ?? (p.extension && p.extension !== 'none' ? 'extension' : null)) === 'extension' ? `Extension · ${p.extension ?? '—'}` : p.flexible === 'minor' ? `Minor · ${p.minor ?? '—'}` : p.flexible === 'second-major' ? `Second major${p.secondMajor ? ` · ${p.secondMajor}` : ''}` : p.flexible ? flexLabel[p.flexible] : 'Not chosen'}</b></div>
        <div><span>Student</span><b>{p.studentType === 'malaysian' ? 'Malaysian' : p.studentType === 'international' ? 'International' : 'Not chosen'}</b></div>
      </div>

      <button className="primary" style={{ marginTop: 14 }} onClick={() => setEditing(true)}>{hasPlan ? 'Edit plan' : 'Set up my plan'}</button>
  </>);
  if (section === 'remaining') return sub('Modules left', <>
      <div className="remaining-hero">
        <div className="rh-num">{left}</div>
        <div className="rh-text"><b>module{left === 1 ? '' : 's'} left to take</b><span>about {left * CREDITS_PER_MODULE} credits · {total - left} of {total} covered</span></div>
      </div>
      <div className="progress slim" style={{ margin: '0 4px 6px' }}><div className="progress-bar"><span style={{ width: `${total ? ((total - left) / total) * 100 : 0}%` }} /></div></div>

      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={view === 'remaining'} className={view === 'remaining' ? 'on' : ''} onClick={() => setView('remaining')}>Remaining</button>
        <button role="tab" aria-selected={view === 'all'} className={view === 'all' ? 'on' : ''} onClick={() => setView('all')}>All modules</button>
      </div>

      {view === 'remaining' && left === 0 && <p className="empty">Nothing left to take in your plan.</p>}
      {prog.map(({ group, takenNames, remaining, needed, total: gTotal }) => {
        if (view === 'remaining' && needed === 0) return null;
        const isPool = group.kind !== 'fixed';
        return (
          <div key={group.key} className="card pad group">
            <div className="group-head">
              <div className="group-title">{group.title}</div>
              <span className={`count ${needed === 0 ? 'ok' : ''}`}>{needed === 0 ? 'Done' : isPool ? `${needed} more to pick` : `${needed} left`}</span>
            </div>
            {view === 'remaining' ? (
              <>
                {isPool && <p className="form-note tight">{group.kind === 'electives' ? `Taken ${gTotal - needed} of ${gTotal}.` : `Choose ${needed} of these:`}</p>}
                {remaining.length > 0 && <ul className="mod-list check">{remaining.map((m) => row(m, true))}</ul>}
              </>
            ) : (
              <ul className="mod-list check">
                {(group.kind === 'electives' ? [...takenNames, ...(p.electives ?? []).filter((m) => !takenNames.includes(m))] : group.modules).map((m) => row(m, true))}
              </ul>
            )}
            {group.kind === 'electives' && <button className="link small block-left" onClick={() => setPickingElectives(true)}>{(p.electives ?? []).length ? 'Change planned electives' : 'Choose electives'}</button>}
            {group.note && <p className="form-note">{group.note}</p>}
          </div>
        );
      })}
      <p className="hint">A module counts as covered once it's in one of your semesters (done, taking or exempted). Tap + to add a remaining module to a semester.</p>

  </>);
  if (section === 'about') return sub('Intake and completion', <>
      <div className="card facts">
        <div><span>Your intake</span><b>{p.intakeMonth && p.intakeYear ? `${p.intakeMonth} ${p.intakeYear}` : 'Not set'}</b></div>
        {done && <div><span>Final semester</span><b>{done.finalStart}</b></div>}
        {done && <div><span>Expected completion</span><b className="accent-text">Around {done.endsAround}</b></div>}
        {!!p.extraSemesters && <div><span>Extended by</span><b>{p.extraSemesters} semester{p.extraSemesters === 1 ? '' : 's'}</b></div>}
        <div><span>Duration</span><b>{PROGRAMME.duration}</b></div>
        <div><span>Intakes</span><b>{PROGRAMME.intakes}</b></div>
        <div><span>School</span><b>{PROGRAMME.school}</b></div>
      </div>
      <p className="hint">{PROGRAMME.calendar}</p>

      <button className="primary" style={{ marginTop: 14 }} onClick={() => setEditingIntake(true)}>{p.intakeMonth ? 'Edit intake' : 'Add intake'}</button>
  </>);
  if (section === 'structure') return sub('Programme structure', <>
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

  </>);
  if (section === 'specialisations') return sub('Specialisations', <>
      <p className="hint">Pick one. Each has 4 modules.</p>
      {SPECIALISATIONS.map((s) => (
        <div key={s.title} className="card pad group">
          <div className="group-title">{s.title}</div>
          <ul className="mod-list">{s.modules.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      ))}

  </>);
  if (section === 'core') return sub('University core (MPU)', <>
      <div className="section-head"><h2>Study guide list</h2></div>
      <div className="card pad group">
        <div className="group-title">All students</div><ul className="mod-list">{UNIVERSITY_CORE.all.map((m) => <li key={m}>{m}</li>)}</ul>
        <div className="group-title">Malaysian students</div><ul className="mod-list">{UNIVERSITY_CORE.malaysian.map((m) => <li key={m}>{m}</li>)}</ul>
        <div className="group-title">International students</div><ul className="mod-list">{UNIVERSITY_CORE.international.map((m) => <li key={m}>{m}</li>)}</ul>
      </div>
      <div className="card pad group">
        <div className="group-title">Earlier intakes</div><ul className="mod-list">{UNIVERSITY_CORE_EARLIER.all.map((m) => <li key={m}>{m}</li>)}</ul>
        <div className="group-title">Malaysian students</div><ul className="mod-list">{UNIVERSITY_CORE_EARLIER.malaysian.map((m) => <li key={m}>{m}</li>)}</ul>
        <div className="group-title">International students</div><ul className="mod-list">{UNIVERSITY_CORE_EARLIER.international.map((m) => <li key={m}>{m}</li>)}</ul>
      </div>

  </>);
  if (section === 'electives') return sub('Free electives', <>
      <p className="hint">Grouped by the school that teaches each subject. Taylor's guide sorts them into three clusters (AHSS, BSM, STS), shown on each module, and each school decides which ones it offers before registration. Choose five, ideally one from each cluster.</p>
      {electivesBySchool().map(({ school, modules }) => (
        <Collapse key={school} title={school} value={`${modules.length}`} open={openSchool === school} onToggle={() => setOpenSchool(openSchool === school ? null : school)}>
          <ul className="mod-list check">
            {modules.map(({ name, cluster }) => {
              const st = status.get(name.toLowerCase());
              return (
                <li key={name}>
                  <span className={`dot ${st?.kind ?? 'todo'}`} />
                  <span className="cl-name">{name}<small>{cluster}{st ? ` · ${st.label} · ${st.sem}` : (p.electives ?? []).includes(name) ? ' · Planned' : ''}</small></span>
                  {!st && <button className="icon-btn subtle add-mini" aria-label={`Add ${name} to a semester`} onClick={() => setAdding(name)}><Icon name="plus" /></button>}
                </li>
              );
            })}
          </ul>
        </Collapse>
      ))}
  </>);
  if (section === 'complementary') return sub('Complementary study', <>
      <div className="card pad"><ul className="mod-list">{[...FLEXIBLE, ...RULES].map((m) => <li key={m}>{m}</li>)}</ul></div>
      <p className="hint">Lists come from Taylor's Flexible Education Guide (2026 intakes). Earlier intakes may differ slightly, so check your Programme Guide. <a href={FEG_SOURCE} target="_blank" rel="noreferrer">Source</a></p>

  </>);
  if (section === 'grading') return sub('Grading scale', <>
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
      <p className="hint">WGPA / WCGPA = Σ(credits × year weight × grade points) ÷ Σ(credits × year weight), where Year 1 = 20%, Year 2 = 30% and Year 3 = 50% (bachelor's intakes from January 2021). Credit-transfer exemptions earn credits but carry no grade. Module lists are from Taylor's website and may change, so check with your faculty. <a href={PROGRAMME.source} target="_blank" rel="noreferrer">Source</a></p>
  </>);

  return (
    <div className="page">
      <div className="page-title big"><h1>Programme</h1><p className="muted">{PROGRAMME.name}</p></div>
      <MenuGroup>
        <MenuRow icon="target" color={MENU_COLORS.green} title="My plan" sub={hasPlan ? [p.specialisation, p.track, compLabel].filter(Boolean).join(' · ') : 'Not set up yet'} onClick={() => go('#/programme/plan')} />
        <MenuRow icon="list" color={MENU_COLORS.blue} title="Modules left" sub={`${total - left} of ${total} covered`} badge={left} onClick={() => go('#/programme/remaining')} />
        <MenuRow icon="calendar" color={MENU_COLORS.orange} title="Intake and completion" sub={done ? `Finishing around ${done.endsAround}` : 'Add your intake'} onClick={() => go('#/programme/about')} />
      </MenuGroup>
      <MenuGroup>
        <MenuRow icon="layers" color={MENU_COLORS.indigo} title="Programme structure" sub="Year 1–3 modules and tracks" onClick={() => go('#/programme/structure')} />
        <MenuRow icon="star" color={MENU_COLORS.purple} title="Specialisations" sub="Data Science, AI, Cyber Security, Mobile" onClick={() => go('#/programme/specialisations')} />
        <MenuRow icon="flag" color={MENU_COLORS.teal} title="University core (MPU)" sub="Compulsory general studies" onClick={() => go('#/programme/core')} />
        <MenuRow icon="puzzle" color={MENU_COLORS.pink} title="Complementary study" sub="Extensions, minors, electives" onClick={() => go('#/programme/complementary')} />
        <MenuRow icon="book" color={MENU_COLORS.orange} title="Free electives" sub="Grouped by school" onClick={() => go('#/programme/electives')} />
      </MenuGroup>
      <MenuGroup>
        <MenuRow icon="scale" color={MENU_COLORS.lime} title="Grading scale" sub="Grades, points and WGPA weighting" onClick={() => go('#/programme/grading')} />
      </MenuGroup>
      {sheets}
    </div>
  );
}

function AddToSemester({ data, name, onAdd }: { data: AppData; name: string; onAdd: (semId: string, credits: number | null, exempt: boolean) => void }) {
  const lastWithModules = [...data.semesters].reverse().find((s) => s.modules.length) ?? data.semesters[0];
  const [semId, setSemId] = useState(lastWithModules?.id ?? '');
  const [credits, setCredits] = useState<number | null>(CREDITS_PER_MODULE);
  const [exempt, setExempt] = useState(false);
  if (!data.semesters.length) return <p className="form-note">Add a semester on the Grades tab first.</p>;
  return (
    <>
      <p className="add-to-name">{name}</p>
      <label className="field"><span>Semester</span>
        <select className="text" value={semId} onChange={(e) => setSemId(e.target.value)}>
          {data.semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select></label>
      <label className="field"><span>Credits</span><NumInput value={credits} onChange={setCredits} placeholder="4" /></label>
      <div className="card"><Toggle on={exempt} onChange={setExempt} label="Exempted (credit transfer)" /></div>
      <button className="primary" disabled={!semId} onClick={() => onAdd(semId, credits, exempt)}>Add module</button>
    </>
  );
}

function ElectivePicker({ plan, taken, onSave }: { plan: Plan; taken: Set<string>; onSave: (l: string[]) => void }) {
  const [sel, setSel] = useState<string[]>(plan.electives ?? []);
  const [q, setQ] = useState('');
  const t = q.trim().toLowerCase();
  const exclude = new Set(planGroups({ ...plan, flexible: null }).flatMap((g) => g.modules.map((m) => m.toLowerCase())));
  const toggle = (m: string) => setSel((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));
  const changed = JSON.stringify(sel) !== JSON.stringify(plan.electives ?? []);
  return (
    <>
      <p className="form-note tight">Pick the {ELECTIVES_NEEDED} you plan to take ({sel.length} selected). Modules already in your programme are hidden.</p>
      <input className="text" placeholder="Search electives" value={q} onChange={(e) => setQ(e.target.value)} />
      {ELECTIVE_CLUSTERS.map((c) => {
        const mods = c.modules.filter((m) => !exclude.has(m.toLowerCase()) && (!t || m.toLowerCase().includes(t)));
        if (!mods.length) return null;
        return (
          <div key={c.short} className="form-block" style={{ marginTop: 14 }}>
            <div className="form-label">{c.name} ({c.short})</div>
            <div className="choice">
              {mods.map((m) => <button key={m} className={`chip ${sel.includes(m) ? 'on' : ''}`} onClick={() => toggle(m)}>{m}{taken.has(m.toLowerCase()) ? ' ✓' : ''}</button>)}
            </div>
          </div>
        );
      })}
      <button className="primary" disabled={!changed} onClick={() => onSave(sel)}>Save electives</button>
    </>
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
  const init = { ...plan, flexible: plan.flexible ?? (plan.extension && plan.extension !== 'none' ? 'extension' as const : null) };
  const { draft, edit, dirty } = useDraft(init, 'plan', false);
  const extOptions = draft.specialisation ? EXTENSIONS[draft.specialisation] : EXTENSION_NAMES;
  return (
    <>
      <div className="form-block"><div className="form-label">Specialisation</div>
        <Choice options={SPECIALISATIONS.map((s) => s.title)} value={draft.specialisation}
          onChange={(v) => edit((p) => { p.specialisation = v; if (p.extension && !EXTENSIONS[v].includes(p.extension)) p.extension = null; })} /></div>

      <div className="form-block"><div className="form-label">Complementary study (5 modules)</div>
        <Choice options={['extension', 'minor', 'electives', 'second-major'] as Flexible[]} value={draft.flexible}
          labels={{ extension: 'Extension', minor: 'Minor', electives: 'Free electives', 'second-major': 'Second major (12)' }} onChange={(v) => edit((p) => { p.flexible = v; })} />
        {draft.flexible === 'extension' && <><div className="form-label" style={{ marginTop: 14 }}>Which extension?</div>
          <Choice options={extOptions} value={draft.extension} onChange={(v) => edit((p) => { p.extension = v; })} />
          <p className="form-note">Must be different from your specialisation.</p></>}
        {draft.flexible === 'minor' && <><div className="form-label" style={{ marginTop: 14 }}>Which minor?</div><Choice options={MINORS} value={draft.minor} onChange={(v) => edit((p) => { p.minor = v; })} /></>}
        {draft.flexible === 'second-major' && <><div className="form-label" style={{ marginTop: 14 }}>Which second major?</div><Choice options={SECOND_MAJOR_NAMES} value={draft.secondMajor || null} onChange={(v) => edit((p) => { p.secondMajor = v; })} /></>}
        {draft.flexible === 'electives' && <p className="form-note">After saving, tap "Choose electives" under My modules to pick them.</p>}
      </div>

      <div className="form-block"><div className="form-label">Year 3 track</div>
        <Choice options={TRACKS} value={draft.track} onChange={(v) => edit((p) => { p.track = v; })} /></div>

      <div className="form-block"><div className="form-label">Student</div>
        <Choice options={['malaysian', 'international'] as ('malaysian' | 'international')[]} value={draft.studentType}
          labels={{ malaysian: 'Malaysian', international: 'International' }} onChange={(v) => edit((p) => { p.studentType = v; })} />
        <p className="form-note">Decides which university core (MPU) modules you take.</p></div>

      <div className="form-block"><div className="form-label">University core list</div>
        <Choice options={['earlier', 'current'] as ('current' | 'earlier')[]} value={draft.coreVersion ?? 'earlier'}
          labels={{ earlier: 'Study guide (EI, Social Innovation Project…)', current: 'Newer list (Youth and Leadership…)' }} onChange={(v) => edit((p) => { p.coreVersion = v; })} /></div>

      <button className="primary" disabled={!dirty} onClick={() => onSave(draft)}>Save plan</button>
    </>
  );
}

function IntakeForm({ plan, onSave }: { plan: Plan; onSave: (p: Pick<Plan, 'intakeMonth' | 'intakeYear' | 'extraSemesters'>) => void }) {
  const [month, setMonth] = useState(plan.intakeMonth ?? null);
  const [year, setYear] = useState<number | null>(plan.intakeYear ?? null);
  const [extra, setExtra] = useState<number | null>(plan.extraSemesters ?? 0);
  const preview = completion({ ...plan, intakeMonth: month, intakeYear: year, extraSemesters: extra });
  const valid = !!month && !!year && year > 2000 && year < 2100;
  return (
    <>
      <div className="form-block"><div className="form-label">Intake month</div>
        <Choice options={[...INTAKE_MONTHS]} value={month} onChange={(v) => setMonth(v)} /></div>
      <label className="field"><span>Intake year</span><NumInput value={year} onChange={setYear} placeholder="e.g. 2025" /></label>
      <label className="field"><span>Extra semesters (if you extended your studies)</span><NumInput value={extra} onChange={setExtra} placeholder="0" /></label>
      {preview && valid && <div className="check ok">Final semester {preview.finalStart} · expected to finish around <b>{preview.endsAround}</b> ({preview.semesters} semesters).</div>}
      <p className="form-note">The programme is {PROGRAMME_SEMESTERS} semesters over 3 years, including short semesters (study guide: September 2025 intake → final semester April 2028).</p>
      <button className="primary" disabled={!valid} onClick={() => onSave({ intakeMonth: month, intakeYear: year, extraSemesters: extra ?? 0 })}>Save intake</button>
    </>
  );
}
