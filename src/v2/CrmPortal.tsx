// Portail des départements au modèle COM&SIG : une tuile par département (ou fonction) ; un clic ouvre l'accès
// de la tuile (identifiant et mot de passe). Seule l'entrée se fait en tuiles : à l'intérieur, les menus restent listés.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';

import { useAuth } from './auth';
import { Logo } from './CrmLayout';
import { Alert } from '../components/ui';
import { DEFAULT_TILES, PortalTile, type PortalTileData } from '../components/PortalTile';

export const usePortalTiles = () =>
  useQuery({
    queryKey: ['portal-tiles'],
    queryFn: () => Promise.resolve({ rows: DEFAULT_TILES.filter((t) => !t.hidden) as PortalTileData[] }),
    staleTime: 300_000,
  });

export function PortalHero({ title, text, note }: { title: string; text: string; note: string }) {
  return (
    <header className="portal-hero">
      <div>
        <div className="row" style={{ gap: 10 }}>
          <Logo />
          <div>
            <div className="brand-name">COM&amp;SIG</div>
            <div className="brand-sub">Régie publicitaire &amp; communication</div>
          </div>
        </div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      <div className="portal-note">
        <Lock size={14} aria-hidden /> {note}
      </div>
    </header>
  );
}

export default function CrmPortal() {
  const { user: me, loading } = useAuth();
  const r = usePortalTiles();
  useEffect(() => {
    document.title = 'Portail des départements — COM&SIG';
  }, []);
  if (loading) return <div className="loading-page"><span className="spinner" aria-label="Chargement" /></div>;
  if (me) return <AuthenticatedPortal user={me} />;
  const rows = r.data?.rows ?? [];
  return (
    <div className="portal">
      <div className="portal-inner">
        <PortalHero
          title="Portail des départements"
          text="Choisissez votre département, puis identifiez-vous avec votre identifiant et votre mot de passe."
          note="Accès réservé · toutes les connexions sont enregistrées"
        />
        {r.isError && (
          <Alert tone="danger">
            Le portail ne répond pas. Vérifiez votre connexion puis rechargez la page.
          </Alert>
        )}
        {r.isLoading && (
          <div className="loading-page" style={{ minHeight: 240 }}>
            <span className="spinner" aria-label="Chargement" />
          </div>
        )}
        {rows.length > 0 && (
          <nav className="ptile-grid" aria-label="Départements">
            {rows.map((t) => (
              <PortalTile
                key={t.code}
                tile={t}
                to={`/connexion/${t.code}`}
                ariaLabel={`${t.label}${t.caption ? ` (${t.caption})` : ''} : accéder`}
              />
            ))}
          </nav>
        )}
        {/* prettier-ignore */}
        <p className="portal-foot">Autre service (juridique, informatique et études, administration…) : <Link to="/connexion">connexion directe</Link>. Mot de passe oublié ou compte verrouillé ? Contactez l’administrateur de la plateforme.</p>
      </div>
    </div>
  );
}

function AuthenticatedPortal({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const permissions = user.role?.permissions ?? [];
  const has = (permission: string) => permissions.includes(permission) || permissions.includes(`${permission.split('.')[0]}.*`);
  const destinations = [
    { code: 'direction', label: 'Tableau de bord', icon: 'organigramme', to: '/', visible: true },
    { code: 'commercial', label: 'Espace commercial', icon: 'poignee', to: '/opportunites', visible: has('opportunities.view') },
    { code: 'activities', label: 'Activités et agenda', icon: 'agenda', to: '/activites', visible: has('activities.view') },
    { code: 'quotes', label: 'Devis et proformas', icon: 'pieces', to: '/devis', visible: has('quotes.view') },
    { code: 'admin', label: 'Administration', icon: 'bouclier', to: '/espace-admin', visible: has('admin.view') },
    { code: 'services', label: 'Palettes des services', icon: 'usine', to: '/services', visible: user.department?.code && user.role?.data_scope !== 'own' },
    { code: 'company', label: 'Espace entreprise', icon: 'ecran', to: '/espace-entreprise', visible: true },
  ].filter((item) => item.visible);
  return <div className="portal"><div className="portal-inner">
    <PortalHero title="Vos espaces COM&amp;SIG" text={`Connecté en tant que ${user.name}. Choisissez l’espace de travail à ouvrir.`} note="Accès selon votre profil et vos autorisations" />
    <nav className="ptile-grid" aria-label="Espaces de travail">
      {destinations.map((item) => <PortalTile key={item.code} tile={{ code: item.code, label: item.label, icon: item.icon }} to={item.to} />)}
    </nav>
    <p className="portal-foot"><Link to="/">Retour à mon tableau de bord</Link></p>
  </div></div>;
}

/** Choisit l'espace d'arrivée depuis le profil déjà authentifié. */
export function homeForUser(user: NonNullable<ReturnType<typeof useAuth>['user']>): string {
  if (user.role?.permissions?.includes('admin.view') || user.role?.permissions?.includes('admin.*')) return '/espace-admin';
  return '/';
}
