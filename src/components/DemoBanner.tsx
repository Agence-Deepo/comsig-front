import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { Button } from './ui';

/** Bandeau de la démonstration : rappel « données fictives, lecture seule » et changement de profil. */
export function DemoBanner() {
  const { me, logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  useEffect(() => {
    const h = (e: Event) => toast('info', 'Démonstration', (e as CustomEvent<string>).detail);
    window.addEventListener('demo:notice', h);
    return () => window.removeEventListener('demo:notice', h);
  }, []);
  return (
    <div className="demo-banner no-print" role="note">
      <Info size={16} />
      <span><strong>Démonstration</strong> · données fictives, lecture seule · profil : {me?.role_label}{me?.department_label ? ` (${me.department_label})` : ''}</span>
      <span className="spacer" />
      <Button size="sm" variant="ghost" onClick={async () => { await logout(); nav('/connexion'); }}>Changer de profil</Button>
    </div>
  );
}
