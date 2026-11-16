import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { safePath } from '../lib/format';
import { ArrowLeft, Lock, Mail, ShieldCheck } from 'lucide-react';
import { usePortalTiles } from './CrmPortal';
import { PortalTile } from '../components/PortalTile';
import { HttpError } from './api';
import { useAuth } from './auth';
import { AuthLoading } from './AuthStatus';
import { Alert, Button, Field, Input } from '../components/ui';
import { Logo } from './CrmLayout';

export default function CrmLogin() {
  const { user: me, login, verifyMfa, loading, error: sessionError, notice, refresh } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wrongDept, setWrongDept] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [recovery, setRecovery] = useState(false);
  // Entrée par une tuile du portail (département ou fonction) : le serveur vérifie que le compte lui appartient
  const { dept } = useParams();
  const deps = usePortalTiles();
  const department = dept ? deps.data?.rows.find((d) => d.code === dept) : undefined;
  const [landing, setLanding] = useState<string | null>(null);
  useEffect(() => {
    document.title = department ? `${department.label} — Connexion COM&SIG` : 'Connexion — COM&SIG CRM';
  }, [department?.label]);
  if (loading) return <AuthLoading />;
  if (!loading && me) return <Navigate to={landing ?? safePath(loc.state?.from)} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const user = mfaStep
        ? await verifyMfa(code.trim(), recovery)
        : await login(email, password, department?.department_code ?? department?.code);
      setPassword('');
      if (!user) {
        setMfaStep(true);
        setCode('');
        return;
      }
      const to = user.must_change_password ? '/profil' : safePath(loc.state?.from);
      setLanding(to);
      nav(to, { replace: true });
    } catch (e) {
      setErr((e as Error).message);
      setWrongDept(e instanceof HttpError && !!e.errors.department);
    } finally {
      setBusy(false);
    }
  };

  const form = (
    <main className="auth-form">
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="row hide-desktop" style={{ gap: 10 }}>
          <Logo />
          <strong>COM&amp;SIG CRM</strong>
        </div>
        {(notice || loc.state?.notice) && <Alert tone="success">{notice || loc.state.notice}</Alert>}
        {sessionError && (
          <Alert tone="warning">
            Le serveur n’a pas pu vérifier votre session.{' '}
            <button
              type="button"
              className="link"
              onClick={() => {
                void refresh();
              }}
            >
              Réessayer
            </button>
          </Alert>
        )}
        <div>
          <h1 style={{ fontSize: 24 }}>
            {mfaStep
              ? 'Vérification en deux étapes'
              : department
                ? `Connexion — ${department.label}`
                : 'Connexion'}
          </h1>
          <p className="secondary" style={{ marginTop: 6 }}>
            {mfaStep
              ? recovery
                ? 'Saisissez un code de secours inutilisé.'
                : 'Saisissez le code à 6 chiffres affiché dans votre application d’authentification.'
              : 'Saisissez votre identifiant et votre mot de passe personnels.'}
          </p>
        </div>
        {err && (
          <Alert tone="danger">
            {err}
            {wrongDept && (
              <>
                {' '}
                <Link to="/portail">Revenir au portail</Link>
              </>
            )}
          </Alert>
        )}
        {dept && !deps.isLoading && !department && (
          <Alert tone="warning">
            Cette entrée du portail n’existe pas ou n’est plus active.{' '}
            <Link to="/portail">Revenir au portail</Link>
          </Alert>
        )}
        {mfaStep ? (
          <Field label={recovery ? 'Code de secours' : 'Code de vérification'} required htmlFor="code">
            <div className="input-group">
              <ShieldCheck />
              <Input
                id="code"
                inputMode={recovery ? 'text' : 'numeric'}
                autoComplete="one-time-code"
                maxLength={recovery ? 40 : 6}
                value={code}
                onChange={(e) => setCode(recovery ? e.target.value : e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>
          </Field>
        ) : (
          <>
            <Field label="Identifiant ou adresse e-mail" required htmlFor="email">
              <div className="input-group">
                <Mail />
                <Input
                  id="email"
                  type="text"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </Field>
            <Field label="Mot de passe" required htmlFor="password">
              <div className="input-group">
                <Lock />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </Field>
          </>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={busy}
          disabled={mfaStep ? (recovery ? code.trim().length < 10 : code.length !== 6) : !email || !password}
        >
          {mfaStep ? 'Vérifier' : 'Se connecter'}
        </Button>
        {mfaStep ? (
          <div className="stack">
            <button
              className="link small"
              type="button"
              disabled={busy}
              onClick={() => {
                setRecovery(!recovery);
                setCode('');
                setErr(null);
              }}
            >
              {recovery ? 'Utiliser mon application' : 'Utiliser un code de secours'}
            </button>
            <button
              className="link small"
              type="button"
              disabled={busy}
              onClick={() => {
                setMfaStep(false);
                setCode('');
                setErr(null);
              }}
            >
              Recommencer la connexion
            </button>
          </div>
        ) : (
          <p className="xsmall muted">
            <Link to="/mot-de-passe-oublie" style={{ color: 'inherit', textDecoration: 'none' }}>
              Mot de passe oublié ou compte verrouillé ? Contactez l’administrateur du CRM : il peut
              réinitialiser votre accès.
            </Link>
          </p>
        )}
        {!dept && (
          <p className="xsmall">
            <Link to="/portail">← Portail des départements</Link>
          </p>
        )}
      </form>
    </main>
  );
  if (dept) {
    return (
      <div className="dept-auth">
        <section className="dept-auth-hero">
          <Link to="/portail" className="dept-auth-back">
            <ArrowLeft size={16} aria-hidden /> Portail des départements
          </Link>
          <div className="dept-auth-tile">
            {department ? (
              <PortalTile tile={department} still />
            ) : (
              <div className="ptile still placeholder" aria-hidden>
                <span className="ptile-inner" />
              </div>
            )}
          </div>
          <div>
            <div
              className="xsmall"
              style={{ color: '#f0cf7a', textTransform: 'uppercase', letterSpacing: '.08em' }}
            >
              {department?.kind === 'fonction' ? 'Accès par fonction' : 'Accès du département'}
            </div>
            <h1>{department?.label ?? (deps.isLoading ? '…' : 'Entrée introuvable')}</h1>
            {department?.description && <p>{department.description}</p>}
          </div>
        </section>
        {form}
      </div>
    );
  }
  return (
    <div className="auth-wrap">
      <section className="auth-hero" aria-hidden>
        <div className="row" style={{ gap: 12 }}>
          <Logo />
          <div>
            <div className="brand-name" style={{ color: '#fff' }}>
              COM&amp;SIG
            </div>
            <div className="brand-sub">Régie publicitaire &amp; communication</div>
          </div>
        </div>
        <div>
          <h1>Le pilotage commercial et opérationnel de la régie, en un seul endroit.</h1>
          <p>
            Prospection, propositions, contrats, supports, campagnes, maintenance et redevances — avec un
            assistant qui s’appuie uniquement sur vos données.
          </p>
        </div>
        <div className="xsmall" style={{ color: '#7d889b' }}>
          Accès réservé aux collaborateurs autorisés. Toutes les connexions sont journalisées.
        </div>
        <svg className="arcs" viewBox="0 0 520 520">
          <g fill="none" strokeLinecap="round">
            <circle cx="260" cy="260" r="250" stroke="#17253a" strokeWidth="2" />
            <circle cx="260" cy="260" r="190" stroke="#1b2b42" strokeWidth="2" />
            <path d="M120 260a140 140 0 0 1 140-140" stroke="#c27a34" strokeWidth="10" />
            <path d="M60 260a200 200 0 0 1 200-200" stroke="#2a3c58" strokeWidth="10" />
            <circle cx="330" cy="260" r="30" fill="#2f5fb8" />
          </g>
        </svg>
      </section>
      {form}
    </div>
  );
}
