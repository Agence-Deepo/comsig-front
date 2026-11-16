// Formulaires partagés : erreurs au plus près du champ, saisies conservées, doublons signalés, double soumission empêchée
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../lib/api';
import { useAction, useApi } from '../lib/hooks';
import { useAuth, useLookups, useUsers } from '../lib/auth';
import { today, addDays } from '../lib/format';
import { ACTIVITY_KIND, DECISION_ROLE } from '../lib/labels';
import { Alert, Button, Field, Input, Modal, MoneyInput, Select, Textarea, ErrorExplain } from './ui';

const opt = (list?: { code: string; label: string }[]) => (list ?? []).map((x) => ({ value: x.code, label: x.label }));

// ─────────────────────────── Organisation ───────────────────────────
export function OrganizationForm({ open, onClose, initial, defaultKind = 'prospect' }: { open: boolean; onClose: () => void; initial?: any; defaultKind?: string }) {
  const { lookups } = useLookups();
  const users = useUsers();
  const { me } = useAuth();
  const nav = useNavigate();
  const empty = { legal_name: '', resource_person: '', resource_title: '', trade_name: '', kind: defaultKind, sector: '', structure_type: '', commune: '', city: 'Abidjan', address: '', phone: '', email: '', website: '', legal_id: '', source: '', size: '', potential: '', owner_id: '', notes: '' };
  const [f, setF] = useState<any>(empty);
  const [dups, setDups] = useState<any[]>([]);
  const [justif, setJustif] = useState('');
  useEffect(() => { if (open) { setF(initial ? { ...empty, ...Object.fromEntries(Object.entries(initial).filter(([k]) => k in empty).map(([k, v]) => [k, v ?? ''])) } : empty); setDups([]); setJustif(''); } }, [open]);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target ? e.target.value : e });
  const clean = (o: any) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === '' ? null : v]));
  const save = useAction((body: any) => initial ? api.patch(`/api/organizations/${initial.id}`, body) : api.post('/api/organizations', body), {
    success: initial ? 'Fiche mise à jour' : 'Organisation créée', invalidate: [['organizations'], ['org']],
    onSuccess: (r: any) => { onClose(); if (!initial) nav(`/organisations/${r.id}`); },
    onError: (e) => { if (e.status === 409 && e.details?.duplicates) setDups(e.details.duplicates); }, silent: false,
  });
  // Vérification des doublons dès la saisie du nom / téléphone / e-mail
  useEffect(() => {
    if (initial || !open || (f.legal_name.length < 3 && !f.phone && !f.email)) return;
    const t = setTimeout(() => api.post('/api/organizations/check-duplicates', clean({ legal_name: f.legal_name, phone: f.phone || undefined, email: f.email || undefined })).then((r) => setDups(r.duplicates)).catch(() => {}), 450);
    return () => clearTimeout(t);
  }, [f.legal_name, f.phone, f.email, open]);
  const submit = () => {
    const body: any = clean(f);
    if (body.city === null) body.city = 'Abidjan';
    if (!initial && dups.length) { body.ignore_duplicates = true; body.duplicate_justification = justif; }
    save.run(body);
  };
  const fe = save.fieldErrors;
  return (
    <Modal open={open} onClose={onClose} size="lg" title={initial ? `Modifier ${initial.legal_name}` : 'Nouvelle organisation'} description="Les champs marqués d’un astérisque sont obligatoires. Le responsable reçoit une tâche de premier contact pour un nouveau prospect."
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.legal_name.trim() || (!initial && dups.length > 0 && !justif.trim())} onClick={submit}>{initial ? 'Enregistrer' : 'Créer la fiche'}</Button></>}>
      <div className="stack-lg">
        {dups.length > 0 && !initial && (
          <Alert tone="warning" title="Doublon probable">
            <ul>{dups.map((d) => <li key={d.id}><a href={`/organisations/${d.id}`} target="_blank" rel="noopener">{d.legal_name}</a> ({d.ref}{d.commune ? `, ${d.commune}` : ''}) — {d.reasons.join(', ')}</li>)}</ul>
            <div style={{ marginTop: 8 }}><Field label="Pourquoi s’agit-il d’une organisation différente ?" required error={fe.duplicate_justification}><Input value={justif} onChange={(e) => setJustif(e.target.value)} placeholder="Ex. : filiale distincte, autre entité juridique…" /></Field></div>
          </Alert>
        )}
        <div className="form-grid">
          <Field label="Raison sociale" required error={fe.legal_name} className="span-2"><Input value={f.legal_name} onChange={set('legal_name')} invalid={!!fe.legal_name} autoFocus /></Field>
          <Field label="Personne ressource (interlocuteur)" hint="Facultatif" error={fe.resource_person}><Input value={f.resource_person} onChange={set('resource_person')} placeholder="Prénom et nom" /></Field>
          <Field label="Fonction occupée" hint="Facultatif" error={fe.resource_title}><Input value={f.resource_title} onChange={set('resource_title')} placeholder="Ex. : Directeur marketing" /></Field>
          <Field label="Nom commercial" error={fe.trade_name}><Input value={f.trade_name} onChange={set('trade_name')} /></Field>
          <Field label="Type" error={fe.kind}><Select value={f.kind} onChange={set('kind')} options={[{ value: 'prospect', label: 'Prospect' }, { value: 'client', label: 'Client' }, { value: 'ancien_client', label: 'Ancien client' }, { value: 'institution', label: 'Institution' }, { value: 'partenaire', label: 'Partenaire' }, { value: 'fournisseur', label: 'Fournisseur' }]} /></Field>
          <Field label="Secteur" error={fe.sector}><Select value={f.sector} onChange={set('sector')} placeholder="—" options={opt(lookups.sector)} /></Field>
          <Field label="Type de structure"><Select value={f.structure_type} onChange={set('structure_type')} placeholder="—" options={opt(lookups.structure_type)} /></Field>
          <Field label="Source d’acquisition" error={fe.source}><Select value={f.source} onChange={set('source')} placeholder="—" options={opt(lookups.source)} /></Field>
          <Field label="Potentiel"><Select value={f.potential} onChange={set('potential')} placeholder="—" options={[{ value: 'faible', label: 'Faible' }, { value: 'moyen', label: 'Moyen' }, { value: 'fort', label: 'Fort' }, { value: 'strategique', label: 'Stratégique' }]} /></Field>
          <Field label="Taille"><Select value={f.size} onChange={set('size')} placeholder="—" options={[{ value: 'tpe', label: 'TPE' }, { value: 'pme', label: 'PME' }, { value: 'eti', label: 'ETI' }, { value: 'grande', label: 'Grande entreprise' }, { value: 'institution', label: 'Institution' }]} /></Field>
          <Field label="Identifiant (RCCM / NCC)" error={fe.legal_id}><Input value={f.legal_id} onChange={set('legal_id')} /></Field>
          <Field label="Commune"><Select value={f.commune} onChange={set('commune')} placeholder="—" options={opt(lookups.commune)} /></Field>
          <Field label="Ville"><Input value={f.city} onChange={set('city')} /></Field>
          <Field label="Adresse" className="span-2"><Input value={f.address} onChange={set('address')} /></Field>
          <Field label="Téléphone" error={fe.phone}><Input type="tel" value={f.phone} onChange={set('phone')} invalid={!!fe.phone} placeholder="+225 …" /></Field>
          <Field label="E-mail" error={fe.email}><Input type="email" value={f.email} onChange={set('email')} invalid={!!fe.email} /></Field>
          <Field label="Site web"><Input value={f.website} onChange={set('website')} /></Field>
          {me?.data_scope !== 'own' && <Field label="Responsable commercial" hint="Par défaut : vous"><Select value={f.owner_id} onChange={set('owner_id')} placeholder="—" options={users.filter((u) => ['commercial', 'direction_commerciale', 'direction_generale'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name }))} /></Field>}
          <Field label="Notes" className="span-2"><Textarea value={f.notes} onChange={set('notes')} /></Field>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────── Contact ───────────────────────────
