import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { Alert, Badge, Button, Card, Field, Input } from '../components/ui';
import { api } from './api';
import { ErrorBox, Modal } from './ui';
import { useAuth } from './auth';

export default function TwoFactorPanel() {
  const { user, refresh } = useAuth();
  const qc = useQueryClient();
  const status = useQuery({
    queryKey: ['mfa-status'],
    queryFn: () => api.get<{ data: { enabled: boolean; recovery_codes_remaining: number } }>('/auth/mfa'),
    enabled: !user?.must_change_password,
  });
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState(false);
  const [setup, setSetup] = useState<{ secret: string; qr_data_url: string } | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [message, setMessage] = useState('');
  const [confirmDisable, setConfirmDisable] = useState(false);
  async function act(action: 'setup' | 'confirm' | 'disable' | 'recovery_codes' | 'cancel_setup') {
    if (busy) return;
    setBusy(true);
    setError(null);
    setMessage('');
    try {
      const res = await api.post<any>(
        '/auth/mfa/' + (['disable', 'recovery_codes', 'cancel_setup'].includes(action) ? 'manage' : action),
        {
          current_password: password,
          action,
          ...(recovery ? { recovery_code: code.trim() } : { code: code.trim() }),
        },
      );
      if (action === 'setup') setSetup(res.data);
      else {
        setSetup(null);
        setPassword('');
        setCode('');
        setCodes(res.data.recovery_codes ?? []);
        setMessage(res.message);
        await refresh();
        await qc.invalidateQueries({ queryKey: ['mfa-status'] });
      }
      return true;
    } catch (e) {
      setError(e);
      return false;
    } finally {
      setBusy(false);
    }
  }
  const enabled = status.data?.data.enabled;
  return (
    <Card
      title={
        <span className="row">
          <ShieldCheck size={18} />
          Double authentification
        </span>
      }
    >
      <div className="stack">
        {user?.must_change_password ? (
          <p>Changez d’abord votre mot de passe temporaire.</p>
        ) : (
          <>
            <ErrorBox
              error={status.error}
              retry={() => {
                void status.refetch();
              }}
            />
            <ErrorBox error={error} />
            {message && <Alert tone="success">{message}</Alert>}
            {status.data && (
              <div>
                <Badge tone={enabled ? 'success' : 'warning'}>
                  {enabled ? 'MFA active' : 'MFA non activée'}
                </Badge>
              </div>
            )}
            {enabled && (
              <p className="small muted">
                Codes de secours restants : {status.data?.data.recovery_codes_remaining}
              </p>
            )}
            <p className="small secondary">
              Utilisez une application d’authentification compatible TOTP. Les codes de secours sont à
              conserver hors du CRM. Activer, désactiver ou renouveler les codes révoque les autres
              connexions.
            </p>
            {!!codes.length && (
              <Alert tone="warning" title="Codes de secours — affichage unique">
                <p>Conservez-les maintenant dans un endroit sûr. Chaque code ne fonctionne qu’une fois.</p>
                <div className="security-codes" data-testid="recovery-codes">
                  {codes.map((c) => (
                    <code key={c}>{c}</code>
                  ))}
                </div>
                <Button onClick={() => setCodes([])}>J’ai conservé mes codes</Button>
              </Alert>
            )}
            <Field label="Mot de passe actuel pour la MFA" htmlFor="mfa-password">
              <Input
                id="mfa-password"
                type="password"
                autoComplete="current-password"
                maxLength={200}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {setup && (
              <>
                <p className="small">
                  Scannez ce QR code dans votre application ou saisissez la clé manuellement. Confirmez dans
                  les 10 minutes ; la MFA n’est pas active avant confirmation.
                </p>
                <img
                  src={setup.qr_data_url}
                  alt="QR code personnel de configuration MFA"
                  width={240}
                  height={240}
                  style={{ maxWidth: '100%', height: 'auto', alignSelf: 'start' }}
                />
                <code className="security-secret" data-testid="mfa-secret">
                  {setup.secret}
                </code>
              </>
            )}
            {(enabled || setup) && (
              <>
                <Field
                  label={recovery && enabled ? 'Code de secours MFA' : 'Code à 6 chiffres'}
                  htmlFor="mfa-code"
                >
                  <Input
                    id="mfa-code"
                    autoComplete="one-time-code"
                    maxLength={40}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </Field>
                {enabled && (
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
                )}
              </>
            )}
            <div className="row-wrap">
              {!enabled && !setup && (
                <Button
                  disabled={!password || !status.data || busy}
                  loading={busy}
                  onClick={() => {
                    void act('setup');
                  }}
                >
                  Configurer la MFA
                </Button>
              )}
              {setup && (
                <>
                  <Button
                    variant="primary"
                    loading={busy}
                    disabled={!password || code.length !== 6}
                    onClick={() => {
                      void act('confirm');
                    }}
                  >
                    Confirmer l’activation
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() => {
                      void act('cancel_setup');
                    }}
                  >
                    Annuler
                  </Button>
                </>
              )}
              {enabled && (
                <>
                  <Button
                    disabled={!password || !code || busy}
                    loading={busy}
                    onClick={() => {
                      void act('recovery_codes');
                    }}
                  >
                    Renouveler les codes de secours
                  </Button>
                  <Button
                    variant="danger"
                    disabled={!password || !code || busy}
                    onClick={() => {
                      setError(null);
                      setConfirmDisable(true);
                    }}
                  >
                    Désactiver la MFA
                  </Button>
                  <p className="xsmall muted">
                    Un code déjà utilisé doit être remplacé par le suivant ou par un code de secours.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
      {confirmDisable && (
        <Modal
          title="Désactiver la double authentification ?"
          close={() => {
            if (!busy) setConfirmDisable(false);
          }}
        >
          <p>
            Le mot de passe et le second facteur saisis seront vérifiés. Les autres connexions seront
            révoquées.
          </p>
          <ErrorBox error={error} />
          <div className="row-wrap" style={{ marginTop: 20 }}>
            <Button disabled={busy} onClick={() => setConfirmDisable(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={async () => {
                if (await act('disable')) setConfirmDisable(false);
              }}
            >
              Confirmer la désactivation
            </Button>
          </div>
        </Modal>
      )}
    </Card>
  );
}
