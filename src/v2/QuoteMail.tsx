import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui';
import { api } from './api';
import { DownloadButton } from './ErpPanels';
import { dateTime, type Row } from './types';
import { ActionForm } from './ui';

export function QuoteMail({
  row,
  records,
  enabled,
  recipient,
}: {
  row: Row;
  records: Row[];
  enabled: boolean;
  recipient?: string;
}) {
  const qc = useQueryClient();
  const [key, setKey] = useState<string | null>(null);
  return (
    <Card
      title="Courriers privés de test"
      actions={
        enabled &&
        ['valide', 'envoye', 'accepte'].includes(row.status) && (
          <button className="btn" onClick={() => setKey(crypto.randomUUID())}>
            Préparer un e-mail de test
          </button>
        )
      }
    >
      <div className="notice warning">
        Recette privée uniquement : le courrier et son PDF sont enregistrés en fichier .eml. Aucun
        destinataire réel n’est contacté, aucun SMTP n’est utilisé, et le devis ne passe pas à « Envoyé ».
      </div>
      {records.map((r) => (
        <div className="list-item quote-mail-item" key={r.id}>
          <div className="spacer">
            <strong>{r.subject}</strong>
            <div className="small muted">
              {r.recipient} · {dateTime(r.created_at)}
            </div>
          </div>
          <DownloadButton
            path={`/quotes/${row.id}/email-tests/${r.id}/file`}
            filename="courrier-test.eml"
            caption="Télécharger le courrier de test"
            binaryTypes={['message/rfc822']}
          />
        </div>
      ))}
      {key && (
        <ActionForm
          title="Préparer un courrier privé de test"
          close={() => setKey(null)}
          submit={async (f) => {
            await api.post('/quotes/' + row.id + '/email-test', {
              recipient: f.get('recipient'),
              subject: f.get('subject'),
              body: f.get('body'),
              idempotency_key: key,
            });
            await qc.invalidateQueries();
          }}
        >
          <p>Le destinataire est renseigné pour vérifier le courrier, mais il ne recevra rien.</p>
          <label className="field">
            Destinataire de test
            <input
              type="email"
              name="recipient"
              required
              maxLength={254}
              defaultValue={recipient || 'client@example.test'}
            />
          </label>
          <label className="field">
            Objet du courrier
            <input name="subject" required maxLength={200} defaultValue={row.number + ' — ' + row.title} />
          </label>
          <label className="field">
            Message
            <textarea
              name="body"
              required
              maxLength={10000}
              defaultValue={
                'Bonjour,\nVeuillez trouver ci-joint notre proposition ' +
                row.number +
                '.\nCordialement,\nCOM&SIG'
              }
            />
          </label>
          <p>
            La même tentative ne crée pas de doublon lors d’une reprise réseau. Les droits, l’approbation DG,
            la validité et l’opposition du contact sont revérifiés au serveur.
          </p>
        </ActionForm>
      )}
    </Card>
  );
}
