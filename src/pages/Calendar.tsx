import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, UserCog, Trash2 } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth, useCan } from '../lib/auth';
import { EVENT_CATEGORY } from '../lib/labels';
import { ProcessFlow } from '../components/ProcessFlow';
import { Button, Card, ErrorState, Field, Input, LoadingBlock, Modal, PageHeader, Segmented, Select, Textarea, ConfirmModal } from '../components/ui';

type View = 'jour' | 'semaine' | 'mois' | 'annee' | 'frise';
const iso = (d: Date) => d.toISOString().slice(0, 10);
const startOfWeek = (d: Date) => { const x = new Date(d); const dow = (x.getDay() + 6) % 7; x.setDate(x.getDate() - dow); return x; };
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const DAYS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
const time = (s: string) => new Date(s).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const SOURCE: Record<string, string> = { agenda: 'Rendez-vous', tache: 'Tâche', activite: 'Activité', ordre: 'Ordre de travail', deploiement: 'Déploiement', jalon: 'Jalon', conge: 'Congé' };

function range(view: View, ref: Date): [Date, Date] {
  if (view === 'jour') return [ref, ref];
  if (view === 'semaine') { const s = startOfWeek(ref); const e = new Date(s); e.setDate(s.getDate() + 6); return [s, e]; }
  if (view === 'mois') { const s = startOfWeek(new Date(ref.getFullYear(), ref.getMonth(), 1)); const e = new Date(s); e.setDate(s.getDate() + 41); return [s, e]; }
  if (view === 'frise') { const s = new Date(ref); s.setDate(s.getDate() - 7); const e = new Date(ref); e.setDate(e.getDate() + 60); return [s, e]; }
  return [new Date(ref.getFullYear(), 0, 1), new Date(ref.getFullYear(), 11, 31)];
}

