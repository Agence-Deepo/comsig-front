import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui';
import { api } from './api';
import { ActionForm, ErrorBox, Loading } from './ui';

type Sequence = { id: number; status: string; interval_days: number; max_reminders: number; sent_count: number; next_date: string; stop_reason: string | null };

export default function OpportunityReminders({ id, canCreate }: { id: string; canCreate: boolean }) {
  const [modal, setModal] = useState(false);
  const [stop, setStop] = useState<number | null>(null);
  const qc = useQueryClient();
  const key = ['opportunity-reminders', id];
  const q = useQuery({ queryKey: key, queryFn: () => api.get<{ data: Sequence[] }>(`/opportunities/${id}/reminders`) });
  const active = q.data?.data.find(s => s.status === 'active');
  return <Card title="Rappels internes récurrents" actions={canCreate && !active && <button className="btn" onClick={() => setModal(true)}>Configurer une séquence</button>}>
    <p className="small muted">Notifications internes uniquement, sans e-mail ni message au client. La séquence s’arrête si l’affaire est clôturée ou suspendue, ou si le contact s’y oppose. Les rappels dépendent du planificateur serveur.</p>
    <ErrorBox error={q.error} />
    {q.isLoading ? <Loading /> : !q.data?.data.length ? <p>Aucune séquence configurée.</p> : q.data.data.map(s => <div className="row-wrap" key={s.id}>
      <span>{s.status === 'active' ? 'Active' : s.status === 'completed' ? 'Terminée' : 'Arrêtée'} · {s.sent_count}/{s.max_reminders} rappels · tous les {s.interval_days} jour(s){s.status === 'active' ? ` · prochain : ${s.next_date}` : ''}</span>
      {canCreate && s.status === 'active' && <button className="btn" onClick={() => setStop(s.id)}>Arrêter</button>}
    </div>)}
    {modal && <ActionForm title="Configurer les rappels internes" close={() => setModal(false)} submitLabel="Activer" submit={async f => {
      await api.post(`/opportunities/${id}/reminders`, { first_date: f.get('first_date'), interval_days: Number(f.get('interval_days')), max_reminders: Number(f.get('max_reminders')) });
      await qc.invalidateQueries({ queryKey: key });
    }}>
      <label className="field">Premier rappel<input type="date" name="first_date" required /></label>
      <label className="field">Intervalle en jours<input type="number" name="interval_days" min={1} max={365} required /></label>
      <label className="field">Nombre maximum de rappels<input type="number" name="max_reminders" min={1} max={20} required /></label>
      <p>Aucun client ne sera contacté automatiquement.</p>
    </ActionForm>}
    {stop !== null && <ActionForm title="Arrêter la séquence ?" close={() => setStop(null)} submitLabel="Arrêter" submit={async () => {
      await api.post(`/opportunities/${id}/reminders/${stop}/stop`); await qc.invalidateQueries({ queryKey: key });
    }}><p>Les notifications déjà créées ne sont pas supprimées.</p></ActionForm>}
  </Card>;
}
