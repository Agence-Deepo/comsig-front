import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../components/ui';
import { downloadFile } from './api';
import { ErrorBox } from './ui';

export default function ExportButton({
  path,
  filename,
  label = 'CSV',
}: {
  path: string;
  filename: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  return (
    <div>
      <Button
        size="sm"
        icon={<Download size={16} />}
        disabled={busy}
        loading={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await downloadFile(path, filename);
          } catch (e) {
            setError(e);
          } finally {
            setBusy(false);
          }
        }}
      >
        {label}
      </Button>
      <ErrorBox error={error} />
    </div>
  );
}
