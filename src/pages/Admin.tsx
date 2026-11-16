import { ExcelButton } from '../components/ExportButton';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Network, Users, UsersRound, ShieldCheck, SlidersHorizontal, GitBranch, Package, List, Zap, Target, Upload, Sparkles, ScrollText, Trash2, MonitorSmartphone, Plus, Play, KeyRound, Unlock, Copy, Download, Building, LayoutGrid } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api, qs, download } from '../lib/api';
import { DEMO } from '../demo/demo';
import { useAuth, useCan, useUsers } from '../lib/auth';
import { date, dateTime, money, num, relative } from '../lib/format';
import { AUDIT_ACTION } from '../lib/labels';
import { Alert, Badge, Button, Card, ConfirmModal, DataTable, Empty, Field, Input, Kpi, LoadingBlock, Modal, MoneyInput, PageHeader, Select, Status, Textarea } from '../components/ui';
import { BarTargetChart } from '../components/charts';
import { PortalTile } from '../components/PortalTile';
import { MODEL_TILES } from '../components/ModelTiles';

type Section = { id: string; label: string; icon: JSX.Element; show: boolean };

/** Administration (§4, §5.13, §9) : chaque section est protégée côté serveur ; le menu masque seulement l'inaccessible. */
export default function Admin() {
  const { section } = useParams();
  const { me } = useAuth();
  const can = useCan();
  const role = me?.role_code ?? '';
  const dir = ['direction_generale', 'direction_commerciale'].includes(role);
  const admin = can('admin');
  const sections: Section[] = [
    { id: 'utilisateurs', label: 'Utilisateurs', icon: <Users />, show: admin && !!me?.is_admin },
    { id: 'equipes', label: 'Équipes', icon: <UsersRound />, show: admin },
    { id: 'roles', label: 'Rôles et droits', icon: <ShieldCheck />, show: admin },
    { id: 'departements', label: 'Départements et accès', icon: <Network />, show: admin },
    { id: 'portail', label: 'Portail des départements', icon: <LayoutGrid />, show: admin },
    { id: 'parametres', label: 'Paramètres et seuils', icon: <SlidersHorizontal />, show: admin || dir },
    { id: 'pipeline', label: 'Étapes du pipeline', icon: <GitBranch />, show: admin || dir },
    { id: 'catalogue', label: 'Catalogue et tarifs', icon: <Package />, show: can('catalog') },
    { id: 'listes', label: 'Listes de valeurs', icon: <List />, show: admin },
    { id: 'automatisations', label: 'Automatisations', icon: <Zap />, show: admin || dir },
    { id: 'objectifs', label: 'Objectifs commerciaux', icon: <Target />, show: dir || admin },
    { id: 'imports', label: 'Imports', icon: <Upload />, show: can('organizations', 'create') || can('supports', 'create') || can('finance', 'create') },
    { id: 'ia', label: 'Supervision IA', icon: <Sparkles />, show: admin || role === 'direction_generale' },
    { id: 'audit', label: 'Journal d’audit', icon: <ScrollText />, show: admin || ['direction_generale', 'auditeur'].includes(role) },
    { id: 'corbeille', label: 'Corbeille', icon: <Trash2 />, show: admin },
    { id: 'sessions', label: 'Sessions actives', icon: <MonitorSmartphone />, show: admin },
  ].filter((s) => s.show);
  if (!sections.length) return <Alert tone="warning">Vous n’avez accès à aucune section d’administration.</Alert>;
  const current = sections.find((s) => s.id === section);
  if (!current) return <Navigate to={`/admin/${sections[0].id}`} replace />;
  return (
    <>
      <PageHeader title="Administration" subtitle="Toutes les modifications sont journalisées (auteur, date, avant/après)" />
      <div className="admin-layout">
        <nav className="admin-nav" aria-label="Sections d’administration">
          {sections.map((s) => <NavLink key={s.id} to={`/admin/${s.id}`}>{s.icon}{s.label}</NavLink>)}
        </nav>
        <div className="stack-lg" style={{ minWidth: 0 }}>
          {current.id === 'utilisateurs' && <UsersAdmin />}
          {current.id === 'equipes' && <TeamsAdmin />}
          {current.id === 'roles' && <RolesAdmin />}
          {current.id === 'departements' && <DepartmentsAdmin />}
          {current.id === 'portail' && <PortalAdmin />}
          {current.id === 'parametres' && <SettingsAdmin />}
          {current.id === 'pipeline' && <StagesAdmin />}
          {current.id === 'catalogue' && <CatalogAdmin />}
          {current.id === 'listes' && <LookupsAdmin />}
          {current.id === 'automatisations' && <AutomationsAdmin />}
          {current.id === 'objectifs' && <TargetsAdmin />}
          {current.id === 'imports' && <ImportsAdmin />}
          {current.id === 'ia' && <AiSupervision />}
          {current.id === 'audit' && <AuditAdmin />}
          {current.id === 'corbeille' && <TrashAdmin />}
          {current.id === 'sessions' && <SessionsAdmin />}
        </div>
      </div>
    </>
  );
}

function TempPassword({ value, onClose }: { value: { email: string; password: string } | null; onClose: () => void }) {
  return (
    <Modal open={!!value} onClose={onClose} title="Mot de passe temporaire" description="Communiquez-le à l’utilisateur par un canal sûr. Il ne sera plus affiché ; l’utilisateur devra le changer à la première connexion."
      footer={<Button variant="primary" onClick={onClose}>J’ai transmis le mot de passe</Button>}>
      {value && <div className="stack"><div className="small">{value.email}</div>
        <div className="row"><code style={{ fontSize: 18, padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 6 }}>{value.password}</code>
          <Button size="sm" icon={<Copy />} onClick={() => navigator.clipboard?.writeText(value.password)}>Copier</Button></div></div>}
    </Modal>
  );
}

