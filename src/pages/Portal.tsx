// Portail des départements au modèle COM&SIG : une tuile par département (ou fonction) ; un clic ouvre l'accès
// de la tuile (identifiant et mot de passe). Seule l'entrée se fait en tuiles : à l'intérieur, les menus restent listés.
import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Logo } from '../components/Layout';
import { Alert } from '../components/ui';
import { PortalTile, type PortalTileData } from '../components/PortalTile';

export const usePortalTiles = () => useQuery({ queryKey: ['portal-tiles'], queryFn: () => api.get<{ rows: PortalTileData[] }>('/api/public/portal'), staleTime: 300_000 });

export function PortalHero({ title, text, note }: { title: string; text: string; note: string }) {
  return (
    <header className="portal-hero">
      <div>
        <div className="row" style={{ gap: 10 }}><Logo /><div><div className="brand-name">COM&amp;SIG</div><div className="brand-sub">Régie publicitaire &amp; communication</div></div></div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      <div className="portal-note"><Lock size={14} aria-hidden /> {note}</div>
    </header>
  );
}

export default function Portal() {
  const { me, loading } = useAuth();
  const r = usePortalTiles();
  useEffect(() => { document.title = 'Portail des départements — COM&SIG'; }, []);
  if (!loading && me && !me.mfa_pending) return <Navigate to="/" replace />;
  const rows = r.data?.rows ?? [];
  return (
    <div className="portal">
      <div className="portal-inner">
        <PortalHero title="Portail des départements" text="Choisissez votre département, puis identifiez-vous avec votre identifiant et votre mot de passe." note="Accès réservé · toutes les connexions sont enregistrées" />
        {r.isError && <Alert tone="danger">Le portail ne répond pas. Vérifiez votre connexion puis rechargez la page.</Alert>}
        {r.isLoading && <div className="loading-page" style={{ minHeight: 240 }}><span className="spinner" aria-label="Chargement" /></div>}
        {rows.length > 0 && (
          <nav className="ptile-grid" aria-label="Départements">
            {rows.map((t) => <PortalTile key={t.code} tile={t} to={`/connexion/${t.code}`} ariaLabel={`${t.label}${t.caption ? ` (${t.caption})` : ''} : accéder`} />)}
          </nav>
        )}
        <p className="portal-foot">Autre service (juridique, informatique et études, administration…) : <Link to="/connexion">connexion directe</Link>. Mot de passe oublié ou compte verrouillé ? Contactez l’administrateur de la plateforme.</p>
      </div>
    </div>
  );
}
