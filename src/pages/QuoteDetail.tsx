// Éditeur de proposition : catalogue + inventaire, calcul officiel en direct, validations, envoi, versions, conversion
import { PriceBasis } from '../components/PriceBasis';
import { DocButton, ExcelButton } from '../components/ExportButton';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Copy, FileSignature, Map as MapIcon, Send, ShieldAlert, Trash2, XCircle, Ban, PackagePlus, PenLine, Sparkles, Lock } from 'lucide-react';
import { useApi, useAction } from '../lib/hooks';
import { useToast } from '../lib/toast';
import { api } from '../lib/api';
import { useCan, useLookups } from '../lib/auth';
import { addDays, date, dateTime, money, pct, today } from '../lib/format';
import { Alert, Badge, Button, Card, ConfirmModal, Dl, Empty, ErrorState, Field, Input, LoadingBlock, Modal, PageHeader, Select, Status, Textarea } from '../components/ui';
import { useAiPanel } from '../components/Layout';

interface Line { catalog_item_id?: string | null; support_face_id?: string | null; stock_item_id?: string | null; markup_pct?: number | null; cost_basis?: string | null; purchase_price_id?: string | null; label: string; unit: string; quantity: number; duration: number; unit_price: number; discount_pct: number; unit_cost?: number; _support?: string; _stock?: string; _qty?: number }

