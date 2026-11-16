import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Button, DataTable, Select, PageHeader } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { can, type Row } from './types';
import { ActionForm, ErrorBox, Loading } from './ui';

export const referenceLists: Record<string, string> = {
  sector: 'Secteurs',
  commune: 'Communes',
  structure_type: 'Types de structure',
  source: 'Sources d’acquisition',
};
export function useCustomerReferences() {
  return useQuery({
    queryKey: ['customer-references'],
    queryFn: () => api.get<{ data: Row[] }>('/customer-references'),
  });
}
export function referenceLabel(rows: Row[] | undefined, list: string, value: unknown) {
  return (
    rows?.find((r) => r.list === list && (r.code === value || r.label === value))?.label ??
    String(value ?? '—')
  );
}
export default function CustomerReferences() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [list, setList] = useState('sector');
  const [edit, setEdit] = useState<Row | 'new' | null>(null);
  const q = useQuery({
    queryKey: ['customer-references-admin'],
    queryFn: () => api.get<{ data: Row[] }>('/customer-references?include_inactive=1'),
    enabled: can(user, 'admin.view'),
  });
  if (!can(user, 'admin.view'))
    return <Card title="Accès non autorisé">Ces listes sont administrées par un profil autorisé.</Card>;
  return (
    <>
      <PageHeader
        title="Référentiels clients"
        subtitle="Codes stables, libellés et valeurs désactivables ; aucune réécriture des anciennes fiches."
        actions={
          can(user, 'admin.update') && (
            <Button variant="primary" onClick={() => setEdit('new')}>
              Ajouter une valeur
            </Button>
          )
        }
      />
      <Card>
        <Select
          aria-label="Liste de référence"
          value={list}
          onChange={(e) => setList(e.target.value)}
          options={Object.entries(referenceLists).map(([value, label]) => ({ value, label }))}
        />
        <ErrorBox error={q.error} retry={() => void q.refetch()} />
        {q.isLoading && <Loading />}
        <DataTable
          rows={q.data?.data.filter((r) => r.list === list)}
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'label', label: 'Libellé' },
            { key: 'active', label: 'État', render: (r) => (r.is_active ? 'Actif' : 'Désactivé') },
            { key: 'order', label: 'Ordre', render: (r) => r.sort_order },
            {
              key: 'actions',
              label: '',
              render: (r) =>
                can(user, 'admin.update') && (
                  <Button size="sm" onClick={() => setEdit(r)}>
                    Modifier
                  </Button>
                ),
            },
          ]}
        />
      </Card>
      {edit && (
        <ActionForm
          title={edit === 'new' ? 'Ajouter une valeur' : 'Modifier une valeur'}
          close={() => setEdit(null)}
          submitLabel="Enregistrer"
          submit={async (form) => {
            const data = {
              list,
              code: form.get('code'),
              label: form.get('label'),
              sort_order: Number(form.get('sort_order')),
              is_active: form.get('is_active') === 'on',
            };
            edit === 'new'
              ? await api.post('/customer-references', data)
              : await api.patch('/customer-references/' + edit.id, data);
            await qc.invalidateQueries();
          }}
        >
          <label className="field">
            Code
            <input
              name="code"
              required
              maxLength={60}
              readOnly={edit !== 'new'}
              defaultValue={edit === 'new' ? '' : edit.code}
            />
          </label>
          <label className="field">
            Libellé
            <input name="label" required maxLength={100} defaultValue={edit === 'new' ? '' : edit.label} />
          </label>
          <label className="field">
            Ordre
            <input
              name="sort_order"
              type="number"
              min={0}
              max={10000}
              required
              defaultValue={edit === 'new' ? 0 : edit.sort_order}
            />
          </label>
          <label className="field customer-confirm">
            <span>Valeur active</span>
            <input type="checkbox" name="is_active" defaultChecked={edit === 'new' || edit.is_active} />
          </label>
        </ActionForm>
      )}
    </>
  );
}
