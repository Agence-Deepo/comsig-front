// Accès de mon équipe : un responsable crée l'accès d'un subordonné ou d'un nouveau collaborateur de son service
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { date, relative } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Empty, ErrorState, Field, Input, Modal, PageHeader, Select } from '../components/ui';

export default function TeamAccess() {
  const r = useApi<any>(['team-accesses'], '/api/team/accesses');
  const [form, setForm] = useState<any>(null);
  const [temp, setTemp] = useState<{ who: string; pw: string } | null>(null);
  const save = useAction((b: any) => api.post('/api/team/accesses', b), {
    success: 'Accès créé', invalidate: [['team-accesses'], ['users-options']],
    onSuccess: (res: any) => { setTemp({ who: res.user.username, pw: res.temporary_password }); setForm(null); },
  });
  const d = r.data;
  return (
    <>
      <PageHeader title="Accès de mon équipe" subtitle="Créez l’accès d’un subordonné ou d’un nouveau collaborateur ; les modifications, désactivations et suppressions relèvent des administrateurs"
        actions={d && <Button variant="primary" icon={<UserPlus />} onClick={() => setForm({ full_name: '', email: '', username: '', job_title: '', role_code: d.roles[0]?.code ?? '', department_code: d.departments[0]?.code ?? '' })}>Créer un accès</Button>} />
      {r.error ? <Card><ErrorState error={r.error} /></Card> : (
        <Card title="Collaborateurs de mon service" flush>
          <DataTable rows={d?.rows} loading={r.isLoading} empty={<Empty icon={<UserPlus />} title="Aucun collaborateur" />} columns={[
            { key: 'n', label: 'Collaborateur', render: (u: any) => <><div className="cell-title">{u.full_name} {!u.is_active && <Badge>Désactivé</Badge>}</div><div className="cell-sub"><code>{u.username}</code>{u.job_title ? ` · ${u.job_title}` : ''}</div></> },
            { key: 'r', label: 'Rôle', render: (u: any) => <span className="small">{u.role_label}<div className="xsmall muted">{u.department_label}</div></span> },
            { key: 'c', label: 'Accès', render: (u: any) => <span className="small">{u.created_via === 'responsable' ? `Créé par un responsable le ${date(u.created_at)}` : 'Créé par l’administration'}</span>, mobile: 'hide' },
            { key: 'l', label: 'Connexion', render: (u: any) => u.must_change_password ? <Badge tone="info">Première connexion à venir</Badge> : <span className="small">{u.last_login_at ? relative(u.last_login_at) : 'Jamais'}</span> },
          ]} />
        </Card>
      )}
      <Modal open={!!form} onClose={() => setForm(null)} title="Créer un accès" description="Un identifiant unique et un mot de passe temporaire sont générés ; le collaborateur le change à sa première connexion. Les administrateurs sont informés."
        footer={<><Button onClick={() => setForm(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ ...form, username: form.username || undefined })}>Créer l’accès</Button></>}>
        {form && d && <div className="form-grid">
          <Field label="Nom complet" required error={save.fieldErrors.full_name}><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
          <Field label="E-mail professionnel" required error={save.fieldErrors.email}><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Identifiant" hint="Laissé vide : déduit de l’e-mail" error={save.fieldErrors.username}><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} /></Field>
          <Field label="Fonction"><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></Field>
          <Field label="Rôle" required hint="Rôles d’exécution uniquement"><Select value={form.role_code} onChange={(e) => setForm({ ...form, role_code: e.target.value })} options={d.roles.map((x: any) => ({ value: x.code, label: x.label }))} /></Field>
          {d.departments.length > 1 && <Field label="Service" required><Select value={form.department_code} onChange={(e) => setForm({ ...form, department_code: e.target.value })} options={d.departments.map((x: any) => ({ value: x.code, label: x.label }))} /></Field>}
          {save.error && !Object.keys(save.fieldErrors).length && <Alert tone="danger">{save.error.message}</Alert>}
        </div>}
      </Modal>
      <Modal open={!!temp} onClose={() => setTemp(null)} title="Accès créé" description="Transmettez ces informations au collaborateur par un canal sûr ; le mot de passe ne sera plus affiché." footer={<Button variant="primary" onClick={() => setTemp(null)}>J’ai transmis les informations</Button>}>
        {temp && <div className="stack"><div>Identifiant : <code>{temp.who}</code></div><div>Mot de passe temporaire : <code style={{ fontSize: 18 }}>{temp.pw}</code></div></div>}
      </Modal>
    </>
  );
}
