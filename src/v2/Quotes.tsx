import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, FileText, Pencil, Plus, Search } from 'lucide-react';
import { Badge, Card, DataTable, Segmented, Tabs } from '../components/ui';
import { api } from './api';
import { useAuth } from './auth';
import { Attachments } from './Attachments';
import { QuoteMail } from './QuoteMail';
import { DownloadButton } from './ErpPanels';
import { can, date, dateTime, label, money, type Page, type Row } from './types';
import { ActionForm, Empty, ErrorBox, Loading, PageTitle, Pager, Status } from './ui';

export function Quotes() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams(),
    navigate = useNavigate();
  const [term, setTerm] = useState(sp.get('q') || '');
  useEffect(() => setTerm(sp.get('q') || ''), [sp]);
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    next.delete('page');
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSp(next);
  };
  const result = useQuery({
    queryKey: ['quote-list', sp.toString()],
    queryFn: ({ signal }) => api.get<Page>('/quotes?' + sp.toString(), signal),
  });
  return (
    <>
      <PageTitle
        title="Devis et propositions"
        description="Propositions chiffrées, versions conservées et validation selon les seuils de marge et de remise"
        actions={
          can(user, 'quotes.create') && (
            <Link className="btn btn-primary" to="/devis/nouveau">
              <Plus /> Nouveau devis
            </Link>
          )
        }
      />
      <div className="filter-bar">
        <Segmented
          label="Statut"
          value={sp.get('status') || ''}
          onChange={(v) => set({ status: v })}
          options={[
            ['', 'Tous'],
            ['brouillon', 'Brouillons'],
            ['soumis', 'En validation'],
            ['valide', 'Validés'],
            ['envoye', 'Envoyés'],
            ['accepte', 'Acceptés'],
            ['refuse', 'Refusés'],
            ['annule', 'Annulés'],
            ['expire', 'Expirés'],
          ].map(([id, text]) => ({ id, label: text }))}
        />
        <form
          className="input-group search"
          onSubmit={(e) => {
            e.preventDefault();
            set({ q: term });
          }}
        >
          <Search />
          <input
            aria-label="Rechercher"
            placeholder="Numéro, intitulé, client…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onBlur={() => {
              if (term !== (sp.get('q') || '')) set({ q: term });
            }}
          />
        </form>
        <label className="field">
          Document
          <select value={sp.get('doc_type') || ''} onChange={(e) => set({ doc_type: e.target.value })}>
            <option value="">Tous les documents</option>
            <option value="devis">Devis</option>
            <option value="proforma">Proformas</option>
          </select>
        </label>
      </div>
      <ErrorBox error={result.error} />
      <Card flush>
        <DataTable
          rows={result.data?.data}
          loading={result.isLoading}
          onRowClick={(r: Row) => navigate('/devis/' + r.id)}
          caption="Devis et propositions"
          columns={[
            {
              key: 'number',
              label: 'Proposition',
              render: (r: Row) => (
                <>
                  <Link className="cell-title record-link" to={'/devis/' + r.id}>
                    {r.number}
                  </Link>{' '}
                  <span className="muted">v{r.version}</span>{' '}
                  {r.doc_type === 'proforma' && <Badge tone="accent">Proforma</Badge>}
                  <div className="cell-sub">{r.title}</div>
                </>
              ),
            },
            { key: 'client', label: 'Client', render: (r: Row) => r.organization?.legal_name || '—' },
            {
              key: 'status',
              label: 'Statut',
              render: (r: Row) => (
                <>
                  <Status value={r.status} />
                  {r.status === 'envoye' && r.valid_until < new Date().toISOString().slice(0, 10) && (
                    <Badge tone="danger">Validité dépassée</Badge>
                  )}
                </>
              ),
            },
            { key: 'total', label: 'Total HT', num: true, render: (r: Row) => money(r.total_ht) },
            {
              key: 'margin',
              label: 'Marge',
              num: true,
              render: (r: Row) => (
                <span className={r.approval_required ? 'text-warning' : ''}>{r.margin_pct} %</span>
              ),
              mobile: 'hide',
            },
            { key: 'valid', label: 'Validité', render: (r: Row) => date(r.valid_until), mobile: 'hide' },
            { key: 'owner', label: 'Responsable', render: (r: Row) => r.owner?.name || '—', mobile: 'hide' },
          ]}
          empty={<Empty>Aucune proposition pour ces filtres.</Empty>}
        />
        <Pager
          page={result.data}
          change={(page) => {
            const next = new URLSearchParams(sp);
            next.set('page', String(page));
            setSp(next);
          }}
        />
      </Card>
    </>
  );
}

