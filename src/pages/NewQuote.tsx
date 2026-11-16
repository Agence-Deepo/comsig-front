import { PriceBasis } from '../components/PriceBasis';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, Calculator, FileText, Package, Plus, Trash2, Wrench } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { addDays, money, pct, today } from '../lib/format';
import { STOCK_KIND } from '../lib/labels';
import { Alert, Badge, Button, Card, Empty, Field, Input, PageHeader, Segmented, Select, Textarea } from '../components/ui';

interface Line { key: string; source: 'stock' | 'catalogue' | 'cout'; stock_item_id?: string; cost_basis?: string | null; purchase_price_id?: string | null; catalog_item_id?: string; label: string; unit: string; quantity: number; duration: number; unit_price: number; unit_cost?: number; markup_pct?: number | null; discount_pct: number }

let seq = 0;
const k = () => `l${++seq}`;

/**
 * Nouveau devis / facture proforma : client existant ou nouveau, lignes chiffrées au prix d'achat des matériaux
 * (prix moyen ou coût de nomenclature d'un support fabriqué) et au coût des prestations, taux de marge du client modifiable.
 * Le calcul affiché est celui du moteur officiel (simulation serveur), jamais un calcul local.
 */
export default function NewQuote() {
  const nav = useNavigate();
  const { me } = useAuth();
  const [mode, setMode] = useState<'existant' | 'nouveau'>('existant');
  const [term, setTerm] = useState('');
  const [orgId, setOrgId] = useState('');
  const [client, setClient] = useState<any>({ legal_name: '', resource_person: '', resource_title: '', commune: '', phone: '', email: '' });
  const [contact, setContact] = useState<any>({ contact_id: '', last_name: '', first_name: '', email: '', phone: '' });
  const [opp, setOpp] = useState('');
  const [head, setHead] = useState({ title: '', doc_type: 'devis', offer_type: me?.department_code === 'regie' ? 'affichage' : 'signaletique', valid_until: addDays(today(), 30), payment_terms: '', conditions: '' });
  const [lines, setLines] = useState<Line[]>([]);
  const [markup, setMarkup] = useState<number | null>(null);
  const clients = useApi<{ rows: any[] }>(['nq-clients', term], `/api/quotes/new/clients?q=${encodeURIComponent(term)}`);
  const ctx = useApi<any>(['nq-ctx', orgId], mode === 'existant' && orgId ? `/api/quotes/new/context?organization_id=${orgId}` : null);
  const costs = useApi<any>(['nq-costs'], '/api/quotes/new/costs');
  const clientRate: number | null = mode === 'existant' ? ctx.data?.pricing?.markup_pct ?? null : costs.data?.default_markup_pct ?? null;
  useEffect(() => { if (clientRate !== null) setMarkup(clientRate); }, [clientRate]);
  useEffect(() => { setOpp(''); setContact((c: any) => ({ ...c, contact_id: '' })); }, [orgId]);

  // Simulation officielle (debounce)
  const payload = useMemo(() => lines.map((l) => ({
    stock_item_id: l.stock_item_id ?? null, catalog_item_id: l.catalog_item_id ?? null, label: l.label || 'Ligne', unit: l.unit || 'u', quantity: l.quantity || 1, duration: l.duration || 1,
    unit_price: l.source === 'catalogue' ? l.unit_price : 0, discount_pct: l.discount_pct || 0,
    ...(l.source === 'cout' ? { unit_cost: l.unit_cost ?? 0 } : {}),
    markup_pct: l.source === 'catalogue' ? null : l.markup_pct ?? markup ?? 0,
    ...(l.source === 'stock' ? { cost_basis: l.cost_basis ?? 'cump', purchase_price_id: l.purchase_price_id ?? null } : {}),
  })), [lines, markup]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [sim, setSim] = useState<any>(null);
  const [simErr, setSimErr] = useState<string>('');
  useEffect(() => {
    if (!payload.length) { setSim(null); return; }
    const t = setTimeout(() => { api.post('/api/quotes/simulate', { lines: payload, global_discount_pct: globalDiscount }).then((r) => { setSim(r); setSimErr(''); }).catch((e) => setSimErr(e.message)); }, 300);
    return () => clearTimeout(t);
  }, [JSON.stringify(payload), globalDiscount]);

  const add = (l: Partial<Line>) => setLines((x) => [...x, { key: k(), label: '', unit: 'u', quantity: 1, duration: 1, unit_price: 0, discount_pct: 0, source: 'cout', ...l } as Line]);
  const upd = (key: string, p: Partial<Line>) => setLines((x) => x.map((l) => (l.key === key ? { ...l, ...p } : l)));
  const create = useAction((b: any) => api.post('/api/quotes/new', b), {
    success: (r: any) => (r.submitted ? (r.approval_required ? 'Devis créé et soumis à validation' : 'Devis créé et validé (écriture comptable générée)') : 'Brouillon créé'),
    invalidate: [['quotes']], onSuccess: (r: any) => nav(`/devis/${r.quote.id}`),
  });
  const submit = (submitNow: boolean) => create.run({
    organization_id: mode === 'existant' ? orgId || null : null,
    new_client: mode === 'nouveau' ? { legal_name: client.legal_name, resource_person: client.resource_person || null, resource_title: client.resource_title || null, commune: client.commune || null, phone: client.phone || null, email: client.email || null } : undefined,
    contact_id: contact.contact_id || null,
    new_contact: !contact.contact_id && contact.last_name ? { last_name: contact.last_name, first_name: contact.first_name, email: contact.email || null, phone: contact.phone || null } : undefined,
    opportunity_id: opp || null, title: head.title, doc_type: head.doc_type, offer_type: head.offer_type, valid_until: head.valid_until || null,
    payment_terms: head.payment_terms || null, conditions: head.conditions || null, lines: payload, global_discount_pct: globalDiscount, submit: submitNow,
  });
  const clientOk = mode === 'existant' ? !!orgId : !!client.legal_name.trim();
  const items = costs.data?.items ?? [];
  const services = costs.data?.services ?? [];
  const t = sim?.totals;
  return (
    <>
      <PageHeader title="Nouveau devis" subtitle="Chiffrez au prix d’achat des matériaux et des prestations, appliquez le taux du client, obtenez la marge et la validation requise"
        crumbs={[{ label: 'Devis et proformas', to: '/devis' }, { label: 'Nouveau' }]} />
      <div className="split nq">
        <div className="stack-lg">
          <Card title="1. Client" sub="Client existant de votre service, ou nouveau client créé comme prospect">
            <Segmented label="Client" value={mode} onChange={setMode} options={[{ id: 'existant', label: 'Client existant' }, { id: 'nouveau', label: 'Nouveau client' }]} />
            {mode === 'existant' ? (
              <div className="form-grid">
                <Field label="Rechercher"><Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Raison sociale…" /></Field>
                <Field label="Client" required><Select value={orgId} onChange={(e) => setOrgId(e.target.value)} placeholder="Choisir…" options={(clients.data?.rows ?? []).map((o) => ({ value: o.id, label: o.legal_name }))} /></Field>
                {ctx.data && <>
                  <Field label="Opportunité" hint="À défaut, une opportunité est créée automatiquement"><Select value={opp} onChange={(e) => setOpp(e.target.value)} placeholder="Nouvelle opportunité" options={ctx.data.opportunities.map((o: any) => ({ value: o.id, label: `${o.ref} — ${o.title} (${o.stage_label})` }))} /></Field>
                  <Field label="Interlocuteur"><Select value={contact.contact_id} onChange={(e) => setContact({ ...contact, contact_id: e.target.value })} placeholder="Nouveau contact…" options={ctx.data.contacts.map((c: any) => ({ value: c.id, label: `${c.name}${c.job_title ? ` · ${c.job_title}` : ''}` }))} /></Field>
                </>}
              </div>
            ) : (
              <div className="form-grid">
                <Field label="Raison sociale" required className="span-2" error={create.fieldErrors['new_client.legal_name']}><Input value={client.legal_name} onChange={(e) => setClient({ ...client, legal_name: e.target.value })} /></Field>
                <Field label="Personne ressource (interlocuteur)" hint="Facultatif" error={create.fieldErrors['new_client.resource_person']}><Input value={client.resource_person} onChange={(e) => setClient({ ...client, resource_person: e.target.value })} placeholder="Prénom et nom" /></Field>
                <Field label="Fonction occupée" hint="Facultatif" error={create.fieldErrors['new_client.resource_title']}><Input value={client.resource_title} onChange={(e) => setClient({ ...client, resource_title: e.target.value })} /></Field>
                <Field label="Téléphone" error={create.fieldErrors['new_client.phone']}><Input value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} /></Field>
                <Field label="E-mail" error={create.fieldErrors['new_client.email']}><Input value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} /></Field>
              </div>
            )}
            {!contact.contact_id && (mode === 'nouveau' || ctx.data) && (
              <div className="form-grid">
                <Field label="Nom de l’interlocuteur" hint="Obligatoire pour soumettre le devis" error={create.fieldErrors['new_contact.last_name']}><Input value={contact.last_name} onChange={(e) => setContact({ ...contact, last_name: e.target.value })} /></Field>
                <Field label="Prénom"><Input value={contact.first_name} onChange={(e) => setContact({ ...contact, first_name: e.target.value })} /></Field>
                <Field label="E-mail" error={create.fieldErrors['new_contact.email']}><Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></Field>
                <Field label="Téléphone" error={create.fieldErrors['new_contact.phone']}><Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></Field>
              </div>
            )}
          </Card>

          <Card title="2. Chiffrage" sub="Matériaux et supports au prix d’achat (stock), prestations au coût ou au tarif du catalogue"
            actions={<div className="row-wrap">
              <Button size="sm" icon={<Boxes />} disabled={!items.length} onClick={() => add({ source: 'stock', stock_item_id: items[0]?.id, label: items[0]?.label, unit: items[0]?.unit })}>Matériau / support</Button>
              <Button size="sm" icon={<Wrench />} onClick={() => add({ source: 'cout', label: '', unit: 'forfait', unit_cost: 0 })}>Prestation au coût</Button>
              <Button size="sm" icon={<Package />} disabled={!services.length} onClick={() => add({ source: 'catalogue', catalog_item_id: services[0]?.id, label: services[0]?.label, unit: services[0]?.unit, unit_price: services[0]?.unit_price })}>Prestation catalogue</Button>
            </div>}>
            <div className="nq-rate">
              <Calculator aria-hidden />
              <div className="spacer"><strong>Taux de marge du client</strong><div className="xsmall muted">{mode === 'existant' ? (ctx.data ? `Catégorie « ${ctx.data.pricing.tier} »${ctx.data.pricing.source === 'client' ? ' — taux propre au client' : ''} : ${pct(ctx.data.pricing.markup_pct)}` : 'Choisissez un client') : `Nouveau client : taux de la catégorie standard (${pct(costs.data?.default_markup_pct)})`}. Appliqué au coût de revient ; modifiable pour ce devis (au-delà des seuils, la validation est demandée).</div></div>
              <Input type="number" min={0} max={500} step="0.5" aria-label="Taux appliqué (%)" className="nq-rate-input" value={markup ?? ''} onChange={(e) => setMarkup(e.target.value === '' ? null : Number(e.target.value))} /><span>%</span>
            </div>
            {!lines.length ? <Empty icon={<FileText />} title="Aucune ligne">Ajoutez les matériaux (bâche, structure, panneau fabriqué…) et les prestations (pose, transport, création…).</Empty> : (
              <div className="nq-lines">
                {lines.map((l, i) => {
                  const r = sim?.lines?.[i];
                  return (
                    <div key={l.key} className={`nq-line src-${l.source}`}>
                      <div className="nq-line-head">
                        <Badge tone={l.source === 'stock' ? 'accent' : l.source === 'cout' ? 'warning' : 'info'}>{l.source === 'stock' ? 'Matériau / support' : l.source === 'cout' ? 'Prestation au coût' : 'Catalogue'}</Badge>
                        <Button size="sm" variant="ghost" iconOnly icon={<Trash2 />} aria-label="Retirer la ligne" onClick={() => setLines((x) => x.filter((y) => y.key !== l.key))} />
                      </div>
                      <div className="nq-grid">
                        {l.source === 'stock' && <Field label="Article" className="span-2"><Select value={l.stock_item_id} onChange={(e) => { const it = items.find((x: any) => x.id === e.target.value); upd(l.key, { stock_item_id: e.target.value, label: it?.label, unit: it?.unit }); }} options={items.map((x: any) => ({ value: x.id, label: `${x.label} — ${STOCK_KIND[x.kind]}${x.bom_lines ? ' (nomenclature)' : ''}` }))} /></Field>}
                        {l.source === 'catalogue' && <Field label="Prestation" className="span-2"><Select value={l.catalog_item_id} onChange={(e) => { const it = services.find((x: any) => x.id === e.target.value); upd(l.key, { catalog_item_id: e.target.value, label: it?.label, unit: it?.unit, unit_price: it?.unit_price }); }} options={services.map((x: any) => ({ value: x.id, label: `${x.label} — ${money(x.unit_price)}/${x.unit}` }))} /></Field>}
                        {l.source !== 'catalogue' && <Field label="Libellé sur le devis" className="span-2"><Input value={l.label} onChange={(e) => upd(l.key, { label: e.target.value })} /></Field>}
                        {l.source === 'cout' && <Field label="Coût unitaire (FCFA)"><Input type="number" min={0} value={l.unit_cost ?? 0} onChange={(e) => upd(l.key, { unit_cost: Number(e.target.value) })} /></Field>}
                        <Field label="Quantité"><Input type="number" min={0} step="any" value={l.quantity} onChange={(e) => upd(l.key, { quantity: Number(e.target.value) })} /></Field>
                        <Field label="Unité"><Input value={l.unit} onChange={(e) => upd(l.key, { unit: e.target.value })} disabled={l.source !== 'cout'} /></Field>
                        {l.source === 'stock' && l.stock_item_id && <Field label="Prix d’achat retenu" className="span-2" hint="Coût moyen, dernier achat ou tarif d’un fournisseur"><PriceBasis itemId={l.stock_item_id} basis={l.cost_basis} priceId={l.purchase_price_id} onChange={(v) => upd(l.key, v)} /></Field>}
                        {l.source !== 'catalogue' && <Field label="Taux (%)" hint={l.markup_pct == null ? 'Taux du client' : 'Taux spécifique'}><Input type="number" min={0} max={500} value={l.markup_pct ?? markup ?? ''} onChange={(e) => upd(l.key, { markup_pct: e.target.value === '' ? null : Number(e.target.value) })} /></Field>}
                        <Field label="Remise (%)" hint="Figure sur la proforma"><Input type="number" min={0} max={100} step="0.5" value={l.discount_pct} onChange={(e) => upd(l.key, { discount_pct: Number(e.target.value) })} /></Field>
                      </div>
                      {r && <div className="nq-calc small">
                        <span>Coût unitaire <strong>{money(r.unit_cost)}</strong>{r.cost_source ? <span className="muted"> ({r.cost_source})</span> : null}</span>
                        <span>Prix unitaire <strong>{money(r.unit_price)}</strong></span>
                        <span>Total HT <strong>{money(r.line_ht)}</strong></span>
                        <span>Marge <strong>{money(r.line_ht - r.line_cost)}</strong></span>
                      </div>}
                    </div>
                  );
                })}
              </div>
            )}
            {simErr && <Alert tone="warning">{simErr}</Alert>}
          </Card>

          <Card title="3. Document">
            <div className="form-grid">
              <Field label="Intitulé" required className="span-2" error={create.fieldErrors.title}><Input value={head.title} onChange={(e) => setHead({ ...head, title: e.target.value })} placeholder="Ex. Fabrication et pose de 2 panneaux 4×3" /></Field>
              <Field label="Type de document"><Segmented label="Type" value={head.doc_type} onChange={(v) => setHead({ ...head, doc_type: v })} options={[{ id: 'devis', label: 'Devis' }, { id: 'proforma', label: 'Facture proforma' }]} /></Field>
              <Field label="Validité jusqu’au"><Input type="date" value={head.valid_until} onChange={(e) => setHead({ ...head, valid_until: e.target.value })} /></Field>
              <Field label="Conditions de paiement" className="span-2"><Input value={head.payment_terms} onChange={(e) => setHead({ ...head, payment_terms: e.target.value })} placeholder="50 % à la commande, solde à la pose" /></Field>
              <Field label="Conditions particulières" className="span-2"><Textarea value={head.conditions} onChange={(e) => setHead({ ...head, conditions: e.target.value })} /></Field>
            </div>
          </Card>
        </div>

        <div className="nq-side">
          <Card title="Synthèse" sub="Calcul du moteur officiel">
            {t ? <dl className="nq-totals">
              <dt>Coût de revient</dt><dd>{money(t.total_cost)}</dd>
              <dt>Sous-total brut HT</dt><dd>{money(t.subtotal_ht)}</dd>
              <dt>Remises (lignes et globale)</dt><dd>{t.discount_total ? `− ${money(t.discount_total)}` : '—'}</dd>
              <dt>Total HT</dt><dd>{money(t.total_ht)}</dd>
              <dt>TVA</dt><dd>{money(t.total_tax)}</dd>
              <dt className="strong">Total TTC</dt><dd className="strong">{money(t.total_ttc)}</dd>
              <dt>Marge</dt><dd><span className={t.margin_pct < 15 ? 'text-danger strong' : t.margin_pct < 30 ? 'strong' : 'text-success strong'}>{money(t.margin_amount)} · {pct(t.margin_pct)}</span></dd>
            </dl> : <p className="small muted">Ajoutez des lignes pour voir le calcul.</p>}
            <Field label="Remise globale (%)" hint="Appliquée après les remises de ligne ; détaillée sur la proforma"><Input type="number" min={0} max={100} step="0.5" value={globalDiscount} onChange={(e) => setGlobalDiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} /></Field>
            {sim?.approval?.reasons?.length ? <Alert tone="warning" title="Validation requise">{sim.approval.reasons.map((r: any) => <div key={r.reason} className="small">{r.reason}</div>)}</Alert>
              : t ? <Alert tone="success">Dans les seuils : validé dès la soumission, puis comptabilisé automatiquement.</Alert> : null}
            <div className="stack">
              <Button variant="primary" icon={<Plus />} loading={create.isPending} disabled={!clientOk || !head.title.trim() || !lines.length} onClick={() => submit(true)}>Créer et soumettre</Button>
              <Button loading={create.isPending} disabled={!clientOk || !head.title.trim() || !lines.length} onClick={() => submit(false)}>Enregistrer en brouillon</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
