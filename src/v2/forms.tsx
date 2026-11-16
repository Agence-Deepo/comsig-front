import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from './api';
import { useAuth } from './auth';
import type { Field } from './modules';
import { can, label, parseDateTime, toApiDateTime, type Page, type Row } from './types';
import { ActionForm, ErrorBox, Loading } from './ui';

export type FormValue = string | boolean | Row[];
export type Values = Record<string, FormValue>;
export const referenceLabel = (record: Row): string =>
  record.legal_name ||
  record.label ||
  record.name ||
  (record.last_name ? [record.first_name, record.last_name].filter(Boolean).join(' ') : '') ||
  record.title ||
  record.employee_name ||
  record.reference ||
  record.license_number ||
  record.code ||
  String(record.id);
export async function allRecords(path: string, signal?: AbortSignal): Promise<Row[]> {
  const rows: Row[] = [];
  let page = 1;
  while (true) {
    const result = await api.get<Partial<Page> & { data: Row[] }>(
      `/${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`,
      signal,
    );
    rows.push(...result.data);
    if (!result.last_page || page >= result.last_page) return rows;
    if (++page > 100)
      throw new Error('Trop de références pour cette sélection. Utilisez un portefeuille plus ciblé.');
  }
}
export function useOptions(path: string, enabled = true) {
  return useQuery({
    queryKey: ['options', path],
    queryFn: ({ signal }) => allRecords(path, signal),
    enabled,
  });
}
export function initial(field: Field, row?: Row): FormValue {
  if (field.type === 'rows')
    return (
      row?.[field.key] ||
      Array.from({ length: field.minRows || 1 }, () =>
        Object.fromEntries((field.fields || []).map((child) => [child.key, initial(child)])),
      )
    );
  const value = row?.[field.key] ?? field.default ?? (field.type === 'checkbox' ? false : '');
  if (field.type === 'tags') return Array.isArray(value) ? value.join(', ') : String(value);
  if (field.type === 'checkbox') return Boolean(value);
  if (field.type === 'date' && value) return String(value).slice(0, 10);
  if (field.type === 'datetime-local' && value) {
    const timestamp = parseDateTime(value);
    return new Date(timestamp.getTime() - timestamp.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  return String(value);
}
export function serializeFields(fields: Field[], values: Values, row?: Row): Row {
  const payload: Row = {};
  for (const field of fields) {
    const value = values[field.key];
    if (row && JSON.stringify(value) === JSON.stringify(initial(field, row))) continue;
    if (field.type === 'tags') {
      payload[field.key] = [
        ...new Set(
          String(value ?? '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      ];
      continue;
    }
    if (field.type === 'rows') {
      payload[field.key] = (value as Row[]).map((line) => serializeFields(field.fields || [], line));
      continue;
    }
    if (field.type === 'password' && !value) continue;
    if (value === '' && !field.nullable) continue;
    payload[field.key] =
      value === ''
        ? null
        : field.type === 'checkbox'
          ? value
          : field.type === 'number' ||
              ['owner_id', 'role_id', 'department_id', 'service_id', 'user_id'].includes(field.key)
            ? Number(value)
            : field.type === 'datetime-local'
              ? toApiDateTime(String(value))
              : value;
  }
  return payload;
}
function flatten(fields: Field[]): Field[] {
  return fields.flatMap((field) => [field, ...flatten(field.fields || [])]);
}
export function Inputs({
  fields,
  values,
  change,
  lookups,
  prefix = 'field',
  editing = false,
}: {
  fields: Field[];
  values: Values;
  change: (values: Values) => void;
  lookups: Record<string, Row[]>;
  prefix?: string;
  editing?: boolean;
}) {
  return (
    <div className="form-grid">
      {fields.map((field) => {
        const id = `${prefix}-${field.key}`;
        const value = values[field.key] ?? initial(field);
        const required = field.required || (field.key === 'password' && !editing);
        const update = (next: FormValue) =>
          change({
            ...values,
            [field.key]: next,
            ...(field.key === 'organization_id'
              ? Object.fromEntries(
                  ['contact_id', 'primary_contact_id', 'opportunity_id']
                    .filter((key) => fields.some((f) => f.key === key))
                    .map((key) => [key, '']),
                )
              : {}),
          });
        if (field.type === 'rows') {
          const rows = value as Row[];
          const childFields = field.fields || [];
          return (
            <fieldset className="rows-editor wide" key={field.key}>
              <legend>{field.label}</legend>
              {rows.map((line, index) => (
                <div className="rows-editor-row" key={index}>
                  <div className="line-title">
                    <strong>Ligne {index + 1}</strong>
                    <button
                      className="icon-button danger-text"
                      type="button"
                      aria-label={`Supprimer la ligne ${index + 1}`}
                      disabled={rows.length <= (field.minRows || 1)}
                      onClick={() => update(rows.filter((_, i) => i !== index))}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <Inputs
                    fields={childFields}
                    values={Object.fromEntries(
                      childFields.map((child) => [child.key, line[child.key] ?? initial(child)]),
                    )}
                    change={(next) => update(rows.map((old, i) => (i === index ? next : old)))}
                    lookups={lookups}
                    prefix={`${id}-${index}`}
                  />
                </div>
              ))}
              <button
                className="button"
                type="button"
                disabled={rows.length >= 100}
                onClick={() =>
                  update([
                    ...rows,
                    Object.fromEntries(childFields.map((child) => [child.key, initial(child)])),
                  ])
                }
              >
                <Plus size={15} />
                Ajouter une ligne
              </button>
              {field.hint && <p className="muted">{field.hint}</p>}
            </fieldset>
          );
        }
        const options = field.lookup
          ? (lookups[field.lookup] || [])
              .filter(
                (r) =>
                  !['contact_id', 'opportunity_id'].includes(field.key) ||
                  !values.organization_id ||
                  r.organization_id === values.organization_id,
              )
              .map((record) => ({
                value: String(record.id),
                label: referenceLabel(record),
              }))
          : (field.options || []).map((option) =>
              typeof option === 'string' ? { value: option, label: label(option) } : option,
            );
        const props = {
          id,
          name: field.key,
          required,
          'aria-describedby': field.hint ? `${id}-hint` : undefined,
        };
        return (
          <div className={`field ${field.type === 'textarea' || field.wide ? 'wide' : ''}`} key={field.key}>
            <label htmlFor={id}>
              {field.label}
              {required ? ' *' : ''}
            </label>
            {field.type === 'checkbox' ? (
              <input
                {...props}
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => update(e.target.checked)}
              />
            ) : field.type === 'textarea' ? (
              <textarea {...props} rows={3} value={String(value)} onChange={(e) => update(e.target.value)} />
            ) : field.type === 'select' ? (
              <select {...props} value={String(value)} onChange={(e) => update(e.target.value)}>
                <option value="">Sélectionner…</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...props}
                type={field.type === 'tags' ? 'text' : field.type || 'text'}
                value={String(value)}
                min={field.min}
                max={field.max}
                step={field.step}
                maxLength={field.maxLength}
                minLength={field.type === 'password' ? 12 : undefined}
                autoComplete={field.type === 'password' ? 'new-password' : undefined}
                onChange={(e) => update(e.target.value)}
              />
            )}
            {field.hint && <small id={`${id}-hint`}>{field.hint}</small>}
          </div>
        );
      })}
    </div>
  );
}
export function RecordForm({
  title,
  fields: rawFields,
  path,
  row,
  close,
  saved,
  onValuesChange,
  submitLabel = 'Enregistrer',
}: {
  title: string;
  fields: Field[];
  path: string;
  row?: Row;
  close: () => void;
  saved?: (row: Row) => void;
  onValuesChange?: (values: Values) => void;
  submitLabel?: string;
}) {
  const fields = rawFields.filter((field) => !row || !field.createOnly);
  const { user } = useAuth();
  const qc = useQueryClient();
  const [values, setValues] = useState<Values>(() =>
    Object.fromEntries(fields.map((field) => [field.key, initial(field, row)])),
  );
  const sources = [...new Set(flatten(fields).flatMap((field) => (field.lookup ? [field.lookup] : [])))];
  const lookups = useQuery({
    queryKey: ['form-options', sources],
    queryFn: async ({ signal }) => {
      const result: Record<string, Row[]> = {};
      for (const source of sources) {
        if (['organizations', 'contacts'].includes(source) && !can(user, 'organizations.view')) continue;
        if (source === 'opportunities' && !can(user, 'opportunities.view')) continue;
        result[source] = await allRecords(source, signal);
      }
      return result;
    },
    enabled: sources.length > 0,
  });
  const boms = useOptions('erp/boms', path === '/erp/production-orders');
  return (
    <ActionForm
      title={title}
      close={close}
      submitLabel={submitLabel}
      submit={async () => {
        if (sources.length && lookups.isLoading) throw new Error('Chargement des références en cours.');
        if (sources.length && lookups.error) throw lookups.error;
        const payload = serializeFields(fields, values, row);
        const response = row ? await api.patch(`${path}/${row.id}`, payload) : await api.post(path, payload);
        await qc.invalidateQueries();
        saved?.(response.data);
      }}
    >
      <ErrorBox error={lookups.error} retry={() => void lookups.refetch()} />
      {path === '/erp/production-orders' && (
        <>
          <label className="field">
            Importer une nomenclature
            <select
              defaultValue=""
              onChange={(e) => {
                const bom = boms.data?.find((item) => item.id === e.target.value);
                if (!bom) return;
                const quantity = Number(values.quantity || 1);
                setValues({
                  ...values,
                  output_stock_item_id: bom.output_stock_item_id,
                  materials: bom.materials.map((line: Row) => ({
                    stock_item_id: line.stock_item_id,
                    quantity: (Number(line.quantity) * quantity).toFixed(4),
                  })),
                });
              }}
            >
              <option value="">Saisie manuelle des matières</option>
              {boms.data?.map((bom) => (
                <option key={bom.id} value={bom.id}>
                  {bom.label}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            L’import multiplie les quantités par le lot actuel. Réimportez la nomenclature si vous changez
            ensuite la quantité à fabriquer.
          </p>
          <ErrorBox error={boms.error} />
        </>
      )}
      {sources.length && lookups.isLoading ? (
        <Loading />
      ) : (
        <Inputs
          fields={fields}
          values={values}
          change={(next) => {
            setValues(next);
            onValuesChange?.(next);
          }}
          lookups={lookups.data || {}}
          editing={Boolean(row)}
        />
      )}
    </ActionForm>
  );
}