const actionLabels: Record<string, string> = {
  submit: 'Soumettre à validation',
  send: 'Marquer comme envoyé',
  decision: 'Enregistrer la décision du client',
  cancel: 'Annuler le devis',
  approve: 'Approuver',
  reject: 'Retourner au brouillon',
  version: 'Nouvelle version',
};
const events: Record<string, string> = {
  create: 'Création du brouillon',
  update: 'Modification du brouillon',
  submit: 'Soumission',
  approve: 'Approbation interne',
  reject: 'Retour au brouillon',
  send: 'Envoi externe consigné',
  email_test: 'Courrier privé de test préparé',
  decision: 'Décision du client',
  cancel: 'Annulation',
  version: 'Nouvelle version',
  superseded: 'Remplacement par une nouvelle version',
};
export const quoteEventLabel = (action: string) => events[action] || action;
export function QuoteDetail() {
  const { id } = useParams(),
    { user } = useAuth();
  const qc = useQueryClient(),
    navigate = useNavigate();
  const [tab, setTab] = useState('proposition'),
    [action, setAction] = useState(''),
    [decision, setDecision] = useState('accepte');
  useEffect(() => {
    setTab('proposition');
    setAction('');
  }, [id]);
  const result = useQuery({
    queryKey: ['detail', 'quotes', id],
    queryFn: ({ signal }) => api.get('/quotes/' + id, signal),
  });
  if (result.isLoading) return <Loading />;
  if (result.error) return <ErrorBox error={result.error} />;
  const {
    data: q,
    organization,
    contact,
    opportunity,
    versions,
    approvals,
    history,
    governance,
    mail_tests,
    email_test_available,
  } = result.data;
  const allowed: string[] = [];
  if (q.status === 'envoye' && can(user, 'activities.create')) allowed.push('follow-up');
  if (can(user, 'quotes.update')) {
    if (q.status === 'brouillon') allowed.push('submit');
    if (q.status === 'valide') allowed.push('send');
    if (q.status === 'envoye') allowed.push('decision');
    if (!['accepte', 'annule'].includes(q.status)) allowed.push('cancel');
  }
  const roleAllowed =
    q.approver_role === 'direction_generale'
      ? user?.role.code === 'direction_generale'
      : ['direction_commerciale', 'direction_generale'].includes(user?.role.code || '');
  if (
    q.status === 'soumis' &&
    can(user, 'quotes.validate') &&
    ![q.owner_id, q.created_by, q.submitted_by].includes(user?.id) &&
    roleAllowed
  )
    allowed.unshift('approve', 'reject');
  if (
    can(user, 'quotes.create') &&
    ['soumis', 'valide', 'envoye', 'refuse', 'expire'].includes(q.status) &&
    !versions.some((v: Row) => ['brouillon', 'accepte'].includes(v.status))
  )
    allowed.push('version');
  return (
    <>
      <Link className="back-link" to="/devis">
        ← Devis et propositions
      </Link>
      <PageTitle
        title={q.title}
        eyebrow={q.doc_type === 'proforma' ? 'FACTURE PROFORMA' : 'DEVIS'}
        description={`${q.number} · version ${q.version}`}
        actions={
          <>
            {!governance.locked && (
              <>
                {[
                  ['pdf', 'Télécharger le PDF', 'application/pdf'],
                  [
                    'docx',
                    'Télécharger Word',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  ],
                  [
                    'xlsx',
                    'Télécharger Excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  ],
                ].map(([format, caption, mime]) => (
                  <DownloadButton
                    key={format}
                    path={`/quotes/${q.id}/document.${format}`}
                    filename={q.number + '.' + format}
                    caption={caption}
                    binaryTypes={[mime]}
                  />
                ))}
              </>
            )}
            {q.status === 'brouillon' && can(user, 'quotes.update') && (
              <Link className="btn" to={'/devis/' + q.id + '/modifier'}>
                <Pencil size={15} /> Modifier
              </Link>
            )}
            {allowed.map((key) => (
              <button
                key={key}
                className={
                  'btn ' +
                  (key === 'cancel'
                    ? 'btn-ghost text-danger'
                    : key === 'submit' || key === 'approve'
                      ? 'btn-primary'
                      : '')
                }
                onClick={() => {
                  setAction(key);
                  setDecision('accepte');
                }}
              >
                {key === 'version' && <Copy size={15} />}
                {key === 'follow-up' ? 'Planifier une relance' : actionLabels[key]}
              </button>
            ))}
          </>
        }
      />
      {governance.locked && (
        <div className="notice warning" role="status">
          <strong>Document verrouillé — approbation DG requise</strong>
          <p>
            Le montant dépasse {money(governance.threshold)} TTC. PDF et envoi sont bloqués jusqu’à
            l’approbation indépendante du directeur général. Toute modification invalide cette approbation.
          </p>
        </div>
      )}
      {governance.approved_at && (
        <div className="notice success">
          Approbation DG enregistrée le {dateTime(governance.approved_at)}.
        </div>
      )}
      <div className="split p05-detail">
        <div className="stack-lg">
          <section className="panel">
            <div className="panel-heading">
              <h2>
                {q.number} <span className="muted">v{q.version}</span>
              </h2>
              <Status value={q.status} />
            </div>
            <div className="panel-body">
              <div className="row-wrap">
                {organization && <Link to={'/clients/' + organization.id}>{organization.legal_name}</Link>}
                {opportunity && (
                  <Link to={'/opportunites/' + opportunity.id}>
                    {opportunity.ref} — {opportunity.title}
                  </Link>
                )}
                {q.doc_type === 'proforma' && <Badge tone="accent">Proforma</Badge>}
              </div>
              <p className="small muted">
                {contact
                  ? `Destinataire : ${[contact.first_name, contact.last_name].filter(Boolean).join(' ')}${contact.email ? ' · ' + contact.email : ''}`
                  : 'Contact destinataire à compléter'}{' '}
                · Validité : {date(q.valid_until)}
              </p>
            </div>
          </section>
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'proposition', label: 'Proposition' },
              { id: 'validations', label: 'Validations', count: approvals.length },
              { id: 'versions', label: 'Versions', count: versions.length },
              { id: 'historique', label: 'Historique' },
              { id: 'documents', label: 'Documents' },
              { id: 'courriers', label: 'Courriers de test', hidden: !email_test_available },
            ]}
          />
          {tab === 'proposition' && (
            <>
              <Card title="Lignes de la proposition" flush>
                <div className="table-scroll">
                  <table className="table p05-lines">
                    <thead>
                      <tr>
                        <th>Désignation</th>
                        <th>Quantité × durée</th>
                        <th>P.U. HT</th>
                        <th>Remise</th>
                        <th>TVA</th>
                        <th>Net HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {q.lines.map((l: Row) => (
                        <tr key={l.id}>
                          <td>
                            <strong>{l.label}</strong>
                            <div className="cell-sub">
                              {l.price_source === 'cump'
                                ? 'Coût moyen du stock'
                                : l.price_source === 'catalogue'
                                  ? 'Catalogue'
                                  : l.price_source === 'declare'
                                    ? 'Coût / prix déclaré'
                                    : 'Source historique inconnue'}
                              {l.markup_pct != null && ` · majoration ${l.markup_pct} %`}
                            </div>
                          </td>
                          <td>
                            {Number(l.quantity)} {l.unit} × {Number(l.duration)}
                          </td>
                          <td>{money(l.unit_price)}</td>
                          <td>{l.discount_pct} %</td>
                          <td>{l.tax_rate} %</td>
                          <td>{money(l.line_ht)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card title="Conditions commerciales">
                <dl className="dl">
                  <dt>Modalités de paiement</dt>
                  <dd className="preserve">{q.payment_terms || 'Non renseignées'}</dd>
                  <dt>Conditions particulières</dt>
                  <dd className="preserve">{q.conditions || 'Non renseignées'}</dd>
                </dl>
                {q.notes_internal && (
                  <div className="notice">
                    <strong>Notes internes — non incluses au PDF</strong>
                    <p className="preserve">{q.notes_internal}</p>
                  </div>
                )}
                {q.refusal_reason && (
                  <div className="notice warning">
                    <strong>Motif du refus client</strong>
                    <p>{q.refusal_reason}</p>
                  </div>
                )}
              </Card>
            </>
          )}
          {tab === 'validations' && (
            <Card title="Décisions internes">
              <p className="small muted">
                Seuils contrôlés à la soumission. L’auteur, le responsable et le demandeur ne peuvent pas
                approuver leur propre proposition.
              </p>
              {q.approval_reasons?.length > 0 && (
                <div className="notice warning">{q.approval_reasons.map(label).join(', ')}</div>
              )}
              {!approvals.length && <Empty>Aucune décision interne enregistrée.</Empty>}
              {approvals.map((a: Row) => (
                <div className="list-item" key={a.id}>
                  <div>
                    <strong>
                      {a.actor_name} · {label(a.decision)}
                    </strong>
                    <div className="small muted">{dateTime(a.created_at)}</div>
                    <p className="preserve">{a.comment || 'Sans commentaire'}</p>
                  </div>
                </div>
              ))}
            </Card>
          )}
          {tab === 'versions' && (
            <Card title="Versions de cette proposition">
              <p className="small muted">
                Chaque version conserve ses montants et son historique. La référence technique V2 est unique ;
                une révision porte le suffixe -V2, -V3…
              </p>
              {versions.map((v: Row) => (
                <div className="list-item" key={v.id}>
                  <div className="spacer">
                    <Link to={'/devis/' + v.id}>
                      {v.number} · v{v.version}
                    </Link>
                    <div className="small muted">
                      {dateTime(v.created_at)} · {money(v.total_ht)} HT
                    </div>
                  </div>
                  <Status value={v.status} />
                </div>
              ))}
            </Card>
          )}
          {tab === 'historique' && (
            <Card title="Historique du document">
              <p className="small muted">
                Les dates anciennes inconnues ne sont pas reconstituées. Les 100 événements les plus récents
                sont affichés.
              </p>
              {!history.length && <Empty>Aucun événement daté disponible.</Empty>}
              <div className="timeline">
                {history.map((h: Row) => (
                  <div className="tl-item" key={h.id}>
                    <span className="tl-icon">
                      <FileText size={16} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <strong>{quoteEventLabel(h.action)}</strong>
                      <div className="small muted">
                        {h.actor_name || 'Utilisateur indisponible'} · {dateTime(h.created_at)}
                      </div>
                      <div>
                        {h.from_status && label(h.from_status) + ' → '}
                        {label(h.to_status)}
                      </div>
                      {h.comment && <p className="preserve">{h.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {tab === 'documents' && <Attachments entityType="quotes" entityId={q.id} />}
          {tab === 'courriers' && email_test_available && (
            <QuoteMail
              row={q}
              records={mail_tests || []}
              enabled={!governance.locked}
              recipient={contact?.email}
            />
          )}
        </div>
        <aside className="stack-lg">
          <Card title="Synthèse financière">
            <div className="quote-totals">
              {[
                ['Sous-total brut HT', 'subtotal_ht'],
                ['Remises', 'discount_total'],
                ['Total HT', 'total_ht'],
                ['TVA', 'total_tax'],
                ['Total TTC', 'total_ttc'],
                ['Coût de revient', 'total_cost'],
                ['Marge', 'margin_amount'],
              ].map(([text, field]) => (
                <div key={field} className={field === 'total_ttc' ? 'grand-total' : ''}>
                  <span>{text}</span>
                  <strong>{money(q[field])}</strong>
                </div>
              ))}
              <div>
                <span>Taux de marge</span>
                <strong>{q.margin_pct} %</strong>
              </div>
            </div>
            <p className="small muted">Les montants proviennent de Laravel, pas d’un recalcul navigateur.</p>
          </Card>
          <Card title="Suivi">
            <dl className="dl">
              {[
                ['Soumission', 'submitted_at'],
                ['Validation', 'validated_at'],
                ['Envoi externe', 'sent_at'],
                ['Acceptation', 'accepted_at'],
                ['Refus', 'refused_at'],
              ].map(([text, field]) => (
                <div key={field}>
                  <dt>{text}</dt>
                  <dd>{dateTime(q[field])}</dd>
                </div>
              ))}
            </dl>
            {q.sent_to && <p>Envoi consigné à : {q.sent_to}</p>}
            <p className="small muted">
              Marquer envoyé consigne une transmission externe ; cela n’envoie aucun e-mail et ne déclenche
              pas une relance automatique.
            </p>
            {q.status === 'accepte' && (
              <p className="small">
                Identifiant à transmettre à la finance : <code className="p05-id">{q.id}</code>. La
                facturation et le règlement restent des opérations distinctes.
              </p>
            )}
          </Card>
        </aside>
      </div>
      {action && (
        <ActionForm
          title={action === 'follow-up' ? 'Planifier une relance' : actionLabels[action]}
          close={() => setAction('')}
          submit={async (values) => {
            const r = await api.post(`/quotes/${q.id}/${action}`, Object.fromEntries(values));
            await qc.invalidateQueries();
            if (action === 'version') navigate('/devis/' + r.data.id + '/modifier');
          }}
        >
          {action === 'follow-up' && <><p>Une activité interne sera créée et liée à cette proposition. Aucun message ne sera envoyé.</p><label className="field">Date et heure<input name="due_at" type="datetime-local" required /></label></>}
          {action === 'submit' && (
            <p>
              Vérifier contact actif, validité, montant, marge et remise, puis déterminer le niveau de
              validation requis.
            </p>
          )}
          {action === 'send' && (
            <>
              <p>
                Confirmez que vous avez transmis cette version par un moyen externe. Aucun e-mail ne sera
                envoyé.
              </p>
              <label className="field">
                Destinataire de l’envoi
                <input
                  name="sent_to"
                  required
                  maxLength={300}
                  defaultValue={
                    contact
                      ? `${[contact.first_name, contact.last_name].filter(Boolean).join(' ')}${contact.email ? ' <' + contact.email + '>' : ''}`
                      : ''
                  }
                />
              </label>
            </>
          )}
          {action === 'decision' && (
            <>
              <label className="field">
                Décision
                <select name="decision" value={decision} onChange={(e) => setDecision(e.target.value)}>
                  <option value="accepte">Accepté</option>
                  <option value="refuse">Refusé</option>
                </select>
              </label>
              {decision === 'refuse' && (
                <label className="field">
                  Motif du refus
                  <textarea name="reason" required maxLength={1000} />
                </label>
              )}
            </>
          )}
          {['approve', 'reject'].includes(action) && (
            <label className="field">
              Commentaire{action === 'reject' ? ' *' : ''}
              <textarea name="comment" required={action === 'reject'} maxLength={1000} />
            </label>
          )}
          {action === 'version' && (
            <p>
              Créer un brouillon révisable avec une validité d’au moins 15 jours. Les versions actives
              précédentes seront annulées, avec leurs montants, documents et décisions conservés.
            </p>
          )}
          {action === 'cancel' && (
            <p>Annuler cette proposition sans supprimer ses lignes ni son historique.</p>
          )}
        </ActionForm>
      )}
    </>
  );
}
