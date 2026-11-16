import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { api } from './api';
import { useAuth } from './auth';
import { useOptions } from './forms';
import { can, money, today, type Row } from './types';
import { ErrorBox, Loading, PageTitle } from './ui';
import NewQuote from './NewQuote';
import { StockCostFields } from './QuotePricing';

interface Line {
  label: string;
  unit: string;
  quantity: string;
  duration: string;
  unit_price: number;
  unit_cost: number;
  tax_rate: string;
  discount_pct: string;
  catalog_item_id?: string;
  stock_item_id?: string;
  markup_pct?: string;
  cost_basis?: string;
  purchase_price_id?: number;
  bom_id?: string;
}
const blank = (): Line => ({
  label: '',
  unit: 'unité',
  quantity: '1',
  duration: '1',
  unit_price: 0,
  unit_cost: 0,
  tax_rate: '18',
  discount_pct: '0',
});
export function quoteLinePayload(line: Line): Row {
  return {
    ...line,
    unit_price: Number(line.unit_price),
    unit_cost: Number(line.unit_cost),
    quantity: Number(line.quantity),
    duration: Number(line.duration),
    tax_rate: Number(line.tax_rate),
    discount_pct: Number(line.discount_pct),
    ...(line.markup_pct === undefined ? {} : { markup_pct: Number(line.markup_pct) }),
  };
}
export default function QuoteEditor() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const { user } = useAuth();
  const allowed = can(user, id ? 'quotes.update' : 'quotes.create');
  const result = useQuery({
    queryKey: ['detail', 'quotes', id],
    queryFn: () => api.get(`/quotes/${id}`),
    enabled: Boolean(id) && allowed,
  });
  if (!allowed)
    return <div className="notice warning">Votre profil ne permet pas de modifier les devis.</div>;
  if (!id && !search.get('opportunite') && !search.get('opportunity')) return <NewQuote />;
  if (id && result.isLoading) return <Loading />;
  if (result.error) return <ErrorBox error={result.error} />;
  if (id && result.data?.data.status !== 'brouillon')
    return (
      <div className="notice warning">
        Seul un brouillon peut être modifié. <Link to={`/devis/${id}`}>Revenir au devis</Link>
      </div>
    );
  return <Editor key={id || 'new'} row={result.data?.data} />;
}
function Editor({ row }: { row?: Row }) {
  const { user } = useAuth();
  const [search] = useSearchParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const organizations = useOptions('organizations', can(user, 'organizations.view'));
  const catalog = useOptions('catalog', can(user, 'catalog.view'));
  const stocks = useOptions('stock-items', can(user, 'stocks.view'));
  const [organization, setOrganization] = useState(row?.organization_id || search.get('client') || '');
  const [contact, setContact] = useState(row?.contact_id || search.get('contact') || '');
  const opportunityId = search.get('opportunite') || search.get('opportunity');
  const opportunity = useQuery({
    queryKey: ['quote-opportunity', opportunityId],
    queryFn: () => api.get('/opportunities/' + opportunityId),
    enabled: !!opportunityId && !row && can(user, 'opportunities.view'),
  });
  useEffect(() => {
    if (opportunity.data && !row) {
      setOrganization(opportunity.data.data.organization_id);
      setContact(opportunity.data.data.primary_contact_id || '');
    }
  }, [opportunity.data, row]);
  const [lines, setLines] = useState<Line[]>(
    () =>
      row?.lines?.map((line: Row) => ({
        ...blank(),
        ...Object.fromEntries(
          Object.keys(blank()).map((key) => [key, line[key] ?? blank()[key as keyof Line]]),
        ),
        catalog_item_id: line.catalog_item_id || undefined,
        stock_item_id: line.stock_item_id || undefined,
        markup_pct: line.markup_pct == null ? undefined : String(line.markup_pct),
        cost_basis: line.cost_basis || undefined,
        purchase_price_id: line.purchase_price_id || undefined,
        bom_id: line.bom_id || undefined,
      })) || [blank()],
  );
  const [discount, setDiscount] = useState(String(row?.global_discount_pct || 0));
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [simulationInput, setSimulationInput] = useState<Row | null>(null);
  const contacts = useQuery({
    queryKey: ['quote-contacts', organization],
    queryFn: () => api.get(`/organizations/${organization}`),
    enabled: Boolean(organization),
  });
  const simulation = useQuery({
    queryKey: ['quote-simulation', simulationInput],
    queryFn: ({ signal }) =>
      api.post('/quotes/simulate', simulationInput).then((value) => {
        if (signal.aborted) throw new DOMException('Annulé', 'AbortError');
        return value;
      }),
    enabled: simulationInput !== null,
    retry: false,
    staleTime: 0,
  });
  const pricing = useQuery({
    queryKey: ['client-pricing', organization],
    queryFn: () => api.get(`/organizations/${organization}/pricing`),
    enabled: !!organization && can(user, 'organizations.view'),
  });
  function update(index: number, patch: Partial<Line>) {
    setLines((previous) => previous.map((line, i) => (i === index ? { ...line, ...patch } : line)));
    setSimulationInput(null);
  }
  function source(index: number, value: string) {
    const [kind, id] = value.split(':');
    const item = (kind === 'catalog' ? catalog.data : stocks.data)?.find((record) => record.id === id);
    if (!item) {
      update(index, {
        catalog_item_id: undefined,
        stock_item_id: undefined,
        markup_pct: undefined,
        cost_basis: undefined,
        purchase_price_id: undefined,
        bom_id: undefined,
      });
      return;
    }
    update(index, {
      label: item.label,
      unit: item.unit,
      unit_price: Number(item.unit_price || 0),
      unit_cost: Number(item.unit_cost || item.average_cost || 0),
      tax_rate: String(item.tax_rate ?? 18),
      catalog_item_id: kind === 'catalog' ? id : undefined,
      stock_item_id: kind === 'stock' ? id : undefined,
      markup_pct:
        kind === 'stock'
          ? String(pricing.data?.markup_pct ?? contacts.data?.data.markup_pct ?? 60)
          : undefined,
      cost_basis: undefined,
      purchase_price_id: undefined,
      bom_id: undefined,
    });
  }
  async function save(form: HTMLFormElement) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const fields = Object.fromEntries(new FormData(form));
      const payload = {
        ...fields,
        organization_id: organization,
        contact_id: contact || null,
        global_discount_pct: Number(discount),
        lines: lines.map(quoteLinePayload),
        ...(opportunityId && !row ? { opportunity_id: opportunityId } : {}),
        ...(row ? { expected_revision: row.lock_version } : {}),
      };
      const response = row
        ? await api.patch(`/quotes/${row.id}`, payload)
        : await api.post('/quotes', payload);
      await qc.invalidateQueries();
      navigate(`/devis/${response.data.id}`);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  const total = simulationInput ? simulation.data?.data.totals : null;
  return (
    <>
      <Link className="back-link" to={row ? `/devis/${row.id}` : '/devis'}>
        <ArrowLeft size={15} />
        Retour aux devis
      </Link>
      <PageTitle
        eyebrow="ESPACE COMMERCIAL / CHIFFRAGE"
        title={row ? `Modifier ${row.number}` : 'Nouveau devis'}
        description="Construisez votre proposition. Les totaux et les contrôles de marge sont calculés par Laravel."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save(e.currentTarget);
        }}
      >
        <ErrorBox error={error} />
        <ErrorBox error={organizations.error || catalog.error || stocks.error} />
        <section className="panel panel-body">
          <h2>Le projet & le client</h2>
          <div className="form-grid three">
            <label className="field wide">
              Objet de la proposition
              <input
                name="title"
                defaultValue={row?.title || ''}
                required
                maxLength={200}
                placeholder="Ex. Signalétique du nouveau siège"
              />
            </label>
            <label className="field">
              Type de document
              <select
                name="doc_type"
                defaultValue={row?.doc_type || (search.get('type') === 'proforma' ? 'proforma' : 'devis')}
              >
                <option value="devis">Devis</option>
                <option value="proforma">Proforma</option>
              </select>
            </label>
            <label className="field">
              Client / prospect *
              <select
                required
                value={organization}
                disabled={!!opportunityId || !!row}
                onChange={(e) => {
                  setOrganization(e.target.value);
                  setContact('');
                }}
              >
                <option value="">Sélectionner une entreprise…</option>
                {organizations.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.legal_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Contact destinataire
              <select
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={contacts.isLoading || !organization}
              >
                <option value="">À compléter avant soumission</option>
                {contacts.data?.data.contacts?.map((item: Row) => (
                  <option key={item.id} value={item.id}>
                    {item.first_name} {item.last_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Valable jusqu’au *
              <input
                name="valid_until"
                type="date"
                defaultValue={
                  row?.valid_until?.slice(0, 10) ||
                  new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
                }
                min={today()}
                required
              />
            </label>
          </div>
          <ErrorBox error={contacts.error} />
          <p className="muted">
            Le contact se crée depuis la fiche client. Il est obligatoire pour soumettre le devis.
          </p>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Prestations & matières</h2>
            <span className="muted">
              {lines.length} ligne{lines.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="muted" style={{ padding: '0 20px' }}>
            Modifier les lignes revalide leurs tarifs catalogue/CUMP au serveur. Les lignes inchangées et les
            anciennes versions conservent leur snapshot.
          </p>
          <div className="quote-lines">
            {lines.map((line, index) => (
              <div className="quote-line" key={index}>
                <div className="line-title">
                  <strong>Prestation {String(index + 1).padStart(2, '0')}</strong>
                  <button
                    type="button"
                    className="icon-button danger-text"
                    aria-label={`Supprimer la ligne ${index + 1}`}
                    disabled={lines.length === 1}
                    onClick={() => {
                      setLines(lines.filter((_, i) => i !== index));
                      setSimulationInput(null);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="form-grid three">
                  <label className="field">
                    Source du prix
                    <select
                      value={
                        line.catalog_item_id
                          ? `catalog:${line.catalog_item_id}`
                          : line.stock_item_id
                            ? `stock:${line.stock_item_id}`
                            : ''
                      }
                      onChange={(e) => source(index, e.target.value)}
                    >
                      <option value="">Saisie libre</option>
                      {catalog.data?.length ? (
                        <optgroup label="Catalogue">
                          {catalog.data.map((item) => (
                            <option key={item.id} value={`catalog:${item.id}`}>
                              {item.label}
                            </option>
                          ))}
                        </optgroup>
                      ) : null}
                      {stocks.data?.length ? (
                        <optgroup label="Matières">
                          {stocks.data.map((item) => (
                            <option key={item.id} value={`stock:${item.id}`}>
                              {item.label}
                            </option>
                          ))}
                        </optgroup>
                      ) : null}
                    </select>
                  </label>
                  {line.stock_item_id && (
                    <StockCostFields
                      id={line.stock_item_id}
                      value={line}
                      change={(patch) => update(index, patch)}
                    />
                  )}
                  <label className="field wide">
                    Désignation *
                    <input
                      value={line.label}
                      required
                      maxLength={300}
                      onChange={(e) => update(index, { label: e.target.value })}
                    />
                  </label>
                  {(
                    [
                      'unit',
                      'quantity',
                      'duration',
                      'unit_price',
                      'unit_cost',
                      'tax_rate',
                      'discount_pct',
                    ] as const
                  ).map((key) => {
                    const names = {
                      unit: 'Unité',
                      quantity: 'Quantité',
                      duration: 'Durée / coefficient',
                      unit_price: 'Prix unitaire HT (FCFA)',
                      unit_cost: 'Coût unitaire (FCFA)',
                      tax_rate: 'TVA (%)',
                      discount_pct: 'Remise de ligne (%)',
                    };
                    const locked = Boolean(
                      (line.catalog_item_id && ['unit_price', 'unit_cost', 'tax_rate'].includes(key)) ||
                      (line.stock_item_id && ['unit_price', 'unit_cost', 'unit'].includes(key)),
                    );
                    return (
                      <label className="field" key={key}>
                        {names[key]}
                        <input
                          aria-label={`${names[key]} — ligne ${index + 1}`}
                          type={key === 'unit' ? 'text' : 'number'}
                          required
                          value={line[key]}
                          readOnly={locked}
                          min={['quantity', 'duration'].includes(key) ? 0.0001 : 0}
                          max={['tax_rate', 'discount_pct'].includes(key) ? 100 : undefined}
                          step={['unit_price', 'unit_cost'].includes(key) ? '1' : '0.0001'}
                          onChange={(e) =>
                            update(index, {
                              [key]: ['unit_price', 'unit_cost'].includes(key)
                                ? Number(e.target.value)
                                : e.target.value,
                            })
                          }
                        />
                      </label>
                    );
                  })}
                  {!line.catalog_item_id && (
                    <label className="field">
                      Majoration du coût (%) — facultative hors matière
                      <input
                        type="number"
                        required={!!line.stock_item_id}
                        min="0"
                        max="500"
                        step="0.01"
                        value={line.markup_pct ?? ''}
                        onChange={(e) => update(index, { markup_pct: e.target.value || undefined })}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="panel-body">
            <button
              type="button"
              className="button"
              disabled={lines.length >= 200}
              onClick={() => {
                setLines([...lines, blank()]);
                setSimulationInput(null);
              }}
            >
              <Plus size={16} />
              Ajouter une ligne
            </button>
          </div>
        </section>
        <div className="detail-layout">
          <section className="panel panel-body">
            <h2>Conditions commerciales</h2>
            <label className="field">
              Modalités de paiement
              <textarea name="payment_terms" maxLength={1000} defaultValue={row?.payment_terms || ''} />
            </label>
            <label className="field">
              Conditions particulières
              <textarea name="conditions" maxLength={5000} defaultValue={row?.conditions || ''} />
            </label>
            <label className="field">
              Notes internes
              <textarea name="notes_internal" maxLength={3000} defaultValue={row?.notes_internal || ''} />
            </label>
          </section>
          <section className="panel panel-body">
            <h2>Récapitulatif</h2>
            <label className="field">
              Remise globale (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discount}
                onChange={(e) => {
                  setDiscount(e.target.value);
                  setSimulationInput(null);
                }}
              />
            </label>
            <button
              type="button"
              className="button"
              disabled={simulation.isFetching}
              onClick={(event) => {
                const form = event.currentTarget.form;
                if (form?.reportValidity())
                  setSimulationInput({
                    lines: lines.map(quoteLinePayload),
                    global_discount_pct: Number(discount),
                  });
              }}
            >
              Calculer les totaux
            </button>
            {simulationInput && simulation.isFetching && <Loading />}
            {simulationInput && <ErrorBox error={simulation.error} />}
            {total && (
              <div className="quote-totals">
                <div>
                  <span>Total HT</span>
                  <strong>{money(total.total_ht)}</strong>
                </div>
                <div>
                  <span>TVA</span>
                  <strong>{money(total.total_tax)}</strong>
                </div>
                <div className="grand-total">
                  <span>Total TTC</span>
                  <strong>{money(total.total_ttc)}</strong>
                </div>
                <div>
                  <span>Marge</span>
                  <strong>{total.margin_pct} %</strong>
                </div>
              </div>
            )}
            {simulationInput && simulation.data?.data.approval?.reasons?.length > 0 && (
              <div className="notice warning">
                Validation requise : {simulation.data.data.approval.reasons.join(', ')}.
              </div>
            )}
            <p className="muted">
              L’enregistrement recalcule toujours les montants côté serveur. Le document reste un brouillon
              jusqu’à sa soumission.
            </p>
            <button className="button primary full" disabled={busy}>
              <Save size={16} />
              {busy ? 'Enregistrement…' : 'Enregistrer le brouillon'}
            </button>
          </section>
        </div>
      </form>
    </>
  );
}