/** Calendrier : planifier sa journée, sa semaine, son mois et son année ; agenda délégué (assistante de direction). */
export default function Calendar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const opportunityId = searchParams.get('opportunity_id');
  const { me } = useAuth();
  const can = useCan();
  const [view, setView] = useState<View>('semaine');
  const [ref, setRef] = useState(() => new Date());
  const [owner, setOwner] = useState('');
  const [edit, setEdit] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const [deleg, setDeleg] = useState(false);
  const owners = useApi<{ rows: any[] }>(['cal-owners'], '/api/calendar/owners');
  const [from, to] = range(view, ref);
  const r = useApi<any>(['calendar', iso(from), iso(to), owner, opportunityId], `/api/calendar?from=${iso(from)}&to=${iso(to)}${owner ? `&owner_id=${owner}` : ''}${opportunityId ? `&opportunity_id=${encodeURIComponent(opportunityId)}` : ''}`);
  const events: any[] = r.data?.events ?? [];
  const byDay = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const e of events) {
      const s = new Date(e.starts_at), en = new Date(e.ends_at);
      for (let d = new Date(s.getFullYear(), s.getMonth(), s.getDate()); d <= en && Object.keys(m).length < 2000; d.setDate(d.getDate() + 1)) (m[iso(d)] ??= []).push(e);
    }
    return m;
  }, [events]);
  const shift = (n: number) => {
    const d = new Date(ref);
    if (view === 'jour') d.setDate(d.getDate() + n); else if (view === 'semaine') d.setDate(d.getDate() + 7 * n); else if (view === 'mois' || view === 'frise') d.setMonth(d.getMonth() + n); else d.setFullYear(d.getFullYear() + n);
    setRef(d);
  };
  const title = view === 'frise' ? `Planification du ${from.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${to.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : view === 'annee' ? String(ref.getFullYear()) : view === 'mois' ? `${MONTHS[ref.getMonth()]} ${ref.getFullYear()}`
    : view === 'semaine' ? `Semaine du ${from.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : ref.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const newAt = (day: string, hour = 9) => {
    const s = new Date(`${day}T${String(hour).padStart(2, '0')}:00:00`);
    setEdit({ owner_id: owner || me?.id, title: '', description: '', location: '', category: 'reunion', start: toLocal(s), end: toLocal(new Date(s.getTime() + 3600000)), all_day: false, recurrence: 'aucune', recurrence_until: '', reminder_minutes: 30, is_private: false });
  };
  const ownerOptions = (owners.data?.rows ?? []).map((o: any) => ({ value: o.is_me ? '' : o.id, label: o.is_me ? `Mon agenda` : `${o.full_name}${o.department_label ? ` · ${o.department_label}` : ''}` }));
  const open = (e: any) => { if (e.source === 'agenda' && !e.occurrence) setEdit({ ...e, start: toLocal(new Date(e.starts_at)), end: toLocal(new Date(e.ends_at)), recurrence_until: e.recurrence_until ?? '' }); else if (e.source === 'agenda') setEdit({ ...e, start: toLocal(new Date(e.starts_at)), end: toLocal(new Date(e.ends_at)), recurrence_until: e.recurrence_until ?? '' }); };
  return (
    <>
      <PageHeader title="Calendrier" subtitle="Votre journée, votre semaine, votre mois et votre année : rendez-vous, tâches, ordres de travail, déploiements et congés"
        actions={<>
          {ownerOptions.length > 1 && <Select aria-label="Agenda" value={owner} onChange={(e) => setOwner(e.target.value)} options={ownerOptions} />}
          <Button icon={<UserCog />} onClick={() => setDeleg(true)}>Délégations</Button>
          {can('calendar', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => newAt(iso(view === 'jour' ? ref : new Date()))}>Rendez-vous</Button>}
        </>} />
      {opportunityId && <p>Agenda de l’affaire : seules les activités associées dans l’agenda sélectionné sont affichées. <button className="text-button" onClick={() => { const next = new URLSearchParams(searchParams); next.delete('opportunity_id'); setSearchParams(next); }}>Afficher tout le calendrier</button></p>}
      <div className="cal-toolbar">
        <div className="row"><Button size="sm" iconOnly icon={<ChevronLeft />} aria-label="Précédent" onClick={() => shift(-1)} /><Button size="sm" onClick={() => setRef(new Date())}>Aujourd’hui</Button><Button size="sm" iconOnly icon={<ChevronRight />} aria-label="Suivant" onClick={() => shift(1)} /><h2 className="cal-title">{title}</h2></div>
        <Segmented label="Vue" value={view} onChange={setView} options={[{ id: 'jour', label: 'Jour' }, { id: 'semaine', label: 'Semaine' }, { id: 'mois', label: 'Mois' }, { id: 'annee', label: 'Année' }, { id: 'frise', label: 'Frise' }]} />
      </div>
      {r.error ? <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card> : r.isLoading ? <Card><LoadingBlock rows={8} /></Card> : (
        <Card flush>
          {(view === 'jour' || view === 'semaine') && <TimeGrid days={view === 'jour' ? [ref] : Array.from({ length: 7 }, (_, i) => { const d = new Date(from); d.setDate(from.getDate() + i); return d; })} byDay={byDay} onOpen={open} onNew={newAt} />}
          {view === 'mois' && <MonthGrid from={from} month={ref.getMonth()} byDay={byDay} onOpen={open} onDay={(d) => { setRef(new Date(d + 'T12:00:00')); setView('jour'); }} />}
          {view === 'frise' && <div className="card-body"><ProcessFlow items={events.filter((e) => e.source !== 'activite' || !e.all_day).map((e, i) => ({ id: `${e.id}-${i}`, title: e.title, start: String(e.starts_at).slice(0, 10), end: String(e.ends_at).slice(0, 10), status: e.status === 'termine' ? 'termine' : e.status === 'en_cours' ? 'en_cours' : 'a_faire', ref: e.ref, who: SOURCE[e.source], onClick: () => open(e) }))} emptyLabel="Rien de planifié sur cette période." /></div>}
          {view === 'annee' && <YearGrid year={ref.getFullYear()} byDay={byDay} onDay={(d) => { setRef(new Date(d + 'T12:00:00')); setView('jour'); }} />}
        </Card>
      )}
      <div className="chips small legend-row">{Object.entries(EVENT_CATEGORY).map(([k, l]) => <span key={k} className="chip"><i className={`sw cat-${k}`} />{l}</span>)}</div>
      <EventModal edit={edit} setEdit={setEdit} onDelete={(e) => { setDel(e); setEdit(null); }} />
      <DeleteEvent ev={del} onClose={() => setDel(null)} />
      <Delegations open={deleg} onClose={() => setDeleg(false)} />
    </>
  );
}

