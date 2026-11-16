// Changement d'étape encadré : critères de passage, données de clôture, dérogation tracée (§5.3.1, §5.3.2)
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';
import { useApi } from '../lib/hooks';
import { useCan, useLookups } from '../lib/auth';
import { useToast } from '../lib/toast';
import { addDays, today } from '../lib/format';
import { Alert, Button, Field, Input, Modal, Select, Textarea } from './ui';

export function StageMoveModal({ opp, target, stages, onClose }: { opp: { id: string; ref: string; title: string; stage_code: string } | null; target: string | null; stages: any[]; onClose: () => void }) {
  const can = useCan();
  const { lookups } = useLookups();
  const toast = useToast();
  const qc = useQueryClient();
  const st = stages.find((s) => s.code === target);
  const [f, setF] = useState<any>({});
  const [issues, setIssues] = useState<{ message: string; derogable: boolean }[]>([]);
  const [canDerogate, setCanDerogate] = useState(false);
  const [canRequest, setCanRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Critères réévalués à chaque ouverture (jamais de résultat mis en cache d'une tentative précédente)
  const [openedAt, setOpenedAt] = useState(0);
  const gates = useApi<any>(['gates', opp?.id, target, openedAt], opp && target && openedAt ? `/api/opportunities/${opp.id}/gates/${target}` : null);
  const docs = useApi<any>(['docs', 'opportunity', opp?.id], opp && target === 'gagne' ? `/api/documents?entity_type=opportunity&entity_id=${opp.id}` : null);
  useEffect(() => { setF({ reactivation_date: addDays(today(), 30) }); setIssues([]); setError(null); setCanDerogate(false); setCanRequest(false); setOpenedAt(target ? Date.now() : 0); }, [opp?.id, target]);
  useEffect(() => { if (gates.data) { setIssues(gates.data.issues); setCanDerogate(can('opportunities', 'validate')); setCanRequest(!can('opportunities', 'validate')); } }, [gates.data]);
  if (!opp || !target || !st) return null;
  const closing = ['gagne', 'perdu', 'suspendu'].includes(target);
  const needsDerog = issues.some((i) => i.derogable) && !issues.some((i) => !i.derogable && !['won_proof', 'lost_reason', 'lost_comment', 'reactivation'].includes((i as any).code));
  const hard = issues.filter((i) => !i.derogable && !['won_proof', 'lost_reason', 'lost_comment', 'reactivation'].includes((i as any).code));

  const done = (msg: string) => { toast('success', msg); qc.invalidateQueries({ queryKey: ['opportunities'] }); qc.invalidateQueries({ queryKey: ['opp'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); onClose(); };
  const submit = async () => {
    setBusy(true); setError(null);
    try {
      await api.post(`/api/opportunities/${opp.id}/stage`, { stage: target, ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' ? null : v])) });
      done(target === 'gagne' ? 'Opportunité gagnée — le dossier de passation a été transmis aux opérations' : `Étape « ${st.label} » enregistrée`);
    } catch (e) {
      const err = e as ApiError;
      setError(err.message);
      if (err.details?.issues) { setIssues(err.details.issues); setCanDerogate(!!err.details.can_derogate); setCanRequest(!!err.details.can_request); }
    } finally { setBusy(false); }
  };
  const requestDerog = async () => {
    setBusy(true); setError(null);
    try { await api.post(`/api/opportunities/${opp.id}/derogation`, { stage: target, justification: f.derogation }); done('Demande de dérogation envoyée à la direction commerciale'); }
    catch (e) { setError((e as ApiError).message); } finally { setBusy(false); }
  };
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open onClose={onClose} title={`Passer à « ${st.label} »`} description={`${opp.ref} — ${opp.title}. ${st.exit_criteria ? `Critère : ${st.exit_criteria}` : ''}`}
      footer={<>
        <Button onClick={onClose}>Annuler</Button>
        {needsDerog && canRequest && !closing ? <Button variant="primary" loading={busy} disabled={!f.derogation?.trim()} onClick={requestDerog}>Demander une dérogation</Button>
          : <Button variant="primary" loading={busy} disabled={hard.length > 0 || (needsDerog && !f.derogation?.trim())} onClick={submit}>{needsDerog ? 'Passer avec dérogation' : 'Confirmer'}</Button>}
      </>}>
      <div className="stack-lg">
        {gates.isLoading && <p className="muted small">Vérification des critères de passage…</p>}
        {hard.length > 0 && <Alert tone="danger" title="Passage impossible"><ul>{hard.map((i, k) => <li key={k}>{i.message}</li>)}</ul></Alert>}
        {needsDerog && hard.length === 0 && (
          <Alert tone="warning" title="Critères de passage non remplis">
            <ul>{issues.filter((i) => i.derogable).map((i, k) => <li key={k}>{i.message}</li>)}</ul>
            <div style={{ marginTop: 6 }}>Complétez ces éléments ou {canDerogate ? 'justifiez une dérogation (elle sera tracée dans l’historique).' : 'demandez une dérogation à la direction commerciale.'}</div>
          </Alert>
        )}
        {gates.data && !issues.length && !closing && <Alert tone="success">Tous les critères de passage sont remplis.</Alert>}
        {target === 'gagne' && (
          <>
            <Field label="Preuve d’engagement" required hint="Un accord verbal ne suffit pas (règle COM&SIG).">
              <Select value={f.won_proof_type ?? ''} onChange={set('won_proof_type')} placeholder="Choisir…" options={[{ value: 'devis_accepte', label: 'Devis accepté par le client' }, { value: 'contrat_signe', label: 'Contrat signé' }, { value: 'bon_commande', label: 'Bon de commande validé' }]} />
            </Field>
            {(f.won_proof_type === 'contrat_signe' || f.won_proof_type === 'bon_commande') && (
              <Field label="Document justificatif" hint="Déposez d’abord le document dans l’onglet Documents de l’opportunité.">
                <Select value={f.won_proof_document_id ?? ''} onChange={set('won_proof_document_id')} placeholder="Choisir…" options={(docs.data?.rows ?? []).map((d: any) => ({ value: d.id, label: d.filename }))} />
              </Field>
            )}
          </>
        )}
        {(target === 'perdu' || target === 'suspendu') && (
          <div className="form-grid">
            <Field label="Motif normalisé" required><Select value={f.lost_reason ?? ''} onChange={set('lost_reason')} placeholder="Choisir…" options={(lookups.loss_reason ?? []).map((x) => ({ value: x.code, label: x.label }))} /></Field>
            {target === 'perdu' ? <Field label="Concurrent (si connu)"><Input value={f.competitor ?? ''} onChange={set('competitor')} /></Field>
              : <Field label="Date de réactivation prévue" required><Input type="date" value={f.reactivation_date ?? ''} onChange={set('reactivation_date')} /></Field>}
            <Field label="Commentaire" required={f.lost_reason === 'autre'} className="span-2"><Textarea value={f.lost_comment ?? ''} onChange={set('lost_comment')} /></Field>
          </div>
        )}
        {needsDerog && hard.length === 0 && (
          <Field label={canDerogate ? 'Justification de la dérogation' : 'Justification de la demande'} required><Textarea value={f.derogation ?? ''} onChange={set('derogation')} placeholder="Pourquoi passer à l’étape suivante malgré les critères manquants ?" /></Field>
        )}
        {error && !issues.length && <Alert tone="danger">{error}</Alert>}
      </div>
    </Modal>
  );
}