// ─── Utilisateurs (réservé aux super-administrateurs et administrateurs ; comptes d'administration : super-administrateurs seulement)
const ADMIN_ROLES = ['superadmin', 'admin_tech'];
function UsersAdmin() {
  const { me } = useAuth();
  const [deleted, setDeleted] = useState(false);
  const r = useApi<any>(['admin-users', deleted], `/api/admin/users${deleted ? '?deleted=true' : ''}`);
  const roles = useApi<any>(['admin-roles'], '/api/admin/roles');
  const teams = useApi<any>(['admin-teams'], '/api/admin/teams');
  const deps = useApi<any>(['admin-departments'], '/api/admin/departments');
  const users = useUsers();
  const [edit, setEdit] = useState<any>(null);
  const [temp, setTemp] = useState<{ email: string; password: string } | null>(null);
  const [reset, setReset] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const [svc, setSvc] = useState<string | null>(null);
  const save = useAction((b: any) => (b.id ? api.patch(`/api/admin/users/${b.id}`, b.body) : api.post('/api/admin/users', b.body)), {
    success: 'Compte enregistré', invalidate: [['admin-users'], ['users-options']],
    onSuccess: (res: any) => { if (res.temporary_password) setTemp({ email: `${res.user.username} · ${res.user.email}`, password: res.temporary_password }); setEdit(null); },
  });
  const createSvc = useAction((department_code: string) => api.post('/api/admin/service-accounts', { department_code }), {
    success: 'Compte de service créé', invalidate: [['admin-users']],
    onSuccess: (res: any) => { setTemp({ email: res.user.username, password: res.temporary_password }); setSvc(null); },
  });
  const remove = useAction((id: string) => api.del(`/api/admin/users/${id}`), { success: 'Compte supprimé', invalidate: [['admin-users'], ['users-options']], onSuccess: () => setDel(null) });
  const doReset = useAction((v: { id: string; email: string; reset_mfa?: boolean; unlock_only?: boolean }) => api.post(`/api/admin/users/${v.id}/reset`, { reset_mfa: !!v.reset_mfa, unlock_only: !!v.unlock_only }), {
    success: 'Compte mis à jour', invalidate: [['admin-users']],
    onSuccess: (res: any) => { if (res.temporary_password) setTemp({ email: reset?.username ?? reset?.email, password: res.temporary_password }); setReset(null); },
  });
  const roleOpts = (roles.data?.roles ?? []).filter((x: any) => me?.is_superadmin || !ADMIN_ROLES.includes(x.code)).map((x: any) => ({ value: x.code, label: x.label }));
  const teamOpts = (teams.data?.rows ?? []).map((x: any) => ({ value: x.id, label: x.name }));
  const depOpts = (deps.data?.departments ?? []).filter((d: any) => d.is_active).map((d: any) => ({ value: d.code, label: d.label }));
  // Un administrateur ne gère pas les comptes d'administration
  const locked = (u: any) => u.is_privileged && !me?.is_superadmin;
  return (
    <>
      <Card title={deleted ? 'Comptes supprimés' : 'Utilisateurs'} sub={deleted ? 'Historique conservé ; ces comptes ne peuvent plus se connecter' : `${r.data?.rows.filter((u: any) => u.is_active).length ?? '…'} comptes actifs · identifiants uniques, mots de passe confidentiels (seule leur empreinte est conservée)`} flush
        actions={<div className="row-wrap">
          <label className="checkbox small"><input type="checkbox" checked={deleted} onChange={(e) => setDeleted(e.target.checked)} />Comptes supprimés</label>
          <Button size="sm" icon={<Building />} onClick={() => setSvc('')}>Compte de service</Button>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={() => setEdit({ email: '', username: '', full_name: '', job_title: '', phone: '', role_code: 'commercial', team_id: '', department_code: '', manager_id: '', is_active: true })}>Nouveau compte</Button>
        </div>}>
        <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={deleted ? undefined : (u: any) => !locked(u) && setEdit({ ...u, team_id: u.team_id ?? '', phone: u.phone ?? '', department_code: u.department_code ?? '', manager_id: u.manager_id ?? '' })}
          columns={[
            { key: 'n', label: 'Utilisateur', render: (u: any) => <><div className="cell-title">{u.full_name}{!u.is_active && !u.deleted_at && <> <Badge>Désactivé</Badge></>}{u.account_kind === 'service' && <> <Badge tone="info">Compte de service</Badge></>}{u.is_privileged && <> <Badge tone="warning">{u.role_code === 'superadmin' ? 'Super-admin' : 'Admin'}</Badge></>}</div>
              <div className="cell-sub"><code>{u.username}</code> · {u.email}{u.job_title ? ` · ${u.job_title}` : ''}</div>
              {u.created_via === 'responsable' && <div className="xsmall muted">Accès créé par {u.created_by_name}</div>}</> },
            { key: 'r', label: 'Rôle', render: (u: any) => <span className="small">{u.role_label}<div className="xsmall muted">{[u.department_label, u.team_name].filter(Boolean).join(' · ') || 'Sans département'}{u.manager_name ? ` · resp. ${u.manager_name}` : ''}</div></span> },
            { key: 'm', label: 'Sécurité', render: (u: any) => <div className="row-wrap">{u.mfa_enabled ? <Badge tone="success">MFA</Badge> : u.mfa_required ? <Badge tone="warning">MFA à activer</Badge> : <Badge>Sans MFA</Badge>}{u.locked_until && new Date(u.locked_until) > new Date() && <Badge tone="danger">Verrouillé</Badge>}{u.must_change_password && <Badge tone="info">Mot de passe temporaire</Badge>}</div>, mobile: 'hide' },
            { key: 'l', label: deleted ? 'Supprimé' : 'Dernière connexion', render: (u: any) => <span className="small">{deleted ? date(u.deleted_at) : u.last_login_at ? relative(u.last_login_at) : 'Jamais'}</span>, mobile: 'hide' },
            { key: 'a', label: '', render: (u: any) => deleted || locked(u) ? (locked(u) ? <span className="xsmall muted">Super-administrateur requis</span> : null) : <div className="row" style={{ gap: 4 }}>
              <Button size="sm" variant="ghost" icon={<KeyRound />} onClick={(e) => { e.stopPropagation(); setReset(u); }}>Accès</Button>
              {u.id !== me?.id && <Button size="sm" variant="ghost" icon={<Trash2 />} aria-label={`Supprimer ${u.full_name}`} onClick={(e) => { e.stopPropagation(); setDel(u); }} />}
            </div> },
          ]} />
      </Card>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? `Compte — ${edit.full_name}` : 'Nouveau compte'} description={!edit?.id ? 'Un mot de passe temporaire sera généré et affiché une seule fois.' : 'Un changement de rôle, d’identifiant ou une désactivation ferme les sessions ouvertes de l’utilisateur.'}
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ id: edit.id, body: { email: edit.email, ...(edit.username ? { username: edit.username } : {}), full_name: edit.full_name, job_title: edit.job_title ?? '', phone: edit.phone || null, role_code: edit.role_code, team_id: edit.team_id || null, department_code: edit.department_code || null, manager_id: edit.manager_id || null, is_active: edit.is_active } })}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Nom complet" required error={save.fieldErrors.full_name}><Input value={edit.full_name} onChange={(e) => setEdit({ ...edit, full_name: e.target.value })} /></Field>
          <Field label="Identifiant de connexion" hint={edit.id ? undefined : 'Laissé vide : déduit de l’e-mail'} error={save.fieldErrors.username}><Input value={edit.username ?? ''} autoCapitalize="none" onChange={(e) => setEdit({ ...edit, username: e.target.value.toLowerCase() })} /></Field>
          <Field label="E-mail" required error={save.fieldErrors.email}><Input type="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
          <Field label="Fonction"><Input value={edit.job_title ?? ''} onChange={(e) => setEdit({ ...edit, job_title: e.target.value })} /></Field>
          <Field label="Téléphone"><Input value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
          <Field label="Rôle" required><Select value={edit.role_code} disabled={edit.id === me?.id} onChange={(e) => setEdit({ ...edit, role_code: e.target.value })} options={roleOpts} /></Field>
          <Field label="Département" hint="Ses niveaux d’accès complètent les droits du rôle"><Select value={edit.department_code} onChange={(e) => setEdit({ ...edit, department_code: e.target.value })} placeholder="Aucun" options={depOpts} /></Field>
          <Field label="Responsable hiérarchique"><Select value={edit.manager_id} onChange={(e) => setEdit({ ...edit, manager_id: e.target.value })} placeholder="Aucun" options={users.filter((u) => u.id !== edit.id).map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
          <Field label="Équipe"><Select value={edit.team_id} onChange={(e) => setEdit({ ...edit, team_id: e.target.value })} placeholder="Aucune" options={teamOpts} /></Field>
          {edit.id && edit.id !== me?.id && <Field label="Statut" className="span-2"><label className="checkbox"><input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} />Compte actif</label></Field>}
          {save.error && !Object.keys(save.fieldErrors).length && <Alert tone="danger">{save.error.message}</Alert>}
        </div>}
      </Modal>
      <Modal open={svc !== null} onClose={() => setSvc(null)} title="Compte de service" description="Identifiant propre au service (poste partagé d’atelier, tablette de chantier) : accès limité aux ordres de travail et aux tâches du service, sans donnée client ni personnelle."
        footer={<><Button onClick={() => setSvc(null)}>Annuler</Button><Button variant="primary" disabled={!svc} loading={createSvc.isPending} onClick={() => createSvc.run(svc!)}>Créer</Button></>}>
        <Field label="Service" required><Select value={svc ?? ''} onChange={(e) => setSvc(e.target.value)} placeholder="Choisir" options={depOpts} /></Field>
        {createSvc.error && <Alert tone="danger">{createSvc.error.message}</Alert>}
      </Modal>
      <ConfirmModal open={!!del} onClose={() => setDel(null)} danger title={`Supprimer le compte de ${del?.full_name ?? ''}`} confirmLabel="Supprimer" loading={remove.isPending}
        message="Le compte est désactivé définitivement, ses sessions sont fermées et il disparaît des listes. L’historique (journal, documents) est conservé." onConfirm={() => remove.run(del.id)} />
      <Modal open={!!reset} onClose={() => setReset(null)} title={`Accès — ${reset?.full_name}`} description="Chaque opération ferme les sessions de l’utilisateur et est journalisée.">
        {reset && <div className="stack">
          <Button icon={<Unlock />} loading={doReset.isPending} onClick={() => doReset.run({ id: reset.id, email: reset.email, unlock_only: true })}>Déverrouiller le compte (tentatives échouées)</Button>
          <Button icon={<KeyRound />} loading={doReset.isPending} onClick={() => doReset.run({ id: reset.id, email: reset.email })}>Générer un mot de passe temporaire</Button>
          <Button variant="danger" loading={doReset.isPending} onClick={() => doReset.run({ id: reset.id, email: reset.email, reset_mfa: true })}>Mot de passe temporaire + réinitialiser la double authentification</Button>
        </div>}
      </Modal>
      <TempPassword value={temp} onClose={() => setTemp(null)} />
    </>
  );
}

// ─── Équipes
function TeamsAdmin() {
  const users = useUsers();
  const r = useApi<any>(['admin-teams'], '/api/admin/teams');
  const [edit, setEdit] = useState<any>(null);
  const save = useAction((b: any) => (b.id ? api.patch(`/api/admin/teams/${b.id}`, b.body) : api.post('/api/admin/teams', b.body)), { success: 'Équipe enregistrée', invalidate: [['admin-teams']], onSuccess: () => setEdit(null) });
  return (
    <Card title="Équipes" sub="Le périmètre « équipe » des rôles s’appuie sur ces rattachements" flush actions={<Button size="sm" variant="primary" icon={<Plus />} onClick={() => setEdit({ name: '', manager_id: '' })}>Nouvelle équipe</Button>}>
      <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={(t: any) => setEdit({ ...t, manager_id: t.manager_id ?? '' })} columns={[
        { key: 'n', label: 'Équipe', render: (t: any) => <span className="cell-title">{t.name}</span> },
        { key: 'm', label: 'Responsable', render: (t: any) => t.manager_name ?? '—' },
        { key: 'c', label: 'Membres actifs', num: true, render: (t: any) => t.members },
      ]} />
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Modifier l’équipe' : 'Nouvelle équipe'}
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ id: edit.id, body: { name: edit.name, manager_id: edit.manager_id || null } })}>Enregistrer</Button></>}>
        {edit && <div className="stack">
          <Field label="Nom" required error={save.fieldErrors.name}><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
          <Field label="Responsable"><Select value={edit.manager_id} onChange={(e) => setEdit({ ...edit, manager_id: e.target.value })} placeholder="Aucun" options={users.map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
        </div>}
      </Modal>
    </Card>
  );
}

