import { Alert, Button } from '../components/ui';
import { useAuth } from './auth';

export function AuthLoading() {
  return (
    <div className="loading-page" role="status">
      <span className="spinner" aria-hidden />
      <span>Vérification de votre session…</span>
    </div>
  );
}
export function AuthUnavailable() {
  const { error, refresh } = useAuth();
  return (
    <main className="loading-page">
      <div className="stack">
        <Alert tone="danger" title="Vérification de session impossible">
          {error instanceof Error
            ? error.message
            : 'Le serveur ne répond pas. Vos données ne sont pas chargées.'}
        </Alert>
        <Button
          onClick={() => {
            void refresh();
          }}
        >
          Réessayer
        </Button>
      </div>
    </main>
  );
}