export function ContactForm({ open, onClose, orgId, initial }: { open: boolean; onClose: () => void; orgId: string; initial?: any }) {
  const empty = { civility: '', first_name: '', last_name: '', job_title: '', department: '', decision_role: '', email: '', phone: '', mobile: '', preferred_channel: '', opt_out: false, is_primary: false, notes: '' };
  const [f, setF] = useState<any>(empty);
  const [dups, setDups] = useState<any[]>([]);
  useEffect(() => { if (open) { setF(initial ? { ...empty, ...Object.fromEntries(Object.entries(initial).filter(([k]) => k in empty).map(([k, v]) => [k, v ?? ''])) } : empty); setDups([]); } }, [open]);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const save = useAction((body: any) => initial ? api.patch(`/api/contacts/${initial.id}`, body) : api.post(`/api/organizations/${orgId}/contacts`, body), {
    success: initial ? 'Contact mis à jour' : 'Contact ajouté', invalidate: [['org', orgId]], onSuccess: onClose,
    onError: (e) => { if (e.status === 409) setDups(e.details?.duplicates ?? []); },
  });
  const body = () => ({ ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' ? null : v])), first_name: f.first_name, ...(dups.length ? { ignore_duplicates: true } : {}) });
  const fe = save.fieldErrors;
  return (
    <Modal open={open} onClose={onClose} size="lg" title={initial ? 'Modifier le contact' : 'Nouveau contact'}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.last_name.trim()} onClick={() => save.run(body())}>{dups.length ? 'Créer malgré tout' : 'Enregistrer'}</Button></>}>
      <div className="stack-lg">
        {dups.length > 0 && <Alert tone="warning" title="Contact déjà existant ?"><ul>{dups.map((d) => <li key={d.id}>{d.first_name} {d.last_name} — {d.legal_name}{d.email ? ` (${d.email})` : ''}</li>)}</ul></Alert>}
        <div className="form-grid">
          <Field label="Civilité"><Select value={f.civility} onChange={set('civility')} placeholder="—" options={['M.', 'Mme', 'Dr', 'Me', 'Pr'].map((x) => ({ value: x, label: x }))} /></Field>
          <div />
          <Field label="Prénom"><Input value={f.first_name} onChange={set('first_name')} autoFocus /></Field>
          <Field label="Nom" required error={fe.last_name}><Input value={f.last_name} onChange={set('last_name')} invalid={!!fe.last_name} /></Field>
          <Field label="Fonction"><Input value={f.job_title} onChange={set('job_title')} /></Field>
          <Field label="Service"><Input value={f.department} onChange={set('department')} /></Field>
          <Field label="Rôle dans la décision"><Select value={f.decision_role} onChange={set('decision_role')} placeholder="—" options={Object.entries(DECISION_ROLE).map(([value, label]) => ({ value, label }))} /></Field>
          <Field label="Canal préféré"><Select value={f.preferred_channel} onChange={set('preferred_channel')} placeholder="—" options={[{ value: 'email', label: 'E-mail' }, { value: 'telephone', label: 'Téléphone' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'visite', label: 'Visite' }, { value: 'courrier', label: 'Courrier' }]} /></Field>
          <Field label="E-mail" error={fe.email}><Input type="email" value={f.email} onChange={set('email')} invalid={!!fe.email} /></Field>
          <Field label="Téléphone fixe" error={fe.phone}><Input type="tel" value={f.phone} onChange={set('phone')} invalid={!!fe.phone} /></Field>
          <Field label="Mobile" error={fe.mobile}><Input type="tel" value={f.mobile} onChange={set('mobile')} invalid={!!fe.mobile} /></Field>
          <div className="stack" style={{ justifyContent: 'flex-end' }}>
            <label className="checkbox"><input type="checkbox" checked={f.is_primary} onChange={set('is_primary')} />Interlocuteur principal</label>
            <label className="checkbox"><input type="checkbox" checked={f.opt_out} onChange={set('opt_out')} />Opposition aux sollicitations</label>
          </div>
          <Field label="Notes" className="span-2"><Textarea value={f.notes} onChange={set('notes')} /></Field>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────── Opportunité ───────────────────────────
export function OpportunityForm({ open, onClose, orgId, initial }: { open: boolean; onClose: () => void; orgId?: string; initial?: any }) {
  const { lookups } = useLookups();
  const users = useUsers();
  const { me } = useAuth();
  const nav = useNavigate();
  const empty = { title: '', organization_id: orgId ?? '', primary_contact_id: '', owner_id: '', source: '', offer_type: '', amount: null as number | null, estimated_margin_pct: '', expected_close_date: addDays(today(), 45), need: '', next_step: '', next_step_date: addDays(today(), 3), commune: '', support_type: '' };
  const [f, setF] = useState<any>(empty);
  const [dups, setDups] = useState<any[]>([]);
  const [justif, setJustif] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  useEffect(() => { if (open) { setF(initial ? { ...empty, ...Object.fromEntries(Object.entries(initial).filter(([k]) => k in empty).map(([k, v]) => [k, v ?? ''])) } : { ...empty, organization_id: orgId ?? '' }); setDups([]); setJustif(''); } }, [open]);
  const orgs = useApi<any>(['org-pick', orgSearch], open && !orgId && !initial ? `/api/organizations?pageSize=30&q=${encodeURIComponent(orgSearch)}` : null);
  const org = useApi<any>(['org', f.organization_id], open && f.organization_id ? `/api/organizations/${f.organization_id}` : null);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e?.target ? e.target.value : e });
  const save = useAction((body: any) => initial ? api.patch(`/api/opportunities/${initial.id}`, body) : api.post('/api/opportunities', body), {
    success: initial ? 'Opportunité mise à jour' : 'Opportunité créée — une tâche initiale a été planifiée', invalidate: [['opportunities'], ['opp'], ['org'], ['dashboard']],
    onSuccess: (r: any) => { onClose(); if (!initial) nav(`/opportunites/${r.id}`); },
    onError: (e) => { if (e.status === 409) setDups(e.details?.duplicates ?? []); },
  });
  const submit = () => {
    const body: any = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' ? null : v]));
    body.amount = f.amount ?? 0;
    body.need = f.need ?? '';
    if (body.estimated_margin_pct !== null) body.estimated_margin_pct = Number(body.estimated_margin_pct);
    if (initial) { delete body.organization_id; if (me?.data_scope === 'own') delete body.owner_id; }
    if (dups.length) { body.ignore_duplicates = true; body.duplicate_justification = justif; }
    save.run(body);
  };
  const fe = save.fieldErrors;
  const contacts = org.data?.contacts ?? [];
  return (
    <Modal open={open} onClose={onClose} size="lg" title={initial ? `Modifier ${initial.ref}` : 'Nouvelle opportunité'} description={initial ? 'Les modifications de montant, probabilité, date et responsable sont historisées.' : 'Client, contact, source, offre et date de clôture prévisionnelle sont obligatoires (règle de gestion COM&SIG).'}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.title || !f.organization_id || (dups.length > 0 && !justif.trim())} onClick={submit}>{initial ? 'Enregistrer' : 'Créer l’opportunité'}</Button></>}>
      <div className="stack-lg">
        {dups.length > 0 && (
          <Alert tone="warning" title="Opportunité similaire déjà ouverte">
            <ul>{dups.map((d) => <li key={d.id}><a href={`/opportunites/${d.id}`} target="_blank" rel="noopener">{d.ref} — {d.title}</a> ({d.stage_label}, {d.owner_name})</li>)}</ul>
            <div style={{ marginTop: 8 }}><Field label="Justification de la création" required><Input value={justif} onChange={(e) => setJustif(e.target.value)} placeholder="Ex. : besoin distinct, autre période…" /></Field></div>
          </Alert>
        )}
        <div className="form-grid">
          <Field label="Intitulé" required error={fe.title} className="span-2"><Input value={f.title} onChange={set('title')} invalid={!!fe.title} autoFocus placeholder="Ex. : Lancement produit — affichage Cocody" /></Field>
          {!orgId && !initial ? (
            <Field label="Client / prospect" required error={fe.organization_id} className="span-2">
              <div className="row"><Input placeholder="Rechercher…" value={orgSearch} onChange={(e) => setOrgSearch(e.target.value)} style={{ maxWidth: 220 }} aria-label="Rechercher une organisation" />
                <Select value={f.organization_id} onChange={(e) => setF({ ...f, organization_id: e.target.value, primary_contact_id: '' })} placeholder="Choisir…" options={(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: `${o.legal_name} (${o.ref})` }))} invalid={!!fe.organization_id} /></div>
            </Field>
          ) : <Field label="Client" className="span-2"><Input value={org.data?.organization?.legal_name ?? '…'} disabled /></Field>}
          <Field label="Interlocuteur principal" error={fe.primary_contact_id} hint={f.organization_id && !contacts.length ? 'Aucun contact : ajoutez-en un depuis la fiche client.' : undefined}>
            <Select value={f.primary_contact_id} onChange={set('primary_contact_id')} placeholder="—" options={contacts.map((c: any) => ({ value: c.id, label: `${c.first_name} ${c.last_name}${c.job_title ? ` — ${c.job_title}` : ''}` }))} />
          </Field>
          {me?.data_scope !== 'own' ? <Field label="Responsable" hint="Par défaut : vous"><Select value={f.owner_id} onChange={set('owner_id')} placeholder="—" options={users.filter((u) => ['commercial', 'direction_commerciale', 'direction_generale'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name }))} /></Field> : <div />}
          <Field label="Source d’acquisition" required error={fe.source}><Select value={f.source} onChange={set('source')} placeholder="Choisir…" options={opt(lookups.source)} invalid={!!fe.source} /></Field>
          <Field label="Type d’offre" required error={fe.offer_type} hint="Détermine la checklist de découverte"><Select value={f.offer_type} onChange={set('offer_type')} placeholder="Choisir…" options={opt(lookups.offer_type)} invalid={!!fe.offer_type} /></Field>
          <Field label="Montant estimé (HT)" error={fe.amount}><MoneyInput value={f.amount} onChange={set('amount')} invalid={!!fe.amount} /></Field>
          <Field label="Date de clôture prévue" required error={fe.expected_close_date}><Input type="date" value={f.expected_close_date} onChange={set('expected_close_date')} invalid={!!fe.expected_close_date} /></Field>
          <Field label="Commune ciblée"><Select value={f.commune} onChange={set('commune')} placeholder="—" options={opt(lookups.commune)} /></Field>
          <Field label="Type de support"><Select value={f.support_type} onChange={set('support_type')} placeholder="—" options={opt(lookups.support_type)} /></Field>
          <Field label="Besoin" className="span-2" error={fe.need} hint="Obligatoire à partir de l’étape « Qualifié »."><Textarea value={f.need} onChange={set('need')} /></Field>
          <Field label="Prochaine étape"><Input value={f.next_step} onChange={set('next_step')} /></Field>
          <Field label="Date de la prochaine étape" error={fe.next_step_date}><Input type="date" value={f.next_step_date} onChange={set('next_step_date')} /></Field>
        </div>
        <ErrorExplain error={save.error} />
      </div>
    </Modal>
  );
}

