import { lazy, StrictMode, Suspense, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@fontsource-variable/inter';
import 'leaflet/dist/leaflet.css';
import './styles/tokens.css';
import './styles/app.css';
import './styles/work.css';
import { AuthProvider, useAuth } from './lib/auth';
import { DEMO } from './demo/demo';
import { ToastProvider } from './lib/toast';
import { Layout } from './components/Layout';
import { ApiError } from './lib/api';

const Login = lazy(() => (DEMO ? import('./pages/DemoLogin') : import('./pages/Login')));
const Portal = lazy(() => (DEMO ? import('./pages/DemoLogin') : import('./pages/Portal')));
// La démonstration publiée tourne dans un cadre sans adresse propre : navigation en mémoire
const Router = DEMO ? MemoryRouter : BrowserRouter;
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Organizations = lazy(() => import('./pages/Organizations'));
const Prospection = lazy(() => import('./pages/Prospection'));
const OrganizationDetail = lazy(() => import('./pages/OrganizationDetail'));
const Opportunities = lazy(() => import('./pages/Opportunities'));
const OpportunityDetail = lazy(() => import('./pages/OpportunityDetail'));
const Activities = lazy(() => import('./pages/Activities'));
const Quotes = lazy(() => import('./pages/Quotes'));
const QuoteDetail = lazy(() => import('./pages/QuoteDetail'));
/** Depuis une opportunité : proposition rattachée (lignes du catalogue et du stock) ; sinon l'assistant « Nouveau devis ». */
function NewQuoteRoute() {
  const [sp] = useSearchParams();
  return sp.get('opportunity') ? <QuoteDetail /> : <NewQuote />;
}
const Contracts = lazy(() => import('./pages/Contracts'));
const ContractDetail = lazy(() => import('./pages/ContractDetail'));
const Tenders = lazy(() => import('./pages/Tenders'));
const Approvals = lazy(() => import('./pages/Approvals'));
const Supports = lazy(() => import('./pages/Supports'));
const SupportDetail = lazy(() => import('./pages/SupportDetail'));
const Planning = lazy(() => import('./pages/Planning'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const CampaignDetail = lazy(() => import('./pages/CampaignDetail'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const InterventionDetail = lazy(() => import('./pages/InterventionDetail'));
const Royalties = lazy(() => import('./pages/Royalties'));
const Finance = lazy(() => import('./pages/Finance'));
const Complaints = lazy(() => import('./pages/Complaints'));
const Reporting = lazy(() => import('./pages/Reporting'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Admin = lazy(() => import('./pages/Admin'));
const Stocks = lazy(() => import('./pages/Stocks'));
const StockItemDetail = lazy(() => import('./pages/StockItemDetail'));
const Production = lazy(() => import('./pages/Production'));
const Profile = lazy(() => import('./pages/Profile'));
const Workspace = lazy(() => import('./pages/Workspace'));
const CompanyWorkspace = lazy(() => import('./pages/CompanyWorkspace'));
const NewQuote = lazy(() => import('./pages/NewQuote'));
const Accounting = lazy(() => import('./pages/Accounting'));
const Performance = lazy(() => import('./pages/Performance'));
const SalesPipeline = lazy(() => import('./pages/SalesPipeline'));
const AdminSpace = lazy(() => import('./pages/AdminSpace'));
const TeamAccess = lazy(() => import('./pages/TeamAccess'));
const Messages = lazy(() => import('./pages/Messages'));
const Todo = lazy(() => import('./pages/Todo'));
const Flows = lazy(() => import('./pages/Flows'));
const FlowDetail = lazy(() => import('./pages/Flows').then((m) => ({ default: m.FlowDetail })));
const Surveys = lazy(() => import('./pages/Surveys'));
const Palettes = lazy(() => import('./pages/Palettes'));
const Security = lazy(() => import('./pages/Security'));
const PriorityProtocol = lazy(() => import('./pages/Governance').then((m) => ({ default: m.PriorityProtocol })));
const GovernanceAudits = lazy(() => import('./pages/Governance').then((m) => ({ default: m.GovernanceAudits })));
const GovernanceAuditDetail = lazy(() => import('./pages/Governance').then((m) => ({ default: m.GovernanceAuditDetail })));
const SurveyDetail = lazy(() => import('./pages/Surveys').then((m) => ({ default: m.SurveyDetail })));
const ClientRanking = lazy(() => import('./pages/ClientRanking'));
const Indicators = lazy(() => import('./pages/Indicators'));
const Hr = lazy(() => import('./pages/Hr'));
const EmployeeDetail = lazy(() => import('./pages/Hr').then((m) => ({ default: m.EmployeeDetail })));
const MyHr = lazy(() => import('./pages/Hr').then((m) => ({ default: m.MyHr })));
const MyAssistant = lazy(() => import('./pages/MyAssistant'));
const PeriodicReports = lazy(() => import('./pages/Reports').then((m) => ({ default: m.PeriodicReports })));
const ReportView = lazy(() => import('./pages/Reports').then((m) => ({ default: m.ReportView })));
const SwotList = lazy(() => import('./pages/Reports').then((m) => ({ default: m.SwotList })));
const SwotView = lazy(() => import('./pages/Reports').then((m) => ({ default: m.SwotView })));
const Tasks = lazy(() => import('./pages/Tasks'));
const CalendarPage = lazy(() => import('./pages/Calendar'));
const WorkOrders = lazy(() => import('./pages/WorkOrders'));
const WorkOrderDetail = lazy(() => import('./pages/WorkOrders').then((m) => ({ default: m.WorkOrderDetail })));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/Projects').then((m) => ({ default: m.ProjectDetail })));
const Collectivities = lazy(() => import('./pages/Regie').then((m) => ({ default: m.Collectivities })));
const CollectivityDetail = lazy(() => import('./pages/Regie').then((m) => ({ default: m.CollectivityDetail })));
const Deployments = lazy(() => import('./pages/Regie').then((m) => ({ default: m.Deployments })));

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      refetchOnWindowFocus: false,
      retry: (n, e) => !(e instanceof ApiError && [401, 403, 404].includes(e.status)) && n < 2,
    },
  },
});

function Protected({ children }: { children: ReactNode }) {
  const { me, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="loading-page"><span className="spinner" /></div>;
  // Entrée par le portail des départements (palettes) ; la démonstration propose ses profils au même endroit
  if (!me || me.mfa_pending) return <Navigate to={DEMO || me?.mfa_pending ? '/connexion' : '/portail'} state={{ from: loc.pathname }} replace />;
  if (me.mfa_enrollment_required && loc.pathname !== '/profil') return <Navigate to="/profil" replace />;
  return <>{children}</>;
}

/** Écran réservé : message explicite plutôt que des listes vides (le serveur refuse de toute façon les données). */
function Need({ module, children }: { module: string; children: ReactNode }) {
  const { me } = useAuth();
  if (!me?.perms?.[module]?.includes('view')) {
    return <div className="empty"><h3>Accès non autorisé</h3><p>Votre profil ({me?.role_label}{me?.department_label ? `, ${me.department_label}` : ''}) ne donne pas accès à cet écran. Contactez un administrateur si vous en avez besoin.</p></div>;
  }
  return <>{children}</>;
}

const Fallback = () => <div className="loading-page"><span className="spinner" aria-label="Chargement" /></div>;
/** Accueil : tableau de bord commercial et direction ; les autres services arrivent sur leur espace. */
function Home() {
  const { me } = useAuth();
  if (me?.cross_department || me?.perms?.opportunities?.includes('view') || me?.perms?.admin?.includes('view')) return <Dashboard />;
  return <Workspace />;
}
/** Module RH : service RH et direction ; responsables de service pour leur équipe (pointage, congés). */
function HrGate({ children }: { children: ReactNode }) {
  const { me } = useAuth();
  if (me?.perms?.hr?.includes('view') || me?.cross_department || me?.data_scope !== 'own') return <>{children}</>;
  return <div className="empty"><h3>Accès non autorisé</h3><p>Le module RH est réservé au service des ressources humaines et aux responsables. Votre pointage et vos congés sont dans « Mon espace RH ».</p></div>;
}
const NotFound = () => <div className="empty"><h3>Page introuvable</h3><p>Le lien est peut-être obsolète. Utilisez la recherche (Ctrl K) ou le menu.</p></div>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<Fallback />}>
              <Routes>
                <Route path="/connexion" element={<Login />} />
                <Route path="/connexion/:dept" element={<Login />} />
                <Route path="/portail" element={<Portal />} />
                <Route element={<Protected><Layout /></Protected>}>
                  <Route index element={<Suspense fallback={<Fallback />}><Home /></Suspense>} />
                  <Route path="prospection" element={<Need module="organizations"><Prospection /></Need>} />
                  <Route path="organisations" element={<Need module="organizations"><Organizations /></Need>} />
                  <Route path="organisations/:id" element={<Need module="organizations"><OrganizationDetail /></Need>} />
                  <Route path="opportunites" element={<Need module="opportunities"><Opportunities /></Need>} />
                  <Route path="opportunites/:id" element={<Need module="opportunities"><OpportunityDetail /></Need>} />
                  <Route path="activites" element={<Need module="activities"><Activities /></Need>} />
                  <Route path="devis" element={<Need module="quotes"><Quotes /></Need>} />
                  <Route path="devis/:id" element={<Need module="quotes"><QuoteDetail /></Need>} />
                  <Route path="contrats" element={<Need module="contracts"><Contracts /></Need>} />
                  <Route path="contrats/:id" element={<Need module="contracts"><ContractDetail /></Need>} />
                  <Route path="appels-offres" element={<Need module="contracts"><Tenders /></Need>} />
                  <Route path="validations" element={<Approvals />} />
                  <Route path="supports" element={<Need module="supports"><Supports /></Need>} />
                  <Route path="supports/:id" element={<Need module="supports"><SupportDetail /></Need>} />
                  <Route path="planning" element={<Need module="supports"><Planning /></Need>} />
                  <Route path="campagnes" element={<Need module="campaigns"><Campaigns /></Need>} />
                  <Route path="campagnes/:id" element={<Need module="campaigns"><CampaignDetail /></Need>} />
                  <Route path="maintenance" element={<Need module="interventions"><Maintenance /></Need>} />
                  <Route path="maintenance/:id" element={<Need module="interventions"><InterventionDetail /></Need>} />
                  <Route path="redevances" element={<Need module="royalties"><Royalties /></Need>} />
                  <Route path="finance" element={<Need module="finance"><Finance /></Need>} />
                  <Route path="reclamations" element={<Need module="complaints"><Complaints /></Need>} />
                  <Route path="reporting" element={<Need module="reporting"><Reporting /></Need>} />
                  <Route path="assistant" element={<Need module="ai"><Assistant /></Need>} />
                  <Route path="assistant/connaissances" element={<Need module="ai"><Assistant tab="kb" /></Need>} />
                  <Route path="stocks" element={<Need module="stocks"><Stocks /></Need>} />
                  <Route path="stocks/:id" element={<Need module="stocks"><StockItemDetail /></Need>} />
                  <Route path="production" element={<Need module="production"><Production /></Need>} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="admin/:section" element={<Admin />} />
                  <Route path="profil" element={<Profile />} />
                  <Route path="espace" element={<Workspace />} />
                  <Route path="espace-entreprise" element={<Need module="projects"><CompanyWorkspace /></Need>} />
                  <Route path="devis/nouveau" element={<Need module="quotes"><NewQuoteRoute /></Need>} />
                  <Route path="comptabilite" element={<Need module="accounting"><Accounting /></Need>} />
                  <Route path="performance" element={<Need module="performance"><Performance /></Need>} />
                  <Route path="pipeline-commerciaux" element={<Need module="opportunities"><SalesPipeline /></Need>} />
                  <Route path="espace-admin" element={<Need module="admin"><AdminSpace /></Need>} />
                  <Route path="mon-equipe/acces" element={<TeamAccess />} />
                  <Route path="messagerie" element={<Messages />} />
                  <Route path="todo" element={<Todo />} />
                  <Route path="circuits" element={<Flows />} />
                  <Route path="circuits/:id" element={<FlowDetail />} />
                  <Route path="reperages" element={<Surveys />} />
                  <Route path="services" element={<Palettes />} />
                  <Route path="securite" element={<Security />} />
                  <Route path="protocole-priorites" element={<PriorityProtocol />} />
                  <Route path="gouvernance/audits" element={<GovernanceAudits />} />
                  <Route path="gouvernance/audits/:id" element={<GovernanceAuditDetail />} />
                  <Route path="reperages/:id" element={<SurveyDetail />} />
                  <Route path="clients/classement" element={<Need module="organizations"><ClientRanking /></Need>} />
                  <Route path="indicateurs" element={<Indicators />} />
                  <Route path="rh" element={<HrGate><Hr /></HrGate>} />
                  <Route path="rh/agents/:id" element={<HrGate><EmployeeDetail /></HrGate>} />
                  <Route path="mon-espace-rh" element={<MyHr />} />
                  <Route path="mon-assistant" element={<MyAssistant />} />
                  <Route path="rapports" element={<PeriodicReports />} />
                  <Route path="rapports/:id" element={<ReportView />} />
                  <Route path="swot" element={<SwotList />} />
                  <Route path="swot/:id" element={<SwotView />} />
                  <Route path="taches" element={<Need module="tasks"><Tasks /></Need>} />
                  <Route path="calendrier" element={<Need module="calendar"><CalendarPage /></Need>} />
                  <Route path="ordres-travail" element={<Need module="workorders"><WorkOrders /></Need>} />
                  <Route path="ordres-travail/:id" element={<Need module="workorders"><WorkOrderDetail /></Need>} />
                  <Route path="projets" element={<Need module="projects"><Projects /></Need>} />
                  <Route path="projets/:id" element={<Need module="projects"><ProjectDetail /></Need>} />
                  <Route path="regie/collectivites" element={<Need module="collectivities"><Collectivities /></Need>} />
                  <Route path="regie/collectivites/:id" element={<Need module="collectivities"><CollectivityDetail /></Need>} />
                  <Route path="regie/deploiements" element={<Need module="projects"><Deployments /></Need>} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
