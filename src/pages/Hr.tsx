import { ExcelButton } from '../components/ExportButton';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BadgeCheck, Briefcase, CalendarOff, Clock, FileSearch, GraduationCap, LogIn, LogOut, Plus, Sparkles, UserRound, Users } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useCan } from '../lib/auth';
import { addDays, date, dateTime, money, today } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Dl, Empty, ErrorState, Field, Input, Kpi, LoadingBlock, Modal, PageHeader, Segmented, Select, Tabs, Textarea } from '../components/ui';
import { DeptChip, useDepartments } from '../components/work';
import { Documents } from '../components/Documents';

export const LEAVE_KIND: Record<string, string> = { conge_annuel: 'Congé annuel', maladie: 'Maladie', maternite: 'Maternité', paternite: 'Paternité', evenement_familial: 'Événement familial', sans_solde: 'Sans solde', recuperation: 'Récupération', autre: 'Autre' };
const LEAVE_ST: Record<string, [string, 'warning' | 'info' | 'success' | 'danger' | 'neutral']> = { soumise: ['En attente d’avis', 'warning'], avis_responsable: ['Avis donné — décision RH', 'info'], approuvee: ['Approuvé', 'success'], refusee: ['Refusé', 'danger'], annulee: ['Annulé', 'neutral'] };
const ATT_ST: Record<string, [string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent']> = { present: ['Présent', 'success'], retard: ['Retard', 'warning'], absent: ['Absent', 'danger'], conge: ['Congé', 'info'], mission: ['Mission', 'accent'], teletravail: ['Télétravail', 'accent'], ferie: ['Férié', 'neutral'] };
const CONTRACT: Record<string, string> = { cdi: 'CDI', cdd: 'CDD', stage: 'Stage', consultant: 'Consultant', journalier: 'Journalier' };
const EDU = ['Aucun diplôme', 'CAP / BEP', 'Baccalauréat', 'Bac+2/3 (BTS, licence)', 'Bac+4', 'Bac+5 (master, ingénieur)'];
const hm = (s?: string | null) => (s ? new Date(s).toISOString().slice(11, 16) : '—');
const dur = (m: number) => (m ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : '—');

/** Module RH : tableau de bord, personnel, pointage, congés, postes. */
export default function Hr() {
  const can = useCan();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('vue') ?? (can('hr') ? 'tableau' : 'pointage');
  const setTab = (t: string) => setSp({ vue: t });
  return (
    <>
      <PageHeader title="Ressources humaines" subtitle="Personnel, pointage, congés, compétences et recommandations — les décisions restent humaines" />
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'tableau', label: <><BadgeCheck aria-hidden /> Tableau de bord</>, hidden: !can('hr') },
        { id: 'personnel', label: <><Users aria-hidden /> Personnel</> },
        { id: 'pointage', label: <><Clock aria-hidden /> Pointage</> },
        { id: 'conges', label: <><CalendarOff aria-hidden /> Congés</> },
        { id: 'postes', label: <><Briefcase aria-hidden /> Postes</>, hidden: !can('hr') },
      ]} />
      {tab === 'tableau' && <Dashboard />}
      {tab === 'personnel' && <Staff />}
      {tab === 'pointage' && <AttendanceBoard initialDay={sp.get('jour') ?? today()} />}
      {tab === 'conges' && <Leaves />}
      {tab === 'postes' && <Positions />}
    </>
  );
}

function Dashboard() {
  const r = useApi<any>(['hr-dash'], '/api/hr/dashboard');
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (!r.data) return <Card><LoadingBlock rows={6} /></Card>;
  const k = r.data.kpis;
  const max = Math.max(1, ...r.data.by_department.map((d: any) => d.n));
  return (
    <>
      <div className="grid-4">
        <Kpi label="Effectif actif" value={k.headcount} />
        <Kpi label="Présents aujourd’hui" value={k.present_today} foot={`${k.late_today} retard(s) · ${k.on_leave_today} en congé`} progress={k.headcount ? (k.present_today / k.headcount) * 100 : null} />
        <Kpi label="Congés à traiter" value={k.leaves_pending} />
        <Kpi label="Postes ouverts" value={k.open_positions} foot="Recommandations internes disponibles" />
      </div>
      <div className="grid-2">
        <Card title="Effectif par service">
          <div className="stack">{r.data.by_department.map((d: any) => (
            <div key={d.label} className="hbar"><span className="hbar-label">{d.label}</span><span className="hbar-track"><span className="hbar-fill" style={{ width: `${(d.n / max) * 100}%`, background: d.color }} /></span><span className="hbar-value">{d.n}</span></div>))}</div>
        </Card>
        <div className="stack-lg">
          <Card title="Congés en attente" flush>
            <DataTable compact rows={r.data.leaves_pending} empty={<Empty title="Aucune demande en attente" />} columns={[
              { key: 'n', label: 'Agent', render: (l: any) => <><div className="cell-title">{l.name}</div><div className="cell-sub">{LEAVE_KIND[l.kind]} · {l.days} j</div></> },
              { key: 'd', label: 'Période', render: (l: any) => <span className="small">{date(l.start_date)} → {date(l.end_date)}</span> },
              { key: 's', label: 'Étape', render: (l: any) => <Badge tone={LEAVE_ST[l.status][1]}>{LEAVE_ST[l.status][0]}</Badge> },
            ]} />
          </Card>
          <Card title="Contrats arrivant à échéance (60 j)" flush>
            <DataTable compact rows={r.data.contracts_ending} empty={<Empty title="Aucune échéance" />} columns={[{ key: 'n', label: 'Agent', render: (c: any) => c.name }, { key: 't', label: 'Contrat', render: (c: any) => CONTRACT[c.contract_type] }, { key: 'e', label: 'Fin', render: (c: any) => date(c.contract_end) }]} />
          </Card>
          {r.data.birthdays.length > 0 && <Card title="Anniversaires (14 j)"><div className="chips">{r.data.birthdays.map((b: any) => <span key={b.name} className="chip">{b.name} · {date(b.birth_date).slice(0, -5)}</span>)}</div></Card>}
        </div>
      </div>
    </>
  );
}

