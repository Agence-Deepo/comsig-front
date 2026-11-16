import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { safePath } from '../lib/format';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Building2,
  UserRound,
  Kanban,
  FileText,
  FileSignature,
  Map as MapIcon,
  Megaphone,
  Wrench,
} from 'lucide-react';
import { allRecords } from './forms';
import { useAuth } from './auth';
import { can } from './types';

const ICONS: Record<string, JSX.Element> = {
  Organisation: <Building2 />,
  Contact: <UserRound />,
  Opportunité: <Kanban />,
  Devis: <FileText />,
  Contrat: <FileSignature />,
  Support: <MapIcon />,
  Campagne: <Megaphone />,
  Intervention: <Wrench />,
};

/** Recherche globale (Ctrl+K) : fiches, opportunités, devis, contrats, supports — filtrée par droits côté serveur. */
export function SearchPalette({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [active, setActive] = useState(0);
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 180);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    input.current?.focus();
  }, []);
  const res = useQuery({
    queryKey: ['crm-search', user?.id, debounced],
    enabled: debounced.length >= 2,
    queryFn: async ({ signal }) => {
      const sources = [
        { type: 'Organisation', resource: 'organizations', permission: 'organizations', path: 'clients' },
        { type: 'Opportunité', resource: 'opportunities', permission: 'opportunities', path: 'opportunites' },
        { type: 'Devis', resource: 'quotes', permission: 'quotes', path: 'devis' },
        { type: 'Support', resource: 'erp/supports', permission: 'campaigns', path: 'supports' },
        { type: 'Campagne', resource: 'erp/campaigns', permission: 'campaigns', path: 'campagnes' },
      ].filter((source) => can(user, source.permission + '.view'));
      const groups = await Promise.all(
        sources.map(async (source) => {
          const records = await allRecords(source.resource, signal);
          return records
            .filter((row) =>
              [
                row.title,
                row.legal_name,
                row.name,
                row.label,
                row.ref,
                row.number,
                row.phone,
                row.email,
              ].some((value) =>
                String(value ?? '')
                  .toLocaleLowerCase('fr')
                  .includes(debounced.toLocaleLowerCase('fr')),
              ),
            )
            .slice(0, 8)
            .map((row) => ({
              id: row.id,
              type: source.type,
              title: row.legal_name || row.title || row.name || row.label || row.ref || row.number,
              subtitle: [row.number || row.ref, row.organization?.legal_name].filter(Boolean).join(' · '),
              link: '/' + source.path + '/' + row.id,
            }));
        }),
      );
      return { results: groups.flat() };
    },
  });
  const results = res.data?.results ?? [];
  const groups = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const r of results) (g[r.type] ??= []).push(r);
    return g;
  }, [results]);
  useEffect(() => setActive(0), [debounced]);
  const go = (r: any) => {
    onClose();
    nav(safePath(r.link));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === 'Enter' && results[active]) go(results[active]);
  };
  let idx = -1;
  return createPortal(
    <div className="palette" role="dialog" aria-modal="true" aria-label="Recherche globale">
      <div className="scrim" onClick={onClose} />
      <div className="palette-box">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: 19, color: 'var(--text-3)' }} />
          <input
            ref={input}
            className="palette-input"
            placeholder="Nom, référence (OPP-, DEV-, CTR-…), téléphone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="palette-list"
            aria-activedescendant={results[active] ? `res-${active}` : undefined}
          />
        </div>
        <div className="palette-results" id="palette-list" role="listbox">
          {debounced.length < 2 && (
            <p className="muted small" style={{ padding: 12 }}>
              Saisissez au moins deux caractères. Astuce : <span className="kbd">Ctrl K</span> ouvre cette
              recherche depuis n’importe quel écran.
            </p>
          )}
          {res.isFetching && debounced.length >= 2 && !results.length && (
            <p className="muted small" style={{ padding: 12 }}>
              Recherche…
            </p>
          )}
          {res.isError && (
            <p role="alert" className="text-danger small" style={{ padding: 12 }}>
              La recherche a échoué. Réessayez ou ouvrez le module concerné.
            </p>
          )}
          {!res.isError && !res.isFetching && debounced.length >= 2 && !results.length && (
            <p className="muted small" style={{ padding: 12 }}>
              Aucun résultat pour « {debounced} » dans votre périmètre.
            </p>
          )}
          {Object.entries(groups).map(([type, items]) => (
            <div key={type}>
              <div className="palette-group">{type}</div>
              {items.map((r) => {
                idx++;
                const i = idx;
                return (
                  <button
                    key={r.type + r.id}
                    id={`res-${i}`}
                    role="option"
                    aria-selected={active === i}
                    className="menu-item"
                    data-active={active === i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                  >
                    {ICONS[type]}
                    <span style={{ minWidth: 0 }}>
                      <span className="strong truncate" style={{ display: 'block' }}>
                        {r.title}
                      </span>
                      <span className="xsmall muted truncate" style={{ display: 'block' }}>
                        {r.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
