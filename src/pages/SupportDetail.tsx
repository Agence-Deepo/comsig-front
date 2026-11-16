import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Edit3, Wrench } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useCan, useLookups } from '../lib/auth';
import { date, money, pct } from '../lib/format';
import { Badge, Button, Card, DataTable, Dl, Empty, ErrorState, Kpi, LoadingBlock, PageHeader, Status } from '../components/ui';
import { SupportMap } from '../components/SupportMap';
import { Documents } from '../components/Documents';
import { SupportForm } from './Supports';
import { InterventionForm } from './Maintenance';

export default function SupportDetail() {
  const { id } = useParams();
  const can = useCan();
  const { label } = useLookups();
  const r = useApi<any>(['support', id], `/api/supports/${id}`);
  const [edit, setEdit] = useState(false);
  const [ticket, setTicket] = useState(false);
  if (r.isLoading) return <Card><LoadingBlock rows={8} /></Card>;
  if (r.error) return <Card><ErrorState error={r.error} /></Card>;
  const d = r.data; const s = d.support;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <PageHeader crumbs={[{ label: 'Supports publicitaires', to: '/supports' }, { label: s.code }]}
        title={<span className="row-wrap" style={{ gap: 10 }}>{s.code} — {s.name}<Status kind="support" code={s.status} /></span>}
        subtitle={`${label('support_type', s.type)} · ${s.format ?? ''} · ${label('commune', s.commune)}${s.axis ? ` · ${s.axis}` : ''}`}
        actions={<>
          {can('interventions', 'create') && <Button icon={<Wrench />} onClick={() => setTicket(true)}>Signaler une intervention</Button>}
          {can('supports', 'update') && <Button icon={<Edit3 />} onClick={() => setEdit(true)}>Modifier</Button>}
        </>} />
      <div className="grid-4">
        <Kpi label="Taux d’occupation (12 mois)" value={pct(d.stats.occupancy_12m_pct, 0)} progress={d.stats.occupancy_12m_pct} help={{ title: 'Occupation', formula: 'Jours réservés sur les 365 derniers jours / (365 × nombre de faces).' }} />
        <Kpi label="Revenus (devis acceptés)" value={money(d.stats.revenue_accepted)} />
        <Kpi label="Coûts de maintenance" value={money(d.stats.maintenance_cost)} foot={<span>{d.interventions.length} intervention(s)</span>} />
        <Kpi label="Autorisation" value={s.authorization_expires ? date(s.authorization_expires) : '—'} action={!!s.authorization_expires && s.authorization_expires < today} foot={<span>{s.authorization_ref ?? 'Référence non renseignée'}</span>} />
      </div>
      <div className="split">
        <div className="stack-lg" style={{ minWidth: 0 }}>
          <Card title="Réservations et occupation" flush>
            <DataTable rows={d.reservations} empty={<Empty title="Aucune réservation">Le support n’a jamais été réservé.</Empty>}
              columns={[
                { key: 'f', label: 'Face', render: (x: any) => <strong>{x.face_code}</strong>, width: 60 },
                { key: 'p', label: 'Période', render: (x: any) => <span className="small nowrap">{date(x.start_date)} → {date(x.end_date)}</span> },
                { key: 'c', label: 'Annonceur / campagne', render: (x: any) => <><div className="small">{x.organization_name}</div>{x.campaign_id ? <Link className="xsmall" to={`/campagnes/${x.campaign_id}`}>{x.campaign_ref} — {x.campaign_name}</Link> : x.quote_number && <span className="xsmall muted">Devis {x.quote_number}</span>}</> },
                { key: 's', label: 'Statut', render: (x: any) => <div className="row-wrap"><Status kind="face" code={x.start_date <= today && x.end_date >= today && x.status === 'reserve' ? 'occupe' : x.status} />{x.derogation_reason && <Badge tone="warning">Dérogation</Badge>}</div> },
              ]} />
          </Card>
          <Card title="Historique de maintenance" flush>
            <DataTable rows={d.interventions} empty={<Empty icon={<Wrench />} title="Aucune intervention" />}
              columns={[
                { key: 't', label: 'Intervention', render: (x: any) => <><Link to={`/maintenance/${x.id}`} className="cell-title">{x.title}</Link><div className="cell-sub">{x.ref} · {x.kind === 'preventive' ? 'Préventive' : 'Corrective'}</div></> },
                { key: 's', label: 'Statut', render: (x: any) => <Status kind="intervention" code={x.status} /> },
                { key: 'd', label: 'Ouverte', render: (x: any) => date(x.opened_at), mobile: 'hide' },
                { key: 'c', label: 'Coût', num: true, render: (x: any) => money(x.cost) },
              ]} />
          </Card>
          {d.royalties.length > 0 && <Card title="Redevances" flush><DataTable rows={d.royalties} columns={[
            { key: 'p', label: 'Période', render: (x: any) => `${date(x.period_start)} → ${date(x.period_end)}` },
            { key: 'a', label: 'Attendu', num: true, render: (x: any) => money(x.expected_amount) },
            { key: 'pa', label: 'Payé', num: true, render: (x: any) => money(x.paid_amount) },
            { key: 's', label: 'Statut', render: (x: any) => <Status kind="royalty" code={x.status} /> },
          ]} /></Card>}
          <Card title="Photos et pièces"><Documents entityType="support" entityId={s.id} canEdit={can('supports', 'update')} kinds={['photo', 'attestation', 'autre']} /></Card>
        </div>
        <div className="stack-lg">
          {s.latitude && <SupportMap rows={[{ ...s, faces: d.faces.map((f: any) => ({ ...f, state: s.status === 'disponible' ? 'disponible' : s.status })) }]} height="sm" />}
          <Card title="Caractéristiques"><Dl items={[['Adresse', s.address], ['Coordonnées GPS', s.latitude ? `${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}` : 'Non renseignées'], ['Dimensions', s.width_m ? `${s.width_m} × ${s.height_m} m` : null], ['Faces', d.faces.map((f: any) => f.code).join(', ')], ['Éclairage', s.illuminated ? 'Oui' : 'Non'], ['Visibilité', s.visibility], ['État', s.condition], ['Exploitant', s.operator], ['Réseau', s.network_name], ['Tarif / face / mois', money(s.monthly_rate)], ['Coûts mensuels', money(s.monthly_cost)], ['Installé le', date(s.installed_at)]]} />
            {s.constraints && <p className="small secondary" style={{ marginTop: 10 }}>{s.constraints}</p>}</Card>
          {d.admin_records.length > 0 && <Card title="Dossier administratif"><div className="stack small">{d.admin_records.map((a: any) => <div key={a.id}><strong>{a.title}</strong><div className="xsmall muted">{a.reference} · expire le {date(a.expires_at)}</div></div>)}</div></Card>}
        </div>
      </div>
      {edit && <SupportForm open onClose={() => setEdit(false)} initial={s} />}
      {ticket && <InterventionForm open onClose={() => setTicket(false)} preset={{ support_id: s.id, source: 'support' }} />}
    </>
  );
}
