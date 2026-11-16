// Annonce vocale des messages internes et des rappels : le navigateur lit à voix haute l'arrivée d'un message,
// puis les rappels à 5 et 10 minutes horodatés par le serveur tant que le message n'est pas ouvert, et les rappels de la to-do list.
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Volume2, VolumeX } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';

const PREF = 'comsig.voice';
const SEEN = 'comsig.voice.seen';

const store = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
};

export function voiceEnabled() { return store.get(PREF, true); }

/** Lit un texte en français ; signal sonore court si la synthèse vocale est indisponible. */
export function speak(text: string) {
  const s = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (s && typeof SpeechSynthesisUtterance !== 'undefined') {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    const fr = s.getVoices().find((v) => v.lang?.toLowerCase().startsWith('fr'));
    if (fr) u.voice = fr;
    u.rate = 1;
    s.speak(u);
    return;
  }
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC(); const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = 880; g.gain.value = 0.05; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.2);
  } catch { /* pas de son disponible */ }
}

const STAGE_TEXT = ['', 'depuis 5 minutes', 'depuis 10 minutes'];

/** Sonde les messages non lus et les rappels ; annonce chaque événement une seule fois (mémorisé dans ce navigateur). */
export function useVoiceAnnouncer(enabled: boolean) {
  const toast = useToast();
  const first = useRef(true);
  const unread = useQuery({ queryKey: ['messages-unread'], queryFn: () => api.get<{ count: number; rows: any[] }>('/api/messages/unread'), refetchInterval: 15_000, enabled });
  const reminders = useQuery({ queryKey: ['todo-reminders'], queryFn: () => api.get<{ rows: any[] }>('/api/todos/reminders'), refetchInterval: 30_000, enabled });
  useEffect(() => {
    if (!unread.data) return;
    const seen: Record<string, number> = store.get(SEEN, {});
    const on = voiceEnabled();
    const fresh = unread.data.rows.filter((m) => seen[`m:${m.id}`] === undefined);
    const reminded = unread.data.rows.filter((m) => seen[`m:${m.id}`] !== undefined && m.reminder_count > seen[`m:${m.id}`]);
    // À l'ouverture de session : un résumé plutôt qu'une lecture de chaque ancien message
    if (first.current && fresh.length > 2) {
      if (on) speak(`Vous avez ${unread.data.count} messages non lus.`);
      for (const m of fresh) seen[`m:${m.id}`] = m.reminder_count;
    } else {
      for (const m of fresh) {
        if (on) speak(`Nouveau message de ${m.sender_name}. Objet : ${m.subject}.`);
        toast('info', `Nouveau message de ${m.sender_name}`, m.subject);
        seen[`m:${m.id}`] = m.reminder_count;
      }
    }
    for (const m of reminded) {
      if (on) speak(`Rappel : le message de ${m.sender_name}, « ${m.subject} », n’est pas encore ouvert ${STAGE_TEXT[m.reminder_count]}.`);
      toast('info', `Message non lu ${STAGE_TEXT[m.reminder_count]}`, `${m.sender_name} : ${m.subject}`);
      seen[`m:${m.id}`] = m.reminder_count;
    }
    first.current = false;
    // Purge : seuls les messages encore non lus sont conservés
    const keep: Record<string, number> = {};
    for (const [k, v] of Object.entries(seen)) if (!k.startsWith('m:') || unread.data.rows.some((m) => `m:${m.id}` === k)) keep[k] = v;
    store.set(SEEN, keep);
  }, [unread.data]);
  useEffect(() => {
    if (!reminders.data) return;
    const seen: Record<string, number> = store.get(SEEN, {});
    for (const t of reminders.data.rows) {
      const k = `t:${t.id}:${t.reminded_at}`;
      if (seen[k] !== undefined) continue;
      if (voiceEnabled()) speak(`Rappel de votre liste de tâches : ${t.title}.`);
      toast('info', 'Rappel', t.title);
      seen[k] = 1;
    }
    store.set(SEEN, seen);
  }, [reminders.data]);
  return unread.data?.count ?? 0;
}

export function VoiceToggle() {
  const [on, setOn] = useState(voiceEnabled());
  return (
    <button className="btn btn-ghost btn-icon" aria-pressed={on} title={on ? 'Annonce vocale activée' : 'Annonce vocale coupée'} aria-label={on ? 'Couper l’annonce vocale' : 'Activer l’annonce vocale'}
      onClick={() => { const v = !on; store.set(PREF, v); setOn(v); if (v) speak('Annonce vocale activée.'); else window.speechSynthesis?.cancel(); }}>
      {on ? <Volume2 /> : <VolumeX />}
    </button>
  );
}
