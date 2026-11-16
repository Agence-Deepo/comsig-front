// Console de sécurité : agents de surveillance permanents, événements, adresses bloquées, intégrité du journal d'audit
import { useState } from 'react';
import { ShieldCheck, ShieldAlert, Ban, Play, Fingerprint, CheckCircle2, Lock, Radar, History, Archive } from 'lucide-react';
import { ExcelButton } from '../components/ExportButton';
import { useApi, useAction } from '../lib/hooks';
import { api, qs } from '../lib/api';
import { dateTime, relative } from '../lib/format';
import { Alert, Badge, Button, Card, DataTable, Empty, ErrorState, Field, Input, Kpi, LoadingBlock, Modal, PageHeader, Select, Tabs } from '../components/ui';
import { DonutChart, LineChart } from '../components/charts';

const SEV: Record<string, ['danger' | 'warning' | 'info', string]> = { critique: ['danger', 'Critique'], attention: ['warning', 'Attention'], info: ['info', 'Info'] };
const KIND: Record<string, string> = { force_brute: 'Force brute', bourrage: 'Bourrage d’identifiants', sondage_ip: 'Sondage (adresse)', sondage_compte: 'Sondage (compte)', export_massif: 'Exportations massives',
  privilege: 'Privilèges', sessions_multiples: 'Sessions multiples', hors_horaires: 'Hors horaires', journal_altere: 'Journal altéré', configuration: 'Configuration',
  injection_sql: 'Radar · injection SQL', script: 'Radar · script', traversee: 'Radar · traversée', commande: 'Radar · commande', gabarit: 'Radar · gabarit', sonde: 'Radar · sonde', outil: 'Radar · outil d’attaque', surdimension: 'Radar · requête anormale' };
const LOCATION: Record<string, string> = { adresse: 'adresse', 'en-tete': 'en-tête', corps: 'contenu envoyé' };
const OUTCOMES: Record<string, string> = { succes: 'Connexion réussie', echec: 'Mot de passe erroné', compte_inconnu: 'Identifiant inconnu', compte_verrouille: 'Compte verrouillé',
  compte_desactive: 'Compte désactivé', mfa_succes: 'Second facteur validé', mfa_echec: 'Second facteur refusé', deconnexion: 'Déconnexion', adresse_bloquee: 'Adresse bloquée', departement_refuse: 'Département refusé' };
const OUT_TONE: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'neutral'> = { succes: 'success', mfa_succes: 'success', deconnexion: 'neutral', echec: 'warning', compte_inconnu: 'warning', mfa_echec: 'warning', compte_verrouille: 'danger', compte_desactive: 'danger', adresse_bloquee: 'danger', departement_refuse: 'warning' };

/** Détections des radars anti-attaques (chaque requête suspecte, la riposte appliquée). */
function RadarView() {
  const r = useApi<any>(['security-radar'], '/api/security/radar', { refetchInterval: 30_000 });
  return (
    <Card flush title="Détections des radars" sub="Requêtes jamais exécutées : l’attaquant anonyme reçoit « introuvable » et son adresse est bloquée ; un collaborateur connecté reçoit un refus explicite">
      <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty icon={<Radar />} title="Aucune attaque détectée" />} columns={[
        { key: 'd', label: 'Quand', render: (h: any) => <span className="small">{dateTime(h.at)}</span> },
        { key: 'k', label: 'Nature', render: (h: any) => <><Badge tone={['injection_sql', 'commande', 'gabarit', 'outil', 'traversee'].includes(h.kind) ? 'danger' : 'warning'}>{KIND[h.kind] ?? h.kind}</Badge><div className="xsmall muted">{h.signature} · {LOCATION[h.location] ?? h.location}</div></> },
        { key: 's', label: 'Source', render: (h: any) => <span className="small"><code>{h.ip ?? '—'}</code>{h.user_name ? <div className="xsmall">{h.user_name}</div> : null}</span> },
        { key: 'p', label: 'Requête', mobile: 'hide', render: (h: any) => <span className="xsmall"><code>{h.method} {h.path}</code><div className="muted" style={{ wordBreak: 'break-all' }}>{h.sample}</div></span> },
        { key: 'r', label: 'Riposte', render: (h: any) => <Badge tone={h.response === 'esquive_404' ? 'info' : 'warning'}>{h.response === 'esquive_404' ? 'Esquivée' : 'Refusée'}</Badge> },
      ]} />
    </Card>
  );
}

