// Protocole de priorité (niveaux 1 à 5) : sélection obligatoire avant toute délégation ou transmission, badge et légende.
// La couleur n'est jamais seule porteuse de sens : chaque badge affiche aussi « P1 Critique », etc.
import { Link } from 'react-router-dom';
import { useApi } from '../lib/hooks';

export interface PriorityLevel { level: number; code: string; label: string; color: string; response: string; response_hours: number; criteria: string[] }

/** Référence locale (affichage immédiat) ; les critères officiels viennent du serveur. */
const FALLBACK: PriorityLevel[] = [
  { level: 1, code: 'P1', label: 'Critique', color: '#C81E1E', response: 'Prise en charge immédiate (sous 4 heures)', response_hours: 4, criteria: [] },
  { level: 2, code: 'P2', label: 'Haute', color: '#EA580C', response: 'Prise en charge sous 24 heures', response_hours: 24, criteria: [] },
  { level: 3, code: 'P3', label: 'Moyenne', color: '#CA8A04', response: 'Prise en charge sous 3 jours ouvrés', response_hours: 72, criteria: [] },
  { level: 4, code: 'P4', label: 'Normale', color: '#2563EB', response: 'Prise en charge sous 7 jours', response_hours: 168, criteria: [] },
  { level: 5, code: 'P5', label: 'Basse', color: '#64748B', response: 'Prise en charge sous 30 jours', response_hours: 720, criteria: [] },
];
const LEGACY: Record<string, number> = { critique: 1, haute: 2, normale: 4, basse: 5 };

export function usePriorityLevels(): PriorityLevel[] {
  const r = useApi<{ rows: PriorityLevel[] }>(['priority-levels'], '/api/priority-levels');
  return r.data?.rows?.length ? r.data.rows : FALLBACK;
}

/** Badge de niveau : pastille de couleur + code + libellé. Accepte un niveau ou, à défaut, l'ancienne priorité texte. */
export function PriorityBadge({ level, legacy, compact }: { level?: number | null; legacy?: string | null; compact?: boolean }) {
  const n = level ?? (legacy ? LEGACY[legacy] : undefined);
  const p = FALLBACK.find((x) => x.level === n);
  if (!p) return <span className="muted">—</span>;
  return (
    <span className={`prio-badge prio-${p.level}`} style={{ ['--prio' as any]: p.color }} title={`Priorité ${p.code} — ${p.label} : ${p.response.toLowerCase()}`}>
      <span className="prio-dot" aria-hidden />{p.code}{!compact && <> {p.label}</>}
    </span>
  );
}

/** Choix obligatoire du niveau : aucun niveau n'est présélectionné ; les critères du niveau choisi sont rappelés. */
export function PrioritySelect({ value, onChange, error, required = true, label = 'Niveau de priorité' }: { value?: number | null; onChange: (v: number) => void; error?: string; required?: boolean; label?: string }) {
  const levels = usePriorityLevels();
  const sel = levels.find((p) => p.level === value);
  const id = 'prio-' + label.replace(/\W+/g, '-');
  return (
    <div className={`field span-2 prio-field${error ? ' has-error' : ''}`}>
      <div className="field-label" id={id}>{label}{required && <span className="req" aria-hidden> *</span>} <Link to="/protocole-priorites" className="xsmall" target="_blank">Voir la légende</Link></div>
      <div className="prio-select" role="radiogroup" aria-labelledby={id} aria-required={required} aria-invalid={!!error}>
        {levels.map((p) => (
          <button key={p.level} type="button" role="radio" aria-checked={value === p.level} className={`prio-option${value === p.level ? ' on' : ''}`}
            style={{ ['--prio' as any]: p.color }} onClick={() => onChange(p.level)}>
            <span className="prio-dot" aria-hidden /><strong>{p.code}</strong> {p.label}
          </button>
        ))}
      </div>
      {sel ? (
        <div className="prio-help xsmall"><strong>{sel.response}.</strong>{sel.criteria.length ? ` Critères : ${sel.criteria.join(' ; ')}.` : ''}</div>
      ) : (
        <div className="prio-help xsmall muted">Protocole obligatoire : choisissez le niveau avant de transmettre.</div>
      )}
      {error && <div className="field-error" role="alert">{error}</div>}
    </div>
  );
}

/** Légende compacte (listes, Kanban, palettes). */
export function PriorityLegend() {
  const levels = usePriorityLevels();
  return (
    <div className="prio-legend" aria-label="Légende des niveaux de priorité">
      {levels.map((p) => <PriorityBadge key={p.level} level={p.level} />)}
      <Link to="/protocole-priorites" className="xsmall">Critères et délais</Link>
    </div>
  );
}
