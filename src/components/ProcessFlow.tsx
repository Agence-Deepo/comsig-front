import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, CircleDot, PauseCircle, XCircle } from 'lucide-react';
import { date } from '../lib/format';

export interface FlowItem {
  id: string; title: string; start?: string | null; end?: string | null; status?: string | null;
  who?: string | null; ref?: string | null; predecessor_id?: string | null; link?: string; onClick?: () => void; late?: boolean;
}

// Palette catégorielle validée (ordre fixe, jamais recyclée par rang : la couleur suit la tâche)
const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#7a4fb8', '#d9443a', '#0e9fb5', '#c98a00', '#d1477a', '#4f6bd8', '#3c9a4a'];
const DAY = 86400000;
const parse = (d?: string | null) => (d ? Date.parse(d.slice(0, 10) + 'T00:00:00Z') : NaN);
const STATUS_ICON: Record<string, JSX.Element> = {
  termine: <CheckCircle2 aria-hidden />, en_cours: <CircleDot aria-hidden />, en_attente: <PauseCircle aria-hidden />, annule: <XCircle aria-hidden />,
};
const STATUS_LABEL: Record<string, string> = { a_faire: 'À faire', en_cours: 'En cours', en_attente: 'En attente', termine: 'Terminé', annule: 'Annulé' };

/**
 * Frise chronologique en processus rectiligne : chaque tâche est une étape fléchée de sa couleur, dont la longueur
 * est proportionnelle à sa durée ; les attentes entre étapes apparaissent en pointillés ; un repère marque aujourd'hui.
 */
export function ProcessFlow({ items, emptyLabel = 'Ajoutez des dates de début et d’échéance aux tâches pour construire la frise.' }: { items: FlowItem[]; emptyLabel?: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const steps = useMemo(() => {
    const dated = items.filter((i) => !Number.isNaN(parse(i.start ?? i.end)) && i.status !== 'annule').map((i, idx) => {
      const s = parse(i.start ?? i.end), e = Math.max(s, parse(i.end ?? i.start));
      return { ...i, s, e: e + DAY, color: PALETTE[idx % PALETTE.length] };
    });
    dated.sort((a, b) => a.s - b.s || a.e - b.e);
    return dated;
  }, [items]);
  if (!steps.length) return <p className="small muted">{emptyLabel}</p>;
  const min = steps[0].s, max = Math.max(...steps.map((x) => x.e));
  const span = Math.max(DAY, max - min);
  const now = Date.now();
  const todayPct = ((now - min) / span) * 100;
  // Largeur proportionnelle à la durée ; attente (écart) avant l'étape, en pointillés
  let cursor = min;
  const segs = steps.map((st) => {
    const gap = Math.max(0, st.s - cursor);
    const dur = st.e - Math.max(st.s, cursor);
    cursor = Math.max(cursor, st.e);
    return { st, gapPct: (gap / span) * 100, durPct: Math.max(0.5, (Math.max(dur, DAY / 2) / span) * 100) };
  });
  const total = segs.reduce((s, g) => s + g.gapPct + g.durPct, 0);
  const scale = total > 100 ? 100 / total : 1;
  const ticks = ticksFor(min, max);
  return (
    <div className="flow" role="list" aria-label="Frise chronologique des tâches">
      <div className="flow-scroll">
        <div className="flow-inner">
          <div className="flow-axis" aria-hidden>
            {ticks.map((t) => <span key={t.t} style={{ left: `${((t.t - min) / span) * 100}%` }}>{t.label}</span>)}
            {todayPct >= 0 && todayPct <= 100 && <i className="flow-today" style={{ left: `${todayPct}%` }}><b>Aujourd’hui</b></i>}
          </div>
          <div className="flow-track">
            {segs.map(({ st, gapPct, durPct }, i) => (
              <div key={st.id} className="flow-seg" style={{ width: `${(gapPct + durPct) * scale}%` }}>
                {gapPct > 0 && <span className="flow-gap" style={{ width: `${(gapPct / (gapPct + durPct)) * 100}%` }} aria-hidden />}
                <button role="listitem" className={`flow-step st-${st.status ?? 'a_faire'}${hover === st.id ? ' hot' : ''}${st.late ? ' late' : ''}${i === 0 ? ' first' : ''}`}
                  style={{ ['--c' as any]: st.color, animationDelay: `${i * 70}ms` }} onMouseEnter={() => setHover(st.id)} onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(st.id)} onBlur={() => setHover(null)} onClick={st.onClick} title={`${i + 1}. ${st.title} — ${date(st.start ?? st.end)} → ${date(st.end ?? st.start)}`}
                  aria-label={`Étape ${i + 1} : ${st.title}, du ${date(st.start ?? st.end)} au ${date(st.end ?? st.start)}, ${STATUS_LABEL[st.status ?? 'a_faire'] ?? ''}${st.who ? `, ${st.who}` : ''}${st.late ? ', en retard' : ''}`}>
                  <span className="flow-num">{i + 1}</span>
                  <span className="flow-label">{st.title}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ol className="flow-legend">
        {segs.map(({ st }, i) => (
          <li key={st.id} className={hover === st.id ? 'hot' : ''} onMouseEnter={() => setHover(st.id)} onMouseLeave={() => setHover(null)}>
            <span className="flow-dot" style={{ background: st.color }}>{i + 1}</span>
            <span className="flow-ic">{STATUS_ICON[st.status ?? ''] ?? <Circle aria-hidden />}</span>
            <span className="spacer"><button className="link-btn strong" onClick={st.onClick}>{st.title}</button>
              <span className="xsmall muted"> {st.ref ? `${st.ref} · ` : ''}{date(st.start ?? st.end)} → {date(st.end ?? st.start)}{st.who ? ` · ${st.who}` : ''}{st.predecessor_id ? ` · après l’étape ${segs.findIndex((x) => x.st.id === st.predecessor_id) + 1 || '?'}` : ''}</span></span>
            <span className={`xsmall${st.late ? ' text-danger strong' : ' muted'}`}>{st.late ? 'En retard' : STATUS_LABEL[st.status ?? 'a_faire']}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ticksFor(min: number, max: number) {
  return (() => {
    const days = (max - min) / DAY;
    const out: { t: number; label: string }[] = [];
    const d = new Date(min);
    if (days > 120) { d.setUTCDate(1); for (let i = 0; i < 24 && d.getTime() <= max; i++) { if (d.getTime() >= min) out.push({ t: d.getTime(), label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }) }); d.setUTCMonth(d.getUTCMonth() + 1); } }
    else { const step = days > 45 ? 14 : days > 14 ? 7 : days > 6 ? 2 : 1; for (let i = 0; i < 60 && d.getTime() <= max; i++) { out.push({ t: d.getTime(), label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }); d.setUTCDate(d.getUTCDate() + step); } }
    return out;
  })();
}
