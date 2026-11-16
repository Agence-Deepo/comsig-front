import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Boxes, Calculator, Plus, Trash2, Wrench } from 'lucide-react';
import { Card, Segmented } from '../components/ui';
import { api, HttpError } from './api';
import { useAuth } from './auth';
import { useOptions } from './forms';
import { can, label, money, today, type Row } from './types';
import { ErrorBox, Loading, PageTitle } from './ui';
import { StockCostFields } from './QuotePricing';

export interface WizardLine {
  source: 'cout' | 'stock' | 'catalogue' | 'libre';
  label: string;
  unit: string;
  quantity: string;
  duration: string;
  unit_price: string;
  unit_cost: string;
  discount_pct: string;
  tax_rate: string;
  stock_item_id?: string;
  catalog_item_id?: string;
  cost_basis?: string;
  purchase_price_id?: number;
  bom_id?: string;
}
const lineLabels: Record<string, string> = {
  unit: 'Unité',
  quantity: 'Quantité',
  duration: 'Durée / coefficient',
  unit_cost: 'Coût unitaire (FCFA)',
  unit_price: 'Prix unitaire HT (FCFA)',
  discount_pct: 'Remise de ligne (%)',
  tax_rate: 'TVA (%)',
};
const blank = (source: WizardLine['source'] = 'cout'): WizardLine => ({
  source,
  label: '',
  unit: 'forfait',
  quantity: '1',
  duration: '1',
  unit_price: '0',
  unit_cost: '0',
  discount_pct: '0',
  tax_rate: '18',
});
export function wizardLinePayload(l: WizardLine, markup: string) {
  return {
    label: l.label,
    unit: l.unit,
    quantity: Number(l.quantity),
    duration: Number(l.duration),
    unit_price: Number(l.unit_price),
    unit_cost: Number(l.unit_cost),
    discount_pct: Number(l.discount_pct),
    tax_rate: Number(l.tax_rate),
    ...(l.source === 'stock'
      ? {
          stock_item_id: l.stock_item_id,
          markup_pct: Number(markup),
          cost_basis: l.cost_basis || 'cump',
          purchase_price_id: l.purchase_price_id,
          bom_id: l.bom_id,
        }
      : {}),
    ...(l.source === 'catalogue' ? { catalog_item_id: l.catalog_item_id } : {}),
    ...(l.source === 'cout' ? { markup_pct: Number(markup) } : {}),
  };
}