/** Historique des connexions (administrateurs et super-administrateurs). */
function LoginsView() {
  const [f, setF] = useState<any>({ outcome: '', q: '', from: '', to: '' });
  const query = qs({ outcome: f.outcome || undefined, q: f.q || undefined, from: f.from || undefined, to: f.to || undefined });
  const r = useApi<any>(['security-logins', query], `/api/security/logins${query}`);
  const outcomes: Record<string, string> = { ...OUTCOMES, ...(r.data?.outcomes ?? {}) };
  return (
    <div className="stack-lg">
      {r.data?.stats && <div className="grid-4">
        <Kpi label="Connexions réussies (24 h)" value={String(r.data.stats.succes)} foot={`${r.data.stats.comptes} compte(s) · ${r.data.stats.adresses} adresse(s)`} />
        <Kpi label="Échecs (24 h)" value={String(r.data.stats.echecs)} foot="Mot de passe, identifiant ou second facteur" />
        <Kpi label="Refus (24 h)" value={String(r.data.stats.refus)} foot="Comptes verrouillés ou désactivés, adresses bloquées" />
        <Kpi label="Historique conservé" value={String(r.data.total)} foot="Lignes, en ajout seul (inaltérable)" />
      </div>}
      <Card flush title="Historique des connexions" sub="Toutes les tentatives, réussies ou non — consultation réservée et journalisée" actions={<ExcelButton url={`/api/xlsx/logins${query}`} />}>
        <div className="filter-bar">
          <Input aria-label="Rechercher" placeholder="Nom, identifiant ou adresse IP" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} style={{ maxWidth: 260 }} />
          <Select aria-label="Résultat" value={f.outcome} onChange={(e) => setF({ ...f, outcome: e.target.value })} placeholder="Tous les résultats" options={Object.entries(outcomes).map(([value, label]) => ({ value, label: label as string }))} />
          <Input aria-label="Du" type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
          <Input aria-label="Au" type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
        </div>
        {r.error ? <ErrorState error={r.error} /> : <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty icon={<History />} title="Aucune connexion pour ces critères" />} columns={[
          { key: 'd', label: 'Date et heure', render: (h: any) => <span className="small">{dateTime(h.at)}</span> },
          { key: 'u', label: 'Personne', render: (h: any) => <><div className="cell-title">{h.full_name || <span className="muted">Inconnu</span>}</div><div className="cell-sub">{h.identifier}{h.role_label ? ` · ${h.role_label}` : ''}</div></> },
          { key: 'o', label: 'Résultat', render: (h: any) => <><Badge tone={OUT_TONE[h.outcome] ?? 'neutral'}>{outcomes[h.outcome] ?? h.outcome}</Badge>{h.detail ? <div className="xsmall muted">{h.detail}</div> : null}</> },
          { key: 'i', label: 'Adresse', render: (h: any) => <code className="small">{h.ip ?? '—'}</code> },
          { key: 'a', label: 'Navigateur', mobile: 'hide', render: (h: any) => <span className="xsmall muted" style={{ wordBreak: 'break-word' }}>{h.user_agent}</span> },
        ]} />}
      </Card>
    </div>
  );
}

