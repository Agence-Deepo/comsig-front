import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Alert, Badge, Button, Card, Dl, Field, Input, PageHeader } from '../components/ui';

/** Profil : mot de passe, double authentification (enrôlement obligatoire pour les rôles sensibles), préférences. */
export default function Profile() {
  const { me, setMe } = useAuth();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [mfa, setMfa] = useState<{ qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const changePw = useAction((b: any) => api.post('/api/auth/password', b), {
    success: 'Mot de passe modifié — vos autres sessions ont été fermées',
    onSuccess: () => { setPw({ current: '', next: '', confirm: '' }); if (me) setMe({ ...me, must_change_password: false }); },
  });
  const setup = useAction(() => api.post('/api/auth/mfa/setup'), { onSuccess: (r: any) => setMfa(r) });
  const enable = useAction((c: string) => api.post('/api/auth/mfa/enable', { code: c }), { success: 'Double authentification activée', onSuccess: (r: any) => { setMe(r.me); setMfa(null); setCode(''); } });
  if (!me) return null;
  const mismatch = pw.confirm.length > 0 && pw.next !== pw.confirm;
  return (
    <>
      <PageHeader title="Mon profil" subtitle={`${me.full_name} · ${me.role_label}`} />
      {me.mfa_enrollment_required && <Alert tone="warning" title="Double authentification requise">Votre rôle donne accès à des informations sensibles. Activez la double authentification ci-dessous pour accéder au CRM.</Alert>}
      {me.must_change_password && <Alert tone="warning" title="Mot de passe temporaire">Choisissez un mot de passe personnel avant de continuer.</Alert>}
      <div className="grid-2">
        <Card title={<span className="row"><ShieldCheck size={18} />Double authentification</span>} sub="Application d’authentification (Google Authenticator, Microsoft Authenticator, FreeOTP…)">
          {me.mfa_enabled ? (
            <div className="stack"><Badge tone="success">Activée</Badge><p className="small secondary">Un code à 6 chiffres vous est demandé à chaque connexion. En cas de perte du téléphone, contactez l’administrateur pour réinitialiser.</p></div>
          ) : !mfa ? (
            <div className="stack">
              <p className="small secondary">{me.mfa_required ? 'Obligatoire pour votre rôle.' : 'Recommandée pour protéger l’accès aux données clients.'}</p>
              <div><Button variant="primary" loading={setup.isPending} onClick={() => setup.run(undefined)}>Configurer</Button></div>
            </div>
          ) : (
            <div className="stack">
              <ol className="small" style={{ margin: 0, paddingLeft: 18 }}><li>Scannez le QR code avec votre application.</li><li>Saisissez le code à 6 chiffres affiché.</li></ol>
              <img className="qr" src={mfa.qr} alt="QR code de configuration de la double authentification" width={220} height={220} />
              <details className="xsmall"><summary>Saisie manuelle de la clé</summary><code style={{ wordBreak: 'break-all' }}>{mfa.secret}</code></details>
              <form className="row" onSubmit={(e) => { e.preventDefault(); enable.run(code); }}>
                <Field label="Code" error={enable.fieldErrors.code}><Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} style={{ width: 140, letterSpacing: 4 }} /></Field>
                <Button type="submit" variant="primary" disabled={code.length !== 6} loading={enable.isPending} style={{ alignSelf: 'flex-end' }}>Activer</Button>
              </form>
            </div>
          )}
        </Card>
        <Card title={<span className="row" id="mot-de-passe"><KeyRound size={18} />Mot de passe</span>} sub="10 caractères minimum, avec au moins une lettre et un chiffre">
          <form className="stack" onSubmit={(e) => { e.preventDefault(); if (!mismatch) changePw.run({ current: pw.current, next: pw.next }); }}>
            <Field label="Mot de passe actuel" error={changePw.fieldErrors.current}><Input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
            <Field label="Nouveau mot de passe" error={changePw.fieldErrors.next}><Input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
            <Field label="Confirmation" error={mismatch ? 'Les deux saisies diffèrent' : undefined}><Input type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
            <div><Button type="submit" variant="primary" loading={changePw.isPending} disabled={!pw.current || !pw.next || mismatch}>Modifier</Button></div>
          </form>
        </Card>
        <Card title="Mon compte">
          <Dl items={[['Nom', me.full_name], ['E-mail', me.email], ['Rôle', me.role_label], ['Département', me.department_label ?? '—'], ['Périmètre de données', { own: 'Mes dossiers', team: 'Mon équipe', department: 'Mon service', all: 'Toute l’entreprise' }[me.data_scope]], ['Informations confidentielles', me.can_see_confidential ? 'Accès autorisé' : 'Non']]} />
        </Card>
      </div>
    </>
  );
}
