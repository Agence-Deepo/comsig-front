// Espace super-administration (comptes d'administration) et espace administration (comptes des collaborateurs et des services)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, UserPlus, Lock, KeyRound, Building, ScrollText, MonitorSmartphone, Plus, ShieldAlert } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { date, relative } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Empty, Field, Input, Kpi, Modal, PageHeader, Select } from '../components/ui';

export default function AdminSpace() {
  const { me } = useAuth();
  const sup = !!me?.is_superadmin;
  const r = useApi<any>(['admin-users', false], '/api/admin/users');
  const rows: any[] = r.data?.rows ?? [];
  const now = Date.now();
  const active = rows.filter((u) => u.is_active);
  const lockedN = rows.filter((u) => u.locked_until && new Date(u.locked_until).getTime() > now).length;
  const mfaMissing = active.filter((u) => u.mfa_required && !u.mfa_enabled);
  const byManagers = rows.filter((u) => u.created_via === 'responsable' && now - new Date(u.created_at).getTime() < 30 * 86400000);
  const admins = rows.filter((u) => u.is_privileged);
  const [create, setCreate] = useState<any>(null);
  const [temp, setTemp] = useState<{ who: string; pw: string } | null>(null);
  const save = useAction((b: any) => api.post('/api/admin/users', b), {
    success: 'Compte d’administration créé', invalidate: [['admin-users']],
    onSuccess: (res: any) => { setTemp({ who: res.user.username, pw: res.temporary_password }); setCreate(null); },
  });
  const toggle = useAction((u: any) => api.patch(`/api/admin/users/${u.id}`, { is_active: !u.is_active }), { success: 'Compte mis à jour', invalidate: [['admin-users']] });
  return (
    <>
      <PageHeader title={sup ? 'Espace super-administration' : 'Espace administration'}
        subtitle={sup ? 'Comptes d’administration, sécurité de la plateforme et contrôle des accès' : 'Comptes des collaborateurs et des services, accès créés par les responsables, sécurité des comptes'} />
      <div className="grid-4">
        <Kpi label="Comptes actifs" value={String(active.length)} foot={`${rows.filter((u) => u.account_kind === 'service').length} compte(s) de service`} />
        <Kpi label="Comptes verrouillés" value={String(lockedN)} foot="Après plusieurs échecs de connexion" />
        <Kpi label="Double authentification manquante" value={String(mfaMissing.length)} foot="Sur des rôles qui l’exigent" />
        <Kpi label="Accès créés par les responsables" value={String(byManagers.length)} foot="30 derniers jours — à contrôler" />
      </div>
      {mfaMissing.length > 0 && <Alert tone="warning">Double authentification non activée : {mfaMissing.map((u) => u.full_name).join(', ')}.</Alert>}
      <div className="grid-2">
        {sup && <Card title="Administrateurs et super-administrateurs" sub="Seul un super-administrateur peut créer, modifier, désactiver ou supprimer ces comptes" flush
          actions={<Button size="sm" variant="primary" icon={<Plus />} onClick={() => setCreate({ full_name: '', email: '', username: '', role_code: 'admin_tech' })}>Nouveau compte</Button>}>
          <DataTable rows={admins} loading={r.isLoading} columns={[
            { key: 'n', label: 'Compte', render: (u: any) => <><div className="cell-title">{u.full_name} {!u.is_active && <Badge>Désactivé</Badge>}</div><div className="cell-sub"><code>{u.username}</code> · {u.role_label}</div></> },
            { key: 's', label: 'Sécurité', render: (u: any) => u.mfa_enabled ? <Badge tone="success">MFA</Badge> : <Badge tone="warning">MFA à activer</Badge> },
            { key: 'l', label: 'Connexion', render: (u: any) => <span className="small">{u.last_login_at ? relative(u.last_login_at) : 'Jamais'}</span>, mobile: 'hide' },
            { key: 'a', label: '', render: (u: any) => u.id === me?.id ? <span className="xsmall muted">Vous</span> : <Button size="sm" variant="ghost" loading={toggle.isPending} onClick={() => toggle.run(u)}>{u.is_active ? 'Désactiver' : 'Activer'}</Button> },
          ]} />
        </Card>}
        <Card title="Accès créés par les responsables" sub="Un responsable peut créer l’accès d’un subordonné ; seuls les administrateurs le modifient ou le désactivent" flush>
          <DataTable rows={rows.filter((u) => u.created_via === 'responsable')} loading={r.isLoading} empty={<Empty icon={<UserPlus />} title="Aucun accès créé par un responsable" />} columns={[
            { key: 'n', label: 'Collaborateur', render: (u: any) => <><div className="cell-title">{u.full_name}</div><div className="cell-sub"><code>{u.username}</code> · {u.role_label} · {u.department_label}</div></> },
            { key: 'b', label: 'Créé par', render: (u: any) => <span className="small">{u.created_by_name}<div className="xsmall muted">{date(u.created_at)}</div></span> },
            { key: 'f', label: '', render: (u: any) => u.must_change_password ? <Badge tone="info">Première connexion à venir</Badge> : <Badge tone="success">Activé</Badge>, mobile: 'hide' },
          ]} />
        </Card>
        <Card title="Raccourcis">
          <div className="quick-links">
            <Link to="/admin/utilisateurs"><Users />Utilisateurs et comptes de service</Link>
            <Link to="/admin/roles"><KeyRound />Rôles et droits</Link>
            <Link to="/admin/departements"><Building />Départements et niveaux d’accès</Link>
            <Link to="/admin/sessions"><MonitorSmartphone />Sessions actives</Link>
            <Link to="/admin/audit"><ScrollText />Journal d’audit</Link>
            <Link to="/securite"><ShieldAlert />Sécurité et agents de surveillance</Link>
          </div>
        </Card>
        <Card title="Règles appliquées par le serveur">
          <ul className="small stack-sm" style={{ margin: 0, paddingLeft: 18 }}>
            <li><ShieldCheck size={14} /> Seuls les super-administrateurs et administrateurs ajoutent, modifient, activent, désactivent ou suppriment un compte.</li>
            <li><Lock size={14} /> Seuls les super-administrateurs gèrent les comptes d’administration ; il reste toujours au moins un super-administrateur actif.</li>
            <li><UserPlus size={14} /> Un responsable crée uniquement l’accès d’un subordonné de son service, avec un rôle d’exécution.</li>
            <li><KeyRound size={14} /> Identifiant unique par personne et par service ; mot de passe temporaire affiché une seule fois, changement obligatoire à la première connexion.</li>
          </ul>
        </Card>
      </div>
      <Modal open={!!create} onClose={() => setCreate(null)} title="Nouveau compte d’administration" description="Un mot de passe temporaire sera généré et affiché une seule fois ; la double authentification sera exigée."
        footer={<><Button onClick={() => setCreate(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ ...create, username: create.username || undefined, department_code: 'administration' })}>Créer</Button></>}>
        {create && <div className="form-grid">
          <Field label="Nom complet" required error={save.fieldErrors.full_name}><Input value={create.full_name} onChange={(e) => setCreate({ ...create, full_name: e.target.value })} /></Field>
          <Field label="E-mail" required error={save.fieldErrors.email}><Input type="email" value={create.email} onChange={(e) => setCreate({ ...create, email: e.target.value })} /></Field>
          <Field label="Identifiant" hint="Laissé vide : déduit de l’e-mail" error={save.fieldErrors.username}><Input value={create.username} onChange={(e) => setCreate({ ...create, username: e.target.value.toLowerCase() })} /></Field>
          <Field label="Rôle" required><Select value={create.role_code} onChange={(e) => setCreate({ ...create, role_code: e.target.value })} options={[{ value: 'admin_tech', label: 'Administrateur' }, { value: 'superadmin', label: 'Super-administrateur' }]} /></Field>
          {save.error && !Object.keys(save.fieldErrors).length && <Alert tone="danger">{save.error.message}</Alert>}
        </div>}
      </Modal>
      <Modal open={!!temp} onClose={() => setTemp(null)} title="Mot de passe temporaire" description="Communiquez-le par un canal sûr ; il ne sera plus affiché." footer={<Button variant="primary" onClick={() => setTemp(null)}>J’ai transmis le mot de passe</Button>}>
        {temp && <div className="stack"><div className="small">Identifiant : <code>{temp.who}</code></div><code style={{ fontSize: 18 }}>{temp.pw}</code></div>}
      </Modal>
    </>
  );
}
