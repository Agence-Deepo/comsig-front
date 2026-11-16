// Tuile du portail au modèle COM&SIG : cadre doré, scène (ou photo déposée par l'administration),
// bandeau marine à coin arrondi souligné d'or, pictogramme doré et nom du département en blanc.
import { useId, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Coins, Factory, Hammer, Handshake, Monitor, MonitorCog, Network, PaintRoller, Printer, Scale, ShieldCheck, Users, Drill, type LucideProps } from 'lucide-react';
import { Scene } from './PortalScenes';
import { modelTileOf } from './ModelTiles';

export interface PortalTileData {
  code: string; label: string; caption?: string; description?: string; scene?: string; icon?: string; photo?: string | null;
  department_code?: string | null; parent_code?: string | null; kind?: 'departement' | 'fonction';
}

/** Clé et tournevis croisés (technicien terrain), dans le style des pictogrammes Lucide. */
function ToolsCross({ color, children, ...p }: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      {children}
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      <path d="m3 3 3 1 7 7-2 2-7-7z" /><path d="m14 14 2.5-2.5 4.8 4.8a1.77 1.77 0 0 1-2.5 2.5z" />
    </svg>
  );
}

const ICONS: Record<string, ComponentType<LucideProps>> = {
  organigramme: Network, poignee: Handshake, usine: Factory, pieces: Coins, ecran: Monitor, agenda: CalendarDays, imprimante: Printer,
  outils: ToolsCross, equipe: Users, balance: Scale, ordinateur: MonitorCog, rouleau: PaintRoller, marteau: Hammer, fraiseuse: Drill, bouclier: ShieldCheck,
};

/** Pictogramme doré (dégradé or appliqué au trait). */
export function GoldIcon({ name, size = 44 }: { name?: string; size?: number }) {
  const gid = `gold${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const Icon = ICONS[name ?? ''] ?? Network;
  return (
    <Icon size={size} color={`url(#${gid})`} strokeWidth={2.1} aria-hidden>
      <defs><linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22"><stop offset="0" stopColor="#fff3b8" /><stop offset=".45" stopColor="#e9bb52" /><stop offset="1" stopColor="#b17a1f" /></linearGradient></defs>
    </Icon>
  );
}

/** Tuile cliquable (lien ou bouton) ; `still` : tuile d'illustration (non cliquable).
 *  Tuile du modèle COM&SIG : l'image du modèle telle quelle ; sinon tuile composée (scène ou photo, bandeau, nom). */
export function PortalTile({ tile, to, onClick, ariaLabel, still }: { tile: PortalTileData; to?: string; onClick?: () => void; ariaLabel?: string; still?: boolean }) {
  const model = modelTileOf(tile);
  if (model) {
    const img = <img src={model.src} alt={still ? tile.label : ''} width={model.width} height={model.height} draggable={false} />;
    if (still) return <div className="ptile-model still">{img}</div>;
    if (to) return <Link className="ptile-model" to={to} aria-label={ariaLabel ?? tile.label} title={tile.description || undefined}>{img}</Link>;
    return <button type="button" className="ptile-model" onClick={onClick} aria-label={ariaLabel ?? tile.label} title={tile.description || undefined}>{img}</button>;
  }
  const inner = (
    <span className="ptile-inner">
      <span className="ptile-photo">{tile.photo ? <img src={tile.photo} alt="" loading="lazy" /> : <Scene name={tile.scene ?? tile.code} />}</span>
      <span className="ptile-band">
        <span className="ptile-icon"><GoldIcon name={tile.icon} /></span>
        <span className="ptile-text"><span className="ptile-label">{tile.label}</span>{tile.caption ? <span className="ptile-caption">{tile.caption}</span> : null}</span>
      </span>
    </span>
  );
  if (still) return <div className="ptile still">{inner}</div>;
  if (to) return <Link className="ptile" to={to} aria-label={ariaLabel} title={tile.description || undefined}>{inner}</Link>;
  return <button type="button" className="ptile" onClick={onClick} aria-label={ariaLabel} title={tile.description || undefined}>{inner}</button>;
}

/** Tuiles par défaut du portail (identiques au référentiel du serveur ; les 9 du modèle affichées d'office) : démonstration hors ligne. */
export const DEFAULT_TILES: (PortalTileData & { roles?: string[]; hidden?: boolean })[] = [
  { code: 'direction', label: 'Direction générale', icon: 'organigramme', department_code: 'direction' },
  { code: 'commercial', label: 'Commerciale', icon: 'poignee', department_code: 'commercial' },
  { code: 'production', label: 'Production', icon: 'usine', department_code: 'production' },
  { code: 'comptabilite', label: 'Comptabilité', icon: 'pieces', department_code: 'comptabilite' },
  { code: 'regie', label: 'Régie publicitaire et médias', icon: 'ecran', department_code: 'regie' },
  { code: 'assistanat_dg', label: 'Assistante de direction', icon: 'agenda', department_code: 'assistanat_dg' },
  { code: 'imprimerie', label: 'Imprimerie', caption: 'Service du département Production', icon: 'imprimante', department_code: 'imprimerie', parent_code: 'production' },
  { code: 'terrain', label: 'Technicien terrain', icon: 'outils', roles: ['technicien'], kind: 'fonction' },
  { code: 'rh', label: 'Ressources humaines', icon: 'equipe', department_code: 'rh' },
  { hidden: true, code: 'juridique', label: 'Juridique', icon: 'balance', department_code: 'juridique' },
  { hidden: true, code: 'informatique', label: 'Informatique et études', icon: 'ordinateur', department_code: 'informatique' },
  { hidden: true, code: 'decoration', label: 'Décoration', caption: 'Service du département Production', icon: 'rouleau', department_code: 'decoration', parent_code: 'production' },
  { hidden: true, code: 'atelier', label: 'Atelier métallique', caption: 'Service du département Production', icon: 'marteau', department_code: 'atelier', parent_code: 'production' },
  { hidden: true, code: 'cnc', label: 'Salle CNC', caption: 'Service du département Production', icon: 'fraiseuse', department_code: 'cnc', parent_code: 'production' },
  { hidden: true, code: 'administration', label: 'Administration technique', icon: 'bouclier', department_code: 'administration' },
];
