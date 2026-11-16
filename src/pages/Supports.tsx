import { ExcelButton } from '../components/ExportButton';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { List, Map as MapIcon, Plus, Search, LayoutGrid } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { useCan, useLookups } from '../lib/auth';
import { addDays, date, money, today } from '../lib/format';
import { Button, Card, DataTable, Empty, Field, Input, Modal, MoneyInput, PageHeader, Segmented, Select, Status, Textarea, Kpi } from '../components/ui';
import { SupportMap, MapLegend } from '../components/SupportMap';

export function SupportForm({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: any }) {
  const { lookups } = useLookups();
  const nav = useNavigate();
  const can = useCan();
  const empty = { code: '', name: '', type: 'panneau_4x3', format: '', width_m: '', height_m: '', address: '', commune: '', axis: '', latitude: '', longitude: '', illuminated: false, visibility: 'bonne', operator: 'COM&SIG', status: 'disponible', condition: 'bon', monthly_rate: null as number | null, monthly_cost: null as number | null, constraints: '', authorization_ref: '', authorization_expires: '', faces: 'A,B' };
  const [f, setF] = useState<any>(() => (initial ? { ...empty, ...Object.fromEntries(Object.entries(initial).filter(([k]) => k in empty).map(([k, v]) => [k, v ?? ''])) } : empty));
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e });
  const save = useAction((b: any) => (initial ? api.patch(`/api/supports/${initial.id}`, b) : api.post('/api/supports', b)), { success: 'Support enregistré', invalidate: [['supports'], ['support']], onSuccess: (r: any) => { onClose(); if (!initial) nav(`/supports/${r.id}`); } });
  const submit = () => {
    const b: any = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' ? null : v]));
    for (const k of ['width_m', 'height_m', 'latitude', 'longitude']) if (b[k] !== null) b[k] = Number(b[k]);
    b.faces = initial ? undefined : String(f.faces).split(/[,;\s]+/).filter(Boolean).map((c: string) => ({ code: c.toUpperCase(), label: `Face ${c.toUpperCase()}` }));
    if (initial) { delete b.faces; if (!can('catalog', 'update')) { delete b.monthly_rate; delete b.monthly_cost; } }
    else { b.monthly_rate = f.monthly_rate ?? 0; b.monthly_cost = f.monthly_cost ?? 0; }
    save.run(b);
  };
  const fe = save.fieldErrors;
  return (
    <Modal open={open} onClose={onClose} size="lg" title={initial ? `Modifier ${initial.code}` : 'Nouveau support'} footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={submit}>Enregistrer</Button></>}>
      <div className="form-grid">
        <Field label="Code unique" required error={fe.code}><Input value={f.code} onChange={set('code')} disabled={!!initial} placeholder="ABJ-COC-010" /></Field>
        <Field label="Nom" required error={fe.name}><Input value={f.name} onChange={set('name')} /></Field>
        <Field label="Type" required><Select value={f.type} onChange={set('type')} options={(lookups.support_type ?? []).map((x) => ({ value: x.code, label: x.label }))} /></Field>
        <Field label="Format"><Input value={f.format} onChange={set('format')} placeholder="12 × 4 m" /></Field>
        <Field label="Commune" required error={fe.commune}><Select value={f.commune} onChange={set('commune')} placeholder="Choisir…" options={(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label }))} /></Field>
        <Field label="Axe"><Input value={f.axis} onChange={set('axis')} /></Field>
        <Field label="Adresse descriptive" required error={fe.address} className="span-2"><Input value={f.address} onChange={set('address')} /></Field>
        <Field label="Latitude" error={fe.latitude}><Input inputMode="decimal" value={f.latitude} onChange={set('latitude')} placeholder="5.3600" /></Field>
        <Field label="Longitude" error={fe.longitude}><Input inputMode="decimal" value={f.longitude} onChange={set('longitude')} placeholder="-3.9930" /></Field>
        <Field label="Visibilité"><Select value={f.visibility} onChange={set('visibility')} options={['faible', 'moyenne', 'bonne', 'excellente'].map((x) => ({ value: x, label: x }))} /></Field>
        <Field label="État"><Select value={f.condition} onChange={set('condition')} options={[{ value: 'neuf', label: 'Neuf' }, { value: 'bon', label: 'Bon' }, { value: 'use', label: 'Usé' }, { value: 'degrade', label: 'Dégradé' }, { value: 'hors_service', label: 'Hors service' }]} /></Field>
        <Field label="Statut d’exploitation"><Select value={f.status} onChange={set('status')} options={[{ value: 'disponible', label: 'Exploitable' }, { value: 'en_maintenance', label: 'En maintenance' }, { value: 'indisponible', label: 'Indisponible' }, { value: 'retire', label: 'Retiré' }]} /></Field>
        {!initial && <Field label="Faces" hint="Codes séparés par des virgules"><Input value={f.faces} onChange={set('faces')} /></Field>}
        <Field label="Tarif mensuel / face" hint={initial && !can('catalog', 'update') ? 'Paramètre financier : modifiable par la direction ou la finance' : undefined}><MoneyInput value={f.monthly_rate === '' ? null : f.monthly_rate} onChange={set('monthly_rate')} /></Field>
        <Field label="Coûts récurrents mensuels"><MoneyInput value={f.monthly_cost === '' ? null : f.monthly_cost} onChange={set('monthly_cost')} /></Field>
        <Field label="Référence d’autorisation"><Input value={f.authorization_ref} onChange={set('authorization_ref')} /></Field>
        <Field label="Expiration de l’autorisation"><Input type="date" value={f.authorization_expires} onChange={set('authorization_expires')} /></Field>
        <label className="checkbox"><input type="checkbox" checked={f.illuminated} onChange={set('illuminated')} />Éclairé</label>
        <Field label="Contraintes" className="span-2"><Textarea value={f.constraints} onChange={set('constraints')} /></Field>
      </div>
    </Modal>
  );
}

