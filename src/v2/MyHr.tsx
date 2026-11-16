import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, UserRound } from 'lucide-react';

import { Card, DataTable, type Column } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { can, date, today, type Row } from './types';
import { ActionForm, Empty, ErrorBox, PageTitle, Status } from './ui';
import { useQueryClient } from '@tanstack/react-query';

const LEAVE_KINDS: [string, string][] = [
  ['annuel', 'Congé annuel'],
  ['maladie', 'Maladie'],
  ['exceptionnel', 'Exceptionnel'],
  ['sans_solde', 'Sans solde'],
];

export default function MyHr() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [requesting, setRequesting] = useState(false);
  const [checking, setChecking] = useState(false);
  const overview = useQuery({
    queryKey: ['my-hr'],
    queryFn: ({ signal }) => api.get<{ data: Row }>('/my-hr', signal),
  });
  const data = overview.data?.data;
  const leaveColumns: Column<Row>[] = [
    {
      key: 'period',
      label: 'Période',
      render: (row) => (
        <>
          <div className="cell-title">
            {date(row.starts_on)} → {date(row.ends_on)}
          </div>
          <div className="cell-sub">
            {LEAVE_KINDS.find(([value]) => value === row.kind)?.[1] ?? row.kind} · {row.days} jour(s)
          </div>
        </>
      ),
    },
    { key: 'reason', label: 'Motif' },
    { key: 'status', label: 'Statut', render: (row) => <Status value={row.status} /> },
    {
      key: 'action',
      label: '',
      render: (row) =>
        row.status === 'demande' ? (
          <button
            className="button"
            onClick={async () => {
              await api.post(`/my-hr/leave-requests/${row.id}/cancel`);
              await qc.invalidateQueries({ queryKey: ['my-hr'] });
            }}
          >
            Annuler
          </button>
        ) : null,
    },
  ];
  const attendanceColumns: Column<Row>[] = [
    { key: 'day', label: 'Jour', render: (row) => date(row.day) },
    { key: 'kind', label: 'Type', render: (row) => <Status value={row.kind} /> },
    { key: 'check_in', label: 'Arrivée' },
    { key: 'check_out', label: 'Départ' },
  ];
  const employee = data?.employee;
  const alreadyToday = (data?.attendance ?? []).some((row: Row) => String(row.day).slice(0, 10) === today());
  return (
    <>
      <PageTitle
        eyebrow="MON ESPACE"
        title="Pointage et congés"
        description="Votre dossier salarié, vos demandes de congé et vos pointages. Les validations restent aux ressources humaines puis à la direction."
        actions={
          employee ? (
            <>
              <button className="button" disabled={alreadyToday} onClick={() => setChecking(true)}>
                Pointer mon arrivée
              </button>
              <button className="button primary" onClick={() => setRequesting(true)}>
                Nouvelle demande de congé
              </button>
            </>
          ) : undefined
        }
      />
      <ErrorBox error={overview.error} retry={() => void overview.refetch()} />
      {!employee && !overview.isLoading && (
        <Card>
          <Empty>
            Aucun dossier salarié n’est rattaché à votre compte. Contactez les ressources humaines pour le
            rattachement.
          </Empty>
        </Card>
      )}
      {employee && (
        <>
          <Card
            title={
              <span className="card-title-icon">
                <UserRound size={18} />
                {employee.name}
              </span>
            }
            sub={`${employee.job_title} · ${employee.contract_type} · entré le ${date(employee.hire_date)}`}
          >
            <div className="quote-totals">
              <div>
                <span>Matricule</span>
                <strong>{employee.code}</strong>
              </div>
              <div className="grand-total">
                <span>Solde de congés</span>
                <strong>{Number(employee.leave_balance).toLocaleString('fr-CI')} jour(s)</strong>
              </div>
              <div>
                <span>Demandes en attente</span>
                <strong>{data?.meta?.pending ?? 0}</strong>
              </div>
              <div>
                <span>Congés approuvés</span>
                <strong>{data?.meta?.approved ?? 0}</strong>
              </div>
            </div>
            <p className="xsmall muted">
              Le solde est débité uniquement à l’approbation de la direction. Votre demande suit le circuit RH
              habituel : aucun automatisme ne l’approuve.
            </p>
          </Card>
          <Card className="myhr-leave" title="Mes demandes de congé" flush>
            <DataTable
              columns={leaveColumns}
              rows={data?.leave_requests}
              loading={overview.isLoading}
              caption="Mes demandes de congé"
              empty={<Empty>Aucune demande enregistrée.</Empty>}
            />
          </Card>
          <Card className="myhr-attendance" title="Mes pointages récents" flush>
            <DataTable
              columns={attendanceColumns}
              rows={data?.attendance}
              loading={overview.isLoading}
              caption="Mes pointages"
              empty={<Empty>Aucun pointage enregistré.</Empty>}
            />
            {alreadyToday && (
              <p className="xsmall muted panel-body">
                <AlertTriangle size={13} /> Votre arrivée est déjà pointée aujourd’hui. Une correction relève
                des ressources humaines.
              </p>
            )}
          </Card>
          <p className="xsmall muted">
            {can(user, 'hr.view') ? (
              <Link to="/effectif">Ouvrir le module RH complet</Link>
            ) : (
              'Les données des autres collaborateurs ne sont pas accessibles depuis cet espace.'
            )}
          </p>
        </>
      )}
      {requesting && (
        <ActionForm
          title="Nouvelle demande de congé"
          submitLabel="Envoyer la demande"
          close={() => setRequesting(false)}
          submit={async (form) => {
            await api.post('/my-hr/leave-requests', Object.fromEntries(form));
            await qc.invalidateQueries({ queryKey: ['my-hr'] });
          }}
        >
          <label className="field">
            Type de congé *
            <select name="kind" required defaultValue="annuel">
              {LEAVE_KINDS.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Du *
            <input name="starts_on" type="date" required min={today()} />
          </label>
          <label className="field">
            Au *
            <input name="ends_on" type="date" required min={today()} />
          </label>
          <label className="field">
            Motif *
            <textarea name="reason" required maxLength={2000} />
          </label>
          <p className="muted">
            Votre demande est transmise aux ressources humaines, puis à la direction. Vous pouvez l’annuler
            tant qu’aucun avis n’a été rendu.
          </p>
        </ActionForm>
      )}
      {checking && (
        <ActionForm
          title="Pointer mon arrivée"
          submitLabel="Enregistrer le pointage"
          close={() => setChecking(false)}
          submit={async (form) => {
            await api.post('/my-hr/attendance', Object.fromEntries(form));
            await qc.invalidateQueries({ queryKey: ['my-hr'] });
          }}
        >
          <label className="field">
            Heure d’arrivée *
            <input
              name="check_in"
              type="time"
              required
              defaultValue={new Date().toTimeString().slice(0, 5)}
            />
          </label>
          <label className="field">
            Situation
            <select name="kind" defaultValue="present">
              <option value="present">Présent sur site</option>
              <option value="retard">Arrivée tardive</option>
              <option value="mission">En mission</option>
            </select>
          </label>
          <p className="muted">
            Un seul pointage par jour. Toute correction est réservée aux ressources humaines et motivée.
          </p>
        </ActionForm>
      )}
    </>
  );
}