function Delegations({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rows = useApi<any>(['calendar-delegations'], open ? '/api/calendar/delegations' : null);
  const options = useApi<any>(['calendar-delegation-options'], open ? '/api/calendar/delegation-options' : null);
  const [delegate, setDelegate] = useState(''); const [edit, setEdit] = useState(true);
  const save = useAction((b: any) => api.post('/api/calendar/delegations', b), { success: 'Délégation enregistrée', invalidate: [['calendar-delegations'], ['cal-owners']], onSuccess: () => setDelegate('') });
  const remove = useAction((id: number) => api.del(`/api/calendar/delegations/${id}`), { success: 'Délégation retirée', invalidate: [['calendar-delegations'], ['cal-owners']] });
  return <Modal open={open} onClose={onClose} title="Déléguer mon agenda" description="Un délégué peut consulter votre agenda. Autorisez explicitement la modification si nécessaire." footer={<Button onClick={onClose}>Fermer</Button>}>
    <div className="stack"><div className="row-wrap"><Select aria-label="Délégué" value={delegate} onChange={e => setDelegate(e.target.value)} placeholder="Choisir une personne" options={(options.data?.data ?? []).map((u: any) => ({ value: u.id, label: `${u.name} · ${u.department ?? ''}` }))} /><label className="checkbox"><input type="checkbox" checked={edit} onChange={e => setEdit(e.target.checked)} /> Peut modifier</label><Button variant="primary" disabled={!delegate} loading={save.isPending} onClick={() => save.run({ delegate_id: Number(delegate), can_edit: edit })}>Ajouter</Button></div>
      {(rows.data?.rows ?? []).map((d: any) => <div className="list-item" key={d.id}><span className="spacer">{d.name} · {d.can_edit ? 'consultation et modification' : 'consultation seule'}</span><Button variant="ghost" iconOnly icon={<Trash2 />} aria-label={`Retirer ${d.name}`} onClick={() => remove.run(d.id)} /></div>)}
      {!rows.data?.rows?.length && <p className="muted">Aucune délégation configurée.</p>}
    </div>
  </Modal>;
}

const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

function Chip({ e, onOpen }: { e: any; onOpen: (e: any) => void }) {
  const inner = <><span className="ev-time">{e.all_day ? '' : time(e.starts_at)}</span> {e.ref && e.source !== 'agenda' ? <span className="ev-ref">{e.ref}</span> : null} {e.title}</>;
  const cls = `ev cat-${e.category}${e.status === 'termine' ? ' done' : ''}`;
  const label = `${SOURCE[e.source] ?? ''} : ${e.title}`;
  if (e.source !== 'agenda' && e.link) return <Link to={e.link} className={cls} title={label}>{inner}</Link>;
  return <button className={cls} title={label} onClick={() => onOpen(e)}>{inner}</button>;
}

function TimeGrid({ days, byDay, onOpen, onNew }: { days: Date[]; byDay: Record<string, any[]>; onOpen: (e: any) => void; onNew: (day: string, h: number) => void }) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);
  const todayIso = iso(new Date());
  return (
    <div className="cal-week" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(120px, 1fr))` }}>
      <div className="cal-corner" />
      {days.map((d) => <div key={iso(d)} className={`cal-dayhead${iso(d) === todayIso ? ' today' : ''}`}>{DAYS[(d.getDay() + 6) % 7]} <strong>{d.getDate()}</strong></div>)}
      <div className="cal-allday-label xsmall muted">Journée</div>
      {days.map((d) => <div key={'a' + iso(d)} className="cal-allday">{(byDay[iso(d)] ?? []).filter((e) => e.all_day).map((e, i) => <Chip key={e.id + i} e={e} onOpen={onOpen} />)}</div>)}
      {hours.map((h) => (
        <div key={h} className="cal-row">
          <div className="cal-hour xsmall muted">{h} h</div>
          {days.map((d) => {
            const items = (byDay[iso(d)] ?? []).filter((e) => !e.all_day && new Date(e.starts_at).getHours() === h && iso(new Date(e.starts_at)) === iso(d));
            return <div key={iso(d) + h} className="cal-slot" onDoubleClick={() => onNew(iso(d), h)}>{items.map((e, i) => <Chip key={e.id + i} e={e} onOpen={onOpen} />)}</div>;
          })}
        </div>
      ))}
    </div>
  );
}

function MonthGrid({ from, month, byDay, onOpen, onDay }: { from: Date; month: number; byDay: Record<string, any[]>; onOpen: (e: any) => void; onDay: (d: string) => void }) {
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(from); d.setDate(from.getDate() + i); return d; });
  const todayIso = iso(new Date());
  return (
    <div className="cal-month">
      {DAYS.map((d) => <div key={d} className="cal-dayhead">{d}</div>)}
      {cells.map((d) => {
        const items = byDay[iso(d)] ?? [];
        return (
          <div key={iso(d)} className={`cal-cell${d.getMonth() !== month ? ' out' : ''}${iso(d) === todayIso ? ' today' : ''}`}>
            <button className="cal-num" onClick={() => onDay(iso(d))} aria-label={`Voir le ${d.toLocaleDateString('fr-FR')}`}>{d.getDate()}</button>
            {items.slice(0, 3).map((e, i) => <Chip key={e.id + i} e={e} onOpen={onOpen} />)}
            {items.length > 3 && <button className="xsmall muted link-btn" onClick={() => onDay(iso(d))}>+ {items.length - 3} autre(s)</button>}
          </div>
        );
      })}
    </div>
  );
}

function YearGrid({ year, byDay, onDay }: { year: number; byDay: Record<string, any[]>; onDay: (d: string) => void }) {
  const todayIso = iso(new Date());
  return (
    <div className="cal-year">
      {MONTHS.map((m, mi) => {
        const first = startOfWeek(new Date(year, mi, 1));
        const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(first); d.setDate(first.getDate() + i); return d; });
        const count = Object.entries(byDay).filter(([k]) => k.startsWith(`${year}-${String(mi + 1).padStart(2, '0')}`)).reduce((s, [, v]) => s + v.length, 0);
        return (
          <section key={m} className="cal-mini">
            <h3>{m} <span className="xsmall muted">{count ? `${count} élément(s)` : ''}</span></h3>
            <div className="cal-mini-grid">
              {DAYS.map((d) => <span key={d} className="xsmall muted">{d[0].toUpperCase()}</span>)}
              {cells.map((d) => {
                const n = (byDay[iso(d)] ?? []).length;
                return <button key={iso(d)} className={`mini-day${d.getMonth() !== mi ? ' out' : ''}${iso(d) === todayIso ? ' today' : ''} heat-${Math.min(n, 4)}`} onClick={() => onDay(iso(d))} aria-label={`${d.toLocaleDateString('fr-FR')} : ${n} élément(s)`} disabled={d.getMonth() !== mi}>{d.getDate()}</button>;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function EventModal({ edit, setEdit, onDelete }: { edit: any; setEdit: (e: any) => void; onDelete: (e: any) => void }) {
  const save = useAction((b: any) => (edit?.id ? api.put(`/api/calendar/events/${edit.id}`, b) : api.post('/api/calendar/events', b)), { success: 'Agenda mis à jour', invalidate: [['calendar']], onSuccess: () => setEdit(null) });
  const [err, setErr] = useState('');
  useEffect(() => setErr(''), [edit]);
  if (!edit) return null;
  const submit = () => {
    const s = new Date(edit.start), e = new Date(edit.end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) { setErr('La fin doit suivre le début.'); return; }
    save.run({ owner_id: edit.owner_id || null, title: edit.title, description: edit.description ?? '', location: edit.location ?? '', category: edit.category, starts_at: s.toISOString(), ends_at: e.toISOString(), all_day: !!edit.all_day, recurrence: edit.recurrence, recurrence_until: edit.recurrence_until || null, reminder_minutes: edit.reminder_minutes === '' ? null : Number(edit.reminder_minutes), is_private: !!edit.is_private });
  };
  return (
    <Modal open onClose={() => setEdit(null)} size="lg" title={edit.id ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
      footer={<>{edit.id && <Button variant="danger" onClick={() => onDelete(edit)}>Supprimer</Button>}<span className="spacer" /><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!edit.title?.trim()} onClick={submit}>Enregistrer</Button></>}>
      <div className="form-grid">
        <Field label="Intitulé" required className="span-2" error={save.fieldErrors.title}><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} autoFocus /></Field>
        <Field label="Début" required error={err || save.fieldErrors.starts_at}><Input type="datetime-local" value={edit.start} onChange={(e) => setEdit({ ...edit, start: e.target.value })} /></Field>
        <Field label="Fin" required error={save.fieldErrors.ends_at}><Input type="datetime-local" value={edit.end} onChange={(e) => setEdit({ ...edit, end: e.target.value })} /></Field>
        <Field label="Catégorie"><Select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} options={Object.entries(EVENT_CATEGORY).map(([value, label]) => ({ value, label }))} /></Field>
        <Field label="Lieu"><Input value={edit.location ?? ''} onChange={(e) => setEdit({ ...edit, location: e.target.value })} /></Field>
        <Field label="Répétition"><Select value={edit.recurrence} onChange={(e) => setEdit({ ...edit, recurrence: e.target.value })} options={[{ value: 'aucune', label: 'Aucune' }, { value: 'quotidienne', label: 'Chaque jour' }, { value: 'hebdomadaire', label: 'Chaque semaine' }, { value: 'mensuelle', label: 'Chaque mois' }, { value: 'annuelle', label: 'Chaque année' }]} /></Field>
        {edit.recurrence !== 'aucune' && <Field label="Jusqu’au"><Input type="date" value={edit.recurrence_until ?? ''} onChange={(e) => setEdit({ ...edit, recurrence_until: e.target.value })} /></Field>}
        <Field label="Rappel (minutes avant)"><Input type="number" min={0} value={edit.reminder_minutes ?? ''} onChange={(e) => setEdit({ ...edit, reminder_minutes: e.target.value })} /></Field>
        <Field label="Options" className="span-2"><div className="row-wrap">
          <label className="checkbox"><input type="checkbox" checked={!!edit.all_day} onChange={(e) => setEdit({ ...edit, all_day: e.target.checked })} /> Toute la journée</label>
          <label className="checkbox"><input type="checkbox" checked={!!edit.is_private} onChange={(e) => setEdit({ ...edit, is_private: e.target.checked })} /> Privé (affiché « Occupé » aux délégués)</label>
        </div></Field>
        <Field label="Notes" className="span-2"><Textarea value={edit.description ?? ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

function DeleteEvent({ ev, onClose }: { ev: any; onClose: () => void }) {
  const del = useAction(() => api.del(`/api/calendar/events/${ev.id}`), { success: 'Rendez-vous supprimé', invalidate: [['calendar']], onSuccess: onClose });
  return <ConfirmModal open={!!ev} onClose={onClose} onConfirm={() => del.run(undefined)} title="Supprimer ce rendez-vous ?" message={ev?.recurrence !== 'aucune' ? 'Toutes les occurrences seront supprimées.' : 'Le rendez-vous sera retiré de l’agenda.'} confirmLabel="Supprimer" danger loading={del.isPending} />;
}