function Staff() {
  const can = useCan();
  const nav = useNavigate();
  const deps = useDepartments();
  const [dep, setDep] = useState('');
  const [qy, setQy] = useState('');
  const [creating, setCreating] = useState(false);
  const r = useApi<any>(['hr-emps', dep, qy], `/api/hr/employees?status=actif${dep ? `&department=${dep}` : ''}${qy ? `&q=${encodeURIComponent(qy)}` : ''}`);
  return (
    <Card flush>
      <div className="filter-bar">
        <Input placeholder="Nom, matricule, fonction…" value={qy} onChange={(e) => setQy(e.target.value)} aria-label="Rechercher" />
        <Select aria-label="Service" value={dep} onChange={(e) => setDep(e.target.value)} placeholder="Tous les services" options={deps.map((d) => ({ value: d.code, label: d.label }))} />
        <span className="spacer" />
        <ExcelButton url={`/api/xlsx/hr/employees?status=actif${dep ? `&department=${dep}` : ''}${qy ? `&q=${encodeURIComponent(qy)}` : ''}`} />
        {can('hr', 'create') && <Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>Nouveau dossier</Button>}
      </div>
      {r.error ? <ErrorState error={r.error} onRetry={() => r.refetch()} /> : (
        <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(e: any) => nav(`/rh/agents/${e.id}`)} empty={<Empty icon={<Users />} title="Aucun agent" />} columns={[
          { key: 'n', label: 'Agent', render: (e: any) => <><div className="cell-title">{e.first_name} {e.last_name}</div><div className="cell-sub">{e.matricule} · {e.job_title || e.position_title}</div></> },
          { key: 'd', label: 'Service', render: (e: any) => <DeptChip label={e.department_label} color={e.department_color} />, mobile: 'hide' },
          { key: 'c', label: 'Contrat', render: (e: any) => <span className="small">{CONTRACT[e.contract_type]}{e.contract_end ? ` → ${date(e.contract_end)}` : ''}</span>, mobile: 'hide' },
          { key: 'h', label: 'Entrée', render: (e: any) => <span className="small">{date(e.hire_date)}</span>, mobile: 'hide' },
          { key: 's', label: 'Aujourd’hui', render: (e: any) => e.on_leave ? <Badge tone="info">Congé</Badge> : e.today_status ? <Badge tone={ATT_ST[e.today_status][1]}>{ATT_ST[e.today_status][0]}</Badge> : <span className="xsmall muted">Non pointé</span> },
        ]} />
      )}
      <EmployeeForm open={creating} onClose={() => setCreating(false)} />
    </Card>
  );
}

