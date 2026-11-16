import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { useAuth } from './auth';
import { ActionForm, Empty, ErrorBox, Loading, PageTitle } from './ui';

type Tier = { from_pct: number; rate: number };
type Plan = { id: number; name: string; base: string; tiers: string | Tier[] };

function tiersOf(plan: Plan): Tier[] {
  return typeof plan.tiers === 'string' ? JSON.parse(plan.tiers) : plan.tiers;
}

export default function CommissionPlansAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [edit, setEdit] = useState<Plan | 'new' | null>(null);
  const result = useQuery({ queryKey: ['admin-commission-plans'], queryFn: () => api.get<{ data: Plan[] }>('/admin/commission-plans'), enabled: user?.role?.code === 'superadmin' });
  if (user?.role?.code !== 'superadmin') return <PageTitle title="Accès non autorisé" description="La configuration des commissions est réservée au superadministrateur." />;
  return <>
    <PageTitle title="Taux de commission" description="Configurez les paliers de commission ; aucun taux n’est imposé par défaut." actions={<button className="button primary" onClick={() => setEdit('new')}>Créer un plan</button>} />
    <section className="panel">
      <p>Les nouveaux plans utilisent les encaissements validés. Modifier un plan crée une nouvelle version : la direction doit ensuite l’affecter aux commerciaux depuis Performance pour le mois souhaité. Les affectations et relevés existants restent inchangés.</p>
      <ErrorBox error={result.error} />
      {result.isLoading ? <Loading /> : !result.data?.data.length ? <Empty>Aucun plan configuré.</Empty> : result.data.data.map((plan) => <div className="row-wrap" key={plan.id}>
        <div><strong>{plan.name} · plan n° {plan.id}</strong> · {plan.base === 'encaisse' ? 'Encaissements validés' : plan.base === 'marge' ? 'Marge (ancien plan)' : 'Devis acceptés (ancien plan)'}<br />
          {tiersOf(plan).map(t => `${t.from_pct} % d’objectif : ${t.rate} %`).join(' · ')}</div>
        <button className="button" onClick={() => setEdit(plan)}>Modifier les taux</button>
      </div>)}
    </section>
    {edit && <ActionForm title={edit === 'new' ? 'Créer un plan de commission' : 'Nouvelle version des taux'} close={() => setEdit(null)} submitLabel="Enregistrer" submit={async (f) => {
      const lines = String(f.get('tiers') || '').split('\n').map(s => s.trim()).filter(Boolean);
      const tiers = lines.map(line => {
        const parts = line.split(':').map(s => s.trim().replace(',', '.'));
        if (parts.length !== 2 || parts.some(s => s === '' || !Number.isFinite(Number(s)))) throw new Error('Utilisez un palier par ligne au format seuil : taux.');
        return { from_pct: Number(parts[0]), rate: Number(parts[1]) };
      });
      await api.post(edit === 'new' ? '/admin/commission-plans' : `/admin/commission-plans/${edit.id}/versions`, { name: f.get('name'), tiers });
      await queryClient.invalidateQueries({ queryKey: ['admin-commission-plans'] });
    }}>
      <label>Nom du plan<input name="name" required maxLength={150} defaultValue={edit === 'new' ? '' : edit.name} /></label>
      <label>Paliers : seuil d’objectif (%) : taux de commission (%)<textarea name="tiers" required rows={5} placeholder={'0 : …\n100 : …'} defaultValue={edit === 'new' ? '' : tiersOf(edit).map(t => `${t.from_pct} : ${t.rate}`).join('\n')} /></label>
      <p>Un palier par ligne, le premier à 0 %. Les taux sont à renseigner par COMSIG. La nouvelle version devra être affectée par la direction ; les anciens relevés ne changent pas.</p>
    </ActionForm>}
  </>;
}
