import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight, List, Plus } from 'lucide-react';
import { Button, Card, DataTable, Empty, PageHeader, Segmented, Select } from '../components/ui';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { RecordForm } from './forms';
import { modules } from './modules';
import { can, dateTime, label, parseDateTime, toApiDateTime, type Page, type Row } from './types';
import { ActionForm, ErrorBox, Pager, Status } from './ui';

const kinds = ['tache','appel','rendez_vous','reunion','visite','note','email','relance'];
const localDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function monday(d: Date) { const v = new Date(d.getFullYear(), d.getMonth(), d.getDate()); v.setDate(v.getDate() - (v.getDay()+6)%7); return v; }

export default function Activities() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const [week, setWeek] = useState(() => monday(new Date()));
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Row | 'new' | null>(null);
  const [complete, setComplete] = useState<Row | null>(null);
  const qc = useQueryClient();
  const view = sp.get('view') === 'week' ? 'week' : 'list';
  const period = sp.get('period') || 'semaine';
  const status = sp.get('status') || 'ouvertes';
  const kind = sp.get('kind') || '';
  const scope = sp.get('scope') || 'mine';
  const change = (key: string, value: string) => { const next = new URLSearchParams(sp); value ? next.set(key,value) : next.delete(key); setSp(next); setPage(1); };
  const end = new Date(week); end.setDate(end.getDate()+6);
  const filters = { page, per_page: view === 'week' ? 100 : 25, ...(scope === 'mine' ? { mine: 1 } : {}), ...(kind ? {kind} : {}), ...(view === 'week' ? {from: toApiDateTime(`${localDay(week)}T00:00:00`), to: toApiDateTime(`${localDay(end)}T23:59:59`)} : {period, status_group: status}) };
  const q = useQuery({ queryKey: ['activities-workspace', filters], queryFn: () => api.get<Page>('/activities'+queryString(filters)) });
  const module = modules.find(m => m.key === 'activities')!;
  const rows = q.data?.data ?? [];
  const days = Array.from({length: 7}, (_,i) => { const d = new Date(week); d.setDate(d.getDate()+i); return d; });
  return <>
    <PageHeader title="Activités et agenda" subtitle="Tâches, appels, rendez-vous, visites et relances" actions={<>
      <Segmented label="Affichage" value={view} onChange={v => change('view',v === 'list' ? '' : v)} options={[{id:'list',label:'Liste',icon:<List />},{id:'week',label:'Semaine',icon:<CalendarDays /> }]} />
      {can(user,'activities.create') && <Button variant="primary" icon={<Plus />} onClick={() => setEdit('new')}>Nouvelle activité</Button>}
    </>} />
    <div className="filter-bar">
      {view === 'list' ? <Segmented label="Période" value={period} onChange={v => change('period',v)} options={[{id:'retard',label:'En retard'},{id:'aujourdhui',label:'Aujourd’hui'},{id:'semaine',label:'7 jours'},{id:'a_venir',label:'À venir'},{id:'toutes',label:'Toutes'}]} /> :
        <div className="row"><Button size="sm" iconOnly aria-label="Semaine précédente" icon={<ChevronLeft />} onClick={() => {const d=new Date(week);d.setDate(d.getDate()-7);setWeek(d);setPage(1);}} /><strong className="small">Semaine du {week.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</strong><Button size="sm" iconOnly aria-label="Semaine suivante" icon={<ChevronRight />} onClick={() => {const d=new Date(week);d.setDate(d.getDate()+7);setWeek(d);setPage(1);}} /><Button size="sm" onClick={() => {setWeek(monday(new Date()));setPage(1);}}>Aujourd’hui</Button></div>}
      {user?.role?.data_scope !== 'own' && <Select aria-label="Périmètre" value={scope} onChange={e=>change('scope',e.target.value)} options={[{value:'mine',label:'Mes activités'},{value:'accessible',label:'Périmètre autorisé'}]} />}
      <Select aria-label="Type" value={kind} onChange={e=>change('kind',e.target.value)} placeholder="Tous types" options={kinds.map(value=>({value,label:label(value)}))} />
      {view === 'list' && <Select aria-label="Statut" value={status} onChange={e=>change('status',e.target.value)} options={[{value:'ouvertes',label:'Ouvertes'},{value:'terminees',label:'Terminées'},{value:'toutes',label:'Toutes'}]} />}
    </div>
    <ErrorBox error={q.error} retry={() => void q.refetch()} />
    {!q.error && (view === 'list' ? <Card flush><DataTable rows={rows} loading={q.isLoading} empty={<Empty title="Aucune activité dans cette vue">Modifiez les filtres ou ajoutez une activité.</Empty>} columns={[
      {key:'title',label:'Activité',render:(a:Row)=><><Link to={'/activites/'+a.id} className="cell-title">{a.title}</Link><div className="cell-sub">{label(a.kind)}</div></>},
      {key:'due_at',label:'Échéance',render:(a:Row)=>dateTime(a.due_at)},
      {key:'priority_level',label:'Priorité',render:(a:Row)=>`P${a.priority_level}`,mobile:'hide'},
      {key:'status',label:'Statut',render:(a:Row)=><Status value={a.status} />},
      {key:'actions',label:'Actions',render:(a:Row)=>can(user,'activities.update') ? <div className="row-wrap">{!['termine','annule'].includes(a.status) && <Button size="sm" onClick={()=>setComplete(a)}>Terminer</Button>}<Button size="sm" onClick={()=>setEdit(a)}>Modifier</Button></div> : null},
    ]} /></Card> : <Card flush><div style={{overflowX:'auto'}}><div style={{display:'grid',gridTemplateColumns:'repeat(7, minmax(150px, 1fr))',minWidth:1050}}>
      {days.map(d => <div key={localDay(d)} style={{borderLeft:'1px solid var(--border)',minHeight:360,background:localDay(d)===localDay(new Date())?'var(--primary-soft)':undefined}}><div style={{padding:'10px 12px',borderBottom:'1px solid var(--border)'}}><div className="xsmall muted" style={{textTransform:'capitalize'}}>{d.toLocaleDateString('fr-FR',{weekday:'long'})}</div><div className="strong">{d.getDate()} {d.toLocaleDateString('fr-FR',{month:'short'})}</div></div><div className="stack" style={{padding:8,gap:6}}>{rows.filter(a=>a.due_at && !Number.isNaN(parseDateTime(a.due_at).getTime()) && localDay(parseDateTime(a.due_at))===localDay(d)).map(a=><Link className="kanban-card" style={{opacity:a.status==='termine'?0.6:1}} key={a.id} to={'/activites/'+a.id}><span className="xsmall muted">{parseDateTime(a.due_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · {label(a.kind)}</span><span className="title" style={{textDecoration:a.status==='termine'?'line-through':undefined}}>{a.title}</span><Status value={a.status} /></Link>)}</div></div>)}
    </div></div></Card>)}
    {q.data && <Pager page={q.data} change={setPage} />}
    {view === 'week' && (q.data?.last_page ?? 1)>1 && <p className="small muted">Semaine paginée : consultez toutes les pages pour voir toutes les activités.</p>}
    {edit && <RecordForm title={edit === 'new' ? 'Nouvelle activité' : 'Modifier l’activité'} path="/activities" fields={module.fields} row={edit === 'new' ? undefined : edit} close={()=>setEdit(null)} />}
    {complete && <ActionForm title="Terminer l’activité" close={()=>setComplete(null)} submitLabel="Terminer" submit={async f => {
      const outcome = String(f.get('outcome') || '').trim();
      const contactResult = String(f.get('contact_result') || '');
      await api.patch(`/activities/${complete.id}`, {status:'termine', ...(outcome ? {outcome} : {}), ...(contactResult ? {contact_result:contactResult} : {})});
      await qc.invalidateQueries({queryKey:['activities-workspace']});
    }}>
      <p>{complete.title}</p>
      <label className="field">Compte rendu {Number(complete.priority_level) === 1 && '(obligatoire)'}<textarea name="outcome" maxLength={10000} required={Number(complete.priority_level) === 1} /></label>
      {['appel','email','rendez_vous','reunion','visite','relance'].includes(complete.kind) && <label className="field">Résultat du contact<select name="contact_result" defaultValue=""><option value="">Non renseigné</option><option value="joint">Joint</option><option value="injoignable">Injoignable</option><option value="refus">Refus / opposition</option></select></label>}
      <p>Un refus enregistre l’opposition du contact lorsqu’il est renseigné et annule les relances générées associées.</p>
    </ActionForm>}
  </>;
}
