import { ExcelButton } from '../components/ExportButton';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Clock, Columns3, Kanban as KanbanIcon, List, Plus, Search } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { useAuth, useCan, useLookups, useUsers } from '../lib/auth';
import { qs } from '../lib/api';
import { date, money, moneyShort, relative } from '../lib/format';
import { Avatar, Badge, Button, Card, DataTable, Empty, ErrorState, Help, Input, LoadingBlock, PageHeader, Segmented, Select } from '../components/ui';
import { OpportunityForm } from '../components/forms';
import { StageMoveModal } from '../components/StageMove';

export default function Opportunities() {
  const nav = useNavigate();
  const can = useCan();
  const { me } = useAuth();
  const { lookups } = useLookups();
  const users = useUsers();
  const [sp, setSp] = useSearchParams();
  const view = sp.get('view') ?? 'kanban';
  const set = (o: Record<string, string>) => { const n = new URLSearchParams(sp); for (const [k, v] of Object.entries(o)) { if (v) n.set(k, v); else n.delete(k); } setSp(n, { replace: true }); };
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [create, setCreate] = useState(false);
  const [move, setMove] = useState<{ opp: any; target: string } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const status = sp.get('status') ?? 'ouvertes';
  const params = { q: sp.get('q'), owner_id: sp.get('owner'), offer_type: sp.get('offer'), sector: sp.get('sector'), commune: sp.get('commune'), close_to: sp.get('close_to'), min_amount: sp.get('min'), inactive: sp.get('inactive'), status: view === 'kanban' ? 'ouvertes' : status, sort: sp.get('sort'), dir: sp.get('dir') ?? 'asc' };
  const r = useApi<any>(['opportunities', params], `/api/opportunities${qs(params)}`);
  const stages = useApi<any[]>(['stages'], '/api/pipeline/stages');
  const open = (stages.data ?? []).filter((s) => !s.is_closed);
  const byStage = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const o of r.data?.rows ?? []) (m[o.stage_code] ??= []).push(o);
    return m;
  }, [r.data]);
  const commercials = users.filter((u) => ['commercial', 'direction_commerciale'].includes(u.role_code));

  const filters = (
    <div className="filter-bar">
      <form className="input-group search" role="search" onSubmit={(e) => { e.preventDefault(); set({ q }); }}><Search /><Input aria-label="Rechercher" placeholder="Opportunité, client, référence…" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set({ q })} /></form>
      {me?.data_scope !== 'own' && <Select aria-label="Commercial" value={sp.get('owner') ?? ''} onChange={(e) => set({ owner: e.target.value })} placeholder="Tous les commerciaux" options={commercials.map((u) => ({ value: u.id, label: u.full_name }))} />}
      <Select aria-label="Offre" value={sp.get('offer') ?? ''} onChange={(e) => set({ offer: e.target.value })} placeholder="Toutes offres" options={(lookups.offer_type ?? []).map((x) => ({ value: x.code, label: x.label }))} />
      <Select aria-label="Secteur" value={sp.get('sector') ?? ''} onChange={(e) => set({ sector: e.target.value })} placeholder="Tous secteurs" options={(lookups.sector ?? []).map((x) => ({ value: x.code, label: x.label }))} />
      <Select aria-label="Commune" value={sp.get('commune') ?? ''} onChange={(e) => set({ commune: e.target.value })} placeholder="Toutes communes" options={(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label }))} />
      <Select aria-label="Montant minimum" value={sp.get('min') ?? ''} onChange={(e) => set({ min: e.target.value })} placeholder="Tout montant" options={[{ value: '1000000', label: '≥ 1 M' }, { value: '5000000', label: '≥ 5 M' }, { value: '10000000', label: '≥ 10 M' }, { value: '25000000', label: '≥ 25 M' }]} />
      {view === 'list' && <Select aria-label="Statut" value={status} onChange={(e) => set({ status: e.target.value })} options={[{ value: 'ouvertes', label: 'Ouvertes' }, { value: 'gagnees', label: 'Gagnées' }, { value: 'perdues', label: 'Perdues / suspendues' }, { value: 'toutes', label: 'Toutes' }]} />}
      <label className="checkbox"><input type="checkbox" checked={sp.get('inactive') === '1'} onChange={(e) => set({ inactive: e.target.checked ? '1' : '' })} />Sans activité récente</label>
    </div>
  );

  return (
    <>
      <PageHeader title="Opportunités" subtitle="Pipeline commercial — de la prospection au closing"
        actions={<>
          <Segmented label="Affichage" value={view} onChange={(v) => set({ view: v === 'kanban' ? '' : v })} options={[{ id: 'kanban', label: 'Kanban', icon: <Columns3 /> }, { id: 'list', label: 'Liste', icon: <List /> }]} />
          {can('opportunities', 'export') && <ExcelButton url={`/api/opportunities${qs({ ...params, format: 'xlsx' })}`} />}
          {can('opportunities', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>Nouvelle opportunité</Button>}
        </>} />
      {filters}
      {r.data && (
        <div className="row-wrap small secondary" aria-live="polite">
          <strong className="num" style={{ color: 'var(--text)' }}>{r.data.totals.count}</strong> opportunités ouvertes ·
          brut <strong className="num" style={{ color: 'var(--text)' }}>{money(r.data.totals.gross)}</strong> ·
          pondéré <strong className="num" style={{ color: 'var(--text)' }}>{money(r.data.totals.weighted)}</strong>
          <Help title="Pipeline pondéré">Somme de (montant estimé × probabilité de l’étape). Les probabilités sont configurées par la direction pour chaque étape.</Help>
        </div>
      )}
      {r.error ? <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card> : r.isLoading || stages.isLoading ? <Card><LoadingBlock rows={8} /></Card> : view === 'kanban' ? (
        <div className="kanban" aria-label="Pipeline par étape">
          {open.map((s) => {
            const items = byStage[s.code] ?? [];
            const sum = items.reduce((a, o) => a + o.amount, 0);
            return (
              <section key={s.code} className={`kanban-col${dragOver === s.code ? ' drop' : ''}`} aria-label={`${s.label}, ${items.length} opportunités`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(s.code); }} onDragLeave={() => setDragOver(null)}
                onDrop={(e) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('text/plain'); const o = r.data.rows.find((x: any) => x.id === id); if (o && o.stage_code !== s.code) setMove({ opp: o, target: s.code }); }}>
                <div className="kanban-head">
                  <h3><span>{s.label}</span><span className="muted">{items.length}</span></h3>
                  <div className="muted">{moneyShort(sum)} · {s.probability} %</div>
                </div>
                {items.map((o) => (
                  <article key={o.id} className={`kanban-card${o.is_inactive || o.is_overdue ? ' flag' : ''}`} draggable={can('opportunities', 'update')} tabIndex={0}
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', o.id)} onClick={() => nav(`/opportunites/${o.id}`)} onKeyDown={(e) => { if (e.key === 'Enter') nav(`/opportunites/${o.id}`); }}
                    aria-label={`${o.title}, ${o.organization_name}, ${money(o.amount)}`}>
                    <div className="title">{o.title}</div>
                    <div className="xsmall secondary truncate">{o.organization_name}</div>
                    <div className="meta"><strong className="num" style={{ color: 'var(--text)' }}>{moneyShort(o.amount)}</strong><span>{date(o.expected_close_date)}</span></div>
                    <div className="meta">
                      <span className="row" style={{ gap: 6 }}><Avatar name={o.owner_name} size="sm" /><span className="truncate">{o.owner_name}</span></span>
                      {o.is_overdue ? <Badge tone="danger"><Clock size={11} />Date dépassée</Badge> : o.is_inactive ? <Badge tone="warning"><AlertTriangle size={11} />{relative(o.last_activity_at)}</Badge> : null}
                    </div>
                  </article>
                ))}
                {!items.length && <p className="xsmall muted" style={{ padding: '4px 6px' }}>Aucune opportunité</p>}
              </section>
            );
          })}
        </div>
      ) : (
        <Card flush>
          <DataTable rows={r.data?.rows} onRowClick={(o: any) => nav(`/opportunites/${o.id}`)} sort={{ key: params.sort ?? 'stage', dir: params.dir as any }}
            onSort={(k) => set({ sort: k, dir: params.sort === k && params.dir === 'asc' ? 'desc' : 'asc' })}
            empty={<Empty icon={<KanbanIcon />} title="Aucune opportunité" action={can('opportunities', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>Nouvelle opportunité</Button>}>Modifiez les filtres ou créez une opportunité.</Empty>}
            columns={[
              { key: 'title', label: 'Opportunité', sortable: true, render: (o: any) => <><div className="cell-title">{o.title}</div><div className="cell-sub">{o.ref} · {o.organization_name}</div></> },
              { key: 'stage', label: 'Étape', sortable: true, render: (o: any) => <Badge tone={o.is_won ? 'success' : o.is_closed ? 'neutral' : 'info'}>{o.stage_label}</Badge> },
              { key: 'amount', label: 'Montant', num: true, sortable: true, render: (o: any) => money(o.amount) },
              { key: 'weighted', label: 'Pondéré', num: true, sortable: true, render: (o: any) => moneyShort(o.weighted), mobile: 'hide' },
              { key: 'close', label: 'Clôture', sortable: true, render: (o: any) => <span className="nowrap small" style={o.is_overdue ? { color: 'var(--danger)' } : undefined}>{date(o.expected_close_date)}</span> },
              { key: 'owner', label: 'Responsable', sortable: true, render: (o: any) => <span className="small">{o.owner_name}</span>, mobile: 'hide' },
              { key: 'activity', label: 'Activité', sortable: true, render: (o: any) => o.is_inactive ? <Badge tone="warning">{relative(o.last_activity_at)}</Badge> : <span className="small muted">{relative(o.last_activity_at)}</span>, mobile: 'hide' },
            ]} />
        </Card>
      )}
      <OpportunityForm open={create} onClose={() => setCreate(false)} />
      <StageMoveModal opp={move?.opp ?? null} target={move?.target ?? null} stages={stages.data ?? []} onClose={() => setMove(null)} />
    </>
  );
}
