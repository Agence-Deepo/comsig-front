// Rapports de repérage (visite de site) : tous les services ; rédaction, mesures, photos, soumission et validation
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Plus, Trash2, Send, CheckCircle2, RotateCcw, Ruler } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { date, relative } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Dl, Empty, ErrorState, Field, Input, LoadingBlock, Modal, PageHeader, Tabs, Textarea } from '../components/ui';
import { Documents } from '../components/Documents';

const ST: Record<string, [string, 'neutral' | 'info' | 'success' | 'warning']> = { brouillon: ['Brouillon', 'neutral'], soumis: ['À valider', 'info'], valide: ['Validé', 'success'], a_reprendre: ['À reprendre', 'warning'] };
const EMPTY = { title: '', survey_date: new Date().toISOString().slice(0, 10), address: '', commune: '', latitude: '', longitude: '', purpose: '', observations: '', constraints: '', access_conditions: '', risks: '', recommendations: '', attendees: '', measurements: [] as any[] };

export default function Surveys() {
  const [status, setStatus] = useState('');
  const r = useApi<any>(['surveys', status], `/api/surveys${qs({ status: status || undefined })}`);
  const [form, setForm] = useState<any>(null);
  const nav = useNavigate();
  return (
    <>
      <PageHeader title="Rapports de repérage" subtitle="Visites de site de tous les services : lieu, relevés, contraintes, risques, recommandations et photos ; validation par le responsable"
        actions={<Button variant="primary" icon={<Plus />} onClick={() => setForm({ ...EMPTY })}>Nouveau repérage</Button>} />
      <Card flush title={<Tabs value={status} onChange={setStatus} tabs={[{ id: '', label: 'Tous' }, { id: 'brouillon', label: 'Brouillons' }, { id: 'soumis', label: 'À valider' }, { id: 'valide', label: 'Validés' }, { id: 'a_reprendre', label: 'À reprendre' }]} />}>
        {r.error ? <ErrorState error={r.error} /> : (
          <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(s: any) => nav(`/reperages/${s.id}`)} empty={<Empty icon={<MapPin />} title="Aucun rapport de repérage" />}
            columns={[
              { key: 't', label: 'Repérage', render: (s: any) => <><div className="cell-title">{s.title}</div><div className="cell-sub">{s.ref} · {s.address || 'adresse à préciser'}{s.commune ? ` (${s.commune})` : ''}</div></> },
              { key: 'd', label: 'Date', render: (s: any) => <span className="small">{date(s.survey_date)}</span> },
              { key: 'svc', label: 'Service', render: (s: any) => <span className="small"><span className="dept-dot-inline" style={{ background: s.department_color }} />{s.department_label}<div className="xsmall muted">{s.author_name}</div></span>, mobile: 'hide' },
              { key: 'c', label: 'Client', render: (s: any) => <span className="small">{s.organization_name ?? '—'}</span>, mobile: 'hide' },
              { key: 'st', label: 'Statut', render: (s: any) => <Badge tone={ST[s.status][1]}>{ST[s.status][0]}</Badge> },
            ]} />
        )}
      </Card>
      <SurveyForm value={form} onClose={() => setForm(null)} onSaved={(id) => nav(`/reperages/${id}`)} />
    </>
  );
}

