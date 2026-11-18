import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Target,
  Building2,
  Kanban,
  CalendarCheck,
  FileText,
  FileSignature,
  Gavel,
  Landmark,
  Map as MapIcon,
  CalendarRange,
  Megaphone,
  Wrench,
  Boxes,
  Factory,
  BookOpenCheck,
  Gauge,
  Trophy,
  Layers,
  Fingerprint,
  Contact,
  Home,
  ListTodo,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  MapPinned,
  Building,
  MessageSquareWarning,
  Wallet,
  Sparkles,
  Settings,
  BarChart3,
  ShieldCheck,
  Search,
  Menu,
  LogOut,
  KeyRound,
  Moon,
  Sun,
  Monitor,
  UserRound,
  BotMessageSquare,
  FileBarChart2,
  Grid2x2,
  Filter,
  UserPlus,
  MessagesSquare,
  ListChecks,
  Workflow,
  MapPin,
  LayoutGrid,
  ShieldAlert,
  ClipboardCheck,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { useCrmIdentity as useAuth, useCrmCan as useCan } from './crmIdentity';
import Notifications, { loadNotifications } from './Notifications';
import { Alert, Avatar, Button } from '../components/ui';
import { SearchPalette } from './CrmSearch';

export function Logo({ className = 'brand-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="7" fill="#17253a" />
      <path
        d="M9 20.5a6.5 6.5 0 0 1 0-9"
        stroke="#e3a35f"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M14 23.5a10.5 10.5 0 0 1 0-15"
        stroke="#fff"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="21.5" cy="16" r="3.2" fill="#5b8ff0" />
    </svg>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  show: boolean;
  count?: number;
  end?: boolean;
}

export function useAiPanel() {
  return {
    open: (detail?: { context_type?: string; context_id?: string; prompt?: string }) =>
      window.dispatchEvent(new CustomEvent('ai:open', { detail })),
  };
}

export function CrmLayout() {
  const { me, logout } = useAuth();
  const can = useCan();
  const nav = useNavigate();
  const loc = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [theme, setTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('theme') ?? 'system';
    } catch {
      return 'system';
    }
  });
  const userRef = useRef<HTMLDivElement>(null);

  const themeInit = useRef(true);
  useEffect(() => {
    // Au premier rendu en mode « système », on ne touche pas à l'attribut : un hôte (ex. visionneuse) peut l'avoir fixé
    if (themeInit.current && theme === 'system') {
      themeInit.current = false;
      return;
    }
    themeInit.current = false;
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* stockage indisponible */
    }
  }, [theme]);
  useEffect(() => setMenuOpen(false), [loc.pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, []);
  useEffect(() => {
    if (!userOpen) return;
    const h = (e: MouseEvent) => {
      if (!userRef.current?.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [userOpen]);

  // A pending MFA challenge never creates an authenticated identity.
  const ready = !!me && !me.mfa_enrollment_required;
  const approvals = useQuery({
    queryKey: ['notifications'],
    queryFn: loadNotifications,
    refetchInterval: 60_000,
    enabled: ready,
  });
  const unreadMessages = 0;

  const regie = me?.department_code === 'regie';
  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: 'Pilotage',
      items: [
        {
          to: '/espace-admin',
          label: me?.is_superadmin ? 'Espace super-administration' : 'Espace administration',
          icon: <ShieldCheck />,
          show: !!me?.is_admin,
        },
        {
          to: '/espace',
          label: me?.department_label ? `Espace ${me.department_label}` : 'Mon espace',
          icon: <Home />,
          show: (!!me?.department_code || !!me?.cross_department) && !me?.is_admin,
        },
        {
          to: '/services',
          label: 'Palettes des services',
          icon: <LayoutGrid />,
          show: !me?.is_admin && me?.account_kind !== 'service' && !!me?.department_code,
        },
        { to: '/espace-entreprise', label: 'Espace entreprise', icon: <Building2 />, show: true },
        { to: '/', label: 'Tableau de bord', icon: <LayoutDashboard />, show: true, end: true },
        { to: '/portail', label: 'Portail des espaces', icon: <Home />, show: true },
        { to: '/indicateurs', label: 'Indicateurs', icon: <Gauge />, show: true },
        { to: '/reporting', label: 'Reporting', icon: <BarChart3 />, show: can('reporting') },
        {
          to: '/rapports',
          label: 'Rapports périodiques',
          icon: <FileBarChart2 />,
          show: can('reporting') || !!me?.cross_department,
        },
        {
          to: '/swot',
          label: 'Analyse SWOT',
          icon: <Grid2x2 />,
          show: can('reporting') || !!me?.cross_department,
        },
        {
          to: '/validations',
          label: 'Validations',
          icon: <ShieldCheck />,
          show:
            can('quotes', 'validate') ||
            can('opportunities', 'validate') ||
            can('contracts', 'validate') ||
            ['direction_commerciale', 'direction_generale'].includes(me?.role_code ?? ''),
          count: approvals.data?.approvals_count || undefined,
        },
      ],
    },
    {
      label: 'Mon travail',
      items: [
        {
          to: '/messagerie',
          label: 'Messagerie',
          icon: <MessagesSquare />,
          show: true,
          count: unreadMessages || undefined,
        },
        { to: '/todo', label: 'To-do et checklists', icon: <ListChecks />, show: true },
        { to: '/mon-assistant', label: 'Mon assistant', icon: <BotMessageSquare />, show: true },
        { to: '/taches', label: 'Tâches et matrices', icon: <ListTodo />, show: can('tasks') },
        { to: '/calendrier', label: 'Calendrier', icon: <CalendarDays />, show: can('calendar') },
        {
          to: '/ordres-travail',
          label: 'Ordres de travail',
          icon: <ClipboardList />,
          show: can('workorders'),
        },
        {
          to: '/circuits',
          label: 'Circuits de production',
          icon: <Workflow />,
          show: me?.account_kind !== 'service',
        },
        {
          to: '/reperages',
          label: 'Rapports de repérage',
          icon: <MapPin />,
          show: me?.account_kind !== 'service',
        },
        { to: '/projets', label: 'Projets', icon: <FolderKanban />, show: can('projects') && !regie },
        { to: '/mon-espace-rh', label: 'Pointage et congés', icon: <Fingerprint />, show: true },
        {
          to: '/protocole-priorites',
          label: 'Protocole des priorités',
          icon: <Gauge />,
          show: me?.account_kind !== 'service',
        },
      ],
    },
    {
      label: regie ? 'Ventes de la régie' : 'Commercial',
      items: [
        {
          to: '/prospection',
          label: 'Prospection',
          icon: <Target />,
          show: can('organizations') && can('opportunities'),
        },
        {
          to: '/clients',
          label: regie ? 'Annonceurs et contacts' : 'Clients et contacts',
          icon: <Building2 />,
          show: can('organizations'),
        },
        { to: '/opportunites', label: 'Opportunités', icon: <Kanban />, show: can('opportunities') },
        {
          to: me?.data_scope === 'own' || !can('quotes') ? '/pipeline' : '/pipeline-commerciaux',
          label: me?.data_scope === 'own' ? 'Mon pipeline' : 'Pipeline des commerciaux',
          icon: <Filter />,
          show: can('opportunities'),
        },
        { to: '/activites', label: 'Activités et agenda', icon: <CalendarCheck />, show: can('activities') },
        { to: '/devis', label: 'Devis et proformas', icon: <FileText />, show: can('quotes') },
        {
          to: '/performance',
          label: 'Objectifs et commissions',
          icon: <Trophy />,
          show:
            can('opportunities') &&
            can('quotes') &&
            ['commercial', 'regie', 'direction'].includes(me?.department_code ?? ''),
        },
        {
          to: '/clients/classement',
          label: 'Classement des clients',
          icon: <Layers />,
          show: can('organizations') && can('opportunities'),
        },
      ],
    },
    {
      label: 'Régie publicitaire et médias',
      items: [
        { to: '/supports', label: 'Supports et espaces', icon: <MapIcon />, show: can('supports') },
        { to: '/planning', label: 'Planning des faces', icon: <CalendarRange />, show: can('supports') },
        { to: '/campagnes', label: 'Campagnes', icon: <Megaphone />, show: can('campaigns') },
        { to: '/maintenance', label: 'Maintenance', icon: <Wrench />, show: can('interventions') },
        { to: '/redevances', label: 'Redevances et dossiers', icon: <Landmark />, show: can('royalties') },
        {
          to: '/regie/collectivites',
          label: 'Collectivités',
          icon: <Building />,
          show: can('collectivities'),
        },
        { to: '/projets', label: 'Projets', icon: <FolderKanban />, show: can('projects') && regie },
        {
          to: '/regie/deploiements',
          label: 'Déploiements',
          icon: <MapPinned />,
          show: can('projects') && (regie || !!me?.cross_department),
        },
        {
          to: '/reclamations',
          label: 'Réclamations',
          icon: <MessageSquareWarning />,
          show: can('complaints'),
        },
      ],
    },
    {
      label: 'Contrats et administratif',
      items: [
        { to: '/contrats', label: 'Contrats', icon: <FileSignature />, show: can('contracts') },
        { to: '/appels-offres', label: 'Appels d’offres', icon: <Gavel />, show: can('contracts') },      ],
    },
    {
      label: 'Production et stocks',
      items: [
        { to: '/stocks', label: 'Stocks et matières', icon: <Boxes />, show: can('stocks') },
        {
          to: '/stocks/inventaire',
          label: 'Inventaire physique',
          icon: <ClipboardCheck />,
          show: can('stocks'),
        },
        { to: '/ordres-production', label: 'Production', icon: <Factory />, show: can('production') },
      ],
    },
    {
      label: 'Ressources humaines',
      items: [
        {
          to: '/effectif',
          label:
            me?.perms?.hr?.includes('view') || me?.cross_department
              ? 'Ressources humaines'
              : 'Mon équipe (RH)',
          icon: <Contact />,
          show: can('hr'),
        },
        {
          to: '/mon-equipe/acces',
          label: 'Accès de mon équipe',
          icon: <UserPlus />,
          show: me?.data_scope === 'department' && !me?.is_admin,
        },
      ],
    },
    {
      label: 'Finance',
      items: [
        {
          to: '/ecritures',
          label: 'Comptabilité générale',
          icon: <BookOpenCheck />,
          show: can('accounting'),
        },
        { to: '/factures', label: 'Factures et encaissements', icon: <Wallet />, show: can('finance') },
        {
          to: '/creances-echues',
          label: 'Créances échues',
          icon: <AlertTriangle />,
          show: can('finance'),
        },
        {
          to: '/commissions/paiements',
          label: 'Paiements des commissions',
          icon: <Trophy />,
          show: can('finance'),
        },
      ],
    },
    {
      label: 'ERP / Trésorerie',
      items: [
        {
          to: '/comptes-tresorerie',
          label: 'Comptes de trésorerie',
          icon: <Wallet />,
          show: can('treasury'),
        },
        { to: '/mouvements-caisse', label: 'Entrées et sorties', icon: <Wallet />, show: can('treasury') },
        { to: '/demandes-fonds', label: 'Demandes de fonds', icon: <Wallet />, show: can('treasury') },
        {
          to: '/depenses-recurrentes',
          label: 'Dépenses récurrentes',
          icon: <Wallet />,
          show: can('treasury'),
        },
        {
          to: '/validations-financieres',
          label: 'Validations financières',
          icon: <ShieldCheck />,
          show: can('finance'),
        },
        { to: '/plan-comptable', label: 'Plan comptable', icon: <BookOpenCheck />, show: can('accounting') },
        { to: '/ecritures', label: 'Écritures comptables', icon: <BookOpenCheck />, show: can('accounting') },
        {
          to: '/balance-comptable',
          label: 'Balance et grand livre',
          icon: <BookOpenCheck />,
          show: can('accounting'),
        },
        { to: '/fne', label: 'Connecteur FNE', icon: <ShieldCheck />, show: can('fne') },
      ],
    },
    {
      label: 'ERP / Ressources humaines',
      items: [
        { to: '/effectif', label: 'Effectif et contrats', icon: <Contact />, show: can('hr') },
        { to: '/presences', label: 'Présences', icon: <Fingerprint />, show: can('hr') },
        { to: '/conges', label: 'Congés et validations', icon: <CalendarDays />, show: can('hr') },
        { to: '/paie', label: 'Préparation de la paie', icon: <Wallet />, show: can('payroll') },
      ],
    },
    {
      label: 'ERP / Flotte',
      items: [
        { to: '/vehicules', label: 'Parc de véhicules', icon: <MapPinned />, show: can('fleet') },
        { to: '/chauffeurs', label: 'Chauffeurs', icon: <Contact />, show: can('fleet') },
        {
          to: '/missions-vehicules',
          label: 'Missions des véhicules',
          icon: <MapPinned />,
          show: can('fleet'),
        },
      ],
    },
    {
      label: 'ERP / Production et régie',
      items: [
        { to: '/nomenclatures', label: 'Nomenclatures', icon: <ClipboardList />, show: can('production') },
        {
          to: '/ordres-production',
          label: 'Ordres de production',
          icon: <Factory />,
          show: can('production'),
        },
        {
          to: '/reservations',
          label: 'Réservations des supports',
          icon: <CalendarRange />,
          show: can('campaigns'),
        },
        {
          to: '/taxes-communales',
          label: 'Paramètres communaux',
          icon: <Landmark />,
          show: can('campaigns'),
        },
        { to: '/catalogue', label: 'Catalogue et tarifs', icon: <FileText />, show: can('catalog') },
      ],
    },
    {
      label: 'Administration V2',
      items: [
        { to: '/admin/commissions', label: 'Taux de commission', icon: <Settings />, show: !!me?.is_superadmin },
        {
          to: '/referentiels-clients',
          label: 'Référentiels clients',
          icon: <Settings />,
          show: can('admin'),
        },
        { to: '/utilisateurs', label: 'Utilisateurs', icon: <UserPlus />, show: can('admin') },
        { to: '/services', label: 'Services', icon: <Building />, show: can('admin') },
        { to: '/audit', label: 'Journal d’audit', icon: <ShieldCheck />, show: can('admin') },
        { to: '/modules', label: 'Modules et avancement', icon: <Layers />, show: true },
      ],
    },
    {
      label: 'Intelligence',
      items: [{ to: '/assistant', label: 'Assistant IA', icon: <Sparkles />, show: false }],
    },
    {
      label: 'Administration',
      items: [
        {
          to: '/gouvernance/audits',
          label: 'Audits de gouvernance',
          icon: <ClipboardCheck />,
          show:
            ['direction_generale', 'auditeur'].includes(me?.role_code ?? '') &&
            can('tasks') &&
            can('quotes') &&
            can('opportunities') &&
            can('finance') &&
            can('organizations') &&
            can('stocks') &&
            me?.data_scope === 'all',
        },
        {
          to: '/securite',
          label: 'Sécurité',
          icon: <ShieldAlert />,
          show: !!me?.is_admin,
        },
        {
          to: '/securite/archives',
          label: 'Archives de connexion',
          icon: <ShieldCheck />,
          show: !!me?.is_admin,
        },
        {
          to: '/utilisateurs',
          label: 'Administration',
          icon: <Settings />,
          show: can('admin') || ['direction_generale', 'direction_commerciale'].includes(me?.role_code ?? ''),
        },
      ],
    },
  ];
  const renderedLinks = new Set<string>();

  return (
    <div className="app">
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
      <aside
        className={`sidebar${menuOpen ? ' open' : ''}`}
        aria-label="Navigation principale"
        style={me?.department_color ? { ['--dept' as any]: me.department_color } : undefined}
      >
        <div className="brand">
          <Logo />
          <div>
            <div className="brand-name">COM&amp;SIG</div>
            <div className="brand-sub">CRM intégré</div>
          </div>
        </div>
        {me?.department_label && (
          <div className="sidebar-dept">
            <span className="dept-dot" aria-hidden />
            {me.department_label}
          </div>
        )}
        <nav
          onClick={(event) => {
            if ((event.target as Element).closest('a')) setMenuOpen(false);
          }}
        >
          {groups.map((g) => {
            const items = g.items.filter((i) => {
              if (!i.show || renderedLinks.has(i.to)) return false;
              renderedLinks.add(i.to);
              return true;
            });
            if (!items.length) return null;
            return <NavGroup key={g.label} label={g.label} items={items} userId={me?.id} />;
          })}
        </nav>
        <div className="sidebar-foot">
          <div>Version 0.1 · {new Date().getFullYear()}</div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <Button
            className="menu-btn"
            variant="ghost"
            iconOnly
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen(true)}
            icon={<Menu />}
          />
          <button
            className="search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label="Recherche globale (Ctrl+K)"
          >
            <Search size={16} />
            <span className="truncate">Rechercher un client, une opportunité, un support…</span>
            <span className="kbd hide-mobile">Ctrl K</span>
          </button>
          <div className="spacer" />

          {ready && <Notifications />}
          <div style={{ position: 'relative' }} ref={userRef}>
            <button
              className="btn btn-ghost"
              style={{ height: 38, paddingLeft: 6 }}
              onClick={() => setUserOpen((x) => !x)}
              aria-haspopup="menu"
              aria-expanded={userOpen}
              aria-label="Menu utilisateur"
            >
              <Avatar name={me?.full_name} size="sm" />
              <span className="hide-mobile" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <span className="small strong" style={{ display: 'block' }}>
                  {me?.full_name}
                </span>
                <span className="xsmall muted">{me?.role_label}</span>
              </span>
            </button>
            {userOpen && (
              <div className="popover" role="menu" style={{ right: 0, top: 44 }}>
                {logoutError && <Alert tone="danger">{logoutError}</Alert>}
                <button
                  className="menu-item"
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    nav('/profil');
                  }}
                >
                  <UserRound />
                  Mon profil et sécurité
                </button>
                <button
                  className="menu-item"
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    nav('/profil#mot-de-passe');
                  }}
                >
                  <KeyRound />
                  Changer de mot de passe
                </button>
                <hr className="divider" style={{ margin: '4px 0' }} />
                <div className="xsmall muted" style={{ padding: '4px 10px' }}>
                  Apparence
                </div>
                <div className="row" style={{ padding: '2px 6px 6px' }}>
                  {[
                    ['light', 'Clair', <Sun key="s" size={14} />],
                    ['dark', 'Sombre', <Moon key="m" size={14} />],
                    ['system', 'Système', <Monitor key="y" size={14} />],
                  ].map(([v, l, ic]) => (
                    <button
                      key={v as string}
                      className="btn btn-sm"
                      aria-pressed={theme === v}
                      style={
                        theme === v
                          ? { borderColor: 'var(--primary)', color: 'var(--primary-ink)' }
                          : undefined
                      }
                      onClick={() => setTheme(v as string)}
                    >
                      {ic}
                      {l}
                    </button>
                  ))}
                </div>
                <hr className="divider" style={{ margin: '4px 0' }} />
                <button
                  className="menu-item"
                  role="menuitem"
                  disabled={loggingOut}
                  onClick={async () => {
                    if (loggingOut) return;
                    setLoggingOut(true);
                    setLogoutError(null);
                    try {
                      await logout();
                      // A full local navigation avoids the protected-route redirect racing
                      // the intentional return to the public department portal.
                      window.location.replace(
                        new URL(import.meta.env.BASE_URL + 'portail', window.location.origin).href,
                      );
                    } catch (e) {
                      setLogoutError(e instanceof Error ? e.message : 'Déconnexion impossible. Réessayez.');
                      setLoggingOut(false);
                    }
                  }}
                >
                  <LogOut />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </header>
        <main id="contenu" className="content crm-content" tabIndex={-1}>
          {me?.must_change_password && (
            <div className="alert alert-warning" role="status">
              <KeyRound />
              <div>
                Votre mot de passe est provisoire.{' '}
                <a
                  href="/profil#mot-de-passe"
                  onClick={(e) => {
                    e.preventDefault();
                    nav('/profil#mot-de-passe');
                  }}
                >
                  Définissez votre mot de passe personnel
                </a>
                .
              </div>
            </div>
          )}

          <Outlet />
        </main>
      </div>

      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