function EmployeeForm({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: any }) {
  const deps = useDepartments();
  const positions = useApi<any>(['hr-positions'], open ? '/api/hr/positions' : null);
  const skills = useApi<any>(['hr-skills'], open ? '/api/hr/skills' : null);
  const [f, setF] = useState<any>(null);
  useEffect(() => {
    setF(open ? (initial ? { ...initial } : { matricule: '', first_name: '', last_name: '', gender: '', email: '', phone: '', department_code: '', position_id: '', job_title: '', hire_date: today(), contract_type: 'cdi', contract_end: '', base_salary: '', status: 'actif', work_start: '08:00', annual_leave_days: 26, education_level: 0, experience_years: 0, skills: [], languages: [], cv_text: '' }) : null);
  }, [open]);
  const save = useAction((b: any) => (initial?.id ? api.put(`/api/hr/employees/${initial.id}`, b) : api.post('/api/hr/employees', b)), { success: 'Dossier enregistré (profil recalculé)', invalidate: [['hr-emps'], ['hr-emp']], onSuccess: onClose });
  if (!open || !f) return null;
  const pick = ['matricule', 'user_id', 'first_name', 'last_name', 'gender', 'birth_date', 'phone', 'email', 'address', 'department_code', 'position_id', 'job_title', 'manager_id', 'hire_date', 'contract_type', 'contract_end', 'base_salary', 'status', 'exit_date', 'work_start', 'annual_leave_days', 'education_level', 'experience_years', 'skills', 'languages', 'cv_text'];
  const submit = () => {
    const b: any = Object.fromEntries(pick.map((k) => [k, f[k] === '' ? null : f[k]]));
    b.work_start = String(f.work_start ?? '08:00').slice(0, 5); b.skills = f.skills ?? []; b.languages = f.languages ?? []; b.cv_text = f.cv_text ?? ''; b.phone = f.phone ?? ''; b.email = f.email ?? ''; b.address = f.address ?? ''; b.job_title = f.job_title ?? '';
    save.run(b);
  };
  const toggle = (code: string) => setF({ ...f, skills: f.skills.includes(code) ? f.skills.filter((x: string) => x !== code) : [...f.skills, code] });
  return (
    <Modal open onClose={onClose} size="xl" title={initial?.id ? `Dossier ${initial.matricule}` : 'Nouveau dossier du personnel'}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.matricule || !f.first_name || !f.last_name} onClick={submit}>Enregistrer</Button></>}>
      <div className="form-grid">
        <Field label="Matricule" required error={save.fieldErrors.matricule}><Input value={f.matricule} onChange={(e) => setF({ ...f, matricule: e.target.value })} /></Field>
        <Field label="Service"><Select value={f.department_code ?? ''} onChange={(e) => setF({ ...f, department_code: e.target.value })} placeholder="—" options={deps.map((d) => ({ value: d.code, label: d.label }))} /></Field>
        <Field label="Prénom" required><Input value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} /></Field>
        <Field label="Nom" required><Input value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} /></Field>
        <Field label="Poste"><Select value={f.position_id ?? ''} onChange={(e) => setF({ ...f, position_id: e.target.value })} placeholder="—" options={(positions.data?.rows ?? []).map((p: any) => ({ value: p.id, label: p.title }))} /></Field>
        <Field label="Fonction affichée"><Input value={f.job_title ?? ''} onChange={(e) => setF({ ...f, job_title: e.target.value })} /></Field>
        <Field label="Date d’entrée" required><Input type="date" value={f.hire_date} onChange={(e) => setF({ ...f, hire_date: e.target.value })} /></Field>
        <Field label="Contrat"><Select value={f.contract_type} onChange={(e) => setF({ ...f, contract_type: e.target.value })} options={Object.entries(CONTRACT).map(([value, label]) => ({ value, label }))} /></Field>
        {f.contract_type !== 'cdi' && <Field label="Fin de contrat" error={save.fieldErrors.contract_end}><Input type="date" value={f.contract_end ?? ''} onChange={(e) => setF({ ...f, contract_end: e.target.value })} /></Field>}
        <Field label="Salaire de base (FCFA)" hint="Confidentiel : RH et direction"><Input type="number" min={0} value={f.base_salary ?? ''} onChange={(e) => setF({ ...f, base_salary: e.target.value })} /></Field>
        <Field label="Heure d’arrivée de référence"><Input type="time" value={String(f.work_start ?? '08:00').slice(0, 5)} onChange={(e) => setF({ ...f, work_start: e.target.value })} /></Field>
        <Field label="Jours de congé annuels"><Input type="number" min={0} max={60} value={f.annual_leave_days} onChange={(e) => setF({ ...f, annual_leave_days: Number(e.target.value) })} /></Field>
        <Field label="Niveau d’études"><Select value={String(f.education_level)} onChange={(e) => setF({ ...f, education_level: Number(e.target.value) })} options={EDU.map((l, i) => ({ value: String(i), label: l }))} /></Field>
        <Field label="Années d’expérience"><Input type="number" min={0} value={f.experience_years} onChange={(e) => setF({ ...f, experience_years: Number(e.target.value) })} /></Field>
        <Field label="E-mail"><Input value={f.email ?? ''} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Téléphone"><Input value={f.phone ?? ''} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Compétences confirmées" className="span-2" hint="Complètent celles détectées automatiquement dans le CV">
          <div className="chips skill-pick">{(skills.data?.rows ?? []).map((s: any) => <button type="button" key={s.code} className={`chip${f.skills.includes(s.code) ? ' on' : ''}`} aria-pressed={f.skills.includes(s.code)} onClick={() => toggle(s.code)}>{s.label}</button>)}</div>
        </Field>
        <Field label="Texte du CV" className="span-2" hint="Collez le CV, ou déposez-le en PDF / Word dans les documents du dossier puis « Lire le CV »"><Textarea rows={5} value={f.cv_text ?? ''} onChange={(e) => setF({ ...f, cv_text: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

export function EmployeeDetail() {
  const { id } = useParams();
  const can = useCan();
  const r = useApi<any>(['hr-emp', id], `/api/hr/employees/${id}`);
  const [tab, setTab] = useState('profil');
  const [editing, setEditing] = useState(false);
  const [ev, setEv] = useState<any>(null);
  const [tr, setTr] = useState<any>(null);
  const inv = [['hr-emp', id], ['hr-emps']];
  const reprofile = useAction(() => api.post(`/api/hr/employees/${id}/profile`), { success: 'Profil recalculé', invalidate: inv });
  const readCv = useAction((docId: string) => api.post(`/api/hr/employees/${id}/cv`, { document_id: docId }), { success: (x: any) => `CV lu (${x.characters} caractères) — profil recalculé`, invalidate: inv });
  const addEv = useAction((b: any) => api.post(`/api/hr/employees/${id}/evaluations`, b), { success: 'Évaluation enregistrée', invalidate: inv, onSuccess: () => setEv(null) });
  const addTr = useAction((b: any) => api.post(`/api/hr/employees/${id}/trainings`, b), { success: 'Formation enregistrée', invalidate: inv, onSuccess: () => setTr(null) });
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (r.isLoading || !r.data) return <Card><LoadingBlock rows={8} /></Card>;
  const e = r.data;
  const p = e.profile;
  return (
    <>
      <PageHeader eyebrow={<DeptChip label={e.department_label} color={e.department_color} />} title={`${e.first_name} ${e.last_name}`} subtitle={`${e.matricule} · ${e.job_title || e.position_title || '—'}`}
        crumbs={[{ label: 'Ressources humaines', to: '/rh?vue=personnel' }, { label: e.matricule }]}
        actions={<><ExcelButton url={`/api/xlsx/hr/employee/${e.id}`} label="Dossier Excel" />{e.can_manage && <><Button onClick={() => reprofile.run(undefined)} loading={reprofile.isPending} icon={<Sparkles />}>Recalculer le profil</Button><Button variant="primary" onClick={() => setEditing(true)}>Modifier</Button></>}</>} />
      <div className="grid-4">
        <Kpi label="Ancienneté" value={`${Math.max(0, Math.floor((Date.now() - Date.parse(e.hire_date)) / (365.25 * 86400000)))} an(s)`} foot={`Entrée le ${date(e.hire_date)} · ${CONTRACT[e.contract_type]}`} />
        <Kpi label="Solde de congés" value={`${e.leave_balance?.available ?? '—'} j`} foot={`Acquis ${e.leave_balance?.acquired ?? 0} · pris ${e.leave_balance?.taken ?? 0} · en attente ${e.leave_balance?.pending ?? 0}`} />
        <Kpi label="Assiduité (90 j)" value={p?.presence_rate_90d != null ? `${p.presence_rate_90d} %` : '—'} foot={`${p?.late_count_90d ?? 0} retard(s)`} />
        <Kpi label="Évaluation moyenne" value={p?.evaluation_avg != null ? `${p.evaluation_avg} / 5` : '—'} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'profil', label: <><Sparkles aria-hidden /> Profil et recommandations</> }, { id: 'dossier', label: <><UserRound aria-hidden /> Dossier</> },
        { id: 'pointage', label: <><Clock aria-hidden /> Pointage et congés</> }, { id: 'evaluations', label: <><GraduationCap aria-hidden /> Évaluations et formations</> }, { id: 'documents', label: <><FileSearch aria-hidden /> CV et documents</>, hidden: !e.documents }]} />
      {tab === 'profil' && (!p ? <Card><Empty title="Profil non calculé">Ajoutez le CV ou des compétences puis recalculez.</Empty></Card> : <div className="split">
        <div className="stack-lg">
          <Card title="Compétences identifiées" sub={`${p.skills.length} compétence(s) · ${p.experience_years} an(s) d’expérience · ${EDU[p.education_level]}`}>
            {p.categories.map((c: any) => (
              <div key={c.category} className="skill-group"><div className="xsmall muted strong">{c.category}</div>
                <div className="chips">{p.skills.filter((s: any) => s.category === c.category).map((s: any) => <span key={s.code} className="chip skill" title={`Source : ${s.source}${s.evidence ? ` (« ${s.evidence} »)` : ''}`}>{s.label}</span>)}</div></div>
            ))}
            {!p.skills.length && <Alert tone="warning">Aucune compétence identifiée.</Alert>}
          </Card>
          <div className="grid-2">
            <Card title="Points forts">{p.strengths.length ? <ul className="bullets">{p.strengths.map((s: string) => <li key={s}>{s}</li>)}</ul> : <p className="small muted">—</p>}</Card>
            <Card title="Points de vigilance">{p.watch_points.length ? <ul className="bullets">{p.watch_points.map((s: string) => <li key={s}>{s}</li>)}</ul> : <p className="small muted">Aucun</p>}</Card>
          </div>
        </div>
        <Card title="Postes recommandés" sub="Adéquation compétences, expérience, études et évaluations">
          {p.recommendations.length ? <div className="stack">{p.recommendations.map((rec: any) => (
            <div key={rec.position_id} className="reco">
              <div className="row"><strong className="spacer">{rec.title}</strong>{rec.is_open && <Badge tone="success">Poste ouvert</Badge>}<span className={`reco-score s${rec.score >= 75 ? 'h' : rec.score >= 55 ? 'm' : 'l'}`}>{rec.score} %</span></div>
              <div className="xsmall muted">{rec.department_label} · niveau {rec.level}</div>
              <ul className="bullets xsmall">{rec.reasons.map((x: string) => <li key={x}>{x}</li>)}</ul>
              {rec.missing_skills.length > 0 && <div className="xsmall"><strong>À développer :</strong> {rec.missing_skills.join(', ')}</div>}
            </div>))}</div> : <p className="small muted">Aucun poste suffisamment adapté pour l’instant.</p>}
          <p className="xsmall muted">{p.disclaimer}</p>
        </Card>
      </div>)}
      {tab === 'dossier' && <Card><Dl items={[
        ['Service', e.department_label ?? '—'], ['Poste', e.position_title ?? '—'], ['Responsable', e.manager_name ?? '—'], ['Contrat', `${CONTRACT[e.contract_type]}${e.contract_end ? ` jusqu’au ${date(e.contract_end)}` : ''}`],
        ['Salaire de base', e.base_salary != null ? money(e.base_salary) : 'Confidentiel'], ['Heure de référence', String(e.work_start).slice(0, 5)], ['E-mail', e.email || '—'], ['Téléphone', e.phone || '—'],
        ['Compte CRM', e.account_email ?? 'Non rattaché'], ['Statut', e.status],
      ]} /></Card>}
      {tab === 'pointage' && <div className="grid-2">
        <Card title="Pointages (45 jours)" flush><DataTable compact rows={e.attendance} empty={<Empty title="Aucun pointage" />} columns={[
          { key: 'd', label: 'Date', render: (a: any) => date(a.work_date) }, { key: 'i', label: 'Arrivée', render: (a: any) => hm(a.check_in) }, { key: 'o', label: 'Départ', render: (a: any) => hm(a.check_out) },
          { key: 's', label: 'Statut', render: (a: any) => <Badge tone={ATT_ST[a.status][1]}>{ATT_ST[a.status][0]}{a.late_minutes ? ` +${a.late_minutes} min` : ''}</Badge> }]} /></Card>
        <Card title="Congés" flush><DataTable compact rows={e.leaves} empty={<Empty title="Aucune demande" />} columns={[
          { key: 'k', label: 'Nature', render: (l: any) => <><div className="cell-title">{LEAVE_KIND[l.kind]}</div><div className="cell-sub">{l.ref}</div></> }, { key: 'p', label: 'Période', render: (l: any) => <span className="small">{date(l.start_date)} → {date(l.end_date)} ({l.days} j)</span> },
          { key: 's', label: 'Statut', render: (l: any) => <Badge tone={LEAVE_ST[l.status][1]}>{LEAVE_ST[l.status][0]}</Badge> }]} /></Card>
      </div>}
      {tab === 'evaluations' && <div className="grid-2">
        <Card title="Évaluations" actions={<Button size="sm" icon={<Plus />} onClick={() => setEv({ period: String(new Date().getFullYear()), scores: { qualite: 3, productivite: 3, ponctualite: 3, esprit_equipe: 3, initiative: 3 }, strengths: '', improvements: '', objectives: '' })}>Évaluer</Button>} flush>
          <DataTable compact rows={e.evaluations} empty={<Empty title="Aucune évaluation" />} columns={[{ key: 'p', label: 'Période', render: (x: any) => x.period }, { key: 'o', label: 'Note', render: (x: any) => <strong>{Number(x.overall).toFixed(2)} / 5</strong> }, { key: 'e', label: 'Évaluateur', render: (x: any) => <span className="small">{x.evaluator_name}</span> }]} />
        </Card>
        <Card title="Formations" actions={can('hr', 'update') && <Button size="sm" icon={<Plus />} onClick={() => setTr({ title: '', provider: '', start_date: addDays(today(), 30), status: 'prevue', skills: [] })}>Formation</Button>} flush>
          <DataTable compact rows={e.trainings} empty={<Empty title="Aucune formation" />} columns={[{ key: 't', label: 'Formation', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.provider}</div></> }, { key: 'd', label: 'Date', render: (x: any) => date(x.start_date) }, { key: 's', label: 'Statut', render: (x: any) => <Badge tone={x.status === 'terminee' ? 'success' : 'info'}>{x.status}</Badge> }]} />
        </Card>
      </div>}
      {tab === 'documents' && <div className="split">
        <Card title="CV et documents du dossier" sub="Confidentiels : RH et l’agent">
          <Documents entityType="employee" entityId={e.id} canEdit={e.can_manage} kinds={['cv', 'diplome', 'contrat', 'piece_identite', 'attestation', 'autre']} />
          {e.can_manage && e.documents.filter((d: any) => /pdf|wordprocessing|text/.test(d.mime_type)).map((d: any) => (
            <div key={d.id} className="row small"><span className="spacer">{d.filename}</span><Button size="sm" icon={<FileSearch />} loading={readCv.isPending} onClick={() => readCv.run(d.id)}>Lire le CV</Button></div>))}
        </Card>
        <Card title="Texte du CV utilisé pour le profilage">{e.cv_text ? <p className="small pre-wrap cv-text">{e.cv_text}</p> : <p className="small muted">Aucun texte. Déposez le CV puis « Lire le CV », ou collez-le dans le dossier.</p>}</Card>
      </div>}
      <EmployeeForm open={editing} onClose={() => setEditing(false)} initial={e} />
      <Modal open={!!ev} onClose={() => setEv(null)} size="lg" title="Évaluation" footer={<><Button onClick={() => setEv(null)}>Annuler</Button><Button variant="primary" loading={addEv.isPending} onClick={() => addEv.run(ev)}>Enregistrer</Button></>}>
        {ev && <div className="form-grid">
          <Field label="Période" hint="AAAA ou AAAA-S1 / AAAA-S2" error={addEv.fieldErrors.period}><Input value={ev.period} onChange={(x) => setEv({ ...ev, period: x.target.value })} /></Field>
          {Object.entries({ qualite: 'Qualité du travail', productivite: 'Productivité', ponctualite: 'Ponctualité', esprit_equipe: 'Esprit d’équipe', initiative: 'Initiative' }).map(([k, l]) => (
            <Field key={k} label={`${l} (1 à 5)`}><Select value={String(ev.scores[k])} onChange={(x) => setEv({ ...ev, scores: { ...ev.scores, [k]: Number(x.target.value) } })} options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))} /></Field>))}
          <Field label="Points forts" className="span-2"><Textarea value={ev.strengths} onChange={(x) => setEv({ ...ev, strengths: x.target.value })} /></Field>
          <Field label="Axes de progrès" className="span-2"><Textarea value={ev.improvements} onChange={(x) => setEv({ ...ev, improvements: x.target.value })} /></Field>
          <Field label="Objectifs" className="span-2"><Textarea value={ev.objectives} onChange={(x) => setEv({ ...ev, objectives: x.target.value })} /></Field>
        </div>}
      </Modal>
      <Modal open={!!tr} onClose={() => setTr(null)} title="Formation" footer={<><Button onClick={() => setTr(null)}>Annuler</Button><Button variant="primary" loading={addTr.isPending} disabled={!tr?.title?.trim()} onClick={() => addTr.run(tr)}>Enregistrer</Button></>}>
        {tr && <div className="form-grid">
          <Field label="Intitulé" required className="span-2"><Input value={tr.title} onChange={(x) => setTr({ ...tr, title: x.target.value })} /></Field>
          <Field label="Organisme"><Input value={tr.provider} onChange={(x) => setTr({ ...tr, provider: x.target.value })} /></Field>
          <Field label="Début"><Input type="date" value={tr.start_date ?? ''} onChange={(x) => setTr({ ...tr, start_date: x.target.value })} /></Field>
          <Field label="Statut"><Select value={tr.status} onChange={(x) => setTr({ ...tr, status: x.target.value })} options={[['prevue', 'Prévue'], ['en_cours', 'En cours'], ['terminee', 'Terminée'], ['annulee', 'Annulée']].map(([value, label]) => ({ value, label }))} /></Field>
          {p?.recommendations?.[0]?.missing_skills?.length > 0 && <Alert tone="info">Suggestion d’après le profil : {p.recommendations[0].suggested_trainings.join(' · ')}</Alert>}
        </div>}
      </Modal>
    </>
  );
}

