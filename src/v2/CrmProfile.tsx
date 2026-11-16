import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Alert, Badge, Button, Card, Dl, Field, Input, PageHeader } from '../components/ui';
import { api, HttpError } from './api';
import { useAuth } from './auth';
import { label } from './types';
import TwoFactorPanel from './TwoFactorPanel';

export default function CrmProfile() {
  const { user, session, clear, refresh } = useAuth();
  const nav = useNavigate();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  if (!user) return null;
  const fields = error instanceof HttpError ? error.errors : {};
  const mismatch = pw.confirm.length > 0 && pw.next !== pw.confirm;
  return (
    <>
      <PageHeader title="Mon profil" subtitle={`${user.name} · ${user.role.label}`} />
      {user.must_change_password && (
        <Alert tone="warning" title="Mot de passe temporaire">
          Choisissez un mot de passe personnel avant de continuer.
        </Alert>
      )}
      <div className="grid-2">
        <Card
          title={
            <span className="row">
              <ShieldCheck size={18} />
              Session et sécurité
            </span>
          }
        >
          <div className="stack">
            <div>
              <Badge tone="success">Session serveur sécurisée</Badge>
            </div>
            <p className="small secondary">
              Votre connexion est conservée lorsque vous actualisez la page. Le cookie de session est HttpOnly
              : il n’est pas accessible au JavaScript.
            </p>
            <p className="small secondary">
              Expiration après {session?.idle_timeout_minutes ?? 'la durée configurée d’'}
              {session?.idle_timeout_minutes ? ' minutes d’' : ''}inactivité. La déconnexion ferme cette
              session dans les autres onglets.
            </p>
          </div>
        </Card>
        <Card
          title={
            <span className="row" id="mot-de-passe">
              <KeyRound size={18} />
              Mot de passe
            </span>
          }
          sub="12 caractères minimum, avec majuscule, minuscule, chiffre et symbole"
        >
          <form
            className="stack"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy || mismatch) return;
              setBusy(true);
              setError(null);
              try {
                await api.put('/auth/password', {
                  current_password: pw.current,
                  password: pw.next,
                  password_confirmation: pw.confirm,
                });
                setPw({ current: '', next: '', confirm: '' });
                clear('Mot de passe modifié. Toutes vos connexions ont été révoquées. Reconnectez-vous.');
                nav('/connexion', { replace: true });
              } catch (e) {
                setError(e);
              } finally {
                setBusy(false);
              }
            }}
          >
            {!!error && (
              <Alert tone="danger">
                {error instanceof Error ? error.message : 'Modification impossible.'}
              </Alert>
            )}
            <Field
              label="Mot de passe actuel"
              htmlFor="profile-current"
              error={fields.current_password?.[0]}
              required
            >
              <Input
                id="profile-current"
                type="password"
                autoComplete="current-password"
                value={pw.current}
                onChange={(e) => setPw({ ...pw, current: e.target.value })}
                required
              />
            </Field>
            <Field label="Nouveau mot de passe" htmlFor="profile-new" error={fields.password?.[0]} required>
              <Input
                id="profile-new"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
                required
              />
            </Field>
            <Field
              label="Confirmation"
              htmlFor="profile-confirm"
              error={mismatch ? 'Les deux saisies diffèrent' : fields.password_confirmation?.[0]}
              required
            >
              <Input
                id="profile-confirm"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                required
              />
            </Field>
            <p className="xsmall muted">
              Après modification, les jetons API sont révoqués et les autres sessions navigateur sont refusées
              à leur prochaine requête.
            </p>
            <div>
              <Button
                type="submit"
                variant="primary"
                loading={busy}
                disabled={!pw.current || !pw.next || !pw.confirm || mismatch}
              >
                Modifier
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Mon compte">
          <Dl
            items={[
              ['Nom', user.name],
              ['E-mail', user.email],
              ['Identifiant', user.username],
              ['Rôle', user.role.label],
              ['Département', user.department.label],
              ['Périmètre de données', label(user.role.data_scope)],
            ]}
          />
          <p className="xsmall muted" style={{ marginTop: 16 }}>
            Les droits et le service sont attribués par l’administration. Aucun changement de privilège n’est
            possible depuis ce profil.
          </p>
        </Card>
        <Card
          title="Mes droits attribués"
          sub="Valeurs retournées par Laravel ; les périmètres et contrôles métier restent appliqués par le serveur."
        >
          <div className="stack">
            <div className="row-wrap" aria-label="Permissions du compte">
              {user.role.permissions.map((permission) => (
                <Badge key={permission}>{permission}</Badge>
              ))}
            </div>
            <div>
              <Button
                loading={refreshing}
                onClick={async () => {
                  setRefreshing(true);
                  try {
                    await refresh();
                  } finally {
                    setRefreshing(false);
                  }
                }}
              >
                Actualiser mes accès
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <TwoFactorPanel />
    </>
  );
}