/** Archives mensuelles scellées de l'historique des connexions. */
function ArchivesView() {
  const r = useApi<any>(['security-archives'], '/api/security/login-archives');
  const [check, setCheck] = useState<any>(null);
  const run = useAction(() => api.post('/api/security/login-archives', {}), { success: (x: any) => (x.archived ? `${x.archived} mois archivé(s) et scellé(s)` : 'Aucun mois clos à archiver'), invalidate: [['security-archives']] });
  const verify = useAction((period: string) => api.get(`/api/security/login-archives/${period}`), { onSuccess: (x: any) => setCheck(x) });
  return (
    <Card flush title="Archives des connexions" sub="Chaque mois clos est scellé par une empreinte SHA-256 ; l’intégrité est recontrôlée à chaque vérification et téléchargement"
      actions={<Button size="sm" icon={<Archive />} loading={run.isPending} onClick={() => run.run(undefined)}>Archiver les mois clos</Button>}>
      {check?.integrity && check.archive && <div style={{ padding: '0 16px' }}><Alert tone={check.integrity.ok ? 'success' : 'danger'} title={`Archive ${check.archive.period} — ${check.integrity.ok ? 'intègre' : 'ALTÉRÉE'}`}>{check.archive.rows_count} ligne(s) · empreinte <code>{check.archive.sha256.slice(0, 16)}…</code></Alert></div>}
      <DataTable rows={r.data?.rows} loading={r.isLoading} empty={<Empty icon={<Archive />} title="Aucune archive">Les mois clos sont archivés automatiquement chaque jour.</Empty>} columns={[
        { key: 'p', label: 'Mois', render: (a: any) => <strong>{a.period}</strong> },
        { key: 'n', label: 'Connexions', num: true, render: (a: any) => a.rows_count },
        { key: 'h', label: 'Empreinte SHA-256', mobile: 'hide', render: (a: any) => <code className="xsmall">{a.sha256.slice(0, 24)}…</code> },
        { key: 'g', label: 'Scellée', render: (a: any) => <span className="small">{dateTime(a.generated_at)}<div className="xsmall muted">{a.generated_by_name ?? 'Archivage automatique'}</div></span> },
        { key: 'a', label: '', render: (a: any) => <span className="row-wrap"><Button size="sm" variant="ghost" onClick={() => verify.run(a.period)}>Vérifier</Button><ExcelButton url={`/api/xlsx/login-archives/${a.period}`} /></span> },
      ]} />
    </Card>
  );
}