function FacePicker({ open, onClose, from, to, onPick }: { open: boolean; onClose: () => void; from?: string | null; to?: string | null; onPick: (f: any, s: any) => void }) {
  const { lookups, label } = useLookups();
  const [commune, setCommune] = useState('');
  const [type, setType] = useState('');
  const r = useApi<any>(['faces-pick', from, to, commune, type], open ? `/api/supports?from=${from ?? today()}&to=${to ?? from ?? today()}&commune=${commune}&type=${type}` : null);
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Ajouter des faces de supports" description={from ? `Disponibilité calculée du ${date(from)} au ${date(to)} à partir des réservations du CRM.` : 'Renseignez la période de campagne pour vérifier la disponibilité réelle.'}>
      <div className="stack">
        <div className="filter-bar">
          <Select aria-label="Commune" value={commune} onChange={(e) => setCommune(e.target.value)} placeholder="Toutes communes" options={(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label }))} />
          <Select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} placeholder="Tous types" options={(lookups.support_type ?? []).map((x) => ({ value: x.code, label: x.label }))} />
        </div>
        {r.isLoading ? <LoadingBlock /> : (
          <div className="list" style={{ border: '1px solid var(--border)', borderRadius: 8, maxHeight: 420, overflowY: 'auto' }}>
            {(r.data?.rows ?? []).map((s: any) => (
              <div key={s.id} className="list-item" style={{ padding: '10px 12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}><div className="small strong">{s.code} — {s.name}</div><div className="xsmall muted">{label('support_type', s.type)} · {label('commune', s.commune)} · {s.format}</div></div>
                <div className="row-wrap" style={{ justifyContent: 'flex-end' }}>
                  {s.faces.map((f: any) => (
                    <Button key={f.id} size="sm" variant={f.state === 'disponible' ? 'soft' : 'ghost'} disabled={f.state !== 'disponible'} onClick={() => onPick(f, s)} title={f.state}>
                      Face {f.code} · {money(f.monthly_rate)}{f.state !== 'disponible' && <Status kind="face" code={f.state} />}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function QuoteDetail() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const can = useCan();
  const ai = useAiPanel();
  const isNew = id === 'nouveau' || id === undefined;
  const oppId = sp.get('opportunity');
  const r = useApi<any>(['quote', id], isNew ? null : `/api/quotes/${id}`);
  const opp = useApi<any>(['opp', oppId], isNew && oppId ? `/api/opportunities/${oppId}` : null);
  const catalog = useApi<any>(['catalog'], '/api/catalog');
  const stockItems = useApi<any>(['stock-items', 'quote'], can('stocks') ? '/api/stocks/items' : null);
  const [head, setHead] = useState<any>({ title: '', contact_id: '', valid_until: addDays(today(), 30), campaign_start: '', campaign_end: '', payment_terms: '50 % à la commande, solde à la pose', conditions: '', notes_internal: '', doc_type: sp.get('type') === 'proforma' ? 'proforma' : 'devis' });
  const [lines, setLines] = useState<Line[]>([]);
  const [sim, setSim] = useState<any>(null);
  const [picker, setPicker] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState('');
  const [dirty, setDirty] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // Initialisation
  useEffect(() => {
    if (r.data) {
      const q = r.data.quote;
      setHead({ title: q.title, contact_id: q.contact_id ?? '', valid_until: q.valid_until, campaign_start: q.campaign_start ?? '', campaign_end: q.campaign_end ?? '', payment_terms: q.payment_terms, conditions: q.conditions ?? '', notes_internal: q.notes_internal ?? '', doc_type: q.doc_type });
      setLines(r.data.lines.map((l: any) => ({ catalog_item_id: l.catalog_item_id, support_face_id: l.support_face_id, stock_item_id: l.stock_item_id, markup_pct: l.markup_pct, cost_basis: l.cost_basis, purchase_price_id: l.purchase_price_id, label: l.label, unit: l.unit, quantity: Number(l.quantity), duration: Number(l.duration), unit_price: l.unit_price, discount_pct: Number(l.discount_pct), unit_cost: l.unit_cost ?? undefined, _support: l.support_code ? `${l.support_code}-${l.face_code}` : undefined, _stock: l.stock_code ?? undefined, _qty: l.stock_qty ?? undefined })));
      setGlobalDiscount(Number(q.global_discount_pct ?? 0));
      setSentTo(r.data.contact ? `${r.data.contact.first_name} ${r.data.contact.last_name}${r.data.contact.email ? ` <${r.data.contact.email}>` : ''}` : '');
      setDirty(false);
    }
  }, [r.data]);
  useEffect(() => { if (isNew && opp.data) setHead((h: any) => ({ ...h, title: opp.data.opportunity.title, contact_id: opp.data.opportunity.primary_contact_id ?? '' })); }, [opp.data]);

  // Simulation par le moteur officiel du CRM (aucun calcul côté navigateur)
  const strip = (l: Line) => { const { _support, _stock, _qty, ...rest } = l; return rest; };
  const simLines = JSON.stringify(lines.map(strip)) + globalDiscount;
  const [simError, setSimError] = useState<string | null>(null);
  useEffect(() => {
    if (!lines.length) { setSim(null); setSimError(null); return; }
    const t = setTimeout(() => api.post('/api/quotes/simulate', { lines: lines.map(strip), global_discount_pct: globalDiscount }).then((x) => { setSim(x); setSimError(null); }).catch((e) => { setSim(null); setSimError(e.message); }), 350);
    return () => clearTimeout(t);
  }, [simLines]);

  const q = r.data?.quote;
  const toast = useToast();
  const editable = isNew || q?.status === 'brouillon';
  const canEdit = editable && can(isNew ? 'quotes' : 'quotes', isNew ? 'create' : 'update');
  const body = () => ({ ...Object.fromEntries(Object.entries(head).map(([k, v]) => [k, v === '' ? null : v])), lines: lines.map(strip), global_discount_pct: globalDiscount });
  const create = useAction(() => api.post('/api/quotes', { ...body(), opportunity_id: oppId }), { success: (x: any) => `Proposition ${x.number} créée`, onSuccess: (x: any) => nav(`/devis/${x.id}`, { replace: true }), invalidate: [['quotes'], ['opp']] });
  const save = useAction(() => api.patch(`/api/quotes/${id}`, body()), { success: 'Proposition enregistrée', invalidate: [['quote', id], ['quotes']], onSuccess: () => setDirty(false) });
  const submit = useAction(async () => { if (dirty) await api.patch(`/api/quotes/${id}`, body()); return api.post(`/api/quotes/${id}/submit`); }, { success: (x: any) => (x.approval_required ? 'Proposition soumise à validation' : 'Proposition validée (dans les seuils)'), invalidate: [['quote', id], ['quotes'], ['approvals-count']] });
  const send = useAction(() => api.post(`/api/quotes/${id}/send`, { sent_to: sentTo }), { success: 'Envoi consigné — une relance est programmée', invalidate: [['quote', id], ['quotes']], onSuccess: () => setModal(null) });
  const decide = useAction((v: { decision: string; reason?: string }) => api.post(`/api/quotes/${id}/decision`, { decision: v.decision, reason: v.reason || null }), { success: (x: any) => (x.status === 'accepte' ? 'Acceptation du client consignée' : 'Refus consigné'), invalidate: [['quote', id], ['quotes'], ['opp']], onSuccess: () => setModal(null) });
  const version = useAction(() => api.post(`/api/quotes/${id}/version`), { success: (x: any) => `Version ${x.version} créée`, onSuccess: (x: any) => nav(`/devis/${x.id}`) });
  const cancel = useAction(() => api.post(`/api/quotes/${id}/cancel`), { success: 'Proposition annulée', invalidate: [['quote', id]], onSuccess: () => setModal(null) });
  const toContract = useAction(() => api.post(`/api/contracts/from-quote/${id}`), { success: (x: any) => `Contrat ${x.ref} créé sans ressaisie`, onSuccess: (x: any) => nav(`/contrats/${x.id}`) });

  const catOptions = useMemo(() => (catalog.data?.rows ?? []).filter((c: any) => c.category !== 'location_support' || true).map((c: any) => ({ value: c.id, label: `${c.code} — ${c.label} (${money(c.unit_price)} / ${c.unit})` })), [catalog.data]);
  const addCatalog = (cid: string) => {
    const c = catalog.data.rows.find((x: any) => x.id === cid);
    if (!c) return;
    const months = head.campaign_start && head.campaign_end ? Math.max(1, Math.round((Date.parse(head.campaign_end) - Date.parse(head.campaign_start)) / (30 * 86400000))) : 1;
    setLines([...lines, { catalog_item_id: c.id, label: c.label, unit: c.unit, quantity: 1, duration: c.unit.includes('mois') ? months : 1, unit_price: c.unit_price, discount_pct: 0 }]); setDirty(true);
  };
  const addFace = (f: any, s: any) => {
    const loc = (catalog.data?.rows ?? []).find((c: any) => c.category === 'location_support' && ((s.type === 'panneau_12x4' && c.code === 'LOC-12X4') || (s.type === 'panneau_4x3' && c.code === 'LOC-4X3') || (s.type === 'ecran_led' && c.code === 'LOC-LED') || (s.type === 'abribus' && c.code === 'LOC-ABRI')));
    const months = head.campaign_start && head.campaign_end ? Math.max(1, Math.round((Date.parse(head.campaign_end) - Date.parse(head.campaign_start)) / (30 * 86400000))) : 1;
    setLines([...lines, { catalog_item_id: loc?.id ?? null, support_face_id: f.id, label: `${loc?.label ?? 'Location face'} — ${s.code}-${f.code} (${s.name})`, unit: loc?.unit ?? 'face/mois', quantity: 1, duration: months, unit_price: loc?.unit_price ?? f.monthly_rate, discount_pct: 0, _support: `${s.code}-${f.code}` }]);
    setDirty(true); setPicker(false);
  };
  const upd = (i: number, k: keyof Line, v: any) => { const n = [...lines]; (n[i] as any)[k] = v; setLines(n); setDirty(true); };
  // Taux de marge du client (catégorie tarifaire ou taux propre), appliqué par défaut aux lignes chiffrées au coût
  const orgIdForPricing = isNew ? opp.data?.organization?.id : null;
  const newPricing = useApi<any>(['org-pricing', orgIdForPricing], orgIdForPricing ? `/api/organizations/${orgIdForPricing}/pricing` : null);
  const pricing = isNew ? newPricing.data : r.data?.pricing;
  const rate = pricing?.markup_pct ?? 0;
  const stockOptions = useMemo(() => (stockItems.data?.rows ?? []).filter((x: any) => x.is_active).map((x: any) => ({ value: x.id, label: `${x.code} — ${x.label} (${Number(x.qty_on_hand)} ${x.unit} en stock)` })), [stockItems.data]);
  const addStock = (sid: string) => {
    const x = stockItems.data?.rows.find((y: any) => y.id === sid);
    if (!x) return;
    setLines([...lines, { stock_item_id: x.id, label: x.label, unit: x.unit, quantity: 1, duration: 1, unit_price: 0, discount_pct: 0, markup_pct: rate, _stock: x.code, _qty: Number(x.qty_on_hand) }]); setDirty(true);
  };
  const applyRate = () => { setLines(lines.map((l) => (l.markup_pct !== null && l.markup_pct !== undefined ? { ...l, markup_pct: rate } : l))); setDirty(true); };

  if (!isNew && r.isLoading) return <Card><LoadingBlock rows={8} /></Card>;
  if (!isNew && r.error) return <Card><ErrorState error={r.error} /></Card>;
  if (isNew && !oppId) return <Card><Empty title="Choisissez une opportunité">Une proposition se prépare toujours depuis une opportunité : ouvrez l’opportunité puis « Préparer une proposition ».</Empty></Card>;
  const org = isNew ? opp.data?.organization : r.data?.organization;
  const contacts = isNew ? opp.data?.contacts ?? [] : null;
  const totals = sim?.totals ?? (q ? { subtotal_ht: q.subtotal_ht, discount_total: q.discount_total, total_ht: q.total_ht, total_tax: q.total_tax, total_ttc: q.total_ttc, total_cost: q.total_cost, margin_amount: q.margin_amount, margin_pct: q.margin_pct } : null);
  const reasons: any[] = sim?.approval?.reasons ?? (q?.approval_reasons ?? []).map((x: string) => ({ reason: x }));
  const fe = { ...create.fieldErrors, ...save.fieldErrors };
  const showCost = q ? q.margin_pct !== null : true;
  // Gouvernance : au-delà du seuil, document verrouillé (ni téléchargement, ni copie, ni envoi) tant que le directeur général n'a pas approuvé
  const gov = r.data?.governance;
  const locked = !isNew && !!gov?.locked;
  const block = (e: { preventDefault: () => void }) => { e.preventDefault(); toast('error', 'Document verrouillé', 'Copie interdite avant l’approbation du directeur général.'); };

  return (
    <>
      <PageHeader crumbs={[{ label: 'Devis et propositions', to: '/devis' }, { label: isNew ? 'Nouveau document' : `${q.number} v${q.version}` }]}
        eyebrow={head.doc_type === 'proforma' ? 'Facture proforma' : 'Devis'}
        title={isNew ? (head.doc_type === 'proforma' ? 'Nouvelle facture proforma' : 'Nouvelle proposition') : <span className="row-wrap" style={{ gap: 10 }}>{q.number} <span className="muted">v{q.version}</span><Status kind="quote" code={q.status} />{q.doc_type === 'proforma' && <Status kind="doc_type" code="proforma" />}</span>}
        subtitle={<>{org && <Link to={`/organisations/${org.id}`}>{org.legal_name}</Link>}{(r.data?.opportunity || opp.data) && <> · <Link to={`/opportunites/${r.data?.opportunity?.id ?? oppId}`}>{r.data?.opportunity?.ref ?? opp.data?.opportunity.ref}</Link></>}</>}
        actions={<>
          {!isNew && can('ai') && <Button variant="soft" icon={<Sparkles />} onClick={() => ai.open({ context_type: 'quote', context_id: q.id, prompt: 'Vérifie la cohérence de ce devis' })}>Vérifier avec l’IA</Button>}
          {!isNew && !locked && <ExcelButton url={`/api/xlsx/quote/${q.id}`} />}
          {!isNew && !locked && <DocButton kind="pdf" url={`/api/quotes/${q.id}/pdf`} />}
          {!isNew && !locked && <DocButton kind="docx" url={`/api/quotes/${q.id}/docx`} />}
          {locked && <Badge tone="danger"><Lock className="ic-xs" aria-hidden /> Verrouillé — approbation DG requise</Badge>}
          {isNew && <Button variant="primary" loading={create.isPending} disabled={!head.title || !lines.length} onClick={() => create.run(undefined)}>Créer le brouillon</Button>}
          {!isNew && q.status === 'brouillon' && can('quotes', 'update') && <>
            <Button loading={save.isPending} disabled={!dirty} onClick={() => save.run(undefined)}>Enregistrer</Button>
            <Button variant="primary" icon={<ShieldAlert />} loading={submit.isPending} disabled={!lines.length} onClick={() => submit.run(undefined)}>Soumettre</Button></>}
          {!isNew && q.status === 'valide' && can('quotes', 'update') && <Button variant="primary" icon={<Send />} onClick={() => setModal('send')}>Consigner l’envoi</Button>}
          {!isNew && q.status === 'envoye' && can('quotes', 'update') && <>
            <Button icon={<XCircle />} onClick={() => setModal('refuse')}>Refusée</Button>
            <Button variant="primary" icon={<CheckCircle2 />} onClick={() => setModal('accept')}>Acceptée par le client</Button></>}
          {!isNew && q.status === 'accepte' && can('contracts', 'create') && <Button variant="primary" icon={<FileSignature />} loading={toContract.isPending} onClick={() => toContract.run(undefined)}>Convertir en contrat</Button>}
          {!isNew && ['soumis', 'valide', 'envoye', 'refuse', 'expire'].includes(q.status) && can('quotes', 'create') && <Button icon={<Copy />} loading={version.isPending} onClick={() => version.run(undefined)}>Nouvelle version</Button>}
          {!isNew && !['accepte', 'annule'].includes(q.status) && can('quotes', 'update') && <Button variant="ghost" icon={<Ban />} onClick={() => setModal('cancel')}>Annuler</Button>}
        </>} />

      {submit.error && <Alert tone="danger" title="Soumission impossible">{submit.error.message}</Alert>}
      {locked && <Alert tone="danger" title="Document verrouillé — approbation du directeur général obligatoire">
        Montant de {money(q.total_ttc)} TTC au-delà du seuil de gouvernance ({money(gov.threshold)}). Tant que le directeur général ne l’a pas approuvé, ce {q.doc_type === 'proforma' ? 'proforma' : 'devis'} ne peut être ni téléchargé (PDF, Word, Excel), ni copié, ni envoyé.{q.status === 'brouillon' ? ' Soumettez-le pour lancer l’approbation.' : ''}
      </Alert>}
      {!isNew && gov?.required && gov.approved && <Alert tone="success" title="Approuvé par le directeur général">Document au-delà du seuil de gouvernance, approuvé le {dateTime(gov.approved_at)}.</Alert>}
      {isNew && reasons.some((x: any) => x.kind === 'seuil_dg') && <Alert tone="warning" title="Approbation du directeur général requise">Le montant dépasse le seuil de gouvernance : le document restera verrouillé (ni téléchargement, ni copie, ni envoi) jusqu’à l’approbation du directeur général.</Alert>}
      {locked && <p className="doc-locked-print-note">Document verrouillé : impression interdite avant l’approbation du directeur général.</p>}
      {!isNew && q.status === 'soumis' && <Alert tone="warning" title="En attente de validation interne">Cette proposition ne peut pas être envoyée avant validation : {q.approval_reasons.join(' ')}</Alert>}
      {!isNew && q.status === 'brouillon' && r.data.approvals.some((a: any) => a.status === 'rejete') && <Alert tone="danger" title="Validation refusée">{r.data.approvals.find((a: any) => a.status === 'rejete').comment}</Alert>}

      <div className={`split${locked ? ' doc-locked' : ''}`} onCopy={locked ? block : undefined} onCut={locked ? block : undefined} onContextMenu={locked ? block : undefined} onDragStart={locked ? block : undefined}>
        <div className="stack-lg" style={{ minWidth: 0 }}>
          <Card title="En-tête">
            <div className="form-grid">
              <Field label="Type de document" hint={!isNew && q?.version > 1 ? 'Fixé dès la première version' : 'La facture proforma a sa propre numérotation (PF-…)'}>
                <Select value={head.doc_type} disabled={!canEdit || (!isNew && q?.version > 1)} onChange={(e) => { setHead({ ...head, doc_type: e.target.value }); setDirty(true); }} options={[{ value: 'devis', label: 'Devis / proposition commerciale' }, { value: 'proforma', label: 'Facture proforma' }]} />
              </Field>
              <Field label="Taux de marge du client" hint={pricing ? (pricing.source === 'client' ? 'Taux propre au client' : `Catégorie « ${pricing.tier} »`) : undefined}>
                <Input disabled value={pricing ? `${rate} % sur le coût` : '…'} />
              </Field>
              <Field label="Intitulé" required error={fe.title} className="span-2"><Input value={head.title} disabled={!canEdit} onChange={(e) => { setHead({ ...head, title: e.target.value }); setDirty(true); }} /></Field>
              <Field label="Destinataire" error={fe.contact_id}>
                {contacts ? <Select value={head.contact_id} onChange={(e) => setHead({ ...head, contact_id: e.target.value })} placeholder="—" options={contacts.map((c: any) => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))} />
                  : <Input disabled value={r.data?.contact ? `${r.data.contact.first_name} ${r.data.contact.last_name}` : '—'} />}
              </Field>
              <Field label="Valable jusqu’au" error={fe.valid_until}><Input type="date" value={head.valid_until} disabled={!canEdit} onChange={(e) => { setHead({ ...head, valid_until: e.target.value }); setDirty(true); }} /></Field>
              <Field label="Début de campagne" hint="Requis pour réserver des faces"><Input type="date" value={head.campaign_start} disabled={!canEdit} onChange={(e) => { setHead({ ...head, campaign_start: e.target.value }); setDirty(true); }} /></Field>
              <Field label="Fin de campagne" error={fe.campaign_end}><Input type="date" value={head.campaign_end} disabled={!canEdit} onChange={(e) => { setHead({ ...head, campaign_end: e.target.value }); setDirty(true); }} /></Field>
            </div>
          </Card>

          <Card title="Lignes" sub="Prix du catalogue approuvé, ou chiffrage au coût (prix d’achat des matériaux, coût de la prestation) × (1 + taux de marge)" flush
            actions={canEdit && <>
              <Select aria-label="Ajouter un article du catalogue" value="" onChange={(e) => addCatalog(e.target.value)} placeholder="+ Article du catalogue" options={catOptions} style={{ width: 230, height: 30 }} />
              {can('stocks') && <Select aria-label="Ajouter un matériau ou produit du stock" value="" onChange={(e) => addStock(e.target.value)} placeholder="+ Matériau / produit du stock" options={stockOptions} style={{ width: 230, height: 30 }} />}
              <Button size="sm" icon={<MapIcon />} onClick={() => setPicker(true)}>Faces de supports</Button>
              <Button size="sm" variant="ghost" icon={<PenLine />} onClick={() => { setLines([...lines, { label: 'Prestation (main-d’œuvre, transport…)', unit: 'forfait', quantity: 1, duration: 1, unit_price: 0, discount_pct: 0, unit_cost: 0, markup_pct: rate }]); setDirty(true); }}>Prestation au coût</Button>
              <Button size="sm" variant="ghost" icon={<PenLine />} onClick={() => { setLines([...lines, { label: 'Prestation hors catalogue', unit: 'forfait', quantity: 1, duration: 1, unit_price: 0, discount_pct: 0, unit_cost: 0 }]); setDirty(true); }}>Ligne libre</Button>
              {lines.some((l) => l.markup_pct !== null && l.markup_pct !== undefined) && <Button size="sm" variant="ghost" onClick={applyRate}>Appliquer le taux client ({rate} %)</Button>}
            </>}>
            {!lines.length ? <Empty icon={<PackagePlus />} title="Aucune ligne">Ajoutez des articles du catalogue ou des faces de supports disponibles sur la période.</Empty> : (
              <div className="table-wrap">
                <table className="table table-compact">
                  <thead><tr><th>Désignation</th><th className="num">Qté</th><th className="num">Durée</th><th className="num">PU HT</th><th className="num">Remise</th><th className="num">Total HT</th>{canEdit && <th />}</tr></thead>
                  <tbody>
                    {lines.map((l, i) => {
                      const sl = sim?.lines?.[i];
                      const overMax = sl && sl.max_discount_pct !== null && sl.discount_pct > sl.max_discount_pct;
                      return (
                        <tr key={i}>
                          <td style={{ minWidth: 260 }}>
                            {canEdit && !l.catalog_item_id && !l.support_face_id ? <Input value={l.label} onChange={(e) => upd(i, 'label', e.target.value)} aria-label="Libellé" /> : <div className="small strong">{l.label}</div>}
                            <div className="xsmall muted">{l.unit}{l._support ? ` · face ${l._support}` : ''}{l._stock ? ` · stock ${l._stock}` : ''}{!l.catalog_item_id && !l.support_face_id && !l.stock_item_id ? ' · hors catalogue (validation requise)' : ''}</div>
                            {l.stock_item_id && l._qty !== undefined && l.quantity > l._qty && <div className="xsmall" style={{ color: 'var(--warning)' }}>{l._qty} en stock : fabrication ou achat à prévoir</div>}
                            {l.markup_pct !== null && l.markup_pct !== undefined && (
                              <div className="row-wrap xsmall" style={{ marginTop: 4, gap: 6 }}>
                                {!l.stock_item_id && !l.catalog_item_id && !l.support_face_id && (canEdit ? <label className="row" style={{ gap: 4 }}>Coût unitaire<Input className="num" type="number" min={0} value={l.unit_cost ?? 0} onChange={(e) => upd(i, 'unit_cost', Number(e.target.value))} aria-label="Coût unitaire" style={{ width: 110, height: 26 }} /></label> : null)}
                                {l.stock_item_id && <PriceBasis itemId={l.stock_item_id} basis={l.cost_basis} priceId={l.purchase_price_id} disabled={!canEdit} onChange={(v) => { setLines(lines.map((x, j) => (j === i ? { ...x, ...v } : x))); setDirty(true); }} />}
                                {(l.stock_item_id || l.catalog_item_id || l.support_face_id) && showCost && <span className="muted">Coût {money(sl?.unit_cost ?? r.data?.lines[i]?.unit_cost)}{sl?.cost_source === 'cump' ? ' (CUMP)' : sl?.cost_source === 'nomenclature' ? ' (nomenclature)' : sl?.cost_source ? ` (${sl.cost_source})` : ''}</span>}
                                <label className="row" style={{ gap: 4 }}>× (1 +{canEdit ? <Input className="num" type="number" min={0} max={500} step="0.5" value={l.markup_pct} onChange={(e) => upd(i, 'markup_pct', e.target.value === '' ? 0 : Number(e.target.value))} aria-label="Taux de marge %" style={{ width: 70, height: 26 }} /> : ` ${l.markup_pct}`} %)</label>
                              </div>
                            )}
                          </td>
                          <td className="num" style={{ width: 80 }}>{canEdit ? <Input className="num" type="number" min={0.01} step="any" value={l.quantity} onChange={(e) => upd(i, 'quantity', Number(e.target.value))} aria-label="Quantité" /> : l.quantity}</td>
                          <td className="num" style={{ width: 80 }}>{canEdit ? <Input className="num" type="number" min={1} step="any" value={l.duration} onChange={(e) => upd(i, 'duration', Number(e.target.value))} aria-label="Durée" /> : l.duration}</td>
                          <td className="num nowrap" style={{ width: 130 }}>{canEdit && !l.catalog_item_id && !l.support_face_id && !l.stock_item_id && (l.markup_pct === null || l.markup_pct === undefined) ? <Input className="num" type="number" min={0} value={l.unit_price} onChange={(e) => upd(i, 'unit_price', Number(e.target.value))} aria-label="Prix unitaire" /> : money(sl?.unit_price ?? l.unit_price)}</td>
                          <td className="num" style={{ width: 96 }}>{canEdit ? <Input className="num" type="number" min={0} max={100} step="0.5" value={l.discount_pct} onChange={(e) => upd(i, 'discount_pct', Number(e.target.value))} aria-label="Remise %" invalid={!!overMax} /> : `${l.discount_pct} %`}
                            {overMax && <div className="xsmall" style={{ color: 'var(--warning)' }}>max {sl.max_discount_pct} %</div>}</td>
                          <td className="num strong nowrap">{money(sl?.line_ht ?? (r.data?.lines[i]?.line_ht))}</td>
                          {canEdit && <td><Button size="sm" variant="ghost" iconOnly aria-label="Retirer la ligne" icon={<Trash2 />} onClick={() => { setLines(lines.filter((_, j) => j !== i)); setDirty(true); }} /></td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Conditions">
            <div className="form-grid">
              <Field label="Conditions de paiement" className="span-2"><Input value={head.payment_terms} disabled={!canEdit} onChange={(e) => { setHead({ ...head, payment_terms: e.target.value }); setDirty(true); }} /></Field>
              <Field label="Conditions particulières (imprimées)" className="span-2"><Textarea value={head.conditions} disabled={!canEdit} onChange={(e) => { setHead({ ...head, conditions: e.target.value }); setDirty(true); }} /></Field>
              <Field label="Notes internes (non imprimées)" className="span-2"><Textarea value={head.notes_internal} disabled={!canEdit} onChange={(e) => { setHead({ ...head, notes_internal: e.target.value }); setDirty(true); }} /></Field>
            </div>
          </Card>

          {!isNew && (r.data.reservations.length > 0 || r.data.versions.length > 1 || r.data.approvals.length > 0) && (
            <div className="grid-2">
              {r.data.reservations.length > 0 && <Card title="Faces pré-réservées"><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{r.data.reservations.map((x: any) => <li key={x.id}>{x.support_code}-{x.face_code} du {date(x.start_date)} au {date(x.end_date)} · <Status kind="face" code={x.status} />{x.expires_at && <span className="muted"> · expire {dateTime(x.expires_at)}</span>}</li>)}</ul></Card>}
              {r.data.versions.length > 1 && <Card title="Versions"><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{r.data.versions.map((v: any) => <li key={v.id}><Link to={`/devis/${v.id}`}>v{v.version}</Link> · <Status kind="quote" code={v.status} /> · {money(v.total_ht)}</li>)}</ul></Card>}
              {r.data.approvals.length > 0 && <Card title="Validations"><div className="stack small">{r.data.approvals.map((a: any) => <div key={a.id}><Status kind="approval" code={a.status} /> {a.approver_label} — <span className="muted">{a.decided_by_name ? `${a.decided_by_name}, ${dateTime(a.decided_at)}` : `demandé ${dateTime(a.requested_at)}`}</span>{a.comment && <div className="secondary">« {a.comment} »</div>}</div>)}</div></Card>}
            </div>
          )}
        </div>

        <div className="stack-lg" style={{ position: 'sticky', top: 72 }}>
          <Card title="Calcul officiel" sub="Moteur du CRM — mis à jour à chaque modification">
            {!totals ? <p className="small muted">Ajoutez des lignes pour voir le total.</p> : (
              <div className="stack">
                {simError && <Alert tone="danger">{simError}</Alert>}
                <Dl items={[
                  ['Sous-total brut HT', money(totals.subtotal_ht)],
                  ['Remise globale', canEdit ? <span className="row" style={{ gap: 4, justifyContent: 'flex-end' }}><Input className="num" type="number" min={0} max={100} step="0.5" value={globalDiscount} onChange={(e) => { setGlobalDiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0))); setDirty(true); }} aria-label="Remise globale %" style={{ width: 70, height: 26 }} /> %</span> : `${globalDiscount} %`],
                  ['Remises (lignes et globale)', totals.discount_total ? `− ${money(totals.discount_total)}` : '—'], ['Total HT', <strong>{money(totals.total_ht)}</strong>],
                  ['TVA', money(totals.total_tax)], ['Total TTC', <strong>{money(totals.total_ttc)}</strong>],
                  ...(showCost ? [['Coûts estimés', money(totals.total_cost)], ['Marge', <span className="strong" style={{ color: reasons.some((x) => /[Mm]arge/.test(x.reason)) ? 'var(--warning)' : 'var(--success)' }}>{money(totals.margin_amount)} · {pct(totals.margin_pct)}</span>]] as [string, any][] : []),
                ]} />
                {reasons.length > 0 ? (
                  <Alert tone="warning" title="Validation requise avant envoi"><ul>{reasons.map((x, i) => <li key={i}>{x.reason}</li>)}</ul>{sim?.approval?.role && <div className="xsmall" style={{ marginTop: 4 }}>Approbateur : {sim.approval.role === 'direction_generale' ? 'direction générale' : 'direction commerciale'}</div>}</Alert>
                ) : <Alert tone="success">Dans les seuils : validation automatique à la soumission.</Alert>}
              </div>
            )}
          </Card>
          {!isNew && <Card title="Suivi"><Dl items={[['Émis le', date(q.issue_date)], ['Soumis', dateTime(q.submitted_at)], ['Validé', dateTime(q.validated_at)], ['Envoyé', q.sent_at ? `${dateTime(q.sent_at)} à ${q.sent_to}` : '—'], ['Accepté', dateTime(q.accepted_at)], ['Refusé', q.refused_at ? `${dateTime(q.refused_at)} — ${q.refusal_reason}` : '—']]} /></Card>}
          {!isNew && q.status === 'envoye' && q.valid_until < today() && <Badge tone="danger">Validité dépassée : créez une nouvelle version</Badge>}
        </div>
      </div>

      <FacePicker open={picker} onClose={() => setPicker(false)} from={head.campaign_start || null} to={head.campaign_end || null} onPick={addFace} />
      <Modal open={modal === 'send'} onClose={() => setModal(null)} title="Consigner l’envoi de la proposition" description="Téléchargez le PDF et transmettez-le au client par votre messagerie. Le CRM enregistre l’envoi et programme une relance automatique."
        footer={<><Button onClick={() => setModal(null)}>Annuler</Button><Button variant="primary" loading={send.isPending} disabled={!sentTo.trim()} onClick={() => send.run(undefined)}>Consigner l’envoi</Button></>}>
        <Field label="Destinataire" required><Input value={sentTo} onChange={(e) => setSentTo(e.target.value)} /></Field>
      </Modal>
      <ConfirmModal open={modal === 'accept'} onClose={() => setModal(null)} title="Acceptation du client" confirmLabel="Consigner l’acceptation" loading={decide.isPending} onConfirm={() => decide.run({ decision: 'accepte' })}
        message={<>Confirmez que le client a accepté par écrit la proposition {q?.number} v{q?.version} ({money(q?.total_ht)} HT). Les autres versions ouvertes seront annulées. Joignez le document d’acceptation à l’opportunité.</>} />
      <ConfirmModal open={modal === 'refuse'} onClose={() => setModal(null)} title="Refus du client" confirmLabel="Consigner le refus" danger loading={decide.isPending} reason={{ label: 'Motif du refus', required: true }} onConfirm={(t) => decide.run({ decision: 'refuse', reason: t })}
        message="Les pré-réservations de faces liées seront libérées." />
      <ConfirmModal open={modal === 'cancel'} onClose={() => setModal(null)} title="Annuler cette proposition ?" danger confirmLabel="Annuler la proposition" loading={cancel.isPending} onConfirm={() => cancel.run(undefined)}
        message="Les validations en attente, pré-réservations et relances liées seront annulées. L’opération est journalisée." />
    </>
  );
}
