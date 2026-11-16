import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { RecordForm } from './forms';
import { can, date, type Page, type Row } from './types';
import { Empty, ErrorBox, Loading, PageTitle, Pager } from './ui';

export function Departments() {
  const { user } = useAuth();
  const [edit, setEdit] = useState<Row | 'new' | null>(null);
  const result = useQuery({ queryKey: ['departments'], queryFn: () => api.get('/departments') });
  return (
    <>
      <PageTitle
        title="Services & départements"
        description="Les services actifs de COMSIG et leurs rattachements."
        actions={
          can(user, 'admin.update') && (
            <button className="button primary" onClick={() => setEdit('new')}>
              <Plus size={16} />
              Créer un service
            </button>
          )
        }
      />
      <ErrorBox error={result.error} />
      {result.isLoading ? (
        <Loading />
      ) : (
        <div className="module-grid">
          {result.data?.data.map((row: Row) => (
            <section className="panel module-card" key={row.id}>
              <span className="eyebrow">{row.code}</span>
              <h2>{row.label}</h2>
              {can(user, 'admin.update') && (
                <button className="button" onClick={() => setEdit(row)}>
                  Modifier
                </button>
              )}
            </section>
          ))}
        </div>
      )}
      {edit && (
        <RecordForm
          title={edit === 'new' ? 'Créer un service' : 'Modifier le service'}
          fields={
            edit === 'new'
              ? [
                  { key: 'code', label: 'Code (minuscules, sans espace)', required: true, maxLength: 50 },
                  { key: 'label', label: 'Nom du service', required: true },
                ]
              : [
                  { key: 'label', label: 'Nom du service', required: true },
                  {
                    key: 'is_active',
                    label: 'Service actif',
                    type: 'checkbox',
                    hint: 'Un service désactivé disparaît de cette liste. Le serveur refuse la désactivation si des comptes actifs y sont rattachés.',
                  },
                ]
          }
          path="/admin/departments"
          row={edit === 'new' ? undefined : edit}
          close={() => setEdit(null)}
        />
      )}
    </>
  );
}
export function Audit() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [input, setInput] = useState('');
  const result = useQuery({
    queryKey: ['audit', page, action],
    queryFn: () => api.get<Page>(`/admin/audit-logs${queryString({ page, action, per_page: 25 })}`),
  });
  return (
    <>
      <PageTitle
        title="Journal d’audit"
        description="Consultation seule des événements enregistrés par le serveur."
      />
      <section className="panel">
        <form
          className="toolbar search-form"
          onSubmit={(e) => {
            e.preventDefault();
            setAction(input);
            setPage(1);
          }}
        >
          <input
            aria-label="Filtrer par action exacte"
            placeholder="Action exacte, ex. login ou create"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="button">Filtrer</button>
        </form>
        {result.isLoading ? (
          <Loading />
        ) : result.error ? (
          <ErrorBox error={result.error} />
        ) : !result.data?.data.length ? (
          <Empty>Aucun événement pour ce filtre.</Empty>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Utilisateur</th>
                  <th>Ressource</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {result.data.data.map((row) => (
                  <tr key={row.id}>
                    <td>{date(row.created_at)}</td>
                    <td>
                      <code>{row.action}</code>
                    </td>
                    <td>{row.user_id || '—'}</td>
                    <td>
                      {row.entity_type || '—'}
                      <small className="block">{row.entity_id}</small>
                    </td>
                    <td>
                      <details>
                        <summary>Consulter</summary>
                        <pre>{JSON.stringify(row.details || {}, null, 2)}</pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={result.data} change={setPage} />
      </section>
    </>
  );
}
