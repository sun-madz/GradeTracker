import { useEffect, useState } from 'react';
import { confirmLeave, guard, nav, useStore } from './store';
import { Icon } from './ui';
import { Home } from './views/Home';
import { SemesterView } from './views/SemesterView';
import { ModuleView } from './views/ModuleView';
import { Programme } from './views/Programme';
import { Settings } from './views/Settings';
import { Semesters } from './views/Semesters';
import { Welcome } from './views/Welcome';

function useHash() {
  const [hash, setHash] = useState(location.hash || '#/');
  useEffect(() => {
    const on = () => { setHash(location.hash || '#/'); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

export default function App() {
  const { data, update, replace, sync, syncNow } = useStore();
  useEffect(() => { document.documentElement.dataset.accent = data?.settings.accent ?? 'green'; }, [data?.settings.accent]);
  const hash = useHash();
  const go = (h: string) => { location.hash = h; };
  const navGuard = (e: React.MouseEvent) => { if (!confirmLeave()) e.preventDefault(); else guard.dirty = false; };

  if (!data) return <Welcome replace={replace} />;

  const parts = hash.replace(/^#\/?/, '').split('/');
  if (parts[0] === '' ) nav.lastTop = '#/';
  if (parts[0] === 'semesters') nav.lastTop = '#/semesters';
  let view = <Home data={data} go={go} sync={sync} />;
  let tab: 'grades' | 'semesters' | 'programme' | 'settings' = 'grades';

  if (parts[0] === 'programme') { view = <Programme data={data} update={update} section={parts[1]} go={go} />; tab = 'programme'; }
  else if (parts[0] === 'settings') { view = <Settings data={data} update={update} replace={replace} sync={sync} syncNow={syncNow} section={parts[1]} go={go} />; tab = 'settings'; }
  else if (parts[0] === 'semesters') { view = <Semesters data={data} update={update} go={go} />; tab = 'semesters'; }
  else if (parts[0] === 's') {
    tab = nav.lastTop === '#/semesters' ? 'semesters' : 'grades';
    const sem = data.semesters.find((s) => s.id === parts[1]);
    const mod = parts[2] === 'm' ? sem?.modules.find((m) => m.id === parts[3]) : undefined;
    if (sem && mod) view = <ModuleView data={data} sem={sem} mod={mod} update={update} go={go} />;
    else if (sem) view = <SemesterView data={data} sem={sem} update={update} go={go} />;
  }

  return (
    <div className="app">
      <main>{view}</main>
      <nav className="tabbar">
        <a href="#/" onClick={navGuard} className={tab === 'grades' ? 'on' : ''}><Icon name="grades" /><span>Grades</span></a>
        <a href="#/semesters" onClick={navGuard} className={tab === 'semesters' ? 'on' : ''}><Icon name="folder" /><span>Semesters</span></a>
        <a href="#/programme" onClick={navGuard} className={tab === 'programme' ? 'on' : ''}><Icon name="book" /><span>Programme</span></a>
        <a href="#/settings" onClick={navGuard} className={tab === 'settings' ? 'on' : ''}><Icon name="gear" /><span>Settings</span></a>
      </nav>
    </div>
  );
}