// ─────────────────────────── Activité ───────────────────────────
export function ActivityForm({ open, onClose, preset, initial, title }: { open: boolean; onClose: () => void; preset?: { organization_id?: string; opportunity_id?: string; contact_id?: string; kind?: string; status?: string; subject?: string }; initial?: any; title?: string }) {
  const users = useUsers();
  const { me } = useAuth();
  const empty = { kind: 'tache', subject: '', body: '', outcome: '', contact_result: '', status: 'a_faire', priority: 'normale', due_at: `${addDays(today(), 1)}T09:00`, contact_id: '', assigned_to: '', recurrence: '' };
  const [f, setF] = useState<any>(empty);
  useEffect(() => {
    if (!open) return;
    if (initial) setF({ ...empty, ...Object.fromEntries(Object.entries(initial).filter(([k]) => k in empty).map(([k, v]) => [k, v ?? ''])), due_at: initial.due_at ? new Date(initial.due_at).toISOString().slice(0, 16) : '' });
    else setF({ ...empty, ...(preset ?? {}), contact_id: preset?.contact_id ?? '' });
  }, [open]);
  const org = useApi<any>(['org', preset?.organization_id], open && preset?.organization_id ? `/api/organizations/${preset.organization_id}` : null);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const done = f.status === 'termine';
  const interaction = ['appel', 'email', 'reunion', 'visite'].includes(f.kind);
  const save = useAction((body: any) => initial ? api.patch(`/api/activities/${initial.id}`, body) : api.post('/api/activities', body), {
    success: done ? 'Interaction consignée' : 'Activité planifiée', invalidate: [['activities'], ['org'], ['opp'], ['dashboard']], onSuccess: onClose,
  });
  const submit = () => {
    const body: any = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' ? null : v]));
    if (!initial) { body.organization_id = preset?.organization_id ?? null; body.opportunity_id = preset?.opportunity_id ?? null; }
    if (body.due_at && !done) body.due_at = new Date(body.due_at).toISOString(); else if (done && !initial) body.due_at = null;
    save.run(body);
  };
  const fe = save.fieldErrors;
  return (
    <Modal open={open} onClose={onClose} size="lg" title={title ?? (initial ? 'Modifier l’activité' : 'Nouvelle activité')} description={done ? 'Une interaction consignée met à jour la date de dernière activité du client et de l’opportunité.' : undefined}
      footer={<><Button onClick={onClose}>Annuler</Button><Button variant="primary" loading={save.isPending} disabled={!f.subject.trim()} onClick={submit}>{done ? 'Consigner' : 'Enregistrer'}</Button></>}>
      <div className="stack-lg">
        <div className="form-grid">
          <Field label="Type"><Select value={f.kind} onChange={set('kind')} options={Object.entries(ACTIVITY_KIND).filter(([k]) => k !== 'demande_interne').map(([value, label]) => ({ value, label }))} /></Field>
          <Field label="Statut"><Select value={f.status} onChange={set('status')} options={[{ value: 'a_faire', label: 'À faire' }, { value: 'en_cours', label: 'En cours' }, { value: 'termine', label: 'Terminé (consigner)' }, { value: 'reporte', label: 'Reporté' }, { value: 'annule', label: 'Annulé' }]} /></Field>
          <Field label="Objet" required error={fe.subject} className="span-2"><Input value={f.subject} onChange={set('subject')} invalid={!!fe.subject} autoFocus /></Field>
          {!done && <Field label="Échéance" error={fe.due_at}><Input type="datetime-local" value={f.due_at} onChange={set('due_at')} /></Field>}
          <Field label="Priorité"><Select value={f.priority} onChange={set('priority')} options={[{ value: 'basse', label: 'Basse' }, { value: 'normale', label: 'Normale' }, { value: 'haute', label: 'Haute' }, { value: 'critique', label: 'Critique (compte rendu obligatoire)' }]} /></Field>
          {(org.data?.contacts?.length ?? 0) > 0 && <Field label="Contact"><Select value={f.contact_id} onChange={set('contact_id')} placeholder="—" options={org.data.contacts.map((c: any) => ({ value: c.id, label: `${c.first_name} ${c.last_name}${c.opt_out ? ' (opposition)' : ''}` }))} /></Field>}
          {done && interaction && <Field label="Résultat du contact"><Select value={f.contact_result} onChange={set('contact_result')} placeholder="—" options={[{ value: 'joint', label: 'Interlocuteur joint' }, { value: 'injoignable', label: 'Injoignable (nouvelle tentative programmée)' }, { value: 'refus', label: 'Refus de contact (relances arrêtées)' }]} /></Field>}
          {!done && <Field label="Récurrence"><Select value={f.recurrence} onChange={set('recurrence')} placeholder="Aucune" options={[{ value: 'quotidienne', label: 'Quotidienne' }, { value: 'hebdomadaire', label: 'Hebdomadaire' }, { value: 'mensuelle', label: 'Mensuelle' }]} /></Field>}
          {me?.data_scope !== 'own' && !done && <Field label="Assigner à" hint="Par défaut : vous"><Select value={f.assigned_to} onChange={set('assigned_to')} placeholder="—" options={users.map((u) => ({ value: u.id, label: u.full_name }))} /></Field>}
          {done ? <Field label="Compte rendu" error={fe.outcome} className="span-2" hint="Décisions, besoins, objections, engagements et prochaines actions."><Textarea rows={5} value={f.outcome} onChange={set('outcome')} invalid={!!fe.outcome} /></Field>
            : <Field label="Description" className="span-2"><Textarea value={f.body} onChange={set('body')} /></Field>}
        </div>
        {f.contact_result === 'refus' && <Alert tone="warning">Le contact sera marqué en opposition et les relances automatiques le concernant seront annulées.</Alert>}
        <ErrorExplain error={save.error} />
      </div>
    </Modal>
  );
}
