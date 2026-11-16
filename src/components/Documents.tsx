import { useRef, useState } from 'react';
import { FileText, ImageIcon, Paperclip, Trash2, Upload } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api, ApiError, fileUrl, demoNotice } from '../lib/api';
import { useApi } from '../lib/hooks';
import { useToast } from '../lib/toast';
import { bytes, dateTime } from '../lib/format';
import { DOC_KIND } from '../lib/labels';
import { Button, Empty, Select, ConfirmModal } from './ui';

/** Pièces jointes d'une entité : dépôt, versionnage (même nom), consultation, suppression logique. */
export function Documents({ entityType, entityId, canEdit = true, kinds = ['autre', 'contrat', 'bon_commande', 'devis_accepte', 'photo', 'attestation', 'pv'], onUploaded }: {
  entityType: string; entityId: string; canEdit?: boolean; kinds?: string[]; onUploaded?: (doc: any) => void;
}) {
  const q = useApi<any>(['docs', entityType, entityId], `/api/attachments?entity_type=${entityType}&entity_id=${entityId}`);
  const [kind, setKind] = useState(kinds[0]);
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<any>(null);
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const qc = useQueryClient();
  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append('entity_type', entityType); fd.append('entity_id', entityId); fd.append('kind', kind);
    fd.append('file', file);
    setBusy(true);
    try {
      const response: any = await api.upload('/api/attachments', fd);
      const d = response.data;
      toast('success', 'Document ajouté', `${d.filename} (version ${d.version})`);
      q.refetch(); qc.invalidateQueries({ queryKey: [entityType] }); onUploaded?.(d);
    } catch (e) { toast('error', 'Envoi impossible', (e as ApiError).message); } finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  return (
    <div className="stack">
      {canEdit && (
        <div className="row-wrap">
          <label className="sr-only" htmlFor={`kind-${entityId}`}>Type de document</label>
          <Select id={`kind-${entityId}`} value={kind} onChange={(e) => setKind(e.target.value)} options={kinds.map((k) => ({ value: k, label: DOC_KIND[k] ?? k }))} style={{ width: 'auto' }} />
          <input ref={input} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx,.csv" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button icon={<Upload />} loading={busy} onClick={() => input.current?.click()}>Ajouter un fichier</Button>
          <span className="xsmall muted">PDF, images, DOCX, XLSX — 15 Mo max.</span>
        </div>
      )}
      {!(q.data?.rows ?? q.data?.data)?.length ? <Empty icon={<Paperclip />} title="Aucun document">Les contrats, bons de commande, photos et attestations rattachés apparaîtront ici.</Empty> : (
        <div className="list" style={{ border: '1px solid var(--border)', borderRadius: 8 }}>
          {(q.data?.rows ?? q.data?.data ?? []).map((d: any) => (
            <div key={d.id} className="list-item" style={{ padding: '10px 12px' }}>
              <span className="icon-chip">{d.mime_type.startsWith('image/') ? <ImageIcon /> : <FileText />}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a href={fileUrl(d.id) ?? '#'} onClick={(e) => { if (!fileUrl(d.id)) demoNotice(e); }} target="_blank" rel="noopener" className="strong truncate" style={{ display: 'block' }}>{d.filename}</a>
                <div className="xsmall muted">{DOC_KIND[d.kind] ?? d.kind} · v{d.version} · {bytes(d.size_bytes)} · {dateTime(d.created_at)}{d.uploaded_by_name ? ` · ${d.uploaded_by_name}` : ''}</div>
              </div>
              {canEdit && <Button variant="ghost" iconOnly size="sm" aria-label={`Supprimer ${d.filename}`} icon={<Trash2 />} onClick={() => setDel(d)} />}
            </div>
          ))}
        </div>
      )}
      <ConfirmModal open={!!del} onClose={() => setDel(null)} danger title="Supprimer ce document ?" confirmLabel="Supprimer"
        message={<>« {del?.filename} » sera placé dans la corbeille (restauration possible par un administrateur).</>}
        onConfirm={async () => { try { await api.del(`/api/attachments/${del.id}`); toast('success', 'Document supprimé'); q.refetch(); } catch (e) { toast('error', 'Suppression impossible', (e as ApiError).message); } setDel(null); }} />
    </div>
  );
}
