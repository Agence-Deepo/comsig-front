import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, PageHeader } from '../components/ui';
import { api } from './api';
import { ActionForm, ErrorBox, Loading } from './ui';
import type { Row } from './types';

export default function TeamAccess() {
  const [creating, setCreating] = useState(false);
  const [credential, setCredential] = useState<{name:string; password:string} | null>(null);
  const qc = useQueryClient();
  const q = useQuery({queryKey:['team-access'], queryFn:()=>api.get('/team/access')});
  return <><PageHeader title="Accès de mon équipe" subtitle="Comptes du service, sous contrôle du responsable." /><ErrorBox error={q.error}/>{q.isLoading && <Loading/>}{credential && <div className="notice warning"><strong>Mot de passe temporaire de {credential.name} : {credential.password}</strong><p>À communiquer de manière sécurisée. Il ne sera plus affiché après fermeture ; le changement est obligatoire à la connexion.</p><button className="btn" onClick={()=>setCredential(null)}>Fermer</button></div>}{q.data && <><button className="btn" disabled={!q.data.roles.length} onClick={()=>setCreating(true)}>Créer un accès</button>{!q.data.roles.length && <p>Aucun rôle délégable dans votre périmètre. Contactez l’administration.</p>}<Card title="Membres du service"><div style={{overflowX:'auto'}}><table><thead><tr><th>Nom</th><th>Identifiant</th><th>Adresse</th><th>Rôle</th><th>État</th></tr></thead><tbody>{q.data.members.map((m:Row)=><tr key={m.id}><td>{m.name}</td><td>{m.username}</td><td>{m.email}</td><td>{m.role?.label}</td><td>{m.is_active?'Actif':'Désactivé'}</td></tr>)}</tbody></table></div></Card>{creating && <ActionForm title="Créer un accès pour le service" close={()=>setCreating(false)} submit={async f=>{const result=await api.post('/team/access',{name:f.get('name'),email:String(f.get('email')).toLowerCase(),username:f.get('username'),role_id:Number(f.get('role_id'))});setCredential({name:result.user.name,password:result.temporary_password});await qc.invalidateQueries({queryKey:['team-access']});}}><label className="field">Nom<input name="name" required /></label><label className="field">Identifiant<input name="username" pattern="[a-z0-9._-]+" required /></label><label className="field">E-mail<input name="email" type="email" required /></label><label className="field">Rôle<select name="role_id">{q.data.roles.map((r:Row)=><option key={r.id} value={r.id}>{r.label}</option>)}</select></label></ActionForm>}</>}</>;
}
