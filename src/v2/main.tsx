import { Component, StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '@fontsource-variable/inter';
import '../styles/tokens.css';
import '../styles/app.css';
import '../styles/work.css';
import './crm-compat.css';
import './erp.css';
import { HttpError } from './api';
import { AuthProvider, useAuth } from './auth';
import Profile from './CrmProfile';
import { AuthLoading, AuthUnavailable } from './AuthStatus';
import Login from './CrmLogin';
import AccountRecovery from './AccountRecovery';
import { CustomerList, CustomerDetail } from './Customers';
import CustomerRanking from './CustomerRanking';
import Opportunities, { OpportunityDetail } from './Opportunities';
import CustomerReferences from './CustomerReferences';
import Portal from './CrmPortal';
import { CrmLayout } from './CrmLayout';
import { AdminSection, CrmServices, LegacyAlias, PendingPage } from './CrmRoutes';
import { Departments, Audit } from './Admin';
import CommissionPlansAdmin from './CommissionPlansAdmin';
import Activities from './Activities';
import LocalAssistant from './LocalAssistant';
import { Roadmap } from './Workspace';
import Dashboard from './CrmDashboard';
import DirectionDashboard from './DirectionDashboard';
import { ModuleGate, RecordList, RecordDetail } from './Records';
import QuoteEditor from './QuoteEditor';
import { Quotes, QuoteDetail } from './Quotes';
import { modules } from './modules';
import ServiceWorkspace, { AdministrationWorkspace } from './ServiceWorkspace';
import TaskWorkspace from './TaskWorkspace';
import WorkOrders, { WorkOrderDetail } from './WorkOrders';
import PersonalWork from './PersonalWork';
import CampaignWorkspace from './CampaignWorkspace';
import StockInventory, { CountSession } from './StockInventory';
import SupportWorkspace from './RegieSupport';
import StockWorkspace from './StockWorkspace';
import ProjectWorkspace from './ProjectWorkspace';
import ProductionWorkshop, { WorkshopOrderRoute } from './ProductionWorkshop';
import MyHr from './MyHr';
import CustomerAccount, { OverdueInvoices } from './CustomerAccount';
import HrDevelopment from './HrDevelopment';
import ContractWorkspace, { Tenders } from './ContractWorkspace';
import { Messages, MessageThread } from './Messaging';
import PeriodicReports, { ReportView } from './PeriodicReports';
import { SwotList, SwotView } from './Swot';
import Planning from './RegiePlanning';
import LegacyP06 from './LegacyP06';
import Flows, { FlowDetail } from '../pages/Flows';
import Surveys, { SurveyDetail } from '../pages/Surveys';
import CalendarPage from '../pages/Calendar';
import CompanyWorkspace from './CompanyWorkspace';
import PriorityProtocol from './PriorityProtocol';
import Indicators from './Indicators';
import Performance from './Performance';
import TeamAccess from './TeamAccess';
import Governance from './Governance';
import CommissionPayments from './CommissionPayments';
import SecurityOverview from './SecurityOverview';
import SecurityArchives from './SecurityArchives';
import DirectionReporting from './DirectionReporting';

import { AccountingBalance, FneStatus, PaymentReviews } from './ErpPanels';
import { can } from './types';
import { PageTitle } from './ui';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      refetchOnWindowFocus: false,
      retry: (attempt, error) =>
        !(error instanceof HttpError && [0, 401, 403, 404, 422, 429].includes(error.status)) && attempt < 1,
    },
    mutations: { retry: false },
  },
});
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <main className="fatal">
        <h1>L’écran n’a pas pu être affiché.</h1>
        <p>
          Vous pouvez recharger la page et vous reconnecter. Si le problème persiste, contactez
          l’administrateur.
        </p>
        <button className="button primary" onClick={() => window.location.reload()}>
          Recharger
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function Protected() {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoading />;
  if (error) return <AuthUnavailable />;
  if (!user)
    return <Navigate to="/connexion" state={{ from: location.pathname + location.search }} replace />;
  if (user.must_change_password && location.pathname !== '/profil') return <Navigate to="/profil" replace />;
  return <CrmLayout />;
}
function ProfileHome() {
  const { user } = useAuth();
  if (user?.role?.code === 'direction_generale') return <DirectionDashboard />;
  if (can(user, 'admin.view')) return <AdministrationWorkspace />;
  if (can(user, 'opportunities.view')) return <Dashboard />;
  return <ServiceWorkspace />;
}
function CountSessionRoute() {
  const { id } = useParams();
  return id ? <CountSession id={id} /> : <Navigate to="/stocks/inventaire" replace />;
}

