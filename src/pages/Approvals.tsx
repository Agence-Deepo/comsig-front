import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck, X } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { dateTime, money, pct } from '../lib/format';
import { Badge, Button, Card, ConfirmModal, Empty, PageHeader, Segmented, Status } from '../components/ui';

const KIND: Record<string, string> = { marge: 'Marge sous seuil', remise: 'Remise hors délégation', engagement: 'Engagement au-delà du seuil', tarif: 'Prix hors catalogue', derogation_etape: 'Dérogation de pipeline', derogation_reservation: 'Double réservation' };
const LINK: Record<string, string> = { quote: '/devis/', opportunity: '/opportunites/', campaign: '/campagnes/' };

/** Circuit de validation : principe des quatre yeux, motif obligatoire en cas de refus (§5.3.2, §5.5). */
export default function Approvals() {
  const { me } = useAuth();
  const [tab, setTab] = useState<'en_attente' | 'mes_demandes' | 'traitees'>('en_attente');
  const r = useApi<any>(['approvals', tab], `/api/approvals?status=${tab}`);
  const [decision, setDecision] = useState<{ a: any; approved: boolean } | null>(null);
  const decide = useAction((v: { id: string; approved: boolean; comment: string }) => api.post(`/api/approvals/${v.id}/decide`, { approved: v.approved, comment: v.comment || null }), {
    success: (x: any) => 'Décision enregistrée', invalidate: [['approvals'], ['approvals-count'], ['quote'], ['opp']], onSuccess: () => setDecision(null),
  });
  return (
    <>
      <PageHeader title="Validations" subtitle={`Demandes soumises à votre approbation (${me?.role_label}). Vous ne pouvez pas approuver vos propres demandes.`}
        actions={<Segmented label="Vue" value={tab} onChange={setTab} options={[{ id: 'en_attente', label: 'À traiter' }, { id: 'mes_demandes', label: 'Mes demandes' }, { id: 'traitees', label: 'Traitées par moi' }]} />} />
      {r.isLoading ? null : !r.data?.rows.length ? <Card><Empty icon={<ShieldCheck />} title={tab === 'en_attente' ? 'Aucune validation en attente' : 'Aucune demande'}>Les devis hors seuils, dérogations de pipeline et doubles réservations apparaissent ici.</Empty></Card> : (
        <div className="stack">
          {r.data.rows.map((a: any) => {
            const totals = a.payload?.totals;
            return (
              <Card key={a.id}>
                <div className="row-wrap" style={{ alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 260 }} className="stack">
                    <div className="row-wrap"><Badge tone="warning" dot={false}>{KIND[a.kind] ?? a.kind}</Badge><Status kind="approval" code={a.status} /><span className="xsmall muted">Approbateur : {a.approver_label}</span></div>
                    <div><Link to={`${LINK[a.entity_type] ?? '/'}${a.entity_id}`} className="strong">{a.entity_label}</Link>{a.organization_name && <span className="secondary"> · {a.organization_name}</span>}</div>
                    <div className="small">{a.reason}</div>
                    {a.payload?.comment && <div className="small secondary">Commentaire du demandeur : « {a.payload.comment} »</div>}
                    {a.payload?.justification && <div className="small secondary">Justification : « {a.payload.justification} »</div>}
                    {a.payload?.issues && <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{a.payload.issues.map((i: any, k: number) => <li key={k}>{i.message}</li>)}</ul>}
                    <div className="xsmall muted">Demandé par {a.requested_by_name} le {dateTime(a.requested_at)}{a.decided_by_name && ` · décidé par ${a.decided_by_name} le ${dateTime(a.decided_at)}`}{a.comment && ` · « ${a.comment} »`}</div>
                  </div>
                  {totals && <div className="card" style={{ padding: 12, minWidth: 220, boxShadow: 'none', background: 'var(--surface-2)' }}>
                    <div className="xsmall muted">Calcul du CRM</div>
                    <div className="small">Total HT <strong className="num">{money(totals.total_ht)}</strong></div>
                    <div className="small">Marge <strong className="num">{pct(totals.margin_pct)}</strong> ({money(totals.margin_amount)})</div>
                    <div className="small">Remise moyenne <strong className="num">{pct(totals.weighted_discount_pct)}</strong></div>
                  </div>}
                  {tab === 'en_attente' && (
                    <div className="stack" style={{ minWidth: 150 }}>
                      <Button variant="primary" icon={<Check />} disabled={a.requested_by === me?.id} onClick={() => setDecision({ a, approved: true })}>Approuver</Button>
                      <Button icon={<X />} disabled={a.requested_by === me?.id} onClick={() => setDecision({ a, approved: false })}>Refuser</Button>
                      {a.requested_by === me?.id && <span className="xsmall muted">Votre propre demande</span>}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <ConfirmModal open={!!decision} onClose={() => setDecision(null)} title={decision?.approved ? 'Approuver la demande' : 'Refuser la demande'} danger={!decision?.approved} loading={decide.isPending}
        confirmLabel={decision?.approved ? 'Approuver' : 'Refuser'} reason={{ label: decision?.approved ? 'Commentaire (facultatif)' : 'Motif du refus (communiqué au demandeur)', required: !decision?.approved }}
        message={decision?.a.reason} onConfirm={(t) => decide.run({ id: decision!.a.id, approved: decision!.approved, comment: t })} />
    </>
  );
}