function SurveyForm({ value, onClose, onSaved }: { value: any; onClose: () => void; onSaved: (id: string) => void }) {
  const [f, setF] = useState<any>(null);
  useEffect(() => { setF(value ? { ...value, measurements: [...(value.measurements ?? [])] } : null); }, [value]);
  const save = useAction((b: any) => (value?.id ? api.patch(`/api/surveys/${value.id}`, b) : api.post('/api/surveys', b)), { success: 'Rapport enregistré', invalidate: [['surveys'], ['survey']], onSuccess: (r: any) => { onClose(); onSaved(r.id); } });
  if (!f) return null;
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const num = (v: any) => (v === '' || v == null ? null : Number(String(v).replace(',', '.')));
  const pick = ['title', 'survey_date', 'address', 'commune', 'latitude', 'longitude', 'purpose', 'observations', 'constraints', 'access_conditions', 'risks', 'recommendations', 'attendees', 'measurements'];
  return (
    <Modal open onClose={onClose} size="xl" title={value?.id ? `Repérage ${value.ref}` : 'Nouveau rapport de repérage'}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.title?.trim()} onClick={() => { const b: any = {}; for (const k of pick) b[k] = f[k]; save.run({ ...b, commune: f.commune || null, latitude: num(f.latitude), longitude: num(f.longitude), measurements: f.measurements.filter((m: any) => m.label.trim()) }); }}>Enregistrer</Button></>}>
      <div className="form-grid">
        <Field label="Intitulé" required className="span-2" error={save.fieldErrors.title}><Input value={f.title} onChange={set('title')} placeholder="Ex. Repérage façade agence Cocody" /></Field>
        <Field label="Date du repérage" required><Input type="date" value={String(f.survey_date).slice(0, 10)} onChange={set('survey_date')} /></Field>
        <Field label="Commune"><Input value={f.commune ?? ''} onChange={set('commune')} /></Field>
        <Field label="Adresse / localisation" className="span-2"><Input value={f.address} onChange={set('address')} /></Field>
        <Field label="Latitude" hint="Ex. 5.3364"><Input inputMode="decimal" value={f.latitude ?? ''} onChange={set('latitude')} /></Field>
        <Field label="Longitude" hint="Ex. -4.0267"><Input inputMode="decimal" value={f.longitude ?? ''} onChange={set('longitude')} /></Field>
        <Field label="Objet du repérage" className="span-2"><Textarea rows={2} value={f.purpose} onChange={set('purpose')} /></Field>
        <Field label="Observations" className="span-2" error={save.fieldErrors.observations}><Textarea rows={4} value={f.observations} onChange={set('observations')} /></Field>
        <div className="span-2 stack-sm">
          <div className="row" style={{ justifyContent: 'space-between' }}><strong className="small"><Ruler size={14} /> Relevés et mesures</strong>
            <Button size="sm" icon={<Plus />} onClick={() => setF({ ...f, measurements: [...f.measurements, { label: '', value: '', unit: 'm' }] })}>Ajouter une mesure</Button></div>
          {f.measurements.map((m: any, i: number) => (
            <div key={i} className="measure-row">
              <Input aria-label="Élément mesuré" placeholder="Élément mesuré" value={m.label} onChange={(e) => { const x = [...f.measurements]; x[i] = { ...m, label: e.target.value }; setF({ ...f, measurements: x }); }} />
              <Input aria-label="Valeur" placeholder="Valeur" value={m.value} onChange={(e) => { const x = [...f.measurements]; x[i] = { ...m, value: e.target.value }; setF({ ...f, measurements: x }); }} />
              <Input aria-label="Unité" placeholder="Unité" value={m.unit} onChange={(e) => { const x = [...f.measurements]; x[i] = { ...m, unit: e.target.value }; setF({ ...f, measurements: x }); }} />
              <Button size="sm" variant="ghost" iconOnly icon={<Trash2 />} aria-label="Retirer la mesure" onClick={() => setF({ ...f, measurements: f.measurements.filter((_: any, j: number) => j !== i) })} />
            </div>
          ))}
        </div>
        <Field label="Contraintes techniques"><Textarea rows={3} value={f.constraints} onChange={set('constraints')} /></Field>
        <Field label="Conditions d’accès"><Textarea rows={3} value={f.access_conditions} onChange={set('access_conditions')} /></Field>
        <Field label="Risques identifiés"><Textarea rows={3} value={f.risks} onChange={set('risks')} /></Field>
        <Field label="Recommandations"><Textarea rows={3} value={f.recommendations} onChange={set('recommendations')} /></Field>
        <Field label="Participants" className="span-2"><Input value={f.attendees} onChange={set('attendees')} /></Field>
        {save.error && !Object.keys(save.fieldErrors).length && <div className="span-2"><Alert tone="danger">{save.error.message}</Alert></div>}
      </div>
    </Modal>
  );
}

