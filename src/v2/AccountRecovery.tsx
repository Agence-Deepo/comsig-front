import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Field, Input } from '../components/ui';
import { api } from './api';
import { ErrorBox } from './ui';
import { useAuth } from './auth';

export default function AccountRecovery() {
  const reset = useLocation().pathname === '/reinitialiser';
  const [link] = useState(() => new URLSearchParams(window.location.hash.slice(1)));
  const [email, setEmail] = useState(link.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [message, setMessage] = useState('');
  const [localMail, setLocalMail] = useState(false);
  const [busy, setBusy] = useState(false);
  const { clear } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    document.title = 'Récupération du compte — COMSIG';
    if (window.location.hash) window.history.replaceState(window.history.state, '', window.location.pathname);
  }, []);
  return (
    <main className="auth-form" style={{ minHeight: '100dvh', margin: '0 auto', maxWidth: 600 }}>
      <form
        className="auth-card"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setError(null);
          setMessage('');
          try {
            if (reset) {
              await api.post('/auth/reset-password', {
                email,
                token: link.get('token') ?? '',
                password,
                password_confirmation: confirm,
                ...(code ? (recovery ? { recovery_code: code.trim() } : { code: code.trim() }) : {}),
              });
              setPassword('');
              setConfirm('');
              setCode('');
              clear('Mot de passe réinitialisé. Reconnectez-vous.');
              nav('/connexion', { replace: true });
            } else {
              const res = await api.post<{ message: string; meta?: { delivery: string } }>(
                '/auth/forgot-password',
                { email },
              );
              setMessage(res.message);
              setLocalMail(res.meta?.delivery === 'local_private');
            }
          } catch (e) {
            setError(e);
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1>{reset ? 'Nouveau mot de passe' : 'Mot de passe oublié'}</h1>
        <p className="secondary">
          {reset
            ? 'Choisissez un mot de passe personnel. Une MFA déjà active reste obligatoire.'
            : 'Saisissez l’adresse e-mail associée à votre compte.'}
        </p>
        <ErrorBox error={error} />
        {message && <Alert tone="success">{message}</Alert>}
        {localMail && (
          <Alert tone="info">
            Mode local : aucun e-mail externe. Le message de recette est enregistré dans la boîte privée du
            serveur, pas dans votre messagerie habituelle.
          </Alert>
        )}
        {reset && !link.get('token') && (
          <Alert tone="warning">Le lien est absent. Rouvrez le lien reçu ou demandez-en un nouveau.</Alert>
        )}
        <Field label="Adresse e-mail" htmlFor="recovery-email" required>
          <Input
            id="recovery-email"
            type="email"
            autoComplete="username"
            maxLength={254}
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        {reset && (
          <>
            <Field
              label="Nouveau mot de passe"
              htmlFor="recovery-password"
              hint="12 caractères minimum, majuscule, minuscule, chiffre et symbole"
              required
            >
              <Input
                id="recovery-password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={200}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field
              label="Confirmation"
              htmlFor="recovery-confirm"
              required
              error={confirm && confirm !== password ? 'Les deux saisies diffèrent.' : undefined}
            >
              <Input
                id="recovery-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            <Field
              label={recovery ? 'Code de secours MFA (si activée)' : 'Code MFA (si activée)'}
              htmlFor="recovery-code"
            >
              <Input
                id="recovery-code"
                autoComplete="one-time-code"
                value={code}
                maxLength={40}
                onChange={(e) => setCode(e.target.value)}
              />
            </Field>
            <label className="small row">
              <input
                type="checkbox"
                checked={recovery}
                onChange={(e) => {
                  setRecovery(e.target.checked);
                  setCode('');
                }}
              />
              Utiliser un code de secours
            </label>
          </>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={busy}
          disabled={reset && (!link.get('token') || !password || confirm !== password)}
        >
          {reset ? 'Réinitialiser le mot de passe' : 'Recevoir le lien'}
        </Button>
        <Link to="/connexion">Retour à la connexion</Link>
      </form>
    </main>
  );
}