/** Menu de département en signet : les sous-menus sont regroupés et se déploient au clic ; le signet de la page courante
 *  s'ouvre de lui-même ; l'état ouvert/fermé est mémorisé par utilisateur (préférence locale, sans effet si indisponible). */
function NavGroup({ label, items, userId }: { label: string; items: NavItem[]; userId?: string }) {
  const loc = useLocation();
  const key = `comsig.v2.nav.${userId ?? 'anon'}.${label}`;
  const activeHere = items.some((i) =>
    i.end
      ? loc.pathname === i.to
      : i.to === '/'
        ? loc.pathname === '/'
        : loc.pathname === i.to || loc.pathname.startsWith(i.to + '/'),
  );
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(key);
      if (v !== null) return v === '1';
    } catch {
      /* stockage indisponible */
    }
    return activeHere;
  });
  useEffect(() => {
    if (activeHere) setOpen(true);
  }, [activeHere]);
  const toggle = () =>
    setOpen((o) => {
      try {
        localStorage.setItem(key, o ? '0' : '1');
      } catch {
        /* ignoré */
      }
      return !o;
    });
  const id = `nav-${label
    .normalize('NFD')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .toLowerCase()}`;
  const total = items.reduce((n, i) => n + (i.count ?? 0), 0);
  return (
    <div className={`nav-group nav-signet${open ? ' open' : ''}${activeHere ? ' current' : ''}`}>
      <button
        type="button"
        className="nav-signet-head"
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
      >
        <span className="nav-signet-mark" aria-hidden />
        <span className="nav-signet-label">{label}</span>
        {!open && total > 0 && (
          <span className="nav-count" aria-label={`${total} en attente`}>
            {total}
          </span>
        )}
        <span className="nav-signet-n" aria-hidden>
          {items.length}
        </span>
        <ChevronDown className="nav-signet-chev" aria-hidden />
      </button>
      <div id={id} className="nav-signet-body" hidden={!open}>
        {items.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            end={i.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {i.icon}
            <span>{i.label}</span>
            {i.count ? (
              <span className="nav-count" aria-label={`${i.count} en attente`}>
                {i.count}
              </span>
            ) : null}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