function AttendanceBoard({ initialDay }: { initialDay: string }) {
  const can = useCan();
  const [day, setDay] = useState(initialDay);
  const [edit, setEdit] = useState<any>(null);
  const r = useApi<any>(['hr-att', day], `/api/hr/attendance?day=${day}`);
  const save = useAction((b: any) => api.post('/api/hr/attendance', b), { success: 'Pointage enregistré', invalidate: [['hr-att', day], ['hr-dash']], onSuccess: () => setEdit(null) });
  const rows = r.data?.rows ?? [];
  const count = (s: string) => rows.filter((x: any) => (x.leave_kind ? 'conge' : x.status) === s).length;
  return (
    <>
      <div className="row-wrap filter-row"><Input type="date" aria-label="Jour" value={day} max={today()} onChange={(e) => setDay(e.target.value)} /><ExcelButton size="sm" url={`/api/xlsx/hr/attendance?day=${day}`} />
        <div className="chips small">{['present', 'retard', 'absent', 'conge', 'mission'].map((s) => <span key={s} className="chip"><Badge tone={ATT_ST[s][1]}>{ATT_ST[s][0]}</Badge> {count(s)}</span>)}<span className="chip">Non pointés : {rows.filter((x: any) => !x.status && !x.leave_kind).length}</span></div></div>
      <Card flush>
        <DataTable rows={rows} loading={r.isLoading} onRowClick={can('hr', 'update') ? (x: any) => setEdit({ employee_id: x.id, name: `${x.first_name} ${x.last_name}`, work_date: day, check_in: x.check_in ? hm(x.check_in) : '', check_out: x.check_out ? hm(x.check_out) : '', status: x.status ?? 'present', note: x.note ?? '' }) : undefined}
          empty={<Empty icon={<Clock />} title="Aucun agent" />} columns={[
            { key: 'n', label: 'Agent', render: (x: any) => <><div className="cell-title">{x.first_name} {x.last_name}</div><div className="cell-sub">{x.matricule} · {x.job_title}</div></> },
            { key: 'd', label: 'Service', render: (x: any) => <DeptChip label={x.department_label} color={x.department_color} />, mobile: 'hide' },
            { key: 'i', label: 'Arrivée', render: (x: any) => <span className="num">{hm(x.check_in)}</span> },
            { key: 'o', label: 'Départ', render: (x: any) => <span className="num">{hm(x.check_out)}</span> },
            { key: 'w', label: 'Durée', render: (x: any) => <span className="small">{dur(x.worked_minutes)}</span>, mobile: 'hide' },
            { key: 's', label: 'Statut', render: (x: any) => x.leave_kind ? <Badge tone="info">{LEAVE_KIND[x.leave_kind]}</Badge> : x.status ? <Badge tone={ATT_ST[x.status][1]}>{ATT_ST[x.status][0]}{x.late_minutes ? ` +${x.late_minutes} min` : ''}</Badge> : <span className="xsmall muted">Non pointé</span> },
          ]} />
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Pointage — ${edit?.name ?? ''}`} description="Correction tracée dans le journal d’audit ; le retard est recalculé selon l’heure de référence."
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ employee_id: edit.employee_id, work_date: edit.work_date, check_in: edit.check_in || null, check_out: edit.check_out || null, status: edit.status, note: edit.note })}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Statut"><Select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} options={Object.entries(ATT_ST).map(([value, [label]]) => ({ value, label }))} /></Field>
          <Field label="Arrivée"><Input type="time" value={edit.check_in} onChange={(e) => setEdit({ ...edit, check_in: e.target.value })} /></Field>
          <Field label="Départ" error={save.fieldErrors.check_out}><Input type="time" value={edit.check_out} onChange={(e) => setEdit({ ...edit, check_out: e.target.value })} /></Field>
          <Field label="Motif / note" className="span-2"><Input value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} /></Field>
        </div>}
      </Modal>
    </>
  );
}

function Leaves() {
  const can = useCan();
  const [f, setF] = useState('en_attente');
  const [act, setAct] = useState<any>(null);
  const r = useApi<any>(['hr-leaves', f], `/api/hr/leaves${f ? `?status=${f}` : ''}`);
  const decide = useAction((b: any) => api.post(`/api/hr/leaves/${act.id}/decision`, b), { success: 'Demande mise à jour', invalidate: [['hr-leaves'], ['hr-dash']], onSuccess: () => setAct(null) });
  return (
    <>
      <div className="row-wrap filter-row"><Segmented label="Filtre" value={f} onChange={setF} options={[{ id: 'en_attente', label: 'À traiter' }, { id: 'approuvee', label: 'Approuvés' }, { id: 'refusee', label: 'Refusés' }, { id: '', label: 'Tous' }]} /><span className="spacer" /><ExcelButton size="sm" url={`/api/xlsx/hr/leaves${f ? `?status=${f}` : ''}`} /></div>
      <Card flush>
        <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(l: any) => setAct(l)} empty={<Empty icon={<CalendarOff />} title="Aucune demande" />} columns={[
          { key: 'n', label: 'Agent', render: (l: any) => <><div className="cell-title">{l.employee_name}</div><div className="cell-sub">{l.ref} · {l.department_label}</div></> },
          { key: 'k', label: 'Nature', render: (l: any) => LEAVE_KIND[l.kind] },
          { key: 'p', label: 'Période', render: (l: any) => <span className="small">{date(l.start_date)} → {date(l.end_date)} · {l.days} j</span> },
          { key: 'a', label: 'Avis du responsable', render: (l: any) => l.manager_opinion ? <Badge tone={l.manager_opinion === 'favorable' ? 'success' : 'danger'}>{l.manager_opinion}</Badge> : <span className="xsmall muted">—</span>, mobile: 'hide' },
          { key: 's', label: 'Statut', render: (l: any) => <Badge tone={LEAVE_ST[l.status][1]}>{LEAVE_ST[l.status][0]}</Badge> },
        ]} />
      </Card>
      <Modal open={!!act} onClose={() => setAct(null)} title={act ? `${act.ref} — ${act.employee_name}` : ''} description={act ? `${LEAVE_KIND[act.kind]} du ${date(act.start_date)} au ${date(act.end_date)} (${act.days} j)${act.reason ? ` — ${act.reason}` : ''}` : ''}
        footer={act && <>
          <Button onClick={() => setAct(null)}>Fermer</Button>
          {act.status === 'soumise' && !can('hr', 'update') && <><Button onClick={() => decide.run({ action: 'avis', opinion: 'defavorable', comment: act.comment })}>Avis défavorable</Button><Button variant="primary" onClick={() => decide.run({ action: 'avis', opinion: 'favorable', comment: act.comment })}>Avis favorable</Button></>}
          {['soumise', 'avis_responsable'].includes(act.status) && can('hr', 'update') && <><Button variant="danger" onClick={() => decide.run({ action: 'refuser', comment: act.comment })}>Refuser</Button><Button variant="primary" onClick={() => decide.run({ action: 'approuver', comment: act.comment })}>Approuver</Button></>}
        </>}>
        {act && <div className="stack">
          {act.manager_opinion && <Alert tone={act.manager_opinion === 'favorable' ? 'success' : 'warning'}>Avis {act.manager_opinion} de {act.manager_by_name}{act.manager_comment ? ` : ${act.manager_comment}` : ''}</Alert>}
          {act.decided_by_name && <div className="small">Décision de {act.decided_by_name}{act.decision_comment ? ` : ${act.decision_comment}` : ''}</div>}
          {['soumise', 'avis_responsable'].includes(act.status) && <Field label="Commentaire" hint="Obligatoire en cas de refus" error={decide.fieldErrors.comment}><Textarea value={act.comment ?? ''} onChange={(e) => setAct({ ...act, comment: e.target.value })} /></Field>}
        </div>}
      </Modal>
    </>
  );
}

function Positions() {
  const r = useApi<any>(['hr-positions'], '/api/hr/positions');
  const skills = useApi<any>(['hr-skills'], '/api/hr/skills');
  const label = (c: string) => skills.data?.rows.find((s: any) => s.code === c)?.label ?? c;
  return (
    <Card flush>
      <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty icon={<Briefcase />} title="Aucun poste" />} columns={[
        { key: 't', label: 'Poste', render: (p: any) => <><div className="cell-title">{p.title}</div><div className="cell-sub">{p.department_label} · {p.level}</div></> },
        { key: 'r', label: 'Compétences requises', render: (p: any) => <div className="chips">{p.required_skills.map((s: string) => <span key={s} className="chip skill">{label(s)}</span>)}</div> },
        { key: 'x', label: 'Prérequis', render: (p: any) => <span className="small">{p.min_experience_years} an(s) · {EDU[p.min_education]}</span>, mobile: 'hide' },
        { key: 'h', label: 'Titulaires', num: true, render: (p: any) => p.holders },
        { key: 'o', label: '', render: (p: any) => (p.is_open ? <Badge tone="success">Ouvert</Badge> : null) },
      ]} />
    </Card>
  );
}

/** Espace personnel RH : pointer son arrivée et son départ, demander un congé, suivre son solde. */
export function MyHr() {
  const r = useApi<any>(['me-hr'], '/api/me/hr');
  const [form, setForm] = useState<any>(null);
  const clock = useAction((kind: string) => api.post('/api/me/clock', { kind }), { success: (x: any) => (x.check_out ? 'Départ enregistré' : x.status === 'retard' ? `Arrivée enregistrée (retard de ${x.late_minutes} min)` : 'Arrivée enregistrée'), invalidate: [['me-hr']] });
  const ask = useAction((b: any) => api.post('/api/me/leave', b), { success: 'Demande envoyée à votre responsable et aux RH', invalidate: [['me-hr']], onSuccess: () => setForm(null) });
  const cancel = useAction((lid: string) => api.post(`/api/hr/leaves/${lid}/decision`, { action: 'annuler' }), { success: 'Demande annulée', invalidate: [['me-hr']] });
  if (r.error) return <Card><ErrorState error={r.error} onRetry={() => r.refetch()} /></Card>;
  if (!r.data) return <Card><LoadingBlock rows={6} /></Card>;
  if (!r.data.employee) return <><PageHeader title="Mon espace RH" /><Card><Empty icon={<UserRound />} title="Aucun dossier rattaché">Les ressources humaines doivent rattacher votre dossier à votre compte.</Empty></Card></>;
  const t = r.data.today; const b = r.data.leave_balance;
  return (
    <>
      <PageHeader title="Mon espace RH" subtitle={`${r.data.employee.first_name} ${r.data.employee.last_name} · ${r.data.employee.matricule} · ${r.data.employee.job_title || r.data.employee.position_title || ''}`} />
      <div className="clock-card card">
        <div><div className="eyebrow">Aujourd’hui</div><div className="clock-now">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <div className="small">{t?.check_in ? <>Arrivée {hm(t.check_in)}{t.late_minutes ? <Badge tone="warning">retard {t.late_minutes} min</Badge> : null}{t.check_out ? ` · Départ ${hm(t.check_out)} (${dur(t.worked_minutes)})` : ''}</> : t?.status === 'conge' ? 'En congé' : 'Pas encore pointé'}</div></div>
        <div className="row-wrap">
          <Button variant="primary" size="lg" icon={<LogIn />} disabled={!!t?.check_in || t?.status === 'conge'} loading={clock.isPending} onClick={() => clock.run('arrivee')}>Pointer mon arrivée</Button>
          <Button size="lg" icon={<LogOut />} disabled={!t?.check_in || !!t?.check_out} loading={clock.isPending} onClick={() => clock.run('depart')}>Pointer mon départ</Button>
        </div>
      </div>
      <div className="grid-3">
        <Kpi label="Congés disponibles" value={`${b?.available ?? 0} j`} foot={`Droit annuel ${b?.entitlement} j · acquis ${b?.acquired} · pris ${b?.taken}`} />
        <Kpi label="Demandes en cours" value={r.data.leaves.filter((l: any) => ['soumise', 'avis_responsable'].includes(l.status)).length} foot={`${b?.pending ?? 0} j en attente`} />
        <Kpi label="Retards (31 j)" value={r.data.attendance.filter((a: any) => a.status === 'retard').length} />
      </div>
      <div className="grid-2">
        <Card title="Mes congés" actions={<Button size="sm" variant="primary" icon={<Plus />} onClick={() => setForm({ kind: 'conge_annuel', start_date: addDays(today(), 14), end_date: addDays(today(), 18), reason: '' })}>Demander un congé</Button>} flush>
          <DataTable compact rows={r.data.leaves} empty={<Empty title="Aucune demande" />} columns={[
            { key: 'k', label: 'Nature', render: (l: any) => LEAVE_KIND[l.kind] }, { key: 'p', label: 'Période', render: (l: any) => <span className="small">{date(l.start_date)} → {date(l.end_date)} · {l.days} j</span> },
            { key: 's', label: 'Statut', render: (l: any) => <Badge tone={LEAVE_ST[l.status][1]}>{LEAVE_ST[l.status][0]}</Badge> },
            { key: 'x', label: '', render: (l: any) => (['soumise', 'avis_responsable'].includes(l.status) ? <Button size="sm" variant="ghost" onClick={() => cancel.run(l.id)}>Annuler</Button> : null) }]} />
        </Card>
        <Card title="Mes pointages (31 jours)" flush>
          <DataTable compact rows={r.data.attendance} empty={<Empty title="Aucun pointage" />} columns={[
            { key: 'd', label: 'Date', render: (a: any) => date(a.work_date) }, { key: 'i', label: 'Arrivée', render: (a: any) => hm(a.check_in) }, { key: 'o', label: 'Départ', render: (a: any) => hm(a.check_out) },
            { key: 's', label: 'Statut', render: (a: any) => <Badge tone={ATT_ST[a.status][1]}>{ATT_ST[a.status][0]}</Badge> }]} />
        </Card>
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title="Demande de congé" description="Envoyée pour avis à votre responsable, puis décidée par les RH."
        footer={<><Button onClick={() => setForm(null)}>Annuler</Button><Button variant="primary" loading={ask.isPending} onClick={() => ask.run(form)}>Envoyer</Button></>}>
        {form && <div className="form-grid">
          <Field label="Nature"><Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} options={Object.entries(LEAVE_KIND).map(([value, label]) => ({ value, label }))} /></Field>
          <span />
          <Field label="Du"><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
          <Field label="Au" error={ask.fieldErrors.end_date}><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Field>
          <Field label="Motif" className="span-2"><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
          {ask.error && <Alert tone="warning">{ask.error.message}</Alert>}
        </div>}
      </Modal>
      <p className="xsmall muted">Dernière mise à jour : {dateTime(new Date().toISOString())} · <Link to="/calendrier">Mes congés apparaissent dans mon calendrier</Link></p>
    </>
  );
}
