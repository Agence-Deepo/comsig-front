import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button, Card, PageHeader } from '../components/ui';
import { api, queryString } from './api';
import { useAuth } from './auth';
import { can, dateTime, type Page } from './types';
import { ErrorBox } from './ui';

type View = 'retard' | 'aujourdhui' | 'semaine';
const views: { id: View; label: string }[] = [
  { id: 'retard', label: 'Mes activités en retard' },
  { id: 'aujourdhui', label: 'Mes activités du jour' },
  { id: 'semaine', label: 'Mes activités des 7 prochains jours' },
];

export default function LocalAssistant() {
  const { user } = useAuth();
  const [view, setView] = useState<View | null>(null);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const allowed = can(user, 'activities.view');
  const assistantStatus = useQuery({ queryKey: ['assistant-status'], queryFn: () => api.get<{ available: boolean }>('/assistant/status') });
  const ask = useMutation({ mutationFn: () => api.post<{ answer: string }>('/assistant/ask', { message, consent }) });
  const activities = useQuery({
    queryKey: ['local-assistant-activities', user?.id, view],
    queryFn: () => api.get<Page>('/activities' + queryString({ mine: 1, period: view, status_group: 'ouvertes', per_page: 10 })),
    enabled: allowed && view !== null,
    staleTime: 0,
  });
  return <>
    <PageHeader title="Mon assistant" subtitle="Raccourcis personnels à la demande" />
    <Card>
      <h2>Assistant IA via OpenRouter</h2>
      <p>Seul le texte saisi ci-dessous est transmis à OpenRouter et au fournisseur du modèle choisi. Les données du CRM ne sont pas ajoutées automatiquement. Évite les données confidentielles ou personnelles sans autorisation.</p>
      <ErrorBox error={assistantStatus.error} retry={() => void assistantStatus.refetch()} />
      {assistantStatus.data && !assistantStatus.data.available && <p>Connexion désactivée ou non configurée par l’administrateur.</p>}
      {assistantStatus.data?.available && <form onSubmit={event => { event.preventDefault(); ask.mutate(); }}>
        <label className="field">Votre question<textarea value={message} onChange={e => setMessage(e.target.value)} required maxLength={4000} rows={4} /></label>
        <label><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required /> J’accepte la transmission de cette question au fournisseur externe.</label>
        <div><Button type="submit" variant="primary" disabled={ask.isPending || !message.trim() || !consent}>{ask.isPending ? 'Envoi…' : 'Poser la question'}</Button></div>
        <ErrorBox error={ask.error} />
        {ask.data && <section aria-live="polite"><h3>Réponse</h3><p style={{whiteSpace:'pre-wrap'}}>{ask.data.answer}</p><p className="muted">Vérifiez les réponses avant de les utiliser.</p></section>}
      </form>}
    </Card>
    <Card>
      <p>Assistant local fondé sur des règles : ce n’est pas une intelligence artificielle. Les données ne sont consultées que lorsque vous choisissez une action et ne sont envoyées à aucun service externe.</p>
      {allowed ? <>
        <div className="row-wrap">{views.map(item => <Button key={item.id} onClick={() => {
          if (view === item.id) void activities.refetch(); else setView(item.id);
        }}>{item.label}</Button>)}</div>
        {view && <section aria-live="polite">
          <h2>{views.find(item => item.id === view)?.label}</h2>
          <ErrorBox error={activities.error} retry={() => void activities.refetch()} />
          {activities.isFetching && <p>Chargement…</p>}
          {!activities.isFetching && !activities.error && activities.data && <>
            <p>{activities.data.total} activité(s) ouverte(s). {activities.data.total > activities.data.data.length && 'Voici les 10 premières.'}</p>
            <ul>{activities.data.data.map(item => <li key={item.id}><Link to={'/activites/' + item.id}>{item.title}</Link> — {dateTime(item.due_at)}</li>)}</ul>
            <Link to={'/activites?period=' + view + '&status=ouvertes&scope=mine'}>Ouvrir la liste complète</Link>
          </>}
        </section>}
      </> : <p>Votre profil ne dispose pas de l’accès aux activités.</p>}
      <p><Link to="/messagerie">Ouvrir la messagerie interne</Link> · <Link to="/todo">Ouvrir mes tâches</Link></p>
      <p className="muted">La messagerie interne n’envoie pas de courrier électronique externe.</p>
    </Card>
  </>;
}
