import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { api } from './api';
import { useAuth } from './auth';
import { ErrorBox, PageTitle } from './ui';
import commercial from '../assets/portail/commercial.webp';
import direction from '../assets/portail/direction.webp';
import production from '../assets/portail/production.webp';
import comptabilite from '../assets/portail/comptabilite.webp';
import regie from '../assets/portail/regie.webp';
import rh from '../assets/portail/rh.webp';

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-symbol">
        c<span>↗</span>
      </span>
      <div>
        <strong>
          COM<span>&</span>SIG
        </strong>
        <small>COMMUNICATION & SIGNALÉTIQUE</small>
      </div>
    </div>
  );
}
export function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  if (user)
    return <Navigate to={user.must_change_password ? '/profil' : location.state?.from || '/'} replace />;
  return (
    <div className="login-page">
      <section className="login-hero">
        <Link to="/portail">
          <Brand />
        </Link>
        <div>
          <span className="eyebrow">VOTRE ESPACE DE TRAVAIL</span>
          <h1>
            De la première idée
            <br />
            au projet livré.
          </h1>
          <p>
            Le pilotage commercial et opérationnel de COMSIG. Des équipes connectées, des dossiers qui
            avancent.
          </p>
          <div className="hero-rule" />
          <span className="hero-caption">COMMERCIAL · OPÉRATIONS · DIRECTION</span>
        </div>
        <small>Accès réservé aux collaborateurs autorisés.</small>
      </section>
      <main className="login-form">
        <Link className="back-link" to="/portail">
          <ArrowLeft size={15} />
          Portail des équipes
        </Link>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            const form = new FormData(e.currentTarget);
            setBusy(true);
            setError(null);
            try {
              await login(String(form.get('login')), String(form.get('password')));
            } catch (e) {
              setError(e);
            } finally {
              setBusy(false);
            }
          }}
        >
          <span className="login-icon">
            <LockKeyhole size={24} />
          </span>
          <span className="eyebrow">BIENVENUE CHEZ COMSIG</span>
          <h2>Connectez-vous à votre espace</h2>
          <p className="muted">Retrouvez vos dossiers et vos priorités.</p>
          <ErrorBox error={error} />
          <label className="field">
            Identifiant ou e-mail
            <input
              name="login"
              autoComplete="username"
              autoCapitalize="none"
              required
              autoFocus
              placeholder="Votre identifiant"
            />
          </label>
          <label className="field">
            Mot de passe
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Votre mot de passe"
            />
          </label>
          <button className="button primary full" disabled={busy}>
            {busy ? 'Connexion…' : 'Se connecter'}
            <ArrowUpRight size={18} />
          </button>
          <p className="login-security">
            <ShieldCheck size={15} />
            Accès personnel · Permissions contrôlées par le serveur
          </p>
          {import.meta.env.DEV && (
            <details className="dev-credentials">
              <summary>Comptes de démonstration locaux</summary>
              <p>
                Commercial : <code>awa</code> · Direction : <code>dg</code> · Finance : <code>finance</code> ·
                Administration : <code>admin</code>
              </p>
              <p>
                Mot de passe : <code>Demo-Comsig-2026!</code>
              </p>
              <small>Uniquement si le DemoSeeder a été exécuté dans comsig-v2.</small>
            </details>
          )}
        </form>
        <small className="login-bottom">COMSIG Front V1 · API Laravel V2</small>
      </main>
    </div>
  );
}
export function Portal() {
  const { user } = useAuth();
  const tiles = [
    {
      title: 'Commercial & marketing',
      text: 'Prospection, opportunités et propositions.',
      image: commercial,
    },
    { title: 'Direction générale', text: 'Pilotage transversal et validations.', image: direction },
    { title: 'Régie publicitaire', text: 'Les dossiers et actions de votre service.', image: regie },
    {
      title: 'Production & ateliers',
      text: 'Matières, stocks et tâches opérationnelles.',
      image: production,
    },
    {
      title: 'Finance & comptabilité',
      text: 'Facturation interne et suivi des règlements.',
      image: comptabilite,
    },
    { title: 'Ressources humaines', text: 'Tâches du service ; module RH à porter.', image: rh },
  ];
  return (
    <div className="portal-page">
      <header>
        <Brand />
        <Link className="button" to={user ? '/' : '/connexion'}>
          {user ? 'Mon espace' : 'Connexion'}
          <ArrowUpRight size={16} />
        </Link>
      </header>
      <main>
        <span className="eyebrow">UN COLLECTIF. UN MÊME ESPACE.</span>
        <h1>
          Les équipes COMSIG,
          <br />
          <span>connectées au quotidien.</span>
        </h1>
        <p>Un accès personnel. Un espace adapté à votre rôle et à votre service.</p>
        <div className="portal-grid">
          {tiles.map((tile) => (
            <Link key={tile.title} className="portal-card" to={user ? '/' : '/connexion'}>
              <div className="portal-image">
                <img src={tile.image} alt="" />
              </div>
              <div>
                <h2>
                  {tile.title}
                  <ArrowUpRight size={18} />
                </h2>
                <p>{tile.text}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="portal-note">
          Votre compte détermine les droits d’accès. Le choix d’une carte ne change pas votre profil.
        </p>
      </main>
    </div>
  );
}
export function Profile() {
  const { user, clear } = useAuth();
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  return (
    <>
      <PageTitle
        title="Mon profil & sécurité"
        description="Vos informations de compte et le changement de mot de passe."
      />
      {success && (
        <div className="notice success">
          Mot de passe modifié. Reconnectez-vous avec votre nouveau mot de passe.
        </div>
      )}
      {user?.must_change_password && (
        <div className="notice warning">
          Vous devez changer votre mot de passe avant d’accéder aux autres modules.
        </div>
      )}
      <div className="detail-layout">
        <section className="panel panel-body">
          <h2>{user?.name}</h2>
          <dl className="facts">
            <div>
              <dt>E-mail</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt>Identifiant</dt>
              <dd>{user?.username}</dd>
            </div>
            <div>
              <dt>Profil</dt>
              <dd>{user?.role.label}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{user?.department.label}</dd>
            </div>
          </dl>
          <p className="muted">
            La session serveur utilise un cookie HttpOnly et reste active lors d’un rechargement.
          </p>
        </section>
        <section className="panel panel-body">
          <h2>Changer mon mot de passe</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              const payload = Object.fromEntries(new FormData(e.currentTarget));
              if (payload.password !== payload.password_confirmation) {
                setError(new Error('Les deux nouveaux mots de passe doivent être identiques.'));
                return;
              }
              setBusy(true);
              setError(null);
              try {
                await api.put('/auth/password', payload);
                setSuccess(true);
                clear();
              } catch (e) {
                setError(e);
              } finally {
                setBusy(false);
              }
            }}
          >
            <ErrorBox error={error} />
            <label className="field">
              Mot de passe actuel
              <input name="current_password" type="password" autoComplete="current-password" required />
            </label>
            <label className="field">
              Nouveau mot de passe
              <input name="password" type="password" autoComplete="new-password" minLength={12} required />
            </label>
            <label className="field">
              Confirmer le nouveau mot de passe
              <input
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </label>
            <p className="muted">
              Au moins 12 caractères avec une majuscule, une minuscule, un chiffre et un symbole. Toutes vos
              connexions seront révoquées.
            </p>
            <button className="button primary" disabled={busy}>
              {busy ? 'Modification…' : 'Modifier le mot de passe'}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