export function SurveyDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const r = useApi<any>(['survey', id], `/api/surveys/${id}`);
  const [edit, setEdit] = useState<any>(null);
  const [review, setReview] = useState<null | 'valider' | 'a_reprendre'>(null);
  const [note, setNote] = useState('');
  const st = useAction((b: any) => api.post(`/api/surveys/${id}/status`, b), { success: 'Rapport mis à jour', invalidate: [['survey', id], ['surveys']], onSuccess: () => { setReview(null); setNote(''); } });
  const del = useAction(() => api.del(`/api/surveys/${id}`), { success: 'Rapport supprimé', invalidate: [['surveys']], onSuccess: () => nav('/reperages') });
  if (r.error) return <Card><ErrorState error={r.error} /></Card>;
  if (!r.data) return <Card><LoadingBlock rows={8} /></Card>;
  const s = r.data;
  const block = (title: string, text: string) => text?.trim() ? <Card title={title}><p className="msg-body">{text}</p></Card> : null;
  return (
    <>
      <PageHeader title={s.title} crumbs={[{ label: 'Rapports de repérage', to: '/reperages' }, { label: s.ref }]} subtitle={`${s.department_label} · ${s.author_name} · ${date(s.survey_date)}`}
        actions={<div className="row-wrap"><Badge tone={ST[s.status][1]}>{ST[s.status][0]}</Badge>
          {s.can_edit && <Button onClick={() => setEdit(s)}>Modifier</Button>}
          {s.can_edit && <Button variant="primary" icon={<Send />} loading={st.isPending} onClick={() => st.run({ action: 'soumettre' })}>Soumettre</Button>}
          {s.can_validate && <Button variant="primary" icon={<CheckCircle2 />} onClick={() => setReview('valider')}>Valider</Button>}
          {s.can_validate && <Button icon={<RotateCcw />} onClick={() => setReview('a_reprendre')}>À reprendre</Button>}
          {s.can_edit && s.status === 'brouillon' && <Button variant="ghost" icon={<Trash2 />} onClick={() => del.run(undefined)}>Supprimer</Button>}</div>} />
      {s.review_note && <Alert tone={s.status === 'a_reprendre' ? 'warning' : 'info'}>Avis du responsable : {s.review_note}</Alert>}
      <div className="grid-2">
        <Card title="Lieu et contexte"><Dl items={[['Adresse', s.address || '—'], ['Commune', s.commune || '—'], ['GPS', s.latitude != null ? <a href={`https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=18/${s.latitude}/${s.longitude}`} target="_blank" rel="noreferrer noopener">{s.latitude}, {s.longitude}</a> : '—'],
          ['Client', s.organization_name ?? '—'], ['Liens', [s.opportunity_ref, s.flow_ref, s.project_ref].filter(Boolean).join(' · ') || '—'], ['Participants', s.attendees || '—'], ['Validé', s.validated_at ? `${s.validated_by_name}, ${relative(s.validated_at)}` : '—']]} /></Card>
        <Card title="Relevés et mesures">{s.measurements.length ? <table className="table table-compact"><thead><tr><th>Élément</th><th className="num">Valeur</th><th>Unité</th></tr></thead><tbody>{s.measurements.map((m: any, i: number) => <tr key={i}><td>{m.label}</td><td className="num">{m.value}</td><td>{m.unit}</td></tr>)}</tbody></table> : <Empty icon={<Ruler />} title="Aucune mesure" />}</Card>
        {block('Objet du repérage', s.purpose)}{block('Observations', s.observations)}{block('Contraintes techniques', s.constraints)}{block('Conditions d’accès', s.access_conditions)}{block('Risques identifiés', s.risks)}{block('Recommandations', s.recommendations)}
      </div>
      <Card title="Photos et pièces jointes" sub={s.can_edit ? 'Ajoutez les photos du site (JPEG, PNG, WebP, PDF)' : undefined}><Documents entityType="site_survey" entityId={s.id} canEdit={s.can_edit} kinds={['photo', 'plan', 'autre']} /></Card>
      <SurveyForm value={edit} onClose={() => setEdit(null)} onSaved={() => r.refetch()} />
      <Modal open={!!review} onClose={() => setReview(null)} title={review === 'valider' ? 'Valider le rapport' : 'Demander une reprise'}
        footer={<><Button onClick={() => setReview(null)}>Annuler</Button><Button variant="primary" loading={st.isPending} onClick={() => st.run({ action: review, note })}>Confirmer</Button></>}>
        <Field label={review === 'valider' ? 'Commentaire (facultatif)' : 'Ce qui doit être repris (obligatoire)'} error={st.fieldErrors.note}><Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </Modal>
    </>
  );
}
