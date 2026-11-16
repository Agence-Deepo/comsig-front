import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, HttpError, queryString } from './api';
import { ActionForm, ErrorBox, Loading } from './ui';
import { Inputs, initial, serializeFields, type Values } from './forms';
import { customerFields } from './customerFields';
import type { Page, Row } from './types';
import { useCustomerReferences } from './CustomerReferences';
import type { Field } from './modules';

export function DuplicateList({ rows }: { rows: Row[] }) {
  return (
    <div className="customer-duplicates" role="region" aria-label="Doublons possibles">
      <strong>Fiches similaires dans votre périmètre</strong>
      <p className="small muted">
        Vérifiez les fiches avant de créer une autre organisation. Aucune fusion automatique.
      </p>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            <Link to={'/clients/' + r.id} target="_blank" rel="noreferrer">
              {r.ref} — {r.legal_name}
            </Link>
            <div className="small muted">{r.reasons.join(' · ')}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CustomerForm({
  row,
  prospection = false,
  close,
  saved,
}: {
  row?: Row;
  prospection?: boolean;
  close: () => void;
  saved?: (row: Row) => void;
}) {
  const references = useCustomerReferences();
  const fields: Field[] = customerFields
    .map((field): Field => {
      if (!['sector', 'commune', 'structure_type', 'source'].includes(field.key)) return field;
      const options = (references.data?.data ?? [])
        .filter((r) => r.list === field.key)
        .map((r) => ({ value: r.code, label: r.label }));
      if (row?.[field.key] && !options.some((o) => o.value === row[field.key]))
        options.push({ value: row[field.key], label: row[field.key] + ' (valeur conservée)' });
      return { ...field, type: 'select', options };
    })
    .map((f) => (prospection && f.key === 'kind' ? { ...f, options: ['prospect'], default: 'prospect' } : f));
  const [values, setValues] = useState<Values>(() =>
    Object.fromEntries(fields.map((f) => [f.key, initial(f, row)])),
  );
  const [duplicates, setDuplicates] = useState<Row[]>([]);
  const [checkError, setCheckError] = useState<unknown>(null);
  const [ignore, setIgnore] = useState(false);
  const [reason, setReason] = useState('');
  const qc = useQueryClient();
  const identity = JSON.stringify(
    Object.fromEntries(
      ['legal_name', 'phone', 'email', 'legal_id', 'ncc'].map((k) => [k, values[k] || null]),
    ),
  );
  useEffect(() => {
    let active = true;
    setIgnore(false);
    setDuplicates([]);
    setCheckError(null);
    const timer = setTimeout(() => {
      if (!Object.values(JSON.parse(identity)).some(Boolean)) return;
      api
        .post<{ data: Row[] }>('/organizations/check-duplicates', {
          ...JSON.parse(identity),
          exclude_id: row?.id,
        })
        .then((r) => {
          if (active) setDuplicates(r.data);
        })
        .catch((e) => {
          if (active) setCheckError(e);
        });
    }, 450);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [identity, row?.id]);
  return (
    <ActionForm
      title={row ? `Modifier ${row.legal_name}` : 'Nouvelle organisation'}
      close={close}
      submitLabel="Enregistrer"
      submit={async () => {
        // Les référentiels n'alimentent que des listes facultatives : leur chargement
        // ne doit jamais empêcher d'enregistrer une fiche déjà saisie.
        const payload = {
          ...serializeFields(fields, values, row),
          ignore_duplicates: ignore,
          duplicate_justification: reason || null,
        };
        try {
          const response = row
            ? await api.patch('/organizations/' + row.id, payload)
            : await api.post('/organizations', payload);
          await qc.invalidateQueries();
          saved?.(response.data);
        } catch (e) {
          if (e instanceof HttpError && Array.isArray(e.details.duplicates))
            setDuplicates(e.details.duplicates);
          throw e;
        }
      }}
    >
      <ErrorBox error={references.error} retry={() => void references.refetch()} />
      <Inputs fields={fields} values={values} change={setValues} lookups={{}} editing={Boolean(row)} />
      <ErrorBox error={checkError} />
      {duplicates.length > 0 && (
        <>
          <DuplicateList rows={duplicates} />
          <label className="field customer-confirm">
            <span>Il s’agit bien d’une fiche distincte</span>
            <input type="checkbox" checked={ignore} onChange={(e) => setIgnore(e.target.checked)} />
          </label>
          {ignore && (
            <label className="field">
              Justification de la fiche distincte
              <textarea
                required
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
          )}
        </>
      )}
    </ActionForm>
  );
}

export function MergeCustomerForm({
  target,
  close,
  saved,
}: {
  target: Row;
  close: () => void;
  saved: () => void;
}) {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [preview, setPreview] = useState<Row | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [checking, setChecking] = useState(false);
  const sources = useQuery({
    queryKey: ['merge-sources', search],
    queryFn: ({ signal }) =>
      api.get<Page>('/organizations' + queryString({ q: search, per_page: 25 }), signal),
  });
  return (
    <ActionForm
      title="Fusion contrôlée"
      close={close}
      submitLabel="Confirmer la fusion"
      submit={async (form) => {
        if (!preview || checking) throw new Error('Calculez l’aperçu de la fusion avant de confirmer.');
        if (preview.blockers.length) throw new Error('Résolvez les blocages indiqués avant de fusionner.');
        await api.post(`/organizations/${target.id}/merge`, {
          source_id: source,
          preview_token: preview.preview_token,
          source_ref: form.get('source_ref'),
          justification: form.get('justification'),
          confirm_identity: form.get('confirm_identity') === 'on',
        });
        saved();
      }}
    >
      <p>
        <strong>
          Fiche conservée : {target.ref} — {target.legal_name}
        </strong>
      </p>
      <p className="small muted">
        Les valeurs renseignées de cette fiche sont conservées. La source sera archivée, jamais effacée
        physiquement. Cette opération n’est pas annulable depuis l’interface.
      </p>
      <div className="field">
        <label htmlFor="merge-search">Rechercher une fiche source</label>
        <input
          id="merge-search"
          disabled={checking}
          value={search}
          maxLength={200}
          onChange={(e) => {
            setSearch(e.target.value);
            setSource('');
            setPreview(null);
          }}
        />
      </div>
      <ErrorBox error={sources.error} />
      <div className="field">
        <label htmlFor="merge-source">Fiche source à archiver</label>
        <select
          id="merge-source"
          disabled={checking}
          required
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setPreview(null);
            setError(null);
          }}
        >
          <option value="">Sélectionner…</option>
          {sources.data?.data
            .filter((r) => r.id !== target.id)
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.ref} — {r.legal_name}
              </option>
            ))}
        </select>
        <small>25 résultats maximum ; affinez la recherche si nécessaire.</small>
      </div>
      <button
        className="button"
        type="button"
        disabled={!source || checking}
        onClick={async () => {
          setChecking(true);
          setPreview(null);
          setError(null);
          try {
            setPreview(
              (await api.post(`/organizations/${target.id}/merge-preview`, { source_id: source })).data,
            );
          } catch (e) {
            setError(e);
          } finally {
            setChecking(false);
          }
        }}
      >
        Calculer l’aperçu
      </button>
      {checking && <Loading />}
      <ErrorBox error={error} />
      {preview && (
        <section aria-label="Aperçu de la fusion" className="customer-duplicates">
          <strong>
            {preview.source.ref} → {preview.target.ref}
          </strong>
          {preview.blockers.length > 0 ? (
            <ul role="alert">
              {preview.blockers.map((text: string) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          ) : (
            <>
              <p>Dossiers à rattacher, corbeille incluse :</p>
              <ul>
                {Object.entries(preview.moved).map(([key, value]) => (
                  <li key={key}>
                    {
                      (
                        {
                          contacts: 'Contacts',
                          opportunities: 'Opportunités',
                          activities: 'Interactions',
                          tasks: 'Tâches',
                          quotes: 'Devis brouillons',
                          invoices: 'Factures',
                          projects: 'Projets',
                          campaigns: 'Campagnes',
                          attachments: 'Documents',
                          contracts: 'Contrats brouillons',
                          complaints: 'Réclamations',
                        } as Record<string, string>
                      )[key]
                    }{' '}
                    : {String(value)}
                  </li>
                ))}
              </ul>
              <p className="small">
                Champs vides complétés :{' '}
                {preview.filled_fields
                  .map((key: string) => customerFields.find((f) => f.key === key)?.label ?? key)
                  .join(', ') || 'aucun'}
                . Les noms de fichiers identiques reçoivent des numéros de version distincts ; aucun fichier
                n’est écrasé.
              </p>
              <label className="field">
                Référence de la source à confirmer
                <input name="source_ref" required maxLength={40} placeholder={preview.source.ref} />
              </label>
              <label className="field">
                Justification de la fusion
                <textarea name="justification" required minLength={10} maxLength={1000} />
              </label>
              <label className="field customer-confirm">
                <span>Je confirme que ces deux fiches représentent la même organisation</span>
                <input type="checkbox" name="confirm_identity" required />
              </label>
            </>
          )}
        </section>
      )}
    </ActionForm>
  );
}