function Permission({ permission, children }: { permission: string; children: ReactNode }) {
  const { user } = useAuth();
  return can(user, permission) ? (
    <>{children}</>
  ) : (
    <>
      <PageTitle title="Accès non autorisé" />
      <p>Votre profil ne permet pas de consulter cette page.</p>
    </>
  );
}
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/connexion" element={<Login />} />
        <Route path="/connexion/:dept" element={<Login />} />
        <Route path="/portail" element={<Portal />} />
        <Route path="/mot-de-passe-oublie" element={<AccountRecovery />} />
        <Route path="/reinitialiser" element={<AccountRecovery />} />
        <Route element={<Protected />}>
          <Route index element={<ProfileHome />} />
          <Route
            path="clients/classement"
            element={
              <Permission permission="organizations.view">
                <CustomerRanking />
              </Permission>
            }
          />
          <Route
            path="referentiels-clients"
            element={
              <Permission permission="admin.view">
                <CustomerReferences />
              </Permission>
            }
          />
          <Route path="espace" element={<ServiceWorkspace />} />
          <Route path="espace-admin" element={<AdministrationWorkspace />} />
          <Route path="todo" element={<PersonalWork />} />
          <Route
            path="circuits"
            element={
              <LegacyP06>
                <Flows />
              </LegacyP06>
            }
          />
          <Route
            path="circuits/:id"
            element={
              <LegacyP06>
                <FlowDetail />
              </LegacyP06>
            }
          />
          <Route
            path="reperages"
            element={
              <LegacyP06>
                <Surveys />
              </LegacyP06>
            }
          />
          <Route
            path="reperages/:id"
            element={
              <LegacyP06>
                <SurveyDetail />
              </LegacyP06>
            }
          />
          <Route
            path="ordres-travail"
            element={
              <Permission permission="workorders.view">
                <WorkOrders />
              </Permission>
            }
          />
          <Route
            path="ordres-travail/:id"
            element={
              <Permission permission="workorders.view">
                <WorkOrderDetail />
              </Permission>
            }
          />
          <Route path="indicateurs" element={<Indicators />} />
          <Route path="reporting" element={<Permission permission="reporting.view"><DirectionReporting /></Permission>} />
          <Route path="performance" element={<Performance />} />
          <Route
            path="commissions/paiements"
            element={
              <Permission permission="finance.view">
                <CommissionPayments />
              </Permission>
            }
          />
          <Route path="mon-equipe/acces" element={<TeamAccess />} />
          <Route path="gouvernance/audits" element={<Governance />} />
          <Route
            path="securite"
            element={
              <Permission permission="admin.view">
                <SecurityOverview />
              </Permission>
            }
          />
          <Route
            path="securite/archives"
            element={
              <Permission permission="admin.view">
                <SecurityArchives />
              </Permission>
            }
          />
          <Route path="pipeline-commerciaux" element={<Performance pipeline />} />
          <Route path="espace-entreprise" element={<CompanyWorkspace />} />
          <Route path="protocole-priorites" element={<PriorityProtocol />} />
          <Route path="rh/agents/:id" element={<LegacyAlias from="/rh/agents" to="/effectif" />} />
          <Route path="admin/commissions" element={<CommissionPlansAdmin />} />
          <Route path="admin/:section" element={<AdminSection />} />
          {Object.entries({
            organisations: 'clients',
            finance: 'factures',
            comptabilite: 'ecritures',
            production: 'ordres-production',
            validations: 'devis',
            rh: 'effectif',
            admin: 'utilisateurs',
          }).map(([from, to]) => (
            <Route key={from} path={from + '/*'} element={<LegacyAlias from={'/' + from} to={'/' + to} />} />
          ))}
          {modules.map((module) => (
            <Route
              key={module.path}
              path={module.path}
              element={
                <ModuleGate path={module.path}>
                  {module.key === 'organizations' ? (
                    <CustomerList />
                  ) : module.key === 'opportunities' ? (
                    <Opportunities />
                  ) : module.key === 'quotes' ? (
                    <Quotes />
                  ) : module.key === 'tasks' ? (
                    <TaskWorkspace />
                  ) : module.key === 'activities' ? (
                    <Activities />
                  ) : module.key === 'erp/production-orders' ? (
                    <ProductionWorkshop />
                  ) : (
                    <RecordList key={module.key} module={module} />
                  )}
                </ModuleGate>
              }
            />
          ))}
          {modules
            .filter((module) => module.detail)
            .map((module) => (
              <Route
                key={module.path}
                path={`${module.path}/:id`}
                element={
                  <ModuleGate path={module.path}>
                    {module.key === 'organizations' ? (
                      <CustomerDetail />
                    ) : module.key === 'opportunities' ? (
                      <OpportunityDetail />
                    ) : module.key === 'quotes' ? (
                      <QuoteDetail />
                    ) : module.key === 'erp/campaigns' ? (
                      <CampaignWorkspace />
                    ) : module.key === 'erp/supports' ? (
                      <SupportWorkspace />
                    ) : module.key === 'stock-items' ? (
                      <StockWorkspace />
                    ) : module.key === 'erp/projects' ? (
                      <ProjectWorkspace />
                    ) : module.key === 'erp/production-orders' ? (
                      <WorkshopOrderRoute />
                    ) : module.key === 'customer-cases/contracts' ? (
                      <ContractWorkspace />
                    ) : (
                      <RecordDetail key={module.key} module={module} />
                    )}
                  </ModuleGate>
                }
              />
            ))}
          <Route path="devis/nouveau" element={<QuoteEditor />} />
          <Route
            path="prospection"
            element={
              <Permission permission="organizations.view">
                <CustomerList prospection />
              </Permission>
            }
          />
          <Route path="devis/:id/modifier" element={<QuoteEditor />} />
          <Route
            path="pipeline"
            element={
              <Permission permission="opportunities.view">
                <Opportunities />
              </Permission>
            }
          />
          <Route
            path="calendrier"
            element={
              <Permission permission="tasks.view">
                <LegacyP06>
                  <CalendarPage />
                </LegacyP06>
              </Permission>
            }
          />
          <Route
            path="planning"
            element={
              <Permission permission="campaigns.view">
                <Planning />
              </Permission>
            }
          />
          <Route
            path="stocks/inventaire"
            element={
              <Permission permission="stocks.view">
                <StockInventory />
              </Permission>
            }
          />
          <Route
            path="stocks/inventaire/:id"
            element={
              <Permission permission="stocks.view">
                <CountSessionRoute />
              </Permission>
            }
          />
          <Route path="mon-espace-rh" element={<MyHr />} />
          <Route path="messagerie" element={<Messages />} />
          <Route path="mon-assistant" element={<LocalAssistant />} />
          <Route path="assistant" element={<LocalAssistant />} />
          <Route path="messagerie/:id" element={<MessageThread />} />
          <Route
            path="rapports"
            element={
              <Permission permission="reporting.view">
                <PeriodicReports />
              </Permission>
            }
          />
          <Route
            path="rapports/:id"
            element={
              <Permission permission="reporting.view">
                <ReportView />
              </Permission>
            }
          />
          <Route
            path="swot"
            element={
              <Permission permission="reporting.view">
                <SwotList />
              </Permission>
            }
          />
          <Route
            path="swot/:id"
            element={
              <Permission permission="reporting.view">
                <SwotView />
              </Permission>
            }
          />
          <Route
            path="appels-offres"
            element={
              <Permission permission="contracts.view">
                <Tenders />
              </Permission>
            }
          />
          <Route
            path="effectif/:id/developpement"
            element={
              <Permission permission="hr.view">
                <HrDevelopment />
              </Permission>
            }
          />
          <Route
            path="clients/:id/compte"
            element={
              <Permission permission="finance.view">
                <CustomerAccount />
              </Permission>
            }
          />
          <Route
            path="creances-echues"
            element={
              <Permission permission="finance.view">
                <OverdueInvoices />
              </Permission>
            }
          />
          <Route path="profil" element={<Profile />} />
          <Route
            path="validations-financieres"
            element={
              <Permission permission="finance.view">
                <PaymentReviews />
              </Permission>
            }
          />
          <Route
            path="balance-comptable"
            element={
              <Permission permission="accounting.view">
                <AccountingBalance />
              </Permission>
            }
          />
          <Route
            path="fne"
            element={
              <Permission permission="fne.view">
                <FneStatus />
              </Permission>
            }
          />
          <Route path="modules" element={<Roadmap />} />
          <Route path="services" element={<CrmServices />} />
          <Route
            path="gestion-services"
            element={
              <Permission permission="admin.view">
                <Departments />
              </Permission>
            }
          />
          <Route
            path="audit"
            element={
              <Permission permission="admin.view">
                <Audit />
              </Permission>
            }
          />
          <Route path="*" element={<PendingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
