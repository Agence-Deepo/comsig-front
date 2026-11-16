// Rendu Markdown minimal et sûr (aucun HTML injecté) pour les réponses de l'assistant
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { safePath } from './format';

function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**')) out.push(<strong key={`${key}-${i++}`}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith('`')) out.push(<code key={`${key}-${i++}`}>{t.slice(1, -1)}</code>);
    else if (t.startsWith('[')) {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!;
      const href = lm[2];
      out.push(safePath(href, '') ? <Link key={`${key}-${i++}`} to={href}>{lm[1]}</Link> : <span key={`${key}-${i++}`}>{lm[1]}</span>);
    } else out.push(<em key={`${key}-${i++}`}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0, k = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (/^---+$/.test(l.trim())) { blocks.push(<hr key={k++} />); i++; continue; }
    const h = /^(#{1,4})\s+(.*)$/.exec(l);
    if (h) { blocks.push(<h4 key={k++}>{inline(h[2], k)}</h4>); i++; continue; }
    if (l.trim().startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      blocks.push(<table key={k++}><thead><tr>{rows[0]?.map((c, j) => <th key={j}>{inline(c, j)}</th>)}</tr></thead>
        <tbody>{rows.slice(1).map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c, j)}</td>)}</tr>)}</tbody></table>);
      continue;
    }
    if (/^>\s?/.test(l)) {
      const q: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      blocks.push(<blockquote key={k++}>{q.map((x, j) => <Fragment key={j}>{inline(x, j)}{j < q.length - 1 && <br />}</Fragment>)}</blockquote>);
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
      const ordered = /^\s*\d+\./.test(l);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '')); i++; }
      const li = items.map((x, j) => <li key={j}>{inline(x, j)}</li>);
      blocks.push(ordered ? <ol key={k++}>{li}</ol> : <ul key={k++}>{li}</ul>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|>|\||\s*([-*]|\d+\.)\s|---)/.test(lines[i])) { para.push(lines[i]); i++; }
    blocks.push(<p key={k++}>{para.map((x, j) => <Fragment key={j}>{inline(x, j)}{j < para.length - 1 && <br />}</Fragment>)}</p>);
  }
  return <div className="md">{blocks}</div>;
}