export default function Supports() {
  const nav = useNavigate();
  const can = useCan();
  const { lookups, label } = useLookups();
  const [sp, setSp] = useSearchParams();
  const set = (o: Record<string, string>) => { const n = new URLSearchParams(sp); for (const [k, v] of Object.entries(o)) { if (v) n.set(k, v); else n.delete(k); } setSp(n, { replace: true }); };
  const view = sp.get('view') ?? 'list';
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [create, setCreate] = useState(false);
  const params = { q: sp.get('q'), commune: sp.get('commune'), type: sp.get('type'), status: sp.get('status'), from: sp.get('from') ?? today(), to: sp.get('to') ?? sp.get('from') ?? today(), available: sp.get('available'), visibility: sp.get('visibility') };
  const r = useApi<any>(['supports', params], `/api/supports${qs(params)}`);
  const counts = r.data?.counts ?? {};
  const total = Object.values(counts).reduce((a: number, b: any) => a + b, 0) as number;
  return (
    <>
      <PageHeader title="Supports publicitaires" subtitle="Inventaire par support et par face — disponibilité calculée sur la période choisie"
        actions={<>
          <Segmented label="Affichage" value={view} onChange={(v) => set({ view: v === 'list' ? '' : v })} options={[{ id: 'list', label: 'Liste', icon: <List /> }, { id: 'map', label: 'Carte', icon: <MapIcon /> }]} />
          {can('supports', 'export') && <ExcelButton url={`/api/supports${qs({ ...params, format: 'xlsx' })}`} />}
          {can('supports', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreate(true)}>Nouveau support</Button>}
        </>} />
      <div className="grid-4">
        <Kpi label="Faces disponibles" value={counts.disponible ?? 0} foot={<span>sur {total} faces · période {date(params.from)} → {date(params.to)}</span>} onClick={() => set({ status: 'disponible' })} />
        <Kpi label="Réservées / pré-réservées" value={(counts.reserve ?? 0) + (counts.pre_reserve ?? 0)} foot={<span>{counts.pre_reserve ?? 0} pré-réservation(s) en attente de confirmation</span>} />
        <Kpi label="Occupées (campagne en cours)" value={counts.occupe ?? 0} />
        <Kpi label="En maintenance / indisponibles" value={(counts.en_maintenance ?? 0) + (counts.indisponible ?? 0)} action={(counts.en_maintenance ?? 0) > 0} onClick={() => set({ status: 'en_maintenance' })} />
      </div>
      <div className="filter-bar">
        <form className="input-group search" role="search" onSubmit={(e) => { e.preventDefault(); set({ q }); }}><Search /><Input aria-label="Rechercher" placeholder="Code, nom, adresse, axe…" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => set({ q })} /></form>
        <label className="row small">Du <Input type="date" value={params.from} onChange={(e) => set({ from: e.target.value, to: params.to < e.target.value ? addDays(e.target.value, 30) : params.to })} style={{ width: 150 }} aria-label="Début de période" /></label>
        <label className="row small">au <Input type="date" value={params.to} onChange={(e) => set({ to: e.target.value })} style={{ width: 150 }} aria-label="Fin de période" /></label>
        <Select aria-label="Commune" value={sp.get('commune') ?? ''} onChange={(e) => set({ commune: e.target.value })} placeholder="Toutes communes" options={(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label }))} />
        <Select aria-label="Type" value={sp.get('type') ?? ''} onChange={(e) => set({ type: e.target.value })} placeholder="Tous types" options={(lookups.support_type ?? []).map((x) => ({ value: x.code, label: x.label }))} />
        <Select aria-label="Disponibilité" value={sp.get('status') ?? ''} onChange={(e) => set({ status: e.target.value })} placeholder="Toute disponibilité" options={['disponible', 'pre_reserve', 'reserve', 'occupe', 'en_maintenance', 'indisponible'].map((x) => ({ value: x, label: ({ disponible: 'Disponible', pre_reserve: 'Pré-réservé', reserve: 'Réservé', occupe: 'Occupé', en_maintenance: 'En maintenance', indisponible: 'Indisponible' } as any)[x] }))} />
        <Select aria-label="Visibilité" value={sp.get('visibility') ?? ''} onChange={(e) => set({ visibility: e.target.value })} placeholder="Toute visibilité" options={['excellente', 'bonne', 'moyenne', 'faible'].map((x) => ({ value: x, label: x }))} />
      </div>
      {view === 'map' ? (
        <Card title="Carte" actions={<MapLegend />}>
          <SupportMap rows={r.data?.rows ?? []} />
          <p className="xsmall muted" style={{ marginTop: 8 }}>{(r.data?.rows ?? []).filter((s: any) => !s.latitude).length} support(s) sans coordonnées GPS ne sont pas affichés. Fond de carte : OpenStreetMap (nécessite un accès Internet).</p>
        </Card>
      ) : (
        <Card flush>
          <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(s: any) => nav(`/supports/${s.id}`)} empty={<Empty icon={<LayoutGrid />} title="Aucun support ne correspond" />}
            columns={[
              { key: 'c', label: 'Support', render: (s: any) => <><div className="cell-title">{s.code}</div><div className="cell-sub">{s.name}</div></> },
              { key: 't', label: 'Type', render: (s: any) => <span className="small">{label('support_type', s.type)}<div className="xsmall muted">{s.format}</div></span>, mobile: 'hide' },
              { key: 'l', label: 'Emplacement', render: (s: any) => <span className="small">{label('commune', s.commune)}<div className="xsmall muted">{s.axis}</div></span> },
              { key: 'f', label: 'Faces sur la période', render: (s: any) => <div className="row-wrap">{s.faces.map((f: any) => <span key={f.id} className="row" style={{ gap: 4 }}><span className="xsmall strong">{f.code}</span><Status kind="face" code={f.state} /></span>)}</div> },
              { key: 'r', label: 'Tarif / mois', num: true, render: (s: any) => money(s.monthly_rate), mobile: 'hide' },
              { key: 'i', label: 'Interventions', num: true, render: (s: any) => (s.open_interventions ? <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{s.open_interventions}</span> : '—'), mobile: 'hide' },
            ]} />
        </Card>
      )}
      {create && <SupportForm open onClose={() => setCreate(false)} />}
    </>
  );
}
