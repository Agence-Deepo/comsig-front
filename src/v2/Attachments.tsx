import { useId, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArchiveRestore, Download, FileText, ImageIcon, Paperclip, Trash2, Upload } from 'lucide-react';
import { Alert, Badge, Button, Card, Empty, LoadingBlock, Select } from '../components/ui';
import { api, downloadFile, queryString } from './api';
import { ErrorBox, Modal } from './ui';
import { date } from './types';

export interface AttachedFile {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  kind: string;
  version: number;
  uploaded_by_name: string | null;
  created_at: string;
  deleted_at: string | null;
}
interface AttachmentList {
  data: AttachedFile[];
  meta: {
    can_upload: boolean;
    can_delete: boolean;
    can_restore: boolean;
    max_size_bytes: number;
    configured_max_size_bytes: number;
    allowed_extensions: string[];
    kinds: string[];
    total_count: number;
    total_bytes: number;
    max_files: number;
    max_total_bytes: number;
  };
}
const kindLabels: Record<string, string> = {
  autre: 'Autre',
  contrat: 'Contrat',
  bon_commande: 'Bon de commande',
  devis_accepte: 'Devis accepté',
  photo: 'Photo',
  attestation: 'Attestation',
  pv: 'Procès-verbal',
  facture: 'Facture',
  cv: 'CV',
  fiche_paie: 'Fiche de paie',
  justificatif: 'Justificatif',
  rapport: 'Rapport',
};
export function fileSize(bytes: number) {
  if (bytes === 0) return '0 Ko';
  return bytes >= 1048576
    ? `${(bytes / 1048576).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`
    : `${Math.max(1, Math.ceil(bytes / 1024))} Ko`;
}
export function validateAttachment(
  file: Pick<File, 'name' | 'size'>,
  meta: Pick<AttachmentList['meta'], 'allowed_extensions' | 'max_size_bytes'>,
): string | null {
  if (!meta.allowed_extensions.includes(file.name.split('.').pop()?.toLowerCase() ?? ''))
    return 'Format non autorisé. Choisissez un PDF, une image JPEG/PNG/WebP, un DOCX, un XLSX ou un CSV.';
  if (file.size === 0 || file.size > meta.max_size_bytes)
    return `Fichier vide ou trop volumineux. Limite : ${fileSize(meta.max_size_bytes)} par fichier.`;
  return null;
}
export function Attachments({ entityType, entityId }: { entityType: string; entityId: string }) {
  const qc = useQueryClient();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [kind, setKind] = useState('autre');
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<AttachedFile | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const queryKey = ['attachments', entityType, entityId];
  const q = useQuery({
    queryKey: [...queryKey, includeDeleted],
    queryFn: ({ signal }) =>
      api.get<AttachmentList>(
        '/attachments' +
          queryString({
            entity_type: entityType,
            entity_id: entityId,
            include_deleted: includeDeleted ? 1 : 0,
          }),
        signal,
      ),
  });
  const meta = q.data?.meta;
  const refresh = () => qc.invalidateQueries({ queryKey });
  async function upload(file: File) {
    if (busy || !meta) return;
    setError(null);
    setSuccess(null);
    const invalid = validateAttachment(file, meta);
    if (invalid) {
      setError(new Error(invalid));
      if (input.current) input.current.value = '';
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append('entity_type', entityType);
      body.append('entity_id', entityId);
      body.append('kind', kind);
      body.append('file', file);
      const response = await api.upload<{ data: AttachedFile }>('/attachments', body);
      setSuccess(`Document ajouté : ${response.data.filename} (version ${response.data.version}).`);
      await refresh();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }
  async function remove() {
    if (busy || !confirm) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete('/attachments/' + confirm.id);
      setConfirm(null);
      setSuccess('Document placé dans la corbeille. Le fichier est conservé et peut être restauré.');
      await refresh();
    } catch (e) {
      setError(e);
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }
  async function restore(doc: AttachedFile) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/attachments/${doc.id}/restore`);
      setSuccess(`Document restauré : ${doc.filename} (version ${doc.version}).`);
      await refresh();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card
      title={
        <span className="row">
          <Paperclip size={18} />
          Documents
        </span>
      }
      sub="Pièces jointes privées de ce dossier — accès contrôlé par Laravel."
      className="attachments-card"
    >
      <section className="stack" aria-label="Documents du dossier">
        <ErrorBox
          error={q.error}
          retry={() => {
            void q.refetch();
          }}
        />
        <ErrorBox error={error} />
        {success && <Alert tone="success">{success}</Alert>}
        {meta && (
          <>
            <div className="row-wrap">
              {meta.can_upload && (
                <>
                  <label className="sr-only" htmlFor={inputId + '-kind'}>
                    Type de document
                  </label>
                  <Select
                    id={inputId + '-kind'}
                    value={kind}
                    disabled={busy}
                    onChange={(e) => setKind(e.target.value)}
                    options={meta.kinds.map((value) => ({ value, label: kindLabels[value] ?? value }))}
                    style={{ width: 'auto', maxWidth: '100%' }}
                  />
                  <input
                    id={inputId}
                    ref={input}
                    type="file"
                    hidden
                    aria-label="Fichier à joindre"
                    accept={meta.allowed_extensions.map((ext) => '.' + ext).join(',')}
                    onChange={(e) => {
                      if (e.currentTarget.files?.[0]) void upload(e.currentTarget.files[0]);
                    }}
                  />
                  <Button
                    icon={<Upload />}
                    loading={busy && !confirm}
                    disabled={
                      busy || meta.total_count >= meta.max_files || meta.total_bytes >= meta.max_total_bytes
                    }
                    onClick={() => input.current?.click()}
                  >
                    Ajouter un fichier
                  </Button>
                </>
              )}
              {meta.can_restore && (
                <Button
                  disabled={busy}
                  aria-pressed={includeDeleted}
                  onClick={() => setIncludeDeleted(!includeDeleted)}
                >
                  {includeDeleted ? 'Masquer les documents supprimés' : 'Voir les documents supprimés'}
                </Button>
              )}
            </div>
            <p className="xsmall muted">
              PDF, JPEG, PNG, WebP, DOCX, XLSX, CSV UTF-8 — {fileSize(meta.max_size_bytes)} maximum par
              fichier. Documents Office sans macros ni objets encapsulés.{' '}
              {meta.can_upload
                ? 'Un fichier de même nom ajoute une version sans écraser la précédente.'
                : 'Votre profil dispose d’un accès en lecture uniquement.'}
            </p>
            {meta.max_size_bytes < meta.configured_max_size_bytes && (
              <Alert tone="warning">
                La limite PHP actuelle est inférieure aux 15 Mo prévus. Utilisez le lancement Laravel local
                adapté ou faites vérifier la configuration du serveur.
              </Alert>
            )}
            {meta.can_upload && (
              <p className="xsmall muted">
                {meta.total_count} / {meta.max_files} pièces · {fileSize(meta.total_bytes)} /{' '}
                {fileSize(meta.max_total_bytes)} utilisés (versions et corbeille incluses).
              </p>
            )}
          </>
        )}
        {q.isLoading ? (
          <LoadingBlock rows={3} />
        ) : (
          q.data &&
          (q.data.data.length ? (
            <ul className="attachment-list" aria-label="Pièces jointes">
              {q.data.data.map((doc) => (
                <li key={doc.id} data-attachment-id={doc.id} className="attachment-item">
                  <span className="icon-chip" aria-hidden>
                    {doc.mime_type.startsWith('image/') ? <ImageIcon /> : <FileText />}
                  </span>
                  <div className="attachment-description">
                    <div className="strong" style={{ overflowWrap: 'anywhere' }}>
                      {doc.filename} {doc.deleted_at && <Badge tone="warning">Supprimé</Badge>}
                    </div>
                    <div className="xsmall muted">
                      {kindLabels[doc.kind] ?? doc.kind} · v{doc.version} · {fileSize(doc.size_bytes)} ·{' '}
                      {date(doc.created_at)}
                      {doc.uploaded_by_name ? ' · ' + doc.uploaded_by_name : ''}
                    </div>
                  </div>
                  <div className="row-wrap attachment-actions">
                    {!doc.deleted_at && (
                      <Button
                        icon={<Download />}
                        size="sm"
                        disabled={busy}
                        aria-label={`Télécharger ${doc.filename} version ${doc.version}`}
                        onClick={async () => {
                          setBusy(true);
                          setError(null);
                          try {
                            await downloadFile(`/attachments/${doc.id}/file`, doc.filename, [doc.mime_type]);
                          } catch (e) {
                            setError(e);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        Télécharger
                      </Button>
                    )}
                    {!doc.deleted_at && meta?.can_delete && (
                      <Button
                        variant="ghost"
                        iconOnly
                        icon={<Trash2 />}
                        size="sm"
                        disabled={busy}
                        aria-label={`Supprimer ${doc.filename} version ${doc.version}`}
                        onClick={() => setConfirm(doc)}
                      />
                    )}
                    {doc.deleted_at && meta?.can_restore && (
                      <Button
                        icon={<ArchiveRestore />}
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                          void restore(doc);
                        }}
                        aria-label={`Restaurer ${doc.filename} version ${doc.version}`}
                      >
                        Restaurer
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={<Paperclip />} title="Aucun document">
              Les pièces rattachées à ce dossier apparaîtront ici.
            </Empty>
          ))
        )}
        {confirm && (
          <Modal
            title="Supprimer ce document ?"
            close={() => {
              if (!busy) setConfirm(null);
            }}
          >
            <p>
              « {confirm.filename} » (version {confirm.version}) sera placé dans la corbeille. Une personne
              autorisée à gérer les pièces de ce dossier pourra le restaurer.
            </p>
            <div className="row-wrap" style={{ marginTop: 20 }}>
              <Button disabled={busy} onClick={() => setConfirm(null)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                loading={busy}
                onClick={() => {
                  void remove();
                }}
              >
                Supprimer
              </Button>
            </div>
          </Modal>
        )}
      </section>
    </Card>
  );
}