export default function NewQuote() {
  const { user } = useAuth();
  const [search] = useSearchParams();
  const navigate = useNavigate(),
    qc = useQueryClient();
  const [mode, setMode] = useState<'existant' | 'nouveau'>('existant');
  const [organization, setOrganization] = useState(search.get('client') || '');
  const [term, setTerm] = useState('');
  const clients = useQuery({
    queryKey: ['quote-client-picker', term],
    queryFn: ({ signal }) =>
      api.get(
        '/organizations?per_page=30' + (term.trim() ? '&q=' + encodeURIComponent(term.trim()) : ''),
        signal,
      ),
    enabled: can(user, 'organizations.view'),
  });
  const catalog = useOptions('catalog', can(user, 'catalog.view'));
  const stocks = useOptions('stock-items', can(user, 'stocks.view'));
  const context = useQuery({
    queryKey: ['new-quote-context', organization],
    queryFn: ({ signal }) => api.get('/quotes/new/context?organization_id=' + organization, signal),
    enabled: mode === 'existant' && !!organization,
  });
  const [contact, setContact] = useState(search.get('contact') || ''),
    [opportunity, setOpportunity] = useState('');
  const [client, setClient] = useState<Row>({
    legal_name: '',
    resource_person: '',
    resource_title: '',
    email: '',
    phone: '',
    address: '',
  });
  const [newContact, setNewContact] = useState<Row>({ first_name: '', last_name: '', email: '', phone: '' });
  const [lines, setLines] = useState<WizardLine[]>([]),
    [markup, setMarkup] = useState('60'),
    [discount, setDiscount] = useState('0');
  const [sim, setSim] = useState<Row | null>(null),
    [simError, setSimError] = useState<unknown>(null),
    [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [override, setOverride] = useState(false),
    [justification, setJustification] = useState('');
  const payload = useMemo(
    () => ({ lines: lines.map((l) => wizardLinePayload(l, markup)), global_discount_pct: Number(discount) }),
    [lines, markup, discount],
  );
  useEffect(() => {
    if (context.data) setMarkup(String(context.data.pricing.markup_pct));
  }, [context.data]);
  useEffect(() => {
    let current = true;
    setSim(null);
    setSimError(null);
    if (!lines.length) {
      setCalculating(false);
      return;
    }
    setCalculating(true);
    const timer = setTimeout(() => {
      api
        .post('/quotes/simulate', payload)
        .then((r) => {
          if (current) setSim(r.data);
        })
        .catch((e) => {
          if (current) setSimError(e);
        })
        .finally(() => {
          if (current) setCalculating(false);
        });
    }, 350);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [payload]);
  function update(i: number, patch: Partial<WizardLine>) {
    setLines((old) => old.map((l, n) => (n === i ? { ...l, ...patch } : l)));
  }
  function add(source: WizardLine['source']) {
    const item = source === 'stock' ? stocks.data?.[0] : source === 'catalogue' ? catalog.data?.[0] : null;
    setLines((old) => [
      ...old,
      {
        ...blank(source),
        ...(item
          ? {
              label: item.label,
              unit: item.unit,
              unit_price: String(item.unit_price ?? 0),
              ...(source === 'stock' ? { stock_item_id: item.id } : { catalog_item_id: item.id }),
            }
          : {}),
      },
    ]);
  }
  function changeClient(id: string) {
    setOrganization(id);
    setContact('');
    setOpportunity('');
    setOverride(false);
  }
  async function save(form: HTMLFormElement, submitNow: boolean) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const fields = Object.fromEntries(new FormData(form));
      const body = {
        ...fields,
        ...payload,
        submit: submitNow,
        ...(mode === 'existant'
          ? { organization_id: organization }
          : {
              new_client: {
                ...client,
                ignore_duplicates: override,
                duplicate_justification: justification || null,
              },
            }),
        contact_id: mode === 'existant' && contact ? contact : null,
        ...((mode === 'nouveau' || !contact) && newContact.last_name?.trim()
          ? { new_contact: newContact }
          : {}),
        opportunity_id: mode === 'existant' && opportunity ? opportunity : null,
      };
      const r = await api.post('/quotes/new', body);
      await qc.invalidateQueries();
      navigate('/devis/' + r.data.id);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  const duplicates = error instanceof HttpError ? error.details.duplicates : null;
  const clientField = (key: string, text: string, type = 'text', required = false) => (
    <label className="field" key={key}>
      {text}
      {required ? ' *' : ''}
      <input
        type={type}
        required={required}
        maxLength={key === 'legal_name' ? 200 : 150}
        value={client[key]}
        onChange={(e) => {
          setClient({ ...client, [key]: e.target.value });
          setOverride(false);
        }}
      />
    </label>
  );
  return (
    <>
      <Link className="back-link" to="/devis">
        ← Devis et proformas
      </Link>
      <PageTitle
        title="Nouveau devis"
        description="Chiffrez les matériaux et les prestations au coût, appliquez le taux du client et préparez la validation."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save(
            e.currentTarget,
            (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'submit',
          );
        }}
      >
        <ErrorBox error={error || clients.error || context.error || catalog.error || stocks.error} />
        <div className="split nq p05-quote">
          <div className="stack-lg">
            <Card title="1. Client" sub="Client existant de votre portefeuille ou nouveau prospect">
              {can(user, 'organizations.create') && (
                <Segmented
                  label="Client"
                  value={mode}
                  onChange={(v) => {
                    setMode(v);
                    setContact('');
                    setOpportunity('');
                  }}
                  options={[
                    { id: 'existant', label: 'Client existant' },
                    { id: 'nouveau', label: 'Nouveau client' },
                  ]}
                />
              )}
              {mode === 'existant' ? (
                <div className="form-grid">
                  <label className="field">
                    Rechercher un client
                    <input
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      placeholder="Raison sociale…"
                    />
                  </label>
                  <label className="field">
                    Client / prospect *
                    <select required value={organization} onChange={(e) => changeClient(e.target.value)}>
                      <option value="">Choisir…</option>
                      {[
                        ...(clients.data?.data ?? []),
                        ...(context.data && !clients.data?.data.some((c: Row) => c.id === organization)
                          ? [context.data.organization]
                          : []),
                      ].map((c: Row) => (
                        <option key={c.id} value={c.id}>
                          {c.legal_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {context.isFetching && <Loading />}
                  {context.data && (
                    <>
                      <label className="field">
                        Opportunité liée
                        <select
                          value={opportunity}
                          onChange={(e) => {
                            setOpportunity(e.target.value);
                            const opp = context.data.opportunities.find((o: Row) => o.id === e.target.value);
                            if (opp?.primary_contact_id) setContact(opp.primary_contact_id);
                          }}
                        >
                          <option value="">Créer une nouvelle opportunité</option>
                          {context.data.opportunities.map((o: Row) => (
                            <option key={o.id} value={o.id}>
                              {o.title} ({label(o.stage_code)})
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        Contact destinataire
                        <select value={contact} onChange={(e) => setContact(e.target.value)}>
                          <option value="">Nouveau contact / à compléter</option>
                          {context.data.contacts.map((c: Row) => (
                            <option key={c.id} value={c.id}>
                              {[c.first_name, c.last_name].filter(Boolean).join(' ')}
                              {c.opt_out ? ' — Opposition' : ''}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}
                </div>
              ) : (
                <div className="form-grid">
                  {clientField('legal_name', 'Raison sociale', 'text', true)}
                  {clientField('resource_person', 'Personne ressource')}
                  {clientField('resource_title', 'Fonction occupée')}
                  {clientField('email', 'E-mail du client', 'email')}
                  {clientField('phone', 'Téléphone du client')}
                  {clientField('address', 'Adresse')}
                </div>
              )}
              {(mode === 'nouveau' || !contact) && can(user, 'organizations.create') && (
                <div className="form-grid p05-contact">
                  <h3 className="span-2">Nouvel interlocuteur</h3>
                  {(['last_name', 'first_name', 'email', 'phone'] as const).map((key) => (
                    <label className="field" key={key}>
                      {
                        {
                          last_name: 'Nom de l’interlocuteur',
                          first_name: 'Prénom de l’interlocuteur',
                          email: 'E-mail de l’interlocuteur',
                          phone: 'Téléphone de l’interlocuteur',
                        }[key]
                      }
                      <input
                        type={key === 'email' ? 'email' : 'text'}
                        value={newContact[key]}
                        maxLength={key === 'email' ? 254 : 100}
                        onChange={(e) => setNewContact({ ...newContact, [key]: e.target.value })}
                      />
                    </label>
                  ))}
                </div>
              )}
              {duplicates && (
                <div className="notice warning">
                  <h3>Fiches similaires à vérifier</h3>
                  {duplicates.map((d: Row) => (
                    <p key={d.id}>
                      <Link to={'/clients/' + d.id} target="_blank">
                        {d.legal_name}
                      </Link>{' '}
                      — {d.reasons.join(', ')}
                    </p>
                  ))}
                  <label className="field">
                    <span>
                      <input
                        type="checkbox"
                        checked={override}
                        onChange={(e) => setOverride(e.target.checked)}
                      />{' '}
                      Il s’agit bien d’une fiche distincte
                    </span>
                  </label>
                  <label className="field">
                    Justification
                    <textarea
                      required={override}
                      maxLength={1000}
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                    />
                  </label>
                </div>
              )}
              {!opportunity && (
                <p className="small muted">
                  Une nouvelle opportunité sera créée à l’étape « Nouveau ». Sa qualification restera soumise
                  aux critères P04.
                </p>
              )}
            </Card>
            <Card
              title="2. Chiffrage"
              sub="Prix et montants résolus par Laravel, sans prélèvement de stock"
              actions={
                <div className="row-wrap">
                  <button
                    type="button"
                    className="btn"
                    disabled={!stocks.data?.length || lines.length >= 200}
                    onClick={() => add('stock')}
                  >
                    <Boxes size={15} /> Matériau / support
                  </button>
                  <button
                    type="button"
                    className="btn"
                    disabled={lines.length >= 200}
                    onClick={() => add('cout')}
                  >
                    <Wrench size={15} /> Prestation au coût
                  </button>
                  <button
                    type="button"
                    className="btn"
                    disabled={!catalog.data?.length || lines.length >= 200}
                    onClick={() => add('catalogue')}
                  >
                    Prestation catalogue
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={lines.length >= 200}
                    onClick={() => add('libre')}
                  >
                    Saisie libre
                  </button>
                </div>
              }
            >
              <div className="nq-rate">
                <Calculator size={22} />
                <div className="spacer">
                  <strong>Majoration du coût (%)</strong>
                  <div className="small muted">
                    {mode === 'existant' && context.data
                      ? `Taux ${context.data.pricing.source === 'categorie' ? 'de la catégorie' : 'propre au client'} : ${context.data.pricing.markup_pct} %.`
                      : 'Valeur initiale du CRM : 60 %.'}{' '}
                    Coût × (1 + taux / 100), distinct du taux de marge sur le prix de vente.
                  </div>
                </div>
                <input
                  aria-label="Taux appliqué (%)"
                  type="number"
                  min="0"
                  max="500"
                  step="0.01"
                  required
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                />
              </div>
              {!lines.length && (
                <p className="muted">Ajoutez les matériaux et les prestations : pose, transport, création…</p>
              )}
              <div className="nq-lines">
                {lines.map((l, i) => (
                  <div className={'nq-line src-' + l.source} key={i}>
                    <div className="nq-line-head">
                      <strong>
                        {i + 1}.{' '}
                        {
                          {
                            cout: 'Prestation au coût',
                            stock: 'Matériau / support',
                            catalogue: 'Catalogue',
                            libre: 'Saisie libre',
                          }[l.source]
                        }
                      </strong>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        aria-label={'Supprimer la ligne ' + (i + 1)}
                        onClick={() => setLines(lines.filter((_, n) => n !== i))}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="form-grid three">
                      {(l.source === 'stock' || l.source === 'catalogue') && (
                        <label className="field wide">
                          {l.source === 'stock' ? 'Article' : 'Prestation'}
                          <select
                            value={l.stock_item_id || l.catalog_item_id || ''}
                            required
                            onChange={(e) => {
                              const item = (l.source === 'stock' ? stocks.data : catalog.data)?.find(
                                (r) => r.id === e.target.value,
                              );
                              if (item)
                                update(i, {
                                  ...(l.source === 'stock'
                                    ? { stock_item_id: item.id }
                                    : { catalog_item_id: item.id }),
                                  label: item.label,
                                  unit: item.unit,
                                  unit_price: String(item.unit_price || 0),
                                  cost_basis: undefined,
                                  purchase_price_id: undefined,
                                  bom_id: undefined,
                                });
                            }}
                          >
                            {(l.source === 'stock' ? stocks.data : catalog.data)?.map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.code} — {x.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {l.source === 'stock' && l.stock_item_id && (
                        <StockCostFields
                          id={l.stock_item_id}
                          value={l}
                          change={(patch) => update(i, patch)}
                        />
                      )}
                      <label className="field wide">
                        Désignation *
                        <input
                          required
                          maxLength={300}
                          value={l.label}
                          onChange={(e) => update(i, { label: e.target.value })}
                        />
                      </label>
                      {(
                        [
                          'unit',
                          'quantity',
                          'duration',
                          ...(l.source === 'cout' || l.source === 'libre' ? ['unit_cost'] : []),
                          ...(l.source === 'libre' ? ['unit_price'] : []),
                          'discount_pct',
                          ...(l.source !== 'catalogue' ? ['tax_rate'] : []),
                        ] as (keyof WizardLine)[]
                      ).map((key) => (
                        <label className="field" key={key}>
                          {lineLabels[key]}
                          <input
                            aria-label={`${lineLabels[key]} — ligne ${i + 1}`}
                            type={key === 'unit' ? 'text' : 'number'}
                            required
                            min={['quantity', 'duration'].includes(key) ? '0.0001' : '0'}
                            max={['tax_rate', 'discount_pct'].includes(key) ? '100' : undefined}
                            step={
                              ['unit_price', 'unit_cost'].includes(key)
                                ? '1'
                                : ['quantity', 'duration'].includes(key)
                                  ? '0.0001'
                                  : '0.01'
                            }
                            readOnly={key === 'unit' && ['stock', 'catalogue'].includes(l.source)}
                            value={l[key] ?? ''}
                            onChange={(e) => update(i, { [key]: e.target.value })}
                          />
                        </label>
                      ))}
                    </div>
                    {sim?.lines[i] && (
                      <div className="nq-line-calc">
                        <span>
                          Coût : <strong>{money(sim.lines[i].unit_cost)}</strong>
                        </span>
                        <span>
                          P.U. HT : <strong>{money(sim.lines[i].unit_price)}</strong>
                        </span>
                        <span>
                          Net HT : <strong>{money(sim.lines[i].line_ht)}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
            <Card title="3. Document">
              <div className="form-grid">
                <label className="field span-2">
                  Objet de la proposition
                  <input name="title" required maxLength={200} />
                </label>
                <label className="field">
                  Type de document
                  <select
                    name="doc_type"
                    defaultValue={search.get('type') === 'proforma' ? 'proforma' : 'devis'}
                  >
                    <option value="devis">Devis</option>
                    <option value="proforma">Proforma</option>
                  </select>
                </label>
                <label className="field">
                  Type de prestation
                  <select name="offer_type" defaultValue="signaletique">
                    {['affichage', 'campagne', 'signaletique', 'maintenance', 'geomarketing', 'conseil'].map(
                      (v) => (
                        <option key={v} value={v}>
                          {label(v)}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="field">
                  Valable jusqu’au *
                  <input
                    name="valid_until"
                    type="date"
                    required
                    min={today()}
                    defaultValue={new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)}
                  />
                </label>
                <label className="field span-2">
                  Modalités de paiement
                  <textarea name="payment_terms" maxLength={1000} />
                </label>
                <label className="field span-2">
                  Conditions particulières
                  <textarea name="conditions" maxLength={5000} />
                </label>
                <label className="field span-2">
                  Notes internes
                  <textarea name="notes_internal" maxLength={3000} />
                </label>
              </div>
            </Card>
          </div>
          <aside className="nq-side">
            <Card title="Synthèse" sub="Calcul officiel Laravel">
              {calculating && <Loading />}
              <ErrorBox error={simError} />
              {sim?.totals ? (
                <div className="quote-totals">
                  {[
                    ['Coût de revient', 'total_cost'],
                    ['Sous-total brut HT', 'subtotal_ht'],
                    ['Remises', 'discount_total'],
                    ['Total HT', 'total_ht'],
                    ['TVA', 'total_tax'],
                    ['Total TTC', 'total_ttc'],
                    ['Marge', 'margin_amount'],
                  ].map(([text, field]) => (
                    <div key={field} className={field === 'total_ttc' ? 'grand-total' : ''}>
                      <span>{text}</span>
                      <strong>{money(sim.totals[field])}</strong>
                    </div>
                  ))}
                  <div>
                    <span>Taux de marge</span>
                    <strong>{sim.totals.margin_pct} %</strong>
                  </div>
                </div>
              ) : (
                !calculating && <p className="muted">Ajoutez des lignes pour voir le calcul.</p>
              )}
              <label className="field">
                Remise globale (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={discount}
                  required
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </label>
              {sim?.approval.reasons.length > 0 && (
                <div className="notice warning">
                  Validation requise : {sim?.approval.reasons.map(label).join(', ')}.
                </div>
              )}
              <div className="stack">
                <button
                  className="btn btn-primary"
                  name="intent"
                  value="submit"
                  disabled={busy || !lines.length || !can(user, 'quotes.update')}
                >
                  <Plus size={16} />
                  Créer et soumettre
                </button>
                <button className="btn" name="intent" value="draft" disabled={busy || !lines.length}>
                  Enregistrer en brouillon
                </button>
              </div>
              <p className="small muted">
                Aucun e-mail, facture, écriture comptable ou réservation n’est créé automatiquement.
              </p>
            </Card>
          </aside>
        </div>
      </form>
    </>
  );
}