// ─── Rôles et droits
const ACTION_LABEL: Record<string, string> = { view: 'Voir', create: 'Créer', update: 'Modifier', delete: 'Supprimer', export: 'Exporter', validate: 'Valider' };
function RolesAdmin() {
  const r = useApi<any>(['admin-roles'], '/api/admin/roles');
  const [code, setCode] = useState<string>('');
  const [draft, setDraft] = useState<any>(null);
  const role = r.data?.roles.find((x: any) => x.code === code) ?? r.data?.roles[0];
  useEffect(() => { if (role) setDraft({ perms: new Set(role.perms), data_scope: role.data_scope, can_see_confidential: role.can_see_confidential, mfa_required: role.mfa_required }); }, [role?.code, r.dataUpdatedAt]);
  const save = useAction((b: any) => api.put(`/api/admin/roles/${role.code}`, b), { success: 'Droits enregistrés (effet immédiat)', invalidate: [['admin-roles']] });
  if (r.isLoading || !role || !draft) return <Card><LoadingBlock /></Card>;
  const toggle = (p: string) => { const s = new Set(draft.perms); s.has(p) ? s.delete(p) : s.add(p); setDraft({ ...draft, perms: s }); };
  const dirty = JSON.stringify([...draft.perms].sort()) !== JSON.stringify([...role.perms].sort()) || draft.data_scope !== role.data_scope || draft.can_see_confidential !== role.can_see_confidential || draft.mfa_required !== role.mfa_required;
  return (
    <Card title="Rôles et matrice de droits" sub="Les droits sont vérifiés par le serveur à chaque requête ; l’interface ne fait que masquer l’inaccessible."
      actions={<Select aria-label="Rôle" value={role.code} onChange={(e) => setCode(e.target.value)} options={r.data.roles.map((x: any) => ({ value: x.code, label: x.label }))} />}
      footer={<div className="row"><span className="xsmall muted">{dirty ? 'Modifications non enregistrées' : 'À jour'}</span><div className="spacer" /><Button variant="primary" disabled={!dirty} loading={save.isPending} onClick={() => save.run({ perms: [...draft.perms], data_scope: draft.data_scope, can_see_confidential: draft.can_see_confidential, mfa_required: draft.mfa_required })}>Enregistrer</Button></div>}>
      <div className="stack">
        <p className="small secondary">{role.description}</p>
        <div className="form-grid">
          <Field label="Périmètre des données"><Select value={draft.data_scope} onChange={(e) => setDraft({ ...draft, data_scope: e.target.value })} options={[{ value: 'own', label: 'Ses propres dossiers' }, { value: 'team', label: 'Son équipe' }, { value: 'all', label: 'Toute l’entreprise' }]} /></Field>
          <Field label="Options">
            <label className="checkbox"><input type="checkbox" checked={draft.can_see_confidential} onChange={(e) => setDraft({ ...draft, can_see_confidential: e.target.checked })} />Accès aux informations confidentielles</label>
            <label className="checkbox"><input type="checkbox" checked={draft.mfa_required} onChange={(e) => setDraft({ ...draft, mfa_required: e.target.checked })} />Double authentification obligatoire</label>
          </Field>
        </div>
        <div className="table-wrap">
          <table className="perm-matrix">
            <thead><tr><th>Module</th>{r.data.actions.map((a: string) => <th key={a}>{ACTION_LABEL[a]}</th>)}</tr></thead>
            <tbody>{Object.entries(r.data.modules).map(([m, label]) => (
              <tr key={m}><td>{label as string}</td>{r.data.actions.map((a: string) => {
                const p = `${m}:${a}`;
                return <td key={a}><input type="checkbox" aria-label={`${label} — ${ACTION_LABEL[a]}`} checked={draft.perms.has(p)} onChange={() => toggle(p)} /></td>;
              })}</tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

// ─── Portail des départements (tuiles au modèle COM&SIG)
/** Tuiles du portail : nom, légende, ordre, affichage et photo (la photo remplace la scène dessinée). */
function PortalAdmin() {
  const r = useApi<{ rows: any[] }>(['admin-portal'], '/api/admin/portal');
  const [sel, setSel] = useState<string | null>(null);
  const [f, setF] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inv = [['admin-portal'], ['portal-tiles']];
  const rows = r.data?.rows ?? [];
  const t = rows.find((x) => x.code === (sel ?? rows[0]?.code));
  useEffect(() => { if (t) setF({ label: t.label, caption: t.caption, description: t.description, sort_order: t.sort_order, is_active: t.is_active }); }, [t?.code, t?.updated_at]);
  const save = useAction((b: any) => api.patch(`/api/admin/portal/${t.code}`, b), { success: 'Tuile enregistrée', invalidate: inv });
  const up = useAction((file: File) => { const fd = new FormData(); fd.append('file', file); return api.upload(`/api/admin/portal/${t.code}/photo`, fd); }, { success: 'Photo enregistrée : elle s’affiche sur le portail', invalidate: inv });
  const del = useAction(() => api.del(`/api/admin/portal/${t.code}/photo`), { success: 'Visuel standard rétabli', invalidate: inv });
  if (r.isLoading) return <Card><LoadingBlock rows={6} /></Card>;
  return (
    <div className="grid-2">
      <Card flush title="Tuiles du portail" sub="Dans l’ordre d’affichage ; les tuiles affichées apparaissent sur le portail, l’entrée étant contrôlée à la connexion">
        <DataTable rows={rows.map((x) => ({ ...x, id: x.code }))} onRowClick={(x) => setSel(x.code)} rowClass={(x) => (x.code === t?.code ? 'selected' : '')} caption="Tuiles du portail" columns={[
          { key: 'sort_order', label: 'Ordre', num: true, render: (x) => x.sort_order },
          { key: 'label', label: 'Tuile', render: (x) => <><strong>{x.label}</strong>{x.caption && <div className="xsmall muted">{x.caption}</div>}</> },
          { key: 'target', label: 'Entrée', mobile: 'label', render: (x) => <>{x.department_code ? x.department_label : `Fonction : ${x.roles_label ?? '—'}`}<div className="xsmall muted">{x.members} collaborateur(s)</div></> },
          { key: 'state', label: 'État', render: (x) => <>{!x.is_active ? <Badge>Masquée</Badge> : x.members ? <Badge tone="success">Affichée</Badge> : <Badge tone="warning">Sans collaborateur</Badge>}<div className="xsmall muted">{x.photo ? 'Photo déposée' : 'Scène standard'}</div></> },
        ]} />
      </Card>
      {t && f && (
        <Card title={`Tuile « ${t.label} »`} sub="Aperçu tel qu’il apparaît sur le portail">
          <div className="stack">
            <div style={{ maxWidth: 360 }}><PortalTile tile={{ ...t, label: f.label || t.label, caption: f.caption }} still /></div>
            <div className="form-grid">
              <Field label="Nom affiché" required error={save.fieldErrors.label}><Input value={f.label} maxLength={60} onChange={(e) => setF({ ...f, label: e.target.value })} /></Field>
              <Field label="Ordre d’affichage"><Input type="number" min={0} value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} /></Field>
              <Field label="Légende" hint="Ex. « Service du département Production »" className="span-2"><Input value={f.caption} maxLength={80} onChange={(e) => setF({ ...f, caption: e.target.value })} /></Field>
              <Field label="Description (écran de connexion)" hint="Vide : description du département" className="span-2"><Textarea rows={2} value={f.description} maxLength={300} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
              <Field label="Affichage" className="span-2"><label className="checkbox"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />Afficher cette tuile sur le portail</label></Field>
            </div>
            <div className="row-wrap">
              <Button variant="primary" loading={save.isPending} disabled={!f.label?.trim()} onClick={() => save.run({ label: f.label, caption: f.caption, description: f.description, sort_order: f.sort_order, is_active: f.is_active })}>Enregistrer</Button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) up.run(file); e.target.value = ''; }} />
              <Button icon={<Upload />} loading={up.isPending} onClick={() => fileRef.current?.click()}>Déposer une photo</Button>
              {t.photo && <Button variant="ghost" loading={del.isPending} onClick={() => del.run(undefined)}>Revenir à la scène standard</Button>}
            </div>
            <p className="xsmall muted" style={{ margin: 0 }}>{MODEL_TILES[t.code] ? `Tuile du modèle COM&SIG : l’image du modèle s’affiche telle quelle tant que la tuile garde le nom « ${MODEL_TILES[t.code].label} » et qu’aucune photo ne la remplace. ` : ''}Photo au format paysage (environ 900 × 500 pixels), PNG, JPEG ou WebP, 2 Mo au plus ; le contenu du fichier est contrôlé. Avec une photo, la tuile est composée : photo, bandeau marine, pictogramme doré et nom.</p>
            {(save.error && !Object.keys(save.fieldErrors).length) && <Alert tone="danger">{save.error.message}</Alert>}
            {up.error && <Alert tone="danger">{up.error.message}</Alert>}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Départements
const LEVEL_OPTS = [{ value: '', label: '—' }, { value: 'lecture', label: 'Lecture' }, { value: 'contribution', label: 'Contribution' }, { value: 'gestion', label: 'Gestion' }];
function DepartmentsAdmin() {
  const users = useUsers();
  const r = useApi<any>(['admin-departments'], '/api/admin/departments');
  const [code, setCode] = useState('');
  const [draft, setDraft] = useState<any>(null);
  const [create, setCreate] = useState<any>(null);
  const dep = r.data?.departments.find((d: any) => d.code === code) ?? r.data?.departments[0];
  useEffect(() => { if (dep) setDraft({ label: dep.label, description: dep.description, manager_id: dep.manager_id ?? '', is_active: dep.is_active, levels: { ...dep.levels } }); }, [dep?.code, r.dataUpdatedAt]);
  const save = useAction((b: any) => api.put(`/api/admin/departments/${b.code}`, b.body), { success: 'Département enregistré (effet immédiat)', invalidate: [['admin-departments']], onSuccess: () => setCreate(null) });
  if (r.isLoading || !dep || !draft) return <Card><LoadingBlock /></Card>;
  const modules = Object.entries(r.data.modules).filter(([m]) => m !== 'admin');
  return (
    <>
      <Alert tone="info">Les droits effectifs d’un utilisateur sont ceux de son <strong>rôle</strong>, complétés par le niveau d’accès de son <strong>département</strong> : <em>Lecture</em> (consulter, exporter), <em>Contribution</em> (+ créer, modifier), <em>Gestion</em> (+ supprimer, valider). L’administration reste réservée aux rôles.</Alert>
      <Card title="Niveaux d’accès départementaux" sub={`${dep.members} membre(s) actif(s)${dep.manager_name ? ` · responsable : ${dep.manager_name}` : ''}`}
        actions={<><Select aria-label="Département" style={{ width: 220 }} value={dep.code} onChange={(e) => setCode(e.target.value)} options={r.data.departments.map((d: any) => ({ value: d.code, label: d.label + (d.is_active ? '' : ' (inactif)') }))} />
          <Button size="sm" icon={<Plus />} onClick={() => setCreate({ code: '', label: '' })}>Nouveau</Button></>}
        footer={<div className="row"><div className="spacer" /><Button variant="primary" loading={save.isPending} onClick={() => save.run({ code: dep.code, body: { label: draft.label, description: draft.description, manager_id: draft.manager_id || null, is_active: draft.is_active, levels: Object.fromEntries(Object.entries(draft.levels).filter(([, v]) => v)) } })}>Enregistrer</Button></div>}>
        <div className="stack">
          <div className="form-grid">
            <Field label="Libellé"><Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} /></Field>
            <Field label="Responsable"><Select value={draft.manager_id} onChange={(e) => setDraft({ ...draft, manager_id: e.target.value })} placeholder="—" options={users.map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
            <Field label="Description" className="span-2"><Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
            <Field label="Statut"><label className="checkbox"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />Département actif (ses accès s’appliquent)</label></Field>
          </div>
          <div className="table-wrap">
            <table className="perm-matrix">
              <thead><tr><th>Module</th><th>Niveau d’accès accordé par le département</th></tr></thead>
              <tbody>{modules.map(([m, l]) => (
                <tr key={m}><td>{l as string}</td><td style={{ textAlign: 'left' }}>
                  <Select aria-label={`Niveau pour ${l}`} value={draft.levels[m] ?? ''} onChange={(e) => setDraft({ ...draft, levels: { ...draft.levels, [m]: e.target.value } })} options={LEVEL_OPTS} style={{ width: 170, height: 30 }} />
                </td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </Card>
      <Modal open={!!create} onClose={() => setCreate(null)} title="Nouveau département"
        footer={<><Button onClick={() => setCreate(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!create?.code || !create?.label} onClick={() => save.run({ code: create.code, body: { label: create.label, levels: {} } })}>Créer</Button></>}>
        {create && <div className="form-grid">
          <Field label="Code" hint="Minuscules, chiffres et _"><Input value={create.code} onChange={(e) => setCreate({ ...create, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} /></Field>
          <Field label="Libellé"><Input value={create.label} onChange={(e) => setCreate({ ...create, label: e.target.value })} /></Field>
        </div>}
      </Modal>
    </>
  );
}

// ─── Paramètres
const KEY_LABEL: Record<string, string> = {
  name: 'Raison sociale', tagline: 'Signature', address: 'Adresse', phone: 'Téléphone', email: 'E-mail', rccm: 'RCCM', ncc: 'NCC', bank: 'Coordonnées bancaires',
  urgente: 'Urgente', haute: 'Haute', normale: 'Normale', basse: 'Basse',
  standard: 'Standard', grand_compte: 'Grand compte', institutionnel: 'Institutionnel / public', revendeur: 'Agence / revendeur', production: 'Production',
  direction_generale: 'Direction générale', direction_commerciale: 'Direction commerciale', commercial: 'Commercial', operations: 'Opérations', marketing: 'Marketing',
  finance: 'Finance', juridique: 'Juridique', admin_tech: 'Administration technique', technicien: 'Technicien', auditeur: 'Auditeur',
};
const MODE_OPTS = [{ value: 'assistant', label: 'Assistant' }, { value: 'copilote', label: 'Copilote' }, { value: 'automatisation', label: 'Automatisation' }];
function SettingValue({ row, onSave, busy }: { row: any; onSave: (v: any) => void; busy: boolean }) {
  const [v, setV] = useState<any>(row.value);
  useEffect(() => setV(row.value), [row.value]);
  const changed = JSON.stringify(v) !== JSON.stringify(row.value);
  const saveBtn = <Button size="sm" variant="primary" disabled={!changed} loading={busy} onClick={() => onSave(v)}>Enregistrer</Button>;
  if (typeof row.value === 'boolean') {
    return <div className="row"><label className="checkbox"><input type="checkbox" checked={v} onChange={(e) => onSave(e.target.checked)} disabled={busy} />{v ? 'Activé' : 'Désactivé'}</label></div>;
  }
  if (typeof row.value === 'number') return <div className="row"><Input type="number" min={0} value={v} onChange={(e) => setV(e.target.value === '' ? '' : Number(e.target.value))} aria-label={row.label} />{saveBtn}</div>;
  if (Array.isArray(row.value)) return <div className="row"><Input value={v.join(', ')} onChange={(e) => setV(e.target.value.split(/[,; ]+/).filter(Boolean).map(Number))} aria-label={row.label} />{saveBtn}</div>;
  return (
    <div className="stack">
      <div className="form-grid">{Object.entries(v ?? {}).map(([k, x]) => (
        <Field key={k} label={KEY_LABEL[k] ?? k}>
          {row.key === 'ai.max_mode_by_role' ? <Select value={x as string} onChange={(e) => setV({ ...v, [k]: e.target.value })} options={MODE_OPTS} />
            : typeof x === 'number' ? <Input type="number" min={0} value={x} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })} />
              : <Input value={x as string} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}
        </Field>
      ))}</div>
      <div>{saveBtn}</div>
    </div>
  );
}
function SettingsAdmin() {
  const r = useApi<any>(['admin-settings'], '/api/admin/settings');
  const save = useAction((x: { key: string; value: any }) => api.put(`/api/admin/settings/${x.key}`, { value: x.value }), { success: 'Paramètre enregistré', invalidate: [['admin-settings'], ['ai-status']] });
  const groups: [string, string][] = [['sales.', 'Ventes, marges et validations'], ['pricing.', 'Chiffrage au coût (taux de marge clients)'], ['contracts.', 'Contrats'], ['royalties.', 'Redevances'], ['interventions.', 'Maintenance'], ['reservations.', 'Réservations'], ['ai.', 'Assistant IA'], ['security.', 'Sécurité'], ['company.', 'Identité de l’entreprise']];
  if (r.isLoading) return <Card><LoadingBlock rows={8} /></Card>;
  return (
    <>
      <Alert tone="info">Les seuils s’appliquent immédiatement aux nouveaux calculs (validation des devis, alertes, escalades). Les valeurs antérieures restent visibles dans le journal d’audit.</Alert>
      <LetterheadCard />
      {groups.map(([prefix, label]) => {
        const rows = r.data.rows.filter((s: any) => s.key.startsWith(prefix));
        if (!rows.length) return null;
        return (
          <Card key={prefix} title={label} flush>
            {rows.map((s: any) => (
              <div key={s.key} className={`setting-row${s.value && typeof s.value === 'object' && !Array.isArray(s.value) ? ' wide' : ''}`}>
                <div><div className="strong small">{s.label}</div>{s.description && <div className="xsmall secondary">{s.description}</div>}
                  {s.updated_by_name && <div className="xsmall muted">Modifié {relative(s.updated_at)} par {s.updated_by_name}</div>}</div>
                <SettingValue row={s} busy={save.isPending && save.variables?.key === s.key} onSave={(value) => save.run({ key: s.key, value })} />
              </div>
            ))}
          </Card>
        );
      })}
    </>
  );
}

// ─── Étapes
const REQ_FIELDS: Record<string, string> = { primary_contact_id: 'Contact principal', need: 'Besoin', next_step: 'Prochaine étape', next_step_date: 'Date de prochaine étape', estimated_margin_pct: 'Marge estimée', commune: 'Commune', support_type: 'Type de support' };
function StagesAdmin() {
  const r = useApi<any>(['stages'], '/api/pipeline/stages');
  const [edit, setEdit] = useState<any>(null);
  const save = useAction((b: any) => api.put(`/api/admin/stages/${b.code}`, b.body), { success: 'Étape enregistrée', invalidate: [['stages']], onSuccess: () => setEdit(null) });
  return (
    <Card title="Étapes du pipeline" sub="Probabilité, délai d’inactivité, champs obligatoires et critère de sortie" flush>
      <DataTable rows={r.data} loading={r.isLoading} onRowClick={(s: any) => setEdit({ ...s })} columns={[
        { key: 'l', label: 'Étape', render: (s: any) => <><div className="cell-title">{s.label}</div><div className="cell-sub">{s.exit_criteria}</div></> },
        { key: 'p', label: 'Probabilité', num: true, render: (s: any) => `${s.probability} %` },
        { key: 'i', label: 'Inactivité', num: true, render: (s: any) => (s.inactivity_days ? `${s.inactivity_days} j` : '—'), mobile: 'hide' },
        { key: 'f', label: 'Champs obligatoires', render: (s: any) => <span className="xsmall">{(s.required_fields ?? []).map((f: string) => REQ_FIELDS[f] ?? f).join(', ') || '—'}</span>, mobile: 'hide' },
      ]} />
      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Étape — ${edit?.label}`}
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ code: edit.code, body: { label: edit.label, probability: Number(edit.probability), inactivity_days: Number(edit.inactivity_days), required_fields: edit.required_fields ?? [], exit_criteria: edit.exit_criteria ?? '' } })}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Libellé"><Input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} /></Field>
          <Field label="Probabilité (%)" hint={edit.is_closed ? 'Fixe pour les étapes de clôture' : undefined}><Input type="number" min={0} max={100} disabled={edit.is_closed} value={edit.probability} onChange={(e) => setEdit({ ...edit, probability: e.target.value })} /></Field>
          <Field label="Alerte d’inactivité (jours)" hint="0 = aucune alerte"><Input type="number" min={0} value={edit.inactivity_days} onChange={(e) => setEdit({ ...edit, inactivity_days: e.target.value })} /></Field>
          <Field label="Critère de sortie" className="span-2"><Textarea rows={2} value={edit.exit_criteria ?? ''} onChange={(e) => setEdit({ ...edit, exit_criteria: e.target.value })} /></Field>
          <Field label="Champs obligatoires pour entrer dans l’étape" className="span-2"><div className="chips">{Object.entries(REQ_FIELDS).map(([k, l]) => (
            <label key={k} className="checkbox xsmall"><input type="checkbox" checked={(edit.required_fields ?? []).includes(k)} onChange={(e) => setEdit({ ...edit, required_fields: e.target.checked ? [...(edit.required_fields ?? []), k] : edit.required_fields.filter((x: string) => x !== k) })} />{l}</label>
          ))}</div></Field>
        </div>}
      </Modal>
    </Card>
  );
}

// ─── Catalogue
function CatalogAdmin() {
  const can = useCan();
  const r = useApi<any>(['catalog', 'all'], '/api/catalog?all=1');
  const [edit, setEdit] = useState<any>(null);
  const save = useAction((b: any) => (b.id ? api.patch(`/api/catalog/${b.id}`, b.body) : api.post('/api/catalog', b.body)), { success: 'Catalogue mis à jour', invalidate: [['catalog']], onSuccess: () => setEdit(null) });
  const editable = can('catalog', 'update');
  return (
    <Card title="Catalogue et tarifs" sub="Seule source des prix utilisés par les devis et par l’assistant. Toute modification est journalisée avec l’ancienne valeur." flush
      actions={editable && <Button size="sm" variant="primary" icon={<Plus />} onClick={() => setEdit({ code: '', label: '', category: 'prestation', unit: 'unité', unit_price: null, unit_cost: 0, max_discount_pct: 10, tax_rate: 18, description: '', is_active: true })}>Nouvel article</Button>}>
      <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={editable ? (x: any) => setEdit({ ...x }) : undefined} columns={[
        { key: 'c', label: 'Article', render: (x: any) => <><div className="cell-title">{x.label}{!x.is_active && <> <Badge>Inactif</Badge></>}</div><div className="cell-sub">{x.code} · {x.category} · par {x.unit}</div></> },
        { key: 'p', label: 'Prix unitaire HT', num: true, render: (x: any) => money(x.unit_price) },
        { key: 'k', label: 'Coût', num: true, render: (x: any) => (x.unit_cost === null ? '—' : money(x.unit_cost)), mobile: 'hide' },
        { key: 'd', label: 'Remise max.', num: true, render: (x: any) => `${x.max_discount_pct} %`, mobile: 'hide' },
      ]} />
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? `Article ${edit.code}` : 'Nouvel article'}
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ id: edit.id, body: { code: edit.code, label: edit.label, category: edit.category, unit: edit.unit, unit_price: edit.unit_price, unit_cost: edit.unit_cost ?? 0, max_discount_pct: Number(edit.max_discount_pct), tax_rate: Number(edit.tax_rate), description: edit.description || null, is_active: edit.is_active } })}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Code" required error={save.fieldErrors.code}><Input value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value })} /></Field>
          <Field label="Catégorie"><Input value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></Field>
          <Field label="Libellé" required className="span-2" error={save.fieldErrors.label}><Input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} /></Field>
          <Field label="Unité" required><Input value={edit.unit} onChange={(e) => setEdit({ ...edit, unit: e.target.value })} /></Field>
          <Field label="Prix unitaire HT" required error={save.fieldErrors.unit_price}><MoneyInput value={edit.unit_price} onChange={(v) => setEdit({ ...edit, unit_price: v })} /></Field>
          <Field label="Coût unitaire" hint="Sert au calcul de marge ; visible des seuls profils habilités"><MoneyInput value={edit.unit_cost} onChange={(v) => setEdit({ ...edit, unit_cost: v })} /></Field>
          <Field label="Remise maximale sans validation (%)"><Input type="number" min={0} max={100} value={edit.max_discount_pct} onChange={(e) => setEdit({ ...edit, max_discount_pct: e.target.value })} /></Field>
          <Field label="TVA (%)"><Input type="number" min={0} max={100} value={edit.tax_rate} onChange={(e) => setEdit({ ...edit, tax_rate: e.target.value })} /></Field>
          <Field label="Statut"><label className="checkbox"><input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} />Article actif</label></Field>
          <Field label="Description" className="span-2"><Textarea rows={2} value={edit.description ?? ''} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
        </div>}
      </Modal>
    </Card>
  );
}

// ─── Listes de valeurs
const LIST_LABEL: Record<string, string> = { sector: 'Secteurs', source: 'Sources', offer_type: 'Types d’offre', loss_reason: 'Motifs de perte', disqualification_reason: 'Motifs de disqualification', commune: 'Communes', support_type: 'Types de support', structure_type: 'Types de structure', complaint_category: 'Catégories de réclamation' };
function LookupsAdmin() {
  const r = useApi<any>(['admin-lookups'], '/api/admin/lookups');
  const lists = useMemo(() => [...new Set<string>((r.data?.rows ?? []).map((x: any) => x.list))], [r.data]);
  const [list, setList] = useState('');
  const cur = list || lists[0];
  const [edit, setEdit] = useState<any>(null);
  const save = useAction((b: any) => api.put(`/api/admin/lookups/${cur}/${b.code}`, { label: b.label, is_active: b.is_active, sort_order: Number(b.sort_order) || 0 }), { success: 'Liste mise à jour', invalidate: [['admin-lookups'], ['lookups']], onSuccess: () => setEdit(null) });
  const rows = (r.data?.rows ?? []).filter((x: any) => x.list === cur).map((x: any) => ({ ...x, id: x.code }));
  return (
    <Card title="Listes de valeurs" sub="Les valeurs désactivées restent affichées sur les fiches existantes mais ne sont plus proposées" flush
      actions={<><Select aria-label="Liste" value={cur ?? ''} onChange={(e) => setList(e.target.value)} options={lists.map((l) => ({ value: l, label: LIST_LABEL[l] ?? l }))} />
        <Button size="sm" variant="primary" icon={<Plus />} onClick={() => setEdit({ code: '', label: '', is_active: true, sort_order: rows.length, isNew: true })}>Ajouter</Button></>}>
      <DataTable rows={rows} loading={r.isLoading} onRowClick={(x: any) => setEdit({ ...x })} columns={[
        { key: 'l', label: 'Libellé', render: (x: any) => <span className="cell-title">{x.label}</span> },
        { key: 'c', label: 'Code', render: (x: any) => <code className="xsmall">{x.code}</code> },
        { key: 'a', label: 'Statut', render: (x: any) => (x.is_active ? <Badge tone="success">Actif</Badge> : <Badge>Désactivé</Badge>) },
      ]} />
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.isNew ? 'Nouvelle valeur' : `Valeur — ${edit?.label}`}
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!edit?.code || !edit?.label} onClick={() => save.run(edit)}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Code" hint="Minuscules, chiffres et _ ; non modifiable ensuite"><Input value={edit.code} disabled={!edit.isNew} onChange={(e) => setEdit({ ...edit, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} /></Field>
          <Field label="Libellé"><Input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} /></Field>
          <Field label="Ordre"><Input type="number" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: e.target.value })} /></Field>
          <Field label="Statut"><label className="checkbox"><input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} />Proposée dans les formulaires</label></Field>
        </div>}
      </Modal>
    </Card>
  );
}

// ─── Automatisations
function AutomationsAdmin() {
  const r = useApi<any>(['admin-automations'], '/api/admin/automations');
  const toggle = useAction((x: { code: string; is_enabled: boolean }) => api.put(`/api/admin/automations/${x.code}`, { is_enabled: x.is_enabled }), { success: (x: any) => `« ${x.label} » ${x.is_enabled ? 'activée' : 'désactivée'}`, invalidate: [['admin-automations']] });
  const [out, setOut] = useState<any>(null);
  const run = useAction(() => api.post('/api/admin/jobs/run', {}), { success: 'Automatisations exécutées', onSuccess: setOut });
  return (
    <>
      <Card title="Règles d’automatisation" sub="Exécutées toutes les 15 minutes par le planificateur ; chaque exécution est dédoublonnée et journalisée" flush
        actions={<Button size="sm" icon={<Play />} loading={run.isPending} onClick={() => run.run(undefined)}>Exécuter maintenant</Button>}>
        <DataTable rows={r.data?.rows?.map((x: any) => ({ ...x, id: x.code }))} loading={r.isLoading} columns={[
          { key: 'l', label: 'Règle', render: (x: any) => <><div className="cell-title">{x.label}{x.uses_ai && <> <Badge tone="accent">IA</Badge></>}</div><div className="cell-sub">{x.action}{x.control ? ` — ${x.control}` : ''}</div></> },
          { key: 't', label: 'Déclencheur', render: (x: any) => <span className="xsmall">{x.trigger_event}</span>, mobile: 'hide' },
          { key: 'r', label: 'Dernière exécution', render: (x: any) => <span className="xsmall">{x.last_run_at ? `${relative(x.last_run_at)} · ${x.last_run_count}` : '—'}</span>, mobile: 'hide' },
          { key: 'e', label: 'Active', render: (x: any) => <label className="checkbox"><input type="checkbox" checked={x.is_enabled} onChange={(e) => toggle.run({ code: x.code, is_enabled: e.target.checked })} aria-label={`Activer ${x.label}`} /></label> },
        ]} />
      </Card>
      {out && <Card title="Résultat de l’exécution"><pre className="xsmall" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(out, null, 2)}</pre></Card>}
    </>
  );
}

// ─── Objectifs
function TargetsAdmin() {
  const { me } = useAuth();
  const users = useUsers();
  const r = useApi<any>(['targets'], '/api/targets');
  const [edit, setEdit] = useState<any>(null);
  const save = useAction((b: any) => api.put('/api/targets', b), { success: 'Objectif enregistré', invalidate: [['targets'], ['dashboard']], onSuccess: () => setEdit(null) });
  const dir = ['direction_generale', 'direction_commerciale'].includes(me?.role_code ?? '');
  const year = new Date().getFullYear();
  return (
    <Card title="Objectifs commerciaux" sub="Utilisés par le tableau de bord (taux d’atteinte) ; fixés par la direction" flush
      actions={dir && <Button size="sm" variant="primary" icon={<Plus />} onClick={() => setEdit({ user_id: '', period: String(year), amount: null })}>Fixer un objectif</Button>}>
      <DataTable rows={r.data?.rows} loading={r.isLoading} onRowClick={dir ? (t: any) => setEdit({ user_id: t.user_id ?? '', period: t.period, amount: t.amount }) : undefined}
        empty={<Empty icon={<Target />} title="Aucun objectif">Sans objectif, le tableau de bord n’affiche pas de taux d’atteinte.</Empty>}
        columns={[
          { key: 'p', label: 'Période', render: (t: any) => <span className="cell-title">{t.period}</span> },
          { key: 'u', label: 'Portée', render: (t: any) => t.full_name ?? <Badge tone="info">Global entreprise</Badge> },
          { key: 'a', label: 'Objectif HT', num: true, render: (t: any) => money(t.amount) },
        ]} />
      {!dir && <div style={{ padding: 16 }}><Alert>La fixation des objectifs relève de la direction.</Alert></div>}
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Objectif commercial"
        footer={<><Button onClick={() => setEdit(null)}>Annuler</Button><Button variant="primary" loading={save.isPending} onClick={() => save.run({ user_id: edit.user_id || null, period: edit.period, amount: edit.amount ?? 0 })}>Enregistrer</Button></>}>
        {edit && <div className="form-grid">
          <Field label="Commercial"><Select value={edit.user_id} onChange={(e) => setEdit({ ...edit, user_id: e.target.value })} placeholder="Global entreprise" options={users.filter((u) => ['commercial', 'direction_commerciale'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name }))} /></Field>
          <Field label="Période" hint="AAAA, AAAA-MM ou AAAA-Q1…Q4" error={save.fieldErrors.period}><Input value={edit.period} onChange={(e) => setEdit({ ...edit, period: e.target.value })} /></Field>
          <Field label="Montant HT (FCFA)" className="span-2"><MoneyInput value={edit.amount} onChange={(v) => setEdit({ ...edit, amount: v })} /></Field>
        </div>}
      </Modal>
    </Card>
  );
}

// ─── Imports
const ENTITY_LABEL: Record<string, string> = { organizations: 'Clients et prospects', supports: 'Supports publicitaires', invoices: 'Factures (logiciel comptable)' };
function ImportsAdmin() {
  const can = useCan();
  const [sp] = useSearchParams();
  const allowed = Object.keys(ENTITY_LABEL).filter((e) => can(e === 'invoices' ? 'finance' : e, 'create'));
  const [entity, setEntity] = useState(sp.get('entity') && allowed.includes(sp.get('entity')!) ? sp.get('entity')! : allowed[0]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [done, setDone] = useState<any>(null);
  const history = useApi<any>(['imports'], '/api/imports');
  const analyse = useAction((m?: Record<string, string>) => {
    const fd = new FormData();
    fd.append('entity', entity);
    if (m) fd.append('mapping', JSON.stringify(m));
    fd.append('file', file!);
    return api.upload('/api/imports/preview', fd);
  }, { onSuccess: (r: any) => { setPreview(r); setMapping(r.mapping); setDone(null); }, invalidate: [['imports']] });
  const commit = useAction(() => api.post(`/api/imports/${preview.batch_id}/commit`), { success: (r: any) => `${r.created} ligne(s) importée(s)`, invalidate: [['imports']], onSuccess: (r: any) => { setDone(r); setPreview(null); setFile(null); } });
  return (
    <>
      <Card title="Import contrôlé" sub="CSV (séparateur ; ou ,) ou XLSX — prévisualisation, correspondance des colonnes, validation ligne à ligne, journal des rejets">
        <div className="stack">
          <div className="form-grid">
            <Field label="Type de données"><Select value={entity} onChange={(e) => { setEntity(e.target.value); setPreview(null); }} options={allowed.map((e) => ({ value: e, label: ENTITY_LABEL[e] }))} /></Field>
            <Field label="Fichier"><input type="file" accept=".csv,.xlsx" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); }} /></Field>
          </div>
          <div><Button variant="primary" icon={<Upload />} disabled={!file} loading={analyse.isPending} onClick={() => analyse.run(undefined)}>Analyser le fichier</Button></div>
          {done && <Alert tone="success" title="Import terminé">{done.created} ligne(s) créée(s), {done.rejected} rejet(s).{done.totals ? ` Total importé : ${money(done.totals.ttc)} TTC sur ${done.totals.n} facture(s) — à rapprocher du logiciel comptable.` : ''}</Alert>}
        </div>
      </Card>
      {preview && (
        <>
          <div className="grid-3">
            <Kpi label="Lignes lues" value={num(preview.total)} />
            <Kpi label="Lignes valides" value={num(preview.valid)} />
            <Kpi label="Lignes rejetées" value={num(preview.rejected)} action={preview.rejected > 0} />
          </div>
          <Card title="Correspondance des colonnes" sub="Proposée automatiquement d’après les en-têtes ; ajustez puis relancez l’analyse"
            footer={<div className="row"><Button loading={analyse.isPending} onClick={() => analyse.run(mapping)}>Relancer l’analyse</Button><div className="spacer" />
              <Button variant="primary" disabled={!preview.valid || preview.missing_required.length > 0} loading={commit.isPending} onClick={() => commit.run(undefined)}>Importer {preview.valid} ligne(s) valide(s)</Button></div>}>
            {preview.missing_required.length > 0 && <Alert tone="warning">Colonnes obligatoires non associées : {preview.missing_required.map((k: string) => preview.fields[k]).join(', ')}.</Alert>}
            <div className="form-grid">
              {Object.entries(preview.fields).map(([k, label]) => (
                <Field key={k} label={label as string} required={preview.required.includes(k)}>
                  <Select value={mapping[k] ?? ''} onChange={(e) => setMapping({ ...mapping, [k]: e.target.value })} placeholder="— Non importé —" options={preview.headers.map((h: string) => ({ value: h, label: h }))} />
                </Field>
              ))}
            </div>
          </Card>
          {preview.errors.length > 0 && <Card title="Lignes rejetées" sub="Corrigez le fichier source puis relancez l’analyse" flush>
            <DataTable rows={preview.errors} compact columns={[{ key: 'l', label: 'Ligne', num: true, render: (e: any) => e.line, width: 70 }, { key: 'm', label: 'Motif', render: (e: any) => <span className="small">{e.message}</span> }]} />
          </Card>}
        </>
      )}
      <Card title="Historique des imports" flush>
        <DataTable rows={history.data?.rows} loading={history.isLoading} empty={<Empty title="Aucun import" />} columns={[
          { key: 'f', label: 'Fichier', render: (b: any) => <><div className="cell-title">{b.filename}</div><div className="cell-sub">{ENTITY_LABEL[b.entity] ?? b.entity} · {b.full_name}</div></> },
          { key: 'd', label: 'Date', render: (b: any) => <span className="small">{dateTime(b.imported_at ?? b.created_at)}</span> },
          { key: 's', label: 'Statut', render: (b: any) => (b.status === 'importe' ? <Badge tone="success">Importé</Badge> : <Badge>Prévisualisé</Badge>) },
          { key: 'n', label: 'Valides / rejets', num: true, render: (b: any) => `${b.valid_rows} / ${b.rejected_rows}` },
        ]} />
      </Card>
    </>
  );
}

// ─── Supervision IA
function AiSupervision() {
  const r = useApi<any>(['ai-usage'], '/api/ai/usage');
  const settings = useApi<any>(['admin-settings'], '/api/admin/settings');
  const save = useAction((x: { key: string; value: any }) => api.put(`/api/admin/settings/${x.key}`, { value: x.value }), { success: 'Paramètre IA enregistré', invalidate: [['admin-settings'], ['ai-status'], ['ai-usage']] });
  const [confirm, setConfirm] = useState<string | null>(null);
  if (r.isLoading) return <Card><LoadingBlock rows={8} /></Card>;
  const d = r.data;
  const st = d.status;
  const s = (k: string) => settings.data?.rows.find((x: any) => x.key === k)?.value;
  const month = d.by_month.at(-1);
  return (
    <>
      <Card title="Interrupteurs" sub="Arrêt immédiat, sans effet sur les autres fonctions du CRM">
        <div className="row-wrap" style={{ gap: 24 }}>
          <div className="stack" style={{ gap: 4 }}>
            <div className="row"><Badge tone={st.enabled ? 'success' : 'danger'}>Assistant {st.enabled ? 'activé' : 'désactivé'}</Badge></div>
            <Button size="sm" variant={st.enabled ? 'danger' : 'primary'} onClick={() => (st.enabled ? setConfirm('ai.enabled') : save.run({ key: 'ai.enabled', value: true }))}>{st.enabled ? 'Désactiver l’assistant' : 'Réactiver l’assistant'}</Button>
          </div>
          <div className="stack" style={{ gap: 4 }}>
            <div className="row"><Badge tone={st.automation_enabled ? 'success' : 'warning'}>Automatisations {st.automation_enabled ? 'actives' : 'arrêtées'}</Badge></div>
            <Button size="sm" variant={st.automation_enabled ? 'danger' : 'primary'} onClick={() => (st.automation_enabled ? setConfirm('ai.automation_enabled') : save.run({ key: 'ai.automation_enabled', value: true }))}>{st.automation_enabled ? 'Arrêter les automatisations' : 'Relancer les automatisations'}</Button>
          </div>
          <div className="small secondary" style={{ flex: 1, minWidth: 220 }}>Fournisseur : <strong>{st.generative ? `${st.provider} · ${st.model}` : 'aucun (moteur de règles du CRM)'}</strong><br />Minimisation des données : {s('ai.data_minimization') ? 'activée' : 'désactivée'}</div>
        </div>
      </Card>
      <div className="grid-3">
        <Kpi label="Consommation du mois" value={money(st.used_fcfa)} progress={st.budget_fcfa ? (st.used_fcfa / st.budget_fcfa) * 100 : null} foot={<span>budget {money(st.budget_fcfa)}</span>} help={{ title: 'Coût IA', formula: 'Somme des jetons consommés × tarif du fournisseur (paramétrable), convertie en FCFA.' }} />
        <Kpi label="Requêtes ce mois" value={num(month?.requests ?? 0)} foot={<span>{month?.errors ?? 0} en erreur, quota ou indisponibilité</span>} />
        <Kpi label="Travaux en attente" value={d.pending.filter((p: any) => p.status === 'en_attente').length} foot={<span>Relancés automatiquement au retour du fournisseur</span>} />
      </div>
      {d.by_month.length > 0 && <Card title="Coût mensuel" sub="FCFA, 6 derniers mois">
        <BarTargetChart caption="Coût IA mensuel" valueLabel="Coût" data={d.by_month.map((m: any) => ({ label: m.month, value: m.cost_fcfa, target: st.budget_fcfa }))} targetLabel="Budget" />
      </Card>}
      <div className="grid-2">
        <Card title="Par fonctionnalité (mois)" flush><DataTable rows={d.by_feature} compact empty={<Empty title="Aucune requête ce mois" />} columns={[
          { key: 'f', label: 'Fonction', render: (x: any) => x.feature },
          { key: 'r', label: 'Requêtes', num: true, render: (x: any) => x.requests },
          { key: 'c', label: 'Coût', num: true, render: (x: any) => money(x.cost_fcfa) },
          { key: 'l', label: 'Latence moy.', num: true, render: (x: any) => (x.avg_latency_ms ? `${x.avg_latency_ms} ms` : '—') },
        ]} /></Card>
        <Card title="Par utilisateur (mois)" flush><DataTable rows={d.by_user} compact empty={<Empty title="Aucune requête ce mois" />} columns={[
          { key: 'u', label: 'Utilisateur', render: (x: any) => x.full_name },
          { key: 'r', label: 'Requêtes', num: true, render: (x: any) => x.requests },
          { key: 'c', label: 'Coût', num: true, render: (x: any) => money(x.cost_fcfa) },
        ]} /></Card>
      </div>
      <Card title="Journal des actions de l’assistant" sub="100 dernières propositions et exécutions, tous utilisateurs" flush>
        <DataTable rows={d.actions} compact empty={<Empty title="Aucune action" />} columns={[
          { key: 'd', label: 'Date', render: (a: any) => <span className="xsmall">{dateTime(a.created_at)}</span> },
          { key: 'u', label: 'Utilisateur', render: (a: any) => <span className="small">{a.full_name}</span>, mobile: 'hide' },
          { key: 'l', label: 'Action', render: (a: any) => <><div className="small">{a.label}</div><div className="xsmall muted">{a.mode} · risque {a.risk}{a.error ? ` · ${a.error}` : ''}</div></> },
          { key: 's', label: 'Statut', render: (a: any) => <Status kind="ai_action" code={a.status} /> },
        ]} />
      </Card>
      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} danger loading={save.isPending}
        title={confirm === 'ai.enabled' ? 'Désactiver l’assistant IA ?' : 'Arrêter les automatisations IA ?'}
        message={confirm === 'ai.enabled' ? 'L’assistant sera indisponible pour tous les utilisateurs. Le reste du CRM continue de fonctionner normalement.' : 'Plus aucune action ne sera exécutée automatiquement ; les propositions resteront soumises à confirmation.'}
        confirmLabel="Confirmer l’arrêt" onConfirm={() => { save.run({ key: confirm!, value: false }); setConfirm(null); }} />
    </>
  );
}

// ─── Audit
function AuditAdmin() {
  const can = useCan();
  const { me } = useAuth();
  const [f, setF] = useState({ q: '', action: '', from: '', to: '', page: 1 });
  const params = { q: f.q, action: f.action, from: f.from, to: f.to, page: f.page };
  const r = useApi<any>(['audit', params], `/api/admin/audit${qs(params)}`);
  const [open, setOpen] = useState<any>(null);
  const canExport = can('admin', 'export') || me?.role_code === 'auditeur';
  return (
    <Card title="Journal d’audit" sub="Inaltérable : ni modification ni suppression possibles, y compris par un administrateur" flush
      actions={canExport && <ExcelButton size="sm" url={`/api/admin/audit${qs({ ...params, page: null, format: 'xlsx' })}`} />}>
      <div className="row-wrap" style={{ padding: '12px 20px' }}>
        <Input placeholder="Rechercher (résumé, utilisateur)…" aria-label="Rechercher" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value, page: 1 })} style={{ maxWidth: 260 }} />
        <Select aria-label="Action" value={f.action} onChange={(e) => setF({ ...f, action: e.target.value, page: 1 })} placeholder="Toutes les actions" options={Object.entries(AUDIT_ACTION).map(([value, label]) => ({ value, label }))} />
        <Input type="date" aria-label="Du" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value, page: 1 })} />
        <Input type="date" aria-label="Au" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value, page: 1 })} />
      </div>
      <DataTable rows={r.data?.rows} loading={r.isLoading} compact onRowClick={setOpen} empty={<Empty icon={<ScrollText />} title="Aucune entrée" />} columns={[
        { key: 'd', label: 'Date', render: (x: any) => <span className="xsmall nowrap">{dateTime(x.at)}</span> },
        { key: 'u', label: 'Utilisateur', render: (x: any) => <span className="small">{x.user_label}</span>, mobile: 'hide' },
        { key: 'a', label: 'Action', render: (x: any) => <Badge tone={x.action === 'login_failed' || x.action === 'delete' ? 'danger' : x.action === 'config' || x.action === 'security' ? 'warning' : 'neutral'}>{AUDIT_ACTION[x.action] ?? x.action}</Badge> },
        { key: 's', label: 'Résumé', render: (x: any) => <span className="small">{x.summary}</span> },
      ]} />
      <div className="row" style={{ padding: '10px 20px' }}>
        <Button size="sm" disabled={f.page <= 1} onClick={() => setF({ ...f, page: f.page - 1 })}>Précédent</Button>
        <span className="xsmall muted">Page {f.page}</span>
        <Button size="sm" disabled={(r.data?.rows.length ?? 0) < 100} onClick={() => setF({ ...f, page: f.page + 1 })}>Suivant</Button>
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} size="lg" title="Entrée du journal">
        {open && <div className="stack">
          <dl className="dl"><dt>Date</dt><dd>{dateTime(open.at)}</dd><dt>Utilisateur</dt><dd>{open.user_label}</dd><dt>Action</dt><dd>{AUDIT_ACTION[open.action] ?? open.action}</dd><dt>Objet</dt><dd>{open.entity_type} {open.entity_id}</dd><dt>Adresse IP</dt><dd>{open.ip ?? '—'}</dd></dl>
          <div className="small">{open.summary}</div>
          {open.details && <pre className="xsmall" style={{ whiteSpace: 'pre-wrap', background: 'var(--surface-2)', padding: 10, borderRadius: 6, margin: 0 }}>{JSON.stringify(open.details, null, 2)}</pre>}
        </div>}
      </Modal>
    </Card>
  );
}

// ─── Corbeille
const TRASH_LABEL: Record<string, string> = { organization: 'Client / prospect', contact: 'Contact', opportunity: 'Opportunité', quote: 'Devis', contract: 'Contrat', support: 'Support', document: 'Document', activity: 'Activité' };
function TrashAdmin() {
  const r = useApi<any>(['trash'], '/api/admin/trash');
  const restore = useAction((x: any) => api.post(`/api/admin/trash/${x.type}/${x.id}/restore`), { success: 'Élément restauré', invalidate: [['trash']] });
  return (
    <Card title="Corbeille" sub="Les suppressions sont logiques : les éléments restent restaurables et l’historique est conservé" flush>
      <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty icon={<Trash2 />} title="Corbeille vide" />} columns={[
        { key: 'l', label: 'Élément', render: (x: any) => <><div className="cell-title">{x.label}</div><div className="cell-sub">{TRASH_LABEL[x.type] ?? x.type}</div></> },
        { key: 'd', label: 'Supprimé', render: (x: any) => <span className="small">{date(x.deleted_at)}{x.deleted_by_name ? ` · ${x.deleted_by_name}` : ''}</span> },
        { key: 'a', label: '', render: (x: any) => <Button size="sm" loading={restore.isPending && restore.variables?.id === x.id} onClick={() => restore.run(x)}>Restaurer</Button> },
      ]} />
    </Card>
  );
}

// ─── Sessions
function SessionsAdmin() {
  const r = useApi<any>(['admin-sessions'], '/api/admin/sessions');
  return (
    <Card title="Sessions actives" sub="Expiration après inactivité ; un changement de rôle, une désactivation ou une réinitialisation ferme les sessions" flush>
      <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty title="Aucune session" />} columns={[
        { key: 'u', label: 'Utilisateur', render: (s: any) => <><div className="cell-title">{s.full_name}</div><div className="cell-sub">{s.email}</div></> },
        { key: 'l', label: 'Dernière activité', render: (s: any) => <span className="small">{relative(s.last_used_at)}</span> },
        { key: 'i', label: 'Adresse IP', render: (s: any) => <span className="xsmall">{s.ip ?? '—'}</span>, mobile: 'hide' },
        { key: 'a', label: 'Navigateur', render: (s: any) => <span className="xsmall muted" title={s.user_agent}>{(s.user_agent ?? '').slice(0, 60)}</span>, mobile: 'hide' },
      ]} />
    </Card>
  );
}

/** Papier à en-tête appliqué à tous les documents A4 générés (PDF et Word) : aperçu, téléchargement, remplacement. */
function LetterheadCard() {
  const can = useCan();
  const r = useApi<any>(['letterhead'], can('admin', 'view') ? '/api/admin/letterhead' : null);
  const [v, setV] = useState(0);
  const upload = useAction((f: File) => { const fd = new FormData(); fd.append('file', f, f.name); return api.upload('/api/admin/letterhead', fd); }, { success: 'Papier à en-tête remplacé', invalidate: [['letterhead']], onSuccess: () => setV((x) => x + 1) });
  const reset = useAction(() => api.del('/api/admin/letterhead'), { success: 'Modèle livré rétabli', invalidate: [['letterhead']], onSuccess: () => setV((x) => x + 1) });
  if (!can('admin', 'view') || !r.data) return null;
  const m = r.data.margins_mm;
  return (
    <Card title="Papier à en-tête des documents" sub="Appliqué à tous les documents A4 générés : devis, factures proforma, rapports et analyses SWOT, en PDF et en Word">
      <div className="letterhead-admin">
        {!DEMO && <img src={`/api/admin/letterhead/image?v=${v}`} alt="Aperçu du papier à en-tête" className="letterhead-preview" />}
        <div className="stack">
          <div><Badge tone={r.data.source === 'personnalise' ? 'accent' : 'neutral'}>{r.data.source === 'personnalise' ? 'Modèle personnalisé' : 'Modèle livré (COM&SIG)'}</Badge></div>
          <div className="small">Marges du modèle : haut {m.top} mm · bas {m.bottom} mm · gauche {m.left} mm · droite {m.right} mm</div>
          <div className="small muted">Pour changer de papier, déposez le modèle Word (.docx) : l’image placée dans son en-tête et ses marges sont reprises telles quelles. Les documents déjà téléchargés ne changent pas.</div>
          <div className="row-wrap">
            <Button icon={<Download />} onClick={() => download('/api/admin/letterhead/template')}>Télécharger le modèle</Button>
            {can('admin', 'update') && <label className="btn btn-primary"><Upload size={16} /> Remplacer (.docx)<input type="file" hidden accept=".docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.run(f); e.target.value = ''; }} /></label>}
            {can('admin', 'update') && r.data.source === 'personnalise' && <Button variant="ghost" onClick={() => reset.run(undefined)}>Revenir au modèle livré</Button>}
          </div>
        </div>
      </div>
    </Card>
  );
}
