import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Alert } from '../components/ui';
import { PortalHero } from './Portal';
import { DEFAULT_TILES, PortalTile } from '../components/PortalTile';
import { demoProfiles, demoGeneratedAt, demoProfileMe, setProfile } from '../demo/demo';

/** Profils de démonstration qui entrent par une tuile : membres du département, ou de la fonction (technicien terrain). */
function profilesOf(code: string) {
  const t = DEFAULT_TILES.find((x) => x.code === code);
  if (!t) return [];
  return demoProfiles().filter((p) => {
    const m = demoProfileMe(p.key);
    return t.roles ? t.roles.includes(m?.role_code ?? '') : m?.department_code === t.department_code;
  });
}

/** Accueil de la démonstration : le portail des départements au modèle COM&SIG, puis le choix d'un profil
 *  (dans le logiciel installé, la tuile demande l'identifiant et le mot de passe du collaborateur). */
export default function DemoLogin() {
  const { me, setMe, loading } = useAuth();
  const nav = useNavigate();
  const { dept } = useParams();
  useEffect(() => { document.title = 'Démo CRM COM&SIG'; }, []);
  if (!loading && me) return <Navigate to="/" replace />;
  const pick = async (key: string) => {
    setProfile(key);
    const r = await api.get('/api/auth/me');
    setMe(r.me);
    nav('/', { replace: true });
  };
  const when = demoGeneratedAt() ? new Date(demoGeneratedAt()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const tiles = DEFAULT_TILES.filter((t) => !t.hidden && profilesOf(t.code).length > 0);
  // Profils sans tuile affichée (ex. administration) : l'équivalent de la « connexion directe » du logiciel installé
  const others = demoProfiles().filter((p) => !tiles.some((t) => profilesOf(t.code).some((x) => x.key === p.key)));
  const tile = dept ? DEFAULT_TILES.find((t) => t.code === dept) : undefined;

  if (dept) {
    const people = profilesOf(dept);
    return (
      <div className="dept-auth">
        <section className="dept-auth-hero">
          <Link to="/connexion" className="dept-auth-back"><ArrowLeft size={16} aria-hidden /> Portail des départements</Link>
          <div className="dept-auth-tile">{tile && <PortalTile tile={tile} still />}</div>
          <div>
            <div className="xsmall" style={{ color: '#f0cf7a', textTransform: 'uppercase', letterSpacing: '.08em' }}>{tile?.roles ? 'Accès par fonction' : 'Accès du département'}</div>
            <h1>{tile?.label ?? 'Entrée introuvable'}</h1>
            <p>Démonstration : choisissez un collaborateur. Dans le logiciel installé, cette tuile demande l’identifiant et le mot de passe personnels.</p>
          </div>
        </section>
        <main className="auth-form">
          <div className="auth-card">
            <div><h1 style={{ fontSize: 24 }}>Connexion — {tile?.label ?? ''}</h1><p className="secondary" style={{ marginTop: 6 }}>Profils de démonstration (données fictives, lecture seule)</p></div>
            {!people.length && <Alert tone="warning">Aucun profil de démonstration pour cette entrée. <Link to="/connexion">Revenir au portail</Link></Alert>}
            <ul className="demo-people" role="list">
              {people.map((p) => (
                <li key={p.key}>
                  <button type="button" className="demo-person" onClick={() => pick(p.key)} title={p.description}>
                    <span className="demo-person-ico"><UserRound size={18} aria-hidden /></span>
                    <span><span className="demo-person-name">{p.name}</span><span className="demo-person-role">{p.label}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="portal">
      <div className="portal-inner">
        <PortalHero title="Portail des départements — démonstration" text="Choisissez un département, puis un collaborateur : chacun voit le CRM avec ses propres droits."
          note={`Données entièrement fictives${when ? ` · instantané du ${when}` : ''} · lecture seule`} />
        <nav className="ptile-grid" aria-label="Départements">
          {tiles.map((t) => <PortalTile key={t.code} tile={t} onClick={() => nav(`/connexion/${t.code}`)} ariaLabel={`${t.label}${t.caption ? ` (${t.caption})` : ''} : choisir un profil`} />)}
        </nav>
        {others.length > 0 && (
          <p className="portal-foot">Autre service (connexion directe) :{' '}
            {others.map((p, i) => <span key={p.key}>{i > 0 && ' · '}<button type="button" className="btn-link" onClick={() => pick(p.key)} title={p.description}>{p.label} ({p.name})</button></span>)}
          </p>
        )}
        <p className="portal-foot">Lecture seule : vous pouvez tout parcourir ; les enregistrements sont désactivés dans cette démonstration.</p>
      </div>
    </div>
  );
}
