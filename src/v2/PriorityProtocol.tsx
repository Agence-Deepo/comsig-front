import { useQuery } from '@tanstack/react-query';
import { Card, PageHeader } from '../components/ui';
import { api } from './api';
import { ErrorBox, Loading } from './ui';

export default function PriorityProtocol() {
  const q = useQuery({ queryKey: ['priority-protocol'], queryFn: () => api.get('/priority-protocol') });
  return <><PageHeader title="Protocole des priorités" subtitle="Une règle commune pour qualifier, affecter et traiter les tâches sans ambiguïté." /><ErrorBox error={q.error} />{q.isLoading && <Loading />}
    <div className="grid-4">{q.data?.levels?.map((x: any) => <Card key={x.level} title={`P${x.level} · ${x.label}`} sub={`${q.data.stats.find((s: any) => s.level === x.level)?.open ?? 0} ouverte(s)`}><p>{x.rule}</p></Card>)}</div>
    <Card title="Règles d’usage"><ol><li>La personne qui crée une tâche choisit explicitement P1 à P5.</li><li>P1 est réservé aux incidents, à la sécurité et aux blocages majeurs.</li><li>Toute délégation conserve un responsable et une échéance visibles.</li><li>Les tâches urgentes et importantes passent avant les tâches seulement urgentes.</li><li>Le responsable du service arbitre les conflits de capacité.</li></ol></Card>
  </>;
}