export default function Security() {
  const o = useApi<any>(['security'], '/api/security/overview', { refetchInterval: 30_000 });
  const [tab, setTab] = useState<'open' | 'all'>('open');
  const [view, setView] = useState<string>('surveillance');
  const ev = useApi<any>(['security-events', tab], `/api/security/events${qs({ open: tab === 'open' ? 'true' : undefined })}`, { refetchInterval: 30_000 });
  const [blockForm, setBlockForm] = useState<any>(null);
  const inv = [['security'], ['security-events']];
  const run = useAction(() => api.post('/api/security/run', {}), { success: (r: any) => `Agents exécutés — ${r.findings} constat(s)`, invalidate: inv });
  const verify = useAction(() => api.post('/api/security/verify', {}), { success: (r: any) => (r.ok ? `Journal d’audit intègre (${r.checked} lignes vérifiées)` : `ALERTE : chaîne rompue à la position ${r.broken_at}`), invalidate: inv });
  const ack = useAction((id: number) => api.post(`/api/security/events/${id}/ack`, {}), { success: 'Événement pris en compte', invalidate: inv });
  const lift = useAction((ip: string) => api.del(`/api/security/blocks/${encodeURIComponent(ip)}`), { success: 'Blocage levé', invalidate: inv });
  const block = useAction((b: any) => api.post('/api/security/blocks', b), { success: 'Adresse bloquée', invalidate: inv, onSuccess: () => setBlockForm(null) });
  if (o.error) return <Card><ErrorState error={o.error} /></Card>;
  if (!o.data) return <Card><LoadingBlock rows={8} /></Card>;
  const d = o.data;
  return (
    <>
      <PageHeader title="Sécurité de la plateforme" subtitle="Radars sur chaque requête et agents de surveillance toutes les 30 secondes : détection, esquive, blocage des adresses en attaque, alertes aux administrateurs ; journal d’audit scellé"
        actions={d.can_act && <><Button icon={<Fingerprint />} loading={verify.isPending} onClick={() => verify.run(undefined)}>Vérifier le journal</Button><Button variant="primary" icon={<Play />} loading={run.isPending} onClick={() => run.run(undefined)}>Exécuter les agents</Button></>} />
      <Tabs value={view} onChange={setView} tabs={[{ id: 'surveillance', label: <><ShieldCheck aria-hidden /> Surveillance</> }, { id: 'radars', label: <><Radar aria-hidden /> Radars{d.radar?.day ? ` (${d.radar.day})` : ''}</> },
        ...(d.can_view_logins ? [{ id: 'connexions', label: <><History aria-hidden /> Historique des connexions</> }, { id: 'archives', label: <><Archive aria-hidden /> Archives</> }] : [])]} />
      {view === 'radars' && <RadarView />}
      {view === 'connexions' && d.can_view_logins && <LoginsView />}
      {view === 'archives' && d.can_view_logins && <ArchivesView />}
      {view === 'surveillance' && <div className="stack-lg">
      {d.counts.critical_day > 0 && <Alert tone="danger" title="Événements critiques dans les dernières 24 heures">{d.counts.critical_day} événement(s) critique(s) — examinez la liste ci-dessous.</Alert>}
      <div className="grid-5">
        <Kpi label="Événements à examiner" value={String(d.counts.open)} foot={`${d.counts.day} sur 24 h · ${d.counts.week} sur 7 jours`} />
        <Kpi label="Adresses bloquées" value={String(d.blocks.length)} foot="Par les agents ou un administrateur" />
        <Kpi label="Journal d’audit scellé" value={String(d.chain.sealed ?? 0)} foot={d.chain.unsealed ? `${d.chain.unsealed} ligne(s) en attente de scellement` : 'Toutes les lignes sont scellées'} />
        <Kpi label="Attaques détectées par les radars" value={String(d.radar?.day ?? 0)} foot={`24 h · ${d.radar?.sources ?? 0} source(s) · ${d.radar?.week ?? 0} sur 7 jours`} />
        <Kpi label="Agents actifs" value={`${d.agents.filter((a: any) => a.last_run && !a.last_error).length} / ${d.agents.length}`} foot={d.agents.some((a: any) => a.last_error) ? 'Un agent signale une erreur' : 'Aucune erreur'} />
      </div>
      <div className="grid-2">
        <Card title="Requêtes refusées sur 24 heures" sub="Réponses 401, 403, 404, 423 et 429 de l’API, par heure (heure d’Abidjan)">
          <LineChart labels={d.refusals.labels} series={[{ key: 'r', label: 'Refus', values: d.refusals.values }]} format={(n) => String(Math.round(n))} caption="Requêtes refusées par heure sur 24 heures" />
        </Card>
        <Card title="Événements par nature" sub="30 derniers jours">
          <DonutChart data={d.by_kind.map((k: any) => ({ key: k.key, label: KIND[k.key] ?? k.key, value: k.value }))} caption="Événements de sécurité par nature" centerLabel="événements" />
        </Card>
      </div>
      <Card title="Agents de surveillance" flush>
        <DataTable rows={d.agents} columns={[
          { key: 'l', label: 'Agent', render: (a: any) => <span className="small strong"><ShieldCheck size={14} className="ic-xs" /> {a.label}</span> },
          { key: 'r', label: 'Dernier passage', render: (a: any) => <span className="small">{a.last_run ? relative(a.last_run) : 'Jamais'}{a.last_ms != null ? ` · ${a.last_ms} ms` : ''}</span> },
          { key: 'f', label: 'Constats (cumul)', num: true, render: (a: any) => a.findings ?? 0 },
          { key: 'e', label: 'État', render: (a: any) => a.last_error ? <Badge tone="danger">{a.last_error}</Badge> : a.last_run ? <Badge tone="success">Actif</Badge> : <Badge>En attente</Badge> },
        ]} />
      </Card>
      <Card flush title={<Tabs value={tab} onChange={setTab} tabs={[{ id: 'open', label: 'À examiner' }, { id: 'all', label: 'Tous les événements' }]} />}>
        <DataTable rows={ev.data?.rows} loading={ev.isLoading} empty={<Empty icon={<CheckCircle2 />} title="Aucun événement à examiner" />} columns={[
          { key: 's', label: 'Niveau', render: (e: any) => <Badge tone={SEV[e.severity][0]}>{SEV[e.severity][1]}</Badge> },
          { key: 't', label: 'Événement', render: (e: any) => <><div className="cell-title">{e.title}</div><div className="cell-sub">{KIND[e.kind] ?? e.kind}{e.ip ? ` · ${e.ip}` : ''}{e.user_name ? ` · ${e.user_name}` : ''}{e.action_taken ? ` · ${e.action_taken}` : ''}</div></> },
          { key: 'd', label: 'Quand', render: (e: any) => <span className="small">{dateTime(e.at)}</span>, mobile: 'hide' },
          { key: 'a', label: '', render: (e: any) => e.acknowledged_at ? <span className="xsmall muted">Pris en compte par {e.acknowledged_by_name}</span> : d.can_act && e.severity !== 'info' ? <Button size="sm" onClick={() => ack.run(e.id)}>Pris en compte</Button> : null },
        ]} />
      </Card>
      <Card title="Adresses bloquées" flush actions={d.can_act && <Button size="sm" icon={<Ban />} onClick={() => setBlockForm({ ip: '', reason: '', minutes: 60 })}>Bloquer une adresse</Button>}>
        <DataTable rows={d.blocks} empty={<Empty icon={<Lock />} title="Aucune adresse bloquée" />} columns={[
          { key: 'ip', label: 'Adresse', render: (b: any) => <code>{b.ip}</code> },
          { key: 'r', label: 'Motif', render: (b: any) => <span className="small">{b.reason}<div className="xsmall muted">{b.created_by_name ? `Par ${b.created_by_name}` : 'Par un agent de surveillance'} · {relative(b.blocked_at)}</div></span> },
          { key: 'u', label: 'Jusqu’à', render: (b: any) => <span className="small">{b.until ? dateTime(b.until) : 'Levée manuelle'}</span> },
          { key: 'a', label: '', render: (b: any) => d.can_act ? <Button size="sm" variant="ghost" onClick={() => lift.run(b.ip)}>Lever</Button> : null },
        ]} />
      </Card>
      <Card title={<><ShieldAlert size={16} /> Protections en place</>}>
        <ul className="small stack-sm" style={{ margin: 0, paddingLeft: 18 }}>{d.protections.map((p: string) => <li key={p}>{p}</li>)}</ul>
        <p className="xsmall muted" style={{ marginTop: 10 }}>Aucun système n’est invulnérable : ces mesures réduisent fortement les risques et rendent toute tentative visible. Les mises à jour de sécurité, les sauvegardes testées et un audit externe périodique restent nécessaires.</p>
      </Card>
      </div>}
      <Modal open={!!blockForm} onClose={() => setBlockForm(null)} title="Bloquer une adresse IP"
        footer={<><Button onClick={() => setBlockForm(null)}>Annuler</Button><Button variant="danger" loading={block.isPending} onClick={() => block.run({ ...blockForm, minutes: blockForm.minutes || null })}>Bloquer</Button></>}>
        {blockForm && <div className="form-grid">
          <Field label="Adresse IP" required error={block.fieldErrors.ip}><Input value={blockForm.ip} onChange={(e) => setBlockForm({ ...blockForm, ip: e.target.value.trim() })} placeholder="203.0.113.10" /></Field>
          <Field label="Durée (minutes)" hint="Vide : jusqu’à levée manuelle"><Input type="number" min={1} value={blockForm.minutes ?? ''} onChange={(e) => setBlockForm({ ...blockForm, minutes: e.target.value ? Number(e.target.value) : null })} /></Field>
          <Field label="Motif" required className="span-2" error={block.fieldErrors.reason}><Input value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} /></Field>
          {block.error && !Object.keys(block.fieldErrors).length && <div className="span-2"><Alert tone="danger">{block.error.message}</Alert></div>}
        </div>}
      </Modal>
    </>
  );
}
