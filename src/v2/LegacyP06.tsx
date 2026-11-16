import type { ReactNode } from 'react';
import { AuthProvider as LegacyAuthProvider } from '../lib/auth';
import { ToastProvider } from '../lib/toast';

export default function LegacyP06({ children }: { children: ReactNode }) {
  return <LegacyAuthProvider><ToastProvider>{children}</ToastProvider></LegacyAuthProvider>;
}
