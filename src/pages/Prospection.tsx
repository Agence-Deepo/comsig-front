import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Target } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useAuth, useCan, useLookups } from '../lib/auth';
import { qs } from '../lib/api';
import { relative } from '../lib/format';
import { Badge, Button, Card, DataTable, Empty, PageHeader, Kpi, Status } from '../components/ui';
import { OrganizationForm } from '../components/forms';

/** Prospection : prospects, qualification et premiers contacts (§5.3.1 étapes 1 à 3). */
export default function Prospection() {
  const nav = useNavigate();
  const can = useCan();
  const { me } = useAuth();
  const { label } = useLookups();
  const [sp, setSp] = useSearchParams();
  const qual = sp.get('qualif') ?? '';
  const [create, setCreate] = useState(false);
  const all = useApi<any>(['organizations', 'prospects-all'], `/api/organizations${qs({ kind: 'prospect', pageSize: 500, sort: 'activity', dir: 'asc' })}`);
  const rows = (all.data?.rows ?? []).filter((o: any) => !qual || o.qualification_status === qual);
  const count = (s: string) => (all.data?.rows ?? []).filter((o: any) => o.qualification_status === s).length;
  const stale = (all.data?.rows ?? []).filter((o: any) => !o.last_activity_at || Date.now() - new Date(o.last_activity_at).getTime() > 14 * 86400000).length;
  return (
    <>
      <PageHeader title="Prospection" subtitle={me?.data_scope === 'own' ? 'Vos prospects : qualifiez-les, planifiez le prochain contact, convertissez-les en opportunités.' : 'Prospects de l’équipe : qualification et premiers contacts.'}
        actions={can('organizations', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>Nouveau prospect</Button>} />
      <div className="grid-4">
        <Kpi label="À qualifier" value={count('a_qualifier')} onClick={() => setSp(qual === 'a_qualifier' ? {} : { qualif: 'a_qualifier' })} foot={<span>Fiches sans évaluation</span>} />
        <Kpi label="Qualification en cours" value={count('en_cours')} onClick={() => setSp({ qualif: 'en_cours' })} />
        <Kpi label="Qualifiés" value={count('qualifie')} onClick={() => setSp({ qualif: 'qualifie' })} foot={<span>Prêts pour une opportunité</span>} />
        <Kpi label="Sans contact depuis 14 j" value={stale} action={stale > 0} foot={<span>À relancer en priorité</span>} />
      </div>
      <Card flush title={qual ? `Prospects ${({ a_qualifier: 'à qualifier', en_cours: 'qualification en cours', qualifie: 'qualifiés', disqualifie: 'disqualifiés', en_veille: 'en veille' } as any)[qual]}` : `Tous les prospects (${rows.length})`}
        actions={qual && <Button size="sm" variant="ghost" onClick={() => setSp({})}>Effacer le filtre</Button>}>
        <DataTable rows={rows} loading={all.isLoading} onRowClick={(o: any) => nav(`/organisations/${o.id}`)}
          empty={<Empty icon={<Target />} title="Aucun prospect dans cette vue" action={can('organizations', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>Ajouter un prospect</Button>}>Les nouveaux prospects reçoivent automatiquement une tâche de premier contact.</Empty>}
          columns={[
            { key: 'name', label: 'Prospect', render: (o: any) => <><div className="cell-title">{o.legal_name}</div><div className="cell-sub">{label('sector', o.sector)} · {label('commune', o.commune)}</div></> },
            { key: 'qual', label: 'Qualification', render: (o: any) => <Status kind="qualification" code={o.qualification_status} /> },
            { key: 'score', label: 'Score', num: true, render: (o: any) => <span className="num">{o.qualification_score} %</span> },
            { key: 'potential', label: 'Potentiel', render: (o: any) => o.potential ? <Badge tone={o.potential === 'strategique' ? 'accent' : o.potential === 'fort' ? 'primary' : 'neutral'} dot={false}>{o.potential}</Badge> : '—', mobile: 'hide' },
            { key: 'source', label: 'Source', render: (o: any) => <span className="small">{label('source', o.source)}</span>, mobile: 'hide' },
            { key: 'owner', label: 'Responsable', render: (o: any) => <span className="small">{o.owner_name}</span>, mobile: 'hide' },
            { key: 'activity', label: 'Dernier contact', render: (o: any) => <span className={`small ${!o.last_activity_at || Date.now() - new Date(o.last_activity_at).getTime() > 14 * 86400000 ? '' : 'muted'}`} style={!o.last_activity_at || Date.now() - new Date(o.last_activity_at).getTime() > 14 * 86400000 ? { color: 'var(--warning)' } : undefined}>{o.last_activity_at ? relative(o.last_activity_at) : 'Jamais'}</span> },
          ]} />
      </Card>
      <OrganizationForm open={create} onClose={() => setCreate(false)} defaultKind="prospect" />
    </>
  );
}
