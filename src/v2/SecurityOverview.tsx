import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, Kpi, PageHeader } from '../components/ui';
import { api } from './api';
import { date, today, can, type Row } from './types';
import { useAuth } from './auth';
import { ActionForm, ErrorBox, Loading } from './ui';

export default function SecurityOverview() {
  const { user } = useAuth();
  const [form, setForm] = useState<'block' | 'seal' | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [verification, setVerification] = useState<Row | null>(null);
  const [auditVerification, setAuditVerification] = useState<Row | null>(null);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['security-overview'], queryFn: () => api.get('/admin/security-overview') });
  const monitor = useQuery({
    queryKey: ['security-monitor'],
    queryFn: () => api.get('/admin/security-monitor'),
  });
  const d = q.data;
  const m = monitor.data;
  const refresh = () => qc.invalidateQueries({ queryKey: ['security-monitor'] });
  const act = async (path: string) => {
    try {
      setError(null);
      const result = await api.post(path, {});
      if (path.endsWith('/verify')) { if (path.includes('/checkpoints/')) setAuditVerification(result); else setVerification(result); }
      await refresh();
    } catch (e) {
      setError(e);
    }
  };
  return (
    <>
      <PageHeader title="Sécurité" subtitle="État des comptes et événements enregistrés par l’application." />
      <ErrorBox error={q.error || monitor.error || error} />
      {(q.isLoading || monitor.isLoading) && <Loading />}
      {d && (
        <>
          <div className="grid-4">
            <Kpi label="Comptes actifs" value={d.accounts.active} />
            <Kpi label="Double facteur activé" value={d.accounts.mfa_enabled} />
            <Kpi label="Mot de passe à changer" value={d.accounts.password_change_required} />
            <Kpi
              label="Échecs de connexion · 24 h"
              value={d.last_24h.failures}
              foot={`${d.last_24h.logins} connexion(s) réussie(s)`}
            />
          </div>
          <p className="notice">
            Le radar détecte certaines signatures et les échecs de connexion répétés ; il ne détecte pas toutes les attaques. Mode des signatures : {m?.radar_mode === 'block' ? 'refus des requêtes détectées' : 'alerte sans refus'}. Les adresses ne sont pas bloquées automatiquement.
          </p>
          <Card title="Revue des accès" sub="À vérifier avec les responsables avant toute modification de compte ; aucun compte n’est désactivé automatiquement.">
            {([['privileged_without_mfa','Comptes à privilèges sans double authentification'],['dormant','Comptes actifs sans connexion depuis 90 jours'],['without_department','Comptes actifs sans service']] as const).map(([key,label]) => <details key={key}><summary>{label} : {d.risk_accounts[key].count}</summary>{d.risk_accounts[key].rows.map((account: Row)=><div key={account.id}>{account.name} · {account.username || 'sans identifiant'}{account.last_login_at ? ` · dernière connexion : ${date(account.last_login_at)}` : ''}</div>)}{d.risk_accounts[key].count > d.risk_accounts[key].rows.length && <p>Liste limitée aux 100 premiers comptes.</p>}</details>)}
          </Card>
          <Card
            title="Alertes de sécurité"
            sub="Sondes, signatures et échecs répétés. Les alertes ne stockent ni contenu des requêtes ni identifiant en clair."
            actions={
              can(user, 'admin.update') && (
                <button className="btn" onClick={() => act('/admin/security-monitor/scan')}>
                  Lancer le contrôle
                </button>
              )
            }
          >
            {m?.alerts.map((a: Row) => (
              <div className="row-wrap" key={a.id}>
                <span>
                  {date(a.created_at)} · {a.title} · {a.ip || '—'} ·{' '}
                  {a.acknowledged_at ? 'Prise en compte' : 'À examiner'}
                </span>
                {!a.acknowledged_at && can(user, 'admin.update') && (
                  <button className="btn" onClick={() => act(`/admin/security-monitor/alerts/${a.id}/ack`)}>
                    Prendre en compte
                  </button>
                )}
              </div>
            ))}
            {!m?.alerts.length && <p>Aucune alerte enregistrée.</p>}
          </Card>
          <Card
            title="Blocages temporaires"
            sub="Une adresse peut être partagée par plusieurs personnes. Vérifier sa provenance et les proxys avant de la bloquer."
            actions={
              user?.role.code === 'superadmin' && (
                <button className="btn" onClick={() => setForm('block')}>
                  Bloquer une adresse
                </button>
              )
            }
          >
            {m?.blocks.map((b: Row) => (
              <div className="row-wrap" key={b.id}>
                <span>
                  {b.ip} · {b.reason} · expiration {date(b.expires_at)}
                </span>
                {user?.role.code === 'superadmin' && (
                  <button className="btn" onClick={() => act(`/admin/security-monitor/blocks/${b.id}/lift`)}>
                    Lever
                  </button>
                )}
              </div>
            ))}
            {!m?.blocks.length && <p>Aucun blocage actif.</p>}
          </Card>
          <Card title="Intégrité du journal d’audit" sub="Comparaison du journal avec un point de contrôle HMAC pris explicitement." actions={can(user,'admin.update') && <button className="btn" onClick={()=>act('/admin/security-monitor/checkpoints')}>Créer un point de contrôle</button>}>
            <p>Le contrôle ne garantit pas l’intégrité avant sa création. Il dépend de la protection de la clé serveur et peut signaler une différence en cas de transaction antérieure finalisée tardivement.</p>
            {auditVerification && <p className={auditVerification.ok?'notice':'notice warning'}>{auditVerification.ok?'Empreinte conforme':'Différence détectée'} · {auditVerification.actual_count} / {auditVerification.expected_count} événement(s) jusqu’au numéro {auditVerification.last_audit_id}.</p>}
            {m?.checkpoints.map((c:Row)=><div className="row-wrap" key={c.id}><span>Point n° {c.id} · {date(c.created_at)} · {c.event_count} événement(s)</span>{can(user,'admin.update')&&<button className="btn" onClick={()=>act(`/admin/security-monitor/checkpoints/${c.id}/verify`)}>Vérifier</button>}</div>)}
            {!m?.checkpoints.length && <p>Aucun point de contrôle.</p>}
          </Card>
          <Card
            title="Empreintes des connexions"
            sub="Copie locale et empreinte HMAC du mois clôturé ; les événements originaux restent dans le journal."
            actions={
              can(user, 'admin.update') && (
                <button className="btn" onClick={() => setForm('seal')}>
                  Sceller un mois clos
                </button>
              )
            }
          >
            <p>
              La vérification détecte une différence par rapport à l’empreinte enregistrée, pas les
              modifications antérieures au scellement. La protection dépend aussi de la clé et de la sécurité
              du serveur.
            </p>
            {verification && (
              <p className={verification.ok ? 'notice' : 'notice warning'}>
                {verification.period} : {verification.ok ? 'empreinte conforme' : 'différence détectée'} (
                {verification.current_count} événement(s), {verification.sealed_count} scellé(s)).
              </p>
            )}
            {m?.seals.map((s: Row) => (
              <div className="row-wrap" key={s.id}>
                <span>
                  {s.period} · {s.count} événement(s)
                </span>
                {can(user, 'admin.update') && (
                  <button
                    className="btn"
                    onClick={() => act(`/admin/security-monitor/seals/${s.period}/verify`)}
                  >
                    Vérifier
                  </button>
                )}
              </div>
            ))}
            {!m?.seals.length && <p>Aucun mois scellé.</p>}
            <Link to="/securite/archives">Consulter les archives de connexion</Link>
          </Card>
          <Card
            title="Événements de sécurité récents"
            sub="100 derniers événements enregistrés, sans données métier."
          >
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Compte</th>
                    <th>Adresse IP</th>
                  </tr>
                </thead>
                <tbody>
                  {d.events.map((event: Row) => (
                    <tr key={event.id}>
                      <td>{date(event.created_at)}</td>
                      <td>{event.action}</td>
                      <td>{event.user_id || 'Non identifié'}</td>
                      <td>{event.ip || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link to="/audit">Consulter le journal complet</Link>
          </Card>
        </>
      )}
      {form === 'block' && (
        <ActionForm
          title="Bloquer temporairement une adresse publique"
          close={() => setForm(null)}
          submit={async (f) => {
            await api.post('/admin/security-monitor/blocks', {
              ip: f.get('ip'),
              reason: f.get('reason'),
              minutes: Number(f.get('minutes')),
            });
            await refresh();
          }}
        >
          <p>
            Le blocage concerne toutes les personnes utilisant cette adresse. Durée maximale : 24 heures.
            Votre propre adresse et les adresses privées sont refusées.
          </p>
          <label className="field">
            Adresse IP
            <input name="ip" required />
          </label>
          <label className="field">
            Motif
            <input name="reason" minLength={5} maxLength={300} required />
          </label>
          <label className="field">
            Durée en minutes
            <input name="minutes" type="number" min="1" max="1440" required />
          </label>
        </ActionForm>
      )}
      {form === 'seal' && (
        <ActionForm
          title="Sceller les connexions d’un mois terminé"
          close={() => setForm(null)}
          submit={async (f) => {
            await api.post('/admin/security-monitor/seals', { period: f.get('period') });
            await refresh();
          }}
        >
          <label className="field">
            Mois
            <input name="period" type="month" max={today().slice(0, 7)} required />
          </label>
        </ActionForm>
      )}
    </>
  );
}
