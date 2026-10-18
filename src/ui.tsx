import { useEffect, useState, type ReactNode } from 'react';
import type { Letter } from './types';
import { gradeTone, LETTERS } from './grading';

export function GradePill({ letter, confirmed, size = 'md', exempt }: { letter: Letter | null; confirmed?: boolean; size?: 'md' | 'lg'; exempt?: boolean }) {
  if (exempt) return <span className={`pill tone-ex soft ${size}`} title="Exempted (credit transfer)">EX</span>;
  return (
    <span className={`pill tone-${gradeTone(letter)} ${confirmed ? 'solid' : 'soft'} ${size}`} title={confirmed ? 'From transcript' : 'Predicted'}>
      {letter ?? '–'}
    </span>
  );
}

export function NumInput({ value, onChange, placeholder, className, ariaLabel }: {
  value: number | null; onChange: (v: number | null) => void; placeholder?: string; className?: string; ariaLabel?: string;
}) {
  const [text, setText] = useState(value === null || value === undefined ? '' : String(value));
  useEffect(() => {
    const parsed = text.trim() === '' ? null : Number(text);
    if (parsed !== value) setText(value === null || value === undefined ? '' : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <input
      className={`num ${className ?? ''}`} inputMode="decimal" value={text} placeholder={placeholder} aria-label={ariaLabel}
      onChange={(e) => {
        const t = e.target.value.replace(',', '.');
        if (!/^\d*\.?\d*$/.test(t)) return;
        setText(t);
        if (t === '' ) onChange(null);
        else if (!t.endsWith('.') && Number.isFinite(Number(t))) onChange(Number(t));
      }}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function TopBar({ title, back, right }: { title?: string; back?: () => void; right?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-side">{back && <button className="icon-btn" onClick={back} aria-label="Back"><Chevron dir="left" /></button>}</div>
      <div className="topbar-title">{title}</div>
      <div className="topbar-side right">{right}</div>
    </header>
  );
}

export interface SheetAction { label: string; onClick: () => void; disabled?: boolean }

export function Sheet({ open, onClose, title, children, action }: { open: boolean; onClose: () => void; title: string; children: ReactNode; action?: SheetAction }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <button className="link muted-link" onClick={onClose}>Cancel</button>
          <h3>{title}</h3>
          <span className="sheet-action">{action && <button className="link" disabled={action.disabled} onClick={action.onClick}>{action.label}</button>}</span>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function LetterPicker({ value, onChange, allowNone = true }: { value: Letter | null; onChange: (l: Letter | null) => void; allowNone?: boolean }) {
  return (
    <div className="letter-grid">
      {allowNone && <button className={`chip ${value === null ? 'on' : ''}`} onClick={() => onChange(null)}>None</button>}
      {LETTERS.map((l) => (
        <button key={l} className={`chip ${value === l ? 'on' : ''}`} onClick={() => onChange(l)}>{l}</button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className="row toggle-row" onClick={() => onChange(!on)} role="switch" aria-checked={on}>
      <span>{label}</span><span className={`switch ${on ? 'on' : ''}`}><span /></span>
    </button>
  );
}

export function Chevron({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === 'right' ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
    </svg>
  );
}

export type IconName = 'grades' | 'book' | 'gear' | 'plus' | 'more' | 'trash' | 'cloud' | 'target' | 'list' | 'calendar' | 'layers' | 'star'
  | 'flag' | 'puzzle' | 'scale' | 'palette' | 'clock' | 'sliders' | 'archive' | 'folder' | 'info';
export function Icon({ name }: { name: IconName }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (name) {
    case 'grades': return <svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>;
    case 'book': return <svg {...p}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" /><path d="M8 7h7" /></svg>;
    case 'gear': return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
    case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'more': return <svg {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;
    case 'trash': return <svg {...p}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>;
    case 'cloud': return <svg {...p}><path d="M17.5 19H7a5 5 0 1 1 1-9.9A6 6 0 0 1 19 11a4 4 0 0 1-1.5 8z" /></svg>;
    case 'target': return <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>;
    case 'list': return <svg {...p}><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" /></svg>;
    case 'calendar': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
    case 'layers': return <svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></svg>;
    case 'star': return <svg {...p}><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z" /></svg>;
    case 'flag': return <svg {...p}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>;
    case 'puzzle': return <svg {...p}><path d="M10 3h4v3a2 2 0 1 0 4 0V3h3v7h-3a2 2 0 1 0 0 4h3v7h-7v-3a2 2 0 1 0-4 0v3H3v-7h3a2 2 0 1 0 0-4H3V3h7z" /></svg>;
    case 'scale': return <svg {...p}><path d="M12 3v18M5 21h14M6 7h12" /><path d="M6 7l-3 6a3 3 0 0 0 6 0L6 7zM18 7l-3 6a3 3 0 0 0 6 0l-3-6z" /></svg>;
    case 'palette': return <svg {...p}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case 'sliders': return <svg {...p}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>;
    case 'archive': return <svg {...p}><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" /></svg>;
    case 'folder': return <svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /></svg>;
    case 'info': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></svg>;
  }
}

export function SaveBar({ show, onSave, onDiscard, label = 'Save changes' }: { show: boolean; onSave: () => void; onDiscard: () => void; label?: string }) {
  if (!show) return null;
  return (
    <div className="savebar" role="region" aria-label="Unsaved changes">
      <span className="savebar-text">Unsaved changes</span>
      <button className="secondary" onClick={onDiscard}>Discard</button>
      <button className="primary" onClick={onSave}>{label}</button>
    </div>
  );
}

export function Ring({ value, max = 4, size = 148, children }: { value: number | null; max?: number; size?: number; children?: ReactNode }) {
  const r = (size - 14) / 2, c = 2 * Math.PI * r;
  const pct = value === null ? 0 : Math.max(0, Math.min(1, value / max));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth="10" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-fill" strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-inner">{children}</div>
    </div>
  );
}

export const ACCENTS = { green: '#1f8a5b', orange: '#e8622c', purple: '#8b3fd9', blue: '#2f5bea' } as const;

export function MenuGroup({ children }: { children: ReactNode }) {
  return <div className="menu-group">{children}</div>;
}

export function MenuRow({ icon, color, title, sub, badge, onClick }: { icon: IconName; color: string; title: string; sub?: ReactNode; badge?: ReactNode; onClick: () => void }) {
  return (
    <button className="menu-row" onClick={onClick}>
      <span className="menu-icon" style={{ background: color }}><Icon name={icon} /></span>
      <span className="menu-text"><span className="menu-title">{title}</span>{sub && <span className="menu-sub">{sub}</span>}</span>
      {badge && <span className="menu-badge">{badge}</span>}
      <Chevron />
    </button>
  );
}

export function Collapse({ title, value, open, onToggle, children }: { title: string; value: ReactNode; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className={`card collapse ${open ? 'open' : ''}`}>
      <button className="collapse-head" onClick={onToggle} aria-expanded={open}>
        <span className="collapse-title">{title}</span>
        <span className="collapse-value">{value}</span>
        <span className={`caret ${open ? 'up' : ''}`}><Chevron /></span>
      </button>
      {open && <div className="collapse-body">{children}</div>}
    </div>
  );
}

export const MENU_COLORS = { blue: '#3d7cf5', indigo: '#5b5cf0', purple: '#8b5cf6', orange: '#ef6b3a', green: '#34b26b', lime: '#8cc63f', pink: '#e5577c', teal: '#14a3a3', grey: '#7a7f8a' };
