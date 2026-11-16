import { FileSpreadsheet, FileText, FileType2 } from 'lucide-react';
import { download } from '../lib/api';
import { Button } from './ui';

/** Bouton de téléchargement Excel. L'adresse est exposée (data-export) pour la capture de la démonstration. */
export function ExcelButton({ url, label = 'Excel', size = 'md', title }: { url: string; label?: string; size?: 'sm' | 'md'; title?: string }) {
  return <Button size={size === 'sm' ? 'sm' : undefined} icon={<FileSpreadsheet />} data-export={url} title={title ?? 'Télécharger au format Excel (.xlsx)'} onClick={() => download(url)}>{label}</Button>;
}

/** Document A4 sur papier à en-tête COM&SIG : PDF ou Word. */
export function DocButton({ url, kind, size = 'md' }: { url: string; kind: 'pdf' | 'docx'; size?: 'sm' | 'md' }) {
  return (
    <Button size={size === 'sm' ? 'sm' : undefined} icon={kind === 'pdf' ? <FileText /> : <FileType2 />} data-export={url}
      title={kind === 'pdf' ? 'PDF A4 sur papier à en-tête COM&SIG' : 'Document Word (.docx) sur papier à en-tête COM&SIG'} onClick={() => download(url)}>
      {kind === 'pdf' ? 'PDF' : 'Word'}
    </Button>
  );
}
