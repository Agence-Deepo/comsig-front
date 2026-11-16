# P01 — Preuves détaillées de l’inventaire statique

Généré le 2026-11-04T11:22:06.977Z.

Les contrôles sont extraits sans exécuter React. Les expressions dynamiques et les noms de fonctions sont conservés ; ils sont des points à recetter, pas des valeurs utilisateur. Le propriétaire indique la fonction englobante, ce qui sépare les écrans exportés d’un même fichier. Les dépendances locales importées sont explicites ; leurs appels ne sont pas attribués automatiquement à tous les écrans. Les objets de libellés incluent onglets, colonnes, filtres et options : ne pas les compter tous comme champs de saisie.

## Accounting.tsx — CRM-014

Source : [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [yearStart](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:12), [Accounting (export)](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:15), [EntryModal](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:54), [Balance](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:77), [Ledger](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:95), [ManualEntry](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:111).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Accounting | ``/api/accounting/entries${status ? `?status=${status}` : ''}`` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:21) |
| Accounting | ``/api/xlsx/accounting/journal${status ? `?status=${status}` : ''}`` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:25) |
| EntryModal | ``/api/accounting/entries/${id}`` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:56) |
| EntryModal | `api.post(`/api/accounting/entries/${id}/validate`)` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:57) |
| EntryModal | ``/api/accounting/entries/${id}/validate`` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:57) |
| Balance | ``/api/accounting/balance?from=${from}&to=${to}${prov ? '&provisoires=1' : ''}`` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:81) |
| Balance | ``/api/xlsx/accounting/balance?from=${from}&to=${to}${prov ? '&provisoires=1' : ''}`` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:83) |
| Ledger | `'/api/accounting/accounts'` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:96) |
| Ledger | ``/api/accounting/ledger/${acc}?from=${yearStart()}&to=${today()}`` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:98) |
| Ledger | ``/api/xlsx/accounting/ledger/${acc}?from=${yearStart()}&to=${today()}`` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:100) |
| ManualEntry | `'/api/accounting/accounts'` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:112) |
| ManualEntry | `api.post('/api/accounting/entries')` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:114) |
| ManualEntry | `'/api/accounting/entries'` | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:114) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Accounting | ExcelButton | label=Journal Excel ; url=`/api/xlsx/accounting/journal${status ? `?status=${status}` : ''}` |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:25) |
| Accounting | Button | onClick=() => setManual(true) | Écriture manuelle | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:25) |
| Accounting | Tabs | value=tab ; onChange=setTab ; tabs=[{ id: 'ecritures', label: <><BookOpen aria-hidden /> Journal</> }, { id: 'balance', label: <><Scale aria-hidden /> Balance</> }, { id: 'grand-livre', label: 'Grand livre' }] |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:31) |
| Accounting | Segmented | label=Statut ; value=status ; onChange=setStatus ; options=[{ id: 'provisoire', label: 'À contrôler' }, { id: 'valide', label: 'Validées' }, { id: 'contrepassee', label: 'Contre-passées' }, { id: '', label: 'Toutes' }] |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:33) |
| Accounting | DataTable | columns=[                 { key: 'n', label: 'Écriture', render: (e: any) => <><div className="cell-title">{e.label}</div><div className="cell-sub">{e.number} · {JOURNAL[e.journal]}{e.created_by ? ` · saisie par ${e.created_by_name}` : ' · automatique'}</div></> },                 { key: 'd', label: 'Date', render: (e: any) => <span className="small">{date(e.entry_date)}</span> },                 { key: 'm', label: 'Montant', num: true, render: (e: any) => money(e.total_debit) },                 { key: 's', label: 'Statut', render: (e: any) => <Badge tone={ST[e.status][1]}>{ST[e.status][0]}</Badge> },               ] |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:36) |
| EntryModal | Modal | title=e ? `${e.number} — ${JOURNAL[e.journal]}` : 'Écriture' |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:60) |
| EntryModal | Button | onClick=onClose | Fermer | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:61) |
| EntryModal | Button | onClick=() => v.run(undefined) | Valider l’écriture | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:61) |
| EntryModal | DataTable | columns=[           { key: 'a', label: 'Compte', render: (l: any) => <><strong>{l.account_code}</strong> <span className="small muted">{l.account_label}</span></> },           { key: 'l', label: 'Libellé', render: (l: any) => <span className="small">{l.label}</span> },           { key: 'd', label: 'Débit', num: true, render: (l: any) => (l.debit ? money(l.debit) : '') },           { key: 'c', label: 'Crédit', num: true, render: (l: any) => (l.credit ? money(l.credit) : '') },         ] |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:64) |
| Balance | ExcelButton | url=`/api/xlsx/accounting/balance?from=${from}&to=${to}${prov ? '&provisoires=1' : ''}` |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:83) |
| Balance | Input | type=date ; value=from ; onChange=(e) => setFrom(e.target.value) ; aria-label=Du |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:83) |
| Balance | Input | type=date ; value=to ; onChange=(e) => setTo(e.target.value) ; aria-label=Au |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:83) |
| Balance | label |  | <input type="checkbox" checked={prov} onChange={(e) => setProv(e.target.checked)} /> Inclure les écritures à contrôler | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:83) |
| Balance | input | type=checkbox ; onChange=(e) => setProv(e.target.checked) |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:83) |
| Balance | DataTable | columns=[         { key: 'c', label: 'Compte', render: (x: any) => <><strong>{x.code}</strong> <span className="small">{x.label}</span></> },         { key: 'd', label: 'Débit', num: true, render: (x: any) => money(x.debit) },         { key: 'k', label: 'Crédit', num: true, render: (x: any) => money(x.credit) },         { key: 's', label: 'Solde', num: true, render: (x: any) => <span className={x.balance < 0 ? 'strong' : ''}>{money(Math.abs(x.balance))} {x.balance > 0 ? 'D' : x.balance < 0 ? 'C' : ''}</span> },       ] |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:84) |
| Ledger | ExcelButton | url=`/api/xlsx/accounting/ledger/${acc}?from=${yearStart()}&to=${today()}` |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:100) |
| Ledger | Select | value=acc ; onChange=(e) => setAcc(e.target.value) ; options=(accounts.data?.rows ?? []).map((a: any) => ({ value: a.code, label: `${a.code} — ${a.label}` })) ; aria-label=Compte |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:100) |
| Ledger | DataTable | columns=[         { key: 'd', label: 'Date', render: (x: any) => date(x.entry_date) }, { key: 'n', label: 'Écriture', render: (x: any) => <span className="small">{x.number} · {x.label}</span> },         { key: 's', label: 'Statut', render: (x: any) => <Badge tone={ST[x.status][1]}>{ST[x.status][0]}</Badge> },         { key: 'db', label: 'Débit', num: true, render: (x: any) => (x.debit ? money(x.debit) : '') }, { key: 'cr', label: 'Crédit', num: true, render: (x: any) => (x.credit ? money(x.credit) : '') },         { key: 'r', label: 'Solde cumulé', num: true, render: (x: any) => money(x.running) },       ] |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:101) |
| ManualEntry | Modal | title=Écriture manuelle |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:118) |
| ManualEntry | Button | onClick=onClose | Annuler | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:119) |
| ManualEntry | Button | onClick=() => save.run({ ...f, lines: f.lines.filter((l: any) => l.account_code).map((l: any) => ({ account_code: l.account_code, debit: Number(l.debit) \|\| 0, credit: Number(l.credit) \|\| 0 })) }) | Enregistrer | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:119) |
| ManualEntry | Field | label=Journal |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:122) |
| ManualEntry | Select | value=f.journal ; onChange=(e) => setF({ ...f, journal: e.target.value }) ; options=Object.entries(JOURNAL).map(([value, label]) => ({ value, label })) |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:122) |
| ManualEntry | Field | label=Date |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:123) |
| ManualEntry | Input | type=date ; value=f.entry_date ; onChange=(e) => setF({ ...f, entry_date: e.target.value }) |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:123) |
| ManualEntry | Field | label=Libellé ; required=true |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:124) |
| ManualEntry | Input | value=f.label ; onChange=(e) => setF({ ...f, label: e.target.value }) |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:124) |
| ManualEntry | Select | placeholder=Compte… ; value=l.account_code ; onChange=(e) => setF({ ...f, lines: f.lines.map((x: any, j: number) => (j === i ? { ...x, account_code: e.target.value } : x)) }) ; options=opts ; aria-label=Compte |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:129) |
| ManualEntry | Input | type=number ; placeholder=Débit ; value=l.debit ; onChange=(e) => setF({ ...f, lines: f.lines.map((x: any, j: number) => (j === i ? { ...x, debit: e.target.value, credit: '' } : x)) }) ; aria-label=Débit |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:130) |
| ManualEntry | Input | type=number ; placeholder=Crédit ; value=l.credit ; onChange=(e) => setF({ ...f, lines: f.lines.map((x: any, j: number) => (j === i ? { ...x, credit: e.target.value, debit: '' } : x)) }) ; aria-label=Crédit |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:131) |
| ManualEntry | Button | onClick=() => setF({ ...f, lines: f.lines.filter((_: any, j: number) => j !== i) }) ; aria-label=Retirer |  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:132) |
| ManualEntry | Button | onClick=() => setF({ ...f, lines: [...f.lines, { account_code: '', debit: '', credit: '' }] }) | Ligne | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:135) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Accounting | id = ecritures | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:31) |
| Accounting | id = balance | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:31) |
| Accounting | id = grand-livre | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:31) |
| Accounting | label = Grand livre | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:31) |
| Accounting | id = provisoire | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:33) |
| Accounting | label = À contrôler | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:33) |
| Accounting | id = valide | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:33) |
| Accounting | label = Validées | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:33) |
| Accounting | id = contrepassee | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:33) |
| Accounting | label = Contre-passées | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:33) |
| Accounting | id =  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:33) |
| Accounting | label = Toutes | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:33) |
| Accounting | key = n | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:38) |
| Accounting | label = Écriture | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:38) |
| Accounting | key = d | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:39) |
| Accounting | label = Date | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:39) |
| Accounting | key = m | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:40) |
| Accounting | label = Montant | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:40) |
| Accounting | key = s | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:41) |
| Accounting | label = Statut | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:41) |
| EntryModal | key = a | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:65) |
| EntryModal | label = Compte | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:65) |
| EntryModal | key = l | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:66) |
| EntryModal | label = Libellé | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:66) |
| EntryModal | key = d | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:67) |
| EntryModal | label = Débit | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:67) |
| EntryModal | key = c | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:68) |
| EntryModal | label = Crédit | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:68) |
| Balance | key = c | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:85) |
| Balance | label = Compte | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:85) |
| Balance | key = d | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:86) |
| Balance | label = Débit | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:86) |
| Balance | key = k | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:87) |
| Balance | label = Crédit | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:87) |
| Balance | key = s | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:88) |
| Balance | label = Solde | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:88) |
| Ledger | key = d | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:102) |
| Ledger | label = Date | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:102) |
| Ledger | key = n | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:102) |
| Ledger | label = Écriture | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:102) |
| Ledger | key = s | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:103) |
| Ledger | label = Statut | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:103) |
| Ledger | key = db | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:104) |
| Ledger | label = Débit | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:104) |
| Ledger | key = cr | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:104) |
| Ledger | label = Crédit | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:104) |
| Ledger | key = r | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:105) |
| Ledger | label = Solde cumulé | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:105) |
| ManualEntry | label =  | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:113) |
| Accounting | useCan() | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:16) |
| Accounting | can('accounting', 'export') | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:25) |
| Accounting | can('accounting', 'create') | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:25) |
| EntryModal | useCan() | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:55) |
| EntryModal | can('accounting', 'validate') | [Accounting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Accounting.tsx:61) |

## Activities.tsx — CRM-002

Source : [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [startOfWeek](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:13), [Activities (export)](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:15), [set](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:20), [finish](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:35).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/forms`, `./OrganizationDetail`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Activities | ``/api/activities${qs(params)}`` | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:30) |
| Activities | `api.patch(`/api/activities/${a.id}`)` | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:31) |
| Activities | ``/api/activities/${a.id}`` | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:31) |
| Activities | `api.del(`/api/activities/${a.id}`)` | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:32) |
| Activities | ``/api/activities/${a.id}`` | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:32) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Activities | Segmented | label=Affichage ; value=view ; onChange=(v) => set({ view: v === 'list' ? '' : v, period: '' }) ; options=[{ id: 'list', label: 'Liste', icon: <List /> }, { id: 'week', label: 'Semaine', icon: <CalendarDays /> }] |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:41) |
| Activities | Button | onClick=() => setCreate(true) | Nouvelle activité | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:42) |
| Activities | Segmented | label=Période ; value=period ; onChange=(v) => set({ period: v }) ; options=[{ id: 'retard', label: 'En retard' }, { id: 'aujourdhui', label: 'Aujourd’hui' }, { id: 'semaine', label: '7 jours' }, { id: 'a_venir', label: 'À venir' }, { id: 'toutes', label: 'Toutes' }] |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | Button | onClick=() => setWeekStart(new Date(weekStart.getTime() - 7 * 86400000)) ; aria-label=Semaine précédente |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:46) |
| Activities | Button | onClick=() => setWeekStart(new Date(weekStart.getTime() + 7 * 86400000)) ; aria-label=Semaine suivante |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:48) |
| Activities | Button | onClick=() => setWeekStart(startOfWeek(new Date())) | Aujourd’hui | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:49) |
| Activities | Select | value=scope ; onChange=(e) => set({ scope: e.target.value }) ; options=[{ value: 'mine', label: 'Mes activités' }, { value: 'team', label: 'Mon équipe' }, { value: 'all', label: 'Toute l’entreprise' }] ; aria-label=Périmètre |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:50) |
| Activities | Select | placeholder=Tous types ; value=sp.get('kind') ?? '' ; onChange=(e) => set({ kind: e.target.value }) ; options=Object.entries(ACTIVITY_KIND).map(([value, label]) => ({ value, label })) ; aria-label=Type |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:51) |
| Activities | Select | value=sp.get('status') ?? 'ouvertes' ; onChange=(e) => set({ status: e.target.value }) ; options=[{ value: 'ouvertes', label: 'Ouvertes' }, { value: 'terminees', label: 'Terminées' }, { value: 'toutes', label: 'Toutes' }] ; aria-label=Statut |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:52) |
| Activities | DataTable | columns=[               { key: 'k', label: '', width: 44, render: (a: any) => <span className="icon-chip" aria-label={ACTIVITY_KIND[a.kind]}>{KIND_ICON[a.kind]}</span>, mobile: 'hide' },               { key: 's', label: 'Activité', render: (a: any) => <><div className="cell-title">{a.subject}</div><div className="cell-sub">{ACTIVITY_KIND[a.kind]}{a.organization_name && <> · <Link to={a.opportunity_id ? `/opportunites/${a.opportunity_id}` : `/organisations/${a.organization_id}`}>{a.opportunity_ref ? `${a.opportunity_ref} — ` : ''}{a.organization_name}</Link></>}{a.auto_rule ? ' · automatique' : ''}</div></> },               { key: 'd', label: 'Échéance', render: (a: any) => <span className="small nowrap" style={a.is_overdue ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{a.status === 'termine' ? `Fait ${dateTime(a.done_at)}` : a.due_at ? <>{dateTime(a.due_at)}<div className="xsmall muted">{relative(a.due_at)}</div></> : '—'}</span> },               { key: 'p', label: 'Priorité', render: (a: any) => <Status kind="priority" code={a.priority} />, mobile: 'hide' },               { key: 'st', label: 'Statut', render: (a: any) => <Status kind="activity" code={a.status} /> },               { key: 'w', label: 'Assigné', render: (a: any) => <span className="small">{a.assigned_name}</span>, mobile: 'hide' },               { key: 'x', label: <span className="sr-only">Actions</span>, render: (a: any) => (                 <div className="row" style={{ justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>                   {a.status !== 'termine' && a.status !== 'annule' && can('activities', 'update') && <Button size="sm" icon={<Check />} onClick={() => finish(a)}>Terminer</Button>}                   {can('activities', 'update') && <Button size="sm" variant="ghost" iconOnly aria-label="Modifier" icon={<Edit3 />} onClick={() => setEdit(a)} />}                   {can('activities', 'delete') && <Button size="sm" variant="ghost" iconOnly aria-label="Supprimer" icon={<Trash2 />} onClick={() => setDel(a)} />}                 </div>) },             ] |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:56) |
| Activities | Link | to=a.opportunity_id ? `/opportunites/${a.opportunity_id}` : `/organisations/${a.organization_id}` | {a.opportunity_ref ? `${a.opportunity_ref} — ` : ''} {a.organization_name} | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:60) |
| Activities | div | onClick=(e) => e.stopPropagation() |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:66) |
| Activities | Button | onClick=() => finish(a) | Terminer | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:67) |
| Activities | Button | onClick=() => setEdit(a) ; aria-label=Modifier |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:68) |
| Activities | Button | onClick=() => setDel(a) ; aria-label=Supprimer |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:69) |
| Activities | button | onClick=() => setEdit(a) | <span className="xsmall muted">{new Date(a.due_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {ACTIVITY_KIND[a.kind]}</span> <span className="title" style={{ textDecoration: a.status === 'termine' ? 'line-through' : undefined }}>{a.subject}</span> {a.organization_name && <span className="xsmall secondary truncate">{a.organization_name}</span>} {a.priority === 'haute' \|\| a.priority === 'critique' ? <Badge tone="warning">{a.priority}</Badge> : null} | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:88) |
| Activities | ConfirmModal | title=Supprimer cette activité ? |  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:105) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Activities | id = list | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:41) |
| Activities | label = Liste | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:41) |
| Activities | id = week | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:41) |
| Activities | label = Semaine | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:41) |
| Activities | id = retard | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | label = En retard | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | id = aujourdhui | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | label = Aujourd’hui | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | id = semaine | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | label = 7 jours | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | id = a_venir | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | label = À venir | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | id = toutes | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | label = Toutes | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:45) |
| Activities | label = Mes activités | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:50) |
| Activities | label = Mon équipe | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:50) |
| Activities | label = Toute l’entreprise | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:50) |
| Activities | label = Ouvertes | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:52) |
| Activities | label = Terminées | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:52) |
| Activities | label = Toutes | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:52) |
| Activities | key = k | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:59) |
| Activities | label =  | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:59) |
| Activities | key = s | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:60) |
| Activities | label = Activité | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:60) |
| Activities | key = d | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:61) |
| Activities | label = Échéance | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:61) |
| Activities | key = p | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:62) |
| Activities | label = Priorité | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:62) |
| Activities | key = st | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:63) |
| Activities | label = Statut | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:63) |
| Activities | key = w | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:64) |
| Activities | label = Assigné | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:64) |
| Activities | key = x | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:65) |
| Activities | useCan() | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:17) |
| Activities | can('activities', 'create') | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:42) |
| Activities | can('activities', 'update') | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:67) |
| Activities | can('activities', 'update') | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:68) |
| Activities | can('activities', 'delete') | [Activities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Activities.tsx:69) |

## Admin.tsx — CRM-003, CRM-004

Source : [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Admin (export)](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:19), [TempPassword](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:77), [UsersAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:90), [locked](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:120), [TeamsAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:179), [RolesAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:204), [toggle](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:212), [PortalAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:245), [DepartmentsAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:297), [SettingValue](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:354), [SettingsAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:377), [StagesAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:407), [CatalogAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:436), [LookupsAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:472), [AutomationsAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:503), [TargetsAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:525), [ImportsAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:558), [AiSupervision](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:625), [s](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:633), [AuditAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:688), [TrashAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:729), [SessionsAdmin](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:744), [LetterheadCard](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:759).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../demo/demo`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/charts`, `../components/PortalTile`, `../components/ModelTiles`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| UsersAdmin | ``/api/admin/users${deleted ? '?deleted=true' : ''}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:93) |
| UsersAdmin | `'/api/admin/roles'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:94) |
| UsersAdmin | `'/api/admin/teams'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:95) |
| UsersAdmin | `'/api/admin/departments'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:96) |
| UsersAdmin | `api.patch(`/api/admin/users/${b.id}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:103) |
| UsersAdmin | ``/api/admin/users/${b.id}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:103) |
| UsersAdmin | `api.post('/api/admin/users')` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:103) |
| UsersAdmin | `'/api/admin/users'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:103) |
| UsersAdmin | `api.post('/api/admin/service-accounts')` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:107) |
| UsersAdmin | `'/api/admin/service-accounts'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:107) |
| UsersAdmin | `api.del(`/api/admin/users/${id}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:111) |
| UsersAdmin | ``/api/admin/users/${id}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:111) |
| UsersAdmin | `api.post(`/api/admin/users/${v.id}/reset`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:112) |
| UsersAdmin | ``/api/admin/users/${v.id}/reset`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:112) |
| TeamsAdmin | `'/api/admin/teams'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:181) |
| TeamsAdmin | `api.patch(`/api/admin/teams/${b.id}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:183) |
| TeamsAdmin | ``/api/admin/teams/${b.id}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:183) |
| TeamsAdmin | `api.post('/api/admin/teams')` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:183) |
| TeamsAdmin | `'/api/admin/teams'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:183) |
| RolesAdmin | `'/api/admin/roles'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:205) |
| RolesAdmin | `api.put(`/api/admin/roles/${role.code}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:210) |
| RolesAdmin | ``/api/admin/roles/${role.code}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:210) |
| PortalAdmin | `'/api/admin/portal'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:246) |
| PortalAdmin | `api.patch(`/api/admin/portal/${t.code}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:254) |
| PortalAdmin | ``/api/admin/portal/${t.code}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:254) |
| PortalAdmin | ``/api/admin/portal/${t.code}/photo`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:255) |
| PortalAdmin | `api.del(`/api/admin/portal/${t.code}/photo`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:256) |
| PortalAdmin | ``/api/admin/portal/${t.code}/photo`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:256) |
| DepartmentsAdmin | `'/api/admin/departments'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:299) |
| DepartmentsAdmin | `api.put(`/api/admin/departments/${b.code}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:305) |
| DepartmentsAdmin | ``/api/admin/departments/${b.code}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:305) |
| SettingsAdmin | `'/api/admin/settings'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:378) |
| SettingsAdmin | `api.put(`/api/admin/settings/${x.key}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:379) |
| SettingsAdmin | ``/api/admin/settings/${x.key}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:379) |
| StagesAdmin | `'/api/pipeline/stages'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:408) |
| StagesAdmin | `api.put(`/api/admin/stages/${b.code}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:410) |
| StagesAdmin | ``/api/admin/stages/${b.code}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:410) |
| CatalogAdmin | `'/api/catalog?all=1'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:438) |
| CatalogAdmin | `api.patch(`/api/catalog/${b.id}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:440) |
| CatalogAdmin | ``/api/catalog/${b.id}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:440) |
| CatalogAdmin | `api.post('/api/catalog')` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:440) |
| CatalogAdmin | `'/api/catalog'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:440) |
| LookupsAdmin | `'/api/admin/lookups'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:473) |
| LookupsAdmin | `api.put(`/api/admin/lookups/${cur}/${b.code}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:478) |
| LookupsAdmin | ``/api/admin/lookups/${cur}/${b.code}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:478) |
| AutomationsAdmin | `'/api/admin/automations'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:504) |
| AutomationsAdmin | `api.put(`/api/admin/automations/${x.code}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:505) |
| AutomationsAdmin | ``/api/admin/automations/${x.code}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:505) |
| AutomationsAdmin | `api.post('/api/admin/jobs/run')` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:507) |
| AutomationsAdmin | `'/api/admin/jobs/run'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:507) |
| TargetsAdmin | `'/api/targets'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:528) |
| TargetsAdmin | `api.put('/api/targets')` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:530) |
| TargetsAdmin | `'/api/targets'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:530) |
| ImportsAdmin | `'/api/imports'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:567) |
| ImportsAdmin | `'/api/imports/preview'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:573) |
| ImportsAdmin | `api.post(`/api/imports/${preview.batch_id}/commit`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:575) |
| ImportsAdmin | ``/api/imports/${preview.batch_id}/commit`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:575) |
| AiSupervision | `'/api/ai/usage'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:626) |
| AiSupervision | `'/api/admin/settings'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:627) |
| AiSupervision | `api.put(`/api/admin/settings/${x.key}`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:628) |
| AiSupervision | ``/api/admin/settings/${x.key}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:628) |
| AuditAdmin | ``/api/admin/audit${qs(params)}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:693) |
| AuditAdmin | ``/api/admin/audit${qs({ ...params, page: null, format: 'xlsx' })}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:698) |
| TrashAdmin | `'/api/admin/trash'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:730) |
| TrashAdmin | `api.post(`/api/admin/trash/${x.type}/${x.id}/restore`)` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:731) |
| TrashAdmin | ``/api/admin/trash/${x.type}/${x.id}/restore`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:731) |
| SessionsAdmin | `'/api/admin/sessions'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:745) |
| LetterheadCard | `'/api/admin/letterhead'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:761) |
| LetterheadCard | `'/api/admin/letterhead'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:763) |
| LetterheadCard | `api.del('/api/admin/letterhead')` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:764) |
| LetterheadCard | `'/api/admin/letterhead'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:764) |
| LetterheadCard | ``/api/admin/letterhead/image?v=${v}`` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:770) |
| LetterheadCard | `download('/api/admin/letterhead/template')` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:776) |
| LetterheadCard | `'/api/admin/letterhead/template'` | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:776) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Admin | Navigate | to=`/admin/${sections[0].id}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:46) |
| Admin | NavLink | to=`/admin/${s.id}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:52) |
| TempPassword | Modal | title=Mot de passe temporaire |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:79) |
| TempPassword | Button | onClick=onClose | J’ai transmis le mot de passe | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:80) |
| TempPassword | Button | onClick=() => navigator.clipboard?.writeText(value.password) | Copier | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:83) |
| UsersAdmin | label |  | <input type="checkbox" checked={deleted} onChange={(e) => setDeleted(e.target.checked)} /> Comptes supprimés | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:125) |
| UsersAdmin | input | type=checkbox ; onChange=(e) => setDeleted(e.target.checked) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:125) |
| UsersAdmin | Button | onClick=() => setSvc('') | Compte de service | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:126) |
| UsersAdmin | Button | onClick=() => setEdit({ email: '', username: '', full_name: '', job_title: '', phone: '', role_code: 'commercial', team_id: '', department_code: '', manager_id: '', is_active: true }) | Nouveau compte | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:127) |
| UsersAdmin | DataTable | columns=[             { key: 'n', label: 'Utilisateur', render: (u: any) => <><div className="cell-title">{u.full_name}{!u.is_active && !u.deleted_at && <> <Badge>Désactivé</Badge></>}{u.account_kind === 'service' && <> <Badge tone="info">Compte de service</Badge></>}{u.is_privileged && <> <Badge tone="warning">{u.role_code === 'superadmin' ? 'Super-admin' : 'Admin'}</Badge></>}</div>               <div className="cell-sub"><code>{u.username}</code> · {u.email}{u.job_title ? ` · ${u.job_title}` : ''}</div>               {u.created_via === 'responsable' && <div className="xsmall muted">Accès créé par {u.created_by_name}</div>}</> },             { key: 'r', label: 'Rôle', render: (u: any) => <span className="small">{u.role_label}<div className="xsmall muted">{[u.department_label, u.team_name].filter(Boolean).join(' · ') \|\| 'Sans département'}{u.manager_name ? ` · resp. ${u.manager_name}` : ''}</div></span> },             { key: 'm', label: 'Sécurité', render: (u: any) => <div className="row-wrap">{u.mfa_enabled ? <Badge tone="success">MFA</Badge> : u.mfa_required ? <Badge tone="warning">MFA à activer</Badge> : <Badge>Sans MFA</Badge>}{u.locked_until && new Date(u.locked_until) > new Date() && <Badge tone="danger">Verrouillé</Badge>}{u.must_change_password && <Badge tone="info">Mot de passe temporaire</Badge>}</div>, mobile: 'hide' },             { key: 'l', label: deleted ? 'Supprimé' : 'Dernière connexion', render: (u: any) => <span className="small">{deleted ? date(u.deleted_at) : u.last_login_at ? relative(u.last_login_at) : 'Jamais'}</span>, mobile: 'hide' },             { key: 'a', label: '', render: (u: any) => deleted \|\| locked(u) ? (locked(u) ? <span className="xsmall muted">Super-administrateur requis</span> : null) : <div className="row" style={{ gap: 4 }}>               <Button size="sm" variant="ghost" icon={<KeyRound />} onClick={(e) => { e.stopPropagation(); setReset(u); }}>Accès</Button>               {u.id !== me?.id && <Button size="sm" variant="ghost" icon={<Trash2 />} aria-label={`Supprimer ${u.full_name}`} onClick={(e) => { e.stopPropagation(); setDel(u); }} />}             </div> },           ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:129) |
| UsersAdmin | Button | onClick=(e) => { e.stopPropagation(); setReset(u); } | Accès | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:138) |
| UsersAdmin | Button | onClick=(e) => { e.stopPropagation(); setDel(u); } ; aria-label=`Supprimer ${u.full_name}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:139) |
| UsersAdmin | Modal | title=edit?.id ? `Compte — ${edit.full_name}` : 'Nouveau compte' |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:143) |
| UsersAdmin | Button | onClick=() => setEdit(null) | Annuler | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:144) |
| UsersAdmin | Button | onClick=() => save.run({ id: edit.id, body: { email: edit.email, ...(edit.username ? { username: edit.username } : {}), full_name: edit.full_name, job_title: edit.job_title ?? '', phone: edit.phone \|\| null, role_code: edit.role_code, team_id: edit.team_id \|\| null, department_code: edit.department_code \|\| null, manager_id: edit.manager_id \|\| null, is_active: edit.is_active } }) | Enregistrer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:144) |
| UsersAdmin | Field | label=Nom complet ; required=true |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:146) |
| UsersAdmin | Input | value=edit.full_name ; onChange=(e) => setEdit({ ...edit, full_name: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:146) |
| UsersAdmin | Field | label=Identifiant de connexion |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:147) |
| UsersAdmin | Input | value=edit.username ?? '' ; onChange=(e) => setEdit({ ...edit, username: e.target.value.toLowerCase() }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:147) |
| UsersAdmin | Field | label=E-mail ; required=true |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:148) |
| UsersAdmin | Input | type=email ; value=edit.email ; onChange=(e) => setEdit({ ...edit, email: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:148) |
| UsersAdmin | Field | label=Fonction |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:149) |
| UsersAdmin | Input | value=edit.job_title ?? '' ; onChange=(e) => setEdit({ ...edit, job_title: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:149) |
| UsersAdmin | Field | label=Téléphone |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:150) |
| UsersAdmin | Input | value=edit.phone ; onChange=(e) => setEdit({ ...edit, phone: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:150) |
| UsersAdmin | Field | label=Rôle ; required=true |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:151) |
| UsersAdmin | Select | value=edit.role_code ; onChange=(e) => setEdit({ ...edit, role_code: e.target.value }) ; options=roleOpts |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:151) |
| UsersAdmin | Field | label=Département |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:152) |
| UsersAdmin | Select | placeholder=Aucun ; value=edit.department_code ; onChange=(e) => setEdit({ ...edit, department_code: e.target.value }) ; options=depOpts |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:152) |
| UsersAdmin | Field | label=Responsable hiérarchique |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:153) |
| UsersAdmin | Select | placeholder=Aucun ; value=edit.manager_id ; onChange=(e) => setEdit({ ...edit, manager_id: e.target.value }) ; options=users.filter((u) => u.id !== edit.id).map((u) => ({ value: u.id, label: u.full_name })) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:153) |
| UsersAdmin | Field | label=Équipe |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:154) |
| UsersAdmin | Select | placeholder=Aucune ; value=edit.team_id ; onChange=(e) => setEdit({ ...edit, team_id: e.target.value }) ; options=teamOpts |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:154) |
| UsersAdmin | Field | label=Statut |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:155) |
| UsersAdmin | label |  | <input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> Compte actif | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:155) |
| UsersAdmin | input | type=checkbox ; onChange=(e) => setEdit({ ...edit, is_active: e.target.checked }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:155) |
| UsersAdmin | Modal | title=Compte de service |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:159) |
| UsersAdmin | Button | onClick=() => setSvc(null) | Annuler | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:160) |
| UsersAdmin | Button | onClick=() => createSvc.run(svc!) | Créer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:160) |
| UsersAdmin | Field | label=Service ; required=true |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:161) |
| UsersAdmin | Select | placeholder=Choisir ; value=svc ?? '' ; onChange=(e) => setSvc(e.target.value) ; options=depOpts |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:161) |
| UsersAdmin | ConfirmModal | title=`Supprimer le compte de ${del?.full_name ?? ''}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:164) |
| UsersAdmin | Modal | title=`Accès — ${reset?.full_name}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:166) |
| UsersAdmin | Button | onClick=() => doReset.run({ id: reset.id, email: reset.email, unlock_only: true }) | Déverrouiller le compte (tentatives échouées) | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:168) |
| UsersAdmin | Button | onClick=() => doReset.run({ id: reset.id, email: reset.email }) | Générer un mot de passe temporaire | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:169) |
| UsersAdmin | Button | onClick=() => doReset.run({ id: reset.id, email: reset.email, reset_mfa: true }) | Mot de passe temporaire + réinitialiser la double authentification | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:170) |
| TeamsAdmin | Button | onClick=() => setEdit({ name: '', manager_id: '' }) | Nouvelle équipe | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:185) |
| TeamsAdmin | DataTable | columns=[         { key: 'n', label: 'Équipe', render: (t: any) => <span className="cell-title">{t.name}</span> },         { key: 'm', label: 'Responsable', render: (t: any) => t.manager_name ?? '—' },         { key: 'c', label: 'Membres actifs', num: true, render: (t: any) => t.members },       ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:186) |
| TeamsAdmin | Modal | title=edit?.id ? 'Modifier l’équipe' : 'Nouvelle équipe' |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:191) |
| TeamsAdmin | Button | onClick=() => setEdit(null) | Annuler | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:192) |
| TeamsAdmin | Button | onClick=() => save.run({ id: edit.id, body: { name: edit.name, manager_id: edit.manager_id \|\| null } }) | Enregistrer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:192) |
| TeamsAdmin | Field | label=Nom ; required=true |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:194) |
| TeamsAdmin | Input | value=edit.name ; onChange=(e) => setEdit({ ...edit, name: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:194) |
| TeamsAdmin | Field | label=Responsable |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:195) |
| TeamsAdmin | Select | placeholder=Aucun ; value=edit.manager_id ; onChange=(e) => setEdit({ ...edit, manager_id: e.target.value }) ; options=users.map((u) => ({ value: u.id, label: u.full_name })) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:195) |
| RolesAdmin | Select | value=role.code ; onChange=(e) => setCode(e.target.value) ; options=r.data.roles.map((x: any) => ({ value: x.code, label: x.label })) ; aria-label=Rôle |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:216) |
| RolesAdmin | Button | onClick=() => save.run({ perms: [...draft.perms], data_scope: draft.data_scope, can_see_confidential: draft.can_see_confidential, mfa_required: draft.mfa_required }) | Enregistrer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:217) |
| RolesAdmin | Field | label=Périmètre des données |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:221) |
| RolesAdmin | Select | value=draft.data_scope ; onChange=(e) => setDraft({ ...draft, data_scope: e.target.value }) ; options=[{ value: 'own', label: 'Ses propres dossiers' }, { value: 'team', label: 'Son équipe' }, { value: 'all', label: 'Toute l’entreprise' }] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:221) |
| RolesAdmin | Field | label=Options |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:222) |
| RolesAdmin | label |  | <input type="checkbox" checked={draft.can_see_confidential} onChange={(e) => setDraft({ ...draft, can_see_confidential: e.target.checked })} /> Accès aux informations confidentielles | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:223) |
| RolesAdmin | input | type=checkbox ; onChange=(e) => setDraft({ ...draft, can_see_confidential: e.target.checked }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:223) |
| RolesAdmin | label |  | <input type="checkbox" checked={draft.mfa_required} onChange={(e) => setDraft({ ...draft, mfa_required: e.target.checked })} /> Double authentification obligatoire | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:224) |
| RolesAdmin | input | type=checkbox ; onChange=(e) => setDraft({ ...draft, mfa_required: e.target.checked }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:224) |
| RolesAdmin | input | type=checkbox ; onChange=() => toggle(p) ; aria-label=`${label} — ${ACTION_LABEL[a]}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:233) |
| PortalAdmin | DataTable | columns=[           { key: 'sort_order', label: 'Ordre', num: true, render: (x) => x.sort_order },           { key: 'label', label: 'Tuile', render: (x) => <><strong>{x.label}</strong>{x.caption && <div className="xsmall muted">{x.caption}</div>}</> },           { key: 'target', label: 'Entrée', mobile: 'label', render: (x) => <>{x.department_code ? x.department_label : `Fonction : ${x.roles_label ?? '—'}`}<div className="xsmall muted">{x.members} collaborateur(s)</div></> },           { key: 'state', label: 'État', render: (x) => <>{!x.is_active ? <Badge>Masquée</Badge> : x.members ? <Badge tone="success">Affichée</Badge> : <Badge tone="warning">Sans collaborateur</Badge>}<div className="xsmall muted">{x.photo ? 'Photo déposée' : 'Scène standard'}</div></> },         ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:261) |
| PortalAdmin | Field | label=Nom affiché ; required=true |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:273) |
| PortalAdmin | Input | value=f.label ; onChange=(e) => setF({ ...f, label: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:273) |
| PortalAdmin | Field | label=Ordre d’affichage |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:274) |
| PortalAdmin | Input | type=number ; value=f.sort_order ; onChange=(e) => setF({ ...f, sort_order: Number(e.target.value) }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:274) |
| PortalAdmin | Field | label=Légende |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:275) |
| PortalAdmin | Input | value=f.caption ; onChange=(e) => setF({ ...f, caption: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:275) |
| PortalAdmin | Field | label=Description (écran de connexion) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:276) |
| PortalAdmin | Textarea | value=f.description ; onChange=(e) => setF({ ...f, description: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:276) |
| PortalAdmin | Field | label=Affichage |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:277) |
| PortalAdmin | label |  | <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Afficher cette tuile sur le portail | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:277) |
| PortalAdmin | input | type=checkbox ; onChange=(e) => setF({ ...f, is_active: e.target.checked }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:277) |
| PortalAdmin | Button | onClick=() => save.run({ label: f.label, caption: f.caption, description: f.description, sort_order: f.sort_order, is_active: f.is_active }) | Enregistrer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:280) |
| PortalAdmin | input | type=file ; onChange=(e) => { const file = e.target.files?.[0]; if (file) up.run(file); e.target.value = ''; } |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:281) |
| PortalAdmin | Button | onClick=() => fileRef.current?.click() | Déposer une photo | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:282) |
| PortalAdmin | Button | onClick=() => del.run(undefined) | Revenir à la scène standard | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:283) |
| DepartmentsAdmin | Select | value=dep.code ; onChange=(e) => setCode(e.target.value) ; options=r.data.departments.map((d: any) => ({ value: d.code, label: d.label + (d.is_active ? '' : ' (inactif)') })) ; aria-label=Département |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:312) |
| DepartmentsAdmin | Button | onClick=() => setCreate({ code: '', label: '' }) | Nouveau | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:313) |
| DepartmentsAdmin | Button | onClick=() => save.run({ code: dep.code, body: { label: draft.label, description: draft.description, manager_id: draft.manager_id \|\| null, is_active: draft.is_active, levels: Object.fromEntries(Object.entries(draft.levels).filter(([, v]) => v)) } }) | Enregistrer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:314) |
| DepartmentsAdmin | Field | label=Libellé |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:317) |
| DepartmentsAdmin | Input | value=draft.label ; onChange=(e) => setDraft({ ...draft, label: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:317) |
| DepartmentsAdmin | Field | label=Responsable |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:318) |
| DepartmentsAdmin | Select | placeholder=— ; value=draft.manager_id ; onChange=(e) => setDraft({ ...draft, manager_id: e.target.value }) ; options=users.map((u) => ({ value: u.id, label: u.full_name })) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:318) |
| DepartmentsAdmin | Field | label=Description |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:319) |
| DepartmentsAdmin | Input | value=draft.description ; onChange=(e) => setDraft({ ...draft, description: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:319) |
| DepartmentsAdmin | Field | label=Statut |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:320) |
| DepartmentsAdmin | label |  | <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Département actif (ses accès s’appliquent) | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:320) |
| DepartmentsAdmin | input | type=checkbox ; onChange=(e) => setDraft({ ...draft, is_active: e.target.checked }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:320) |
| DepartmentsAdmin | Select | value=draft.levels[m] ?? '' ; onChange=(e) => setDraft({ ...draft, levels: { ...draft.levels, [m]: e.target.value } }) ; options=LEVEL_OPTS ; aria-label=`Niveau pour ${l}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:327) |
| DepartmentsAdmin | Modal | title=Nouveau département |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:334) |
| DepartmentsAdmin | Button | onClick=() => setCreate(null) | Annuler | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:335) |
| DepartmentsAdmin | Button | onClick=() => save.run({ code: create.code, body: { label: create.label, levels: {} } }) | Créer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:335) |
| DepartmentsAdmin | Field | label=Code |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:337) |
| DepartmentsAdmin | Input | value=create.code ; onChange=(e) => setCreate({ ...create, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:337) |
| DepartmentsAdmin | Field | label=Libellé |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:338) |
| DepartmentsAdmin | Input | value=create.label ; onChange=(e) => setCreate({ ...create, label: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:338) |
| SettingValue | Button | onClick=() => onSave(v) | Enregistrer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:358) |
| SettingValue | label |  | <input type="checkbox" checked={v} onChange={(e) => onSave(e.target.checked)} disabled={busy} /> {v ? 'Activé' : 'Désactivé'} | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:360) |
| SettingValue | input | type=checkbox ; onChange=(e) => onSave(e.target.checked) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:360) |
| SettingValue | Input | type=number ; value=v ; onChange=(e) => setV(e.target.value === '' ? '' : Number(e.target.value)) ; aria-label=row.label |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:362) |
| SettingValue | Input | value=v.join(', ') ; onChange=(e) => setV(e.target.value.split(/[,; ]+/).filter(Boolean).map(Number)) ; aria-label=row.label |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:363) |
| SettingValue | Field | label=KEY_LABEL[k] ?? k |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:367) |
| SettingValue | Select | value=x as string ; onChange=(e) => setV({ ...v, [k]: e.target.value }) ; options=MODE_OPTS |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:368) |
| SettingValue | Input | type=number ; value=x ; onChange=(e) => setV({ ...v, [k]: Number(e.target.value) }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:369) |
| SettingValue | Input | value=x as string ; onChange=(e) => setV({ ...v, [k]: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:370) |
| StagesAdmin | DataTable | columns=[         { key: 'l', label: 'Étape', render: (s: any) => <><div className="cell-title">{s.label}</div><div className="cell-sub">{s.exit_criteria}</div></> },         { key: 'p', label: 'Probabilité', num: true, render: (s: any) => `${s.probability} %` },         { key: 'i', label: 'Inactivité', num: true, render: (s: any) => (s.inactivity_days ? `${s.inactivity_days} j` : '—'), mobile: 'hide' },         { key: 'f', label: 'Champs obligatoires', render: (s: any) => <span className="xsmall">{(s.required_fields ?? []).map((f: string) => REQ_FIELDS[f] ?? f).join(', ') \|\| '—'}</span>, mobile: 'hide' },       ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:413) |
| StagesAdmin | Modal | title=`Étape — ${edit?.label}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:419) |
| StagesAdmin | Button | onClick=() => setEdit(null) | Annuler | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:420) |
| StagesAdmin | Button | onClick=() => save.run({ code: edit.code, body: { label: edit.label, probability: Number(edit.probability), inactivity_days: Number(edit.inactivity_days), required_fields: edit.required_fields ?? [], exit_criteria: edit.exit_criteria ?? '' } }) | Enregistrer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:420) |
| StagesAdmin | Field | label=Libellé |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:422) |
| StagesAdmin | Input | value=edit.label ; onChange=(e) => setEdit({ ...edit, label: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:422) |
| StagesAdmin | Field | label=Probabilité (%) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:423) |
| StagesAdmin | Input | type=number ; value=edit.probability ; onChange=(e) => setEdit({ ...edit, probability: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:423) |
| StagesAdmin | Field | label=Alerte d’inactivité (jours) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:424) |
| StagesAdmin | Input | type=number ; value=edit.inactivity_days ; onChange=(e) => setEdit({ ...edit, inactivity_days: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:424) |
| StagesAdmin | Field | label=Critère de sortie |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:425) |
| StagesAdmin | Textarea | value=edit.exit_criteria ?? '' ; onChange=(e) => setEdit({ ...edit, exit_criteria: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:425) |
| StagesAdmin | Field | label=Champs obligatoires pour entrer dans l’étape |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:426) |
| StagesAdmin | label |  | <input type="checkbox" checked={(edit.required_fields ?? []).includes(k)} onChange={(e) => setEdit({ ...edit, required_fields: e.target.checked ? [...(edit.required_fields ?? []), k] : edit.required_fields.filter((x: string) => x !== k) })} /> {l} | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:427) |
| StagesAdmin | input | type=checkbox ; onChange=(e) => setEdit({ ...edit, required_fields: e.target.checked ? [...(edit.required_fields ?? []), k] : edit.required_fields.filter((x: string) => x !== k) }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:427) |
| CatalogAdmin | Button | onClick=() => setEdit({ code: '', label: '', category: 'prestation', unit: 'unité', unit_price: null, unit_cost: 0, max_discount_pct: 10, tax_rate: 18, description: '', is_active: true }) | Nouvel article | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:444) |
| CatalogAdmin | DataTable | columns=[         { key: 'c', label: 'Article', render: (x: any) => <><div className="cell-title">{x.label}{!x.is_active && <> <Badge>Inactif</Badge></>}</div><div className="cell-sub">{x.code} · {x.category} · par {x.unit}</div></> },         { key: 'p', label: 'Prix unitaire HT', num: true, render: (x: any) => money(x.unit_price) },         { key: 'k', label: 'Coût', num: true, render: (x: any) => (x.unit_cost === null ? '—' : money(x.unit_cost)), mobile: 'hide' },         { key: 'd', label: 'Remise max.', num: true, render: (x: any) => `${x.max_discount_pct} %`, mobile: 'hide' },       ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:445) |
| CatalogAdmin | Modal | title=edit?.id ? `Article ${edit.code}` : 'Nouvel article' |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:451) |
| CatalogAdmin | Button | onClick=() => setEdit(null) | Annuler | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:452) |
| CatalogAdmin | Button | onClick=() => save.run({ id: edit.id, body: { code: edit.code, label: edit.label, category: edit.category, unit: edit.unit, unit_price: edit.unit_price, unit_cost: edit.unit_cost ?? 0, max_discount_pct: Number(edit.max_discount_pct), tax_rate: Number(edit.tax_rate), description: edit.description \|\| null, is_active: edit.is_active } }) | Enregistrer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:452) |
| CatalogAdmin | Field | label=Code ; required=true |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:454) |
| CatalogAdmin | Input | value=edit.code ; onChange=(e) => setEdit({ ...edit, code: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:454) |
| CatalogAdmin | Field | label=Catégorie |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:455) |
| CatalogAdmin | Input | value=edit.category ; onChange=(e) => setEdit({ ...edit, category: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:455) |
| CatalogAdmin | Field | label=Libellé ; required=true |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:456) |
| CatalogAdmin | Input | value=edit.label ; onChange=(e) => setEdit({ ...edit, label: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:456) |
| CatalogAdmin | Field | label=Unité ; required=true |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:457) |
| CatalogAdmin | Input | value=edit.unit ; onChange=(e) => setEdit({ ...edit, unit: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:457) |
| CatalogAdmin | Field | label=Prix unitaire HT ; required=true |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:458) |
| CatalogAdmin | MoneyInput | value=edit.unit_price ; onChange=(v) => setEdit({ ...edit, unit_price: v }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:458) |
| CatalogAdmin | Field | label=Coût unitaire |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:459) |
| CatalogAdmin | MoneyInput | value=edit.unit_cost ; onChange=(v) => setEdit({ ...edit, unit_cost: v }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:459) |
| CatalogAdmin | Field | label=Remise maximale sans validation (%) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:460) |
| CatalogAdmin | Input | type=number ; value=edit.max_discount_pct ; onChange=(e) => setEdit({ ...edit, max_discount_pct: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:460) |
| CatalogAdmin | Field | label=TVA (%) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:461) |
| CatalogAdmin | Input | type=number ; value=edit.tax_rate ; onChange=(e) => setEdit({ ...edit, tax_rate: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:461) |
| CatalogAdmin | Field | label=Statut |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:462) |
| CatalogAdmin | label |  | <input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> Article actif | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:462) |
| CatalogAdmin | input | type=checkbox ; onChange=(e) => setEdit({ ...edit, is_active: e.target.checked }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:462) |
| CatalogAdmin | Field | label=Description |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:463) |
| CatalogAdmin | Textarea | value=edit.description ?? '' ; onChange=(e) => setEdit({ ...edit, description: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:463) |
| LookupsAdmin | Select | value=cur ?? '' ; onChange=(e) => setList(e.target.value) ; options=lists.map((l) => ({ value: l, label: LIST_LABEL[l] ?? l })) ; aria-label=Liste |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:482) |
| LookupsAdmin | Button | onClick=() => setEdit({ code: '', label: '', is_active: true, sort_order: rows.length, isNew: true }) | Ajouter | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:483) |
| LookupsAdmin | DataTable | columns=[         { key: 'l', label: 'Libellé', render: (x: any) => <span className="cell-title">{x.label}</span> },         { key: 'c', label: 'Code', render: (x: any) => <code className="xsmall">{x.code}</code> },         { key: 'a', label: 'Statut', render: (x: any) => (x.is_active ? <Badge tone="success">Actif</Badge> : <Badge>Désactivé</Badge>) },       ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:484) |
| LookupsAdmin | Modal | title=edit?.isNew ? 'Nouvelle valeur' : `Valeur — ${edit?.label}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:489) |
| LookupsAdmin | Button | onClick=() => setEdit(null) | Annuler | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:490) |
| LookupsAdmin | Button | onClick=() => save.run(edit) | Enregistrer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:490) |
| LookupsAdmin | Field | label=Code |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:492) |
| LookupsAdmin | Input | value=edit.code ; onChange=(e) => setEdit({ ...edit, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:492) |
| LookupsAdmin | Field | label=Libellé |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:493) |
| LookupsAdmin | Input | value=edit.label ; onChange=(e) => setEdit({ ...edit, label: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:493) |
| LookupsAdmin | Field | label=Ordre |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:494) |
| LookupsAdmin | Input | type=number ; value=edit.sort_order ; onChange=(e) => setEdit({ ...edit, sort_order: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:494) |
| LookupsAdmin | Field | label=Statut |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:495) |
| LookupsAdmin | label |  | <input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> Proposée dans les formulaires | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:495) |
| LookupsAdmin | input | type=checkbox ; onChange=(e) => setEdit({ ...edit, is_active: e.target.checked }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:495) |
| AutomationsAdmin | Button | onClick=() => run.run(undefined) | Exécuter maintenant | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:511) |
| AutomationsAdmin | DataTable | columns=[           { key: 'l', label: 'Règle', render: (x: any) => <><div className="cell-title">{x.label}{x.uses_ai && <> <Badge tone="accent">IA</Badge></>}</div><div className="cell-sub">{x.action}{x.control ? ` — ${x.control}` : ''}</div></> },           { key: 't', label: 'Déclencheur', render: (x: any) => <span className="xsmall">{x.trigger_event}</span>, mobile: 'hide' },           { key: 'r', label: 'Dernière exécution', render: (x: any) => <span className="xsmall">{x.last_run_at ? `${relative(x.last_run_at)} · ${x.last_run_count}` : '—'}</span>, mobile: 'hide' },           { key: 'e', label: 'Active', render: (x: any) => <label className="checkbox"><input type="checkbox" checked={x.is_enabled} onChange={(e) => toggle.run({ code: x.code, is_enabled: e.target.checked })} aria-label={`Activer ${x.label}`} /></label> },         ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:512) |
| AutomationsAdmin | label |  | <input type="checkbox" checked={x.is_enabled} onChange={(e) => toggle.run({ code: x.code, is_enabled: e.target.checked })} aria-label={`Activer ${x.label}`} /> | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:516) |
| AutomationsAdmin | input | type=checkbox ; onChange=(e) => toggle.run({ code: x.code, is_enabled: e.target.checked }) ; aria-label=`Activer ${x.label}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:516) |
| TargetsAdmin | Button | onClick=() => setEdit({ user_id: '', period: String(year), amount: null }) | Fixer un objectif | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:535) |
| TargetsAdmin | DataTable | columns=[           { key: 'p', label: 'Période', render: (t: any) => <span className="cell-title">{t.period}</span> },           { key: 'u', label: 'Portée', render: (t: any) => t.full_name ?? <Badge tone="info">Global entreprise</Badge> },           { key: 'a', label: 'Objectif HT', num: true, render: (t: any) => money(t.amount) },         ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:536) |
| TargetsAdmin | Modal | title=Objectif commercial |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:544) |
| TargetsAdmin | Button | onClick=() => setEdit(null) | Annuler | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:545) |
| TargetsAdmin | Button | onClick=() => save.run({ user_id: edit.user_id \|\| null, period: edit.period, amount: edit.amount ?? 0 }) | Enregistrer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:545) |
| TargetsAdmin | Field | label=Commercial |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:547) |
| TargetsAdmin | Select | placeholder=Global entreprise ; value=edit.user_id ; onChange=(e) => setEdit({ ...edit, user_id: e.target.value }) ; options=users.filter((u) => ['commercial', 'direction_commerciale'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name })) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:547) |
| TargetsAdmin | Field | label=Période |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:548) |
| TargetsAdmin | Input | value=edit.period ; onChange=(e) => setEdit({ ...edit, period: e.target.value }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:548) |
| TargetsAdmin | Field | label=Montant HT (FCFA) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:549) |
| TargetsAdmin | MoneyInput | value=edit.amount ; onChange=(v) => setEdit({ ...edit, amount: v }) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:549) |
| ImportsAdmin | Field | label=Type de données |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:581) |
| ImportsAdmin | Select | value=entity ; onChange=(e) => { setEntity(e.target.value); setPreview(null); } ; options=allowed.map((e) => ({ value: e, label: ENTITY_LABEL[e] })) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:581) |
| ImportsAdmin | Field | label=Fichier |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:582) |
| ImportsAdmin | input | type=file ; onChange=(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); } |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:582) |
| ImportsAdmin | Button | onClick=() => analyse.run(undefined) | Analyser le fichier | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:584) |
| ImportsAdmin | Button | onClick=() => analyse.run(mapping) | Relancer l’analyse | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:596) |
| ImportsAdmin | Button | onClick=() => commit.run(undefined) | Importer {preview.valid} ligne(s) valide(s) | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:597) |
| ImportsAdmin | Field | label=label as string ; required=preview.required.includes(k) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:601) |
| ImportsAdmin | Select | placeholder=— Non importé — ; value=mapping[k] ?? '' ; onChange=(e) => setMapping({ ...mapping, [k]: e.target.value }) ; options=preview.headers.map((h: string) => ({ value: h, label: h })) |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:602) |
| ImportsAdmin | DataTable | columns=[{ key: 'l', label: 'Ligne', num: true, render: (e: any) => e.line, width: 70 }, { key: 'm', label: 'Motif', render: (e: any) => <span className="small">{e.message}</span> }] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:608) |
| ImportsAdmin | DataTable | columns=[           { key: 'f', label: 'Fichier', render: (b: any) => <><div className="cell-title">{b.filename}</div><div className="cell-sub">{ENTITY_LABEL[b.entity] ?? b.entity} · {b.full_name}</div></> },           { key: 'd', label: 'Date', render: (b: any) => <span className="small">{dateTime(b.imported_at ?? b.created_at)}</span> },           { key: 's', label: 'Statut', render: (b: any) => (b.status === 'importe' ? <Badge tone="success">Importé</Badge> : <Badge>Prévisualisé</Badge>) },           { key: 'n', label: 'Valides / rejets', num: true, render: (b: any) => `${b.valid_rows} / ${b.rejected_rows}` },         ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:613) |
| AiSupervision | Button | onClick=() => (st.enabled ? setConfirm('ai.enabled') : save.run({ key: 'ai.enabled', value: true })) | {st.enabled ? 'Désactiver l’assistant' : 'Réactiver l’assistant'} | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:641) |
| AiSupervision | Button | onClick=() => (st.automation_enabled ? setConfirm('ai.automation_enabled') : save.run({ key: 'ai.automation_enabled', value: true })) | {st.automation_enabled ? 'Arrêter les automatisations' : 'Relancer les automatisations'} | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:645) |
| AiSupervision | DataTable | columns=[           { key: 'f', label: 'Fonction', render: (x: any) => x.feature },           { key: 'r', label: 'Requêtes', num: true, render: (x: any) => x.requests },           { key: 'c', label: 'Coût', num: true, render: (x: any) => money(x.cost_fcfa) },           { key: 'l', label: 'Latence moy.', num: true, render: (x: any) => (x.avg_latency_ms ? `${x.avg_latency_ms} ms` : '—') },         ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:659) |
| AiSupervision | DataTable | columns=[           { key: 'u', label: 'Utilisateur', render: (x: any) => x.full_name },           { key: 'r', label: 'Requêtes', num: true, render: (x: any) => x.requests },           { key: 'c', label: 'Coût', num: true, render: (x: any) => money(x.cost_fcfa) },         ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:665) |
| AiSupervision | DataTable | columns=[           { key: 'd', label: 'Date', render: (a: any) => <span className="xsmall">{dateTime(a.created_at)}</span> },           { key: 'u', label: 'Utilisateur', render: (a: any) => <span className="small">{a.full_name}</span>, mobile: 'hide' },           { key: 'l', label: 'Action', render: (a: any) => <><div className="small">{a.label}</div><div className="xsmall muted">{a.mode} · risque {a.risk}{a.error ? ` · ${a.error}` : ''}</div></> },           { key: 's', label: 'Statut', render: (a: any) => <Status kind="ai_action" code={a.status} /> },         ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:672) |
| AiSupervision | ConfirmModal | title=confirm === 'ai.enabled' ? 'Désactiver l’assistant IA ?' : 'Arrêter les automatisations IA ?' |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:679) |
| AuditAdmin | ExcelButton | url=`/api/admin/audit${qs({ ...params, page: null, format: 'xlsx' })}` |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:698) |
| AuditAdmin | Input | placeholder=Rechercher (résumé, utilisateur)… ; value=f.q ; onChange=(e) => setF({ ...f, q: e.target.value, page: 1 }) ; aria-label=Rechercher |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:700) |
| AuditAdmin | Select | placeholder=Toutes les actions ; value=f.action ; onChange=(e) => setF({ ...f, action: e.target.value, page: 1 }) ; options=Object.entries(AUDIT_ACTION).map(([value, label]) => ({ value, label })) ; aria-label=Action |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:701) |
| AuditAdmin | Input | type=date ; value=f.from ; onChange=(e) => setF({ ...f, from: e.target.value, page: 1 }) ; aria-label=Du |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:702) |
| AuditAdmin | Input | type=date ; value=f.to ; onChange=(e) => setF({ ...f, to: e.target.value, page: 1 }) ; aria-label=Au |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:703) |
| AuditAdmin | DataTable | columns=[         { key: 'd', label: 'Date', render: (x: any) => <span className="xsmall nowrap">{dateTime(x.at)}</span> },         { key: 'u', label: 'Utilisateur', render: (x: any) => <span className="small">{x.user_label}</span>, mobile: 'hide' },         { key: 'a', label: 'Action', render: (x: any) => <Badge tone={x.action === 'login_failed' \|\| x.action === 'delete' ? 'danger' : x.action === 'config' \|\| x.action === 'security' ? 'warning' : 'neutral'}>{AUDIT_ACTION[x.action] ?? x.action}</Badge> },         { key: 's', label: 'Résumé', render: (x: any) => <span className="small">{x.summary}</span> },       ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:705) |
| AuditAdmin | Button | onClick=() => setF({ ...f, page: f.page - 1 }) | Précédent | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:712) |
| AuditAdmin | Button | onClick=() => setF({ ...f, page: f.page + 1 }) | Suivant | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:714) |
| AuditAdmin | Modal | title=Entrée du journal |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:716) |
| TrashAdmin | DataTable | columns=[         { key: 'l', label: 'Élément', render: (x: any) => <><div className="cell-title">{x.label}</div><div className="cell-sub">{TRASH_LABEL[x.type] ?? x.type}</div></> },         { key: 'd', label: 'Supprimé', render: (x: any) => <span className="small">{date(x.deleted_at)}{x.deleted_by_name ? ` · ${x.deleted_by_name}` : ''}</span> },         { key: 'a', label: '', render: (x: any) => <Button size="sm" loading={restore.isPending && restore.variables?.id === x.id} onClick={() => restore.run(x)}>Restaurer</Button> },       ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:734) |
| TrashAdmin | Button | onClick=() => restore.run(x) | Restaurer | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:737) |
| SessionsAdmin | DataTable | columns=[         { key: 'u', label: 'Utilisateur', render: (s: any) => <><div className="cell-title">{s.full_name}</div><div className="cell-sub">{s.email}</div></> },         { key: 'l', label: 'Dernière activité', render: (s: any) => <span className="small">{relative(s.last_used_at)}</span> },         { key: 'i', label: 'Adresse IP', render: (s: any) => <span className="xsmall">{s.ip ?? '—'}</span>, mobile: 'hide' },         { key: 'a', label: 'Navigateur', render: (s: any) => <span className="xsmall muted" title={s.user_agent}>{(s.user_agent ?? '').slice(0, 60)}</span>, mobile: 'hide' },       ] |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:748) |
| LetterheadCard | Button | onClick=() => download('/api/admin/letterhead/template') | Télécharger le modèle | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:776) |
| LetterheadCard | label |  | <Upload size={16} /> Remplacer (.docx) <input type="file" hidden accept=".docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.run(f); e.target.value = ''; }} /> | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:777) |
| LetterheadCard | input | type=file ; onChange=(e) => { const f = e.target.files?.[0]; if (f) upload.run(f); e.target.value = ''; } |  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:777) |
| LetterheadCard | Button | onClick=() => reset.run(undefined) | Revenir au modèle livré | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:778) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Admin | id = utilisateurs | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:27) |
| Admin | label = Utilisateurs | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:27) |
| Admin | id = equipes | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:28) |
| Admin | label = Équipes | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:28) |
| Admin | id = roles | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:29) |
| Admin | label = Rôles et droits | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:29) |
| Admin | id = departements | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:30) |
| Admin | label = Départements et accès | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:30) |
| Admin | id = portail | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:31) |
| Admin | label = Portail des départements | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:31) |
| Admin | id = parametres | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:32) |
| Admin | label = Paramètres et seuils | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:32) |
| Admin | id = pipeline | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:33) |
| Admin | label = Étapes du pipeline | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:33) |
| Admin | id = catalogue | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:34) |
| Admin | label = Catalogue et tarifs | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:34) |
| Admin | id = listes | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:35) |
| Admin | label = Listes de valeurs | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:35) |
| Admin | id = automatisations | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:36) |
| Admin | label = Automatisations | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:36) |
| Admin | id = objectifs | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:37) |
| Admin | label = Objectifs commerciaux | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:37) |
| Admin | id = imports | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:38) |
| Admin | label = Imports | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:38) |
| Admin | id = ia | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:39) |
| Admin | label = Supervision IA | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:39) |
| Admin | id = audit | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:40) |
| Admin | label = Journal d’audit | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:40) |
| Admin | id = corbeille | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:41) |
| Admin | label = Corbeille | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:41) |
| Admin | id = sessions | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:42) |
| Admin | label = Sessions actives | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:42) |
| UsersAdmin | key = n | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:131) |
| UsersAdmin | label = Utilisateur | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:131) |
| UsersAdmin | key = r | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:134) |
| UsersAdmin | label = Rôle | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:134) |
| UsersAdmin | key = m | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:135) |
| UsersAdmin | label = Sécurité | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:135) |
| UsersAdmin | key = l | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:136) |
| UsersAdmin | key = a | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:137) |
| UsersAdmin | label =  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:137) |
| TeamsAdmin | name =  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:185) |
| TeamsAdmin | key = n | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:187) |
| TeamsAdmin | label = Équipe | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:187) |
| TeamsAdmin | key = m | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:188) |
| TeamsAdmin | label = Responsable | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:188) |
| TeamsAdmin | key = c | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:189) |
| TeamsAdmin | label = Membres actifs | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:189) |
| RolesAdmin | label = Ses propres dossiers | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:221) |
| RolesAdmin | label = Son équipe | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:221) |
| RolesAdmin | label = Toute l’entreprise | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:221) |
| PortalAdmin | key = sort_order | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:262) |
| PortalAdmin | label = Ordre | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:262) |
| PortalAdmin | key = label | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:263) |
| PortalAdmin | label = Tuile | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:263) |
| PortalAdmin | key = target | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:264) |
| PortalAdmin | label = Entrée | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:264) |
| PortalAdmin | key = state | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:265) |
| PortalAdmin | label = État | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:265) |
| (partagé / module) | label = — | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:296) |
| (partagé / module) | label = Lecture | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:296) |
| (partagé / module) | label = Contribution | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:296) |
| (partagé / module) | label = Gestion | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:296) |
| DepartmentsAdmin | label =  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:313) |
| (partagé / module) | name = Raison sociale | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:347) |
| (partagé / module) | label = Assistant | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:353) |
| (partagé / module) | label = Copilote | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:353) |
| (partagé / module) | label = Automatisation | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:353) |
| StagesAdmin | key = l | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:414) |
| StagesAdmin | label = Étape | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:414) |
| StagesAdmin | key = p | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:415) |
| StagesAdmin | label = Probabilité | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:415) |
| StagesAdmin | key = i | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:416) |
| StagesAdmin | label = Inactivité | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:416) |
| StagesAdmin | key = f | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:417) |
| StagesAdmin | label = Champs obligatoires | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:417) |
| CatalogAdmin | label =  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:444) |
| CatalogAdmin | key = c | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:446) |
| CatalogAdmin | label = Article | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:446) |
| CatalogAdmin | key = p | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:447) |
| CatalogAdmin | label = Prix unitaire HT | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:447) |
| CatalogAdmin | key = k | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:448) |
| CatalogAdmin | label = Coût | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:448) |
| CatalogAdmin | key = d | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:449) |
| CatalogAdmin | label = Remise max. | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:449) |
| LookupsAdmin | label =  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:483) |
| LookupsAdmin | key = l | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:485) |
| LookupsAdmin | label = Libellé | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:485) |
| LookupsAdmin | key = c | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:486) |
| LookupsAdmin | label = Code | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:486) |
| LookupsAdmin | key = a | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:487) |
| LookupsAdmin | label = Statut | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:487) |
| AutomationsAdmin | key = l | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:513) |
| AutomationsAdmin | label = Règle | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:513) |
| AutomationsAdmin | key = t | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:514) |
| AutomationsAdmin | label = Déclencheur | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:514) |
| AutomationsAdmin | key = r | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:515) |
| AutomationsAdmin | label = Dernière exécution | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:515) |
| AutomationsAdmin | key = e | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:516) |
| AutomationsAdmin | label = Active | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:516) |
| TargetsAdmin | key = p | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:539) |
| TargetsAdmin | label = Période | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:539) |
| TargetsAdmin | key = u | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:540) |
| TargetsAdmin | label = Portée | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:540) |
| TargetsAdmin | key = a | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:541) |
| TargetsAdmin | label = Objectif HT | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:541) |
| ImportsAdmin | key = l | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:608) |
| ImportsAdmin | label = Ligne | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:608) |
| ImportsAdmin | key = m | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:608) |
| ImportsAdmin | label = Motif | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:608) |
| ImportsAdmin | key = f | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:614) |
| ImportsAdmin | label = Fichier | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:614) |
| ImportsAdmin | key = d | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:615) |
| ImportsAdmin | label = Date | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:615) |
| ImportsAdmin | key = s | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:616) |
| ImportsAdmin | label = Statut | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:616) |
| ImportsAdmin | key = n | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:617) |
| ImportsAdmin | label = Valides / rejets | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:617) |
| AiSupervision | key = ai.enabled | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:641) |
| AiSupervision | key = ai.automation_enabled | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:645) |
| AiSupervision | title = Coût IA | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:651) |
| AiSupervision | key = f | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:660) |
| AiSupervision | label = Fonction | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:660) |
| AiSupervision | key = r | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:661) |
| AiSupervision | label = Requêtes | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:661) |
| AiSupervision | key = c | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:662) |
| AiSupervision | label = Coût | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:662) |
| AiSupervision | key = l | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:663) |
| AiSupervision | label = Latence moy. | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:663) |
| AiSupervision | key = u | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:666) |
| AiSupervision | label = Utilisateur | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:666) |
| AiSupervision | key = r | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:667) |
| AiSupervision | label = Requêtes | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:667) |
| AiSupervision | key = c | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:668) |
| AiSupervision | label = Coût | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:668) |
| AiSupervision | key = d | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:673) |
| AiSupervision | label = Date | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:673) |
| AiSupervision | key = u | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:674) |
| AiSupervision | label = Utilisateur | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:674) |
| AiSupervision | key = l | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:675) |
| AiSupervision | label = Action | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:675) |
| AiSupervision | key = s | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:676) |
| AiSupervision | label = Statut | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:676) |
| AuditAdmin | key = d | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:706) |
| AuditAdmin | label = Date | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:706) |
| AuditAdmin | key = u | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:707) |
| AuditAdmin | label = Utilisateur | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:707) |
| AuditAdmin | key = a | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:708) |
| AuditAdmin | label = Action | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:708) |
| AuditAdmin | key = s | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:709) |
| AuditAdmin | label = Résumé | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:709) |
| TrashAdmin | key = l | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:735) |
| TrashAdmin | label = Élément | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:735) |
| TrashAdmin | key = d | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:736) |
| TrashAdmin | label = Supprimé | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:736) |
| TrashAdmin | key = a | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:737) |
| TrashAdmin | label =  | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:737) |
| SessionsAdmin | key = u | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:749) |
| SessionsAdmin | label = Utilisateur | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:749) |
| SessionsAdmin | key = l | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:750) |
| SessionsAdmin | label = Dernière activité | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:750) |
| SessionsAdmin | key = i | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:751) |
| SessionsAdmin | label = Adresse IP | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:751) |
| SessionsAdmin | key = a | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:752) |
| SessionsAdmin | label = Navigateur | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:752) |
| Admin | useCan() | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:22) |
| Admin | can('admin') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:25) |
| Admin | can('catalog') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:34) |
| Admin | can('organizations', 'create') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:38) |
| Admin | can('supports', 'create') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:38) |
| Admin | can('finance', 'create') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:38) |
| CatalogAdmin | useCan() | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:437) |
| CatalogAdmin | can('catalog', 'update') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:441) |
| ImportsAdmin | useCan() | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:559) |
| ImportsAdmin | can(e === 'invoices' ? 'finance' : e, 'create') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:561) |
| AuditAdmin | useCan() | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:689) |
| AuditAdmin | can('admin', 'export') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:695) |
| LetterheadCard | useCan() | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:760) |
| LetterheadCard | can('admin', 'view') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:761) |
| LetterheadCard | can('admin', 'view') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:765) |
| LetterheadCard | can('admin', 'update') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:777) |
| LetterheadCard | can('admin', 'update') | [Admin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Admin.tsx:778) |

## AdminSpace.tsx — CRM-023

Source : [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [AdminSpace (export)](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:11).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| AdminSpace | `'/api/admin/users'` | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:14) |
| AdminSpace | `api.post('/api/admin/users')` | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:24) |
| AdminSpace | `'/api/admin/users'` | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:24) |
| AdminSpace | `api.patch(`/api/admin/users/${u.id}`)` | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:28) |
| AdminSpace | ``/api/admin/users/${u.id}`` | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:28) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| AdminSpace | Button | onClick=() => setCreate({ full_name: '', email: '', username: '', role_code: 'admin_tech' }) | Nouveau compte | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:42) |
| AdminSpace | DataTable | columns=[             { key: 'n', label: 'Compte', render: (u: any) => <><div className="cell-title">{u.full_name} {!u.is_active && <Badge>Désactivé</Badge>}</div><div className="cell-sub"><code>{u.username}</code> · {u.role_label}</div></> },             { key: 's', label: 'Sécurité', render: (u: any) => u.mfa_enabled ? <Badge tone="success">MFA</Badge> : <Badge tone="warning">MFA à activer</Badge> },             { key: 'l', label: 'Connexion', render: (u: any) => <span className="small">{u.last_login_at ? relative(u.last_login_at) : 'Jamais'}</span>, mobile: 'hide' },             { key: 'a', label: '', render: (u: any) => u.id === me?.id ? <span className="xsmall muted">Vous</span> : <Button size="sm" variant="ghost" loading={toggle.isPending} onClick={() => toggle.run(u)}>{u.is_active ? 'Désactiver' : 'Activer'}</Button> },           ] |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:43) |
| AdminSpace | Button | onClick=() => toggle.run(u) | {u.is_active ? 'Désactiver' : 'Activer'} | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:47) |
| AdminSpace | DataTable | columns=[             { key: 'n', label: 'Collaborateur', render: (u: any) => <><div className="cell-title">{u.full_name}</div><div className="cell-sub"><code>{u.username}</code> · {u.role_label} · {u.department_label}</div></> },             { key: 'b', label: 'Créé par', render: (u: any) => <span className="small">{u.created_by_name}<div className="xsmall muted">{date(u.created_at)}</div></span> },             { key: 'f', label: '', render: (u: any) => u.must_change_password ? <Badge tone="info">Première connexion à venir</Badge> : <Badge tone="success">Activé</Badge>, mobile: 'hide' },           ] |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:51) |
| AdminSpace | Link | to=/admin/utilisateurs | <Users /> Utilisateurs et comptes de service | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:59) |
| AdminSpace | Link | to=/admin/roles | <KeyRound /> Rôles et droits | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:60) |
| AdminSpace | Link | to=/admin/departements | <Building /> Départements et niveaux d’accès | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:61) |
| AdminSpace | Link | to=/admin/sessions | <MonitorSmartphone /> Sessions actives | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:62) |
| AdminSpace | Link | to=/admin/audit | <ScrollText /> Journal d’audit | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:63) |
| AdminSpace | Link | to=/securite | <ShieldAlert /> Sécurité et agents de surveillance | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:64) |
| AdminSpace | Modal | title=Nouveau compte d’administration |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:76) |
| AdminSpace | Button | onClick=() => setCreate(null) | Annuler | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:77) |
| AdminSpace | Button | onClick=() => save.run({ ...create, username: create.username \|\| undefined, department_code: 'administration' }) | Créer | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:77) |
| AdminSpace | Field | label=Nom complet ; required=true |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:79) |
| AdminSpace | Input | value=create.full_name ; onChange=(e) => setCreate({ ...create, full_name: e.target.value }) |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:79) |
| AdminSpace | Field | label=E-mail ; required=true |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:80) |
| AdminSpace | Input | type=email ; value=create.email ; onChange=(e) => setCreate({ ...create, email: e.target.value }) |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:80) |
| AdminSpace | Field | label=Identifiant |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:81) |
| AdminSpace | Input | value=create.username ; onChange=(e) => setCreate({ ...create, username: e.target.value.toLowerCase() }) |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:81) |
| AdminSpace | Field | label=Rôle ; required=true |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:82) |
| AdminSpace | Select | value=create.role_code ; onChange=(e) => setCreate({ ...create, role_code: e.target.value }) ; options=[{ value: 'admin_tech', label: 'Administrateur' }, { value: 'superadmin', label: 'Super-administrateur' }] |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:82) |
| AdminSpace | Modal | title=Mot de passe temporaire |  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:86) |
| AdminSpace | Button | onClick=() => setTemp(null) | J’ai transmis le mot de passe | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:86) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| AdminSpace | key = n | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:44) |
| AdminSpace | label = Compte | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:44) |
| AdminSpace | key = s | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:45) |
| AdminSpace | label = Sécurité | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:45) |
| AdminSpace | key = l | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:46) |
| AdminSpace | label = Connexion | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:46) |
| AdminSpace | key = a | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:47) |
| AdminSpace | label =  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:47) |
| AdminSpace | key = n | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:52) |
| AdminSpace | label = Collaborateur | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:52) |
| AdminSpace | key = b | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:53) |
| AdminSpace | label = Créé par | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:53) |
| AdminSpace | key = f | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:54) |
| AdminSpace | label =  | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:54) |
| AdminSpace | label = Administrateur | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:82) |
| AdminSpace | label = Super-administrateur | [AdminSpace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/AdminSpace.tsx:82) |

## Approvals.tsx — CRM-073

Source : [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Approvals (export)](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:14).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Approvals | ``/api/approvals?status=${tab}`` | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:17) |
| Approvals | `api.post(`/api/approvals/${v.id}/decide`)` | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:19) |
| Approvals | ``/api/approvals/${v.id}/decide`` | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:19) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Approvals | Segmented | label=Vue ; value=tab ; onChange=setTab ; options=[{ id: 'en_attente', label: 'À traiter' }, { id: 'mes_demandes', label: 'Mes demandes' }, { id: 'traitees', label: 'Traitées par moi' }] |  | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:25) |
| Approvals | Link | to=`${LINK[a.entity_type] ?? '/'}${a.entity_id}` | {a.entity_label} | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:35) |
| Approvals | Button | onClick=() => setDecision({ a, approved: true }) | Approuver | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:50) |
| Approvals | Button | onClick=() => setDecision({ a, approved: false }) | Refuser | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:51) |
| Approvals | ConfirmModal | title=decision?.approved ? 'Approuver la demande' : 'Refuser la demande' |  | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:61) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Approvals | id = en_attente | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:25) |
| Approvals | label = À traiter | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:25) |
| Approvals | id = mes_demandes | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:25) |
| Approvals | label = Mes demandes | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:25) |
| Approvals | id = traitees | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:25) |
| Approvals | label = Traitées par moi | [Approvals.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Approvals.tsx:25) |

## Assistant.tsx — CRM-006, CRM-007

Source : [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Assistant (export)](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:16), [setTab](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:20), [Conversations](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:33), [Actions](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:55), [KnowledgeBase](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:75).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../lib/markdown`, `../components/AiPanel`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Conversations | `'/api/ai/conversations'` | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:34) |
| Actions | ``/api/ai/actions${status ? `?status=${status}` : ''}`` | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:57) |
| KnowledgeBase | ``/api/kb${all ? '?all=1' : ''}`` | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:81) |
| KnowledgeBase | ``/api/kb/${open}`` | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:83) |
| KnowledgeBase | `api.put(`/api/kb/${b.id}`)` | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:85) |
| KnowledgeBase | ``/api/kb/${b.id}`` | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:85) |
| KnowledgeBase | `api.post('/api/kb')` | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:85) |
| KnowledgeBase | `'/api/kb'` | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:85) |
| KnowledgeBase | `api.post(`/api/kb/${id}/archive`)` | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:88) |
| KnowledgeBase | ``/api/kb/${id}/archive`` | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:88) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Assistant | Tabs | value=tab ; onChange=setTab ; tabs=[{ id: 'chat', label: 'Conversations' }, { id: 'actions', label: 'Actions proposées' }, { id: 'kb', label: 'Base de connaissances' }] |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:25) |
| Conversations | Button | onClick=() => { setConv(null); setFresh((n) => n + 1); } | Nouvelle | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:38) |
| Conversations | button | onClick=() => setConv(c.id) | <span className="conv-title">{c.title \|\| 'Conversation'}</span> <span className="xsmall muted">{relative(c.updated_at)}{c.context_type ? ` · ${({ organization: 'client', opportunity: 'opportunité', quote: 'devis', contract: 'contrat', campaign: 'campagne' } as any)[c.context_type]}` : ''}</span> | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:42) |
| Actions | Segmented | label=Statut ; value=status ; onChange=setStatus ; options=[{ id: 'proposee', label: 'À valider' }, { id: 'executee', label: 'Exécutées' }, { id: 'rejetee', label: 'Rejetées' }, { id: '', label: 'Toutes' }] |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:60) |
| Actions | ActionCard | onChange=() => r.refetch() |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:63) |
| KnowledgeBase | Select | placeholder=Toutes les catégories ; value=cat ; onChange=(e) => setCat(e.target.value) ; options=Object.entries(KB_CATEGORY).map(([value, label]) => ({ value, label })) ; aria-label=Catégorie |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:96) |
| KnowledgeBase | Segmented | label=Visibilité ; value=all ; onChange=setAll ; options=[{ id: '', label: 'Actifs' }, { id: '1', label: 'Tous (y compris archives)' }] |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:97) |
| KnowledgeBase | Button | onClick=() => setEdit({ title: '', category: 'procedure', body: '', confidential: false, allowed_roles: [], status: 'actif' }) | Nouveau document | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:99) |
| KnowledgeBase | DataTable | columns=[               { key: 't', label: 'Document', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{KB_CATEGORY[x.category]} · v{x.version}{x.confidential ? ' · confidentiel' : ''}</div></> },               { key: 's', label: 'Statut', render: (x: any) => <Status kind="kb" code={x.status} /> },               { key: 'u', label: 'Mis à jour', render: (x: any) => <span className="small">{relative(x.updated_at)}</span>, mobile: 'hide' },             ] |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:103) |
| KnowledgeBase | Button | onClick=() => setEdit({ id: d.id, title: d.title, category: d.category, body: d.body, confidential: d.confidential, allowed_roles: d.allowed_roles, status: d.status }) | Nouvelle version | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:113) |
| KnowledgeBase | Button | onClick=() => archive.run(d.id) | Archiver | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:114) |
| KnowledgeBase | Modal | title=edit?.id ? 'Nouvelle version du document' : 'Nouveau document' |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:124) |
| KnowledgeBase | Button | onClick=() => setEdit(null) | Annuler | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:126) |
| KnowledgeBase | Button | onClick=() => save.run({ id: edit.id, body: { title: edit.title, category: edit.category, body: edit.body, confidential: edit.confidential, allowed_roles: edit.allowed_roles, status: edit.status } }) | Publier | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:126) |
| KnowledgeBase | Field | label=Titre ; required=true |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:128) |
| KnowledgeBase | Input | value=edit.title ; onChange=(e) => setEdit({ ...edit, title: e.target.value }) |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:128) |
| KnowledgeBase | Field | label=Catégorie |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:129) |
| KnowledgeBase | Select | value=edit.category ; onChange=(e) => setEdit({ ...edit, category: e.target.value }) ; options=Object.entries(KB_CATEGORY).map(([value, label]) => ({ value, label })) |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:129) |
| KnowledgeBase | Field | label=Statut |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:130) |
| KnowledgeBase | Select | value=edit.status ; onChange=(e) => setEdit({ ...edit, status: e.target.value }) ; options=[{ value: 'actif', label: 'Actif (utilisé par l’assistant)' }, { value: 'brouillon', label: 'Brouillon' }] |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:130) |
| KnowledgeBase | Field | label=Contenu ; required=true |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:131) |
| KnowledgeBase | Textarea | value=edit.body ; onChange=(e) => setEdit({ ...edit, body: e.target.value }) |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:131) |
| KnowledgeBase | Field | label=Confidentialité |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:132) |
| KnowledgeBase | label |  | <input type="checkbox" checked={edit.confidential} onChange={(e) => setEdit({ ...edit, confidential: e.target.checked })} /> Réservé aux profils habilités aux informations confidentielles | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:132) |
| KnowledgeBase | input | type=checkbox ; onChange=(e) => setEdit({ ...edit, confidential: e.target.checked }) |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:132) |
| KnowledgeBase | Field | label=Rôles autorisés |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:133) |
| KnowledgeBase | label |  | <input type="checkbox" checked={edit.allowed_roles.includes(code)} onChange={(e) => setEdit({ ...edit, allowed_roles: e.target.checked ? [...edit.allowed_roles, code] : edit.allowed_roles.filter((x: string) => x !== code) })} /> {label} | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:135) |
| KnowledgeBase | input | type=checkbox ; onChange=(e) => setEdit({ ...edit, allowed_roles: e.target.checked ? [...edit.allowed_roles, code] : edit.allowed_roles.filter((x: string) => x !== code) }) |  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:135) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Assistant | id = chat | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:25) |
| Assistant | label = Conversations | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:25) |
| Assistant | id = actions | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:25) |
| Assistant | label = Actions proposées | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:25) |
| Assistant | id = kb | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:25) |
| Assistant | label = Base de connaissances | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:25) |
| Actions | id = proposee | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:60) |
| Actions | label = À valider | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:60) |
| Actions | id = executee | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:60) |
| Actions | label = Exécutées | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:60) |
| Actions | id = rejetee | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:60) |
| Actions | label = Rejetées | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:60) |
| Actions | id =  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:60) |
| Actions | label = Toutes | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:60) |
| KnowledgeBase | id =  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:97) |
| KnowledgeBase | label = Actifs | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:97) |
| KnowledgeBase | id = 1 | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:97) |
| KnowledgeBase | label = Tous (y compris archives) | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:97) |
| KnowledgeBase | title =  | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:99) |
| KnowledgeBase | key = t | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:106) |
| KnowledgeBase | label = Document | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:106) |
| KnowledgeBase | key = s | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:107) |
| KnowledgeBase | label = Statut | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:107) |
| KnowledgeBase | key = u | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:108) |
| KnowledgeBase | label = Mis à jour | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:108) |
| KnowledgeBase | label = Actif (utilisé par l’assistant) | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:130) |
| KnowledgeBase | label = Brouillon | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:130) |
| KnowledgeBase | useCan() | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:77) |
| KnowledgeBase | can('admin', 'update') | [Assistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Assistant.tsx:78) |

## Calendar.tsx — CRM-008

Source : [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [iso](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:14), [startOfWeek](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:15), [time](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:18), [range](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:21), [Calendar (export)](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:30), [shift](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:50), [newAt](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:57), [open](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:62), [toLocal](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:90), [Chip](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:92), [TimeGrid](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:100), [MonthGrid](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:122), [YearGrid](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:142), [EventModal](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:167), [submit](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:172), [DeleteEvent](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:199).

Dépendances locales : `../lib/format`, `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/labels`, `../components/ProcessFlow`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Calendar | `'/api/calendar/owners'` | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:38) |
| Calendar | ``/api/calendar?from=${iso(from)}&to=${iso(to)}${owner ? `&owner_id=${owner}` : ''}`` | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:40) |
| Calendar | ``/api/xlsx/calendar?from=${today()}&to=${addDays(today(), 30)}${owner ? `&owner_id=${owner}` : ''}`` | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:68) |
| EventModal | `api.put(`/api/calendar/events/${edit.id}`)` | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:168) |
| EventModal | ``/api/calendar/events/${edit.id}`` | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:168) |
| EventModal | `api.post('/api/calendar/events')` | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:168) |
| EventModal | `'/api/calendar/events'` | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:168) |
| DeleteEvent | `api.del(`/api/calendar/events/${ev.id}`)` | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:200) |
| DeleteEvent | ``/api/calendar/events/${ev.id}`` | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:200) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Calendar | Select | value=owner ; onChange=(e) => setOwner(e.target.value) ; options=ownerOptions ; aria-label=Agenda |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:67) |
| Calendar | ExcelButton | label=Agenda Excel ; title=Les 30 prochains jours au format Excel ; url=`/api/xlsx/calendar?from=${today()}&to=${addDays(today(), 30)}${owner ? `&owner_id=${owner}` : ''}` |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:68) |
| Calendar | Button | onClick=() => newAt(iso(view === 'jour' ? ref : new Date())) | Rendez-vous | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:69) |
| Calendar | Button | onClick=() => shift(-1) ; aria-label=Précédent |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:72) |
| Calendar | Button | onClick=() => setRef(new Date()) | Aujourd’hui | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:72) |
| Calendar | Button | onClick=() => shift(1) ; aria-label=Suivant |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:72) |
| Calendar | Segmented | label=Vue ; value=view ; onChange=setView ; options=[{ id: 'jour', label: 'Jour' }, { id: 'semaine', label: 'Semaine' }, { id: 'mois', label: 'Mois' }, { id: 'annee', label: 'Année' }, { id: 'frise', label: 'Frise' }] |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| Chip | Link | title=label ; to=e.link | {inner} | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:96) |
| Chip | button | title=label ; onClick=() => onOpen(e) | {inner} | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:97) |
| MonthGrid | button | onClick=() => onDay(iso(d)) ; aria-label=`Voir le ${d.toLocaleDateString('fr-FR')}` | {d.getDate()} | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:132) |
| MonthGrid | button | onClick=() => onDay(iso(d)) | + {items.length - 3} autre(s) | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:134) |
| YearGrid | button | onClick=() => onDay(iso(d)) ; aria-label=`${d.toLocaleDateString('fr-FR')} : ${n} élément(s)` | {d.getDate()} | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:157) |
| EventModal | Modal | title=edit.id ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous' |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:178) |
| EventModal | Button | onClick=() => onDelete(edit) | Supprimer | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:179) |
| EventModal | Button | onClick=() => setEdit(null) | Annuler | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:179) |
| EventModal | Button | onClick=submit | Enregistrer | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:179) |
| EventModal | Field | label=Intitulé ; required=true |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:181) |
| EventModal | Input | value=edit.title ; onChange=(e) => setEdit({ ...edit, title: e.target.value }) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:181) |
| EventModal | Field | label=Début ; required=true |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:182) |
| EventModal | Input | type=datetime-local ; value=edit.start ; onChange=(e) => setEdit({ ...edit, start: e.target.value }) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:182) |
| EventModal | Field | label=Fin ; required=true |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:183) |
| EventModal | Input | type=datetime-local ; value=edit.end ; onChange=(e) => setEdit({ ...edit, end: e.target.value }) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:183) |
| EventModal | Field | label=Catégorie |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:184) |
| EventModal | Select | value=edit.category ; onChange=(e) => setEdit({ ...edit, category: e.target.value }) ; options=Object.entries(EVENT_CATEGORY).map(([value, label]) => ({ value, label })) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:184) |
| EventModal | Field | label=Lieu |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:185) |
| EventModal | Input | value=edit.location ?? '' ; onChange=(e) => setEdit({ ...edit, location: e.target.value }) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:185) |
| EventModal | Field | label=Répétition |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:186) |
| EventModal | Select | value=edit.recurrence ; onChange=(e) => setEdit({ ...edit, recurrence: e.target.value }) ; options=[{ value: 'aucune', label: 'Aucune' }, { value: 'quotidienne', label: 'Chaque jour' }, { value: 'hebdomadaire', label: 'Chaque semaine' }, { value: 'mensuelle', label: 'Chaque mois' }, { value: 'annuelle', label: 'Chaque année' }] |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:186) |
| EventModal | Field | label=Jusqu’au |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:187) |
| EventModal | Input | type=date ; value=edit.recurrence_until ?? '' ; onChange=(e) => setEdit({ ...edit, recurrence_until: e.target.value }) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:187) |
| EventModal | Field | label=Rappel (minutes avant) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:188) |
| EventModal | Input | type=number ; value=edit.reminder_minutes ?? '' ; onChange=(e) => setEdit({ ...edit, reminder_minutes: e.target.value }) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:188) |
| EventModal | Field | label=Options |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:189) |
| EventModal | label |  | <input type="checkbox" checked={!!edit.all_day} onChange={(e) => setEdit({ ...edit, all_day: e.target.checked })} /> Toute la journée | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:190) |
| EventModal | input | type=checkbox ; onChange=(e) => setEdit({ ...edit, all_day: e.target.checked }) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:190) |
| EventModal | label |  | <input type="checkbox" checked={!!edit.is_private} onChange={(e) => setEdit({ ...edit, is_private: e.target.checked })} /> Privé (affiché « Occupé » aux délégués) | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:191) |
| EventModal | input | type=checkbox ; onChange=(e) => setEdit({ ...edit, is_private: e.target.checked }) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:191) |
| EventModal | Field | label=Notes |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:193) |
| EventModal | Textarea | value=edit.description ?? '' ; onChange=(e) => setEdit({ ...edit, description: e.target.value }) |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:193) |
| DeleteEvent | ConfirmModal | title=Supprimer ce rendez-vous ? |  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:201) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| newAt | title =  | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:59) |
| Calendar | id = jour | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| Calendar | label = Jour | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| Calendar | id = semaine | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| Calendar | label = Semaine | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| Calendar | id = mois | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| Calendar | label = Mois | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| Calendar | id = annee | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| Calendar | label = Année | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| Calendar | id = frise | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| Calendar | label = Frise | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:73) |
| EventModal | label = Aucune | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:186) |
| EventModal | label = Chaque jour | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:186) |
| EventModal | label = Chaque semaine | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:186) |
| EventModal | label = Chaque mois | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:186) |
| EventModal | label = Chaque année | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:186) |
| Calendar | useCan() | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:32) |
| Calendar | can('calendar', 'create') | [Calendar.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Calendar.tsx:69) |

## CampaignDetail.tsx — CRM-010

Source : [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [CampaignDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:17), [uploadProof](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:52).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/toast`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/Documents`, `./Maintenance`, `../components/Layout`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| CampaignDetail | ``/api/campaigns/${id}`` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:23) |
| CampaignDetail | `api.patch(`/api/campaigns/${id}`)` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:35) |
| CampaignDetail | ``/api/campaigns/${id}`` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:35) |
| CampaignDetail | `api.post(`/api/campaigns/${id}/accept`)` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:36) |
| CampaignDetail | ``/api/campaigns/${id}/accept`` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:36) |
| CampaignDetail | `api.put(`/api/campaigns/${id}/tasks/${t.id}`)` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:37) |
| CampaignDetail | ``/api/campaigns/${id}/tasks/${t.id}`` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:37) |
| CampaignDetail | `api.put(`/api/campaigns/${id}/costs/${c.id}`)` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:38) |
| CampaignDetail | ``/api/campaigns/${id}/costs/${c.id}`` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:38) |
| CampaignDetail | `api.post(`/api/campaigns/${id}/costs`)` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:38) |
| CampaignDetail | ``/api/campaigns/${id}/costs`` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:38) |
| CampaignDetail | `api.post('/api/reservations')` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:40) |
| CampaignDetail | `'/api/reservations'` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:40) |
| CampaignDetail | `api.post('/api/reservations/derogation')` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:43) |
| CampaignDetail | `'/api/reservations/derogation'` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:43) |
| CampaignDetail | `api.post(`/api/reservations/${rid}/cancel`)` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:44) |
| CampaignDetail | ``/api/reservations/${rid}/cancel`` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:44) |
| CampaignDetail | ``/api/supports?from=${res.start_date}&to=${res.end_date}`` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:45) |
| uploadProof | `'/api/documents'` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:58) |
| uploadProof | `api.post(`/api/campaigns/${c.id}/proofs`)` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:59) |
| uploadProof | ``/api/campaigns/${c.id}/proofs`` | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:59) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| CampaignDetail | Link | to=`/organisations/${c.organization_id}` | {c.organization_name} | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:69) |
| CampaignDetail | Link | to=`/contrats/${c.contract_id}` | {c.contract_ref} | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:69) |
| CampaignDetail | Link | to=`/opportunites/${c.opportunity_id}` | {c.opportunity_ref} | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:69) |
| CampaignDetail | Button | onClick=() => ai.open({ context_type: 'campaign', context_id: c.id, prompt: 'Fais le point sur l’exécution de cette campagne' }) | Point IA | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:71) |
| CampaignDetail | Button | onClick=() => setModal('accept') | Accepter la passation | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:72) |
| CampaignDetail | Button | onClick=() => upd.run({ status: next }) | Passer à « {({ production: 'Production', pose: 'Pose', en_cours: 'En cours', depose: 'Dépose', terminee: 'Terminée' } as any)[next]} » | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:73) |
| CampaignDetail | Button | onClick=() => { setBilan({ closing_report: c.closing_report ?? '', lessons: c.lessons ?? '', satisfaction: c.satisfaction ?? '' }); setModal('close'); } | Bilan et clôture | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:74) |
| CampaignDetail | Tabs | value=tab ; onChange=setTab ; tabs=[{ id: 'execution', label: 'Faces et preuves', count: d.reservations.length }, { id: 'tasks', label: 'Planning des tâches', count: d.tasks.length }, { id: 'costs', label: 'Coûts', count: d.costs.length }, { id: 'docs', label: 'Documents' }, { id: 'info', label: 'Dossier' }] |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | Button | onClick=() => setModal('proof') | Ajouter une preuve | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:93) |
| CampaignDetail | Button | onClick=() => { setRes({ face_id: '', start_date: c.start_date, end_date: c.end_date, reason: '' }); setConflict(null); setModal('reserve'); } | Réserver une face | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:94) |
| CampaignDetail | DataTable | columns=[                 { key: 'f', label: 'Face', render: (x: any) => <><div className="cell-title">{x.support_code}-{x.face_code}</div><div className="cell-sub">{x.support_name} · {x.commune}</div></> },                 { key: 'p', label: 'Période', render: (x: any) => <span className="small nowrap">{date(x.start_date)} → {date(x.end_date)}</span> },                 { key: 's', label: 'Réservation', render: (x: any) => <div className="row-wrap"><Status kind="face" code={x.status} />{x.derogation_reason && <Badge tone="warning">Dérogation</Badge>}</div> },                 { key: 'pr', label: 'Preuve de pose', render: (x: any) => { const p = d.proofs.find((y: any) => y.face_id === x.face_id && y.kind === 'pose'); return p ? <Badge tone={p.status === 'conforme' ? 'success' : 'danger'}>{p.status === 'conforme' ? `Conforme · ${date(p.taken_at)}` : p.status.replace('_', ' ')}</Badge> : <Badge tone="warning">Manquante</Badge>; } },                 { key: 'x', label: '', render: (x: any) => canUpd && <Button size="sm" variant="ghost" iconOnly aria-label="Annuler la réservation" icon={<Trash2 />} onClick={() => cancelRes.run(x.id)} /> },               ] |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:95) |
| CampaignDetail | Button | onClick=() => cancelRes.run(x.id) ; aria-label=Annuler la réservation |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:101) |
| CampaignDetail | a | onClick=(e) => { if (!fileUrl(p.document_id)) demoNotice(e); } ; href=fileUrl(p.document_id) ?? '#' | <img src={fileUrl(p.document_id)} alt={`Preuve ${p.kind} ${p.support_code ?? ''}-${p.face_code ?? ''}`} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', background: 'var(--surface-sunken)' }} loading="lazy" /> | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:108) |
| CampaignDetail | Button | onClick=() => setModal('ticket') | Ouvrir un ticket | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:119) |
| CampaignDetail | DataTable | columns=[                 { key: 't', label: 'Intervention', render: (x: any) => <Link to={`/maintenance/${x.id}`}>{x.ref} — {x.title}</Link> },                 { key: 's', label: 'Statut', render: (x: any) => <Status kind="intervention" code={x.status} /> },                 { key: 'p', label: 'Priorité', render: (x: any) => <Status kind="priority" code={x.priority} /> },               ] |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:120) |
| CampaignDetail | Link | to=`/maintenance/${x.id}` | {x.ref} — {x.title} | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:121) |
| CampaignDetail | DataTable | columns=[             { key: 'k', label: 'Étape', render: (t: any) => <Badge tone="neutral" dot={false}>{CTASK_KIND[t.kind]}</Badge>, width: 110 },             { key: 'l', label: 'Tâche', render: (t: any) => <><div className="cell-title">{t.label}</div>{t.comment && <div className="cell-sub">{t.comment}</div>}</> },             { key: 'd', label: 'Échéance', render: (t: any) => <span className="small nowrap" style={t.due_date && t.due_date < new Date().toISOString().slice(0, 10) && !['termine', 'annule'].includes(t.status) ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{date(t.due_date)}</span> },             { key: 'a', label: 'Responsable', render: (t: any) => canUpd ? <Select aria-label="Responsable" value={t.assigned_to ?? ''} onChange={(e) => task.run({ ...t, assigned_to: e.target.value \|\| null })} placeholder="—" options={users.filter((u) => ['operations', 'technicien'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name }))} style={{ height: 30, width: 170 }} /> : <span className="small">{t.assigned_name ?? '—'}</span>, mobile: 'hide' },             { key: 's', label: 'Statut', render: (t: any) => canUpd ? <Select aria-label="Statut" value={t.status} onChange={(e) => { const v = e.target.value; if (v === 'bloque') setBlocked(t); else task.run({ ...t, status: v }); }} options={[{ value: 'a_faire', label: 'À faire' }, { value: 'en_cours', label: 'En cours' }, { value: 'termine', label: 'Terminé' }, { value: 'bloque', label: 'Bloqué' }, { value: 'annule', label: 'Annulé' }]} style={{ height: 30, width: 130 }} /> : <Status kind="ctask" code={t.status} /> },           ] |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:131) |
| CampaignDetail | Select | placeholder=— ; value=t.assigned_to ?? '' ; onChange=(e) => task.run({ ...t, assigned_to: e.target.value \|\| null }) ; options=users.filter((u) => ['operations', 'technicien'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name })) ; aria-label=Responsable |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:135) |
| CampaignDetail | Select | value=t.status ; onChange=(e) => { const v = e.target.value; if (v === 'bloque') setBlocked(t); else task.run({ ...t, status: v }); } ; options=[{ value: 'a_faire', label: 'À faire' }, { value: 'en_cours', label: 'En cours' }, { value: 'termine', label: 'Terminé' }, { value: 'bloque', label: 'Bloqué' }, { value: 'annule', label: 'Annulé' }] ; aria-label=Statut |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:136) |
| CampaignDetail | Button | onClick=() => setCost({ category: 'impression', label: '', planned: null, actual: null, supplier: '' }) | Ajouter un coût | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:141) |
| CampaignDetail | DataTable | columns=[               { key: 'c', label: 'Poste', render: (x: any) => <><div className="cell-title">{x.label}</div><div className="cell-sub">{COST_CATEGORY[x.category]}{x.supplier ? ` · ${x.supplier}` : ''}</div></> },               { key: 'p', label: 'Prévu', num: true, render: (x: any) => money(x.planned) },               { key: 'a', label: 'Réel', num: true, render: (x: any) => x.actual === null ? <Badge tone="warning">À saisir</Badge> : money(x.actual) },               { key: 'e', label: 'Écart', num: true, render: (x: any) => x.actual === null \|\| x.planned === null ? '—' : <span style={{ color: x.actual > x.planned ? 'var(--danger)' : 'var(--success)' }}>{x.actual > x.planned ? '+' : ''}{money(x.actual - x.planned)}</span> },             ] |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:142) |
| CampaignDetail | Documents | entityType=campaign ; entityId=c.id ; kinds=['autre', 'photo', 'pv', 'attestation'] |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:151) |
| CampaignDetail | Field | label=Statut de la création |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:155) |
| CampaignDetail | Select | value=c.creative_status ; onChange=(e) => upd.run({ creative_status: e.target.value }) ; options=[{ value: 'attendue', label: 'Attendue' }, { value: 'recue', label: 'Reçue' }, { value: 'validee', label: 'Validée (BAT)' }, { value: 'imprimee', label: 'Imprimée' }] |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:155) |
| CampaignDetail | Modal | title=Accepter la passation |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:160) |
| CampaignDetail | Button | onClick=() => setModal(null) | Annuler | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:161) |
| CampaignDetail | Button | onClick=() => accept.run(undefined) | Accepter le dossier | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:161) |
| CampaignDetail | Field | label=Responsable opérationnel |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:164) |
| CampaignDetail | Select | placeholder=— ; value=handover.ops_owner_id ; onChange=(e) => setHandover({ ...handover, ops_owner_id: e.target.value }) ; options=users.filter((u) => u.role_code === 'operations').map((u) => ({ value: u.id, label: u.full_name })) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:164) |
| CampaignDetail | Field | label=Notes |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:165) |
| CampaignDetail | Textarea | value=handover.notes ; onChange=(e) => setHandover({ ...handover, notes: e.target.value }) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:165) |
| CampaignDetail | Modal | title=Réserver une face |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:168) |
| CampaignDetail | Button | onClick=() => setModal(null) | Annuler | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:169) |
| CampaignDetail | Button | onClick=() => derog.run(undefined) | Demander une dérogation | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:170) |
| CampaignDetail | Button | onClick=() => reserve.run(undefined) | Réserver | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:171) |
| CampaignDetail | Field | label=Du |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:174) |
| CampaignDetail | Input | type=date ; value=res.start_date ; onChange=(e) => { setRes({ ...res, start_date: e.target.value }); setConflict(null); } |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:174) |
| CampaignDetail | Field | label=Au |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:175) |
| CampaignDetail | Input | type=date ; value=res.end_date ; onChange=(e) => { setRes({ ...res, end_date: e.target.value }); setConflict(null); } |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:175) |
| CampaignDetail | Field | label=Face |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:177) |
| CampaignDetail | Select | placeholder=Choisir… ; value=res.face_id ; onChange=(e) => { setRes({ ...res, face_id: e.target.value }); setConflict(null); } ; options=(faces.data?.rows ?? []).flatMap((s: any) => s.faces.map((f: any) => ({ value: f.id, label: `${s.code}-${f.code} · ${s.name} — ${({ disponible: 'disponible', pre_reserve: 'pré-réservée', reserve: 'réservée', occupe: 'occupée', en_maintenance: 'en maintenance', indisponible: 'indisponible' } as any)[f.state]}` }))) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:177) |
| CampaignDetail | Field | label=Justification de la dérogation ; required=true |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:179) |
| CampaignDetail | Textarea | value=res.reason ; onChange=(e) => setRes({ ...res, reason: e.target.value }) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:179) |
| CampaignDetail | Modal | title=Ajouter une preuve d’exécution |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:183) |
| CampaignDetail | Field | label=Type |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:186) |
| CampaignDetail | Select | value=proof.kind ; onChange=(e) => setProof({ ...proof, kind: e.target.value }) ; options=[{ value: 'pose', label: 'Pose' }, { value: 'controle', label: 'Contrôle' }, { value: 'depose', label: 'Dépose' }, { value: 'incident', label: 'Incident' }] |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:186) |
| CampaignDetail | Field | label=Constat |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:187) |
| CampaignDetail | Select | value=proof.status ; onChange=(e) => setProof({ ...proof, status: e.target.value }) ; options=[{ value: 'conforme', label: 'Conforme' }, { value: 'non_conforme', label: 'Non conforme' }, { value: 'a_reprendre', label: 'À reprendre' }] |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:187) |
| CampaignDetail | Field | label=Face |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:188) |
| CampaignDetail | Select | placeholder=— ; value=proof.face_id ; onChange=(e) => setProof({ ...proof, face_id: e.target.value }) ; options=d.reservations.map((x: any) => ({ value: x.face_id, label: `${x.support_code}-${x.face_code} · ${x.support_name}` })) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:188) |
| CampaignDetail | Field | label=Commentaire terrain ; required=proof.status !== 'conforme' |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:189) |
| CampaignDetail | Textarea | value=proof.comment ; onChange=(e) => setProof({ ...proof, comment: e.target.value }) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:189) |
| CampaignDetail | input | type=file ; onChange=(e) => e.target.files?.[0] && uploadProof(e.target.files[0]) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:191) |
| CampaignDetail | Button | onClick=() => fileRef.current?.click() | Prendre / choisir la photo | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:192) |
| CampaignDetail | Modal | title=cost?.id ? 'Modifier le coût' : 'Ajouter un coût' |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:195) |
| CampaignDetail | Button | onClick=() => setCost(null) | Annuler | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:195) |
| CampaignDetail | Button | onClick=() => saveCost.run({ ...cost, planned: cost.planned ?? 0 }) | Enregistrer | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:195) |
| CampaignDetail | Field | label=Catégorie |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:197) |
| CampaignDetail | Select | value=cost.category ; onChange=(e) => setCost({ ...cost, category: e.target.value }) ; options=Object.entries(COST_CATEGORY).map(([value, label]) => ({ value, label })) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:197) |
| CampaignDetail | Field | label=Fournisseur |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:198) |
| CampaignDetail | Input | value=cost.supplier ?? '' ; onChange=(e) => setCost({ ...cost, supplier: e.target.value }) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:198) |
| CampaignDetail | Field | label=Libellé ; required=true |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:199) |
| CampaignDetail | Input | value=cost.label ; onChange=(e) => setCost({ ...cost, label: e.target.value }) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:199) |
| CampaignDetail | Field | label=Montant prévu |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:200) |
| CampaignDetail | MoneyInput | value=cost.planned ; onChange=(v) => setCost({ ...cost, planned: v }) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:200) |
| CampaignDetail | Field | label=Montant réel |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:201) |
| CampaignDetail | MoneyInput | value=cost.actual ; onChange=(v) => setCost({ ...cost, actual: v }) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:201) |
| CampaignDetail | Modal | title=Bilan et clôture de la campagne |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:204) |
| CampaignDetail | Button | onClick=() => setModal(null) | Annuler | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:205) |
| CampaignDetail | Button | onClick=() => upd.run({ status: 'cloturee', closing_report: bilan.closing_report, lessons: bilan.lessons \|\| undefined, satisfaction: bilan.satisfaction ? Number(bilan.satisfaction) : undefined }) | Clôturer | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:205) |
| CampaignDetail | Field | label=Bilan (supports livrés, périodes, écarts, incidents) ; required=true |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:208) |
| CampaignDetail | Textarea | value=bilan.closing_report ; onChange=(e) => setBilan({ ...bilan, closing_report: e.target.value }) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:208) |
| CampaignDetail | Field | label=Enseignements pour les prochaines campagnes |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:209) |
| CampaignDetail | Textarea | value=bilan.lessons ; onChange=(e) => setBilan({ ...bilan, lessons: e.target.value }) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:209) |
| CampaignDetail | Field | label=Satisfaction client (1 à 5) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:210) |
| CampaignDetail | Select | placeholder=— ; value=String(bilan.satisfaction) ; onChange=(e) => setBilan({ ...bilan, satisfaction: e.target.value }) ; options=[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}/5` })) |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:210) |
| CampaignDetail | ConfirmModal | title=Tâche bloquée |  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:215) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| CampaignDetail | label = Campagnes | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:67) |
| CampaignDetail | id = execution | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | label = Faces et preuves | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | id = tasks | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | label = Planning des tâches | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | id = costs | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | label = Coûts | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | id = docs | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | label = Documents | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | id = info | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | label = Dossier | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:89) |
| CampaignDetail | key = f | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:97) |
| CampaignDetail | label = Face | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:97) |
| CampaignDetail | key = p | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:98) |
| CampaignDetail | label = Période | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:98) |
| CampaignDetail | key = s | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:99) |
| CampaignDetail | label = Réservation | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:99) |
| CampaignDetail | key = pr | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:100) |
| CampaignDetail | label = Preuve de pose | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:100) |
| CampaignDetail | key = x | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:101) |
| CampaignDetail | label =  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:101) |
| CampaignDetail | key = t | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:121) |
| CampaignDetail | label = Intervention | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:121) |
| CampaignDetail | key = s | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:122) |
| CampaignDetail | label = Statut | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:122) |
| CampaignDetail | key = p | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:123) |
| CampaignDetail | label = Priorité | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:123) |
| CampaignDetail | key = k | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:132) |
| CampaignDetail | label = Étape | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:132) |
| CampaignDetail | key = l | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:133) |
| CampaignDetail | label = Tâche | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:133) |
| CampaignDetail | key = d | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:134) |
| CampaignDetail | label = Échéance | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:134) |
| CampaignDetail | key = a | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:135) |
| CampaignDetail | label = Responsable | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:135) |
| CampaignDetail | key = s | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:136) |
| CampaignDetail | label = Statut | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:136) |
| CampaignDetail | label = À faire | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:136) |
| CampaignDetail | label = En cours | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:136) |
| CampaignDetail | label = Terminé | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:136) |
| CampaignDetail | label = Bloqué | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:136) |
| CampaignDetail | label = Annulé | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:136) |
| CampaignDetail | label =  | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:141) |
| CampaignDetail | key = c | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:144) |
| CampaignDetail | label = Poste | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:144) |
| CampaignDetail | key = p | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:145) |
| CampaignDetail | label = Prévu | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:145) |
| CampaignDetail | key = a | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:146) |
| CampaignDetail | label = Réel | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:146) |
| CampaignDetail | key = e | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:147) |
| CampaignDetail | label = Écart | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:147) |
| CampaignDetail | label = Attendue | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:155) |
| CampaignDetail | label = Reçue | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:155) |
| CampaignDetail | label = Validée (BAT) | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:155) |
| CampaignDetail | label = Imprimée | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:155) |
| CampaignDetail | label = Pose | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:186) |
| CampaignDetail | label = Contrôle | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:186) |
| CampaignDetail | label = Dépose | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:186) |
| CampaignDetail | label = Incident | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:186) |
| CampaignDetail | label = Conforme | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:187) |
| CampaignDetail | label = Non conforme | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:187) |
| CampaignDetail | label = À reprendre | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:187) |
| CampaignDetail | label = Motif du blocage | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:215) |
| CampaignDetail | useCan() | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:19) |
| CampaignDetail | can('campaigns', 'update') | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:50) |
| CampaignDetail | can('ai') | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:71) |
| CampaignDetail | can('campaigns', 'validate') | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:72) |
| CampaignDetail | can('interventions', 'create') | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:118) |
| CampaignDetail | can('interventions', 'create') | [CampaignDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CampaignDetail.tsx:119) |

## Campaigns.tsx — CRM-009

Source : [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [CampaignForm](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:11), [set](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:17), [Campaigns (export)](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:33), [set](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:42).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| CampaignForm | ``/api/organizations?pageSize=30&q=${encodeURIComponent(orgQ)}`` | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:14) |
| CampaignForm | `api.post('/api/campaigns')` | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:16) |
| CampaignForm | `'/api/campaigns'` | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:16) |
| Campaigns | ``/api/campaigns${qs(params)}`` | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:41) |
| Campaigns | ``/api/campaigns${qs({ ...params, format: 'xlsx' })}`` | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:46) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| CampaignForm | Modal | title=Nouvelle campagne |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:19) |
| CampaignForm | Button | onClick=onClose | Annuler | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:20) |
| CampaignForm | Button | onClick=() => save.run(undefined) | Créer | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:20) |
| CampaignForm | Field | label=Nom ; required=true |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:22) |
| CampaignForm | Input | value=f.name ; onChange=set('name') |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:22) |
| CampaignForm | Field | label=Annonceur ; required=true |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:23) |
| CampaignForm | Input | placeholder=Rechercher… ; value=orgQ ; onChange=(e) => setOrgQ(e.target.value) ; aria-label=Rechercher |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:23) |
| CampaignForm | Select | placeholder=Choisir… ; value=f.organization_id ; onChange=set('organization_id') ; options=(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: o.legal_name })) |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:23) |
| CampaignForm | Field | label=Début ; required=true |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:24) |
| CampaignForm | Input | type=date ; value=f.start_date ; onChange=set('start_date') |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:24) |
| CampaignForm | Field | label=Fin ; required=true |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:25) |
| CampaignForm | Input | type=date ; value=f.end_date ; onChange=set('end_date') |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:25) |
| CampaignForm | Field | label=Budget vendu HT |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:26) |
| CampaignForm | MoneyInput | value=f.budget_ht ; onChange=set('budget_ht') |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:26) |
| CampaignForm | Field | label=Objectifs |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:27) |
| CampaignForm | Textarea | value=f.objectives ; onChange=set('objectives') |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:27) |
| Campaigns | ExcelButton | url=`/api/campaigns${qs({ ...params, format: 'xlsx' })}` |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:46) |
| Campaigns | Button | onClick=() => setCreate(true) | Nouvelle campagne | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:47) |
| Campaigns | Segmented | label=Statut ; value=status ; onChange=(v) => set({ status: v }) ; options=[{ id: 'actives', label: 'En cours' }, { id: 'a_accepter', label: 'Passation à accepter' }, { id: 'terminee', label: 'Bilan à faire' }, { id: 'cloturee', label: 'Clôturées' }, { id: '', label: 'Toutes' }] |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | form | onSubmit=(e) => { e.preventDefault(); set({ q }); } |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:50) |
| Campaigns | Input | placeholder=Campagne, annonceur, référence… ; value=q ; onChange=(e) => setQ(e.target.value) ; aria-label=Rechercher |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:50) |
| Campaigns | DataTable | columns=[             { key: 'n', label: 'Campagne', render: (c: any) => <><div className="cell-title">{c.name}</div><div className="cell-sub">{c.ref} · {c.organization_name}</div></> },             { key: 's', label: 'Statut', render: (c: any) => <div className="row-wrap"><Status kind="campaign" code={c.status} />{c.late_tasks > 0 && <Badge tone="danger">{c.late_tasks} tâche(s) en retard</Badge>}</div> },             { key: 'p', label: 'Période', render: (c: any) => <span className="small nowrap">{date(c.start_date)} → {date(c.end_date)}</span> },             { key: 'e', label: 'Exécution', render: (c: any) => <span className="small num">{c.faces_done}/{c.faces_planned} faces posées</span>, mobile: 'hide' },             { key: 'b', label: 'Budget HT', num: true, render: (c: any) => money(c.budget_ht), mobile: 'hide' },             { key: 'o', label: 'Responsable ops', render: (c: any) => <span className="small">{c.ops_owner_name ?? '—'}</span>, mobile: 'hide' },           ] |  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:53) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| CampaignForm | name =  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:15) |
| Campaigns | id = actives | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | label = En cours | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | id = a_accepter | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | label = Passation à accepter | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | id = terminee | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | label = Bilan à faire | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | id = cloturee | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | label = Clôturées | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | id =  | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | label = Toutes | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:49) |
| Campaigns | key = n | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:55) |
| Campaigns | label = Campagne | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:55) |
| Campaigns | key = s | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:56) |
| Campaigns | label = Statut | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:56) |
| Campaigns | key = p | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:57) |
| Campaigns | label = Période | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:57) |
| Campaigns | key = e | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:58) |
| Campaigns | label = Exécution | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:58) |
| Campaigns | key = b | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:59) |
| Campaigns | label = Budget HT | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:59) |
| Campaigns | key = o | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:60) |
| Campaigns | label = Responsable ops | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:60) |
| Campaigns | useCan() | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:35) |
| Campaigns | can('campaigns', 'export') | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:46) |
| Campaigns | can('campaigns', 'create') | [Campaigns.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Campaigns.tsx:47) |

## ClientRanking.tsx — CRM-013

Source : [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Score](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:18), [ClientRanking (export)](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:24).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/auth`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| ClientRanking | ``/api/clients/classification?from=${from}&to=${today()}`` | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:33) |
| ClientRanking | ``/api/xlsx/clients-classification?from=${from}&to=${today()}`` | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| ClientRanking | Segmented | label=Période ; value=range ; onChange=setRange ; options=[{ id: '3m', label: '3 mois' }, { id: 'ytd', label: 'Année en cours' }, { id: '12m', label: '12 mois' }, { id: '24m', label: '24 mois' }] |  | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |
| ClientRanking | ExcelButton | url=`/api/xlsx/clients-classification?from=${from}&to=${today()}` |  | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |
| ClientRanking | button | onClick=() => setCat(cat === s.category ? '' : s.category) | <span className="cat-count">{s.count}</span> <span className="cat-label">{c.label}</span> <span className="xsmall muted">{moneyShort(s.revenue)}</span> <span className="xsmall">{c.hint}</span> | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:44) |
| ClientRanking | button | onClick=() => setAbc(abc === a.abc ? '' : a.abc) | <strong>{a.abc}</strong> {a.count} client(s) · {moneyShort(a.revenue)} | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:52) |
| ClientRanking | Input | placeholder=Rechercher un client… ; value=qy ; onChange=(e) => setQy(e.target.value) ; aria-label=Rechercher |  | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:57) |
| ClientRanking | Select | placeholder=Toutes catégories ; value=cat ; onChange=(e) => setCat(e.target.value) ; options=Object.entries(CLIENT_CATEGORY).map(([value, c]) => ({ value, label: c.label })) ; aria-label=Catégorie |  | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:57) |
| ClientRanking | Select | placeholder=Classes A, B, C ; value=abc ; onChange=(e) => setAbc(e.target.value) ; options=['A', 'B', 'C'].map((x) => ({ value: x, label: `Classe ${x}` })) ; aria-label=Classe |  | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:57) |
| ClientRanking | DataTable | columns=[             { key: 'n', label: 'Client', render: (x: any) => <><div className="cell-title">{x.legal_name}</div><div className="cell-sub">{x.sector ? label('sector', x.sector) : '—'}{x.owner_name ? ` · ${x.owner_name}` : ''}</div></> },             { key: 'c', label: 'Catégorie', render: (x: any) => <Badge tone={CLIENT_CATEGORY[x.category].tone}>{CLIENT_CATEGORY[x.category].label}</Badge> },             { key: 'a', label: 'ABC', render: (x: any) => <span className={`abc-chip abc-${x.abc}`}>{x.abc}</span> },             { key: 'r', label: 'CA période', num: true, render: (x: any) => <>{money(x.revenue)}<div className="cell-sub">{pct(x.share_pct)} du total</div></> },             { key: 's', label: 'Score global', render: (x: any) => <Score v={x.score} /> },             { key: 'rl', label: 'Relation', render: (x: any) => <span title={`${x.activities_90d} activité(s) en 90 j · dernier contact ${x.last_contact ? date(x.last_contact) : 'jamais'} · ${x.complaints_open} réclamation(s)`}><Score v={x.relation_score} /></span>, mobile: 'hide' },             { key: 'p', label: 'Paiements', render: (x: any) => <span title={x.invoices_count ? `${x.on_time_pct ?? '—'} % à l’échéance · retard moyen ${x.avg_days_late ?? 0} j` : 'Pas d’historique de facturation'}><Score v={x.payment_score} /></span>, mobile: 'hide' },             { key: 'sv', label: 'Solvabilité', render: (x: any) => <span title={`Échu : ${money(x.overdue_amount)} dont > 90 j : ${money(x.overdue_90)}`}><Score v={x.solvency_score} /></span>, mobile: 'hide' },           ] |  | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:58) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| (partagé / module) | label = Stratégique | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:11) |
| (partagé / module) | label = Fidèle | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:12) |
| (partagé / module) | label = À développer | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:13) |
| (partagé / module) | label = À risque | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:14) |
| (partagé / module) | label = Dormant | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:15) |
| ClientRanking | id = 3m | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |
| ClientRanking | label = 3 mois | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |
| ClientRanking | id = ytd | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |
| ClientRanking | label = Année en cours | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |
| ClientRanking | id = 12m | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |
| ClientRanking | label = 12 mois | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |
| ClientRanking | id = 24m | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |
| ClientRanking | label = 24 mois | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |
| ClientRanking | key = n | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:59) |
| ClientRanking | label = Client | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:59) |
| ClientRanking | key = c | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:60) |
| ClientRanking | label = Catégorie | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:60) |
| ClientRanking | key = a | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:61) |
| ClientRanking | label = ABC | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:61) |
| ClientRanking | key = r | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:62) |
| ClientRanking | label = CA période | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:62) |
| ClientRanking | key = s | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:63) |
| ClientRanking | label = Score global | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:63) |
| ClientRanking | key = rl | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:64) |
| ClientRanking | label = Relation | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:64) |
| ClientRanking | key = p | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:65) |
| ClientRanking | label = Paiements | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:65) |
| ClientRanking | key = sv | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:66) |
| ClientRanking | label = Solvabilité | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:66) |
| ClientRanking | useCan() | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:31) |
| ClientRanking | can('organizations', 'export') | [ClientRanking.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ClientRanking.tsx:38) |

## CompanyWorkspace.tsx — CRM-024

Source : [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [CompanyWorkspace (export)](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:16).

Dépendances locales : `../lib/hooks`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/work`, `./Projects`, `../components/ProcessFlow`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| CompanyWorkspace | `'/api/workspace/company'` | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:19) |
| CompanyWorkspace | ``/api/projects/${open}`` | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:23) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| CompanyWorkspace | Button | onClick=() => setCreating(true) | Nouveau projet | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:35) |
| CompanyWorkspace | Segmented | label=Filtre ; value=filter ; onChange=setFilter ; options=[{ id: 'actifs', label: 'En cours' }, { id: 'mine', label: 'Où j’interviens' }, { id: 'tous', label: 'Tous' }] |  | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:43) |
| CompanyWorkspace | button | onClick=() => nav(`/projets/${p.id}`) | {p.name} | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:49) |
| CompanyWorkspace | Button | onClick=() => setOpen(open === p.id ? null : p.id) | {open === p.id ? 'Masquer la frise' : 'Voir la frise'} | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:61) |
| CompanyWorkspace | Button | onClick=() => nav(`/projets/${p.id}`) | Ouvrir le projet | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:61) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| CompanyWorkspace | id = actifs | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:43) |
| CompanyWorkspace | label = En cours | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:43) |
| CompanyWorkspace | id = mine | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:43) |
| CompanyWorkspace | label = Où j’interviens | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:43) |
| CompanyWorkspace | id = tous | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:43) |
| CompanyWorkspace | label = Tous | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:43) |
| CompanyWorkspace | useCan() | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:17) |
| CompanyWorkspace | can('projects', 'create') | [CompanyWorkspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/CompanyWorkspace.tsx:35) |

## Complaints.tsx — CRM-053

Source : [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Complaints (export)](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:11), [submit](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:21).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Complaints | ``/api/complaints${open ? '?open=1' : ''}`` | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:16) |
| Complaints | ``/api/organizations?pageSize=30&q=${encodeURIComponent(orgQ)}`` | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:19) |
| Complaints | `api.put(`/api/complaints/${edit.id}`)` | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:20) |
| Complaints | ``/api/complaints/${edit.id}`` | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:20) |
| Complaints | `api.post('/api/complaints')` | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:20) |
| Complaints | `'/api/complaints'` | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:20) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Complaints | Button | onClick=() => setEdit({ organization_id: '', subject: '', description: '', category: 'autre', severity: 'normale', owner_id: '', due_date: addDays(today(), 5), status: 'ouverte' }) | Nouvelle réclamation | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:25) |
| Complaints | Segmented | label=Filtre ; value=open ; onChange=setOpen ; options=[{ id: '1', label: 'Ouvertes' }, { id: '', label: 'Toutes' }] |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:26) |
| Complaints | DataTable | columns=[             { key: 's', label: 'Réclamation', render: (x: any) => <><div className="cell-title">{x.subject}</div><div className="cell-sub">{x.ref} · <Link to={`/organisations/${x.organization_id}`} onClick={(e) => e.stopPropagation()}>{x.organization_name}</Link>{x.campaign_ref ? ` · ${x.campaign_ref}` : ''}</div></> },             { key: 'c', label: 'Catégorie', render: (x: any) => <span className="small">{label('complaint_category', x.category)}</span>, mobile: 'hide' },             { key: 'g', label: 'Gravité', render: (x: any) => <Badge tone={x.severity === 'haute' ? 'danger' : x.severity === 'normale' ? 'warning' : 'neutral'}>{x.severity}</Badge> },             { key: 'd', label: 'Échéance', render: (x: any) => <span className="small" style={x.is_late ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{date(x.due_date)}{x.is_late ? ' · en retard' : ''}</span> },             { key: 'st', label: 'Statut', render: (x: any) => <Status kind="complaint" code={x.status} /> },             { key: 'o', label: 'Responsable', render: (x: any) => <span className="small">{x.owner_name}</span>, mobile: 'hide' },           ] |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:28) |
| Complaints | Link | onClick=(e) => e.stopPropagation() ; to=`/organisations/${x.organization_id}` | {x.organization_name} | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:30) |
| Complaints | Modal | title=edit?.id ? `Réclamation ${edit.ref}` : 'Nouvelle réclamation' |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:38) |
| Complaints | Button | onClick=() => setEdit(null) | Annuler | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:39) |
| Complaints | Button | onClick=submit | Enregistrer | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:39) |
| Complaints | Field | label=Client ; required=true |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:41) |
| Complaints | Input | placeholder=Rechercher… ; value=orgQ ; onChange=(e) => setOrgQ(e.target.value) ; aria-label=Rechercher |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:41) |
| Complaints | Select | placeholder=Choisir… ; value=edit.organization_id ; onChange=(e) => setEdit({ ...edit, organization_id: e.target.value }) ; options=(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: o.legal_name })) |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:41) |
| Complaints | Field | label=Objet ; required=true |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:42) |
| Complaints | Input | value=edit.subject ; onChange=(e) => setEdit({ ...edit, subject: e.target.value }) |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:42) |
| Complaints | Field | label=Catégorie |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:43) |
| Complaints | Select | value=edit.category ; onChange=(e) => setEdit({ ...edit, category: e.target.value }) ; options=(lookups.complaint_category ?? []).map((x) => ({ value: x.code, label: x.label })) |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:43) |
| Complaints | Field | label=Gravité |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:44) |
| Complaints | Select | value=edit.severity ; onChange=(e) => setEdit({ ...edit, severity: e.target.value }) ; options=[{ value: 'basse', label: 'Basse' }, { value: 'normale', label: 'Normale' }, { value: 'haute', label: 'Haute' }] |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:44) |
| Complaints | Field | label=Responsable |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:45) |
| Complaints | Select | placeholder=Moi ; value=edit.owner_id ?? '' ; onChange=(e) => setEdit({ ...edit, owner_id: e.target.value }) ; options=users.map((u) => ({ value: u.id, label: u.full_name })) |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:45) |
| Complaints | Field | label=Échéance de traitement |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:46) |
| Complaints | Input | type=date ; value=edit.due_date ; onChange=(e) => setEdit({ ...edit, due_date: e.target.value }) |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:46) |
| Complaints | Field | label=Description |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:47) |
| Complaints | Textarea | value=edit.description ; onChange=(e) => setEdit({ ...edit, description: e.target.value }) |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:47) |
| Complaints | Field | label=Statut |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:48) |
| Complaints | Select | value=edit.status ; onChange=(e) => setEdit({ ...edit, status: e.target.value }) ; options=[{ value: 'ouverte', label: 'Ouverte' }, { value: 'en_cours', label: 'En cours' }, { value: 'resolue', label: 'Résolue' }, { value: 'close', label: 'Close' }] |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:48) |
| Complaints | Field | label=Résolution ; required=['resolue', 'close'].includes(edit.status) |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:49) |
| Complaints | Textarea | value=edit.resolution ?? '' ; onChange=(e) => setEdit({ ...edit, resolution: e.target.value }) |  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:49) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Complaints | id = 1 | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:26) |
| Complaints | label = Ouvertes | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:26) |
| Complaints | id =  | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:26) |
| Complaints | label = Toutes | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:26) |
| Complaints | key = s | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:30) |
| Complaints | label = Réclamation | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:30) |
| Complaints | key = c | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:31) |
| Complaints | label = Catégorie | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:31) |
| Complaints | key = g | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:32) |
| Complaints | label = Gravité | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:32) |
| Complaints | key = d | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:33) |
| Complaints | label = Échéance | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:33) |
| Complaints | key = st | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:34) |
| Complaints | label = Statut | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:34) |
| Complaints | key = o | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:35) |
| Complaints | label = Responsable | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:35) |
| Complaints | label = Basse | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:44) |
| Complaints | label = Normale | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:44) |
| Complaints | label = Haute | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:44) |
| Complaints | label = Ouverte | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:48) |
| Complaints | label = En cours | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:48) |
| Complaints | label = Résolue | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:48) |
| Complaints | label = Close | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:48) |
| Complaints | useCan() | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:12) |
| Complaints | can('complaints', 'create') | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:25) |
| Complaints | can('complaints', 'update') | [Complaints.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Complaints.tsx:28) |

## ContractDetail.tsx — CRM-018

Source : [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [ContractDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:17), [run](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:35).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/Documents`, `./Contracts`, `../components/Layout`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| ContractDetail | ``/api/contracts/${id}`` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:22) |
| ContractDetail | `api.post(`/api/contracts/${id}/workflow`)` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:27) |
| ContractDetail | ``/api/contracts/${id}/workflow`` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:27) |
| ContractDetail | `api.post(`/api/contracts/${id}/amendments`)` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:28) |
| ContractDetail | ``/api/contracts/${id}/amendments`` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:28) |
| ContractDetail | `api.post(`/api/amendments/${aid}/sign`)` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:29) |
| ContractDetail | ``/api/amendments/${aid}/sign`` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:29) |
| ContractDetail | `api.post(`/api/contracts/${id}/items`)` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:30) |
| ContractDetail | ``/api/contracts/${id}/items`` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:30) |
| ContractDetail | `api.put(`/api/contracts/${id}/items/${x.id}`)` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:31) |
| ContractDetail | ``/api/contracts/${id}/items/${x.id}`` | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:31) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| ContractDetail | Link | to=`/organisations/${c.organization_id}` | {d.organization.legal_name} | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:43) |
| ContractDetail | Button | onClick=() => ai.open({ context_type: 'contract', context_id: c.id, prompt: 'Résume les obligations et échéances de ce contrat' }) | Résumé IA | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:45) |
| ContractDetail | Button | onClick=() => setModal('edit') | Modifier | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:46) |
| ContractDetail | Button | onClick=() => run('soumettre_revue') | Soumettre en revue | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:47) |
| ContractDetail | Button | onClick=() => run('valider') | Valider pour signature | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:48) |
| ContractDetail | Button | onClick=() => setModal('sign') | Marquer comme signé | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:49) |
| ContractDetail | Button | onClick=() => setModal('amend') | Avenant | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:50) |
| ContractDetail | Select | placeholder=Décision… ; value= ; onChange=(e) => e.target.value && run('decision_renouvellement', { renewal_decision: e.target.value }) ; options=[{ value: 'renouveler', label: 'Renouveler' }, { value: 'renegocier', label: 'Renégocier' }, { value: 'ne_pas_renouveler', label: 'Ne pas renouveler' }] ; aria-label=Décision de renouvellement |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:55) |
| ContractDetail | Button | onClick=() => run('renouveler') | Créer le contrat de renouvellement | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:59) |
| ContractDetail | Textarea | placeholder=Commentaire (commencez par « Réserve » pour émettre une réserve) ; value=comment ; onChange=(e) => setComment(e.target.value) |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:64) |
| ContractDetail | Button | onClick=() => run('revue_juridique') | Enregistrer la revue juridique | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:64) |
| ContractDetail | Textarea | placeholder=Commentaire ; value=comment ; onChange=(e) => setComment(e.target.value) |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:66) |
| ContractDetail | Button | onClick=() => run('revue_financiere') | Enregistrer la revue financière | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:66) |
| ContractDetail | Button | onClick=() => setModal('item') | Ajouter | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:75) |
| ContractDetail | DataTable | columns=[                 { key: 'l', label: 'Pièce', render: (x: any) => <><div className="cell-title">{x.label}</div><div className="cell-sub">{ITEM_KIND[x.kind]}</div></> },                 { key: 'd', label: 'Échéance', render: (x: any) => <span className="small" style={x.due_date && x.due_date < today() && ['attendu', 'en_retard'].includes(x.status) ? { color: 'var(--danger)' } : undefined}>{date(x.due_date)}</span> },                 { key: 's', label: 'Statut', render: (x: any) => can('contracts', 'update') ? <Select aria-label="Statut de la pièce" value={x.status} onChange={(e) => updItem.run({ ...x, status: e.target.value })} options={Object.entries(ITEM_STATUS).map(([value, [label]]) => ({ value, label }))} style={{ height: 30, width: 140 }} /> : <Badge tone={ITEM_STATUS[x.status][1]}>{ITEM_STATUS[x.status][0]}</Badge> },               ] |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:76) |
| ContractDetail | Select | value=x.status ; onChange=(e) => updItem.run({ ...x, status: e.target.value }) ; options=Object.entries(ITEM_STATUS).map(([value, [label]]) => ({ value, label })) ; aria-label=Statut de la pièce |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:80) |
| ContractDetail | DataTable | columns=[                 { key: 'n', label: 'N°', render: (x: any) => x.number, width: 50 },                 { key: 't', label: 'Avenant', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.description}</div></> },                 { key: 'v', label: 'Impact HT', num: true, render: (x: any) => (x.value_delta >= 0 ? '+' : '') + money(x.value_delta) },                 { key: 'e', label: 'Nouvelle échéance', render: (x: any) => date(x.new_end_date) },                 { key: 's', label: 'Statut', render: (x: any) => x.status === 'signe' ? <Badge tone="success">Signé</Badge> : can('contracts', 'validate') ? <Button size="sm" onClick={() => signAmend.run(x.id)}>Signer</Button> : <Badge>{x.status}</Badge> },               ] |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:84) |
| ContractDetail | Button | onClick=() => signAmend.run(x.id) | Signer | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:90) |
| ContractDetail | Documents | entityType=contract ; entityId=c.id ; kinds=['contrat', 'attestation', 'pv', 'autre'] |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:93) |
| ContractDetail | Link | to=`/devis/${d.quote.id}` | Devis {d.quote.number} v {d.quote.version} — {money(d.quote.total_ht)} | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:97) |
| ContractDetail | Link | to=`/campagnes/${x.id}` | {x.ref} — {x.name} | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:97) |
| ContractDetail | Button | onClick=() => setModal('terminate') | Résilier le contrat | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:99) |
| ContractDetail | ConfirmModal | title=Marquer le contrat comme signé |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:103) |
| ContractDetail | ConfirmModal | title=Résilier ce contrat ? |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:105) |
| ContractDetail | Modal | title=Nouvel avenant |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:106) |
| ContractDetail | Button | onClick=() => setModal(null) | Annuler | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:106) |
| ContractDetail | Button | onClick=() => addAmend.run(undefined) | Créer l’avenant | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:106) |
| ContractDetail | Field | label=Intitulé ; required=true |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:108) |
| ContractDetail | Input | value=amend.title ; onChange=(e) => setAmend({ ...amend, title: e.target.value }) |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:108) |
| ContractDetail | Field | label=Impact sur la valeur HT |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:109) |
| ContractDetail | Input | type=number ; value=amend.value_delta ?? '' ; onChange=(e) => setAmend({ ...amend, value_delta: e.target.value === '' ? null : Number(e.target.value) }) |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:109) |
| ContractDetail | Field | label=Nouvelle échéance |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:110) |
| ContractDetail | Input | type=date ; value=amend.new_end_date ; onChange=(e) => setAmend({ ...amend, new_end_date: e.target.value }) |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:110) |
| ContractDetail | Field | label=Description |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:111) |
| ContractDetail | Textarea | value=amend.description ; onChange=(e) => setAmend({ ...amend, description: e.target.value }) |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:111) |
| ContractDetail | Modal | title=Ajouter une pièce à suivre |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:114) |
| ContractDetail | Button | onClick=() => setModal(null) | Annuler | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:114) |
| ContractDetail | Button | onClick=() => addItem.run(undefined) | Ajouter | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:114) |
| ContractDetail | Field | label=Type |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:116) |
| ContractDetail | Select | value=item.kind ; onChange=(e) => setItem({ ...item, kind: e.target.value }) ; options=Object.entries(ITEM_KIND).map(([value, label]) => ({ value, label })) |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:116) |
| ContractDetail | Field | label=Échéance |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:117) |
| ContractDetail | Input | type=date ; value=item.due_date ; onChange=(e) => setItem({ ...item, due_date: e.target.value }) |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:117) |
| ContractDetail | Field | label=Libellé ; required=true |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:118) |
| ContractDetail | Input | value=item.label ; onChange=(e) => setItem({ ...item, label: e.target.value }) |  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:118) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| ContractDetail | title =  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:24) |
| ContractDetail | label =  | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:25) |
| ContractDetail | label = Contrats | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:41) |
| ContractDetail | label = Renouveler | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:55) |
| ContractDetail | label = Renégocier | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:55) |
| ContractDetail | label = Ne pas renouveler | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:55) |
| ContractDetail | key = l | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:78) |
| ContractDetail | label = Pièce | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:78) |
| ContractDetail | key = d | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:79) |
| ContractDetail | label = Échéance | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:79) |
| ContractDetail | key = s | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:80) |
| ContractDetail | label = Statut | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:80) |
| ContractDetail | key = n | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:86) |
| ContractDetail | label = N° | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:86) |
| ContractDetail | key = t | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:87) |
| ContractDetail | label = Avenant | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:87) |
| ContractDetail | key = v | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:88) |
| ContractDetail | label = Impact HT | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:88) |
| ContractDetail | key = e | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:89) |
| ContractDetail | label = Nouvelle échéance | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:89) |
| ContractDetail | key = s | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:90) |
| ContractDetail | label = Statut | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:90) |
| ContractDetail | label = Motif de résiliation | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:105) |
| ContractDetail | useCan() | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:19) |
| ContractDetail | can('ai') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:45) |
| ContractDetail | can('contracts', 'update') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:46) |
| ContractDetail | can('contracts', 'update') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:47) |
| ContractDetail | can('contracts', 'validate') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:48) |
| ContractDetail | can('contracts', 'update') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:49) |
| ContractDetail | can('contracts', 'update') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:50) |
| ContractDetail | can('contracts', 'update') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:55) |
| ContractDetail | can('contracts', 'create') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:59) |
| ContractDetail | can('contracts', 'update') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:75) |
| ContractDetail | can('contracts', 'update') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:80) |
| ContractDetail | can('contracts', 'validate') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:90) |
| ContractDetail | can('contracts', 'update') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:93) |
| ContractDetail | can('contracts', 'validate') | [ContractDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/ContractDetail.tsx:99) |

## Contracts.tsx — CRM-017

Source : [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [ContractForm (export)](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:12), [set](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:19), [submit](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:24), [Contracts (export)](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:56), [set](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:66).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| ContractForm | ``/api/organizations?pageSize=30&q=${encodeURIComponent(orgQ)}`` | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:16) |
| ContractForm | `api.patch(`/api/contracts/${initial.id}`)` | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:20) |
| ContractForm | ``/api/contracts/${initial.id}`` | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:20) |
| ContractForm | `api.post('/api/contracts')` | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:20) |
| ContractForm | `'/api/contracts'` | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:20) |
| Contracts | ``/api/contracts${qs(params)}`` | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:65) |
| Contracts | ``/api/contracts${qs({ ...params, format: 'xlsx' })}`` | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:70) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| ContractForm | Modal | title=initial ? `Modifier ${initial.ref}` : 'Nouveau contrat' |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:31) |
| ContractForm | Button | onClick=onClose | Annuler | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:32) |
| ContractForm | Button | onClick=submit | Enregistrer | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:32) |
| ContractForm | Field | label=Client ; required=true |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:34) |
| ContractForm | Input | placeholder=Rechercher… ; value=orgQ ; onChange=(e) => setOrgQ(e.target.value) ; aria-label=Rechercher un client |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:34) |
| ContractForm | Select | placeholder=Choisir… ; value=f.organization_id ; onChange=set('organization_id') ; options=(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: o.legal_name })) |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:34) |
| ContractForm | Field | label=Intitulé ; required=true |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:35) |
| ContractForm | Input | value=f.title ; onChange=set('title') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:35) |
| ContractForm | Field | label=Type |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:36) |
| ContractForm | Select | value=f.kind ; onChange=set('kind') ; options=Object.entries(CONTRACT_KIND).map(([value, label]) => ({ value, label })) |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:36) |
| ContractForm | Field | label=Valeur HT |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:37) |
| ContractForm | MoneyInput | value=f.value_ht ; onChange=set('value_ht') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:37) |
| ContractForm | Field | label=Début ; required=true |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:38) |
| ContractForm | Input | type=date ; value=f.start_date ; onChange=set('start_date') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:38) |
| ContractForm | Field | label=Fin ; required=true |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:39) |
| ContractForm | Input | type=date ; value=f.end_date ; onChange=set('end_date') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:39) |
| ContractForm | Field | label=Renouvellement |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:40) |
| ContractForm | Select | value=f.renewal ; onChange=set('renewal') ; options=[{ value: 'manuel', label: 'Sur décision' }, { value: 'tacite', label: 'Tacite reconduction' }, { value: 'aucun', label: 'Aucun' }] |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:40) |
| ContractForm | Field | label=Préavis (jours) |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:41) |
| ContractForm | Input | type=number ; value=f.notice_days ; onChange=set('notice_days') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:41) |
| ContractForm | Field | label=Responsable |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:42) |
| ContractForm | Select | placeholder=Moi ; value=f.owner_id ?? '' ; onChange=set('owner_id') ; options=users.filter((u) => ['commercial', 'direction_commerciale', 'direction_generale', 'juridique'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name })) |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:42) |
| ContractForm | label |  | <input type="checkbox" checked={f.confidential} onChange={set('confidential')} /> Contrat confidentiel | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:44) |
| ContractForm | input | type=checkbox ; onChange=set('confidential') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:44) |
| ContractForm | label |  | <input type="checkbox" checked={f.exclusivity} onChange={set('exclusivity')} /> Clause d’exclusivité | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:45) |
| ContractForm | input | type=checkbox ; onChange=set('exclusivity') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:45) |
| ContractForm | Field | label=Objet |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:47) |
| ContractForm | Textarea | value=f.object ; onChange=set('object') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:47) |
| ContractForm | Field | label=Conditions de paiement |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:48) |
| ContractForm | Input | value=f.payment_terms ?? '' ; onChange=set('payment_terms') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:48) |
| ContractForm | Field | label=Obligations |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:49) |
| ContractForm | Textarea | value=f.obligations ?? '' ; onChange=set('obligations') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:49) |
| ContractForm | Field | label=Conditions particulières |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:50) |
| ContractForm | Textarea | value=f.special_conditions ?? '' ; onChange=set('special_conditions') |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:50) |
| Contracts | ExcelButton | url=`/api/contracts${qs({ ...params, format: 'xlsx' })}` |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:70) |
| Contracts | Button | onClick=() => setCreate(true) | Nouveau contrat | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:71) |
| Contracts | Segmented | label=Statut ; value=expiring ? 'exp' : status ; onChange=(v) => set(v === 'exp' ? { expiring: '120', status: '' } : { status: v, expiring: '' }) ; options=[{ id: '', label: 'Tous' }, { id: 'exp', label: 'Échéance < 120 j' }, { id: 'en_revue', label: 'En revue' }, { id: 'actif', label: 'Actifs' }, { id: 'a_renouveler', label: 'À renouveler' }, { id: 'brouillon', label: 'Brouillons' }, { id: 'expire', label: 'Expirés' }] |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | form | onSubmit=(e) => { e.preventDefault(); set({ q }); } |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:74) |
| Contracts | Input | placeholder=Référence, intitulé, client… ; value=q ; onChange=(e) => setQ(e.target.value) ; aria-label=Rechercher |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:74) |
| Contracts | DataTable | columns=[             { key: 't', label: 'Contrat', render: (c: any) => <><div className="cell-title row" style={{ gap: 6 }}>{c.confidential && <Lock size={13} aria-label="Confidentiel" />}{c.title}</div><div className="cell-sub">{c.ref} · {CONTRACT_KIND[c.kind]}</div></> },             { key: 'o', label: 'Client', render: (c: any) => <span className="small">{c.organization_name}</span> },             { key: 's', label: 'Statut', render: (c: any) => <div className="row-wrap"><Status kind="contract" code={c.status} />{c.late_items > 0 && <Badge tone="danger">{c.late_items} pièce(s) en retard</Badge>}</div> },             { key: 'v', label: 'Valeur HT', num: true, render: (c: any) => money(c.value_ht) },             { key: 'e', label: 'Échéance', render: (c: any) => <><div className="small nowrap">{date(c.end_date)}</div>{['signe', 'actif', 'a_renouveler'].includes(c.status) && c.days_to_end <= 120 && <Badge tone={c.renewal_decision ? 'success' : c.days_to_end <= 30 ? 'danger' : 'warning'}>{c.renewal_decision ? `Décision : ${c.renewal_decision.replace(/_/g, ' ')}` : `J-${c.days_to_end}`}</Badge>}</> },             { key: 'w', label: 'Responsable', render: (c: any) => <span className="small">{c.owner_name}</span>, mobile: 'hide' },           ] |  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:77) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| ContractForm | title =  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:17) |
| ContractForm | label = Sur décision | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:40) |
| ContractForm | label = Tacite reconduction | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:40) |
| ContractForm | label = Aucun | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:40) |
| Contracts | id =  | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | label = Tous | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | id = exp | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | label = Échéance < 120 j | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | id = en_revue | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | label = En revue | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | id = actif | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | label = Actifs | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | id = a_renouveler | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | label = À renouveler | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | id = brouillon | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | label = Brouillons | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | id = expire | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | label = Expirés | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:73) |
| Contracts | key = t | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:79) |
| Contracts | label = Contrat | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:79) |
| Contracts | key = o | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:80) |
| Contracts | label = Client | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:80) |
| Contracts | key = s | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:81) |
| Contracts | label = Statut | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:81) |
| Contracts | key = v | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:82) |
| Contracts | label = Valeur HT | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:82) |
| Contracts | key = e | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:83) |
| Contracts | label = Échéance | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:83) |
| Contracts | key = w | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:84) |
| Contracts | label = Responsable | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:84) |
| Contracts | useCan() | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:58) |
| Contracts | can('contracts', 'export') | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:70) |
| Contracts | can('contracts', 'create') | [Contracts.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Contracts.tsx:71) |

## Dashboard.tsx — CRM-001

Source : [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [range](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:14), [Dashboard (export)](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:24).

Dépendances locales : `../lib/hooks`, `../lib/auth`, `../lib/api`, `../lib/format`, `../components/ui`, `../components/charts`, `../components/Layout`, `../lib/labels`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Dashboard | ``/api/dashboard${qs({ from: r.from, to: r.to, owner_id: owner, offer_type: offer })}`` | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:35) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Dashboard | Segmented | label=Période ; value=period ; onChange=setPeriod ; options=[{ id: 'mois', label: 'Mois' }, { id: 'trimestre', label: 'Trimestre' }, { id: 'annee', label: 'Année' }, { id: '12mois', label: '12 mois' }] |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:61) |
| Dashboard | Select | placeholder=Tous les commerciaux ; value=owner ; onChange=(e) => setOwner(e.target.value) ; options=commercials.map((u) => ({ value: u.id, label: u.full_name })) ; aria-label=Commercial |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:62) |
| Dashboard | Select | placeholder=Toutes prestations ; value=offer ; onChange=(e) => setOffer(e.target.value) ; options=(lookups.offer_type ?? []).map((o) => ({ value: o.code, label: o.label })) ; aria-label=Prestation |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:63) |
| Dashboard | Link | to=a.to | <span style={{ display: 'inline-flex', width: 15 }}>{a.icon}</span> {a.label} | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:73) |
| Dashboard | Kpi | label=Pipeline pondéré ; value=moneyShort(s.pipeline_weighted) ; onClick=() => nav('/opportunites') |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:86) |
| Dashboard | Kpi | label=Offres en attente de réponse ; value=d.quotes.pending_count ; onClick=() => nav('/devis?status=envoye') |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:91) |
| Dashboard | Link | to=/opportunites | Tout le pipeline <ArrowRight size={14} /> | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:106) |
| Dashboard | DataTable | columns=[                       { key: 'title', label: 'Opportunité', render: (o: any) => <><div className="cell-title">{o.title}</div><div className="cell-sub">{o.ref} · {o.organization_name}</div></> },                       { key: 'stage', label: 'Étape', render: (o: any) => <span className="small">{o.stage_label}</span>, mobile: 'hide' },                       { key: 'reason', label: 'Motif', render: (o: any) => <Badge tone={o.is_overdue \|\| o.is_inactive ? 'warning' : 'info'}>{o.reason}</Badge> },                       { key: 'weighted', label: 'Pondéré', num: true, render: (o: any) => <span title={`Brut ${money(o.amount)} × ${o.probability} %`}>{moneyShort(o.weighted)}</span> },                       { key: 'close', label: 'Clôture', render: (o: any) => <span className="small nowrap">{date(o.expected_close_date)}</span>, mobile: 'hide' },                     ] |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:107) |
| Dashboard | Kpi | label=Créances échues ; value=moneyShort(d.finance.overdue) ; onClick=() => nav('/finance') |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:131) |
| Dashboard | Kpi | label=Taux d’occupation des faces ; value=pct(d.inventory.occupancy, 0) ; onClick=() => nav('/supports') |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:133) |
| Dashboard | Kpi | label=Redevances restant à régler ; value=moneyShort(d.royalties.remaining) ; onClick=() => nav('/redevances') |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:135) |
| Dashboard | Link | to=/taches | Tâches | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:142) |
| Dashboard | div | onClick=() => nav(t.source === 'tache' ? '/taches' : t.opportunity_id ? `/opportunites/${t.opportunity_id}` : t.organization_id ? `/organisations/${t.organization_id}` : '/activites') |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:145) |
| Dashboard | Link | to=/contrats | Contrats | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:157) |
| Dashboard | div | onClick=() => nav(`/contrats/${c.id}`) |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:160) |
| Dashboard | div | onClick=() => nav(`/campagnes/${c.id}`) |  | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:171) |
| Dashboard | Link | to=/assistant?tab=actions | <Badge tone="warning">À valider</Badge> <span className="truncate">{a.label}</span> | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:182) |
| Dashboard | button | onClick=() => ai.open({ prompt: 'Quelles sont mes priorités aujourd’hui ?' }) | Mes priorités du jour | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:185) |
| Dashboard | button | onClick=() => ai.open({ prompt: 'Fais la synthèse du pipeline du mois' }) | Synthèse du pipeline | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:186) |
| Dashboard | Button | onClick=() => ai.open() | Ouvrir l’assistant | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:188) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| range | label = mois en cours | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:17) |
| range | label = trimestre en cours | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:18) |
| range | label = année en cours | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:19) |
| range | label = 12 derniers mois | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:20) |
| Dashboard | id = mois | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:61) |
| Dashboard | label = Mois | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:61) |
| Dashboard | id = trimestre | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:61) |
| Dashboard | label = Trimestre | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:61) |
| Dashboard | id = annee | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:61) |
| Dashboard | label = Année | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:61) |
| Dashboard | id = 12mois | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:61) |
| Dashboard | label = 12 mois | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:61) |
| Dashboard | key = won | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:102) |
| Dashboard | label = CA gagné | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:102) |
| Dashboard | key = target | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:102) |
| Dashboard | label = Objectif | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:102) |
| Dashboard | key = title | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:109) |
| Dashboard | label = Opportunité | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:109) |
| Dashboard | key = stage | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:110) |
| Dashboard | label = Étape | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:110) |
| Dashboard | key = reason | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:111) |
| Dashboard | label = Motif | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:111) |
| Dashboard | key = weighted | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:112) |
| Dashboard | label = Pondéré | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:112) |
| Dashboard | key = close | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:113) |
| Dashboard | label = Clôture | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:113) |
| Dashboard | useCan() | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:26) |
| Dashboard | can('opportunities') | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:62) |
| Dashboard | can('opportunities') | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:63) |
| Dashboard | can('ai') | [Dashboard.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Dashboard.tsx:178) |

## DemoLogin.tsx — CRM-015, CRM-016, CRM-044

Source : [DemoLogin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [profilesOf](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:12), [DemoLogin (export)](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:23), [pick](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:29).

Dépendances locales : `../lib/api`, `../lib/auth`, `../components/ui`, `./Portal`, `../components/PortalTile`, `../demo/demo`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| pick | `api.get('/api/auth/me')` | [DemoLogin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:31) |
| pick | `'/api/auth/me'` | [DemoLogin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:31) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| DemoLogin | Navigate | to=/ |  | [DemoLogin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:28) |
| DemoLogin | Link | to=/connexion | <ArrowLeft size={16} aria-hidden /> Portail des départements | [DemoLogin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:46) |
| DemoLogin | Link | to=/connexion | Revenir au portail | [DemoLogin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:57) |
| DemoLogin | button | title=p.description ; type=button ; onClick=() => pick(p.key) | <span className="demo-person-ico"><UserRound size={18} aria-hidden /></span> <span><span className="demo-person-name">{p.name}</span><span className="demo-person-role">{p.label}</span></span> | [DemoLogin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:61) |
| DemoLogin | PortalTile | onClick=() => nav(`/connexion/${t.code}`) |  | [DemoLogin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:80) |
| DemoLogin | button | title=p.description ; type=button ; onClick=() => pick(p.key) | {p.label} ( {p.name} ) | [DemoLogin.tsx](C:/wamp64/www/comsig-crm/web/src/pages/DemoLogin.tsx:84) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## Finance.tsx — CRM-025

Source : [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Finance (export)](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:12).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/charts`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Finance | ``/api/invoices${qs(params)}`` | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:18) |
| Finance | `'/api/payments'` | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:19) |
| Finance | ``/api/organizations?pageSize=30&q=${encodeURIComponent(orgQ)}`` | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:23) |
| Finance | `api.post('/api/invoices')` | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:24) |
| Finance | `'/api/invoices'` | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:24) |
| Finance | `api.post(`/api/invoices/${v.id}/payments`)` | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:25) |
| Finance | ``/api/invoices/${v.id}/payments`` | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:25) |
| Finance | `api.post(`/api/payments/${v.id}/validate`)` | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:26) |
| Finance | ``/api/payments/${v.id}/validate`` | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:26) |
| Finance | ``/api/invoices${qs({ ...params, format: 'xlsx' })}`` | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:31) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Finance | ExcelButton | url=`/api/invoices${qs({ ...params, format: 'xlsx' })}` |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:31) |
| Finance | ButtonLink | to=/admin/imports?entity=invoices |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:32) |
| Finance | Button | onClick=() => setNewInv({ number: '', organization_id: '', issue_date: today(), due_date: addDays(today(), 30), amount_ht: null, amount_ttc: null }) | Référencer une facture | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:33) |
| Finance | Kpi | label=Créances échues ; value=money(a.j0_30 + a.j31_60 + a.j61_90 + a.plus_90) ; onClick=() => setFilter('overdue') |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:37) |
| Finance | Tabs | value=tab ; onChange=setTab ; tabs=[{ id: 'invoices', label: 'Factures' }, { id: 'payments', label: 'Encaissements à rapprocher' }] |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:44) |
| Finance | Segmented | label=Filtre ; value=filter ; onChange=setFilter ; options=[{ id: '', label: 'Toutes' }, { id: 'overdue', label: 'Échues non soldées' }, { id: 'emise', label: 'Émises' }, { id: 'partiellement_payee', label: 'Partiellement payées' }, { id: 'payee', label: 'Payées' }] |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | DataTable | columns=[                 { key: 'n', label: 'Facture', render: (x: any) => <><div className="cell-title">{x.number}</div><div className="cell-sub">{x.organization_name}{x.contract_ref ? ` · ${x.contract_ref}` : ''} · {x.source}</div></> },                 { key: 'i', label: 'Émise', render: (x: any) => date(x.issue_date), mobile: 'hide' },                 { key: 'd', label: 'Échéance', render: (x: any) => <span style={x.balance > 0 && x.days_overdue > 0 ? { color: 'var(--danger)', fontWeight: 600 } : undefined} className="small nowrap">{date(x.due_date)}{x.balance > 0 && x.days_overdue > 0 ? ` (+${x.days_overdue} j)` : ''}</span> },                 { key: 't', label: 'TTC', num: true, render: (x: any) => money(x.amount_ttc) },                 { key: 'p', label: 'Encaissé rapproché', num: true, render: (x: any) => <>{money(x.paid_validated)}{x.paid_pending > 0 && <div className="xsmall" style={{ color: 'var(--warning)' }}>+ {money(x.paid_pending)} à rapprocher</div>}</>, mobile: 'hide' },                 { key: 'b', label: 'Solde', num: true, render: (x: any) => <strong>{money(x.balance)}</strong> },                 { key: 's', label: 'Statut', render: (x: any) => <Status kind="invoice" code={x.status} /> },                 { key: 'x', label: '', render: (x: any) => x.balance > 0 && can('finance', 'create') && <Button size="sm" onClick={() => setPay({ id: x.id, number: x.number, max: x.balance - x.paid_pending, body: { amount: x.balance - x.paid_pending, paid_at: today(), method: 'virement', reference: '' } })}>Encaissement</Button> },               ] |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:49) |
| Finance | Button | onClick=() => setPay({ id: x.id, number: x.number, max: x.balance - x.paid_pending, body: { amount: x.balance - x.paid_pending, paid_at: today(), method: 'virement', reference: '' } }) | Encaissement | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:58) |
| Finance | DataTable | columns=[               { key: 'i', label: 'Facture', render: (x: any) => <><div className="cell-title">{x.invoice_number}</div><div className="cell-sub">{x.organization_name}</div></> },               { key: 'a', label: 'Montant', num: true, render: (x: any) => money(x.amount) },               { key: 'd', label: 'Payé le', render: (x: any) => <span className="small">{date(x.paid_at)} · {x.method ?? '—'} {x.reference ?? ''}</span> },               { key: 'e', label: 'Saisi par', render: (x: any) => <span className="small">{x.entered_by_name}</span>, mobile: 'hide' },               { key: 's', label: 'Statut', render: (x: any) => <><Status kind="payment" code={x.status} />{x.validated_by_name && <div className="xsmall muted">par {x.validated_by_name}</div>}</> },               { key: 'x', label: '', render: (x: any) => x.status === 'a_rapprocher' && can('finance', 'validate') && (x.entered_by === me?.id ? <span className="xsmall muted">Saisi par vous : validation par un collègue</span> : <div className="row"><Button size="sm" variant="primary" onClick={() => validate.run({ id: x.id, approve: true })}>Rapprocher</Button><Button size="sm" variant="ghost" onClick={() => validate.run({ id: x.id, approve: false })}>Rejeter</Button></div>) },             ] |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:64) |
| Finance | Button | onClick=() => validate.run({ id: x.id, approve: true }) | Rapprocher | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:71) |
| Finance | Button | onClick=() => validate.run({ id: x.id, approve: false }) | Rejeter | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:71) |
| Finance | Modal | title=Référencer une facture |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:75) |
| Finance | Button | onClick=() => setNewInv(null) | Annuler | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:76) |
| Finance | Button | onClick=() => createInv.run({ ...newInv, amount_ht: newInv.amount_ht ?? 0, amount_ttc: newInv.amount_ttc ?? 0 }) | Enregistrer | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:76) |
| Finance | Field | label=Numéro ; required=true |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:78) |
| Finance | Input | value=newInv.number ; onChange=(e) => setNewInv({ ...newInv, number: e.target.value }) |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:78) |
| Finance | Field | label=Client ; required=true |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:79) |
| Finance | Input | placeholder=Rechercher… ; value=orgQ ; onChange=(e) => setOrgQ(e.target.value) ; aria-label=Rechercher |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:79) |
| Finance | Select | placeholder=Choisir… ; value=newInv.organization_id ; onChange=(e) => setNewInv({ ...newInv, organization_id: e.target.value }) ; options=(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: o.legal_name })) |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:79) |
| Finance | Field | label=Date d’émission |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:80) |
| Finance | Input | type=date ; value=newInv.issue_date ; onChange=(e) => setNewInv({ ...newInv, issue_date: e.target.value }) |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:80) |
| Finance | Field | label=Échéance |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:81) |
| Finance | Input | type=date ; value=newInv.due_date ; onChange=(e) => setNewInv({ ...newInv, due_date: e.target.value }) |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:81) |
| Finance | Field | label=Montant HT |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:82) |
| Finance | MoneyInput | value=newInv.amount_ht ; onChange=(v) => setNewInv({ ...newInv, amount_ht: v, amount_ttc: v === null ? null : Math.round(v * 1.18) }) |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:82) |
| Finance | Field | label=Montant TTC |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:83) |
| Finance | MoneyInput | value=newInv.amount_ttc ; onChange=(v) => setNewInv({ ...newInv, amount_ttc: v }) |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:83) |
| Finance | Modal | title=`Encaissement — ${pay?.number}` |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:86) |
| Finance | Button | onClick=() => setPay(null) | Annuler | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:87) |
| Finance | Button | onClick=() => addPay.run({ id: pay.id, body: { ...pay.body, reference: pay.body.reference \|\| null } }) | Saisir | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:87) |
| Finance | Field | label=Montant |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:89) |
| Finance | MoneyInput | value=pay.body.amount ; onChange=(v) => setPay({ ...pay, body: { ...pay.body, amount: v } }) |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:89) |
| Finance | Field | label=Date |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:90) |
| Finance | Input | type=date ; value=pay.body.paid_at ; onChange=(e) => setPay({ ...pay, body: { ...pay.body, paid_at: e.target.value } }) |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:90) |
| Finance | Field | label=Mode |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:91) |
| Finance | Select | value=pay.body.method ; onChange=(e) => setPay({ ...pay, body: { ...pay.body, method: e.target.value } }) ; options=['virement', 'chèque', 'espèces', 'mobile money'].map((x) => ({ value: x, label: x })) |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:91) |
| Finance | Field | label=Référence |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:92) |
| Finance | Input | value=pay.body.reference ; onChange=(e) => setPay({ ...pay, body: { ...pay.body, reference: e.target.value } }) |  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:92) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Finance | label = À échoir | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:41) |
| Finance | label = 1–30 j | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:41) |
| Finance | label = 31–60 j | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:41) |
| Finance | label = 61–90 j | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:41) |
| Finance | label = > 90 j | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:41) |
| Finance | id = invoices | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:44) |
| Finance | label = Factures | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:44) |
| Finance | id = payments | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:44) |
| Finance | label = Encaissements à rapprocher | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:44) |
| Finance | id =  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | label = Toutes | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | id = overdue | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | label = Échues non soldées | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | id = emise | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | label = Émises | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | id = partiellement_payee | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | label = Partiellement payées | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | id = payee | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | label = Payées | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:47) |
| Finance | key = n | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:51) |
| Finance | label = Facture | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:51) |
| Finance | key = i | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:52) |
| Finance | label = Émise | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:52) |
| Finance | key = d | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:53) |
| Finance | label = Échéance | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:53) |
| Finance | key = t | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:54) |
| Finance | label = TTC | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:54) |
| Finance | key = p | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:55) |
| Finance | label = Encaissé rapproché | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:55) |
| Finance | key = b | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:56) |
| Finance | label = Solde | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:56) |
| Finance | key = s | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:57) |
| Finance | label = Statut | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:57) |
| Finance | key = x | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:58) |
| Finance | label =  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:58) |
| Finance | key = i | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:66) |
| Finance | label = Facture | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:66) |
| Finance | key = a | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:67) |
| Finance | label = Montant | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:67) |
| Finance | key = d | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:68) |
| Finance | label = Payé le | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:68) |
| Finance | key = e | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:69) |
| Finance | label = Saisi par | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:69) |
| Finance | key = s | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:70) |
| Finance | label = Statut | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:70) |
| Finance | key = x | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:71) |
| Finance | label =  | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:71) |
| Finance | useCan() | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:13) |
| Finance | can('finance', 'export') | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:31) |
| Finance | can('finance', 'create') | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:32) |
| Finance | can('finance', 'create') | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:33) |
| Finance | can('finance', 'create') | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:58) |
| Finance | can('finance', 'validate') | [Finance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Finance.tsx:71) |

## Flows.tsx — CRM-011, CRM-012

Source : [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [ItineraryPath (export)](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:19), [Flows (export)](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:23), [NewFlow](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:64), [FlowDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:100).

Dépendances locales : `../components/Priority`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/ExportButton`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Flows | ``/api/flows${qs({ box, itinerary: it \|\| undefined })}`` | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:28) |
| Flows | `'/api/flows/stats'` | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:29) |
| Flows | ``/api/xlsx/flows${qs({ box })}`` | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:37) |
| NewFlow | `'/api/opportunities?status=ouvertes&pageSize=500'` | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:66) |
| NewFlow | `api.post('/api/flows')` | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:69) |
| NewFlow | `'/api/flows'` | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:69) |
| FlowDetail | ``/api/flows/${id}`` | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:102) |
| FlowDetail | `api.post(`/api/flows/${id}/${v.path}`)` | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:107) |
| FlowDetail | ``/api/flows/${id}/${v.path}`` | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:107) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Flows | ExcelButton | url=`/api/xlsx/flows${qs({ box })}` |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:37) |
| Flows | Button | onClick=() => setCreate('') | Lancer un circuit | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:37) |
| Flows | Select | value=it ; onChange=(e) => setIt(e.target.value) ; options=[{ value: '', label: 'Tous les itinéraires' }, { value: '1', label: 'Itinéraire 1 — Production' }, { value: '2', label: 'Itinéraire 2 — Régie' }, { value: '3', label: 'Itinéraire 3 — Direction générale' }] ; aria-label=Itinéraire |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:44) |
| Flows | Tabs | value=box ; onChange=setBox ; tabs=[{ id: 'a_traiter', label: 'À traiter par mon service' }, { id: 'en_cours', label: 'En cours' }, { id: 'termines', label: 'Clos' }, { id: 'tous', label: 'Tous' }] |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:45) |
| Flows | DataTable | columns=[               { key: 'ref', label: 'Circuit', render: (f: any) => <><div className="cell-title">{f.title}</div><div className="cell-sub">{f.ref} · {f.organization_name} · {f.opportunity_ref}</div></> },               { key: 'it', label: 'Itinéraire', render: (f: any) => <Badge tone="neutral" dot={false}>{f.itinerary}</Badge> },               { key: 'cur', label: 'Étape en cours', render: (f: any) => f.status === 'en_cours' ? <span className="small"><span className="dept-dot-inline" style={{ background: f.current_department_color }} />{f.current_department_label}<div className="xsmall muted">{f.current_label} · depuis {relative(f.current_since)}</div></span> : <span className="small muted">{f.outcome}</span> },               { key: 'p', label: 'Avancement', render: (f: any) => <span className="small">{f.steps_done}/{f.steps_n}</span>, mobile: 'hide' },               { key: 'prio', label: 'Priorité', render: (f: any) => <PriorityBadge level={f.priority_level} legacy={f.priority} />, mobile: 'hide' },               { key: 'due', label: 'Échéance', render: (f: any) => <span className={`small${f.is_late ? ' text-danger' : ''}`}>{f.due_date ? date(f.due_date) : '—'}</span>, mobile: 'hide' },               { key: 'st', label: 'Statut', render: (f: any) => <Badge tone={ST[f.status][1]}>{ST[f.status][0]}</Badge> },             ] |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:47) |
| NewFlow | Modal | title=Lancer un circuit de production |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:71) |
| NewFlow | Button | onClick=onClose | Annuler | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:72) |
| NewFlow | Button | onClick=() => save.run({ ...f, itinerary: Number(f.itinerary), fabrication: Number(f.itinerary) === 1 ? f.fabrication : undefined, due_date: f.due_date \|\| null }) | Lancer | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:72) |
| NewFlow | Field | label=Opportunité ; required=true |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:75) |
| NewFlow | Select | placeholder=Choisir une opportunité ouverte ; value=f.opportunity_id ?? '' ; onChange=(e) => setF({ ...f, opportunity_id: e.target.value, title: f.title \|\| (opps.data?.rows.find((o: any) => o.id === e.target.value)?.title ?? '') }) ; options=(opps.data?.rows ?? []).map((o: any) => ({ value: o.id, label: `${o.ref} — ${o.title} (${o.organization_name})` })) |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:76) |
| NewFlow | label |  | <input type="radio" name="itinerary" checked={Number(f.itinerary) === n} onChange={() => setF({ ...f, itinerary: n })} /> <strong>Itinéraire {n}</strong> <ItineraryPath n={n} /> | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:81) |
| NewFlow | input | name=itinerary ; type=radio ; onChange=() => setF({ ...f, itinerary: n }) |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:82) |
| NewFlow | Field | label=Service de fabrication ; required=true |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:87) |
| NewFlow | Select | value=f.fabrication ; onChange=(e) => setF({ ...f, fabrication: e.target.value }) ; options=[{ value: 'imprimerie', label: 'Imprimerie' }, { value: 'atelier', label: 'Atelier métallique' }, { value: 'cnc', label: 'CNC' }] |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:87) |
| NewFlow | Field | label=Intitulé ; required=true |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:88) |
| NewFlow | Input | value=f.title ?? '' ; onChange=(e) => setF({ ...f, title: e.target.value }) |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:88) |
| NewFlow | PrioritySelect | value=f.priority_level ; onChange=(v) => setF({ ...f, priority_level: v }) |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:89) |
| NewFlow | Field | label=Échéance souhaitée |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:90) |
| NewFlow | Input | type=date ; value=f.due_date ?? '' ; onChange=(e) => setF({ ...f, due_date: e.target.value }) |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:90) |
| NewFlow | Field | label=Brief pour les services |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:91) |
| NewFlow | Textarea | placeholder=Besoin, formats, quantités, lieu, délais, contraintes… ; value=f.brief ?? '' ; onChange=(e) => setF({ ...f, brief: e.target.value }) |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:91) |
| FlowDetail | Link | to=`/opportunites/${f.opportunity.id}` | {f.opportunity.ref} | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:123) |
| FlowDetail | Link | to=`/ordres-travail/${s.work_order_id}` | <ClipboardList size={12} /> {s.work_order_ref} · {s.work_order_status} | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:133) |
| FlowDetail | Button | onClick=() => act.run({ path: 'take' }) | Prendre en charge | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:142) |
| FlowDetail | Button | onClick=() => setDlg('advance') | {DLG.advance[0]} | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:143) |
| FlowDetail | Button | onClick=() => setDlg('close') | Clore à la régie | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:144) |
| FlowDetail | Button | onClick=() => setDlg('return') | Retourner | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:145) |
| FlowDetail | Button | onClick=() => setDlg('orient') | Changer d’atelier | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:146) |
| FlowDetail | Button | onClick=() => setDlg('comment') | Commenter | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:147) |
| FlowDetail | Button | onClick=() => setDlg('cancel') | Annuler | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:148) |
| FlowDetail | Modal | title=dlg ? DLG[dlg][0] : '' |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:166) |
| FlowDetail | Button | onClick=() => setDlg(null) | Fermer | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:167) |
| FlowDetail | Button | onClick=() => dlg && act.run({ path: DLG[dlg][2], body: DLG[dlg][3] }) | Confirmer | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:167) |
| FlowDetail | Field | label=Service de fabrication |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:168) |
| FlowDetail | Select | value=fab ; onChange=(e) => setFab(e.target.value) ; options=[{ value: 'imprimerie', label: 'Imprimerie' }, { value: 'atelier', label: 'Atelier métallique' }, { value: 'cnc', label: 'CNC' }] |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:168) |
| FlowDetail | Field | label=DLG[dlg][1] |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:169) |
| FlowDetail | Textarea | value=note ; onChange=(e) => setNote(e.target.value) |  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:169) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Flows | label = Tous les itinéraires | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:44) |
| Flows | label = Itinéraire 1 — Production | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:44) |
| Flows | label = Itinéraire 2 — Régie | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:44) |
| Flows | label = Itinéraire 3 — Direction générale | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:44) |
| Flows | id = a_traiter | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:45) |
| Flows | label = À traiter par mon service | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:45) |
| Flows | id = en_cours | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:45) |
| Flows | label = En cours | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:45) |
| Flows | id = termines | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:45) |
| Flows | label = Clos | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:45) |
| Flows | id = tous | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:45) |
| Flows | label = Tous | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:45) |
| Flows | key = ref | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:49) |
| Flows | label = Circuit | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:49) |
| Flows | key = it | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:50) |
| Flows | label = Itinéraire | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:50) |
| Flows | key = cur | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:51) |
| Flows | label = Étape en cours | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:51) |
| Flows | key = p | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:52) |
| Flows | label = Avancement | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:52) |
| Flows | key = prio | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:53) |
| Flows | label = Priorité | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:53) |
| Flows | key = due | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:54) |
| Flows | label = Échéance | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:54) |
| Flows | key = st | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:55) |
| Flows | label = Statut | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:55) |
| NewFlow | title =  | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:68) |
| NewFlow | label = Imprimerie | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:87) |
| NewFlow | label = Atelier métallique | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:87) |
| NewFlow | label = CNC | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:87) |
| FlowDetail | label = Circuits de production | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:122) |
| FlowDetail | label = Imprimerie | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:168) |
| FlowDetail | label = Atelier métallique | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:168) |
| FlowDetail | label = CNC | [Flows.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Flows.tsx:168) |

## Governance.tsx — CRM-026, CRM-027, CRM-050

Source : [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [PriorityProtocol (export)](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:13), [canRun](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:44), [GovernanceAudits (export)](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:46), [GovernanceAuditDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:78).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/Priority`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| GovernanceAudits | `'/api/governance/audits'` | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:49) |
| GovernanceAudits | `api.post('/api/governance/audits')` | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:50) |
| GovernanceAudits | `'/api/governance/audits'` | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:50) |
| GovernanceAuditDetail | ``/api/governance/audits/${id}`` | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:81) |
| GovernanceAuditDetail | `api.post(`/api/governance/audits/${id}/review`)` | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:84) |
| GovernanceAuditDetail | ``/api/governance/audits/${id}/review`` | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:84) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| GovernanceAudits | Button | onClick=() => run.run(undefined) | Lancer un audit | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:54) |
| GovernanceAudits | DataTable | columns=[                 { key: 'r', label: 'Rapport', render: (a: any) => <><div className="cell-title">{a.ref}</div><div className="cell-sub">{dateTime(a.generated_at)} · {a.generated_by_name ?? 'audit planifié'}</div></> },                 { key: 's', label: 'Score', render: (a: any) => <strong className="num">{a.score}/100</strong> },                 { key: 'c', label: 'Constats', render: (a: any) => <span className="row-wrap"><Badge tone="danger">{a.critique} critique(s)</Badge><Badge tone="warning">{a.majeure} majeur(s)</Badge><Badge tone="info">{a.mineure} mineur(s)</Badge></span> },                 { key: 'v', label: 'Revue', mobile: 'hide', render: (a: any) => a.reviewed_at ? <span className="small">{a.reviewed_by_name} · {date(a.reviewed_at)}</span> : <Badge tone="warning">À revoir</Badge> },               ] |  | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:58) |
| GovernanceAuditDetail | Button | onClick=() => window.print() | Imprimer | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:95) |
| GovernanceAuditDetail | Button | onClick=() => setReviewing(true) | Consigner la revue | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:96) |
| GovernanceAuditDetail | DataTable | columns=[             { key: 'd', label: 'Département', render: (d: any) => <strong>{d.label}</strong> },             { key: 'c', label: 'Critiques', render: (d: any) => <span className={d.critique ? 'text-danger strong' : 'muted'}>{d.critique}</span> },             { key: 'm', label: 'Majeurs', render: (d: any) => d.majeure },             { key: 'n', label: 'Mineurs', render: (d: any) => d.mineure },           ] |  | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:115) |
| GovernanceAuditDetail | Link | to=e.link | {e.ref} | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:131) |
| GovernanceAuditDetail | Modal | title=Revue de l’audit |  | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:141) |
| GovernanceAuditDetail | Button | onClick=() => setReviewing(false) | Annuler | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:142) |
| GovernanceAuditDetail | Button | onClick=() => review.run({ note }) | Consigner | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:142) |
| GovernanceAuditDetail | Field | label=Plan d’action ; required=true |  | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:143) |
| GovernanceAuditDetail | Textarea | value=note ; onChange=(e) => setNote(e.target.value) |  | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:143) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| (partagé / module) | label = Critique | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:39) |
| (partagé / module) | label = Majeur | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:40) |
| (partagé / module) | label = Mineur | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:41) |
| GovernanceAudits | key = r | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:61) |
| GovernanceAudits | label = Rapport | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:61) |
| GovernanceAudits | key = s | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:62) |
| GovernanceAudits | label = Score | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:62) |
| GovernanceAudits | key = c | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:63) |
| GovernanceAudits | label = Constats | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:63) |
| GovernanceAudits | key = v | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:64) |
| GovernanceAudits | label = Revue | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:64) |
| GovernanceAuditDetail | label = Audits de gouvernance | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:92) |
| GovernanceAuditDetail | key = d | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:116) |
| GovernanceAuditDetail | label = Département | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:116) |
| GovernanceAuditDetail | key = c | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:117) |
| GovernanceAuditDetail | label = Critiques | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:117) |
| GovernanceAuditDetail | key = m | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:118) |
| GovernanceAuditDetail | label = Majeurs | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:118) |
| GovernanceAuditDetail | key = n | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:119) |
| GovernanceAuditDetail | label = Mineurs | [Governance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Governance.tsx:119) |

## Hr.tsx — CRM-034, CRM-061, CRM-062

Source : [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [hm](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:18), [dur](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:19), [Hr (export)](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:22), [setTab](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:26), [Dashboard](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:46), [Staff](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:83), [EmployeeForm](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:114), [submit](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:125), [toggle](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:130), [EmployeeDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:160), [AttendanceBoard](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:268), [count](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:275), [Leaves](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:304), [Positions](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:338), [label](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:341), [MyHr (export)](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:356).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/work`, `../components/Documents`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Dashboard | `'/api/hr/dashboard'` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:47) |
| Staff | ``/api/hr/employees?status=actif${dep ? `&department=${dep}` : ''}${qy ? `&q=${encodeURIComponent(qy)}` : ''}`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:90) |
| Staff | ``/api/xlsx/hr/employees?status=actif${dep ? `&department=${dep}` : ''}${qy ? `&q=${encodeURIComponent(qy)}` : ''}`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:97) |
| EmployeeForm | `'/api/hr/positions'` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:116) |
| EmployeeForm | `'/api/hr/skills'` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:117) |
| EmployeeForm | `api.put(`/api/hr/employees/${initial.id}`)` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:122) |
| EmployeeForm | ``/api/hr/employees/${initial.id}`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:122) |
| EmployeeForm | `api.post('/api/hr/employees')` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:122) |
| EmployeeForm | `'/api/hr/employees'` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:122) |
| EmployeeDetail | ``/api/hr/employees/${id}`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:163) |
| EmployeeDetail | `api.post(`/api/hr/employees/${id}/profile`)` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:169) |
| EmployeeDetail | ``/api/hr/employees/${id}/profile`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:169) |
| EmployeeDetail | `api.post(`/api/hr/employees/${id}/cv`)` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:170) |
| EmployeeDetail | ``/api/hr/employees/${id}/cv`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:170) |
| EmployeeDetail | `api.post(`/api/hr/employees/${id}/evaluations`)` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:171) |
| EmployeeDetail | ``/api/hr/employees/${id}/evaluations`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:171) |
| EmployeeDetail | `api.post(`/api/hr/employees/${id}/trainings`)` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:172) |
| EmployeeDetail | ``/api/hr/employees/${id}/trainings`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:172) |
| EmployeeDetail | ``/api/xlsx/hr/employee/${e.id}`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:181) |
| AttendanceBoard | ``/api/hr/attendance?day=${day}`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:272) |
| AttendanceBoard | `api.post('/api/hr/attendance')` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:273) |
| AttendanceBoard | `'/api/hr/attendance'` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:273) |
| AttendanceBoard | ``/api/xlsx/hr/attendance?day=${day}`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:278) |
| Leaves | ``/api/hr/leaves${f ? `?status=${f}` : ''}`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:308) |
| Leaves | `api.post(`/api/hr/leaves/${act.id}/decision`)` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:309) |
| Leaves | ``/api/hr/leaves/${act.id}/decision`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:309) |
| Leaves | ``/api/xlsx/hr/leaves${f ? `?status=${f}` : ''}`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Positions | `'/api/hr/positions'` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:339) |
| Positions | `'/api/hr/skills'` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:340) |
| MyHr | `'/api/me/hr'` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:357) |
| MyHr | `api.post('/api/me/clock')` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:359) |
| MyHr | `'/api/me/clock'` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:359) |
| MyHr | `api.post('/api/me/leave')` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:360) |
| MyHr | `'/api/me/leave'` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:360) |
| MyHr | `api.post(`/api/hr/leaves/${lid}/decision`)` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:361) |
| MyHr | ``/api/hr/leaves/${lid}/decision`` | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:361) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Hr | Tabs | value=tab ; onChange=setTab ; tabs=[         { id: 'tableau', label: <><BadgeCheck aria-hidden /> Tableau de bord</>, hidden: !can('hr') },         { id: 'personnel', label: <><Users aria-hidden /> Personnel</> },         { id: 'pointage', label: <><Clock aria-hidden /> Pointage</> },         { id: 'conges', label: <><CalendarOff aria-hidden /> Congés</> },         { id: 'postes', label: <><Briefcase aria-hidden /> Postes</>, hidden: !can('hr') },       ] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:30) |
| Dashboard | DataTable | columns=[               { key: 'n', label: 'Agent', render: (l: any) => <><div className="cell-title">{l.name}</div><div className="cell-sub">{LEAVE_KIND[l.kind]} · {l.days} j</div></> },               { key: 'd', label: 'Période', render: (l: any) => <span className="small">{date(l.start_date)} → {date(l.end_date)}</span> },               { key: 's', label: 'Étape', render: (l: any) => <Badge tone={LEAVE_ST[l.status][1]}>{LEAVE_ST[l.status][0]}</Badge> },             ] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:67) |
| Dashboard | DataTable | columns=[{ key: 'n', label: 'Agent', render: (c: any) => c.name }, { key: 't', label: 'Contrat', render: (c: any) => CONTRACT[c.contract_type] }, { key: 'e', label: 'Fin', render: (c: any) => date(c.contract_end) }] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:74) |
| Staff | Input | placeholder=Nom, matricule, fonction… ; value=qy ; onChange=(e) => setQy(e.target.value) ; aria-label=Rechercher |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:94) |
| Staff | Select | placeholder=Tous les services ; value=dep ; onChange=(e) => setDep(e.target.value) ; options=deps.map((d) => ({ value: d.code, label: d.label })) ; aria-label=Service |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:95) |
| Staff | ExcelButton | url=`/api/xlsx/hr/employees?status=actif${dep ? `&department=${dep}` : ''}${qy ? `&q=${encodeURIComponent(qy)}` : ''}` |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:97) |
| Staff | Button | onClick=() => setCreating(true) | Nouveau dossier | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:98) |
| Staff | DataTable | columns=[           { key: 'n', label: 'Agent', render: (e: any) => <><div className="cell-title">{e.first_name} {e.last_name}</div><div className="cell-sub">{e.matricule} · {e.job_title \|\| e.position_title}</div></> },           { key: 'd', label: 'Service', render: (e: any) => <DeptChip label={e.department_label} color={e.department_color} />, mobile: 'hide' },           { key: 'c', label: 'Contrat', render: (e: any) => <span className="small">{CONTRACT[e.contract_type]}{e.contract_end ? ` → ${date(e.contract_end)}` : ''}</span>, mobile: 'hide' },           { key: 'h', label: 'Entrée', render: (e: any) => <span className="small">{date(e.hire_date)}</span>, mobile: 'hide' },           { key: 's', label: 'Aujourd’hui', render: (e: any) => e.on_leave ? <Badge tone="info">Congé</Badge> : e.today_status ? <Badge tone={ATT_ST[e.today_status][1]}>{ATT_ST[e.today_status][0]}</Badge> : <span className="xsmall muted">Non pointé</span> },         ] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:101) |
| EmployeeForm | Modal | title=initial?.id ? `Dossier ${initial.matricule}` : 'Nouveau dossier du personnel' |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:132) |
| EmployeeForm | Button | onClick=onClose | Annuler | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:133) |
| EmployeeForm | Button | onClick=submit | Enregistrer | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:133) |
| EmployeeForm | Field | label=Matricule ; required=true |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:135) |
| EmployeeForm | Input | value=f.matricule ; onChange=(e) => setF({ ...f, matricule: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:135) |
| EmployeeForm | Field | label=Service |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:136) |
| EmployeeForm | Select | placeholder=— ; value=f.department_code ?? '' ; onChange=(e) => setF({ ...f, department_code: e.target.value }) ; options=deps.map((d) => ({ value: d.code, label: d.label })) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:136) |
| EmployeeForm | Field | label=Prénom ; required=true |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:137) |
| EmployeeForm | Input | value=f.first_name ; onChange=(e) => setF({ ...f, first_name: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:137) |
| EmployeeForm | Field | label=Nom ; required=true |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:138) |
| EmployeeForm | Input | value=f.last_name ; onChange=(e) => setF({ ...f, last_name: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:138) |
| EmployeeForm | Field | label=Poste |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:139) |
| EmployeeForm | Select | placeholder=— ; value=f.position_id ?? '' ; onChange=(e) => setF({ ...f, position_id: e.target.value }) ; options=(positions.data?.rows ?? []).map((p: any) => ({ value: p.id, label: p.title })) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:139) |
| EmployeeForm | Field | label=Fonction affichée |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:140) |
| EmployeeForm | Input | value=f.job_title ?? '' ; onChange=(e) => setF({ ...f, job_title: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:140) |
| EmployeeForm | Field | label=Date d’entrée ; required=true |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:141) |
| EmployeeForm | Input | type=date ; value=f.hire_date ; onChange=(e) => setF({ ...f, hire_date: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:141) |
| EmployeeForm | Field | label=Contrat |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:142) |
| EmployeeForm | Select | value=f.contract_type ; onChange=(e) => setF({ ...f, contract_type: e.target.value }) ; options=Object.entries(CONTRACT).map(([value, label]) => ({ value, label })) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:142) |
| EmployeeForm | Field | label=Fin de contrat |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:143) |
| EmployeeForm | Input | type=date ; value=f.contract_end ?? '' ; onChange=(e) => setF({ ...f, contract_end: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:143) |
| EmployeeForm | Field | label=Salaire de base (FCFA) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:144) |
| EmployeeForm | Input | type=number ; value=f.base_salary ?? '' ; onChange=(e) => setF({ ...f, base_salary: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:144) |
| EmployeeForm | Field | label=Heure d’arrivée de référence |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:145) |
| EmployeeForm | Input | type=time ; value=String(f.work_start ?? '08:00').slice(0, 5) ; onChange=(e) => setF({ ...f, work_start: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:145) |
| EmployeeForm | Field | label=Jours de congé annuels |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:146) |
| EmployeeForm | Input | type=number ; value=f.annual_leave_days ; onChange=(e) => setF({ ...f, annual_leave_days: Number(e.target.value) }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:146) |
| EmployeeForm | Field | label=Niveau d’études |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:147) |
| EmployeeForm | Select | value=String(f.education_level) ; onChange=(e) => setF({ ...f, education_level: Number(e.target.value) }) ; options=EDU.map((l, i) => ({ value: String(i), label: l })) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:147) |
| EmployeeForm | Field | label=Années d’expérience |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:148) |
| EmployeeForm | Input | type=number ; value=f.experience_years ; onChange=(e) => setF({ ...f, experience_years: Number(e.target.value) }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:148) |
| EmployeeForm | Field | label=E-mail |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:149) |
| EmployeeForm | Input | value=f.email ?? '' ; onChange=(e) => setF({ ...f, email: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:149) |
| EmployeeForm | Field | label=Téléphone |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:150) |
| EmployeeForm | Input | value=f.phone ?? '' ; onChange=(e) => setF({ ...f, phone: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:150) |
| EmployeeForm | Field | label=Compétences confirmées |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:151) |
| EmployeeForm | button | type=button ; onClick=() => toggle(s.code) | {s.label} | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:152) |
| EmployeeForm | Field | label=Texte du CV |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:154) |
| EmployeeForm | Textarea | value=f.cv_text ?? '' ; onChange=(e) => setF({ ...f, cv_text: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:154) |
| EmployeeDetail | ExcelButton | label=Dossier Excel ; url=`/api/xlsx/hr/employee/${e.id}` |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:181) |
| EmployeeDetail | Button | onClick=() => reprofile.run(undefined) | Recalculer le profil | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:181) |
| EmployeeDetail | Button | onClick=() => setEditing(true) | Modifier | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:181) |
| EmployeeDetail | Tabs | value=tab ; onChange=setTab ; tabs=[{ id: 'profil', label: <><Sparkles aria-hidden /> Profil et recommandations</> }, { id: 'dossier', label: <><UserRound aria-hidden /> Dossier</> },         { id: 'pointage', label: <><Clock aria-hidden /> Pointage et congés</> }, { id: 'evaluations', label: <><GraduationCap aria-hidden /> Évaluations et formations</> }, { id: 'documents', label: <><FileSearch aria-hidden /> CV et documents</>, hidden: !e.documents }] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:188) |
| EmployeeDetail | DataTable | columns=[           { key: 'd', label: 'Date', render: (a: any) => date(a.work_date) }, { key: 'i', label: 'Arrivée', render: (a: any) => hm(a.check_in) }, { key: 'o', label: 'Départ', render: (a: any) => hm(a.check_out) },           { key: 's', label: 'Statut', render: (a: any) => <Badge tone={ATT_ST[a.status][1]}>{ATT_ST[a.status][0]}{a.late_minutes ? ` +${a.late_minutes} min` : ''}</Badge> }] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:221) |
| EmployeeDetail | DataTable | columns=[           { key: 'k', label: 'Nature', render: (l: any) => <><div className="cell-title">{LEAVE_KIND[l.kind]}</div><div className="cell-sub">{l.ref}</div></> }, { key: 'p', label: 'Période', render: (l: any) => <span className="small">{date(l.start_date)} → {date(l.end_date)} ({l.days} j)</span> },           { key: 's', label: 'Statut', render: (l: any) => <Badge tone={LEAVE_ST[l.status][1]}>{LEAVE_ST[l.status][0]}</Badge> }] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:224) |
| EmployeeDetail | Button | onClick=() => setEv({ period: String(new Date().getFullYear()), scores: { qualite: 3, productivite: 3, ponctualite: 3, esprit_equipe: 3, initiative: 3 }, strengths: '', improvements: '', objectives: '' }) | Évaluer | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:229) |
| EmployeeDetail | DataTable | columns=[{ key: 'p', label: 'Période', render: (x: any) => x.period }, { key: 'o', label: 'Note', render: (x: any) => <strong>{Number(x.overall).toFixed(2)} / 5</strong> }, { key: 'e', label: 'Évaluateur', render: (x: any) => <span className="small">{x.evaluator_name}</span> }] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:230) |
| EmployeeDetail | Button | onClick=() => setTr({ title: '', provider: '', start_date: addDays(today(), 30), status: 'prevue', skills: [] }) | Formation | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:232) |
| EmployeeDetail | DataTable | columns=[{ key: 't', label: 'Formation', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.provider}</div></> }, { key: 'd', label: 'Date', render: (x: any) => date(x.start_date) }, { key: 's', label: 'Statut', render: (x: any) => <Badge tone={x.status === 'terminee' ? 'success' : 'info'}>{x.status}</Badge> }] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:233) |
| EmployeeDetail | Documents | entityType=employee ; entityId=e.id ; kinds=['cv', 'diplome', 'contrat', 'piece_identite', 'attestation', 'autre'] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:238) |
| EmployeeDetail | Button | onClick=() => readCv.run(d.id) | Lire le CV | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:240) |
| EmployeeDetail | Modal | title=Évaluation |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:245) |
| EmployeeDetail | Button | onClick=() => setEv(null) | Annuler | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:245) |
| EmployeeDetail | Button | onClick=() => addEv.run(ev) | Enregistrer | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:245) |
| EmployeeDetail | Field | label=Période |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:247) |
| EmployeeDetail | Input | value=ev.period ; onChange=(x) => setEv({ ...ev, period: x.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:247) |
| EmployeeDetail | Field | label=`${l} (1 à 5)` |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:249) |
| EmployeeDetail | Select | value=String(ev.scores[k]) ; onChange=(x) => setEv({ ...ev, scores: { ...ev.scores, [k]: Number(x.target.value) } }) ; options=[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) })) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:249) |
| EmployeeDetail | Field | label=Points forts |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:250) |
| EmployeeDetail | Textarea | value=ev.strengths ; onChange=(x) => setEv({ ...ev, strengths: x.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:250) |
| EmployeeDetail | Field | label=Axes de progrès |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:251) |
| EmployeeDetail | Textarea | value=ev.improvements ; onChange=(x) => setEv({ ...ev, improvements: x.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:251) |
| EmployeeDetail | Field | label=Objectifs |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:252) |
| EmployeeDetail | Textarea | value=ev.objectives ; onChange=(x) => setEv({ ...ev, objectives: x.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:252) |
| EmployeeDetail | Modal | title=Formation |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:255) |
| EmployeeDetail | Button | onClick=() => setTr(null) | Annuler | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:255) |
| EmployeeDetail | Button | onClick=() => addTr.run(tr) | Enregistrer | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:255) |
| EmployeeDetail | Field | label=Intitulé ; required=true |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:257) |
| EmployeeDetail | Input | value=tr.title ; onChange=(x) => setTr({ ...tr, title: x.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:257) |
| EmployeeDetail | Field | label=Organisme |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:258) |
| EmployeeDetail | Input | value=tr.provider ; onChange=(x) => setTr({ ...tr, provider: x.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:258) |
| EmployeeDetail | Field | label=Début |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:259) |
| EmployeeDetail | Input | type=date ; value=tr.start_date ?? '' ; onChange=(x) => setTr({ ...tr, start_date: x.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:259) |
| EmployeeDetail | Field | label=Statut |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:260) |
| EmployeeDetail | Select | value=tr.status ; onChange=(x) => setTr({ ...tr, status: x.target.value }) ; options=[['prevue', 'Prévue'], ['en_cours', 'En cours'], ['terminee', 'Terminée'], ['annulee', 'Annulée']].map(([value, label]) => ({ value, label })) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:260) |
| AttendanceBoard | Input | type=date ; value=day ; onChange=(e) => setDay(e.target.value) ; aria-label=Jour |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:278) |
| AttendanceBoard | ExcelButton | url=`/api/xlsx/hr/attendance?day=${day}` |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:278) |
| AttendanceBoard | DataTable | columns=[             { key: 'n', label: 'Agent', render: (x: any) => <><div className="cell-title">{x.first_name} {x.last_name}</div><div className="cell-sub">{x.matricule} · {x.job_title}</div></> },             { key: 'd', label: 'Service', render: (x: any) => <DeptChip label={x.department_label} color={x.department_color} />, mobile: 'hide' },             { key: 'i', label: 'Arrivée', render: (x: any) => <span className="num">{hm(x.check_in)}</span> },             { key: 'o', label: 'Départ', render: (x: any) => <span className="num">{hm(x.check_out)}</span> },             { key: 'w', label: 'Durée', render: (x: any) => <span className="small">{dur(x.worked_minutes)}</span>, mobile: 'hide' },             { key: 's', label: 'Statut', render: (x: any) => x.leave_kind ? <Badge tone="info">{LEAVE_KIND[x.leave_kind]}</Badge> : x.status ? <Badge tone={ATT_ST[x.status][1]}>{ATT_ST[x.status][0]}{x.late_minutes ? ` +${x.late_minutes} min` : ''}</Badge> : <span className="xsmall muted">Non pointé</span> },           ] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:281) |
| AttendanceBoard | Modal | title=`Pointage — ${edit?.name ?? ''}` |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:291) |
| AttendanceBoard | Button | onClick=() => setEdit(null) | Annuler | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:292) |
| AttendanceBoard | Button | onClick=() => save.run({ employee_id: edit.employee_id, work_date: edit.work_date, check_in: edit.check_in \|\| null, check_out: edit.check_out \|\| null, status: edit.status, note: edit.note }) | Enregistrer | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:292) |
| AttendanceBoard | Field | label=Statut |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:294) |
| AttendanceBoard | Select | value=edit.status ; onChange=(e) => setEdit({ ...edit, status: e.target.value }) ; options=Object.entries(ATT_ST).map(([value, [label]]) => ({ value, label })) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:294) |
| AttendanceBoard | Field | label=Arrivée |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:295) |
| AttendanceBoard | Input | type=time ; value=edit.check_in ; onChange=(e) => setEdit({ ...edit, check_in: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:295) |
| AttendanceBoard | Field | label=Départ |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:296) |
| AttendanceBoard | Input | type=time ; value=edit.check_out ; onChange=(e) => setEdit({ ...edit, check_out: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:296) |
| AttendanceBoard | Field | label=Motif / note |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:297) |
| AttendanceBoard | Input | value=edit.note ; onChange=(e) => setEdit({ ...edit, note: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:297) |
| Leaves | Segmented | label=Filtre ; value=f ; onChange=setF ; options=[{ id: 'en_attente', label: 'À traiter' }, { id: 'approuvee', label: 'Approuvés' }, { id: 'refusee', label: 'Refusés' }, { id: '', label: 'Tous' }] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Leaves | ExcelButton | url=`/api/xlsx/hr/leaves${f ? `?status=${f}` : ''}` |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Leaves | DataTable | columns=[           { key: 'n', label: 'Agent', render: (l: any) => <><div className="cell-title">{l.employee_name}</div><div className="cell-sub">{l.ref} · {l.department_label}</div></> },           { key: 'k', label: 'Nature', render: (l: any) => LEAVE_KIND[l.kind] },           { key: 'p', label: 'Période', render: (l: any) => <span className="small">{date(l.start_date)} → {date(l.end_date)} · {l.days} j</span> },           { key: 'a', label: 'Avis du responsable', render: (l: any) => l.manager_opinion ? <Badge tone={l.manager_opinion === 'favorable' ? 'success' : 'danger'}>{l.manager_opinion}</Badge> : <span className="xsmall muted">—</span>, mobile: 'hide' },           { key: 's', label: 'Statut', render: (l: any) => <Badge tone={LEAVE_ST[l.status][1]}>{LEAVE_ST[l.status][0]}</Badge> },         ] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:314) |
| Leaves | Modal | title=act ? `${act.ref} — ${act.employee_name}` : '' |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:322) |
| Leaves | Button | onClick=() => setAct(null) | Fermer | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:324) |
| Leaves | Button | onClick=() => decide.run({ action: 'avis', opinion: 'defavorable', comment: act.comment }) | Avis défavorable | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:325) |
| Leaves | Button | onClick=() => decide.run({ action: 'avis', opinion: 'favorable', comment: act.comment }) | Avis favorable | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:325) |
| Leaves | Button | onClick=() => decide.run({ action: 'refuser', comment: act.comment }) | Refuser | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:326) |
| Leaves | Button | onClick=() => decide.run({ action: 'approuver', comment: act.comment }) | Approuver | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:326) |
| Leaves | Field | label=Commentaire |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:331) |
| Leaves | Textarea | value=act.comment ?? '' ; onChange=(e) => setAct({ ...act, comment: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:331) |
| Positions | DataTable | columns=[         { key: 't', label: 'Poste', render: (p: any) => <><div className="cell-title">{p.title}</div><div className="cell-sub">{p.department_label} · {p.level}</div></> },         { key: 'r', label: 'Compétences requises', render: (p: any) => <div className="chips">{p.required_skills.map((s: string) => <span key={s} className="chip skill">{label(s)}</span>)}</div> },         { key: 'x', label: 'Prérequis', render: (p: any) => <span className="small">{p.min_experience_years} an(s) · {EDU[p.min_education]}</span>, mobile: 'hide' },         { key: 'h', label: 'Titulaires', num: true, render: (p: any) => p.holders },         { key: 'o', label: '', render: (p: any) => (p.is_open ? <Badge tone="success">Ouvert</Badge> : null) },       ] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:344) |
| MyHr | Button | onClick=() => clock.run('arrivee') | Pointer mon arrivée | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:373) |
| MyHr | Button | onClick=() => clock.run('depart') | Pointer mon départ | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:374) |
| MyHr | Button | onClick=() => setForm({ kind: 'conge_annuel', start_date: addDays(today(), 14), end_date: addDays(today(), 18), reason: '' }) | Demander un congé | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:383) |
| MyHr | DataTable | columns=[             { key: 'k', label: 'Nature', render: (l: any) => LEAVE_KIND[l.kind] }, { key: 'p', label: 'Période', render: (l: any) => <span className="small">{date(l.start_date)} → {date(l.end_date)} · {l.days} j</span> },             { key: 's', label: 'Statut', render: (l: any) => <Badge tone={LEAVE_ST[l.status][1]}>{LEAVE_ST[l.status][0]}</Badge> },             { key: 'x', label: '', render: (l: any) => (['soumise', 'avis_responsable'].includes(l.status) ? <Button size="sm" variant="ghost" onClick={() => cancel.run(l.id)}>Annuler</Button> : null) }] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:384) |
| MyHr | Button | onClick=() => cancel.run(l.id) | Annuler | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:387) |
| MyHr | DataTable | columns=[             { key: 'd', label: 'Date', render: (a: any) => date(a.work_date) }, { key: 'i', label: 'Arrivée', render: (a: any) => hm(a.check_in) }, { key: 'o', label: 'Départ', render: (a: any) => hm(a.check_out) },             { key: 's', label: 'Statut', render: (a: any) => <Badge tone={ATT_ST[a.status][1]}>{ATT_ST[a.status][0]}</Badge> }] |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:390) |
| MyHr | Modal | title=Demande de congé |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:395) |
| MyHr | Button | onClick=() => setForm(null) | Annuler | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:396) |
| MyHr | Button | onClick=() => ask.run(form) | Envoyer | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:396) |
| MyHr | Field | label=Nature |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:398) |
| MyHr | Select | value=form.kind ; onChange=(e) => setForm({ ...form, kind: e.target.value }) ; options=Object.entries(LEAVE_KIND).map(([value, label]) => ({ value, label })) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:398) |
| MyHr | Field | label=Du |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:400) |
| MyHr | Input | type=date ; value=form.start_date ; onChange=(e) => setForm({ ...form, start_date: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:400) |
| MyHr | Field | label=Au |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:401) |
| MyHr | Input | type=date ; value=form.end_date ; onChange=(e) => setForm({ ...form, end_date: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:401) |
| MyHr | Field | label=Motif |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:402) |
| MyHr | Textarea | value=form.reason ; onChange=(e) => setForm({ ...form, reason: e.target.value }) |  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:402) |
| MyHr | Link | to=/calendrier | Mes congés apparaissent dans mon calendrier | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:406) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Hr | id = tableau | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:31) |
| Hr | id = personnel | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:32) |
| Hr | id = pointage | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:33) |
| Hr | id = conges | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:34) |
| Hr | id = postes | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:35) |
| Dashboard | key = n | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:68) |
| Dashboard | label = Agent | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:68) |
| Dashboard | key = d | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:69) |
| Dashboard | label = Période | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:69) |
| Dashboard | key = s | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:70) |
| Dashboard | label = Étape | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:70) |
| Dashboard | key = n | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:74) |
| Dashboard | label = Agent | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:74) |
| Dashboard | key = t | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:74) |
| Dashboard | label = Contrat | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:74) |
| Dashboard | key = e | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:74) |
| Dashboard | label = Fin | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:74) |
| Staff | key = n | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:102) |
| Staff | label = Agent | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:102) |
| Staff | key = d | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:103) |
| Staff | label = Service | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:103) |
| Staff | key = c | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:104) |
| Staff | label = Contrat | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:104) |
| Staff | key = h | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:105) |
| Staff | label = Entrée | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:105) |
| Staff | key = s | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:106) |
| Staff | label = Aujourd’hui | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:106) |
| EmployeeDetail | label = Ressources humaines | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:180) |
| EmployeeDetail | id = profil | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:188) |
| EmployeeDetail | id = dossier | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:188) |
| EmployeeDetail | id = pointage | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:189) |
| EmployeeDetail | id = evaluations | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:189) |
| EmployeeDetail | id = documents | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:189) |
| EmployeeDetail | key = d | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:222) |
| EmployeeDetail | label = Date | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:222) |
| EmployeeDetail | key = i | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:222) |
| EmployeeDetail | label = Arrivée | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:222) |
| EmployeeDetail | key = o | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:222) |
| EmployeeDetail | label = Départ | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:222) |
| EmployeeDetail | key = s | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:223) |
| EmployeeDetail | label = Statut | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:223) |
| EmployeeDetail | key = k | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:225) |
| EmployeeDetail | label = Nature | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:225) |
| EmployeeDetail | key = p | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:225) |
| EmployeeDetail | label = Période | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:225) |
| EmployeeDetail | key = s | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:226) |
| EmployeeDetail | label = Statut | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:226) |
| EmployeeDetail | key = p | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:230) |
| EmployeeDetail | label = Période | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:230) |
| EmployeeDetail | key = o | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:230) |
| EmployeeDetail | label = Note | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:230) |
| EmployeeDetail | key = e | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:230) |
| EmployeeDetail | label = Évaluateur | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:230) |
| EmployeeDetail | title =  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:232) |
| EmployeeDetail | key = t | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:233) |
| EmployeeDetail | label = Formation | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:233) |
| EmployeeDetail | key = d | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:233) |
| EmployeeDetail | label = Date | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:233) |
| EmployeeDetail | key = s | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:233) |
| EmployeeDetail | label = Statut | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:233) |
| AttendanceBoard | key = n | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:283) |
| AttendanceBoard | label = Agent | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:283) |
| AttendanceBoard | key = d | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:284) |
| AttendanceBoard | label = Service | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:284) |
| AttendanceBoard | key = i | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:285) |
| AttendanceBoard | label = Arrivée | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:285) |
| AttendanceBoard | key = o | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:286) |
| AttendanceBoard | label = Départ | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:286) |
| AttendanceBoard | key = w | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:287) |
| AttendanceBoard | label = Durée | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:287) |
| AttendanceBoard | key = s | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:288) |
| AttendanceBoard | label = Statut | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:288) |
| Leaves | id = en_attente | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Leaves | label = À traiter | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Leaves | id = approuvee | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Leaves | label = Approuvés | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Leaves | id = refusee | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Leaves | label = Refusés | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Leaves | id =  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Leaves | label = Tous | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:312) |
| Leaves | key = n | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:315) |
| Leaves | label = Agent | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:315) |
| Leaves | key = k | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:316) |
| Leaves | label = Nature | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:316) |
| Leaves | key = p | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:317) |
| Leaves | label = Période | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:317) |
| Leaves | key = a | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:318) |
| Leaves | label = Avis du responsable | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:318) |
| Leaves | key = s | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:319) |
| Leaves | label = Statut | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:319) |
| Positions | key = t | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:345) |
| Positions | label = Poste | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:345) |
| Positions | key = r | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:346) |
| Positions | label = Compétences requises | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:346) |
| Positions | key = x | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:347) |
| Positions | label = Prérequis | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:347) |
| Positions | key = h | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:348) |
| Positions | label = Titulaires | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:348) |
| Positions | key = o | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:349) |
| Positions | label =  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:349) |
| MyHr | key = k | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:385) |
| MyHr | label = Nature | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:385) |
| MyHr | key = p | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:385) |
| MyHr | label = Période | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:385) |
| MyHr | key = s | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:386) |
| MyHr | label = Statut | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:386) |
| MyHr | key = x | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:387) |
| MyHr | label =  | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:387) |
| MyHr | key = d | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:391) |
| MyHr | label = Date | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:391) |
| MyHr | key = i | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:391) |
| MyHr | label = Arrivée | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:391) |
| MyHr | key = o | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:391) |
| MyHr | label = Départ | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:391) |
| MyHr | key = s | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:392) |
| MyHr | label = Statut | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:392) |
| Hr | useCan() | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:23) |
| Hr | can('hr') | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:25) |
| Hr | can('hr') | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:31) |
| Hr | can('hr') | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:35) |
| Staff | useCan() | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:84) |
| Staff | can('hr', 'create') | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:98) |
| EmployeeDetail | useCan() | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:162) |
| EmployeeDetail | can('hr', 'update') | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:232) |
| AttendanceBoard | useCan() | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:269) |
| AttendanceBoard | can('hr', 'update') | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:281) |
| Leaves | useCan() | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:305) |
| Leaves | can('hr', 'update') | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:325) |
| Leaves | can('hr', 'update') | [Hr.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Hr.tsx:326) |

## Indicators.tsx — CRM-028

Source : [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [fmtKpi](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:12), [Indicators (export)](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:23).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/work`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Indicators | ``/api/kpis?period=${period}`` | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:31) |
| Indicators | `api.put('/api/kpis/targets')` | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:32) |
| Indicators | `'/api/kpis/targets'` | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:32) |
| Indicators | ``/api/xlsx/kpis?period=${period}`` | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:41) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Indicators | Select | value=period ; onChange=(e) => setPeriod(e.target.value) ; options=opts ; aria-label=Période |  | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:41) |
| Indicators | ExcelButton | url=`/api/xlsx/kpis?period=${period}` |  | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:41) |
| Indicators | Button | onClick=() => setEdit({ ...k, t: k.target ?? '' }) ; aria-label=`Fixer la cible de ${k.label}` |  | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:62) |
| Indicators | Modal | title=`Cible — ${edit?.label ?? ''}` |  | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:73) |
| Indicators | Button | onClick=() => setEdit(null) | Annuler | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:73) |
| Indicators | Button | onClick=() => save.run({ code: edit.code, target: edit.t === '' ? null : Number(edit.t) }) | Enregistrer | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:73) |
| Indicators | Field | label=`Cible (${edit.unit === 'fcfa' ? 'FCFA' : edit.unit === 'pct' ? '%' : edit.unit})` |  | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:74) |
| Indicators | Input | type=number ; value=edit.t ; onChange=(e) => setEdit({ ...edit, t: e.target.value }) |  | [Indicators.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Indicators.tsx:74) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## InterventionDetail.tsx — CRM-030

Source : [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [InterventionDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:12), [report](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:27).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/Documents`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| InterventionDetail | ``/api/interventions/${id}`` | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:17) |
| InterventionDetail | `api.patch(`/api/interventions/${id}`)` | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:20) |
| InterventionDetail | ``/api/interventions/${id}`` | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:20) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| InterventionDetail | Link | to=`/supports/${i.support_id}` | {i.support_code} — {i.support_name} | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:32) |
| InterventionDetail | Link | to=`/campagnes/${i.campaign_id}` | {i.campaign_ref} | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:32) |
| InterventionDetail | Button | onClick=() => upd.run({ status: 'en_cours' }) | Démarrer l’intervention | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:34) |
| InterventionDetail | Button | onClick=() => upd.run({ ...report(), status: 'resolu' }) | Marquer comme résolue | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:35) |
| InterventionDetail | Button | onClick=() => upd.run({ status: 'clos' }) | Valider et clore | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:36) |
| InterventionDetail | Button | onClick=() => upd.run(report()) | Enregistrer | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:43) |
| InterventionDetail | Field | label=Travaux réalisés, constats ; required=true |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:45) |
| InterventionDetail | Textarea | value=f.report ; onChange=(e) => setF({ ...f, report: e.target.value }) |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:45) |
| InterventionDetail | Field | label=Pièces consommées |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:46) |
| InterventionDetail | Input | value=f.parts_used ; onChange=(e) => setF({ ...f, parts_used: e.target.value }) |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:46) |
| InterventionDetail | Field | label=Main-d’œuvre (FCFA) |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:47) |
| InterventionDetail | Input | type=number ; value=f.cost_labor ; onChange=(e) => setF({ ...f, cost_labor: e.target.value }) |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:47) |
| InterventionDetail | Field | label=Pièces (FCFA) |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:48) |
| InterventionDetail | Input | type=number ; value=f.cost_parts ; onChange=(e) => setF({ ...f, cost_parts: e.target.value }) |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:48) |
| InterventionDetail | Documents | entityType=intervention ; entityId=i.id ; kinds=['photo', 'pv', 'autre'] |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:51) |
| InterventionDetail | Field | label=Technicien |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:63) |
| InterventionDetail | Select | placeholder=À planifier ; value=i.assigned_to ?? '' ; onChange=(e) => upd.run({ assigned_to: e.target.value \|\| null, status: i.status === 'ouvert' && e.target.value ? 'planifie' : undefined }) ; options=users.filter((u) => ['technicien', 'operations'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name })) |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:63) |
| InterventionDetail | Field | label=Priorité |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:64) |
| InterventionDetail | Select | value=i.priority ; onChange=(e) => upd.run({ priority: e.target.value }) ; options=['basse', 'normale', 'haute', 'urgente'].map((x) => ({ value: x, label: x })) |  | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:64) |
| InterventionDetail | a | href=`https://www.openstreetmap.org/?mlat=${i.latitude}&mlon=${i.longitude}#map=17/${i.latitude}/${i.longitude}` | Itinéraire vers le support | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:67) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| InterventionDetail | useCan() | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:14) |
| InterventionDetail | can('interventions', 'update') | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:34) |
| InterventionDetail | can('interventions', 'validate') | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:36) |
| InterventionDetail | can('interventions', 'update') | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:43) |
| InterventionDetail | can('interventions', 'update') | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:51) |
| InterventionDetail | can('interventions', 'update') | [InterventionDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/InterventionDetail.tsx:61) |

## Login.tsx — CRM-015, CRM-016

Source : [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx). Mobile : comparaisons publiques documentées sur ordinateur ; mobile spécifique à valider.

Exports/fonctions : [Login (export)](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:12), [submit](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:31).

Dépendances locales : `../lib/format`, `./Portal`, `../components/PortalTile`, `../lib/api`, `../lib/auth`, `../components/ui`, `../components/Layout`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| submit | `api.post('/api/auth/mfa/verify')` | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:36) |
| submit | `'/api/auth/mfa/verify'` | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:36) |
| submit | `api.post('/api/auth/login')` | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:39) |
| submit | `'/api/auth/login'` | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:39) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Login | Navigate | to=landing ?? safePath(loc.state?.from) |  | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:28) |
| Login | form | onSubmit=submit |  | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:50) |
| Login | Link | to=/portail | Revenir au portail | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:56) |
| Login | Link | to=/portail | Revenir au portail | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:57) |
| Login | Field | label=Code de vérification ; required=true |  | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:59) |
| Login | Input | id=code ; value=code ; onChange=(e) => setCode(e.target.value.replace(/\D/g, '')) |  | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:60) |
| Login | Field | label=Identifiant ou adresse e-mail ; required=true |  | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:64) |
| Login | Input | id=email ; type=text ; value=email ; onChange=(e) => setEmail(e.target.value) |  | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:65) |
| Login | Field | label=Mot de passe ; required=true |  | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:67) |
| Login | Input | id=password ; type=password ; value=password ; onChange=(e) => setPassword(e.target.value) |  | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:68) |
| Login | Button | type=submit | {mfaStep ? 'Vérifier' : 'Se connecter'} | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:72) |
| Login | Link | to=/portail | ← Portail des départements | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:74) |
| Login | Link | to=/portail | <ArrowLeft size={16} aria-hidden /> Portail des départements | [Login.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Login.tsx:82) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## Maintenance.tsx — CRM-029

Source : [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [InterventionForm (export)](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:11), [set](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:16), [Maintenance (export)](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:38).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| InterventionForm | `'/api/supports'` | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:14) |
| InterventionForm | `api.post('/api/interventions')` | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:17) |
| InterventionForm | `'/api/interventions'` | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:17) |
| Maintenance | ``/api/interventions${qs(params)}`` | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:46) |
| Maintenance | `'/api/interventions/kpis'` | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:47) |
| Maintenance | ``/api/interventions${qs({ ...params, format: 'xlsx' })}`` | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:53) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| InterventionForm | Modal | title=Nouvelle intervention |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:20) |
| InterventionForm | Button | onClick=onClose | Annuler | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:21) |
| InterventionForm | Button | onClick=() => save.run(undefined) | Ouvrir le ticket | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:21) |
| InterventionForm | Field | label=Intitulé ; required=true |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:23) |
| InterventionForm | Input | value=f.title ; onChange=set('title') |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:23) |
| InterventionForm | Field | label=Support |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:24) |
| InterventionForm | Select | placeholder=preset?.campaign_id ? 'Aucun (incident de campagne)' : 'Choisir…' ; value=f.support_id ; onChange=set('support_id') ; options=(supports.data?.rows ?? []).map((s: any) => ({ value: s.id, label: `${s.code} — ${s.name}` })) |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:24) |
| InterventionForm | Field | label=Origine |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:25) |
| InterventionForm | Select | value=f.source ; onChange=set('source') ; options=[{ value: 'support', label: 'Constat sur support' }, { value: 'campagne', label: 'Campagne' }, { value: 'client', label: 'Signalement client' }, { value: 'preventive', label: 'Maintenance préventive' }, { value: 'controle', label: 'Contrôle terrain' }] |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:25) |
| InterventionForm | Field | label=Type |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:26) |
| InterventionForm | Select | value=f.kind ; onChange=set('kind') ; options=[{ value: 'corrective', label: 'Corrective' }, { value: 'preventive', label: 'Préventive' }] |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:26) |
| InterventionForm | Field | label=Priorité |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:27) |
| InterventionForm | Select | value=f.priority ; onChange=set('priority') ; options=[{ value: 'basse', label: 'Basse (10 j)' }, { value: 'normale', label: 'Normale (5 j)' }, { value: 'haute', label: 'Haute (48 h)' }, { value: 'urgente', label: 'Urgente (24 h)' }] |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:27) |
| InterventionForm | Field | label=Criticité |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:28) |
| InterventionForm | Select | value=f.criticality ; onChange=set('criticality') ; options=[{ value: 'mineure', label: 'Mineure' }, { value: 'majeure', label: 'Majeure' }, { value: 'critique', label: 'Critique (support indisponible)' }] |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:28) |
| InterventionForm | Field | label=Technicien assigné |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:29) |
| InterventionForm | Select | placeholder=À planifier ; value=f.assigned_to ; onChange=set('assigned_to') ; options=users.filter((u) => ['technicien', 'operations'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name })) |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:29) |
| InterventionForm | Field | label=Équipe |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:30) |
| InterventionForm | Input | value=f.team ; onChange=set('team') |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:30) |
| InterventionForm | Field | label=Matériel requis |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:31) |
| InterventionForm | Input | value=f.equipment ; onChange=set('equipment') |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:31) |
| InterventionForm | Field | label=Description |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:32) |
| InterventionForm | Textarea | value=f.description ; onChange=set('description') |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:32) |
| Maintenance | ExcelButton | url=`/api/interventions${qs({ ...params, format: 'xlsx' })}` |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:53) |
| Maintenance | Button | onClick=() => setCreate(true) | Nouvelle intervention | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:54) |
| Maintenance | Kpi | label=Interventions ouvertes ; value=k.data.open ; onClick=() => setSp({ late: '1' }) |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:57) |
| Maintenance | Segmented | label=Vue ; value=view ; onChange=(v) => setSp(v === 'late' ? { late: '1' } : { view: v }) ; options=[{ id: 'open', label: 'Ouvertes' }, { id: 'late', label: 'En retard' }, { id: 'closed', label: 'Closes' }, { id: 'all', label: 'Toutes' }] |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:63) |
| Maintenance | DataTable | columns=[             { key: 't', label: 'Intervention', render: (i: any) => <><div className="cell-title">{i.title}</div><div className="cell-sub">{i.ref} · {i.support_code ?? i.campaign_ref ?? i.organization_name}{i.commune ? ` · ${label('commune', i.commune)}` : ''}</div></> },             { key: 'p', label: 'Priorité', render: (i: any) => <div className="row-wrap"><Status kind="priority" code={i.priority} />{i.criticality !== 'mineure' && <Status kind="criticality" code={i.criticality} />}</div> },             { key: 's', label: 'Statut', render: (i: any) => <div className="row-wrap"><Status kind="intervention" code={i.status} />{i.is_late && <Badge tone="danger">En retard{i.escalation_level > 1 ? ' · escaladé' : ''}</Badge>}</div> },             { key: 'd', label: 'Délai cible', render: (i: any) => <><div className="small nowrap">{dateTime(i.target_date)}</div><div className="xsmall muted">{relative(i.target_date)}</div></> },             { key: 'a', label: 'Assigné', render: (i: any) => <span className="small">{i.assigned_name ?? <span style={{ color: 'var(--warning)' }}>À planifier</span>}</span>, mobile: 'hide' },           ] |  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:65) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| InterventionForm | title =  | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:15) |
| InterventionForm | label = Constat sur support | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:25) |
| InterventionForm | label = Campagne | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:25) |
| InterventionForm | label = Signalement client | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:25) |
| InterventionForm | label = Maintenance préventive | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:25) |
| InterventionForm | label = Contrôle terrain | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:25) |
| InterventionForm | label = Corrective | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:26) |
| InterventionForm | label = Préventive | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:26) |
| InterventionForm | label = Basse (10 j) | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:27) |
| InterventionForm | label = Normale (5 j) | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:27) |
| InterventionForm | label = Haute (48 h) | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:27) |
| InterventionForm | label = Urgente (24 h) | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:27) |
| InterventionForm | label = Mineure | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:28) |
| InterventionForm | label = Majeure | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:28) |
| InterventionForm | label = Critique (support indisponible) | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:28) |
| Maintenance | title = Prise en charge | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:58) |
| Maintenance | title = Respect des délais | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:60) |
| Maintenance | id = open | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:63) |
| Maintenance | label = Ouvertes | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:63) |
| Maintenance | id = late | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:63) |
| Maintenance | label = En retard | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:63) |
| Maintenance | id = closed | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:63) |
| Maintenance | label = Closes | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:63) |
| Maintenance | id = all | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:63) |
| Maintenance | label = Toutes | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:63) |
| Maintenance | key = t | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:67) |
| Maintenance | label = Intervention | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:67) |
| Maintenance | key = p | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:68) |
| Maintenance | label = Priorité | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:68) |
| Maintenance | key = s | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:69) |
| Maintenance | label = Statut | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:69) |
| Maintenance | key = d | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:70) |
| Maintenance | label = Délai cible | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:70) |
| Maintenance | key = a | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:71) |
| Maintenance | label = Assigné | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:71) |
| Maintenance | useCan() | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:40) |
| Maintenance | can('interventions', 'export') | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:53) |
| Maintenance | can('interventions', 'create') | [Maintenance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Maintenance.tsx:54) |

## Messages.tsx — CRM-031

Source : [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Messages (export)](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:15), [Thread](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:61), [Compose](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:112), [name](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:120).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../lib/markdown`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Messages | ``/api/messages${qs({ box, q: search \|\| undefined })}`` | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:21) |
| Thread | ``/api/messages/${id}`` | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:64) |
| Thread | `api.post('/api/messages')` | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:76) |
| Thread | `'/api/messages'` | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:76) |
| Thread | `api.post(`/api/messages/${id}/archive`)` | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:77) |
| Thread | ``/api/messages/${id}/archive`` | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:77) |
| Compose | `'/api/messages/recipients'` | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:113) |
| Compose | `api.post('/api/messages')` | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:118) |
| Compose | `'/api/messages'` | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:118) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Messages | Button | onClick=() => setCompose({}) | Nouveau message | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:26) |
| Messages | Tabs | value=box ; onChange=(b) => { setBox(b); setSp({}); } ; tabs=[{ id: 'reception', label: 'Réception', count: unread \|\| undefined }, { id: 'envoyes', label: 'Envoyés' }, { id: 'archives', label: 'Archives' }] |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:30) |
| Messages | Input | placeholder=Rechercher ; value=search ; onChange=(e) => setSearch(e.target.value) ; aria-label=Rechercher dans les messages |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:31) |
| Messages | button | onClick=() => setSp({ m: m.id }) | <Avatar name={box === 'envoyes' ? m.recipients : m.sender_name} size="sm" /> <span className="msg-item-main"> <span className="msg-item-top"><span className="truncate strong">{box === 'envoyes' ? `À : ${m.recipients}` : m.sender_name}</span><span className="xsmall muted">{relative(m.created_at)}</span></span> <span className="msg-item-subject truncate">{m.priority === 'haute' && <AlertTriangle size={13} className="text-danger" aria-label="Priorité haute" />} {m.subject}</span> <span className="xsmall muted truncate">{m.excerpt}</span> {box === 'envoyes' && <span className="xsmall muted"><CheckCheck size={12} /> Lu par {m.read_n}/{m.to_n}</span>} {box === 'reception' && !m.read_at && m.reminder_count > 0 && <Badge tone="warning">Non lu depuis {m.reminder_count === 2 ? 10 : 5} min</Badge>} </span> | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:37) |
| Thread | Button | onClick=() => archive.run(box !== 'archives') | {box === 'archives' ? 'Restaurer' : 'Archiver'} | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:83) |
| Thread | Button | onClick=onClose ; aria-label=Fermer |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:84) |
| Thread | Textarea | placeholder=askAi ? 'Question de travail pour l’assistant (recherche, synthèse, brainstorming)…' : 'Votre réponse…' ; value=body ; onChange=(e) => setBody(e.target.value) ; aria-label=Votre réponse |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:100) |
| Thread | label |  | <input type="checkbox" checked={askAi} onChange={(e) => setAskAi(e.target.checked)} /> <Sparkles size={14} /> Demander à l’assistant IA (réponse à vous seul) | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:102) |
| Thread | input | type=checkbox ; onChange=(e) => setAskAi(e.target.checked) |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:102) |
| Thread | Button | onClick=() => reply.run({ to: askAi ? ['assistant'] : participants, body, parent_id: last.id }) | {askAi ? 'Demander' : 'Répondre'} | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:103) |
| Compose | Modal | title=Nouveau message |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:123) |
| Compose | Button | onClick=onClose | Annuler | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:124) |
| Compose | Button | onClick=() => send.run({ to, ...f }) | Envoyer | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:124) |
| Compose | Field | label=Destinataires ; required=true |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:126) |
| Compose | button | onClick=() => setTo(to.filter((x) => x !== id)) ; aria-label=`Retirer ${name(id)}` | <X size={12} /> | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:128) |
| Compose | Select | placeholder=Ajouter un destinataire… ; value=pick ; onChange=(e) => { if (e.target.value) setTo([...to, e.target.value]); setPick(''); } ; options=options ; aria-label=Ajouter un destinataire |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:129) |
| Compose | Field | label=Objet ; required=true |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:132) |
| Compose | Input | value=f.subject ; onChange=(e) => setF({ ...f, subject: e.target.value }) |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:132) |
| Compose | Field | label=Message ; required=true |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:133) |
| Compose | Textarea | value=f.body ; onChange=(e) => setF({ ...f, body: e.target.value }) |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:133) |
| Compose | Field | label=Priorité |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:134) |
| Compose | Select | value=f.priority ; onChange=(e) => setF({ ...f, priority: e.target.value }) ; options=[{ value: 'normale', label: 'Normale' }, { value: 'haute', label: 'Haute' }] |  | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:134) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Messages | id = reception | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:30) |
| Messages | label = Réception | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:30) |
| Messages | id = envoyes | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:30) |
| Messages | label = Envoyés | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:30) |
| Messages | id = archives | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:30) |
| Messages | label = Archives | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:30) |
| Compose | label = Assistant IA (questions de travail) | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:121) |
| Compose | label = Normale | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:134) |
| Compose | label = Haute | [Messages.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Messages.tsx:134) |

## MyAssistant.tsx — CRM-032

Source : [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [MyAssistant (export)](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:18), [Day](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:40), [MailBox](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:106), [onFiles](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:119), [MailDetail](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:173), [MailBriefing](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:230), [MailDrafts](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:253), [Accounts](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:285), [Findings](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:319).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/work`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Day | `'/api/assistant-admin/day'` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:41) |
| MailBox | ``/api/mail?${qs}`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:115) |
| MailBox | `'/api/mail/import'` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:116) |
| MailBox | ``/api/xlsx/mail${qs ? `?${qs}` : ''}`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:138) |
| MailDetail | ``/api/mail/${id}`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:174) |
| MailDetail | `api.patch(`/api/mail/${id}`)` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:177) |
| MailDetail | ``/api/mail/${id}`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:177) |
| MailDetail | `api.post(`/api/mail/${id}/task`)` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:178) |
| MailDetail | ``/api/mail/${id}/task`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:178) |
| MailBriefing | `'/api/mail/briefing'` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:231) |
| MailDrafts | ``/api/mail/${id}/drafts`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:256) |
| MailDrafts | `api.post(`/api/mail/${id}/draft`)` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:258) |
| MailDrafts | ``/api/mail/${id}/draft`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:258) |
| MailDrafts | `api.patch(`/api/mail-drafts/${v.id}`)` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:261) |
| MailDrafts | ``/api/mail-drafts/${v.id}`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:261) |
| Accounts | `'/api/mail/accounts'` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:286) |
| Accounts | `api.post('/api/mail/accounts')` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:288) |
| Accounts | `'/api/mail/accounts'` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:288) |
| Accounts | `api.post(`/api/mail/accounts/${id}/sync`)` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:289) |
| Accounts | ``/api/mail/accounts/${id}/sync`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:289) |
| Accounts | `api.del(`/api/mail/accounts/${id}`)` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:290) |
| Accounts | ``/api/mail/accounts/${id}`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:290) |
| Accounts | `api.post(`/api/mail/accounts/${v.id}/drafts`)` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:291) |
| Accounts | ``/api/mail/accounts/${v.id}/drafts`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:291) |
| Findings | ``/api/assistant-admin/findings?${qs}`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:325) |
| Findings | `api.post(`/api/assistant-admin/findings/${b.id}`)` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:326) |
| Findings | ``/api/assistant-admin/findings/${b.id}`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:326) |
| Findings | `api.post('/api/assistant-admin/controls/run')` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:327) |
| Findings | `'/api/assistant-admin/controls/run'` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:327) |
| Findings | ``/api/xlsx/findings?${qs}`` | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:335) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| MyAssistant | Tabs | value=tab ; onChange=(t) => setSp({ tab: t }) ; tabs=[         { id: 'journee', label: <><CalendarClock aria-hidden /> Ma journée</> },         { id: 'courrier', label: <><Mail aria-hidden /> Courrier</> },         { id: 'controles', label: <><ShieldCheck aria-hidden /> Contrôles</> },       ] |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:26) |
| Day | Link | to=b.link | {b.title} | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:55) |
| Day | Link | to=/validations | {a.entity_label ?? a.kind} | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:78) |
| Day | Link | to=/rh?vue=conges | {l.ref} — {l.employee} | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:79) |
| Day | Link | to=/mon-assistant?tab=courrier | Ouvrir | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:83) |
| Day | Link | to=`/mon-assistant?tab=courrier&mail=${m.id}` | <strong>{m.from_name \|\| m.from_addr}</strong> — {m.subject} | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:85) |
| Day | Link | to=/mon-assistant?tab=controles | Tout voir | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:89) |
| Day | Link | to=f.link | {f.title} | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:91) |
| Day | Link | to=e.link | {e.title} | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:96) |
| MailBox | Select | value=owner ; onChange=(e) => { setOwner(e.target.value); setSel(null); } ; options=r.data.mailboxes.map((b: any, i: number) => ({ value: i === 0 ? '' : b.id, label: i === 0 ? b.full_name : `Courrier de ${b.full_name} (délégué)` })) ; aria-label=Boîte |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:130) |
| MailBox | Segmented | label=Statut ; value=status ; onChange=setStatus ; options=[{ id: 'actifs', label: 'À traiter' }, { id: 'traite', label: 'Traités' }, { id: 'archive', label: 'Archivés' }, { id: '', label: 'Tous' }] |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:131) |
| MailBox | Select | value=cat ; onChange=(e) => setCat(e.target.value) ; options=[{ value: '', label: 'Toutes catégories' }, ...Object.entries(MAIL_CAT).map(([value, label]) => ({ value, label }))] ; aria-label=Catégorie |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:132) |
| MailBox | Input | placeholder=Rechercher… ; value=search ; onChange=(e) => setSearch(e.target.value) ; aria-label=Rechercher |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:133) |
| MailBox | input | type=file ; onChange=(e) => onFiles(e.target.files) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:135) |
| MailBox | Button | onClick=() => file.current?.click() | Importer des .eml | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:136) |
| MailBox | Button | onClick=() => setAccounts(true) | Comptes de messagerie | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:137) |
| MailBox | ExcelButton | url=`/api/xlsx/mail${qs ? `?${qs}` : ''}` |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:138) |
| MailBox | button | type=button ; onClick=() => setSel(m.id) | <div className="row"><strong className="truncate">{m.from_name \|\| m.from_addr}</strong><span className="spacer" /><span className="xsmall muted">{relative(m.received_at)}</span></div> <div className="truncate">{m.subject \|\| '(sans objet)'}</div> <div className="xsmall muted mail-snippet">{m.summary}</div> <div className="mail-tags"> {m.priority !== 'normale' && <Badge tone={PRIO[m.priority][1]}>{PRIO[m.priority][0]}</Badge>} {m.action_required && m.status !== 'traite' && <Badge tone="warning">Action demandée</Badge>} <Badge tone="neutral" dot={false}>{MAIL_CAT[m.category] ?? m.category}</Badge> {m.attachments > 0 && <Paperclip className="ic-xs muted" aria-label="Pièces jointes" />} </div> | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:149) |
| MailDetail | Button | onClick=onClose | Fermer | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:184) |
| MailDetail | Link | to=/taches | Tâche {m.task_ref} | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:205) |
| MailDetail | Button | onClick=() => setTask({ title: `Courrier : ${m.subject}`.slice(0, 300), due_date: m.detected_dates.find((d: string) => d >= new Date().toISOString().slice(0, 10)) ?? '', urgent: m.priority === 'haute', important: true }) | Créer une tâche | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:205) |
| MailDetail | Button | onClick=() => st.run('traite') | Marquer traité | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:206) |
| MailDetail | Button | onClick=() => st.run('archive') | Archiver | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:207) |
| MailDetail | Button | onClick=() => st.run('non_lu') | Non lu | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:208) |
| MailDetail | Modal | title=Créer une tâche à partir du message |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:215) |
| MailDetail | Button | onClick=() => setTask(null) | Annuler | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:215) |
| MailDetail | Button | onClick=() => mk.run({ ...task, due_date: task.due_date \|\| null }) | Créer | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:215) |
| MailDetail | Field | label=Intitulé |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:217) |
| MailDetail | Input | value=task.title ; onChange=(e) => setTask({ ...task, title: e.target.value }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:217) |
| MailDetail | Field | label=Échéance |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:218) |
| MailDetail | Input | type=date ; value=task.due_date ; onChange=(e) => setTask({ ...task, due_date: e.target.value }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:218) |
| MailDetail | label |  | <input type="checkbox" checked={task.urgent} onChange={(e) => setTask({ ...task, urgent: e.target.checked })} /> Urgent | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:220) |
| MailDetail | input | type=checkbox ; onChange=(e) => setTask({ ...task, urgent: e.target.checked }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:220) |
| MailDetail | label |  | <input type="checkbox" checked={task.important} onChange={(e) => setTask({ ...task, important: e.target.checked })} /> Important | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:221) |
| MailDetail | input | type=checkbox ; onChange=(e) => setTask({ ...task, important: e.target.checked }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:221) |
| MailBriefing | button | type=button ; onClick=() => onOpen(m.id) | <span className={`mail-score s${m.score >= 70 ? 3 : m.score >= 40 ? 2 : 1}`} title="Score de priorité">{m.score}</span> <span className="mail-prio-main"><strong className="truncate">{m.subject \|\| '(sans objet)'}</strong><span className="xsmall muted">{m.from_name \|\| m.from_addr} · {m.reasons.join(' · ') \|\| 'à lire'}</span> <span className="xsmall">{m.recommendations[0]}</span></span> {m.draft_id && <Badge tone="success">Brouillon prêt</Badge>} | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:239) |
| MailDrafts | Button | onClick=() => mk.run(undefined) | {d ? 'Préparer un autre brouillon' : 'Préparer la réponse (brouillon)'} | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:268) |
| MailDrafts | Textarea | value=edit[d.id] ?? d.body ; onChange=(e) => setEdit({ ...edit, [d.id]: e.target.value }) ; aria-label=Brouillon de réponse |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:273) |
| MailDrafts | Button | onClick=() => save.run({ id: d.id, body: edit[d.id] }) | Enregistrer | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:275) |
| MailDrafts | Button | onClick=() => navigator.clipboard?.writeText(edit[d.id] ?? d.body) | Copier | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:276) |
| MailDrafts | Button | onClick=() => save.run({ id: d.id, status: 'abandonne' }) | Abandonner | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:277) |
| Accounts | Modal | title=Comptes de messagerie (IMAP) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:293) |
| Accounts | DataTable | columns=[           { key: 'label', label: 'Compte', render: (a: any) => <><strong>{a.label}</strong><div className="xsmall muted">{a.username} @ {a.imap_host}:{a.imap_port}</div></> },           { key: 'sync', label: 'Dernière relève', render: (a: any) => a.last_error ? <span className="text-danger small">{a.last_error}</span> : a.last_sync_at ? dateTime(a.last_sync_at) : 'Jamais' },           { key: 'drafts', label: 'Brouillons', render: (a: any) => <label className="checkbox xsmall" title="Les brouillons de réponse préparés par l’assistant sont ajoutés au dossier Brouillons de la boîte ; rien n’est envoyé."><input type="checkbox" checked={a.save_drafts} onChange={(e) => drafts.run({ id: a.id, save_drafts: e.target.checked, drafts_mailbox: a.drafts_mailbox })} />Déposer dans « {a.drafts_mailbox} »</label> },           { key: 'act', label: '', render: (a: any) => <div className="row"><Button size="sm" icon={<RefreshCw />} loading={sync.isPending} onClick={() => sync.run(a.id)}>Relever</Button><Button size="sm" variant="ghost" iconOnly icon={<Trash2 />} aria-label="Supprimer" onClick={() => del.run(a.id)} /></div> },         ] |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:295) |
| Accounts | label | title=Les brouillons de réponse préparés par l’assistant sont ajoutés au dossier Brouillons de la boîte ; rien n’est envoyé. | <input type="checkbox" checked={a.save_drafts} onChange={(e) => drafts.run({ id: a.id, save_drafts: e.target.checked, drafts_mailbox: a.drafts_mailbox })} /> Déposer dans « {a.drafts_mailbox} » | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:298) |
| Accounts | input | type=checkbox ; onChange=(e) => drafts.run({ id: a.id, save_drafts: e.target.checked, drafts_mailbox: a.drafts_mailbox }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:298) |
| Accounts | Button | onClick=() => sync.run(a.id) | Relever | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:299) |
| Accounts | Button | onClick=() => del.run(a.id) ; aria-label=Supprimer |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:299) |
| Accounts | Field | label=Libellé |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:304) |
| Accounts | Input | placeholder=Boîte professionnelle ; value=f.label ; onChange=(e) => setF({ ...f, label: e.target.value }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:304) |
| Accounts | Field | label=Serveur IMAP |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:305) |
| Accounts | Input | placeholder=imap.exemple.ci ; value=f.imap_host ; onChange=(e) => setF({ ...f, imap_host: e.target.value }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:305) |
| Accounts | Field | label=Port |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:306) |
| Accounts | Input | type=number ; value=f.imap_port ; onChange=(e) => setF({ ...f, imap_port: Number(e.target.value) }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:306) |
| Accounts | Field | label=Dossier |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:307) |
| Accounts | Input | value=f.mailbox ; onChange=(e) => setF({ ...f, mailbox: e.target.value }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:307) |
| Accounts | Field | label=Identifiant |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:308) |
| Accounts | Input | value=f.username ; onChange=(e) => setF({ ...f, username: e.target.value }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:308) |
| Accounts | Field | label=Mot de passe |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:309) |
| Accounts | Input | type=password ; value=f.password ; onChange=(e) => setF({ ...f, password: e.target.value }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:309) |
| Accounts | label |  | <input type="checkbox" checked={f.imap_secure} onChange={(e) => setF({ ...f, imap_secure: e.target.checked })} /> Connexion chiffrée (TLS) | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:311) |
| Accounts | input | type=checkbox ; onChange=(e) => setF({ ...f, imap_secure: e.target.checked }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:311) |
| Accounts | Button | onClick=() => add.run(f) | Enregistrer le compte | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:312) |
| Findings | Segmented | label=Statut ; value=status ; onChange=setStatus ; options=[{ id: 'ouvert', label: 'Ouverts' }, { id: 'ignore', label: 'Écartés' }, { id: 'resolu', label: 'Résolus' }] |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:332) |
| Findings | Select | value=check ; onChange=(e) => setCheck(e.target.value) ; options=[{ value: '', label: 'Tous les contrôles' }, ...(r.data?.checks ?? []).map((c: any) => ({ value: c.code, label: c.label }))] ; aria-label=Contrôle |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:333) |
| Findings | ExcelButton | url=`/api/xlsx/findings?${qs}` |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:335) |
| Findings | Button | onClick=() => run.run(undefined) | Lancer les contrôles | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:336) |
| Findings | DataTable | columns=[               { key: 'severity', label: 'Niveau', render: (f: any) => <Badge tone={SEV[f.severity][1]}>{SEV[f.severity][0]}</Badge> },               { key: 'title', label: 'Constat', render: (f: any) => <><div className="xsmall muted">{f.check_label}</div><strong>{f.link ? <Link to={f.link}>{f.title}</Link> : f.title}</strong>{f.detail && <div className="xsmall muted">{f.detail}</div>}</> },               { key: 'reco', label: 'Recommandation', render: (f: any) => <span className="small">{f.recommendation}</span>, mobile: 'hide' },               { key: 'who', label: 'Concerne', render: (f: any) => <>{f.owner_name ?? 'Service'}{f.department_label && <div><DeptChip label={f.department_label} color={f.department_color} /></div>}</>, mobile: 'hide' },               { key: 'seen', label: 'Depuis', render: (f: any) => <span className="small">{relative(f.first_seen_at)}</span> },               { key: 'act', label: '', render: (f: any) => f.status === 'ouvert' ? <Button size="sm" variant="ghost" onClick={() => setDismiss({ id: f.id, title: f.title, comment: '' })}>Écarter</Button>                 : f.status === 'ignore' ? <div className="xsmall"><span className="muted">« {f.comment} » — {f.handled_by_name}</span><br /><Button size="sm" variant="ghost" icon={<Undo2 />} onClick={() => handle.run({ id: f.id, status: 'ouvert' })}>Rouvrir</Button></div>                 : <span className="xsmall muted">Résolu {relative(f.resolved_at)}</span> },             ] |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:340) |
| Findings | Link | to=f.link | {f.title} | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:344) |
| Findings | Button | onClick=() => setDismiss({ id: f.id, title: f.title, comment: '' }) | Écarter | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:348) |
| Findings | Button | onClick=() => handle.run({ id: f.id, status: 'ouvert' }) | Rouvrir | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:349) |
| Findings | Modal | title=Écarter ce constat |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:354) |
| Findings | Button | onClick=() => setDismiss(null) | Annuler | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:355) |
| Findings | Button | onClick=() => handle.run({ id: dismiss.id, status: 'ignore', comment: dismiss.comment }) | Écarter | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:355) |
| Findings | Field | label=Motif (obligatoire) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:356) |
| Findings | Textarea | value=dismiss.comment ; onChange=(e) => setDismiss({ ...dismiss, comment: e.target.value }) |  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:356) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| MyAssistant | id = journee | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:27) |
| MyAssistant | id = courrier | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:28) |
| MyAssistant | id = controles | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:29) |
| MailBox | id = actifs | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:131) |
| MailBox | label = À traiter | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:131) |
| MailBox | id = traite | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:131) |
| MailBox | label = Traités | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:131) |
| MailBox | id = archive | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:131) |
| MailBox | label = Archivés | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:131) |
| MailBox | id =  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:131) |
| MailBox | label = Tous | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:131) |
| MailBox | label = Toutes catégories | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:132) |
| Accounts | label =  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:287) |
| Accounts | label =  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:288) |
| Accounts | key = label | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:296) |
| Accounts | label = Compte | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:296) |
| Accounts | key = sync | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:297) |
| Accounts | label = Dernière relève | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:297) |
| Accounts | key = drafts | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:298) |
| Accounts | label = Brouillons | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:298) |
| Accounts | key = act | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:299) |
| Accounts | label =  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:299) |
| Findings | id = ouvert | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:332) |
| Findings | label = Ouverts | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:332) |
| Findings | id = ignore | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:332) |
| Findings | label = Écartés | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:332) |
| Findings | id = resolu | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:332) |
| Findings | label = Résolus | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:332) |
| Findings | label = Tous les contrôles | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:333) |
| Findings | key = severity | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:343) |
| Findings | label = Niveau | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:343) |
| Findings | key = title | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:344) |
| Findings | label = Constat | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:344) |
| Findings | key = reco | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:345) |
| Findings | label = Recommandation | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:345) |
| Findings | key = who | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:346) |
| Findings | label = Concerne | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:346) |
| Findings | key = seen | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:347) |
| Findings | label = Depuis | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:347) |
| Findings | key = act | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:348) |
| Findings | label =  | [MyAssistant.tsx](C:/wamp64/www/comsig-crm/web/src/pages/MyAssistant.tsx:348) |

## NewQuote.tsx — CRM-021

Source : [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [k](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:15), [NewQuote (export)](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:22), [add](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:58), [upd](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:59), [submit](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:64).

Dépendances locales : `../components/PriceBasis`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| NewQuote | ``/api/quotes/new/clients?q=${encodeURIComponent(term)}`` | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:34) |
| NewQuote | ``/api/quotes/new/context?organization_id=${orgId}`` | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:35) |
| NewQuote | `'/api/quotes/new/costs'` | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:36) |
| NewQuote | `api.post('/api/quotes/simulate')` | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:54) |
| NewQuote | `'/api/quotes/simulate'` | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:54) |
| NewQuote | `api.post('/api/quotes/new')` | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:60) |
| NewQuote | `'/api/quotes/new'` | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:60) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| NewQuote | Segmented | label=Client ; value=mode ; onChange=setMode ; options=[{ id: 'existant', label: 'Client existant' }, { id: 'nouveau', label: 'Nouveau client' }] |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:83) |
| NewQuote | Field | label=Rechercher |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:86) |
| NewQuote | Input | placeholder=Raison sociale… ; value=term ; onChange=(e) => setTerm(e.target.value) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:86) |
| NewQuote | Field | label=Client ; required=true |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:87) |
| NewQuote | Select | placeholder=Choisir… ; value=orgId ; onChange=(e) => setOrgId(e.target.value) ; options=(clients.data?.rows ?? []).map((o) => ({ value: o.id, label: o.legal_name })) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:87) |
| NewQuote | Field | label=Opportunité |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:89) |
| NewQuote | Select | placeholder=Nouvelle opportunité ; value=opp ; onChange=(e) => setOpp(e.target.value) ; options=ctx.data.opportunities.map((o: any) => ({ value: o.id, label: `${o.ref} — ${o.title} (${o.stage_label})` })) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:89) |
| NewQuote | Field | label=Interlocuteur |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:90) |
| NewQuote | Select | placeholder=Nouveau contact… ; value=contact.contact_id ; onChange=(e) => setContact({ ...contact, contact_id: e.target.value }) ; options=ctx.data.contacts.map((c: any) => ({ value: c.id, label: `${c.name}${c.job_title ? ` · ${c.job_title}` : ''}` })) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:90) |
| NewQuote | Field | label=Raison sociale ; required=true |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:95) |
| NewQuote | Input | value=client.legal_name ; onChange=(e) => setClient({ ...client, legal_name: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:95) |
| NewQuote | Field | label=Personne ressource (interlocuteur) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:96) |
| NewQuote | Input | placeholder=Prénom et nom ; value=client.resource_person ; onChange=(e) => setClient({ ...client, resource_person: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:96) |
| NewQuote | Field | label=Fonction occupée |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:97) |
| NewQuote | Input | value=client.resource_title ; onChange=(e) => setClient({ ...client, resource_title: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:97) |
| NewQuote | Field | label=Téléphone |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:98) |
| NewQuote | Input | value=client.phone ; onChange=(e) => setClient({ ...client, phone: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:98) |
| NewQuote | Field | label=E-mail |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:99) |
| NewQuote | Input | value=client.email ; onChange=(e) => setClient({ ...client, email: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:99) |
| NewQuote | Field | label=Nom de l’interlocuteur |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:104) |
| NewQuote | Input | value=contact.last_name ; onChange=(e) => setContact({ ...contact, last_name: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:104) |
| NewQuote | Field | label=Prénom |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:105) |
| NewQuote | Input | value=contact.first_name ; onChange=(e) => setContact({ ...contact, first_name: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:105) |
| NewQuote | Field | label=E-mail |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:106) |
| NewQuote | Input | value=contact.email ; onChange=(e) => setContact({ ...contact, email: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:106) |
| NewQuote | Field | label=Téléphone |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:107) |
| NewQuote | Input | value=contact.phone ; onChange=(e) => setContact({ ...contact, phone: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:107) |
| NewQuote | Button | onClick=() => add({ source: 'stock', stock_item_id: items[0]?.id, label: items[0]?.label, unit: items[0]?.unit }) | Matériau / support | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:114) |
| NewQuote | Button | onClick=() => add({ source: 'cout', label: '', unit: 'forfait', unit_cost: 0 }) | Prestation au coût | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:115) |
| NewQuote | Button | onClick=() => add({ source: 'catalogue', catalog_item_id: services[0]?.id, label: services[0]?.label, unit: services[0]?.unit, unit_price: services[0]?.unit_price }) | Prestation catalogue | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:116) |
| NewQuote | Input | type=number ; value=markup ?? '' ; onChange=(e) => setMarkup(e.target.value === '' ? null : Number(e.target.value)) ; aria-label=Taux appliqué (%) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:121) |
| NewQuote | Button | onClick=() => setLines((x) => x.filter((y) => y.key !== l.key)) ; aria-label=Retirer la ligne |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:131) |
| NewQuote | Field | label=Article |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:134) |
| NewQuote | Select | value=l.stock_item_id ; onChange=(e) => { const it = items.find((x: any) => x.id === e.target.value); upd(l.key, { stock_item_id: e.target.value, label: it?.label, unit: it?.unit }); } ; options=items.map((x: any) => ({ value: x.id, label: `${x.label} — ${STOCK_KIND[x.kind]}${x.bom_lines ? ' (nomenclature)' : ''}` })) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:134) |
| NewQuote | Field | label=Prestation |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:135) |
| NewQuote | Select | value=l.catalog_item_id ; onChange=(e) => { const it = services.find((x: any) => x.id === e.target.value); upd(l.key, { catalog_item_id: e.target.value, label: it?.label, unit: it?.unit, unit_price: it?.unit_price }); } ; options=services.map((x: any) => ({ value: x.id, label: `${x.label} — ${money(x.unit_price)}/${x.unit}` })) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:135) |
| NewQuote | Field | label=Libellé sur le devis |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:136) |
| NewQuote | Input | value=l.label ; onChange=(e) => upd(l.key, { label: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:136) |
| NewQuote | Field | label=Coût unitaire (FCFA) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:137) |
| NewQuote | Input | type=number ; value=l.unit_cost ?? 0 ; onChange=(e) => upd(l.key, { unit_cost: Number(e.target.value) }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:137) |
| NewQuote | Field | label=Quantité |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:138) |
| NewQuote | Input | type=number ; value=l.quantity ; onChange=(e) => upd(l.key, { quantity: Number(e.target.value) }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:138) |
| NewQuote | Field | label=Unité |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:139) |
| NewQuote | Input | value=l.unit ; onChange=(e) => upd(l.key, { unit: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:139) |
| NewQuote | Field | label=Prix d’achat retenu |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:140) |
| NewQuote | PriceBasis | onChange=(v) => upd(l.key, v) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:140) |
| NewQuote | Field | label=Taux (%) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:141) |
| NewQuote | Input | type=number ; value=l.markup_pct ?? markup ?? '' ; onChange=(e) => upd(l.key, { markup_pct: e.target.value === '' ? null : Number(e.target.value) }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:141) |
| NewQuote | Field | label=Remise (%) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:142) |
| NewQuote | Input | type=number ; value=l.discount_pct ; onChange=(e) => upd(l.key, { discount_pct: Number(e.target.value) }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:142) |
| NewQuote | Field | label=Intitulé ; required=true |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:160) |
| NewQuote | Input | placeholder=Ex. Fabrication et pose de 2 panneaux 4×3 ; value=head.title ; onChange=(e) => setHead({ ...head, title: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:160) |
| NewQuote | Field | label=Type de document |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:161) |
| NewQuote | Segmented | label=Type ; value=head.doc_type ; onChange=(v) => setHead({ ...head, doc_type: v }) ; options=[{ id: 'devis', label: 'Devis' }, { id: 'proforma', label: 'Facture proforma' }] |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:161) |
| NewQuote | Field | label=Validité jusqu’au |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:162) |
| NewQuote | Input | type=date ; value=head.valid_until ; onChange=(e) => setHead({ ...head, valid_until: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:162) |
| NewQuote | Field | label=Conditions de paiement |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:163) |
| NewQuote | Input | placeholder=50 % à la commande, solde à la pose ; value=head.payment_terms ; onChange=(e) => setHead({ ...head, payment_terms: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:163) |
| NewQuote | Field | label=Conditions particulières |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:164) |
| NewQuote | Textarea | value=head.conditions ; onChange=(e) => setHead({ ...head, conditions: e.target.value }) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:164) |
| NewQuote | Field | label=Remise globale (%) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:180) |
| NewQuote | Input | type=number ; value=globalDiscount ; onChange=(e) => setGlobalDiscount(Math.min(100, Math.max(0, Number(e.target.value) \|\| 0))) |  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:180) |
| NewQuote | Button | onClick=() => submit(true) | Créer et soumettre | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:184) |
| NewQuote | Button | onClick=() => submit(false) | Enregistrer en brouillon | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:185) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| NewQuote | title =  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:31) |
| add | label =  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:58) |
| NewQuote | label = Devis et proformas | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:79) |
| NewQuote | label = Nouveau | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:79) |
| NewQuote | id = existant | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:83) |
| NewQuote | label = Client existant | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:83) |
| NewQuote | id = nouveau | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:83) |
| NewQuote | label = Nouveau client | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:83) |
| NewQuote | label =  | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:115) |
| NewQuote | id = devis | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:161) |
| NewQuote | label = Devis | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:161) |
| NewQuote | id = proforma | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:161) |
| NewQuote | label = Facture proforma | [NewQuote.tsx](C:/wamp64/www/comsig-crm/web/src/pages/NewQuote.tsx:161) |

## Opportunities.tsx — CRM-035

Source : [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Opportunities (export)](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:13), [set](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:21).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/auth`, `../lib/api`, `../lib/format`, `../components/ui`, `../components/forms`, `../components/StageMove`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Opportunities | ``/api/opportunities${qs(params)}`` | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:28) |
| Opportunities | `'/api/pipeline/stages'` | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:29) |
| Opportunities | ``/api/opportunities${qs({ ...params, format: 'xlsx' })}`` | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:56) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Opportunities | form | onSubmit=(e) => { e.preventDefault(); set({ q }); } |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:40) |
| Opportunities | Input | placeholder=Opportunité, client, référence… ; value=q ; onChange=(e) => setQ(e.target.value) ; aria-label=Rechercher |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:40) |
| Opportunities | Select | placeholder=Tous les commerciaux ; value=sp.get('owner') ?? '' ; onChange=(e) => set({ owner: e.target.value }) ; options=commercials.map((u) => ({ value: u.id, label: u.full_name })) ; aria-label=Commercial |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:41) |
| Opportunities | Select | placeholder=Toutes offres ; value=sp.get('offer') ?? '' ; onChange=(e) => set({ offer: e.target.value }) ; options=(lookups.offer_type ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Offre |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:42) |
| Opportunities | Select | placeholder=Tous secteurs ; value=sp.get('sector') ?? '' ; onChange=(e) => set({ sector: e.target.value }) ; options=(lookups.sector ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Secteur |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:43) |
| Opportunities | Select | placeholder=Toutes communes ; value=sp.get('commune') ?? '' ; onChange=(e) => set({ commune: e.target.value }) ; options=(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Commune |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:44) |
| Opportunities | Select | placeholder=Tout montant ; value=sp.get('min') ?? '' ; onChange=(e) => set({ min: e.target.value }) ; options=[{ value: '1000000', label: '≥ 1 M' }, { value: '5000000', label: '≥ 5 M' }, { value: '10000000', label: '≥ 10 M' }, { value: '25000000', label: '≥ 25 M' }] ; aria-label=Montant minimum |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:45) |
| Opportunities | Select | value=status ; onChange=(e) => set({ status: e.target.value }) ; options=[{ value: 'ouvertes', label: 'Ouvertes' }, { value: 'gagnees', label: 'Gagnées' }, { value: 'perdues', label: 'Perdues / suspendues' }, { value: 'toutes', label: 'Toutes' }] ; aria-label=Statut |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:46) |
| Opportunities | label |  | <input type="checkbox" checked={sp.get('inactive') === '1'} onChange={(e) => set({ inactive: e.target.checked ? '1' : '' })} /> Sans activité récente | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:47) |
| Opportunities | input | type=checkbox ; onChange=(e) => set({ inactive: e.target.checked ? '1' : '' }) |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:47) |
| Opportunities | Segmented | label=Affichage ; value=view ; onChange=(v) => set({ view: v === 'kanban' ? '' : v }) ; options=[{ id: 'kanban', label: 'Kanban', icon: <Columns3 /> }, { id: 'list', label: 'Liste', icon: <List /> }] |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:55) |
| Opportunities | ExcelButton | url=`/api/opportunities${qs({ ...params, format: 'xlsx' })}` |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:56) |
| Opportunities | Button | onClick=() => setCreate(true) | Nouvelle opportunité | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:57) |
| Opportunities | article | onClick=() => nav(`/opportunites/${o.id}`) ; aria-label=`${o.title}, ${o.organization_name}, ${money(o.amount)}` |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:82) |
| Opportunities | DataTable | columns=[               { key: 'title', label: 'Opportunité', sortable: true, render: (o: any) => <><div className="cell-title">{o.title}</div><div className="cell-sub">{o.ref} · {o.organization_name}</div></> },               { key: 'stage', label: 'Étape', sortable: true, render: (o: any) => <Badge tone={o.is_won ? 'success' : o.is_closed ? 'neutral' : 'info'}>{o.stage_label}</Badge> },               { key: 'amount', label: 'Montant', num: true, sortable: true, render: (o: any) => money(o.amount) },               { key: 'weighted', label: 'Pondéré', num: true, sortable: true, render: (o: any) => moneyShort(o.weighted), mobile: 'hide' },               { key: 'close', label: 'Clôture', sortable: true, render: (o: any) => <span className="nowrap small" style={o.is_overdue ? { color: 'var(--danger)' } : undefined}>{date(o.expected_close_date)}</span> },               { key: 'owner', label: 'Responsable', sortable: true, render: (o: any) => <span className="small">{o.owner_name}</span>, mobile: 'hide' },               { key: 'activity', label: 'Activité', sortable: true, render: (o: any) => o.is_inactive ? <Badge tone="warning">{relative(o.last_activity_at)}</Badge> : <span className="small muted">{relative(o.last_activity_at)}</span>, mobile: 'hide' },             ] |  | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:101) |
| Opportunities | Button | onClick=() => setCreate(true) | Nouvelle opportunité | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:103) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Opportunities | label = ≥ 1 M | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:45) |
| Opportunities | label = ≥ 5 M | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:45) |
| Opportunities | label = ≥ 10 M | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:45) |
| Opportunities | label = ≥ 25 M | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:45) |
| Opportunities | label = Ouvertes | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:46) |
| Opportunities | label = Gagnées | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:46) |
| Opportunities | label = Perdues / suspendues | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:46) |
| Opportunities | label = Toutes | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:46) |
| Opportunities | id = kanban | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:55) |
| Opportunities | label = Kanban | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:55) |
| Opportunities | id = list | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:55) |
| Opportunities | label = Liste | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:55) |
| Opportunities | key = title | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:105) |
| Opportunities | label = Opportunité | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:105) |
| Opportunities | key = stage | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:106) |
| Opportunities | label = Étape | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:106) |
| Opportunities | key = amount | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:107) |
| Opportunities | label = Montant | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:107) |
| Opportunities | key = weighted | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:108) |
| Opportunities | label = Pondéré | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:108) |
| Opportunities | key = close | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:109) |
| Opportunities | label = Clôture | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:109) |
| Opportunities | key = owner | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:110) |
| Opportunities | label = Responsable | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:110) |
| Opportunities | key = activity | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:111) |
| Opportunities | label = Activité | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:111) |
| Opportunities | useCan() | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:15) |
| Opportunities | can('opportunities', 'export') | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:56) |
| Opportunities | can('opportunities', 'create') | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:57) |
| Opportunities | can('opportunities', 'update') | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:82) |
| Opportunities | can('opportunities', 'create') | [Opportunities.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Opportunities.tsx:103) |

## OpportunityDetail.tsx — CRM-036

Source : [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [BriefEditor](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:17), [FeasibilityCard](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:39), [OpportunityDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:69).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/forms`, `../components/StageMove`, `../components/Documents`, `./OrganizationDetail`, `../components/Layout`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| BriefEditor | `api.put(`/api/opportunities/${o.id}/brief`)` | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:21) |
| BriefEditor | ``/api/opportunities/${o.id}/brief`` | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:21) |
| FeasibilityCard | `api.put(`/api/opportunities/${o.id}/feasibility`)` | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:46) |
| FeasibilityCard | ``/api/opportunities/${o.id}/feasibility`` | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:46) |
| FeasibilityCard | `api.post(`/api/opportunities/${o.id}/internal-request`)` | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:47) |
| FeasibilityCard | ``/api/opportunities/${o.id}/internal-request`` | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:47) |
| OpportunityDetail | ``/api/opportunities/${id}`` | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:76) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| BriefEditor | Button | onClick=() => save.run(false) | Enregistrer | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:26) |
| BriefEditor | Button | onClick=() => save.run(true) | Valider le brief avec le client | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:26) |
| BriefEditor | Field | label=l ; required=req.includes(k) |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:29) |
| BriefEditor | Textarea | value=brief[k] ?? '' ; onChange=(e) => setBrief({ ...brief, [k]: e.target.value }) |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:30) |
| FeasibilityCard | Button | onClick=() => setReq(true) | Demande interne | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:50) |
| FeasibilityCard | Button | onClick=() => save.run(undefined) | Enregistrer | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:50) |
| FeasibilityCard | Field | label=Statut |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:52) |
| FeasibilityCard | Select | value=status ; onChange=(e) => setStatus(e.target.value) ; options=[{ value: 'non_evaluee', label: 'Non évaluée' }, { value: 'en_cours', label: 'En cours de vérification' }, { value: 'confirmee', label: 'Confirmée' }, { value: 'avec_reserve', label: 'Confirmée avec réserve' }, { value: 'impossible', label: 'Impossible' }] |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:52) |
| FeasibilityCard | Link | to=/planning | planning des faces | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:53) |
| FeasibilityCard | Field | label=Hypothèses, réserves, coûts |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:54) |
| FeasibilityCard | Textarea | value=notes ; onChange=(e) => setNotes(e.target.value) |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:54) |
| FeasibilityCard | Modal | title=Demande interne |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:56) |
| FeasibilityCard | Button | onClick=() => setReq(false) | Annuler | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:57) |
| FeasibilityCard | Button | onClick=() => send.run(undefined) | Envoyer | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:57) |
| FeasibilityCard | Field | label=Objet ; required=true |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:59) |
| FeasibilityCard | Input | value=r.subject ; onChange=(e) => setR({ ...r, subject: e.target.value }) |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:59) |
| FeasibilityCard | Field | label=Responsable ; required=true |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:60) |
| FeasibilityCard | Select | placeholder=Choisir… ; value=r.assigned_to ; onChange=(e) => setR({ ...r, assigned_to: e.target.value }) ; options=users.filter((u) => ['operations', 'technicien', 'finance', 'juridique', 'direction_commerciale'].includes(u.role_code)).map((u) => ({ value: u.id, label: `${u.full_name} — ${u.role_label}` })) |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:60) |
| FeasibilityCard | Field | label=Échéance ; required=true |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:61) |
| FeasibilityCard | Input | type=date ; value=r.due_date ; onChange=(e) => setR({ ...r, due_date: e.target.value }) |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:61) |
| FeasibilityCard | Field | label=Résultat attendu ; required=true |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:62) |
| FeasibilityCard | Textarea | value=r.expected ; onChange=(e) => setR({ ...r, expected: e.target.value }) |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:62) |
| OpportunityDetail | Link | to=`/organisations/${o.organization_id}` | {d.organization.legal_name} | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:94) |
| OpportunityDetail | Button | onClick=() => ai.open({ context_type: 'opportunity', context_id: o.id, prompt: 'Analyse cette opportunité' }) | Analyse IA | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:97) |
| OpportunityDetail | Button | onClick=() => setModal('edit') | Modifier | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:98) |
| OpportunityDetail | ButtonLink | to=`/circuits?nouveau=${o.id}` |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:99) |
| OpportunityDetail | Button | onClick=() => setMove(d.next_stage.code) | Passer à « {d.next_stage.label} » | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:100) |
| OpportunityDetail | Button | onClick=() => setMove('qualifie') | Rouvrir | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:101) |
| OpportunityDetail | Button | onClick=() => setMove('gagne') | Gagnée | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:114) |
| OpportunityDetail | Button | onClick=() => setMove('perdu') | Perdue | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:115) |
| OpportunityDetail | Button | onClick=() => setMove('suspendu') | Suspendue | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:116) |
| OpportunityDetail | Select | placeholder=Autre étape… ; value= ; onChange=(e) => e.target.value && setMove(e.target.value) ; options=stages.filter((s: any) => s.code !== o.stage_code).map((s: any) => ({ value: s.code, label: s.label })) ; aria-label=Aller à une étape |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:118) |
| OpportunityDetail | Link | to=`/campagnes/${d.campaign.id}` | {d.campaign.ref} | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:123) |
| OpportunityDetail | Link | to=`/opportunites/${x.id}` | {x.ref} — {x.title} | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:130) |
| OpportunityDetail | Button | onClick=() => setModal('interaction') | Consigner une interaction | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:134) |
| OpportunityDetail | Button | onClick=() => setModal('relance') | Programmer une relance | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:135) |
| OpportunityDetail | Button | onClick=() => setModal('task') | Créer une tâche | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:136) |
| OpportunityDetail | ButtonLink | to=`/devis/nouveau?opportunity=${o.id}` |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:137) |
| OpportunityDetail | ButtonLink | to=`/devis/nouveau?opportunity=${o.id}&type=proforma` |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:138) |
| OpportunityDetail | Tabs | value=tab ; onChange=setTab ; tabs=[             { id: 'summary', label: 'Synthèse' }, { id: 'brief', label: 'Brief et faisabilité' }, { id: 'activities', label: 'Activités', count: d.activities.length },             { id: 'quotes', label: 'Propositions', count: d.quotes.length, hidden: !can('quotes') }, { id: 'docs', label: 'Documents' }, { id: 'history', label: 'Historique', count: d.history.length },           ] |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:144) |
| OpportunityDetail | Button | onClick=() => setModal('task') | Planifier la prochaine action | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:164) |
| OpportunityDetail | ButtonLink | to=`/devis/nouveau?opportunity=${o.id}` |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:171) |
| OpportunityDetail | DataTable | columns=[                   { key: 'n', label: 'Devis', render: (x: any) => <><div className="cell-title">{x.number} v{x.version}</div><div className="cell-sub">{x.title}</div></> },                   { key: 's', label: 'Statut', render: (x: any) => <Status kind="quote" code={x.status} /> },                   { key: 't', label: 'Total HT', num: true, render: (x: any) => money(x.total_ht) },                   { key: 'm', label: 'Marge', num: true, render: (x: any) => x.margin_pct === null ? '—' : pct(x.margin_pct), mobile: 'hide' },                   { key: 'v', label: 'Validité', render: (x: any) => date(x.valid_until), mobile: 'hide' },                 ] |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:172) |
| OpportunityDetail | Documents | entityType=opportunity ; entityId=o.id ; kinds=['autre', 'contrat', 'bon_commande', 'devis_accepte'] |  | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:182) |
| OpportunityDetail | Link | to=`/organisations/${o.organization_id}` | {d.organization.legal_name} | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:203) |
| OpportunityDetail | a | href=`mailto:${d.contact.email}` | {d.contact.email} | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:204) |
| OpportunityDetail | Link | to=`/contrats/${c.id}` | <Status kind="contract" code={c.status} /> {c.ref} — {c.title} | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:211) |
| OpportunityDetail | Link | to=`/campagnes/${d.campaign.id}` | <Megaphone size={14} /> {d.campaign.ref} · <Status kind="campaign" code={d.campaign.status} /> | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:212) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| FeasibilityCard | label = Non évaluée | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:52) |
| FeasibilityCard | label = En cours de vérification | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:52) |
| FeasibilityCard | label = Confirmée | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:52) |
| FeasibilityCard | label = Confirmée avec réserve | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:52) |
| FeasibilityCard | label = Impossible | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:52) |
| OpportunityDetail | label = Opportunités | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:92) |
| OpportunityDetail | id = summary | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:145) |
| OpportunityDetail | label = Synthèse | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:145) |
| OpportunityDetail | id = brief | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:145) |
| OpportunityDetail | label = Brief et faisabilité | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:145) |
| OpportunityDetail | id = activities | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:145) |
| OpportunityDetail | label = Activités | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:145) |
| OpportunityDetail | id = quotes | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:146) |
| OpportunityDetail | label = Propositions | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:146) |
| OpportunityDetail | id = docs | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:146) |
| OpportunityDetail | label = Documents | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:146) |
| OpportunityDetail | id = history | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:146) |
| OpportunityDetail | label = Historique | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:146) |
| OpportunityDetail | key = n | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:174) |
| OpportunityDetail | label = Devis | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:174) |
| OpportunityDetail | key = s | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:175) |
| OpportunityDetail | label = Statut | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:175) |
| OpportunityDetail | key = t | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:176) |
| OpportunityDetail | label = Total HT | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:176) |
| OpportunityDetail | key = m | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:177) |
| OpportunityDetail | label = Marge | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:177) |
| OpportunityDetail | key = v | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:178) |
| OpportunityDetail | label = Validité | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:178) |
| OpportunityDetail | useCan() | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:72) |
| OpportunityDetail | can('opportunities', 'update') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:86) |
| OpportunityDetail | can('opportunities', 'validate') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:86) |
| OpportunityDetail | can('ai') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:97) |
| OpportunityDetail | can('opportunities', 'validate') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:101) |
| OpportunityDetail | can('activities', 'create') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:132) |
| OpportunityDetail | can('quotes', 'create') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:137) |
| OpportunityDetail | can('quotes', 'create') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:138) |
| OpportunityDetail | can('quotes') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:146) |
| OpportunityDetail | can('activities', 'create') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:164) |
| OpportunityDetail | can('quotes', 'create') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:171) |
| OpportunityDetail | can('opportunities', 'update') | [OpportunityDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OpportunityDetail.tsx:182) |

## OrganizationDetail.tsx — CRM-040

Source : [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Timeline (export)](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:16), [QualifyModal](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:37), [OrganizationDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:61), [MergePicker](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:276), [PricingCard](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:288).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/forms`, `../components/Documents`, `../components/Layout`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| QualifyModal | `api.post(`/api/organizations/${org.id}/qualify`)` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:44) |
| QualifyModal | ``/api/organizations/${org.id}/qualify`` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:44) |
| OrganizationDetail | ``/api/organizations/${id}`` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:68) |
| OrganizationDetail | `api.del(`/api/organizations/${id}`)` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:73) |
| OrganizationDetail | ``/api/organizations/${id}`` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:73) |
| OrganizationDetail | `api.post(`/api/organizations/${id}/merge`)` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:74) |
| OrganizationDetail | ``/api/organizations/${id}/merge`` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:74) |
| MergePicker | ``/api/organizations?pageSize=20&q=${encodeURIComponent(q)}`` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:278) |
| PricingCard | ``/api/organizations/${orgId}/pricing`` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:291) |
| PricingCard | `api.put(`/api/organizations/${orgId}/pricing`)` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:293) |
| PricingCard | ``/api/organizations/${orgId}/pricing`` | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:293) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| QualifyModal | Modal | title=Qualification du compte |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:46) |
| QualifyModal | Button | onClick=onClose | Annuler | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:47) |
| QualifyModal | Button | onClick=() => save.run({ qualification: q, status, disqualification_reason: status === 'disqualifie' ? reason : null }) | Enregistrer | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:47) |
| QualifyModal | Field | label=l |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:51) |
| QualifyModal | Input | value=q[k] ?? '' ; onChange=(e) => setQ({ ...q, [k]: e.target.value }) |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:51) |
| QualifyModal | Field | label=Statut de qualification |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:52) |
| QualifyModal | Select | value=status ; onChange=(e) => setStatus(e.target.value) ; options=[{ value: 'en_cours', label: 'En cours' }, { value: 'qualifie', label: 'Qualifié' }, { value: 'en_veille', label: 'En veille' }, { value: 'disqualifie', label: 'Disqualifié' }] |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:52) |
| QualifyModal | Field | label=Motif de disqualification ; required=true |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:53) |
| QualifyModal | Select | placeholder=Choisir… ; value=reason ; onChange=(e) => setReason(e.target.value) ; options=(lookups.disqualification_reason ?? []).map((x) => ({ value: x.code, label: x.label })) |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:53) |
| OrganizationDetail | Button | onClick=() => ai.open({ context_type: 'organization', context_id: o.id, prompt: 'Résume cette fiche client' }) | Synthèse IA | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:96) |
| OrganizationDetail | Button | onClick=() => setModal('edit') | Modifier | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:97) |
| OrganizationDetail | Button | onClick=() => setModal('opp') | Nouvelle opportunité | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:98) |
| OrganizationDetail | Button | onClick=() => setModal('interaction') | Consigner une interaction | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:103) |
| OrganizationDetail | Button | onClick=() => setModal('relance') | Programmer une relance | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:104) |
| OrganizationDetail | Button | onClick=() => setModal('task') | Créer une tâche | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:105) |
| OrganizationDetail | Button | onClick=() => { setContactEdit(null); setModal('contact'); } | Ajouter un contact | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:106) |
| OrganizationDetail | Button | onClick=() => setModal('qualify') | Qualifier | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:107) |
| OrganizationDetail | Tabs | value=tab ; onChange=setTab ; tabs=[             { id: 'overview', label: 'Vue d’ensemble' },             { id: 'activities', label: 'Historique', count: history.length },             { id: 'contacts', label: 'Contacts', count: d.contacts.length },             { id: 'opps', label: 'Opportunités', count: d.opportunities?.length, hidden: !d.opportunities },             { id: 'quotes', label: 'Propositions', count: d.quotes?.length, hidden: !d.quotes },             { id: 'contracts', label: 'Contrats', count: d.contracts?.length, hidden: !d.contracts },             { id: 'campaigns', label: 'Campagnes', count: d.campaigns?.length, hidden: !d.campaigns },             { id: 'service', label: 'Réclamations et factures', hidden: !d.complaints && !d.invoices },             { id: 'docs', label: 'Documents' },             { id: 'decisions', label: 'Décisions' },           ] |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:115) |
| OrganizationDetail | Button | onClick=() => setModal('opp') | Ajouter | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:130) |
| OrganizationDetail | DataTable | columns=[                     { key: 't', label: 'Opportunité', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.ref} · {x.owner_name}</div></> },                     { key: 's', label: 'Étape', render: (x: any) => <span className="small">{x.stage_label}</span> },                     { key: 'a', label: 'Montant', num: true, render: (x: any) => moneyShort(x.amount) },                     { key: 'n', label: 'Prochaine étape', render: (x: any) => <span className="small">{x.next_step ?? '—'}{x.next_step_date ? ` · ${date(x.next_step_date)}` : ''}</span>, mobile: 'hide' },                   ] |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:131) |
| OrganizationDetail | Button | onClick=() => setModal('task') | Planifier la prochaine action | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:140) |
| OrganizationDetail | Button | onClick=() => { setContactEdit(null); setModal('contact'); } | Ajouter | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:148) |
| OrganizationDetail | DataTable | columns=[                   { key: 'n', label: 'Contact', render: (c: any) => <div className="row"><Avatar name={`${c.first_name} ${c.last_name}`} size="sm" /><div><div className="cell-title">{[c.civility, c.first_name, c.last_name].filter(Boolean).join(' ')}{c.is_primary && <Badge tone="primary" dot={false}> Principal</Badge>}</div><div className="cell-sub">{c.job_title ?? '—'}{c.department ? ` · ${c.department}` : ''}</div></div></div> },                   { key: 'r', label: 'Rôle', render: (c: any) => c.decision_role ? DECISION_ROLE[c.decision_role] : '—', mobile: 'hide' },                   { key: 'c', label: 'Coordonnées', render: (c: any) => <div className="small">{c.email && <div><a href={`mailto:${c.email}`}>{c.email}</a></div>}{(c.mobile \|\| c.phone) && <div>{c.mobile \|\| c.phone}</div>}</div> },                   { key: 'p', label: 'Préférences', render: (c: any) => c.opt_out ? <Badge tone="danger">Opposition</Badge> : <span className="small muted">{c.preferred_channel ?? '—'}</span>, mobile: 'hide' },                   { key: 'x', label: '', render: (c: any) => canEdit && <Button size="sm" variant="ghost" iconOnly aria-label="Modifier le contact" icon={<Edit3 />} onClick={() => { setContactEdit(c); setModal('contact'); }} /> },                 ] |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:149) |
| OrganizationDetail | a | href=`mailto:${c.email}` | {c.email} | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:153) |
| OrganizationDetail | Button | onClick=() => { setContactEdit(c); setModal('contact'); } ; aria-label=Modifier le contact |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:155) |
| OrganizationDetail | DataTable | columns=[                 { key: 't', label: 'Opportunité', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.ref}</div></> },                 { key: 's', label: 'Étape', render: (x: any) => <Badge tone={x.is_won ? 'success' : x.is_closed ? 'neutral' : 'info'}>{x.stage_label}</Badge> },                 { key: 'a', label: 'Montant', num: true, render: (x: any) => money(x.amount) },                 { key: 'd', label: 'Clôture', render: (x: any) => date(x.expected_close_date), mobile: 'hide' },               ] |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:160) |
| OrganizationDetail | DataTable | columns=[                 { key: 'n', label: 'Devis', render: (x: any) => <><div className="cell-title">{x.number} v{x.version}</div><div className="cell-sub">{x.title}</div></> },                 { key: 's', label: 'Statut', render: (x: any) => <Status kind="quote" code={x.status} /> },                 { key: 'a', label: 'Total HT', num: true, render: (x: any) => money(x.total_ht) },                 { key: 'm', label: 'Marge', num: true, render: (x: any) => pct(x.margin_pct), mobile: 'hide' },                 { key: 'e', label: 'Envoyé', render: (x: any) => date(x.sent_at), mobile: 'hide' },               ] |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:169) |
| OrganizationDetail | DataTable | columns=[                 { key: 'n', label: 'Contrat', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.ref}{x.confidential ? ' · confidentiel' : ''}</div></> },                 { key: 's', label: 'Statut', render: (x: any) => <Status kind="contract" code={x.status} /> },                 { key: 'v', label: 'Valeur HT', num: true, render: (x: any) => money(x.value_ht) },                 { key: 'e', label: 'Échéance', render: (x: any) => date(x.end_date) },               ] |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:179) |
| OrganizationDetail | DataTable | columns=[                 { key: 'n', label: 'Campagne', render: (x: any) => <><div className="cell-title">{x.name}</div><div className="cell-sub">{x.ref}</div></> },                 { key: 's', label: 'Statut', render: (x: any) => <Status kind="campaign" code={x.status} /> },                 { key: 'p', label: 'Période', render: (x: any) => <span className="small">{date(x.start_date)} → {date(x.end_date)}</span> },               ] |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:188) |
| OrganizationDetail | DataTable | columns=[                 { key: 'r', label: 'Réclamation', render: (x: any) => <><div className="cell-title">{x.subject}</div><div className="cell-sub">{x.ref}</div></> },                 { key: 's', label: 'Statut', render: (x: any) => <Status kind="complaint" code={x.status} /> },                 { key: 'd', label: 'Échéance', render: (x: any) => date(x.due_date) },               ] |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:197) |
| OrganizationDetail | DataTable | columns=[                 { key: 'n', label: 'Facture', render: (x: any) => <span className="cell-title">{x.number}</span> },                 { key: 'e', label: 'Échéance', render: (x: any) => date(x.due_date) },                 { key: 't', label: 'TTC', num: true, render: (x: any) => money(x.amount_ttc) },                 { key: 's', label: 'Statut', render: (x: any) => <Status kind="invoice" code={x.status} /> },               ] |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:202) |
| OrganizationDetail | Documents | entityType=organization ; entityId=o.id |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:210) |
| OrganizationDetail | a | href=`tel:${o.phone}` | {o.phone} | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:224) |
| OrganizationDetail | a | href=`mailto:${o.email}` | {o.email} | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:224) |
| OrganizationDetail | Button | onClick=() => setModal('qualify') | Mettre à jour | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:231) |
| OrganizationDetail | Button | onClick=() => { setContactEdit(null); setModal('contact'); } ; aria-label=Ajouter un contact |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:239) |
| OrganizationDetail | a | href=`mailto:${c.email}` | {c.email} | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:243) |
| OrganizationDetail | Button | onClick=() => setModal('merge') | Fusionner un doublon dans cette fiche | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:249) |
| OrganizationDetail | Button | onClick=() => setModal('delete') | Mettre à la corbeille | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:250) |
| OrganizationDetail | ConfirmModal | title=Mettre cette fiche à la corbeille ? |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:264) |
| OrganizationDetail | Modal | title=Fusionner un doublon |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:266) |
| OrganizationDetail | Button | onClick=() => setModal(null) | Annuler | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:267) |
| OrganizationDetail | Button | onClick=() => merge.run(undefined) | Fusionner | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:267) |
| OrganizationDetail | MergePicker | name=o.legal_name ; value=mergeId ; onChange=setMergeId |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:268) |
| OrganizationDetail | Field | label=Justification ; required=true |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:269) |
| OrganizationDetail | Textarea | placeholder=Ex. : même entité juridique (RCCM identique) ; value=mergeWhy ; onChange=(e) => setMergeWhy(e.target.value) |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:269) |
| MergePicker | Field | label=Rechercher la fiche en doublon |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:281) |
| MergePicker | Input | value=q ; onChange=(e) => setQ(e.target.value) |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:281) |
| MergePicker | Select | placeholder=Choisir la fiche à absorber… ; value=value ; onChange=(e) => onChange(e.target.value) ; options=(r.data?.rows ?? []).filter((x: any) => x.id !== orgId).map((x: any) => ({ value: x.id, label: `${x.legal_name} (${x.ref})` })) ; aria-label=Fiche à fusionner |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:282) |
| PricingCard | Button | onClick=() => setEdit({ pricing_tier: p.tier, custom: p.source === 'client', markup_pct: p.markup_pct }) | Modifier | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:297) |
| PricingCard | Modal | title=Conditions tarifaires du client |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:299) |
| PricingCard | Button | onClick=() => setEdit(null) | Annuler | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:300) |
| PricingCard | Button | onClick=() => save.run({ pricing_tier: edit.pricing_tier, markup_pct: edit.custom ? Number(edit.markup_pct) : null }) | Enregistrer | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:300) |
| PricingCard | Field | label=Catégorie tarifaire |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:302) |
| PricingCard | Select | value=edit.pricing_tier ; onChange=(e) => setEdit({ ...edit, pricing_tier: e.target.value }) ; options=(lookups.pricing_tier ?? []).map((x) => ({ value: x.code, label: x.label })) |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:302) |
| PricingCard | Field | label=Taux propre au client |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:303) |
| PricingCard | label |  | <input type="checkbox" checked={edit.custom} onChange={(e) => setEdit({ ...edit, custom: e.target.checked })} /> Remplacer le taux de la catégorie | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:303) |
| PricingCard | input | type=checkbox ; onChange=(e) => setEdit({ ...edit, custom: e.target.checked }) |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:303) |
| PricingCard | Field | label=Taux de marge (%) |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:304) |
| PricingCard | Input | type=number ; value=edit.markup_pct ; onChange=(e) => setEdit({ ...edit, markup_pct: e.target.value }) |  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:304) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| QualifyModal | label = En cours | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:52) |
| QualifyModal | label = Qualifié | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:52) |
| QualifyModal | label = En veille | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:52) |
| QualifyModal | label = Disqualifié | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:52) |
| OrganizationDetail | id = overview | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:116) |
| OrganizationDetail | label = Vue d’ensemble | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:116) |
| OrganizationDetail | id = activities | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:117) |
| OrganizationDetail | label = Historique | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:117) |
| OrganizationDetail | id = contacts | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:118) |
| OrganizationDetail | label = Contacts | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:118) |
| OrganizationDetail | id = opps | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:119) |
| OrganizationDetail | label = Opportunités | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:119) |
| OrganizationDetail | id = quotes | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:120) |
| OrganizationDetail | label = Propositions | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:120) |
| OrganizationDetail | id = contracts | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:121) |
| OrganizationDetail | label = Contrats | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:121) |
| OrganizationDetail | id = campaigns | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:122) |
| OrganizationDetail | label = Campagnes | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:122) |
| OrganizationDetail | id = service | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:123) |
| OrganizationDetail | label = Réclamations et factures | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:123) |
| OrganizationDetail | id = docs | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:124) |
| OrganizationDetail | label = Documents | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:124) |
| OrganizationDetail | id = decisions | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:125) |
| OrganizationDetail | label = Décisions | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:125) |
| OrganizationDetail | key = t | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:133) |
| OrganizationDetail | label = Opportunité | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:133) |
| OrganizationDetail | key = s | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:134) |
| OrganizationDetail | label = Étape | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:134) |
| OrganizationDetail | key = a | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:135) |
| OrganizationDetail | label = Montant | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:135) |
| OrganizationDetail | key = n | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:136) |
| OrganizationDetail | label = Prochaine étape | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:136) |
| OrganizationDetail | key = n | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:151) |
| OrganizationDetail | label = Contact | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:151) |
| OrganizationDetail | key = r | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:152) |
| OrganizationDetail | label = Rôle | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:152) |
| OrganizationDetail | key = c | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:153) |
| OrganizationDetail | label = Coordonnées | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:153) |
| OrganizationDetail | key = p | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:154) |
| OrganizationDetail | label = Préférences | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:154) |
| OrganizationDetail | key = x | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:155) |
| OrganizationDetail | label =  | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:155) |
| OrganizationDetail | key = t | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:162) |
| OrganizationDetail | label = Opportunité | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:162) |
| OrganizationDetail | key = s | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:163) |
| OrganizationDetail | label = Étape | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:163) |
| OrganizationDetail | key = a | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:164) |
| OrganizationDetail | label = Montant | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:164) |
| OrganizationDetail | key = d | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:165) |
| OrganizationDetail | label = Clôture | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:165) |
| OrganizationDetail | key = n | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:171) |
| OrganizationDetail | label = Devis | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:171) |
| OrganizationDetail | key = s | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:172) |
| OrganizationDetail | label = Statut | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:172) |
| OrganizationDetail | key = a | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:173) |
| OrganizationDetail | label = Total HT | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:173) |
| OrganizationDetail | key = m | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:174) |
| OrganizationDetail | label = Marge | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:174) |
| OrganizationDetail | key = e | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:175) |
| OrganizationDetail | label = Envoyé | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:175) |
| OrganizationDetail | key = n | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:181) |
| OrganizationDetail | label = Contrat | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:181) |
| OrganizationDetail | key = s | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:182) |
| OrganizationDetail | label = Statut | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:182) |
| OrganizationDetail | key = v | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:183) |
| OrganizationDetail | label = Valeur HT | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:183) |
| OrganizationDetail | key = e | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:184) |
| OrganizationDetail | label = Échéance | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:184) |
| OrganizationDetail | key = n | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:190) |
| OrganizationDetail | label = Campagne | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:190) |
| OrganizationDetail | key = s | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:191) |
| OrganizationDetail | label = Statut | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:191) |
| OrganizationDetail | key = p | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:192) |
| OrganizationDetail | label = Période | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:192) |
| OrganizationDetail | key = r | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:198) |
| OrganizationDetail | label = Réclamation | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:198) |
| OrganizationDetail | key = s | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:199) |
| OrganizationDetail | label = Statut | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:199) |
| OrganizationDetail | key = d | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:200) |
| OrganizationDetail | label = Échéance | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:200) |
| OrganizationDetail | key = n | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:203) |
| OrganizationDetail | label = Facture | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:203) |
| OrganizationDetail | key = e | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:204) |
| OrganizationDetail | label = Échéance | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:204) |
| OrganizationDetail | key = t | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:205) |
| OrganizationDetail | label = TTC | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:205) |
| OrganizationDetail | key = s | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:206) |
| OrganizationDetail | label = Statut | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:206) |
| OrganizationDetail | useCan() | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:65) |
| OrganizationDetail | can('organizations', 'update') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:83) |
| OrganizationDetail | can('ai') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:96) |
| OrganizationDetail | can('opportunities', 'create') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:98) |
| OrganizationDetail | can('activities', 'create') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:101) |
| OrganizationDetail | can('opportunities', 'create') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:130) |
| OrganizationDetail | can('activities', 'create') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:140) |
| OrganizationDetail | can('quotes') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:238) |
| OrganizationDetail | can('quotes', 'validate') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:238) |
| OrganizationDetail | can('organizations', 'delete') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:246) |
| PricingCard | useCan() | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:289) |
| PricingCard | can('quotes', 'validate') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:294) |
| PricingCard | can('opportunities', 'validate') | [OrganizationDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/OrganizationDetail.tsx:294) |

## Organizations.tsx — CRM-039

Source : [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Organizations (export)](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:13), [setMany](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:16), [set](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:17), [OrgList](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:35), [sort](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:44), [ContactList](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:83).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/auth`, `../lib/api`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/forms`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| OrgList | ``/api/organizations${qs(params)}`` | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:43) |
| OrgList | ``/api/organizations${qs({ ...params, format: 'xlsx' })}`` | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:48) |
| OrgList | `download(`/api/organizations${qs({ ...params, format: 'csv' })}`)` | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:49) |
| OrgList | ``/api/organizations${qs({ ...params, format: 'csv' })}`` | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:49) |
| ContactList | ``/api/contacts${qs(params)}`` | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:88) |
| ContactList | ``/api/contacts${qs({ ...params, format: 'xlsx' })}`` | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:90) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Organizations | ButtonLink | to=/admin/imports |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:25) |
| Organizations | Button | onClick=() => setCreate(true) | Nouvelle organisation | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:26) |
| Organizations | Tabs | value=tab ; onChange=(t) => set('tab', t === 'orgs' ? '' : t) ; tabs=[{ id: 'orgs', label: <><Building2 size={15} />Organisations</> }, { id: 'contacts', label: <><Users size={15} />Contacts</> }] |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:28) |
| OrgList | ExcelButton | url=`/api/organizations${qs({ ...params, format: 'xlsx' })}` |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:48) |
| OrgList | Button | onClick=() => download(`/api/organizations${qs({ ...params, format: 'csv' })}`) | CSV | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:49) |
| OrgList | form | onSubmit=(e) => { e.preventDefault(); set('q', q); } |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:51) |
| OrgList | Input | placeholder=Nom, référence, téléphone, e-mail… ; value=q ; onChange=(e) => setQ(e.target.value) ; aria-label=Rechercher |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:52) |
| OrgList | Select | placeholder=Tous types ; value=sp.get('kind') ?? '' ; onChange=(e) => set('kind', e.target.value) ; options=[{ value: 'client', label: 'Clients' }, { value: 'prospect', label: 'Prospects' }, { value: 'ancien_client', label: 'Anciens clients' }, { value: 'institution', label: 'Institutions' }, { value: 'partenaire', label: 'Partenaires' }, { value: 'fournisseur', label: 'Fournisseurs' }] ; aria-label=Type |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:54) |
| OrgList | Select | placeholder=Tous secteurs ; value=sp.get('sector') ?? '' ; onChange=(e) => set('sector', e.target.value) ; options=(lookups.sector ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Secteur |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:55) |
| OrgList | Select | placeholder=Toutes communes ; value=sp.get('commune') ?? '' ; onChange=(e) => set('commune', e.target.value) ; options=(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Commune |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:56) |
| OrgList | Select | placeholder=Tout potentiel ; value=sp.get('potential') ?? '' ; onChange=(e) => set('potential', e.target.value) ; options=[{ value: 'strategique', label: 'Stratégique' }, { value: 'fort', label: 'Fort' }, { value: 'moyen', label: 'Moyen' }, { value: 'faible', label: 'Faible' }] ; aria-label=Potentiel |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:57) |
| OrgList | Select | placeholder=Tous responsables ; value=sp.get('owner') ?? '' ; onChange=(e) => set('owner', e.target.value) ; options=users.filter((u) => ['commercial', 'direction_commerciale'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name })) ; aria-label=Responsable |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:58) |
| OrgList | DataTable | columns=[             { key: 'name', label: 'Organisation', sortable: true, render: (o: any) => <><div className="cell-title">{o.legal_name}</div><div className="cell-sub">{o.ref}{o.main_contact ? ` · ${o.main_contact}` : ''}</div></> },             { key: 'kind', label: 'Type', render: (o: any) => <Status kind="org_kind" code={o.kind} /> },             { key: 'sector', label: 'Secteur', render: (o: any) => <span className="small">{label('sector', o.sector)}</span>, mobile: 'hide' },             { key: 'commune', label: 'Commune', render: (o: any) => <span className="small">{label('commune', o.commune)}</span>, mobile: 'hide' },             { key: 'owner', label: 'Responsable', render: (o: any) => <span className="small">{o.owner_name ?? '—'}</span>, mobile: 'hide' },             { key: 'open', label: 'Opp. ouvertes', num: true, render: (o: any) => o.open_opportunities \|\| '—', mobile: 'hide' },             { key: 'revenue', label: 'CA gagné', num: true, sortable: true, render: (o: any) => (o.won_amount ? moneyShort(o.won_amount) : '—') },             { key: 'activity', label: 'Dernière activité', sortable: true, render: (o: any) => <span className="small muted">{relative(o.last_activity_at)}</span>, mobile: 'hide' },           ] |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:61) |
| OrgList | Button | onClick=() => set('page', String(page - 1)) | Précédent | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:76) |
| OrgList | Button | onClick=() => set('page', String(page + 1)) | Suivant | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:76) |
| ContactList | ExcelButton | url=`/api/contacts${qs({ ...params, format: 'xlsx' })}` |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:90) |
| ContactList | form | onSubmit=(e) => { e.preventDefault(); set('q', q); } |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:92) |
| ContactList | Input | placeholder=Nom, e-mail, organisation… ; value=q ; onChange=(e) => setQ(e.target.value) ; aria-label=Rechercher un contact |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:92) |
| ContactList | Select | placeholder=Tous rôles ; value=sp.get('role') ?? '' ; onChange=(e) => set('role', e.target.value) ; options=Object.entries(DECISION_ROLE).map(([value, label]) => ({ value, label })) ; aria-label=Rôle |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:93) |
| ContactList | DataTable | columns=[           { key: 'name', label: 'Contact', render: (c: any) => <><div className="cell-title">{[c.civility, c.first_name, c.last_name].filter(Boolean).join(' ')}</div><div className="cell-sub">{c.job_title ?? '—'}</div></> },           { key: 'org', label: 'Organisation', render: (c: any) => <span className="small">{c.organization_name}</span> },           { key: 'role', label: 'Rôle', render: (c: any) => c.decision_role ? <Badge tone="neutral" dot={false}>{DECISION_ROLE[c.decision_role]}</Badge> : '—', mobile: 'hide' },           { key: 'email', label: 'E-mail', render: (c: any) => c.email ? <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="small">{c.email}</a> : '—', mobile: 'hide' },           { key: 'tel', label: 'Téléphone', render: (c: any) => <span className="small nowrap">{c.mobile \|\| c.phone \|\| '—'}</span> },           { key: 'optout', label: 'Sollicitations', render: (c: any) => c.opt_out ? <Badge tone="danger">Opposition</Badge> : <span className="muted small">Autorisées</span>, mobile: 'hide' },         ] |  | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:95) |
| ContactList | a | onClick=(e) => e.stopPropagation() ; href=`mailto:${c.email}` | {c.email} | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:100) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Organizations | id = orgs | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:28) |
| Organizations | id = contacts | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:28) |
| OrgList | label = Clients | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:54) |
| OrgList | label = Prospects | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:54) |
| OrgList | label = Anciens clients | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:54) |
| OrgList | label = Institutions | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:54) |
| OrgList | label = Partenaires | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:54) |
| OrgList | label = Fournisseurs | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:54) |
| OrgList | label = Stratégique | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:57) |
| OrgList | label = Fort | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:57) |
| OrgList | label = Moyen | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:57) |
| OrgList | label = Faible | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:57) |
| OrgList | key = name | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:64) |
| OrgList | label = Organisation | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:64) |
| OrgList | key = kind | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:65) |
| OrgList | label = Type | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:65) |
| OrgList | key = sector | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:66) |
| OrgList | label = Secteur | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:66) |
| OrgList | key = commune | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:67) |
| OrgList | label = Commune | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:67) |
| OrgList | key = owner | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:68) |
| OrgList | label = Responsable | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:68) |
| OrgList | key = open | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:69) |
| OrgList | label = Opp. ouvertes | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:69) |
| OrgList | key = revenue | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:70) |
| OrgList | label = CA gagné | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:70) |
| OrgList | key = activity | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:71) |
| OrgList | label = Dernière activité | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:71) |
| ContactList | key = name | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:97) |
| ContactList | label = Contact | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:97) |
| ContactList | key = org | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:98) |
| ContactList | label = Organisation | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:98) |
| ContactList | key = role | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:99) |
| ContactList | label = Rôle | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:99) |
| ContactList | key = email | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:100) |
| ContactList | label = E-mail | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:100) |
| ContactList | key = tel | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:101) |
| ContactList | label = Téléphone | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:101) |
| ContactList | key = optout | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:102) |
| ContactList | label = Sollicitations | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:102) |
| Organizations | useCan() | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:18) |
| Organizations | can('organizations', 'create') | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:25) |
| Organizations | can('admin', 'create') | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:25) |
| Organizations | can('organizations', 'create') | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:26) |
| OrgList | useCan() | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:37) |
| OrgList | can('organizations', 'export') | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:47) |
| ContactList | useCan() | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:85) |
| ContactList | can('organizations', 'export') | [Organizations.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Organizations.tsx:90) |

## Palettes.tsx — CRM-064

Source : [Palettes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Palettes.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Palettes (export)](C:/wamp64/www/comsig-crm/web/src/pages/Palettes.tsx:11).

Dépendances locales : `../lib/hooks`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Palettes | `'/api/services/palettes'` | [Palettes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Palettes.tsx:12) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Palettes | Link | title=`${TYPE[m.type]} ${m.ref} — ${m.title}` ; to=m.link | <span className="mini-top">{ICON[m.type]}<span className="mini-ref">{m.ref}</span>{m.due_date && <span className="mini-due">{date(m.due_date).replace(/\s\d{4}$/, '')}</span>}</span> <span className="mini-title">{m.title}</span> <span className="mini-sub">{m.who ?? 'Non affecté'}</span> | [Palettes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Palettes.tsx:31) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## Performance.tsx — CRM-041

Source : [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [periodsOf (export)](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:14), [Performance (export)](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:27), [MyCard](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:62), [Ranking](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:77), [Statements](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:115).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/charts`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Performance | ``/api/performance/sales?period=${period}`` | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:34) |
| Performance | ``/api/xlsx/performance?period=${period}`` | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:43) |
| Statements | ``/api/performance/statements?period=${period}`` | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:118) |
| Statements | `api.post('/api/performance/close')` | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:119) |
| Statements | `'/api/performance/close'` | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:119) |
| Statements | `api.post(`/api/performance/statements/${b.id}/status`)` | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:120) |
| Statements | ``/api/performance/statements/${b.id}/status`` | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:120) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Performance | Segmented | label=Périodicité ; value=kind ; onChange=(k) => { setKind(k); setPeriod(periodsOf(k)[0].value); } ; options=[{ id: 'mois', label: 'Mois' }, { id: 'trimestre', label: 'Trimestre' }, { id: 'semestre', label: 'Semestre' }, { id: 'annee', label: 'Année' }] |  | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:41) |
| Performance | Select | value=period ; onChange=(e) => setPeriod(e.target.value) ; options=periods ; aria-label=Période |  | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:42) |
| Performance | ExcelButton | url=`/api/xlsx/performance?period=${period}` |  | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:43) |
| Performance | Tabs | value=tab ; onChange=setTab ; tabs=[{ id: 'classement', label: <><Trophy aria-hidden /> Classement</> }, { id: 'releves', label: <><Wallet aria-hidden /> Relevés de commissions</> }] |  | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:53) |
| Ranking | DataTable | columns=[             { key: 'r', label: 'Rang', render: (x: any) => <span className={`rank-badge r${Math.min(x.rank, 4)}`}>{x.rank}</span> },             { key: 'n', label: 'Commercial', render: (x: any) => <><div className="cell-title">{x.full_name}</div><div className="cell-sub">{x.department_label}</div></> },             { key: 'a', label: 'Atteinte', render: (x: any) => x.achievement_pct === null \|\| x.achievement_pct === undefined ? '—' : <div className="ach"><div className="hbar-track"><span className="hbar-fill" style={{ width: `${Math.min(100, x.achievement_pct)}%` }} /></div><span className="small strong">{pct(x.achievement_pct)}</span></div> },             { key: 'c', label: 'Réalisé', num: true, render: (x: any) => (x.achieved !== undefined ? money(x.achieved) : <Lock className="ic-xs muted" aria-label="Confidentiel" />), mobile: 'hide' },             { key: 'm', label: 'Commission', num: true, render: (x: any) => (x.commission_real !== undefined ? money(x.commission_real) : ''), mobile: 'hide' },             { key: 't', label: 'Situation', render: (x: any) => <Badge tone={TIER_TONE[x.tier_label] ?? 'neutral'}>{x.tier_label}</Badge> },           ] |  | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:95) |
| Statements | Button | onClick=() => close.run(undefined) | Arrêter les commissions de la période | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:123) |
| Statements | DataTable | columns=[         { key: 'n', label: 'Commercial', render: (x: any) => <span className="strong">{x.full_name}</span> },         { key: 't', label: 'Objectif', num: true, render: (x: any) => money(x.target), mobile: 'hide' },         { key: 'a', label: 'Réalisé', num: true, render: (x: any) => money(x.achieved) },         { key: 'p', label: 'Atteinte', num: true, render: (x: any) => pct(x.achievement_pct) },         { key: 'r', label: 'Taux', num: true, render: (x: any) => pct(x.rate) },         { key: 'm', label: 'Commission', num: true, render: (x: any) => <strong>{money(x.amount)}</strong> },         { key: 's', label: 'Statut', render: (x: any) => <Badge tone={x.status === 'paye' ? 'success' : x.status === 'valide' ? 'info' : 'warning'}>{x.status === 'paye' ? 'Payé' : x.status === 'valide' ? 'Validé' : 'Calculé'}</Badge> },         { key: 'x', label: '', render: (x: any) => x.status === 'calcule' && canClose && x.user_id !== me?.id ? <Button size="sm" icon={<CheckCircle2 />} onClick={() => st.run({ id: x.id, status: 'valide' })}>Valider</Button>           : x.status === 'valide' && (can('finance', 'update') \|\| canClose) ? <Button size="sm" onClick={() => st.run({ id: x.id, status: 'paye' })}>Marquer payé</Button> : null },       ] |  | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:124) |
| Statements | Button | onClick=() => st.run({ id: x.id, status: 'valide' }) | Valider | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:132) |
| Statements | Button | onClick=() => st.run({ id: x.id, status: 'paye' }) | Marquer payé | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:133) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Performance | id = mois | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:41) |
| Performance | label = Mois | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:41) |
| Performance | id = trimestre | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:41) |
| Performance | label = Trimestre | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:41) |
| Performance | id = semestre | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:41) |
| Performance | label = Semestre | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:41) |
| Performance | id = annee | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:41) |
| Performance | label = Année | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:41) |
| Performance | id = classement | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:53) |
| Performance | id = releves | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:53) |
| Ranking | key = r | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:96) |
| Ranking | label = Rang | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:96) |
| Ranking | key = n | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:97) |
| Ranking | label = Commercial | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:97) |
| Ranking | key = a | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:98) |
| Ranking | label = Atteinte | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:98) |
| Ranking | key = c | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:99) |
| Ranking | label = Réalisé | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:99) |
| Ranking | key = m | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:100) |
| Ranking | label = Commission | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:100) |
| Ranking | key = t | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:101) |
| Ranking | label = Situation | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:101) |
| Statements | key = n | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:125) |
| Statements | label = Commercial | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:125) |
| Statements | key = t | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:126) |
| Statements | label = Objectif | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:126) |
| Statements | key = a | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:127) |
| Statements | label = Réalisé | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:127) |
| Statements | key = p | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:128) |
| Statements | label = Atteinte | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:128) |
| Statements | key = r | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:129) |
| Statements | label = Taux | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:129) |
| Statements | key = m | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:130) |
| Statements | label = Commission | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:130) |
| Statements | key = s | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:131) |
| Statements | label = Statut | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:131) |
| Statements | key = x | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:132) |
| Statements | label =  | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:132) |
| Performance | useCan() | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:29) |
| Performance | can('performance', 'validate') | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:55) |
| Statements | useCan() | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:116) |
| Statements | can('finance', 'update') | [Performance.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Performance.tsx:133) |

## Planning.tsx — CRM-043

Source : [Planning.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Planning.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Planning (export)](C:/wamp64/www/comsig-crm/web/src/pages/Planning.tsx:10), [pos](C:/wamp64/www/comsig-crm/web/src/pages/Planning.tsx:18), [shift](C:/wamp64/www/comsig-crm/web/src/pages/Planning.tsx:20).

Dépendances locales : `../lib/hooks`, `../lib/auth`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Planning | ``/api/supports/planning?from=${start}&to=${end}${commune ? `&commune=${commune}` : ''}`` | [Planning.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Planning.tsx:16) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Planning | Select | placeholder=Toutes communes ; value=commune ; onChange=(e) => setCommune(e.target.value) ; options=(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Commune |  | [Planning.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Planning.tsx:25) |
| Planning | Button | onClick=() => shift(-1) ; aria-label=Mois précédent |  | [Planning.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Planning.tsx:26) |
| Planning | Button | onClick=() => shift(1) ; aria-label=Mois suivant |  | [Planning.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Planning.tsx:26) |
| Planning | button | onClick=() => nav(`/supports/${f.support_id}`) | <strong>{f.support_code}-{f.face_code}</strong> | [Planning.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Planning.tsx:38) |
| Planning | span | title=`${x.organization_name}${x.campaign_ref ? ` · ${x.campaign_ref}` : ''} — ${date(x.start_date)} → ${date(x.end_date)}` ; onClick=() => x.campaign_id && nav(`/campagnes/${x.campaign_id}`) |  | [Planning.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Planning.tsx:42) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## Portal.tsx — CRM-044

Source : [Portal.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Portal.tsx). Mobile : comparaisons publiques documentées sur ordinateur ; mobile spécifique à valider.

Exports/fonctions : [usePortalTiles](C:/wamp64/www/comsig-crm/web/src/pages/Portal.tsx:13), [PortalHero (export)](C:/wamp64/www/comsig-crm/web/src/pages/Portal.tsx:15), [Portal (export)](C:/wamp64/www/comsig-crm/web/src/pages/Portal.tsx:28).

Dépendances locales : `../lib/api`, `../lib/auth`, `../components/Layout`, `../components/ui`, `../components/PortalTile`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| usePortalTiles | `api.get('/api/public/portal')` | [Portal.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Portal.tsx:13) |
| usePortalTiles | `'/api/public/portal'` | [Portal.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Portal.tsx:13) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Portal | Navigate | to=/ |  | [Portal.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Portal.tsx:32) |
| Portal | PortalTile | to=`/connexion/${t.code}` |  | [Portal.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Portal.tsx:42) |
| Portal | Link | to=/connexion | connexion directe | [Portal.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Portal.tsx:45) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## Production.tsx — CRM-045

Source : [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [OrderForm (export)](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:10), [Production (export)](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:35), [OrderPanel](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:66).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| OrderForm | `'/api/stocks/items'` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:11) |
| OrderForm | `api.post('/api/production/orders')` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:14) |
| OrderForm | `'/api/production/orders'` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:14) |
| Production | ``/api/production/orders${filter ? '?open=1' : ''}`` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:39) |
| OrderPanel | ``/api/production/orders/${id}`` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:68) |
| OrderPanel | `api.post(`/api/production/orders/${id}/start`)` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:71) |
| OrderPanel | ``/api/production/orders/${id}/start`` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:71) |
| OrderPanel | `api.post(`/api/production/orders/${id}/complete`)` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:72) |
| OrderPanel | ``/api/production/orders/${id}/complete`` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:72) |
| OrderPanel | `api.post(`/api/production/orders/${id}/cancel`)` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:73) |
| OrderPanel | ``/api/production/orders/${id}/cancel`` | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:73) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| OrderForm | Modal | title=Nouvel ordre de fabrication |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:20) |
| OrderForm | Button | onClick=onClose | Annuler | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:21) |
| OrderForm | Button | onClick=() => save.run({ item_id: f.item_id, quantity: Number(f.quantity), planned_date: f.planned_date \|\| null, labor_cost: f.labor_cost ?? undefined, notes: f.notes }) | Créer l’ordre | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:21) |
| OrderForm | Field | label=Article à fabriquer ; required=true |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:23) |
| OrderForm | Select | placeholder=Choisir… ; value=f.item_id ; onChange=(e) => setF({ ...f, item_id: e.target.value }) ; options=makeable.map((x: any) => ({ value: x.id, label: `${x.code} — ${x.label}${x.bom_count ? '' : ' (sans nomenclature)'}` })) |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:23) |
| OrderForm | Field | label=`Quantité${sel ? ` (${sel.unit})` : ''}` ; required=true |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:24) |
| OrderForm | Input | type=number ; value=f.quantity ; onChange=(e) => setF({ ...f, quantity: e.target.value }) |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:24) |
| OrderForm | Field | label=Date prévue |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:25) |
| OrderForm | Input | type=date ; value=f.planned_date ; onChange=(e) => setF({ ...f, planned_date: e.target.value }) |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:25) |
| OrderForm | Field | label=Main-d’œuvre totale (FCFA) |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:26) |
| OrderForm | MoneyInput | value=f.labor_cost ; onChange=(v) => setF({ ...f, labor_cost: v }) |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:26) |
| OrderForm | Field | label=Notes |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:27) |
| OrderForm | Textarea | value=f.notes ; onChange=(e) => setF({ ...f, notes: e.target.value }) |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:27) |
| Production | Button | onClick=() => setForm(true) | Nouvel ordre | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:45) |
| Production | Segmented | label=Filtre ; value=filter ; onChange=setFilter ; options=[{ id: '1', label: 'En cours et planifiés' }, { id: '', label: 'Tous' }] |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:46) |
| Production | DataTable | columns=[               { key: 'n', label: 'Ordre', render: (o: any) => <><div className="cell-title">{o.number}</div><div className="cell-sub">{o.item_code} — {o.item_label}</div></> },               { key: 'q', label: 'Quantité', num: true, render: (o: any) => `${num(o.quantity)} ${o.item_unit}` },               { key: 'd', label: 'Prévu', render: (o: any) => <span className="small">{o.planned_date ? date(o.planned_date) : '—'}</span>, mobile: 'hide' },               { key: 'm', label: 'Matières', render: (o: any) => (['planifie', 'en_cours'].includes(o.status) ? (o.materials_available ? <Badge tone="success">Disponibles</Badge> : <Badge tone="warning">Manquantes</Badge>) : o.unit_cost ? <span className="small">{money(Math.round(o.unit_cost))} / u</span> : '—') },               { key: 's', label: 'Statut', render: (o: any) => <Status kind="production_order" code={o.status} /> },             ] |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:49) |
| OrderPanel | Link | to=`/stocks/${o.item_id}` | {num(o.quantity)} {o.item_unit} · {o.item_code} — {o.item_label} | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:81) |
| OrderPanel | Button | onClick=() => start.run(undefined) | Lancer | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:83) |
| OrderPanel | Button | onClick=() => complete.run(undefined) | Clôturer la fabrication | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:84) |
| OrderPanel | Button | onClick=() => setCancel(true) | Annuler | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:85) |
| OrderPanel | DataTable | columns=[           { key: 'c', label: 'Composant', render: (l: any) => <Link to={`/stocks/${l.component_id}`}><span className="small strong">{l.code}</span><div className="xsmall muted">{l.label}</div></Link> },           { key: 'b', label: 'Besoin', num: true, render: (l: any) => `${num(l.quantity)} ${l.unit}` },           { key: 'd', label: open ? 'Disponible' : 'Coût unitaire', num: true, render: (l: any) => (open ? <span style={l.shortage > 0 ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{num(l.qty_on_hand)}</span> : money(Math.round(l.unit_cost ?? 0))) },         ] |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:100) |
| OrderPanel | Link | to=`/stocks/${l.component_id}` | <span className="small strong">{l.code}</span> <div className="xsmall muted">{l.label}</div> | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:101) |
| OrderPanel | ConfirmModal | title=`Annuler ${o.number} ?` |  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:106) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Production | id = 1 | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:46) |
| Production | label = En cours et planifiés | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:46) |
| Production | id =  | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:46) |
| Production | label = Tous | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:46) |
| Production | key = n | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:52) |
| Production | label = Ordre | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:52) |
| Production | key = q | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:53) |
| Production | label = Quantité | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:53) |
| Production | key = d | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:54) |
| Production | label = Prévu | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:54) |
| Production | key = m | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:55) |
| Production | label = Matières | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:55) |
| Production | key = s | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:56) |
| Production | label = Statut | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:56) |
| OrderPanel | key = c | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:101) |
| OrderPanel | label = Composant | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:101) |
| OrderPanel | key = b | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:102) |
| OrderPanel | label = Besoin | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:102) |
| OrderPanel | key = d | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:103) |
| OrderPanel | label = Motif | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:106) |
| Production | useCan() | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:36) |
| Production | can('production', 'create') | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:45) |
| OrderPanel | useCan() | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:67) |
| OrderPanel | can('production', 'update') | [Production.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Production.tsx:82) |

## Profile.tsx — CRM-046

Source : [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Profile (export)](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:9).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Profile | `api.post('/api/auth/password')` | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:14) |
| Profile | `'/api/auth/password'` | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:14) |
| Profile | `api.post('/api/auth/mfa/setup')` | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:18) |
| Profile | `'/api/auth/mfa/setup'` | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:18) |
| Profile | `api.post('/api/auth/mfa/enable')` | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:19) |
| Profile | `'/api/auth/mfa/enable'` | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:19) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Profile | Button | onClick=() => setup.run(undefined) | Configurer | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:34) |
| Profile | form | onSubmit=(e) => { e.preventDefault(); enable.run(code); } |  | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:41) |
| Profile | Field | label=Code |  | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:42) |
| Profile | Input | value=code ; onChange=(e) => setCode(e.target.value.replace(/\D/g, '')) |  | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:42) |
| Profile | Button | type=submit | Activer | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:43) |
| Profile | form | onSubmit=(e) => { e.preventDefault(); if (!mismatch) changePw.run({ current: pw.current, next: pw.next }); } |  | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:49) |
| Profile | Field | label=Mot de passe actuel |  | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:50) |
| Profile | Input | type=password ; value=pw.current ; onChange=(e) => setPw({ ...pw, current: e.target.value }) |  | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:50) |
| Profile | Field | label=Nouveau mot de passe |  | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:51) |
| Profile | Input | type=password ; value=pw.next ; onChange=(e) => setPw({ ...pw, next: e.target.value }) |  | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:51) |
| Profile | Field | label=Confirmation |  | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:52) |
| Profile | Input | type=password ; value=pw.confirm ; onChange=(e) => setPw({ ...pw, confirm: e.target.value }) |  | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:52) |
| Profile | Button | type=submit | Modifier | [Profile.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Profile.tsx:53) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## Projects.tsx — CRM-047, CRM-048

Source : [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [ProjectForm (export)](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:18), [name](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:35), [submit](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:36), [ProjectCard (export)](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:84), [Projects (export)](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:97), [ProjectDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:118), [roleOf](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:144).

Dépendances locales : `../components/ExportButton`, `../components/Priority`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/work`, `../components/ProcessFlow`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| ProjectForm | `'/api/collectivities'` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:21) |
| ProjectForm | `api.put(`/api/projects/${initial.id}`)` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:30) |
| ProjectForm | ``/api/projects/${initial.id}`` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:30) |
| ProjectForm | `api.post('/api/projects')` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:30) |
| ProjectForm | `'/api/projects'` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:30) |
| Projects | ``/api/projects${scope === 'mine' ? '?mine=1' : ''}`` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:101) |
| ProjectDetail | ``/api/projects/${id}`` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:121) |
| ProjectDetail | `api.post(`/api/projects/${id}/milestones`)` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:128) |
| ProjectDetail | ``/api/projects/${id}/milestones`` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:128) |
| ProjectDetail | `api.put(`/api/projects/${id}/milestones/${b.mid}`)` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:129) |
| ProjectDetail | ``/api/projects/${id}/milestones/${b.mid}`` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:129) |
| ProjectDetail | `api.put(`/api/tasks/${b.id}`)` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:130) |
| ProjectDetail | ``/api/tasks/${b.id}`` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:130) |
| ProjectDetail | `api.put(`/api/projects/${id}/raci`)` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:131) |
| ProjectDetail | ``/api/projects/${id}/raci`` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:131) |
| ProjectDetail | ``/api/xlsx/project/${p.id}`` | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:151) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| ProjectForm | Modal | title=initial?.id ? `Projet ${initial.ref}` : 'Nouveau projet' |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:43) |
| ProjectForm | Button | onClick=onClose | Annuler | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:45) |
| ProjectForm | Button | onClick=submit | {initial?.id ? 'Enregistrer' : 'Créer et alerter'} | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:45) |
| ProjectForm | Field | label=Nom du projet ; required=true |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:47) |
| ProjectForm | Input | value=f.name ; onChange=(e) => setF({ ...f, name: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:47) |
| ProjectForm | Field | label=Nature |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:48) |
| ProjectForm | Select | value=f.kind ; onChange=(e) => setF({ ...f, kind: e.target.value }) ; options=Object.entries(PROJECT_KIND).map(([value, label]) => ({ value, label })) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:48) |
| ProjectForm | PrioritySelect | label=Niveau de priorité du projet ; value=f.priority_level ; onChange=(v) => setF({ ...f, priority_level: v }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:49) |
| ProjectForm | Field | label=Début |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:50) |
| ProjectForm | Input | type=date ; value=f.start_date ?? '' ; onChange=(e) => setF({ ...f, start_date: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:50) |
| ProjectForm | Field | label=Fin |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:51) |
| ProjectForm | Input | type=date ; value=f.end_date ?? '' ; onChange=(e) => setF({ ...f, end_date: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:51) |
| ProjectForm | Field | label=Statut |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:52) |
| ProjectForm | Select | value=f.status ; onChange=(e) => setF({ ...f, status: e.target.value }) ; options=[['cadrage', 'Cadrage'], ['planifie', 'Planifié'], ['en_cours', 'En cours'], ['en_pause', 'En pause'], ['termine', 'Terminé'], ['annule', 'Annulé']].map(([value, label]) => ({ value, label })) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:52) |
| ProjectForm | Field | label=Budget (FCFA) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:53) |
| ProjectForm | Input | type=number ; value=f.budget ?? '' ; onChange=(e) => setF({ ...f, budget: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:53) |
| ProjectForm | Field | label=Chef de projet |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:54) |
| ProjectForm | Select | placeholder=Moi ; value=f.manager_id ?? '' ; onChange=(e) => setF({ ...f, manager_id: e.target.value }) ; options=users.map((u) => ({ value: u.id, label: `${u.full_name}${u.department_label ? ` · ${u.department_label}` : ''}` })) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:54) |
| ProjectForm | Field | label=Visibilité |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:55) |
| ProjectForm | Select | placeholder=Par défaut ; value=f.visibility ?? '' ; onChange=(e) => setF({ ...f, visibility: e.target.value }) ; options=[{ value: 'entreprise', label: 'Espace entreprise (tout le personnel)' }, { value: 'service', label: 'Mon service et les intervenants' }] |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:56) |
| ProjectForm | Field | label=Lieu |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:58) |
| ProjectForm | Input | value=f.location ?? '' ; onChange=(e) => setF({ ...f, location: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:58) |
| ProjectForm | Field | label=Collectivité |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:59) |
| ProjectForm | Select | placeholder=Aucune ; value=f.collectivity_id ?? '' ; onChange=(e) => setF({ ...f, collectivity_id: e.target.value }) ; options=colls.data.rows.map((c: any) => ({ value: c.id, label: c.name })) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:59) |
| ProjectForm | Field | label=Objectifs |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:60) |
| ProjectForm | Textarea | value=f.objectives ?? '' ; onChange=(e) => setF({ ...f, objectives: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:60) |
| ProjectForm | Field | label=Périmètre et caractéristiques |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:61) |
| ProjectForm | Textarea | value=f.scope ?? '' ; onChange=(e) => setF({ ...f, scope: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:61) |
| ProjectForm | Field | label=Livrables |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:62) |
| ProjectForm | Textarea | value=f.deliverables ?? '' ; onChange=(e) => setF({ ...f, deliverables: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:62) |
| ProjectForm | Field | label=Contraintes (délais, techniques, réglementaires…) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:63) |
| ProjectForm | Textarea | value=f.constraints ?? '' ; onChange=(e) => setF({ ...f, constraints: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:63) |
| ProjectForm | Field | label=Intervenants |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:64) |
| ProjectForm | Select | placeholder=Ajouter une personne… ; value=pick ; onChange=(e) => setPick(e.target.value) ; options=users.filter((u) => !f.members.some((m: any) => m.user_id === u.id)).map((u) => ({ value: u.id, label: `${u.full_name}${u.department_label ? ` · ${u.department_label}` : ''}` })) ; aria-label=Ajouter un intervenant |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:66) |
| ProjectForm | Button | onClick=() => { const u = name(pick); setF({ ...f, members: [...f.members, { user_id: pick, role_label: u?.job_title \|\| 'Intervenant' }] }); setPick(''); } | Ajouter | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:68) |
| ProjectForm | Input | value=m.role_label ; onChange=(e) => setF({ ...f, members: f.members.map((x: any, j: number) => (j === i ? { ...x, role_label: e.target.value } : x)) }) ; aria-label=Rôle sur le projet |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:72) |
| ProjectForm | Button | onClick=() => setF({ ...f, members: f.members.filter((_: any, j: number) => j !== i) }) ; aria-label=Retirer |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:73) |
| ProjectForm | Field | label=Description |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:78) |
| ProjectForm | Textarea | value=f.description ?? '' ; onChange=(e) => setF({ ...f, description: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:78) |
| ProjectCard | button | onClick=onOpen | <div className="row"><span className="xsmall muted">{p.ref} · {PROJECT_KIND[p.kind]}</span><span className="spacer" /><Status kind="project" code={p.status} /></div> <h3>{p.name}</h3> <div className="progress" role="progressbar" aria-valuenow={p.progress_pct} aria-valuemin={0} aria-valuemax={100} aria-label="Avancement"><span style={{ width: `${p.progress_pct}%` }} /></div> <div className="row small"><span>{p.progress_pct} % · {p.tasks_done}/{p.tasks_total} tâches</span><span className="spacer" />{p.tasks_late > 0 && <Badge tone="danger">{p.tasks_late} en retard</Badge>}</div> <div className="row-wrap xsmall muted"><DeptChip label={p.department_label} color={p.department_color} /><span>{p.manager_name} · {date(p.start_date)} → {date(p.end_date)}</span>{p.visibility === 'entreprise' && <Badge tone="primary">Espace entreprise</Badge>}</div> | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:86) |
| Projects | Segmented | label=Périmètre ; value=scope ; onChange=setScope ; options=[{ id: 'tous', label: 'Tous mes projets visibles' }, { id: 'mine', label: 'Où j’interviens' }] |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:106) |
| Projects | Button | onClick=() => setCreating(true) | Nouveau projet | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:106) |
| ProjectDetail | ExcelButton | title=Fiche, planification, matrice RACI et jalons au format Excel ; url=`/api/xlsx/project/${p.id}` |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:151) |
| ProjectDetail | Button | onClick=() => setEditing(true) | Modifier | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:151) |
| ProjectDetail | Button | onClick=() => setTask({}) | Tâche | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:151) |
| ProjectDetail | Tabs | value=tab ; onChange=setTab ; tabs=[         { id: 'fiche', label: <><Info aria-hidden /> Fiche</> }, { id: 'frise', label: <><GitCommitHorizontal aria-hidden /> Planification</> },         { id: 'kanban', label: <><Columns3 aria-hidden /> Kanban</>, count: p.tasks.length }, { id: 'raci', label: <><Grid3x3 aria-hidden /> Matrice RACI</> },         { id: 'suivi', label: <><Users aria-hidden /> Jalons, risques, ordres</> },       ] |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:158) |
| ProjectDetail | article | onClick=() => setTask(t) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:199) |
| ProjectDetail | button | onClick=() => raci.run({ task_id: t.id, user_id: m.user_id, role: cycle[role] }) ; aria-label=`${t.title} — ${m.full_name} : ${role \|\| 'aucun rôle'}` | {role} | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:227) |
| ProjectDetail | Button | onClick=() => setMs({ title: '', due_date: addDays(today(), 14) }) | Jalon | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:242) |
| ProjectDetail | button | onClick=() => toggle.run({ mid: m.id, done: !m.done_at }) ; aria-label=m.done_at ? 'Marquer non atteint' : 'Marquer atteint' | {m.done_at ? <CheckCircle2 className="text-success" /> : <Circle />} | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:246) |
| ProjectDetail | DataTable | columns=[{ key: 't', label: 'Risque', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{RISK_CATEGORY[x.category]}</div></> }, { key: 's', label: 'Score', render: (x: any) => <Badge tone={x.score >= 15 ? 'danger' : x.score >= 8 ? 'warning' : 'info'}>{x.score}</Badge> }] |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:256) |
| ProjectDetail | DataTable | columns=[{ key: 't', label: 'Ordre', render: (w: any) => <><Link to={`/ordres-travail/${w.id}`} className="cell-title">{w.title}</Link><div className="cell-sub">{w.ref} · {w.department_label}</div></> }, { key: 's', label: 'Statut', render: (w: any) => <Status kind="workorder" code={w.status} /> }] |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:260) |
| ProjectDetail | Link | to=`/ordres-travail/${w.id}` | {w.title} | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:261) |
| ProjectDetail | DataTable | columns=[{ key: 't', label: 'Déploiement', render: (d: any) => <><div className="cell-title">{d.title}</div><div className="cell-sub">{d.ref} · {DEPLOYMENT_KIND[d.kind]}</div></> }, { key: 'd', label: 'Date', render: (d: any) => date(d.planned_date) }, { key: 's', label: 'Statut', render: (d: any) => <Status kind="deployment" code={d.status} /> }] |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:265) |
| ProjectDetail | Modal | title=Nouveau jalon |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:271) |
| ProjectDetail | Button | onClick=() => setMs(null) | Annuler | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:271) |
| ProjectDetail | Button | onClick=() => addMs.run(ms) | Ajouter | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:271) |
| ProjectDetail | Field | label=Intitulé ; required=true |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:272) |
| ProjectDetail | Input | value=ms.title ; onChange=(e) => setMs({ ...ms, title: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:272) |
| ProjectDetail | Field | label=Date |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:272) |
| ProjectDetail | Input | type=date ; value=ms.due_date ; onChange=(e) => setMs({ ...ms, due_date: e.target.value }) |  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:272) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| ProjectForm | name =  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:26) |
| ProjectForm | label = Espace entreprise (tout le personnel) | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:56) |
| ProjectForm | label = Mon service et les intervenants | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:56) |
| Projects | id = tous | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:106) |
| Projects | label = Tous mes projets visibles | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:106) |
| Projects | id = mine | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:106) |
| Projects | label = Où j’interviens | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:106) |
| (partagé / module) | label = À faire | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:116) |
| (partagé / module) | label = En cours | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:116) |
| (partagé / module) | label = En attente | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:116) |
| (partagé / module) | label = Terminé | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:116) |
| ProjectDetail | label = Projets | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:150) |
| ProjectDetail | id = fiche | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:159) |
| ProjectDetail | id = frise | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:159) |
| ProjectDetail | id = kanban | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:160) |
| ProjectDetail | id = raci | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:160) |
| ProjectDetail | id = suivi | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:161) |
| ProjectDetail | title =  | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:242) |
| ProjectDetail | key = t | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:257) |
| ProjectDetail | label = Risque | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:257) |
| ProjectDetail | key = s | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:257) |
| ProjectDetail | label = Score | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:257) |
| ProjectDetail | key = t | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:261) |
| ProjectDetail | label = Ordre | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:261) |
| ProjectDetail | key = s | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:261) |
| ProjectDetail | label = Statut | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:261) |
| ProjectDetail | key = t | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:265) |
| ProjectDetail | label = Déploiement | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:265) |
| ProjectDetail | key = d | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:265) |
| ProjectDetail | label = Date | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:265) |
| ProjectDetail | key = s | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:265) |
| ProjectDetail | label = Statut | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:265) |
| ProjectForm | useCan() | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:20) |
| ProjectForm | can('collectivities') | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:21) |
| Projects | useCan() | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:98) |
| Projects | can('projects', 'create') | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:106) |
| ProjectDetail | useCan() | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:120) |
| ProjectDetail | can('tasks', 'create') | [Projects.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Projects.tsx:151) |

## Prospection.tsx — CRM-049

Source : [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Prospection (export)](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:12), [count](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:22).

Dépendances locales : `../lib/hooks`, `../lib/auth`, `../lib/api`, `../lib/format`, `../components/ui`, `../components/forms`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Prospection | ``/api/organizations${qs({ kind: 'prospect', pageSize: 500, sort: 'activity', dir: 'asc' })}`` | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:20) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Prospection | Button | onClick=() => setCreate(true) | Nouveau prospect | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:27) |
| Prospection | Kpi | label=À qualifier ; value=count('a_qualifier') ; onClick=() => setSp(qual === 'a_qualifier' ? {} : { qualif: 'a_qualifier' }) |  | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:29) |
| Prospection | Kpi | label=Qualification en cours ; value=count('en_cours') ; onClick=() => setSp({ qualif: 'en_cours' }) |  | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:30) |
| Prospection | Kpi | label=Qualifiés ; value=count('qualifie') ; onClick=() => setSp({ qualif: 'qualifie' }) |  | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:31) |
| Prospection | Button | onClick=() => setSp({}) | Effacer le filtre | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:35) |
| Prospection | DataTable | columns=[             { key: 'name', label: 'Prospect', render: (o: any) => <><div className="cell-title">{o.legal_name}</div><div className="cell-sub">{label('sector', o.sector)} · {label('commune', o.commune)}</div></> },             { key: 'qual', label: 'Qualification', render: (o: any) => <Status kind="qualification" code={o.qualification_status} /> },             { key: 'score', label: 'Score', num: true, render: (o: any) => <span className="num">{o.qualification_score} %</span> },             { key: 'potential', label: 'Potentiel', render: (o: any) => o.potential ? <Badge tone={o.potential === 'strategique' ? 'accent' : o.potential === 'fort' ? 'primary' : 'neutral'} dot={false}>{o.potential}</Badge> : '—', mobile: 'hide' },             { key: 'source', label: 'Source', render: (o: any) => <span className="small">{label('source', o.source)}</span>, mobile: 'hide' },             { key: 'owner', label: 'Responsable', render: (o: any) => <span className="small">{o.owner_name}</span>, mobile: 'hide' },             { key: 'activity', label: 'Dernier contact', render: (o: any) => <span className={`small ${!o.last_activity_at \|\| Date.now() - new Date(o.last_activity_at).getTime() > 14 * 86400000 ? '' : 'muted'}`} style={!o.last_activity_at \|\| Date.now() - new Date(o.last_activity_at).getTime() > 14 * 86400000 ? { color: 'var(--warning)' } : undefined}>{o.last_activity_at ? relative(o.last_activity_at) : 'Jamais'}</span> },           ] |  | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:36) |
| Prospection | Button | onClick=() => setCreate(true) | Ajouter un prospect | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:37) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Prospection | key = name | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:39) |
| Prospection | label = Prospect | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:39) |
| Prospection | key = qual | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:40) |
| Prospection | label = Qualification | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:40) |
| Prospection | key = score | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:41) |
| Prospection | label = Score | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:41) |
| Prospection | key = potential | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:42) |
| Prospection | label = Potentiel | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:42) |
| Prospection | key = source | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:43) |
| Prospection | label = Source | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:43) |
| Prospection | key = owner | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:44) |
| Prospection | label = Responsable | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:44) |
| Prospection | key = activity | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:45) |
| Prospection | label = Dernier contact | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:45) |
| Prospection | useCan() | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:14) |
| Prospection | can('organizations', 'create') | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:27) |
| Prospection | can('organizations', 'create') | [Prospection.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Prospection.tsx:37) |

## QuoteDetail.tsx — CRM-020, CRM-021

Source : [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [FacePicker](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:17), [QuoteDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:50), [strip](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:85), [body](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:98), [addCatalog](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:109), [addFace](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:115), [upd](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:121), [addStock](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:128), [applyRate](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:133), [block](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:147).

Dépendances locales : `../components/PriceBasis`, `../components/ExportButton`, `../lib/hooks`, `../lib/toast`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/Layout`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| FacePicker | ``/api/supports?from=${from ?? today()}&to=${to ?? from ?? today()}&commune=${commune}&type=${type}`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:21) |
| QuoteDetail | ``/api/quotes/${id}`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:58) |
| QuoteDetail | ``/api/opportunities/${oppId}`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:59) |
| QuoteDetail | `'/api/catalog'` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:60) |
| QuoteDetail | `'/api/stocks/items'` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:61) |
| QuoteDetail | `api.post('/api/quotes/simulate')` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:90) |
| QuoteDetail | `'/api/quotes/simulate'` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:90) |
| QuoteDetail | `api.post('/api/quotes')` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:99) |
| QuoteDetail | `'/api/quotes'` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:99) |
| QuoteDetail | `api.patch(`/api/quotes/${id}`)` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:100) |
| QuoteDetail | ``/api/quotes/${id}`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:100) |
| QuoteDetail | `api.patch(`/api/quotes/${id}`)` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:101) |
| QuoteDetail | ``/api/quotes/${id}`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:101) |
| QuoteDetail | `api.post(`/api/quotes/${id}/submit`)` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:101) |
| QuoteDetail | ``/api/quotes/${id}/submit`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:101) |
| QuoteDetail | `api.post(`/api/quotes/${id}/send`)` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:102) |
| QuoteDetail | ``/api/quotes/${id}/send`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:102) |
| QuoteDetail | `api.post(`/api/quotes/${id}/decision`)` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:103) |
| QuoteDetail | ``/api/quotes/${id}/decision`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:103) |
| QuoteDetail | `api.post(`/api/quotes/${id}/version`)` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:104) |
| QuoteDetail | ``/api/quotes/${id}/version`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:104) |
| QuoteDetail | `api.post(`/api/quotes/${id}/cancel`)` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:105) |
| QuoteDetail | ``/api/quotes/${id}/cancel`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:105) |
| QuoteDetail | `api.post(`/api/contracts/from-quote/${id}`)` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:106) |
| QuoteDetail | ``/api/contracts/from-quote/${id}`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:106) |
| QuoteDetail | ``/api/organizations/${orgIdForPricing}/pricing`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:124) |
| QuoteDetail | ``/api/xlsx/quote/${q.id}`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:157) |
| QuoteDetail | ``/api/quotes/${q.id}/pdf`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:158) |
| QuoteDetail | ``/api/quotes/${q.id}/docx`` | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:159) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| FacePicker | Modal | title=Ajouter des faces de supports |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:23) |
| FacePicker | Select | placeholder=Toutes communes ; value=commune ; onChange=(e) => setCommune(e.target.value) ; options=(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Commune |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:26) |
| FacePicker | Select | placeholder=Tous types ; value=type ; onChange=(e) => setType(e.target.value) ; options=(lookups.support_type ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Type |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:27) |
| FacePicker | Button | title=f.state ; onClick=() => onPick(f, s) | Face {f.code} · {money(f.monthly_rate)} {f.state !== 'disponible' && <Status kind="face" code={f.state} />} | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:36) |
| QuoteDetail | Link | to=`/organisations/${org.id}` | {org.legal_name} | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:154) |
| QuoteDetail | Link | to=`/opportunites/${r.data?.opportunity?.id ?? oppId}` | {r.data?.opportunity?.ref ?? opp.data?.opportunity.ref} | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:154) |
| QuoteDetail | Button | onClick=() => ai.open({ context_type: 'quote', context_id: q.id, prompt: 'Vérifie la cohérence de ce devis' }) | Vérifier avec l’IA | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:156) |
| QuoteDetail | ExcelButton | url=`/api/xlsx/quote/${q.id}` |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:157) |
| QuoteDetail | DocButton | url=`/api/quotes/${q.id}/pdf` |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:158) |
| QuoteDetail | DocButton | url=`/api/quotes/${q.id}/docx` |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:159) |
| QuoteDetail | Button | onClick=() => create.run(undefined) | Créer le brouillon | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:161) |
| QuoteDetail | Button | onClick=() => save.run(undefined) | Enregistrer | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:163) |
| QuoteDetail | Button | onClick=() => submit.run(undefined) | Soumettre | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:164) |
| QuoteDetail | Button | onClick=() => setModal('send') | Consigner l’envoi | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:165) |
| QuoteDetail | Button | onClick=() => setModal('refuse') | Refusée | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:167) |
| QuoteDetail | Button | onClick=() => setModal('accept') | Acceptée par le client | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:168) |
| QuoteDetail | Button | onClick=() => toContract.run(undefined) | Convertir en contrat | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:169) |
| QuoteDetail | Button | onClick=() => version.run(undefined) | Nouvelle version | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:170) |
| QuoteDetail | Button | onClick=() => setModal('cancel') | Annuler | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:171) |
| QuoteDetail | Field | label=Type de document |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:188) |
| QuoteDetail | Select | value=head.doc_type ; onChange=(e) => { setHead({ ...head, doc_type: e.target.value }); setDirty(true); } ; options=[{ value: 'devis', label: 'Devis / proposition commerciale' }, { value: 'proforma', label: 'Facture proforma' }] |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:189) |
| QuoteDetail | Field | label=Taux de marge du client |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:191) |
| QuoteDetail | Input | value=pricing ? `${rate} % sur le coût` : '…' |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:192) |
| QuoteDetail | Field | label=Intitulé ; required=true |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:194) |
| QuoteDetail | Input | value=head.title ; onChange=(e) => { setHead({ ...head, title: e.target.value }); setDirty(true); } |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:194) |
| QuoteDetail | Field | label=Destinataire |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:195) |
| QuoteDetail | Select | placeholder=— ; value=head.contact_id ; onChange=(e) => setHead({ ...head, contact_id: e.target.value }) ; options=contacts.map((c: any) => ({ value: c.id, label: `${c.first_name} ${c.last_name}` })) |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:196) |
| QuoteDetail | Input | value=r.data?.contact ? `${r.data.contact.first_name} ${r.data.contact.last_name}` : '—' |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:197) |
| QuoteDetail | Field | label=Valable jusqu’au |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:199) |
| QuoteDetail | Input | type=date ; value=head.valid_until ; onChange=(e) => { setHead({ ...head, valid_until: e.target.value }); setDirty(true); } |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:199) |
| QuoteDetail | Field | label=Début de campagne |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:200) |
| QuoteDetail | Input | type=date ; value=head.campaign_start ; onChange=(e) => { setHead({ ...head, campaign_start: e.target.value }); setDirty(true); } |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:200) |
| QuoteDetail | Field | label=Fin de campagne |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:201) |
| QuoteDetail | Input | type=date ; value=head.campaign_end ; onChange=(e) => { setHead({ ...head, campaign_end: e.target.value }); setDirty(true); } |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:201) |
| QuoteDetail | Select | placeholder=+ Article du catalogue ; value= ; onChange=(e) => addCatalog(e.target.value) ; options=catOptions ; aria-label=Ajouter un article du catalogue |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:207) |
| QuoteDetail | Select | placeholder=+ Matériau / produit du stock ; value= ; onChange=(e) => addStock(e.target.value) ; options=stockOptions ; aria-label=Ajouter un matériau ou produit du stock |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:208) |
| QuoteDetail | Button | onClick=() => setPicker(true) | Faces de supports | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:209) |
| QuoteDetail | Button | onClick=() => { setLines([...lines, { label: 'Prestation (main-d’œuvre, transport…)', unit: 'forfait', quantity: 1, duration: 1, unit_price: 0, discount_pct: 0, unit_cost: 0, markup_pct: rate }]); setDirty(true); } | Prestation au coût | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:210) |
| QuoteDetail | Button | onClick=() => { setLines([...lines, { label: 'Prestation hors catalogue', unit: 'forfait', quantity: 1, duration: 1, unit_price: 0, discount_pct: 0, unit_cost: 0 }]); setDirty(true); } | Ligne libre | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:211) |
| QuoteDetail | Button | onClick=applyRate | Appliquer le taux client ( {rate} %) | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:212) |
| QuoteDetail | Input | value=l.label ; onChange=(e) => upd(i, 'label', e.target.value) ; aria-label=Libellé |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:225) |
| QuoteDetail | label |  | Coût unitaire <Input className="num" type="number" min={0} value={l.unit_cost ?? 0} onChange={(e) => upd(i, 'unit_cost', Number(e.target.value))} aria-label="Coût unitaire" style={{ width: 110, height: 26 }} /> | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:230) |
| QuoteDetail | Input | type=number ; value=l.unit_cost ?? 0 ; onChange=(e) => upd(i, 'unit_cost', Number(e.target.value)) ; aria-label=Coût unitaire |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:230) |
| QuoteDetail | PriceBasis | onChange=(v) => { setLines(lines.map((x, j) => (j === i ? { ...x, ...v } : x))); setDirty(true); } |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:231) |
| QuoteDetail | label |  | × (1 + {canEdit ? <Input className="num" type="number" min={0} max={500} step="0.5" value={l.markup_pct} onChange={(e) => upd(i, 'markup_pct', e.target.value === '' ? 0 : Number(e.target.value))} aria-label="Taux de marge %" style={{ width: 70, height: 26 }} /> : ` ${l.markup_pct}`} %) | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:233) |
| QuoteDetail | Input | type=number ; value=l.markup_pct ; onChange=(e) => upd(i, 'markup_pct', e.target.value === '' ? 0 : Number(e.target.value)) ; aria-label=Taux de marge % |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:233) |
| QuoteDetail | Input | type=number ; value=l.quantity ; onChange=(e) => upd(i, 'quantity', Number(e.target.value)) ; aria-label=Quantité |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:237) |
| QuoteDetail | Input | type=number ; value=l.duration ; onChange=(e) => upd(i, 'duration', Number(e.target.value)) ; aria-label=Durée |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:238) |
| QuoteDetail | Input | type=number ; value=l.unit_price ; onChange=(e) => upd(i, 'unit_price', Number(e.target.value)) ; aria-label=Prix unitaire |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:239) |
| QuoteDetail | Input | type=number ; value=l.discount_pct ; onChange=(e) => upd(i, 'discount_pct', Number(e.target.value)) ; aria-label=Remise % |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:240) |
| QuoteDetail | Button | onClick=() => { setLines(lines.filter((_, j) => j !== i)); setDirty(true); } ; aria-label=Retirer la ligne |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:243) |
| QuoteDetail | Field | label=Conditions de paiement |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:255) |
| QuoteDetail | Input | value=head.payment_terms ; onChange=(e) => { setHead({ ...head, payment_terms: e.target.value }); setDirty(true); } |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:255) |
| QuoteDetail | Field | label=Conditions particulières (imprimées) |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:256) |
| QuoteDetail | Textarea | value=head.conditions ; onChange=(e) => { setHead({ ...head, conditions: e.target.value }); setDirty(true); } |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:256) |
| QuoteDetail | Field | label=Notes internes (non imprimées) |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:257) |
| QuoteDetail | Textarea | value=head.notes_internal ; onChange=(e) => { setHead({ ...head, notes_internal: e.target.value }); setDirty(true); } |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:257) |
| QuoteDetail | Link | to=`/devis/${v.id}` | v {v.version} | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:264) |
| QuoteDetail | Input | type=number ; value=globalDiscount ; onChange=(e) => { setGlobalDiscount(Math.min(100, Math.max(0, Number(e.target.value) \|\| 0))); setDirty(true); } ; aria-label=Remise globale % |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:277) |
| QuoteDetail | FacePicker | to=head.campaign_end \|\| null |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:293) |
| QuoteDetail | Modal | title=Consigner l’envoi de la proposition |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:294) |
| QuoteDetail | Button | onClick=() => setModal(null) | Annuler | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:295) |
| QuoteDetail | Button | onClick=() => send.run(undefined) | Consigner l’envoi | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:295) |
| QuoteDetail | Field | label=Destinataire ; required=true |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:296) |
| QuoteDetail | Input | value=sentTo ; onChange=(e) => setSentTo(e.target.value) |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:296) |
| QuoteDetail | ConfirmModal | title=Acceptation du client |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:298) |
| QuoteDetail | ConfirmModal | title=Refus du client |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:300) |
| QuoteDetail | ConfirmModal | title=Annuler cette proposition ? |  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:302) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| QuoteDetail | title =  | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:62) |
| QuoteDetail | label = Devis et propositions | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:151) |
| QuoteDetail | label = Devis / proposition commerciale | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:189) |
| QuoteDetail | label = Facture proforma | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:189) |
| QuoteDetail | label = Prestation (main-d’œuvre, transport…) | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:210) |
| QuoteDetail | label = Prestation hors catalogue | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:211) |
| QuoteDetail | label = Motif du refus | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:300) |
| QuoteDetail | useCan() | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:54) |
| QuoteDetail | can('stocks') | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:61) |
| QuoteDetail | can(isNew ? 'quotes' : 'quotes', isNew ? 'create' : 'update') | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:97) |
| QuoteDetail | can('ai') | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:156) |
| QuoteDetail | can('quotes', 'update') | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:162) |
| QuoteDetail | can('quotes', 'update') | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:165) |
| QuoteDetail | can('quotes', 'update') | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:166) |
| QuoteDetail | can('contracts', 'create') | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:169) |
| QuoteDetail | can('quotes', 'create') | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:170) |
| QuoteDetail | can('quotes', 'update') | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:171) |
| QuoteDetail | can('stocks') | [QuoteDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/QuoteDetail.tsx:208) |

## Quotes.tsx — CRM-019

Source : [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Quotes (export)](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:11), [set](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:19).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/auth`, `../lib/api`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Quotes | ``/api/quotes${qs(params)}`` | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:18) |
| Quotes | ``/api/quotes${qs({ ...params, format: 'xlsx' })}`` | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:23) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Quotes | ExcelButton | url=`/api/quotes${qs({ ...params, format: 'xlsx' })}` |  | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:23) |
| Quotes | Button | onClick=() => nav('/devis/nouveau') | Nouveau devis | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:23) |
| Quotes | Segmented | label=Statut ; value=status ; onChange=(v) => set({ status: v }) ; options=[{ id: '', label: 'Tous' }, { id: 'brouillon', label: 'Brouillons' }, { id: 'soumis', label: 'En validation' }, { id: 'valide', label: 'Validés' }, { id: 'envoye', label: 'Envoyés' }, { id: 'accepte', label: 'Acceptés' }, { id: 'refuse', label: 'Refusés' }] |  | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | form | onSubmit=(e) => { e.preventDefault(); set({ q }); } |  | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:26) |
| Quotes | Input | placeholder=Numéro, intitulé, client… ; value=q ; onChange=(e) => setQ(e.target.value) ; aria-label=Rechercher |  | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:26) |
| Quotes | DataTable | columns=[             { key: 'n', label: 'Proposition', render: (x: any) => <><div className="cell-title">{x.number} <span className="muted">v{x.version}</span>{x.doc_type === 'proforma' && <> <Badge tone="accent">Proforma</Badge></>}</div><div className="cell-sub">{x.title}</div></> },             { key: 'c', label: 'Client', render: (x: any) => <><div className="small">{x.organization_name}</div><div className="xsmall muted">{x.opportunity_ref}</div></> },             { key: 's', label: 'Statut', render: (x: any) => <div className="row-wrap"><Status kind="quote" code={x.status} />{x.is_expired && <Badge tone="danger">Validité dépassée</Badge>}</div> },             { key: 't', label: 'Total HT', num: true, render: (x: any) => money(x.total_ht) },             { key: 'm', label: 'Marge', num: true, render: (x: any) => x.margin_pct === null ? '—' : <span style={x.approval_required ? { color: 'var(--warning)', fontWeight: 600 } : undefined}>{pct(x.margin_pct)}</span>, mobile: 'hide' },             { key: 'v', label: 'Validité', render: (x: any) => <span className="small nowrap">{date(x.valid_until)}</span>, mobile: 'hide' },             { key: 'o', label: 'Responsable', render: (x: any) => <span className="small">{x.owner_name}</span>, mobile: 'hide' },           ] |  | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:29) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Quotes | id =  | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | label = Tous | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | id = brouillon | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | label = Brouillons | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | id = soumis | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | label = En validation | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | id = valide | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | label = Validés | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | id = envoye | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | label = Envoyés | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | id = accepte | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | label = Acceptés | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | id = refuse | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | label = Refusés | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:25) |
| Quotes | key = n | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:32) |
| Quotes | label = Proposition | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:32) |
| Quotes | key = c | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:33) |
| Quotes | label = Client | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:33) |
| Quotes | key = s | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:34) |
| Quotes | label = Statut | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:34) |
| Quotes | key = t | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:35) |
| Quotes | label = Total HT | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:35) |
| Quotes | key = m | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:36) |
| Quotes | label = Marge | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:36) |
| Quotes | key = v | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:37) |
| Quotes | label = Validité | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:37) |
| Quotes | key = o | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:38) |
| Quotes | label = Responsable | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:38) |
| Quotes | useCan() | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:13) |
| Quotes | can('quotes', 'export') | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:23) |
| Quotes | can('quotes', 'create') | [Quotes.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Quotes.tsx:23) |

## Regie.tsx — CRM-055, CRM-056, CRM-057

Source : [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [CollectivityForm](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:13), [Collectivities (export)](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:38), [CollectivityDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:73), [Deployments (export)](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:128), [submit](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:139).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/work`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| CollectivityForm | `api.put(`/api/collectivities/${initial.id}`)` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:17) |
| CollectivityForm | ``/api/collectivities/${initial.id}`` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:17) |
| CollectivityForm | `api.post('/api/collectivities')` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:17) |
| CollectivityForm | `'/api/collectivities'` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:17) |
| Collectivities | `'/api/collectivities'` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:42) |
| Collectivities | `"/api/xlsx/collectivities"` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:48) |
| CollectivityDetail | ``/api/collectivities/${id}`` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:76) |
| CollectivityDetail | `api.post(`/api/collectivities/${id}/interactions`)` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:79) |
| CollectivityDetail | ``/api/collectivities/${id}/interactions`` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:79) |
| Deployments | ``/api/deployments${f === 'a_venir' ? `?from=${addDays(today(), -60)}` : ''}`` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:133) |
| Deployments | `'/api/collectivities'` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:134) |
| Deployments | `'/api/projects'` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:135) |
| Deployments | `api.put(`/api/deployments/${edit.id}`)` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:137) |
| Deployments | ``/api/deployments/${edit.id}`` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:137) |
| Deployments | `api.post('/api/deployments')` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:137) |
| Deployments | `'/api/deployments'` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:137) |
| Deployments | `"/api/xlsx/deployments"` | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:143) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| CollectivityForm | Modal | title=initial?.id ? initial.name : 'Nouvelle collectivité' |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:19) |
| CollectivityForm | Button | onClick=onClose | Annuler | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:20) |
| CollectivityForm | Button | onClick=() => { const { id: _i, interactions: _a, royalties: _b, supports: _c, deployments: _d, projects: _e, owner_name: _o, created_at: _x, updated_at: _y, deleted_at: _z, ...b } = f; save.run({ ...b, owner_id: b.owner_id \|\| null }); } | Enregistrer | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:20) |
| CollectivityForm | Field | label=Nom ; required=true |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:22) |
| CollectivityForm | Input | value=f.name ; onChange=(e) => setF({ ...f, name: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:22) |
| CollectivityForm | Field | label=Nature |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:23) |
| CollectivityForm | Select | value=f.kind ; onChange=(e) => setF({ ...f, kind: e.target.value }) ; options=Object.entries(COLLECTIVITY_KIND).map(([value, label]) => ({ value, label })) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:23) |
| CollectivityForm | Field | label=Commune |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:24) |
| CollectivityForm | Select | placeholder=— ; value=f.commune ; onChange=(e) => setF({ ...f, commune: e.target.value }) ; options=(lookups.commune ?? []).map((c) => ({ value: c.code, label: c.label })) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:24) |
| CollectivityForm | Field | label=Interlocuteur |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:25) |
| CollectivityForm | Input | value=f.contact_name ; onChange=(e) => setF({ ...f, contact_name: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:25) |
| CollectivityForm | Field | label=Fonction |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:26) |
| CollectivityForm | Input | value=f.contact_role ; onChange=(e) => setF({ ...f, contact_role: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:26) |
| CollectivityForm | Field | label=Téléphone |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:27) |
| CollectivityForm | Input | value=f.phone ; onChange=(e) => setF({ ...f, phone: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:27) |
| CollectivityForm | Field | label=E-mail |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:28) |
| CollectivityForm | Input | value=f.email ; onChange=(e) => setF({ ...f, email: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:28) |
| CollectivityForm | Field | label=Qualité de la relation |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:29) |
| CollectivityForm | Select | value=f.relationship ; onChange=(e) => setF({ ...f, relationship: e.target.value }) ; options=['excellente', 'bonne', 'a_ameliorer', 'tendue'].map((c) => ({ value: c, label: statusOf('relationship', c)[0] })) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:29) |
| CollectivityForm | Field | label=Adresse |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:30) |
| CollectivityForm | Input | value=f.address ; onChange=(e) => setF({ ...f, address: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:30) |
| CollectivityForm | Field | label=Notes |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:31) |
| CollectivityForm | Textarea | value=f.notes ; onChange=(e) => setF({ ...f, notes: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:31) |
| Collectivities | ExcelButton | url=/api/xlsx/collectivities |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:48) |
| Collectivities | Button | onClick=() => setCreating(true) | Nouvelle collectivité | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:48) |
| Collectivities | DataTable | columns=[               { key: 'n', label: 'Collectivité', render: (c: any) => <><div className="cell-title">{c.name}</div><div className="cell-sub">{COLLECTIVITY_KIND[c.kind]}{c.commune ? ` · ${label('commune', c.commune)}` : ''}{c.contact_name ? ` · ${c.contact_name}` : ''}</div></> },               { key: 'r', label: 'Relation', render: (c: any) => <Status kind="relationship" code={c.relationship} /> },               { key: 's', label: 'Supports', num: true, render: (c: any) => c.supports_count, mobile: 'hide' },               { key: 'd', label: 'Redevances dues', num: true, render: (c: any) => money(c.royalties_due) },               { key: 'l', label: 'Dernier échange', render: (c: any) => <span className="small">{date(c.last_interaction)}</span>, mobile: 'hide' },               { key: 'a', label: 'Prochaine action', render: (c: any) => <span className="small">{date(c.next_action_date)}</span> },             ] |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:57) |
| CollectivityDetail | Button | onClick=() => setEditing(true) | Modifier | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:86) |
| CollectivityDetail | Button | onClick=() => setIt({ occurred_on: today(), kind: 'reunion', subject: '', summary: '', next_action: '', next_action_date: '' }) | Échange | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:86) |
| CollectivityDetail | DataTable | columns=[{ key: 'p', label: 'Période', render: (x: any) => `${date(x.period_start)} → ${date(x.period_end)}` }, { key: 'm', label: 'Montant', num: true, render: (x: any) => money(x.expected_amount) },                 { key: 'r', label: 'Reste dû', num: true, render: (x: any) => money(x.expected_amount - x.paid_amount) }, { key: 'e', label: 'Échéance', render: (x: any) => date(x.due_date) }, { key: 's', label: 'Statut', render: (x: any) => <Status kind="royalty" code={x.status} /> }] |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:97) |
| CollectivityDetail | DataTable | columns=[{ key: 'c', label: 'Support', render: (s: any) => <><div className="cell-title">{s.code}</div><div className="cell-sub">{s.name}</div></> }, { key: 's', label: 'État', render: (s: any) => <Status kind="support" code={s.status} /> }] |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:105) |
| CollectivityDetail | DataTable | columns=[{ key: 't', label: 'Déploiement', render: (d: any) => <><div className="cell-title">{d.title}</div><div className="cell-sub">{d.ref}</div></> }, { key: 'd', label: 'Date', render: (d: any) => date(d.planned_date) }, { key: 's', label: 'Statut', render: (d: any) => <Status kind="deployment" code={d.status} /> }] |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:108) |
| CollectivityDetail | Modal | title=Consigner un échange |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:113) |
| CollectivityDetail | Button | onClick=() => setIt(null) | Annuler | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:113) |
| CollectivityDetail | Button | onClick=() => add.run({ ...it, next_action_date: it.next_action_date \|\| null }) | Enregistrer | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:113) |
| CollectivityDetail | Field | label=Date |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:115) |
| CollectivityDetail | Input | type=date ; value=it.occurred_on ; onChange=(e) => setIt({ ...it, occurred_on: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:115) |
| CollectivityDetail | Field | label=Nature |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:116) |
| CollectivityDetail | Select | value=it.kind ; onChange=(e) => setIt({ ...it, kind: e.target.value }) ; options=Object.entries(INTERACTION_KIND).map(([value, label]) => ({ value, label })) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:116) |
| CollectivityDetail | Field | label=Objet ; required=true |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:117) |
| CollectivityDetail | Input | value=it.subject ; onChange=(e) => setIt({ ...it, subject: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:117) |
| CollectivityDetail | Field | label=Compte rendu |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:118) |
| CollectivityDetail | Textarea | value=it.summary ; onChange=(e) => setIt({ ...it, summary: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:118) |
| CollectivityDetail | Field | label=Prochaine action |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:119) |
| CollectivityDetail | Input | value=it.next_action ; onChange=(e) => setIt({ ...it, next_action: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:119) |
| CollectivityDetail | Field | label=Pour le |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:120) |
| CollectivityDetail | Input | type=date ; value=it.next_action_date ; onChange=(e) => setIt({ ...it, next_action_date: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:120) |
| Deployments | ExcelButton | url=/api/xlsx/deployments |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:143) |
| Deployments | Button | onClick=() => setEdit({ title: '', kind: 'installation', planned_date: addDays(today(), 14), status: 'planifie', permit_ref: '', commune: '', address: '', notes: '' }) | Planifier | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:143) |
| Deployments | Segmented | label=Filtre ; value=f ; onChange=setF ; options=[{ id: 'a_venir', label: 'En cours et à venir' }, { id: 'tous', label: 'Tous' }] |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:144) |
| Deployments | DataTable | columns=[             { key: 't', label: 'Déploiement', render: (d: any) => <><div className="cell-title">{d.title}</div><div className="cell-sub">{d.ref} · {DEPLOYMENT_KIND[d.kind]}{d.project_ref ? ` · ${d.project_ref}` : ''}</div></> },             { key: 'l', label: 'Lieu', render: (d: any) => <span className="small">{d.collectivity_name ?? d.commune}{d.address ? ` · ${d.address}` : ''}</span>, mobile: 'hide' },             { key: 'p', label: 'Autorisation', render: (d: any) => d.permit_ref ? <span className="small">{d.permit_ref}</span> : <Badge tone="warning">À obtenir</Badge>, mobile: 'hide' },             { key: 'a', label: 'Équipe', render: (d: any) => <span className="small">{d.assignee_name ?? '—'}</span>, mobile: 'hide' },             { key: 'd', label: 'Date', render: (d: any) => <span className={`small${d.is_late ? ' text-danger strong' : ''}`}>{date(d.planned_date)}</span> },             { key: 's', label: 'Statut', render: (d: any) => <Status kind="deployment" code={d.status} /> },           ] |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:146) |
| Deployments | Modal | title=edit?.id ? `Déploiement ${edit.ref}` : 'Planifier un déploiement' |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:156) |
| Deployments | Button | onClick=() => setEdit(null) | Annuler | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:157) |
| Deployments | Button | onClick=submit | Enregistrer | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:157) |
| Deployments | Field | label=Intitulé ; required=true |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:159) |
| Deployments | Input | value=edit.title ; onChange=(e) => setEdit({ ...edit, title: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:159) |
| Deployments | Field | label=Nature |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:160) |
| Deployments | Select | value=edit.kind ; onChange=(e) => setEdit({ ...edit, kind: e.target.value }) ; options=Object.entries(DEPLOYMENT_KIND).map(([value, label]) => ({ value, label })) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:160) |
| Deployments | Field | label=Date prévue ; required=true |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:161) |
| Deployments | Input | type=date ; value=edit.planned_date ; onChange=(e) => setEdit({ ...edit, planned_date: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:161) |
| Deployments | Field | label=Statut |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:162) |
| Deployments | Select | value=edit.status ; onChange=(e) => setEdit({ ...edit, status: e.target.value }) ; options=['planifie', 'autorisation', 'pret', 'en_cours', 'realise', 'annule'].map((c) => ({ value: c, label: statusOf('deployment', c)[0] })) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:162) |
| Deployments | Field | label=Réf. de l’autorisation |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:163) |
| Deployments | Input | value=edit.permit_ref ; onChange=(e) => setEdit({ ...edit, permit_ref: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:163) |
| Deployments | Field | label=Collectivité |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:164) |
| Deployments | Select | placeholder=— ; value=edit.collectivity_id ?? '' ; onChange=(e) => setEdit({ ...edit, collectivity_id: e.target.value }) ; options=colls.data.rows.map((c: any) => ({ value: c.id, label: c.name })) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:164) |
| Deployments | Field | label=Projet |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:165) |
| Deployments | Select | placeholder=— ; value=edit.project_id ?? '' ; onChange=(e) => setEdit({ ...edit, project_id: e.target.value }) ; options=(projects.data?.rows ?? []).map((p: any) => ({ value: p.id, label: `${p.ref} — ${p.name}` })) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:165) |
| Deployments | Field | label=Commune |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:166) |
| Deployments | Select | placeholder=— ; value=edit.commune ?? '' ; onChange=(e) => setEdit({ ...edit, commune: e.target.value }) ; options=(lookups.commune ?? []).map((c) => ({ value: c.code, label: c.label })) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:166) |
| Deployments | Field | label=Équipe / responsable |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:167) |
| Deployments | Select | placeholder=— ; value=edit.assignee_id ?? '' ; onChange=(e) => setEdit({ ...edit, assignee_id: e.target.value }) ; options=users.map((u) => ({ value: u.id, label: u.full_name })) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:167) |
| Deployments | Field | label=Adresse |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:168) |
| Deployments | Input | value=edit.address ?? '' ; onChange=(e) => setEdit({ ...edit, address: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:168) |
| Deployments | Field | label=Coût estimé (FCFA) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:169) |
| Deployments | Input | type=number ; value=edit.cost_estimate ?? '' ; onChange=(e) => setEdit({ ...edit, cost_estimate: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:169) |
| Deployments | Field | label=Notes |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:170) |
| Deployments | Textarea | value=edit.notes ?? '' ; onChange=(e) => setEdit({ ...edit, notes: e.target.value }) |  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:170) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| CollectivityForm | name =  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:16) |
| Collectivities | key = n | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:59) |
| Collectivities | label = Collectivité | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:59) |
| Collectivities | key = r | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:60) |
| Collectivities | label = Relation | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:60) |
| Collectivities | key = s | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:61) |
| Collectivities | label = Supports | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:61) |
| Collectivities | key = d | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:62) |
| Collectivities | label = Redevances dues | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:62) |
| Collectivities | key = l | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:63) |
| Collectivities | label = Dernier échange | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:63) |
| Collectivities | key = a | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:64) |
| Collectivities | label = Prochaine action | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:64) |
| CollectivityDetail | label = Collectivités | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:85) |
| CollectivityDetail | key = p | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:98) |
| CollectivityDetail | label = Période | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:98) |
| CollectivityDetail | key = m | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:98) |
| CollectivityDetail | label = Montant | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:98) |
| CollectivityDetail | key = r | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:99) |
| CollectivityDetail | label = Reste dû | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:99) |
| CollectivityDetail | key = e | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:99) |
| CollectivityDetail | label = Échéance | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:99) |
| CollectivityDetail | key = s | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:99) |
| CollectivityDetail | label = Statut | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:99) |
| CollectivityDetail | key = c | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:105) |
| CollectivityDetail | label = Support | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:105) |
| CollectivityDetail | key = s | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:105) |
| CollectivityDetail | label = État | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:105) |
| CollectivityDetail | key = t | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:108) |
| CollectivityDetail | label = Déploiement | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:108) |
| CollectivityDetail | key = d | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:108) |
| CollectivityDetail | label = Date | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:108) |
| CollectivityDetail | key = s | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:108) |
| CollectivityDetail | label = Statut | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:108) |
| Deployments | title =  | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:143) |
| Deployments | id = a_venir | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:144) |
| Deployments | label = En cours et à venir | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:144) |
| Deployments | id = tous | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:144) |
| Deployments | label = Tous | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:144) |
| Deployments | key = t | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:148) |
| Deployments | label = Déploiement | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:148) |
| Deployments | key = l | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:149) |
| Deployments | label = Lieu | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:149) |
| Deployments | key = p | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:150) |
| Deployments | label = Autorisation | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:150) |
| Deployments | key = a | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:151) |
| Deployments | label = Équipe | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:151) |
| Deployments | key = d | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:152) |
| Deployments | label = Date | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:152) |
| Deployments | key = s | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:153) |
| Deployments | label = Statut | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:153) |
| Collectivities | useCan() | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:39) |
| Collectivities | can('collectivities', 'create') | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:48) |
| CollectivityDetail | useCan() | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:75) |
| CollectivityDetail | can('collectivities', 'update') | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:86) |
| Deployments | useCan() | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:129) |
| Deployments | can('collectivities') | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:134) |
| Deployments | can('projects', 'create') | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:143) |
| Deployments | can('projects', 'update') | [Regie.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Regie.tsx:146) |

## Reporting.tsx — CRM-060

Source : [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Reporting (export)](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:11).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/auth`, `../lib/api`, `../lib/format`, `../components/ui`, `../components/charts`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Reporting | ``/api/reports/sales${qs({ from, to, group })}`` | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:18) |
| Reporting | ``/api/dashboard${qs({ from, to })}`` | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:19) |
| Reporting | ``/api/reports/operations${qs({ from, to })}`` | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:20) |
| Reporting | `'/api/reports/adoption'` | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:21) |
| Reporting | ``/api/reports/sales${qs({ from, to, group, format: 'xlsx' })}`` | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:40) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Reporting | Field | label=Du |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:27) |
| Reporting | Input | type=date ; value=from ; onChange=(e) => setFrom(e.target.value) |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:27) |
| Reporting | Field | label=Au |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:27) |
| Reporting | Input | type=date ; value=to ; onChange=(e) => setTo(e.target.value) |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:27) |
| Reporting | Segmented | label=Raccourcis ; value= ; onChange=(v) => { if (v === 'm') { setFrom(today().slice(0, 8) + '01'); setTo(today()); } if (v === 'q') { setFrom(addDays(today(), -90)); setTo(today()); } if (v === 'y') { setFrom(`${today().slice(0, 4)}-01-01`); setTo(today()); } } ; options=[{ id: 'm', label: 'Mois' }, { id: 'q', label: '90 j' }, { id: 'y', label: 'Année' }] |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:28) |
| Reporting | Tabs | value=tab ; onChange=setTab ; tabs=[{ id: 'sales', label: 'Ventes et pipeline' }, ...(can('supports') ? [{ id: 'ops', label: 'Inventaire, campagnes et maintenance' }] : []), { id: 'adoption', label: 'Qualité des données et adoption' }] |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:29) |
| Reporting | Segmented | label=Regroupement ; value=group ; onChange=setGroup ; options=[{ id: 'owner', label: 'Commercial' }, { id: 'source', label: 'Source' }, { id: 'sector', label: 'Secteur' }, { id: 'offer_type', label: 'Prestation' }, { id: 'commune', label: 'Commune' }] |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | ExcelButton | url=`/api/reports/sales${qs({ from, to, group, format: 'xlsx' })}` |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:40) |
| Reporting | DataTable | columns=[               { key: 'label', label: 'Regroupement', render: (x: any) => <span className="cell-title">{x.label}</span> },               { key: 'c', label: 'Créées', num: true, render: (x: any) => x.created },               { key: 'o', label: 'Ouvertes', num: true, render: (x: any) => x.open, mobile: 'hide' },               { key: 'p', label: 'Pipeline brut', num: true, render: (x: any) => moneyShort(x.pipeline), mobile: 'hide' },               { key: 'w', label: 'Pondéré', num: true, render: (x: any) => moneyShort(x.weighted) },               { key: 'g', label: 'Gagnées', num: true, render: (x: any) => x.won },               { key: 'a', label: 'CA gagné', num: true, render: (x: any) => <strong>{money(x.won_amount)}</strong> },               { key: 'r', label: 'Taux de gain', num: true, render: (x: any) => (x.win_rate === null ? '—' : pct(x.win_rate, 0)) },               { key: 'cy', label: 'Cycle (j)', num: true, render: (x: any) => x.cycle_days ?? '—', mobile: 'hide' },             ] |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:41) |
| Reporting | DataTable | columns=[                 { key: 'c', label: 'Commune', render: (x: any) => label('commune', x.commune) },                 { key: 's', label: 'Supports', num: true, render: (x: any) => x.supports },                 { key: 'f', label: 'Faces', num: true, render: (x: any) => x.faces },                 { key: 'b', label: 'Occupation', num: true, render: (x: any) => pct((x.booked / Math.max(1, x.faces)) * 100, 0) },                 { key: 'u', label: 'Indispo.', num: true, render: (x: any) => x.unavailable \|\| '—' },               ] |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:73) |
| Reporting | DataTable | columns=[                 { key: 't', label: 'Type', render: (x: any) => x.type },                 { key: 'f', label: 'Faces', num: true, render: (x: any) => x.faces },                 { key: 'b', label: 'Occupation', num: true, render: (x: any) => pct((x.booked / Math.max(1, x.faces)) * 100, 0) },                 { key: 'r', label: 'Tarif moyen', num: true, render: (x: any) => moneyShort(x.avg_rate) },               ] |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:82) |
| Reporting | DataTable | columns=[               { key: 'c', label: 'Support', render: (x: any) => <><div className="cell-title">{x.code}</div><div className="cell-sub">{x.name}</div></> },               { key: 'r', label: 'Revenus', num: true, render: (x: any) => money(x.revenue) },               { key: 'a', label: 'Coût annuel', num: true, render: (x: any) => money(x.annual_cost) },               { key: 'm', label: 'Maintenance', num: true, render: (x: any) => money(x.maintenance) },             ] |  | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:91) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Reporting | id = m | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:28) |
| Reporting | label = Mois | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:28) |
| Reporting | id = q | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:28) |
| Reporting | label = 90 j | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:28) |
| Reporting | id = y | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:28) |
| Reporting | label = Année | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:28) |
| Reporting | id = sales | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:29) |
| Reporting | label = Ventes et pipeline | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:29) |
| Reporting | id = ops | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:29) |
| Reporting | label = Inventaire, campagnes et maintenance | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:29) |
| Reporting | id = adoption | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:29) |
| Reporting | label = Qualité des données et adoption | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:29) |
| Reporting | id = owner | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | label = Commercial | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | id = source | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | label = Source | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | id = sector | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | label = Secteur | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | id = offer_type | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | label = Prestation | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | id = commune | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | label = Commune | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:39) |
| Reporting | key = label | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:42) |
| Reporting | label = Regroupement | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:42) |
| Reporting | key = c | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:43) |
| Reporting | label = Créées | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:43) |
| Reporting | key = o | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:44) |
| Reporting | label = Ouvertes | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:44) |
| Reporting | key = p | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:45) |
| Reporting | label = Pipeline brut | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:45) |
| Reporting | key = w | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:46) |
| Reporting | label = Pondéré | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:46) |
| Reporting | key = g | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:47) |
| Reporting | label = Gagnées | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:47) |
| Reporting | key = a | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:48) |
| Reporting | label = CA gagné | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:48) |
| Reporting | key = r | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:49) |
| Reporting | label = Taux de gain | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:49) |
| Reporting | key = cy | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:50) |
| Reporting | label = Cycle (j) | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:50) |
| Reporting | title = Taux d’exécution | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:67) |
| Reporting | key = c | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:74) |
| Reporting | label = Commune | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:74) |
| Reporting | key = s | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:75) |
| Reporting | label = Supports | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:75) |
| Reporting | key = f | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:76) |
| Reporting | label = Faces | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:76) |
| Reporting | key = b | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:77) |
| Reporting | label = Occupation | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:77) |
| Reporting | key = u | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:78) |
| Reporting | label = Indispo. | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:78) |
| Reporting | key = t | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:83) |
| Reporting | label = Type | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:83) |
| Reporting | key = f | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:84) |
| Reporting | label = Faces | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:84) |
| Reporting | key = b | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:85) |
| Reporting | label = Occupation | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:85) |
| Reporting | key = r | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:86) |
| Reporting | label = Tarif moyen | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:86) |
| Reporting | key = c | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:92) |
| Reporting | label = Support | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:92) |
| Reporting | key = r | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:93) |
| Reporting | label = Revenus | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:93) |
| Reporting | key = a | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:94) |
| Reporting | label = Coût annuel | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:94) |
| Reporting | key = m | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:95) |
| Reporting | label = Maintenance | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:95) |
| Reporting | useCan() | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:12) |
| Reporting | can('supports') | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:29) |
| Reporting | can('reporting', 'export') | [Reporting.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reporting.tsx:40) |

## Reports.tsx — CRM-051, CRM-052, CRM-069, CRM-070

Source : [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [pad](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:16), [isoWeek](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:18), [periodOptions](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:26), [GenerateModal](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:35), [ScopeFilter](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:62), [PeriodicReports (export)](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:71), [Trend](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:108), [ReportView (export)](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:115), [ServiceSection](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:155), [DirectionSection](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:176), [SwotList (export)](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:213), [SwotView (export)](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:251).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/work`, `./Indicators`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| GenerateModal | `api.post(swot ? '/api/swot' : '/api/periodic-reports')` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:43) |
| GenerateModal | `'/api/swot'` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:43) |
| GenerateModal | `'/api/periodic-reports'` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:43) |
| PeriodicReports | ``/api/periodic-reports?${qs}`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:79) |
| ReportView | ``/api/periodic-reports/${id}`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:117) |
| ReportView | ``/api/periodic-reports/${r.data.id}/pdf`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:127) |
| ReportView | ``/api/periodic-reports/${r.data.id}/docx`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:127) |
| ReportView | ``/api/xlsx/report/${r.data.id}`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:127) |
| SwotList | ``/api/swot${dept ? `?department=${dept}` : ''}`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:219) |
| SwotView | ``/api/swot/${id}`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:253) |
| SwotView | `api.post(`/api/swot/${id}/review`)` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:255) |
| SwotView | ``/api/swot/${id}/review`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:255) |
| SwotView | ``/api/swot/${s.id}/pdf`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:265) |
| SwotView | ``/api/swot/${s.id}/docx`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:265) |
| SwotView | ``/api/xlsx/swot/${s.id}`` | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:265) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| GenerateModal | Modal | title=swot ? 'Préparer une analyse SWOT' : 'Générer un rapport' |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:49) |
| GenerateModal | Button | onClick=onClose | Annuler | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:50) |
| GenerateModal | Button | onClick=() => gen.run({ key: key \|\| opts[0].value, department: dept \|\| null }) | {swot ? 'Préparer' : 'Générer'} | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:50) |
| GenerateModal | Field | label=Périodicité |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:51) |
| GenerateModal | Select | value=kind ; onChange=(e) => { setKind(e.target.value); setKey(''); } ; options=kinds.map(([value, label]) => ({ value, label })) |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:51) |
| GenerateModal | Field | label=Période |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:52) |
| GenerateModal | Select | value=key \|\| opts[0].value ; onChange=(e) => setKey(e.target.value) ; options=opts |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:52) |
| GenerateModal | Field | label=Périmètre |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:53) |
| GenerateModal | Select | value=dept ; onChange=(e) => setDept(e.target.value) ; options=[...(me?.cross_department ? [{ value: '', label: swot ? 'Entreprise (direction générale)' : 'Direction générale — consolidé' }] : []), ...deps.filter((d) => me?.cross_department \|\| d.code === me?.department_code).map((d) => ({ value: d.code, label: d.label }))] |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:54) |
| ScopeFilter | Select | value=value ; onChange=(e) => onChange(e.target.value) ; options=[{ value: '', label: 'Tous les périmètres' }, { value: 'dg', label: 'Direction générale' }, ...deps.map((d) => ({ value: d.code, label: d.label }))] ; aria-label=Périmètre |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:66) |
| PeriodicReports | Button | onClick=() => setGen(true) | Générer un rapport | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:84) |
| PeriodicReports | Segmented | label=Périodicité ; value=kind ; onChange=setKind ; options=[{ id: '', label: 'Tous' }, ...Object.entries(KIND_LABEL).map(([id, label]) => ({ id, label }))] |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:86) |
| PeriodicReports | ScopeFilter | value=dept ; onChange=setDept |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:87) |
| PeriodicReports | DataTable | columns=[               { key: 'label', label: 'Période', render: (x: any) => <strong style={{ textTransform: 'capitalize' }}>{x.label}</strong> },               { key: 'kind', label: 'Périodicité', render: (x: any) => <Badge tone="neutral" dot={false}>{KIND_LABEL[x.period_kind]}</Badge> },               { key: 'scope', label: 'Périmètre', render: (x: any) => x.department_code ? <DeptChip label={x.department_label} color={x.department_color} /> : <Badge tone="accent">Direction générale</Badge> },               { key: 'hl', label: 'Faits marquants', num: true, render: (x: any) => <span className="text-success">{x.highlights}</span>, mobile: 'hide' },               { key: 'al', label: 'Points d’attention', num: true, render: (x: any) => x.alerts ? <span className="text-danger">{x.alerts}</span> : <span className="muted">0</span> },               { key: 'gen', label: 'Généré', render: (x: any) => <span className="small">{dateTime(x.generated_at)}<div className="xsmall muted">{x.generated_by_name ?? 'Automatisation'}</div></span>, mobile: 'hide' },             ] |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:91) |
| ReportView | DocButton | url=`/api/periodic-reports/${r.data.id}/pdf` |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:127) |
| ReportView | DocButton | url=`/api/periodic-reports/${r.data.id}/docx` |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:127) |
| ReportView | ExcelButton | url=`/api/xlsx/report/${r.data.id}` |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:127) |
| ReportView | Button | onClick=() => window.print() ; aria-label=Imprimer l’écran |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:127) |
| ReportView | DataTable | columns=[             { key: 'label', label: 'Indicateur', render: (k: any) => <><strong>{k.label}</strong><div className="xsmall muted">{k.source}</div></> },             { key: 'value', label: 'Valeur', num: true, render: (k: any) => <strong>{fmtKpi(k.unit, k.value)}</strong> },             { key: 'previous', label: 'Période précédente', num: true, render: (k: any) => fmtKpi(k.unit, k.previous), mobile: 'hide' },             { key: 'trend', label: 'Tendance', render: (k: any) => <Trend k={k} /> },             { key: 'target', label: 'Cible', num: true, render: (k: any) => <>{fmtKpi(k.unit, k.target)}{k.target_prorated && <span className="xsmall muted"> *</span>}</>, mobile: 'hide' },             { key: 'status', label: 'Statut', render: (k: any) => <Badge tone={KPI_ST[k.status][1]}>{KPI_ST[k.status][0]}</Badge> },           ] |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:138) |
| DirectionSection | DataTable | columns=[           { key: 'label', label: 'Service', render: (s: any) => <DeptChip label={s.label} color={s.color} /> },           { key: 'td', label: 'Tâches terminées', num: true, render: (s: any) => s.tasks_done },           { key: 'to', label: 'En retard', num: true, render: (s: any) => s.tasks_overdue ? <span className="text-danger">{s.tasks_overdue}</span> : 0 },           { key: 'wo', label: 'OT livrés', num: true, render: (s: any) => s.workorders_completed, mobile: 'hide' },           { key: 'wl', label: 'OT en retard', num: true, render: (s: any) => s.workorders_late ? <span className="text-danger">{s.workorders_late}</span> : 0, mobile: 'hide' },           { key: 'pr', label: 'Présence', num: true, render: (s: any) => s.presence_pct !== null ? `${s.presence_pct} %` : '—' },           { key: 'rk', label: 'Risques élevés', num: true, render: (s: any) => s.high_risks ? <Badge tone="danger">{s.high_risks}</Badge> : 0, mobile: 'hide' },         ] |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:197) |
| SwotList | Button | onClick=() => setGen(true) | Préparer une analyse | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:224) |
| SwotList | ScopeFilter | value=dept ; onChange=setDept |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:225) |
| SwotList | DataTable | columns=[               { key: 'label', label: 'Période', render: (x: any) => <><strong style={{ textTransform: 'capitalize' }}>{x.label}</strong><div className="xsmall muted">{KIND_LABEL[x.period_kind]}</div></> },               { key: 'scope', label: 'Périmètre', render: (x: any) => x.department_code ? <DeptChip label={x.department_label} color={x.department_color} /> : <Badge tone="accent">Entreprise</Badge> },               { key: 'q', label: 'F / Fa / O / M', render: (x: any) => <span className="swot-mini"><b className="s">{x.forces}</b><b className="w">{x.faiblesses}</b><b className="o">{x.opportunites}</b><b className="t">{x.menaces}</b></span> },               { key: 'reco', label: 'Recommandations', num: true, render: (x: any) => x.recommendations, mobile: 'hide' },               { key: 'st', label: 'Statut', render: (x: any) => <Badge tone={SWOT_ST[x.status][1]}>{SWOT_ST[x.status][0]}</Badge> },             ] |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:228) |
| SwotView | DocButton | url=`/api/swot/${s.id}/pdf` |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:265) |
| SwotView | DocButton | url=`/api/swot/${s.id}/docx` |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:265) |
| SwotView | ExcelButton | url=`/api/xlsx/swot/${s.id}` |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:265) |
| SwotView | Button | onClick=() => window.print() ; aria-label=Imprimer l’écran |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:265) |
| SwotView | DataTable | columns=[           { key: 'priority', label: 'Priorité', render: (x: any) => <Badge tone={PRIO[x.priority]}>{x.priority}</Badge> },           { key: 'strategy', label: 'Axe', render: (x: any) => <span className={`swot-tag swot-${QUAD.find((q) => q[0] === x.axis)?.[3]}`}>{x.strategy}</span> },           { key: 'finding', label: 'Constat', render: (x: any) => <><strong className="small">{x.finding}</strong><div className="xsmall muted">{x.evidence}</div></> },           { key: 'action', label: 'Action recommandée', render: (x: any) => <span className="small">{x.action}</span> },           { key: 'owner', label: 'Porteur suggéré', render: (x: any) => <span className="small">{x.owner}</span>, mobile: 'hide' },           { key: 'horizon', label: 'Horizon', render: (x: any) => <span className="small">{x.horizon}</span>, mobile: 'hide' },         ] |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:279) |
| SwotView | Field | label=Commentaire |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:292) |
| SwotView | Textarea | placeholder=Décisions prises, actions retenues… ; value=comment ; onChange=(e) => setComment(e.target.value) |  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:292) |
| SwotView | Button | onClick=() => review.run('revue') | Marquer comme revue | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:294) |
| SwotView | Button | onClick=() => review.run('validee') | Valider l’analyse | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:295) |
| SwotView | Link | to=/indicateurs | Voir les indicateurs et leurs cibles → | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:301) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| ScopeFilter | label = Tous les périmètres | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:66) |
| ScopeFilter | label = Direction générale | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:66) |
| PeriodicReports | id =  | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:86) |
| PeriodicReports | label = Tous | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:86) |
| PeriodicReports | key = label | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:94) |
| PeriodicReports | label = Période | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:94) |
| PeriodicReports | key = kind | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:95) |
| PeriodicReports | label = Périodicité | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:95) |
| PeriodicReports | key = scope | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:96) |
| PeriodicReports | label = Périmètre | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:96) |
| PeriodicReports | key = hl | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:97) |
| PeriodicReports | label = Faits marquants | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:97) |
| PeriodicReports | key = al | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:98) |
| PeriodicReports | label = Points d’attention | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:98) |
| PeriodicReports | key = gen | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:99) |
| PeriodicReports | label = Généré | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:99) |
| ReportView | label = Rapports périodiques | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:123) |
| ReportView | key = label | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:139) |
| ReportView | label = Indicateur | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:139) |
| ReportView | key = value | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:140) |
| ReportView | label = Valeur | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:140) |
| ReportView | key = previous | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:141) |
| ReportView | label = Période précédente | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:141) |
| ReportView | key = trend | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:142) |
| ReportView | label = Tendance | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:142) |
| ReportView | key = target | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:143) |
| ReportView | label = Cible | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:143) |
| ReportView | key = status | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:144) |
| ReportView | label = Statut | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:144) |
| DirectionSection | key = label | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:198) |
| DirectionSection | label = Service | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:198) |
| DirectionSection | key = td | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:199) |
| DirectionSection | label = Tâches terminées | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:199) |
| DirectionSection | key = to | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:200) |
| DirectionSection | label = En retard | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:200) |
| DirectionSection | key = wo | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:201) |
| DirectionSection | label = OT livrés | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:201) |
| DirectionSection | key = wl | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:202) |
| DirectionSection | label = OT en retard | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:202) |
| DirectionSection | key = pr | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:203) |
| DirectionSection | label = Présence | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:203) |
| DirectionSection | key = rk | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:204) |
| DirectionSection | label = Risques élevés | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:204) |
| SwotList | key = label | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:230) |
| SwotList | label = Période | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:230) |
| SwotList | key = scope | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:231) |
| SwotList | label = Périmètre | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:231) |
| SwotList | key = q | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:232) |
| SwotList | label = F / Fa / O / M | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:232) |
| SwotList | key = reco | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:233) |
| SwotList | label = Recommandations | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:233) |
| SwotList | key = st | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:234) |
| SwotList | label = Statut | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:234) |
| SwotView | label = Analyse SWOT | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:261) |
| SwotView | key = priority | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:280) |
| SwotView | label = Priorité | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:280) |
| SwotView | key = strategy | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:281) |
| SwotView | label = Axe | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:281) |
| SwotView | key = finding | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:282) |
| SwotView | label = Constat | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:282) |
| SwotView | key = action | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:283) |
| SwotView | label = Action recommandée | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:283) |
| SwotView | key = owner | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:284) |
| SwotView | label = Porteur suggéré | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:284) |
| SwotView | key = horizon | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:285) |
| SwotView | label = Horizon | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:285) |
| PeriodicReports | useCan() | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:72) |
| PeriodicReports | can('reporting', 'export') | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:80) |
| SwotList | useCan() | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:214) |
| SwotList | can('reporting', 'export') | [Reports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Reports.tsx:220) |

## Royalties.tsx — CRM-054

Source : [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Royalties (export)](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:11), [payWithProof](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:28).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/toast`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Royalties | ``/api/royalties${qs(params)}`` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:20) |
| Royalties | `'/api/admin-records'` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:21) |
| Royalties | `'/api/supports'` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:22) |
| Royalties | `api.put(`/api/royalties/${edit.id}`)` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:26) |
| Royalties | ``/api/royalties/${edit.id}`` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:26) |
| Royalties | `api.post('/api/royalties')` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:26) |
| Royalties | `'/api/royalties'` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:26) |
| Royalties | `api.post(`/api/royalties/${v.id}/action`)` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:27) |
| Royalties | ``/api/royalties/${v.id}/action`` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:27) |
| payWithProof | `'/api/documents'` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:33) |
| Royalties | ``/api/royalties${qs({ ...params, format: 'xlsx' })}`` | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:42) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Royalties | ExcelButton | url=`/api/royalties${qs({ ...params, format: 'xlsx' })}` |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:42) |
| Royalties | Button | onClick=() => setEdit({ commune: '', support_id: '', beneficiary: '', period_start: `${today().slice(0, 4)}-01-01`, period_end: `${today().slice(0, 4)}-12-31`, basis: '', basis_quantity: '', rate: null, expected_amount: null, due_date: '', notes: '' }) | Nouvelle redevance | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:43) |
| Royalties | Tabs | value=tab ; onChange=setTab ; tabs=[{ id: 'royalties', label: 'Redevances' }, { id: 'records', label: 'Autorisations et pièces' }] |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:50) |
| Royalties | Segmented | label=Statut ; value=filter ; onChange=setFilter ; options=[{ id: 'open', label: 'À traiter' }, { id: 'a_valider', label: 'À valider' }, { id: 'en_retard', label: 'En retard' }, { id: 'conteste', label: 'Contestées' }, { id: 'paye', label: 'Payées' }, { id: 'all', label: 'Toutes' }] |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | Select | placeholder=Toutes communes ; value=commune ; onChange=(e) => setCommune(e.target.value) ; options=(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Commune |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:55) |
| Royalties | DataTable | columns=[                 { key: 'c', label: 'Commune / support', render: (x: any) => <><div className="cell-title">{label('commune', x.commune)}</div><div className="cell-sub">{x.support_code ?? 'Global'} · {x.beneficiary}</div></> },                 { key: 'p', label: 'Période', render: (x: any) => <span className="small nowrap">{date(x.period_start)} → {date(x.period_end)}</span>, mobile: 'hide' },                 { key: 'b', label: 'Base de calcul', render: (x: any) => <span className="xsmall">{x.basis}{x.basis_quantity ? ` (${x.basis_quantity} × ${money(x.rate)})` : ''}</span>, mobile: 'hide' },                 { key: 'e', label: 'Attendu', num: true, render: (x: any) => money(x.expected_amount) },                 { key: 'r', label: 'Restant', num: true, render: (x: any) => money(x.remaining) },                 { key: 'd', label: 'Échéance', render: (x: any) => <span className="small nowrap" style={x.due_date < today() && x.remaining > 0 ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{date(x.due_date)}</span> },                 { key: 's', label: 'Statut', render: (x: any) => <div className="row-wrap"><Status kind="royalty" code={x.status} />{x.proof_filename && <Badge tone="success" dot={false}><FileCheck2 size={11} />Justificatif</Badge>}</div> },                 { key: 'x', label: '', render: (x: any) => (                   <div className="row" style={{ justifyContent: 'flex-end' }}>                     {x.status === 'a_valider' && can('royalties', 'validate') && <Button size="sm" variant="primary" disabled={x.created_by === me?.id} title={x.created_by === me?.id ? 'Validation par une autre personne' : undefined} onClick={() => act.run({ id: x.id, body: { action: 'valider' } })}>Valider</Button>}                     {['a_payer', 'partiellement_paye', 'en_retard'].includes(x.status) && can('royalties', 'update') && <Button size="sm" onClick={() => setPay({ id: x.id, amount: x.remaining, paid_at: today(), file: null, hasProof: !!x.proof_document_id, max: x.remaining })}>Paiement</Button>}                     {['a_calculer', 'a_valider', 'conteste'].includes(x.status) && can('royalties', 'update') && <Button size="sm" variant="ghost" onClick={() => setEdit({ ...x, support_id: x.support_id ?? '', basis_quantity: x.basis_quantity ?? '', notes: x.notes ?? '' })}>Modifier</Button>}                     {!['paye', 'conteste'].includes(x.status) && can('royalties', 'update') && <Button size="sm" variant="ghost" onClick={() => setContest(x)}>Contester</Button>}                     {x.status === 'conteste' && can('royalties', 'validate') && <Button size="sm" variant="ghost" onClick={() => act.run({ id: x.id, body: { action: 'resoudre', comment: 'Contestation levée' } })}>Lever</Button>}                   </div>) },               ] |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:58) |
| Royalties | Button | title=x.created_by === me?.id ? 'Validation par une autre personne' : undefined ; onClick=() => act.run({ id: x.id, body: { action: 'valider' } }) | Valider | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:69) |
| Royalties | Button | onClick=() => setPay({ id: x.id, amount: x.remaining, paid_at: today(), file: null, hasProof: !!x.proof_document_id, max: x.remaining }) | Paiement | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:70) |
| Royalties | Button | onClick=() => setEdit({ ...x, support_id: x.support_id ?? '', basis_quantity: x.basis_quantity ?? '', notes: x.notes ?? '' }) | Modifier | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:71) |
| Royalties | Button | onClick=() => setContest(x) | Contester | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:72) |
| Royalties | Button | onClick=() => act.run({ id: x.id, body: { action: 'resoudre', comment: 'Contestation levée' } }) | Lever | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:73) |
| Royalties | DataTable | columns=[             { key: 't', label: 'Pièce', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.kind} · {x.reference ?? '—'}</div></> },             { key: 's', label: 'Support', render: (x: any) => x.support_code ?? label('commune', x.commune) },             { key: 'i', label: 'Délivrée', render: (x: any) => date(x.issued_at) },             { key: 'e', label: 'Expiration', render: (x: any) => x.expires_at ? <Badge tone={x.expiring ? 'warning' : 'neutral'}>{date(x.expires_at)}</Badge> : '—' },           ] |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:81) |
| Royalties | Modal | title=edit?.id ? 'Modifier la redevance' : 'Nouvelle redevance' |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:89) |
| Royalties | Button | onClick=() => setEdit(null) | Annuler | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:90) |
| Royalties | Button | onClick=() => save.run({ ...Object.fromEntries(Object.entries(edit).filter(([k]) => ['support_id', 'commune', 'beneficiary', 'period_start', 'period_end', 'basis', 'basis_quantity', 'rate', 'expected_amount', 'due_date', 'notes'].includes(k)).map(([k, v]) => [k, v === '' ? null : v])), basis: edit.basis ?? '', beneficiary: edit.beneficiary ?? '', basis_quantity: edit.basis_quantity === '' \|\| edit.basis_quantity === null ? null : Number(edit.basis_quantity) }) | Enregistrer | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:90) |
| Royalties | Field | label=Commune ; required=true |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:92) |
| Royalties | Select | placeholder=Choisir… ; value=edit.commune ; onChange=(e) => setEdit({ ...edit, commune: e.target.value }) ; options=(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label })) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:92) |
| Royalties | Field | label=Support |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:93) |
| Royalties | Select | placeholder=Global commune ; value=edit.support_id ; onChange=(e) => setEdit({ ...edit, support_id: e.target.value }) ; options=(supports.data?.rows ?? []).map((s: any) => ({ value: s.id, label: `${s.code} — ${s.name}` })) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:93) |
| Royalties | Field | label=Bénéficiaire |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:94) |
| Royalties | Input | placeholder=Mairie de … ; value=edit.beneficiary ; onChange=(e) => setEdit({ ...edit, beneficiary: e.target.value }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:94) |
| Royalties | Field | label=Début de période ; required=true |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:95) |
| Royalties | Input | type=date ; value=edit.period_start ; onChange=(e) => setEdit({ ...edit, period_start: e.target.value }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:95) |
| Royalties | Field | label=Fin de période ; required=true |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:96) |
| Royalties | Input | type=date ; value=edit.period_end ; onChange=(e) => setEdit({ ...edit, period_end: e.target.value }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:96) |
| Royalties | Field | label=Base de calcul (description) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:97) |
| Royalties | Input | placeholder=Surface (m²) × taux communal ; value=edit.basis ; onChange=(e) => setEdit({ ...edit, basis: e.target.value }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:97) |
| Royalties | Field | label=Quantité de base |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:98) |
| Royalties | Input | value=edit.basis_quantity ; onChange=(e) => setEdit({ ...edit, basis_quantity: e.target.value }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:98) |
| Royalties | Field | label=Taux unitaire |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:99) |
| Royalties | MoneyInput | value=edit.rate ; onChange=(v) => setEdit({ ...edit, rate: v }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:99) |
| Royalties | Field | label=Montant notifié (si pas de calcul) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:100) |
| Royalties | MoneyInput | value=edit.expected_amount ; onChange=(v) => setEdit({ ...edit, expected_amount: v }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:100) |
| Royalties | Field | label=Échéance ; required=true |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:101) |
| Royalties | Input | type=date ; value=edit.due_date ; onChange=(e) => setEdit({ ...edit, due_date: e.target.value }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:101) |
| Royalties | Field | label=Notes |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:102) |
| Royalties | Textarea | value=edit.notes ; onChange=(e) => setEdit({ ...edit, notes: e.target.value }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:102) |
| Royalties | Modal | title=Enregistrer un paiement |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:106) |
| Royalties | Button | onClick=() => setPay(null) | Annuler | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:107) |
| Royalties | Button | onClick=payWithProof | Enregistrer | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:107) |
| Royalties | Field | label=Montant |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:109) |
| Royalties | MoneyInput | value=pay.amount ; onChange=(v) => setPay({ ...pay, amount: v }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:109) |
| Royalties | Field | label=Date de paiement |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:110) |
| Royalties | Input | type=date ; value=pay.paid_at ; onChange=(e) => setPay({ ...pay, paid_at: e.target.value }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:110) |
| Royalties | Field | label=Justificatif ; required=!pay.hasProof |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:111) |
| Royalties | input | type=file ; onChange=(e) => setPay({ ...pay, file: e.target.files?.[0] ?? null }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:111) |
| Royalties | Modal | title=Contester la redevance |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:114) |
| Royalties | Button | onClick=() => setContest(null) | Annuler | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:114) |
| Royalties | Button | onClick=() => act.run({ id: contest.id, body: { action: 'contester', comment: contest.comment } }) | Contester | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:114) |
| Royalties | Field | label=Motif ; required=true |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:115) |
| Royalties | Textarea | value=contest?.comment ?? '' ; onChange=(e) => setContest({ ...contest, comment: e.target.value }) |  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:115) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Royalties | id = royalties | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:50) |
| Royalties | label = Redevances | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:50) |
| Royalties | id = records | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:50) |
| Royalties | label = Autorisations et pièces | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:50) |
| Royalties | id = open | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | label = À traiter | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | id = a_valider | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | label = À valider | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | id = en_retard | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | label = En retard | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | id = conteste | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | label = Contestées | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | id = paye | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | label = Payées | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | id = all | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | label = Toutes | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:54) |
| Royalties | key = c | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:60) |
| Royalties | label = Commune / support | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:60) |
| Royalties | key = p | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:61) |
| Royalties | label = Période | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:61) |
| Royalties | key = b | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:62) |
| Royalties | label = Base de calcul | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:62) |
| Royalties | key = e | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:63) |
| Royalties | label = Attendu | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:63) |
| Royalties | key = r | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:64) |
| Royalties | label = Restant | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:64) |
| Royalties | key = d | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:65) |
| Royalties | label = Échéance | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:65) |
| Royalties | key = s | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:66) |
| Royalties | label = Statut | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:66) |
| Royalties | key = x | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:67) |
| Royalties | label =  | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:67) |
| Royalties | key = t | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:82) |
| Royalties | label = Pièce | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:82) |
| Royalties | key = s | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:83) |
| Royalties | label = Support | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:83) |
| Royalties | key = i | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:84) |
| Royalties | label = Délivrée | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:84) |
| Royalties | key = e | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:85) |
| Royalties | label = Expiration | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:85) |
| Royalties | useCan() | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:12) |
| Royalties | can('royalties', 'export') | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:42) |
| Royalties | can('royalties', 'create') | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:43) |
| Royalties | can('royalties', 'validate') | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:69) |
| Royalties | can('royalties', 'update') | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:70) |
| Royalties | can('royalties', 'update') | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:71) |
| Royalties | can('royalties', 'update') | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:72) |
| Royalties | can('royalties', 'validate') | [Royalties.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Royalties.tsx:73) |

## SalesPipeline.tsx — CRM-042

Source : [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [covTone](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:11), [SalesPipeline (export)](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:15).

Dépendances locales : `../lib/hooks`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/ExportButton`, `./Performance`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| SalesPipeline | ``/api/performance/pipeline?${qs}`` | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:24) |
| SalesPipeline | ``/api/xlsx/sales-pipeline?${qs}`` | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:36) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| SalesPipeline | Segmented | label=Périodicité ; value=kind ; onChange=(k) => { setKind(k); setPeriod(periodsOf(k)[0].value); } ; options=[{ id: 'mois', label: 'Mois' }, { id: 'trimestre', label: 'Trimestre' }, { id: 'semestre', label: 'Semestre' }, { id: 'annee', label: 'Année' }] |  | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:33) |
| SalesPipeline | Select | value=period ; onChange=(e) => setPeriod(e.target.value) ; options=periods ; aria-label=Période |  | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:34) |
| SalesPipeline | Select | value=dept ; onChange=(e) => setDept(e.target.value) ; options=[{ value: '', label: 'Tous les services vendeurs' }, { value: 'commercial', label: 'Commercial et marketing' }, { value: 'regie', label: 'Régie publicitaire et médias' }] ; aria-label=Service vendeur |  | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:35) |
| SalesPipeline | ExcelButton | url=`/api/xlsx/sales-pipeline?${qs}` |  | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:36) |
| SalesPipeline | tr | onClick=() => nav(`/opportunites?owner=${x.user_id}`) |  | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:63) |
| SalesPipeline | Link | to=`/opportunites/${x.id}` | {x.title} | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:138) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| SalesPipeline | id = mois | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:33) |
| SalesPipeline | label = Mois | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:33) |
| SalesPipeline | id = trimestre | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:33) |
| SalesPipeline | label = Trimestre | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:33) |
| SalesPipeline | id = semestre | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:33) |
| SalesPipeline | label = Semestre | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:33) |
| SalesPipeline | id = annee | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:33) |
| SalesPipeline | label = Année | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:33) |
| SalesPipeline | label = Tous les services vendeurs | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:35) |
| SalesPipeline | label = Commercial et marketing | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:35) |
| SalesPipeline | label = Régie publicitaire et médias | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:35) |
| SalesPipeline | title = Couverture | [SalesPipeline.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SalesPipeline.tsx:44) |

## Security.tsx — CRM-063

Source : [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [RadarView](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:21), [LoginsView](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:37), [ArchivesView](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:70), [Security (export)](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:90).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/format`, `../components/ui`, `../components/charts`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| RadarView | `'/api/security/radar'` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:22) |
| LoginsView | ``/api/security/logins${query}`` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:40) |
| LoginsView | ``/api/xlsx/logins${query}`` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:50) |
| ArchivesView | `'/api/security/login-archives'` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:71) |
| ArchivesView | `api.post('/api/security/login-archives')` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:73) |
| ArchivesView | `'/api/security/login-archives'` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:73) |
| ArchivesView | `api.get(`/api/security/login-archives/${period}`)` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:74) |
| ArchivesView | ``/api/security/login-archives/${period}`` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:74) |
| ArchivesView | ``/api/xlsx/login-archives/${a.period}`` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:84) |
| Security | `'/api/security/overview'` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:91) |
| Security | ``/api/security/events${qs({ open: tab === 'open' ? 'true' : undefined })}`` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:94) |
| Security | `api.post('/api/security/run')` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:97) |
| Security | `'/api/security/run'` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:97) |
| Security | `api.post('/api/security/verify')` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:98) |
| Security | `'/api/security/verify'` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:98) |
| Security | `api.post(`/api/security/events/${id}/ack`)` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:99) |
| Security | ``/api/security/events/${id}/ack`` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:99) |
| Security | `api.del(`/api/security/blocks/${encodeURIComponent(ip)}`)` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:100) |
| Security | ``/api/security/blocks/${encodeURIComponent(ip)}`` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:100) |
| Security | `api.post('/api/security/blocks')` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:101) |
| Security | `'/api/security/blocks'` | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:101) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| RadarView | DataTable | columns=[         { key: 'd', label: 'Quand', render: (h: any) => <span className="small">{dateTime(h.at)}</span> },         { key: 'k', label: 'Nature', render: (h: any) => <><Badge tone={['injection_sql', 'commande', 'gabarit', 'outil', 'traversee'].includes(h.kind) ? 'danger' : 'warning'}>{KIND[h.kind] ?? h.kind}</Badge><div className="xsmall muted">{h.signature} · {LOCATION[h.location] ?? h.location}</div></> },         { key: 's', label: 'Source', render: (h: any) => <span className="small"><code>{h.ip ?? '—'}</code>{h.user_name ? <div className="xsmall">{h.user_name}</div> : null}</span> },         { key: 'p', label: 'Requête', mobile: 'hide', render: (h: any) => <span className="xsmall"><code>{h.method} {h.path}</code><div className="muted" style={{ wordBreak: 'break-all' }}>{h.sample}</div></span> },         { key: 'r', label: 'Riposte', render: (h: any) => <Badge tone={h.response === 'esquive_404' ? 'info' : 'warning'}>{h.response === 'esquive_404' ? 'Esquivée' : 'Refusée'}</Badge> },       ] |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:25) |
| LoginsView | ExcelButton | url=`/api/xlsx/logins${query}` |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:50) |
| LoginsView | Input | placeholder=Nom, identifiant ou adresse IP ; value=f.q ; onChange=(e) => setF({ ...f, q: e.target.value }) ; aria-label=Rechercher |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:52) |
| LoginsView | Select | placeholder=Tous les résultats ; value=f.outcome ; onChange=(e) => setF({ ...f, outcome: e.target.value }) ; options=Object.entries(outcomes).map(([value, label]) => ({ value, label: label as string })) ; aria-label=Résultat |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:53) |
| LoginsView | Input | type=date ; value=f.from ; onChange=(e) => setF({ ...f, from: e.target.value }) ; aria-label=Du |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:54) |
| LoginsView | Input | type=date ; value=f.to ; onChange=(e) => setF({ ...f, to: e.target.value }) ; aria-label=Au |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:55) |
| LoginsView | DataTable | columns=[           { key: 'd', label: 'Date et heure', render: (h: any) => <span className="small">{dateTime(h.at)}</span> },           { key: 'u', label: 'Personne', render: (h: any) => <><div className="cell-title">{h.full_name \|\| <span className="muted">Inconnu</span>}</div><div className="cell-sub">{h.identifier}{h.role_label ? ` · ${h.role_label}` : ''}</div></> },           { key: 'o', label: 'Résultat', render: (h: any) => <><Badge tone={OUT_TONE[h.outcome] ?? 'neutral'}>{outcomes[h.outcome] ?? h.outcome}</Badge>{h.detail ? <div className="xsmall muted">{h.detail}</div> : null}</> },           { key: 'i', label: 'Adresse', render: (h: any) => <code className="small">{h.ip ?? '—'}</code> },           { key: 'a', label: 'Navigateur', mobile: 'hide', render: (h: any) => <span className="xsmall muted" style={{ wordBreak: 'break-word' }}>{h.user_agent}</span> },         ] |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:57) |
| ArchivesView | Button | onClick=() => run.run(undefined) | Archiver les mois clos | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:77) |
| ArchivesView | DataTable | columns=[         { key: 'p', label: 'Mois', render: (a: any) => <strong>{a.period}</strong> },         { key: 'n', label: 'Connexions', num: true, render: (a: any) => a.rows_count },         { key: 'h', label: 'Empreinte SHA-256', mobile: 'hide', render: (a: any) => <code className="xsmall">{a.sha256.slice(0, 24)}…</code> },         { key: 'g', label: 'Scellée', render: (a: any) => <span className="small">{dateTime(a.generated_at)}<div className="xsmall muted">{a.generated_by_name ?? 'Archivage automatique'}</div></span> },         { key: 'a', label: '', render: (a: any) => <span className="row-wrap"><Button size="sm" variant="ghost" onClick={() => verify.run(a.period)}>Vérifier</Button><ExcelButton url={`/api/xlsx/login-archives/${a.period}`} /></span> },       ] |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:79) |
| ArchivesView | Button | onClick=() => verify.run(a.period) | Vérifier | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:84) |
| ArchivesView | ExcelButton | url=`/api/xlsx/login-archives/${a.period}` |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:84) |
| Security | Button | onClick=() => verify.run(undefined) | Vérifier le journal | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:108) |
| Security | Button | onClick=() => run.run(undefined) | Exécuter les agents | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:108) |
| Security | Tabs | value=view ; onChange=setView ; tabs=[{ id: 'surveillance', label: <><ShieldCheck aria-hidden /> Surveillance</> }, { id: 'radars', label: <><Radar aria-hidden /> Radars{d.radar?.day ? ` (${d.radar.day})` : ''}</> },         ...(d.can_view_logins ? [{ id: 'connexions', label: <><History aria-hidden /> Historique des connexions</> }, { id: 'archives', label: <><Archive aria-hidden /> Archives</> }] : [])] |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:109) |
| Security | DataTable | columns=[           { key: 'l', label: 'Agent', render: (a: any) => <span className="small strong"><ShieldCheck size={14} className="ic-xs" /> {a.label}</span> },           { key: 'r', label: 'Dernier passage', render: (a: any) => <span className="small">{a.last_run ? relative(a.last_run) : 'Jamais'}{a.last_ms != null ? ` · ${a.last_ms} ms` : ''}</span> },           { key: 'f', label: 'Constats (cumul)', num: true, render: (a: any) => a.findings ?? 0 },           { key: 'e', label: 'État', render: (a: any) => a.last_error ? <Badge tone="danger">{a.last_error}</Badge> : a.last_run ? <Badge tone="success">Actif</Badge> : <Badge>En attente</Badge> },         ] |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:132) |
| Security | Tabs | value=tab ; onChange=setTab ; tabs=[{ id: 'open', label: 'À examiner' }, { id: 'all', label: 'Tous les événements' }] |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:139) |
| Security | DataTable | columns=[           { key: 's', label: 'Niveau', render: (e: any) => <Badge tone={SEV[e.severity][0]}>{SEV[e.severity][1]}</Badge> },           { key: 't', label: 'Événement', render: (e: any) => <><div className="cell-title">{e.title}</div><div className="cell-sub">{KIND[e.kind] ?? e.kind}{e.ip ? ` · ${e.ip}` : ''}{e.user_name ? ` · ${e.user_name}` : ''}{e.action_taken ? ` · ${e.action_taken}` : ''}</div></> },           { key: 'd', label: 'Quand', render: (e: any) => <span className="small">{dateTime(e.at)}</span>, mobile: 'hide' },           { key: 'a', label: '', render: (e: any) => e.acknowledged_at ? <span className="xsmall muted">Pris en compte par {e.acknowledged_by_name}</span> : d.can_act && e.severity !== 'info' ? <Button size="sm" onClick={() => ack.run(e.id)}>Pris en compte</Button> : null },         ] |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:140) |
| Security | Button | onClick=() => ack.run(e.id) | Pris en compte | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:144) |
| Security | Button | onClick=() => setBlockForm({ ip: '', reason: '', minutes: 60 }) | Bloquer une adresse | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:147) |
| Security | DataTable | columns=[           { key: 'ip', label: 'Adresse', render: (b: any) => <code>{b.ip}</code> },           { key: 'r', label: 'Motif', render: (b: any) => <span className="small">{b.reason}<div className="xsmall muted">{b.created_by_name ? `Par ${b.created_by_name}` : 'Par un agent de surveillance'} · {relative(b.blocked_at)}</div></span> },           { key: 'u', label: 'Jusqu’à', render: (b: any) => <span className="small">{b.until ? dateTime(b.until) : 'Levée manuelle'}</span> },           { key: 'a', label: '', render: (b: any) => d.can_act ? <Button size="sm" variant="ghost" onClick={() => lift.run(b.ip)}>Lever</Button> : null },         ] |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:148) |
| Security | Button | onClick=() => lift.run(b.ip) | Lever | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:152) |
| Security | Modal | title=Bloquer une adresse IP |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:160) |
| Security | Button | onClick=() => setBlockForm(null) | Annuler | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:161) |
| Security | Button | onClick=() => block.run({ ...blockForm, minutes: blockForm.minutes \|\| null }) | Bloquer | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:161) |
| Security | Field | label=Adresse IP ; required=true |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:163) |
| Security | Input | placeholder=203.0.113.10 ; value=blockForm.ip ; onChange=(e) => setBlockForm({ ...blockForm, ip: e.target.value.trim() }) |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:163) |
| Security | Field | label=Durée (minutes) |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:164) |
| Security | Input | type=number ; value=blockForm.minutes ?? '' ; onChange=(e) => setBlockForm({ ...blockForm, minutes: e.target.value ? Number(e.target.value) : null }) |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:164) |
| Security | Field | label=Motif ; required=true |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:165) |
| Security | Input | value=blockForm.reason ; onChange=(e) => setBlockForm({ ...blockForm, reason: e.target.value }) |  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:165) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| RadarView | key = d | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:26) |
| RadarView | label = Quand | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:26) |
| RadarView | key = k | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:27) |
| RadarView | label = Nature | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:27) |
| RadarView | key = s | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:28) |
| RadarView | label = Source | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:28) |
| RadarView | key = p | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:29) |
| RadarView | label = Requête | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:29) |
| RadarView | key = r | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:30) |
| RadarView | label = Riposte | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:30) |
| LoginsView | key = d | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:58) |
| LoginsView | label = Date et heure | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:58) |
| LoginsView | key = u | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:59) |
| LoginsView | label = Personne | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:59) |
| LoginsView | key = o | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:60) |
| LoginsView | label = Résultat | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:60) |
| LoginsView | key = i | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:61) |
| LoginsView | label = Adresse | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:61) |
| LoginsView | key = a | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:62) |
| LoginsView | label = Navigateur | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:62) |
| ArchivesView | key = p | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:80) |
| ArchivesView | label = Mois | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:80) |
| ArchivesView | key = n | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:81) |
| ArchivesView | label = Connexions | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:81) |
| ArchivesView | key = h | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:82) |
| ArchivesView | label = Empreinte SHA-256 | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:82) |
| ArchivesView | key = g | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:83) |
| ArchivesView | label = Scellée | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:83) |
| ArchivesView | key = a | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:84) |
| ArchivesView | label =  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:84) |
| Security | id = surveillance | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:109) |
| Security | id = radars | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:109) |
| Security | id = connexions | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:110) |
| Security | id = archives | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:110) |
| Security | key = r | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:125) |
| Security | label = Refus | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:125) |
| Security | key = l | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:133) |
| Security | label = Agent | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:133) |
| Security | key = r | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:134) |
| Security | label = Dernier passage | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:134) |
| Security | key = f | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:135) |
| Security | label = Constats (cumul) | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:135) |
| Security | key = e | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:136) |
| Security | label = État | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:136) |
| Security | id = open | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:139) |
| Security | label = À examiner | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:139) |
| Security | id = all | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:139) |
| Security | label = Tous les événements | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:139) |
| Security | key = s | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:141) |
| Security | label = Niveau | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:141) |
| Security | key = t | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:142) |
| Security | label = Événement | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:142) |
| Security | key = d | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:143) |
| Security | label = Quand | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:143) |
| Security | key = a | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:144) |
| Security | label =  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:144) |
| Security | key = ip | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:149) |
| Security | label = Adresse | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:149) |
| Security | key = r | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:150) |
| Security | label = Motif | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:150) |
| Security | key = u | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:151) |
| Security | label = Jusqu’à | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:151) |
| Security | key = a | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:152) |
| Security | label =  | [Security.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Security.tsx:152) |

## StockItemDetail.tsx — CRM-066

Source : [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [StockItemDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:13), [MoveModal](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:86), [submit](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:93), [BomEditor](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:121), [PurchasePrices](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:148).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `./Stocks`, `./Production`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| StockItemDetail | ``/api/stocks/items/${id}`` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:18) |
| StockItemDetail | `api.del(`/api/stocks/items/${id}`)` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:20) |
| StockItemDetail | ``/api/stocks/items/${id}`` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:20) |
| MoveModal | `'/api/campaigns?active=true'` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:88) |
| MoveModal | `api.post(`/api/stocks/items/${item.id}/${kind}`)` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:89) |
| MoveModal | ``/api/stocks/items/${item.id}/${kind}`` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:89) |
| BomEditor | `'/api/stocks/items'` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:122) |
| BomEditor | `api.put(`/api/stocks/items/${item.id}/bom`)` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:125) |
| BomEditor | ``/api/stocks/items/${item.id}/bom`` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:125) |
| PurchasePrices | ``/api/stocks/items/${itemId}/prices`` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:149) |
| PurchasePrices | `api.post(`/api/stocks/items/${itemId}/prices`)` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:151) |
| PurchasePrices | ``/api/stocks/items/${itemId}/prices`` | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:151) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| StockItemDetail | Button | onClick=() => setOp('receive') | Réception | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:32) |
| StockItemDetail | Button | onClick=() => setOp('consume') | Sortie | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:33) |
| StockItemDetail | Button | onClick=() => setOp('adjust') | Inventaire | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:34) |
| StockItemDetail | Button | onClick=() => setOp('order') | Fabriquer | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:35) |
| StockItemDetail | Button | onClick=() => setOp('edit') | Modifier | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:36) |
| StockItemDetail | Button | onClick=() => setOp('bom') | Modifier | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:49) |
| StockItemDetail | DataTable | columns=[                     { key: 'c', label: 'Composant', render: (b: any) => <Link to={`/stocks/${b.component_id}`}><span className="small strong">{b.code}</span> <span className="xsmall muted">{b.label}</span></Link> },                     { key: 'q', label: 'Qté / unité', num: true, render: (b: any) => `${num(b.quantity)} ${b.unit}` },                     { key: 'u', label: 'Coût unitaire', num: true, render: (b: any) => <span>{money(Math.round(b.unit_cost))}<div className="xsmall muted">{b.cost_source === 'cump' ? 'CUMP' : b.cost_source}</div></span> },                     { key: 'l', label: 'Coût', num: true, render: (b: any) => money(b.line_cost) },                     { key: 's', label: 'Disponible', num: true, render: (b: any) => <span className="small">{num(b.qty_on_hand)} {b.unit}</span>, mobile: 'hide' },                   ] |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:52) |
| StockItemDetail | Link | to=`/stocks/${b.component_id}` | <span className="small strong">{b.code}</span> <span className="xsmall muted">{b.label}</span> | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:53) |
| StockItemDetail | Link | to=`/stocks/${u.id}` | {u.code} | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:70) |
| StockItemDetail | Link | to=`/production?ordre=${o.id}` | {o.number} | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:71) |
| StockItemDetail | Button | onClick=() => setOp('delete') | Mettre à la corbeille | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:72) |
| StockItemDetail | ConfirmModal | title=Mettre l’article à la corbeille ? |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:81) |
| MoveModal | Modal | title=kind === 'receive' ? `Réception — ${item.code}` : kind === 'consume' ? `Sortie de stock — ${item.code}` : `Inventaire — ${item.code}` |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:99) |
| MoveModal | Button | onClick=onClose | Annuler | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:101) |
| MoveModal | Button | onClick=submit | Enregistrer | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:101) |
| MoveModal | Field | label=`Quantité (${item.unit})` ; required=true |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:103) |
| MoveModal | Input | type=number ; value=f.quantity ; onChange=(e) => setF({ ...f, quantity: e.target.value }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:103) |
| MoveModal | Field | label=Coût unitaire d’achat HT ; required=true |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:105) |
| MoveModal | MoneyInput | value=f.unit_cost ; onChange=(v) => setF({ ...f, unit_cost: v }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:105) |
| MoveModal | Field | label=Fournisseur |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:106) |
| MoveModal | Input | value=f.supplier ; onChange=(e) => setF({ ...f, supplier: e.target.value }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:106) |
| MoveModal | Field | label=Référence (bon de livraison, facture) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:107) |
| MoveModal | Input | value=f.reference ; onChange=(e) => setF({ ...f, reference: e.target.value }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:107) |
| MoveModal | Field | label=`Quantité comptée (${item.unit})` ; required=true |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:110) |
| MoveModal | Input | type=number ; value=f.counted_qty ; onChange=(e) => setF({ ...f, counted_qty: e.target.value }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:110) |
| MoveModal | Field | label=Coût unitaire des quantités trouvées |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:111) |
| MoveModal | MoneyInput | value=f.unit_cost ; onChange=(v) => setF({ ...f, unit_cost: v }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:111) |
| MoveModal | Field | label=Campagne (facultatif) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:113) |
| MoveModal | Select | placeholder=— ; value=f.campaign_id ?? '' ; onChange=(e) => setF({ ...f, campaign_id: e.target.value }) ; options=(campaigns.data?.rows ?? []).map((c: any) => ({ value: c.id, label: `${c.ref} — ${c.title}` })) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:113) |
| MoveModal | Field | label=kind === 'adjust' ? 'Motif de l’écart' : 'Motif de la sortie' ; required=true |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:114) |
| MoveModal | Textarea | value=f.reason ; onChange=(e) => setF({ ...f, reason: e.target.value }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:114) |
| BomEditor | Modal | title=`Nomenclature — ${item.code}` |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:130) |
| BomEditor | Button | onClick=onClose | Annuler | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:131) |
| BomEditor | Button | onClick=() => save.run(undefined) | Enregistrer | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:131) |
| BomEditor | Select | placeholder=Choisir un composant… ; value=l.component_id ; onChange=(e) => { const n = [...lines]; n[i] = { ...l, component_id: e.target.value }; setLines(n); } ; options=options ; aria-label=Composant |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:135) |
| BomEditor | Input | type=number ; value=l.quantity ; onChange=(e) => { const n = [...lines]; n[i] = { ...l, quantity: e.target.value }; setLines(n); } ; aria-label=Quantité par unité |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:136) |
| BomEditor | Button | onClick=() => setLines(lines.filter((_, j) => j !== i)) ; aria-label=Retirer le composant |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:137) |
| BomEditor | Button | onClick=() => setLines([...lines, { component_id: '', quantity: 1 }]) | Ajouter un composant | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:140) |
| PurchasePrices | Button | onClick=() => setF({ supplier: '', unit_price: null, reference: '', valid_to: '' }) | Tarif fournisseur | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:154) |
| PurchasePrices | DataTable | columns=[         { key: 's', label: 'Fournisseur', render: (p: any) => <><div className="cell-title">{p.supplier}</div><div className="cell-sub">{p.reference \|\| '—'}</div></> },         { key: 'src', label: 'Origine', render: (p: any) => <Badge tone={p.source === 'tarif' ? 'info' : 'success'}>{p.source === 'tarif' ? 'Tarif' : 'Réception'}</Badge> },         { key: 'p', label: 'Prix unitaire HT', num: true, render: (p: any) => money(p.unit_price) },         { key: 'd', label: 'Validité', render: (p: any) => <span className="small">{date(p.valid_from)}{p.valid_to ? ` → ${date(p.valid_to)}` : ''}{!p.current && <> <Badge>Échu</Badge></>}</span>, mobile: 'hide' },         { key: 'c', label: 'Comptabilité', render: (p: any) => p.entry_number ? <span className="small">{p.entry_number} · {p.entry_status}</span> : <span className="xsmall muted">{p.source === 'tarif' ? 'Pas d’achat' : '—'}</span>, mobile: 'hide' },       ] |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:155) |
| PurchasePrices | Modal | title=Tarif fournisseur |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:162) |
| PurchasePrices | Button | onClick=() => setF(null) | Annuler | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:163) |
| PurchasePrices | Button | onClick=() => add.run({ ...f, unit_price: f.unit_price ?? 0, valid_to: f.valid_to \|\| null }) | Enregistrer | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:163) |
| PurchasePrices | Field | label=Fournisseur ; required=true |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:165) |
| PurchasePrices | Input | value=f.supplier ; onChange=(e) => setF({ ...f, supplier: e.target.value }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:165) |
| PurchasePrices | Field | label=Prix unitaire HT ; required=true |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:166) |
| PurchasePrices | MoneyInput | value=f.unit_price ; onChange=(v) => setF({ ...f, unit_price: v }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:166) |
| PurchasePrices | Field | label=Référence (devis fournisseur) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:167) |
| PurchasePrices | Input | value=f.reference ; onChange=(e) => setF({ ...f, reference: e.target.value }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:167) |
| PurchasePrices | Field | label=Valable jusqu’au |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:168) |
| PurchasePrices | Input | type=date ; value=f.valid_to ; onChange=(e) => setF({ ...f, valid_to: e.target.value }) |  | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:168) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| StockItemDetail | label = Stocks et matières | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:28) |
| StockItemDetail | title = CUMP | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:41) |
| StockItemDetail | key = c | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:53) |
| StockItemDetail | label = Composant | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:53) |
| StockItemDetail | key = q | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:54) |
| StockItemDetail | label = Qté / unité | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:54) |
| StockItemDetail | key = u | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:55) |
| StockItemDetail | label = Coût unitaire | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:55) |
| StockItemDetail | key = l | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:56) |
| StockItemDetail | label = Coût | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:56) |
| StockItemDetail | key = s | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:57) |
| StockItemDetail | label = Disponible | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:57) |
| PurchasePrices | key = s | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:156) |
| PurchasePrices | label = Fournisseur | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:156) |
| PurchasePrices | key = src | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:157) |
| PurchasePrices | label = Origine | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:157) |
| PurchasePrices | key = p | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:158) |
| PurchasePrices | label = Prix unitaire HT | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:158) |
| PurchasePrices | key = d | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:159) |
| PurchasePrices | label = Validité | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:159) |
| PurchasePrices | key = c | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:160) |
| PurchasePrices | label = Comptabilité | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:160) |
| StockItemDetail | useCan() | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:16) |
| StockItemDetail | can('stocks', 'create') | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:32) |
| StockItemDetail | can('stocks', 'create') | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:33) |
| StockItemDetail | can('stocks', 'validate') | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:34) |
| StockItemDetail | can('production', 'create') | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:35) |
| StockItemDetail | can('stocks', 'update') | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:36) |
| StockItemDetail | can('stocks', 'update') | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:49) |
| StockItemDetail | can('stocks', 'create') | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:64) |
| StockItemDetail | can('stocks', 'delete') | [StockItemDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/StockItemDetail.tsx:72) |

## Stocks.tsx — CRM-065

Source : [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [StockItemForm (export)](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:13), [set](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:18), [submit](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:22), [Stocks (export)](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:54), [set](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:64), [k](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:74), [MovementsTable (export)](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:143).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/charts`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| StockItemForm | `api.patch(`/api/stocks/items/${initial.id}`)` | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:19) |
| StockItemForm | ``/api/stocks/items/${initial.id}`` | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:19) |
| StockItemForm | `api.post('/api/stocks/items')` | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:19) |
| StockItemForm | `'/api/stocks/items'` | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:19) |
| Stocks | ``/api/stocks/items${qs(params)}`` | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:66) |
| Stocks | `'/api/stocks/valuation'` | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:67) |
| Stocks | ``/api/stocks/movements${qs({ kind: mvKind, from, to })}`` | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:71) |
| Stocks | ``/api/stocks/movements${qs({ kind: mvKind, from, to, format: 'xlsx' })}`` | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:79) |
| Stocks | ``/api/stocks/items${qs({ ...params, format: 'xlsx' })}`` | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:79) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| StockItemForm | Modal | title=initial ? `Modifier ${initial.code}` : 'Nouvel article de stock' |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:30) |
| StockItemForm | Button | onClick=onClose | Annuler | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:32) |
| StockItemForm | Button | onClick=submit | Enregistrer | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:32) |
| StockItemForm | Field | label=Code ; required=true |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:34) |
| StockItemForm | Input | placeholder=MP-TUBE-80 ; value=f.code ; onChange=set('code') |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:34) |
| StockItemForm | Field | label=Nature ; required=true |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:35) |
| StockItemForm | Select | value=f.kind ; onChange=set('kind') ; options=Object.entries(STOCK_KIND).map(([value, label]) => ({ value, label })) |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:35) |
| StockItemForm | Field | label=Désignation ; required=true |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:36) |
| StockItemForm | Input | value=f.label ; onChange=set('label') |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:36) |
| StockItemForm | Field | label=Catégorie |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:37) |
| StockItemForm | Select | placeholder=— ; value=f.category ; onChange=set('category') ; options=(lookups.stock_category ?? []).map((x) => ({ value: x.code, label: x.label })) |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:37) |
| StockItemForm | Field | label=Unité de stock ; required=true |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:38) |
| StockItemForm | Input | placeholder=pièce, m², litre, barre… ; value=f.unit ; onChange=set('unit') |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:38) |
| StockItemForm | Field | label=Seuil d’alerte |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:39) |
| StockItemForm | Input | type=number ; value=f.min_qty ; onChange=set('min_qty') |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:39) |
| StockItemForm | Field | label=Main-d’œuvre par unité fabriquée (FCFA) |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:40) |
| StockItemForm | MoneyInput | value=Number(f.labor_cost) \|\| 0 ; onChange=set('labor_cost') |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:40) |
| StockItemForm | Field | label=Emplacement |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:41) |
| StockItemForm | Input | value=f.location ; onChange=set('location') |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:41) |
| StockItemForm | Field | label=Fournisseur habituel |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:42) |
| StockItemForm | Input | value=f.supplier ; onChange=set('supplier') |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:42) |
| StockItemForm | Field | label=Stock d’ouverture |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:44) |
| StockItemForm | Input | type=number ; value=f.initial_qty ; onChange=set('initial_qty') |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:44) |
| StockItemForm | Field | label=Coût unitaire d’achat du stock d’ouverture |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:45) |
| StockItemForm | MoneyInput | value=f.initial_unit_cost ; onChange=set('initial_unit_cost') |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:45) |
| StockItemForm | Field | label=Description |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:47) |
| StockItemForm | Textarea | value=f.description ; onChange=set('description') |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:47) |
| Stocks | ExcelButton | url=tab === 'mouvements' ? `/api/stocks/movements${qs({ kind: mvKind, from, to, format: 'xlsx' })}` : `/api/stocks/items${qs({ ...params, format: 'xlsx' })}` |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:79) |
| Stocks | Button | onClick=() => setForm(true) | Nouvel article | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:80) |
| Stocks | Kpi | label=Matières premières ; value=moneyShort(k('matiere_premiere')?.value ?? 0) ; onClick=() => set({ tab: 'articles', kind: 'matiere_premiere', alert: '' }) |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:83) |
| Stocks | Kpi | label=Sous le seuil d’alerte ; value=low ; onClick=() => set({ tab: 'articles', alert: '1', kind: '' }) |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:85) |
| Stocks | Tabs | value=tab ; onChange=(t) => set({ tab: t === 'articles' ? '' : t }) ; tabs=[{ id: 'articles', label: 'Articles' }, { id: 'mouvements', label: 'Mouvements' }, { id: 'valorisation', label: 'Valorisation' }] |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:87) |
| Stocks | Input | placeholder=Rechercher (code, désignation, fournisseur)… ; value=search ; onChange=(e) => setSearch(e.target.value) ; aria-label=Rechercher |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:91) |
| Stocks | Segmented | label=Nature ; value=kind ; onChange=(x) => set({ kind: x }) ; options=[{ id: '', label: 'Tous' }, ...Object.entries(STOCK_KIND).map(([id, l]) => ({ id, label: l }))] |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:92) |
| Stocks | Select | placeholder=Toutes catégories ; value=category ; onChange=(e) => setCategory(e.target.value) ; options=(lookups.stock_category ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Catégorie |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:93) |
| Stocks | Button | onClick=() => set({ alert: '' }) | Retirer le filtre « sous le seuil » | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:94) |
| Stocks | DataTable | columns=[                 { key: 'c', label: 'Article', render: (x: any) => <><div className="cell-title">{x.label}</div><div className="cell-sub">{x.code} · {label('stock_category', x.category \|\| null)}{x.bom_count ? ` · nomenclature ${x.bom_count} composant(s)` : ''}</div></> },                 { key: 'k', label: 'Nature', render: (x: any) => <Status kind="stock_kind" code={x.kind} />, mobile: 'hide' },                 { key: 'q', label: 'En stock', num: true, render: (x: any) => <span className={x.is_low ? 'strong' : ''} style={x.is_low ? { color: 'var(--warning)' } : undefined}>{num(x.qty_on_hand)} {x.unit}{x.is_low && <div className="xsmall row" style={{ justifyContent: 'flex-end', gap: 4 }}><AlertTriangle size={12} />seuil {num(x.min_qty)}</div>}</span> },                 { key: 'p', label: 'CUMP', num: true, render: (x: any) => (x.avg_cost ? money(Math.round(x.avg_cost)) : <span className="muted">—</span>) },                 { key: 'v', label: 'Valeur', num: true, render: (x: any) => money(x.stock_value), mobile: 'hide' },                 { key: 'm', label: 'Dernier mouvement', render: (x: any) => <span className="small">{x.last_movement_at ? relative(x.last_movement_at) : '—'}</span>, mobile: 'hide' },               ] |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:97) |
| Stocks | Select | placeholder=Tous les mouvements ; value=mvKind ; onChange=(e) => setMvKind(e.target.value) ; options=Object.entries(MOVE_KIND).map(([value, l]) => ({ value, label: l })) ; aria-label=Type de mouvement |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:113) |
| Stocks | Field | label=Du |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:114) |
| Stocks | Input | type=date ; value=from ; onChange=(e) => setFrom(e.target.value) |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:114) |
| Stocks | Field | label=Au |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:115) |
| Stocks | Input | type=date ; value=to ; onChange=(e) => setTo(e.target.value) |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:115) |
| Stocks | DataTable | columns=[               { key: 'm', label: 'Mois', render: (f: any) => f.month },               { key: 'a', label: 'Achats', num: true, render: (f: any) => money(f.purchases) },               { key: 'c', label: 'Consommations', num: true, render: (f: any) => money(f.consumption) },               { key: 'p', label: 'Production', num: true, render: (f: any) => money(f.production) },               { key: 'j', label: 'Ajustements', num: true, render: (f: any) => <span style={f.adjustments < 0 ? { color: 'var(--danger)' } : undefined}>{money(f.adjustments)}</span> },             ] |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:128) |
| MovementsTable | DataTable | columns=[       { key: 'd', label: 'Date', render: (m: any) => <span className="xsmall nowrap">{dateTime(m.created_at)}</span> },       ...(showItem ? [{ key: 'i', label: 'Article', render: (m: any) => <><div className="small strong">{m.item_code}</div><div className="xsmall muted">{m.item_label}</div></> }] : []),       { key: 'k', label: 'Mouvement', render: (m: any) => <><Badge tone={m.quantity > 0 ? 'success' : 'neutral'}>{MOVE_KIND[m.kind] ?? m.kind}</Badge><div className="xsmall muted">{[m.reference, m.supplier, m.reason, m.order_number && !String(m.reason).includes(m.order_number) ? m.order_number : null, m.quote_number, m.campaign_ref].filter(Boolean).join(' · ')}</div></> },       { key: 'q', label: 'Quantité', num: true, render: (m: any) => <span className="strong">{m.quantity > 0 ? '+' : ''}{num(m.quantity)}{m.item_unit ? ` ${m.item_unit}` : ''}</span> },       { key: 'c', label: 'Coût unitaire', num: true, render: (m: any) => money(Math.round(m.unit_cost)), mobile: 'hide' },       { key: 'v', label: 'Valeur', num: true, render: (m: any) => money(m.value) },       { key: 'a', label: 'Stock après', num: true, render: (m: any) => <span className="small">{num(m.qty_after)} · CUMP {money(Math.round(m.avg_cost_after))}</span>, mobile: 'hide' },       { key: 'u', label: 'Par', render: (m: any) => <span className="xsmall">{m.created_by_name}</span>, mobile: 'hide' },     ] |  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:146) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| StockItemForm | label =  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:16) |
| Stocks | title = Valorisation | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:82) |
| Stocks | id = articles | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:87) |
| Stocks | label = Articles | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:87) |
| Stocks | id = mouvements | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:87) |
| Stocks | label = Mouvements | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:87) |
| Stocks | id = valorisation | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:87) |
| Stocks | label = Valorisation | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:87) |
| Stocks | id =  | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:92) |
| Stocks | label = Tous | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:92) |
| Stocks | key = c | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:100) |
| Stocks | label = Article | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:100) |
| Stocks | key = k | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:101) |
| Stocks | label = Nature | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:101) |
| Stocks | key = q | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:102) |
| Stocks | label = En stock | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:102) |
| Stocks | key = p | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:103) |
| Stocks | label = CUMP | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:103) |
| Stocks | key = v | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:104) |
| Stocks | label = Valeur | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:104) |
| Stocks | key = m | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:105) |
| Stocks | label = Dernier mouvement | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:105) |
| Stocks | key = m | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:129) |
| Stocks | label = Mois | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:129) |
| Stocks | key = a | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:130) |
| Stocks | label = Achats | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:130) |
| Stocks | key = c | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:131) |
| Stocks | label = Consommations | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:131) |
| Stocks | key = p | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:132) |
| Stocks | label = Production | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:132) |
| Stocks | key = j | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:133) |
| Stocks | label = Ajustements | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:133) |
| MovementsTable | key = d | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:147) |
| MovementsTable | label = Date | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:147) |
| MovementsTable | key = i | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:148) |
| MovementsTable | label = Article | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:148) |
| MovementsTable | key = k | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:149) |
| MovementsTable | label = Mouvement | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:149) |
| MovementsTable | key = q | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:150) |
| MovementsTable | label = Quantité | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:150) |
| MovementsTable | key = c | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:151) |
| MovementsTable | label = Coût unitaire | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:151) |
| MovementsTable | key = v | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:152) |
| MovementsTable | label = Valeur | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:152) |
| MovementsTable | key = a | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:153) |
| MovementsTable | label = Stock après | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:153) |
| MovementsTable | key = u | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:154) |
| MovementsTable | label = Par | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:154) |
| Stocks | useCan() | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:56) |
| Stocks | can('stocks', 'export') | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:79) |
| Stocks | can('stocks', 'create') | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:80) |
| Stocks | can('stocks', 'create') | [Stocks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Stocks.tsx:98) |

## SupportDetail.tsx — CRM-068

Source : [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [SupportDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:13).

Dépendances locales : `../lib/hooks`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/SupportMap`, `../components/Documents`, `./Supports`, `./Maintenance`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| SupportDetail | ``/api/supports/${id}`` | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:17) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| SupportDetail | Button | onClick=() => setTicket(true) | Signaler une intervention | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:30) |
| SupportDetail | Button | onClick=() => setEdit(true) | Modifier | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:31) |
| SupportDetail | DataTable | columns=[                 { key: 'f', label: 'Face', render: (x: any) => <strong>{x.face_code}</strong>, width: 60 },                 { key: 'p', label: 'Période', render: (x: any) => <span className="small nowrap">{date(x.start_date)} → {date(x.end_date)}</span> },                 { key: 'c', label: 'Annonceur / campagne', render: (x: any) => <><div className="small">{x.organization_name}</div>{x.campaign_id ? <Link className="xsmall" to={`/campagnes/${x.campaign_id}`}>{x.campaign_ref} — {x.campaign_name}</Link> : x.quote_number && <span className="xsmall muted">Devis {x.quote_number}</span>}</> },                 { key: 's', label: 'Statut', render: (x: any) => <div className="row-wrap"><Status kind="face" code={x.start_date <= today && x.end_date >= today && x.status === 'reserve' ? 'occupe' : x.status} />{x.derogation_reason && <Badge tone="warning">Dérogation</Badge>}</div> },               ] |  | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:42) |
| SupportDetail | Link | to=`/campagnes/${x.campaign_id}` | {x.campaign_ref} — {x.campaign_name} | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:46) |
| SupportDetail | DataTable | columns=[                 { key: 't', label: 'Intervention', render: (x: any) => <><Link to={`/maintenance/${x.id}`} className="cell-title">{x.title}</Link><div className="cell-sub">{x.ref} · {x.kind === 'preventive' ? 'Préventive' : 'Corrective'}</div></> },                 { key: 's', label: 'Statut', render: (x: any) => <Status kind="intervention" code={x.status} /> },                 { key: 'd', label: 'Ouverte', render: (x: any) => date(x.opened_at), mobile: 'hide' },                 { key: 'c', label: 'Coût', num: true, render: (x: any) => money(x.cost) },               ] |  | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:51) |
| SupportDetail | Link | to=`/maintenance/${x.id}` | {x.title} | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:53) |
| SupportDetail | DataTable | columns=[             { key: 'p', label: 'Période', render: (x: any) => `${date(x.period_start)} → ${date(x.period_end)}` },             { key: 'a', label: 'Attendu', num: true, render: (x: any) => money(x.expected_amount) },             { key: 'pa', label: 'Payé', num: true, render: (x: any) => money(x.paid_amount) },             { key: 's', label: 'Statut', render: (x: any) => <Status kind="royalty" code={x.status} /> },           ] |  | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:59) |
| SupportDetail | Documents | entityType=support ; entityId=s.id ; kinds=['photo', 'attestation', 'autre'] |  | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:65) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| SupportDetail | label = Supports publicitaires | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:26) |
| SupportDetail | title = Occupation | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:34) |
| SupportDetail | key = f | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:44) |
| SupportDetail | label = Face | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:44) |
| SupportDetail | key = p | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:45) |
| SupportDetail | label = Période | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:45) |
| SupportDetail | key = c | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:46) |
| SupportDetail | label = Annonceur / campagne | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:46) |
| SupportDetail | key = s | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:47) |
| SupportDetail | label = Statut | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:47) |
| SupportDetail | key = t | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:53) |
| SupportDetail | label = Intervention | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:53) |
| SupportDetail | key = s | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:54) |
| SupportDetail | label = Statut | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:54) |
| SupportDetail | key = d | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:55) |
| SupportDetail | label = Ouverte | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:55) |
| SupportDetail | key = c | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:56) |
| SupportDetail | label = Coût | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:56) |
| SupportDetail | key = p | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:60) |
| SupportDetail | label = Période | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:60) |
| SupportDetail | key = a | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:61) |
| SupportDetail | label = Attendu | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:61) |
| SupportDetail | key = pa | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:62) |
| SupportDetail | label = Payé | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:62) |
| SupportDetail | key = s | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:63) |
| SupportDetail | label = Statut | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:63) |
| SupportDetail | useCan() | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:15) |
| SupportDetail | can('interventions', 'create') | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:30) |
| SupportDetail | can('supports', 'update') | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:31) |
| SupportDetail | can('supports', 'update') | [SupportDetail.tsx](C:/wamp64/www/comsig-crm/web/src/pages/SupportDetail.tsx:65) |

## Supports.tsx — CRM-067

Source : [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [SupportForm (export)](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:12), [set](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:18), [submit](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:20), [Supports (export)](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:56), [set](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:61).

Dépendances locales : `../components/ExportButton`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/SupportMap`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| SupportForm | `api.patch(`/api/supports/${initial.id}`)` | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:19) |
| SupportForm | ``/api/supports/${initial.id}`` | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:19) |
| SupportForm | `api.post('/api/supports')` | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:19) |
| SupportForm | `'/api/supports'` | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:19) |
| Supports | ``/api/supports${qs(params)}`` | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:66) |
| Supports | ``/api/supports${qs({ ...params, format: 'xlsx' })}`` | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:74) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| SupportForm | Modal | title=initial ? `Modifier ${initial.code}` : 'Nouveau support' |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:30) |
| SupportForm | Button | onClick=onClose | Annuler | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:30) |
| SupportForm | Button | onClick=submit | Enregistrer | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:30) |
| SupportForm | Field | label=Code unique ; required=true |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:32) |
| SupportForm | Input | placeholder=ABJ-COC-010 ; value=f.code ; onChange=set('code') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:32) |
| SupportForm | Field | label=Nom ; required=true |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:33) |
| SupportForm | Input | value=f.name ; onChange=set('name') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:33) |
| SupportForm | Field | label=Type ; required=true |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:34) |
| SupportForm | Select | value=f.type ; onChange=set('type') ; options=(lookups.support_type ?? []).map((x) => ({ value: x.code, label: x.label })) |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:34) |
| SupportForm | Field | label=Format |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:35) |
| SupportForm | Input | placeholder=12 × 4 m ; value=f.format ; onChange=set('format') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:35) |
| SupportForm | Field | label=Commune ; required=true |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:36) |
| SupportForm | Select | placeholder=Choisir… ; value=f.commune ; onChange=set('commune') ; options=(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label })) |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:36) |
| SupportForm | Field | label=Axe |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:37) |
| SupportForm | Input | value=f.axis ; onChange=set('axis') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:37) |
| SupportForm | Field | label=Adresse descriptive ; required=true |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:38) |
| SupportForm | Input | value=f.address ; onChange=set('address') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:38) |
| SupportForm | Field | label=Latitude |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:39) |
| SupportForm | Input | placeholder=5.3600 ; value=f.latitude ; onChange=set('latitude') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:39) |
| SupportForm | Field | label=Longitude |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:40) |
| SupportForm | Input | placeholder=-3.9930 ; value=f.longitude ; onChange=set('longitude') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:40) |
| SupportForm | Field | label=Visibilité |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:41) |
| SupportForm | Select | value=f.visibility ; onChange=set('visibility') ; options=['faible', 'moyenne', 'bonne', 'excellente'].map((x) => ({ value: x, label: x })) |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:41) |
| SupportForm | Field | label=État |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:42) |
| SupportForm | Select | value=f.condition ; onChange=set('condition') ; options=[{ value: 'neuf', label: 'Neuf' }, { value: 'bon', label: 'Bon' }, { value: 'use', label: 'Usé' }, { value: 'degrade', label: 'Dégradé' }, { value: 'hors_service', label: 'Hors service' }] |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:42) |
| SupportForm | Field | label=Statut d’exploitation |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:43) |
| SupportForm | Select | value=f.status ; onChange=set('status') ; options=[{ value: 'disponible', label: 'Exploitable' }, { value: 'en_maintenance', label: 'En maintenance' }, { value: 'indisponible', label: 'Indisponible' }, { value: 'retire', label: 'Retiré' }] |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:43) |
| SupportForm | Field | label=Faces |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:44) |
| SupportForm | Input | value=f.faces ; onChange=set('faces') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:44) |
| SupportForm | Field | label=Tarif mensuel / face |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:45) |
| SupportForm | MoneyInput | value=f.monthly_rate === '' ? null : f.monthly_rate ; onChange=set('monthly_rate') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:45) |
| SupportForm | Field | label=Coûts récurrents mensuels |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:46) |
| SupportForm | MoneyInput | value=f.monthly_cost === '' ? null : f.monthly_cost ; onChange=set('monthly_cost') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:46) |
| SupportForm | Field | label=Référence d’autorisation |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:47) |
| SupportForm | Input | value=f.authorization_ref ; onChange=set('authorization_ref') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:47) |
| SupportForm | Field | label=Expiration de l’autorisation |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:48) |
| SupportForm | Input | type=date ; value=f.authorization_expires ; onChange=set('authorization_expires') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:48) |
| SupportForm | label |  | <input type="checkbox" checked={f.illuminated} onChange={set('illuminated')} /> Éclairé | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:49) |
| SupportForm | input | type=checkbox ; onChange=set('illuminated') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:49) |
| SupportForm | Field | label=Contraintes |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:50) |
| SupportForm | Textarea | value=f.constraints ; onChange=set('constraints') |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:50) |
| Supports | Segmented | label=Affichage ; value=view ; onChange=(v) => set({ view: v === 'list' ? '' : v }) ; options=[{ id: 'list', label: 'Liste', icon: <List /> }, { id: 'map', label: 'Carte', icon: <MapIcon /> }] |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:73) |
| Supports | ExcelButton | url=`/api/supports${qs({ ...params, format: 'xlsx' })}` |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:74) |
| Supports | Button | onClick=() => setCreate(true) | Nouveau support | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:75) |
| Supports | Kpi | label=Faces disponibles ; value=counts.disponible ?? 0 ; onClick=() => set({ status: 'disponible' }) |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:78) |
| Supports | Kpi | label=En maintenance / indisponibles ; value=(counts.en_maintenance ?? 0) + (counts.indisponible ?? 0) ; onClick=() => set({ status: 'en_maintenance' }) |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:81) |
| Supports | form | onSubmit=(e) => { e.preventDefault(); set({ q }); } |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:84) |
| Supports | Input | placeholder=Code, nom, adresse, axe… ; value=q ; onChange=(e) => setQ(e.target.value) ; aria-label=Rechercher |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:84) |
| Supports | label |  | Du <Input type="date" value={params.from} onChange={(e) => set({ from: e.target.value, to: params.to < e.target.value ? addDays(e.target.value, 30) : params.to })} style={{ width: 150 }} aria-label="Début de période" /> | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:85) |
| Supports | Input | type=date ; value=params.from ; onChange=(e) => set({ from: e.target.value, to: params.to < e.target.value ? addDays(e.target.value, 30) : params.to }) ; aria-label=Début de période |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:85) |
| Supports | label |  | au <Input type="date" value={params.to} onChange={(e) => set({ to: e.target.value })} style={{ width: 150 }} aria-label="Fin de période" /> | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:86) |
| Supports | Input | type=date ; value=params.to ; onChange=(e) => set({ to: e.target.value }) ; aria-label=Fin de période |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:86) |
| Supports | Select | placeholder=Toutes communes ; value=sp.get('commune') ?? '' ; onChange=(e) => set({ commune: e.target.value }) ; options=(lookups.commune ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Commune |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:87) |
| Supports | Select | placeholder=Tous types ; value=sp.get('type') ?? '' ; onChange=(e) => set({ type: e.target.value }) ; options=(lookups.support_type ?? []).map((x) => ({ value: x.code, label: x.label })) ; aria-label=Type |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:88) |
| Supports | Select | placeholder=Toute disponibilité ; value=sp.get('status') ?? '' ; onChange=(e) => set({ status: e.target.value }) ; options=['disponible', 'pre_reserve', 'reserve', 'occupe', 'en_maintenance', 'indisponible'].map((x) => ({ value: x, label: ({ disponible: 'Disponible', pre_reserve: 'Pré-réservé', reserve: 'Réservé', occupe: 'Occupé', en_maintenance: 'En maintenance', indisponible: 'Indisponible' } as any)[x] })) ; aria-label=Disponibilité |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:89) |
| Supports | Select | placeholder=Toute visibilité ; value=sp.get('visibility') ?? '' ; onChange=(e) => set({ visibility: e.target.value }) ; options=['excellente', 'bonne', 'moyenne', 'faible'].map((x) => ({ value: x, label: x })) ; aria-label=Visibilité |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:90) |
| Supports | DataTable | columns=[               { key: 'c', label: 'Support', render: (s: any) => <><div className="cell-title">{s.code}</div><div className="cell-sub">{s.name}</div></> },               { key: 't', label: 'Type', render: (s: any) => <span className="small">{label('support_type', s.type)}<div className="xsmall muted">{s.format}</div></span>, mobile: 'hide' },               { key: 'l', label: 'Emplacement', render: (s: any) => <span className="small">{label('commune', s.commune)}<div className="xsmall muted">{s.axis}</div></span> },               { key: 'f', label: 'Faces sur la période', render: (s: any) => <div className="row-wrap">{s.faces.map((f: any) => <span key={f.id} className="row" style={{ gap: 4 }}><span className="xsmall strong">{f.code}</span><Status kind="face" code={f.state} /></span>)}</div> },               { key: 'r', label: 'Tarif / mois', num: true, render: (s: any) => money(s.monthly_rate), mobile: 'hide' },               { key: 'i', label: 'Interventions', num: true, render: (s: any) => (s.open_interventions ? <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{s.open_interventions}</span> : '—'), mobile: 'hide' },             ] |  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:99) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| SupportForm | name =  | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:16) |
| SupportForm | label = Neuf | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:42) |
| SupportForm | label = Bon | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:42) |
| SupportForm | label = Usé | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:42) |
| SupportForm | label = Dégradé | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:42) |
| SupportForm | label = Hors service | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:42) |
| SupportForm | label = Exploitable | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:43) |
| SupportForm | label = En maintenance | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:43) |
| SupportForm | label = Indisponible | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:43) |
| SupportForm | label = Retiré | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:43) |
| Supports | id = list | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:73) |
| Supports | label = Liste | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:73) |
| Supports | id = map | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:73) |
| Supports | label = Carte | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:73) |
| Supports | key = c | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:101) |
| Supports | label = Support | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:101) |
| Supports | key = t | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:102) |
| Supports | label = Type | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:102) |
| Supports | key = l | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:103) |
| Supports | label = Emplacement | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:103) |
| Supports | key = f | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:104) |
| Supports | label = Faces sur la période | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:104) |
| Supports | key = r | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:105) |
| Supports | label = Tarif / mois | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:105) |
| Supports | key = i | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:106) |
| Supports | label = Interventions | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:106) |
| SupportForm | useCan() | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:15) |
| submit | can('catalog', 'update') | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:24) |
| SupportForm | can('catalog', 'update') | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:45) |
| Supports | useCan() | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:58) |
| Supports | can('supports', 'export') | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:74) |
| Supports | can('supports', 'create') | [Supports.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Supports.tsx:75) |

## Surveys.tsx — CRM-058, CRM-059

Source : [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Surveys (export)](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:15), [SurveyForm](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:41), [set](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:46), [num](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:47), [SurveyDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:84), [block](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:96).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/format`, `../components/ui`, `../components/ExportButton`, `../components/Documents`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Surveys | ``/api/surveys${qs({ status: status \|\| undefined })}`` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:17) |
| Surveys | ``/api/xlsx/surveys${qs({ status: status \|\| undefined })}`` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:23) |
| SurveyForm | `api.patch(`/api/surveys/${value.id}`)` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:44) |
| SurveyForm | ``/api/surveys/${value.id}`` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:44) |
| SurveyForm | `api.post('/api/surveys')` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:44) |
| SurveyForm | `'/api/surveys'` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:44) |
| SurveyDetail | ``/api/surveys/${id}`` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:87) |
| SurveyDetail | `api.post(`/api/surveys/${id}/status`)` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:91) |
| SurveyDetail | ``/api/surveys/${id}/status`` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:91) |
| SurveyDetail | `api.del(`/api/surveys/${id}`)` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:92) |
| SurveyDetail | ``/api/surveys/${id}`` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:92) |
| SurveyDetail | ``/api/surveys/${id}/pdf`` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:100) |
| SurveyDetail | ``/api/surveys/${id}/docx`` | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:100) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Surveys | ExcelButton | url=`/api/xlsx/surveys${qs({ status: status \|\| undefined })}` |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:23) |
| Surveys | Button | onClick=() => setForm({ ...EMPTY }) | Nouveau repérage | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:23) |
| Surveys | Tabs | value=status ; onChange=setStatus ; tabs=[{ id: '', label: 'Tous' }, { id: 'brouillon', label: 'Brouillons' }, { id: 'soumis', label: 'À valider' }, { id: 'valide', label: 'Validés' }, { id: 'a_reprendre', label: 'À reprendre' }] |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | DataTable | columns=[               { key: 't', label: 'Repérage', render: (s: any) => <><div className="cell-title">{s.title}</div><div className="cell-sub">{s.ref} · {s.address \|\| 'adresse à préciser'}{s.commune ? ` (${s.commune})` : ''}</div></> },               { key: 'd', label: 'Date', render: (s: any) => <span className="small">{date(s.survey_date)}</span> },               { key: 'svc', label: 'Service', render: (s: any) => <span className="small"><span className="dept-dot-inline" style={{ background: s.department_color }} />{s.department_label}<div className="xsmall muted">{s.author_name}</div></span>, mobile: 'hide' },               { key: 'c', label: 'Client', render: (s: any) => <span className="small">{s.organization_name ?? '—'}</span>, mobile: 'hide' },               { key: 'st', label: 'Statut', render: (s: any) => <Badge tone={ST[s.status][1]}>{ST[s.status][0]}</Badge> },             ] |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:26) |
| SurveyForm | Modal | title=value?.id ? `Repérage ${value.ref}` : 'Nouveau rapport de repérage' |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:50) |
| SurveyForm | Button | onClick=onClose | Annuler | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:51) |
| SurveyForm | Button | onClick=() => { const b: any = {}; for (const k of pick) b[k] = f[k]; save.run({ ...b, commune: f.commune \|\| null, latitude: num(f.latitude), longitude: num(f.longitude), measurements: f.measurements.filter((m: any) => m.label.trim()) }); } | Enregistrer | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:51) |
| SurveyForm | Field | label=Intitulé ; required=true |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:53) |
| SurveyForm | Input | placeholder=Ex. Repérage façade agence Cocody ; value=f.title ; onChange=set('title') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:53) |
| SurveyForm | Field | label=Date du repérage ; required=true |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:54) |
| SurveyForm | Input | type=date ; value=String(f.survey_date).slice(0, 10) ; onChange=set('survey_date') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:54) |
| SurveyForm | Field | label=Commune |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:55) |
| SurveyForm | Input | value=f.commune ?? '' ; onChange=set('commune') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:55) |
| SurveyForm | Field | label=Adresse / localisation |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:56) |
| SurveyForm | Input | value=f.address ; onChange=set('address') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:56) |
| SurveyForm | Field | label=Latitude |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:57) |
| SurveyForm | Input | value=f.latitude ?? '' ; onChange=set('latitude') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:57) |
| SurveyForm | Field | label=Longitude |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:58) |
| SurveyForm | Input | value=f.longitude ?? '' ; onChange=set('longitude') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:58) |
| SurveyForm | Field | label=Objet du repérage |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:59) |
| SurveyForm | Textarea | value=f.purpose ; onChange=set('purpose') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:59) |
| SurveyForm | Field | label=Observations |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:60) |
| SurveyForm | Textarea | value=f.observations ; onChange=set('observations') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:60) |
| SurveyForm | Button | onClick=() => setF({ ...f, measurements: [...f.measurements, { label: '', value: '', unit: 'm' }] }) | Ajouter une mesure | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:63) |
| SurveyForm | Input | placeholder=Élément mesuré ; value=m.label ; onChange=(e) => { const x = [...f.measurements]; x[i] = { ...m, label: e.target.value }; setF({ ...f, measurements: x }); } ; aria-label=Élément mesuré |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:66) |
| SurveyForm | Input | placeholder=Valeur ; value=m.value ; onChange=(e) => { const x = [...f.measurements]; x[i] = { ...m, value: e.target.value }; setF({ ...f, measurements: x }); } ; aria-label=Valeur |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:67) |
| SurveyForm | Input | placeholder=Unité ; value=m.unit ; onChange=(e) => { const x = [...f.measurements]; x[i] = { ...m, unit: e.target.value }; setF({ ...f, measurements: x }); } ; aria-label=Unité |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:68) |
| SurveyForm | Button | onClick=() => setF({ ...f, measurements: f.measurements.filter((_: any, j: number) => j !== i) }) ; aria-label=Retirer la mesure |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:69) |
| SurveyForm | Field | label=Contraintes techniques |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:73) |
| SurveyForm | Textarea | value=f.constraints ; onChange=set('constraints') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:73) |
| SurveyForm | Field | label=Conditions d’accès |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:74) |
| SurveyForm | Textarea | value=f.access_conditions ; onChange=set('access_conditions') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:74) |
| SurveyForm | Field | label=Risques identifiés |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:75) |
| SurveyForm | Textarea | value=f.risks ; onChange=set('risks') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:75) |
| SurveyForm | Field | label=Recommandations |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:76) |
| SurveyForm | Textarea | value=f.recommendations ; onChange=set('recommendations') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:76) |
| SurveyForm | Field | label=Participants |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:77) |
| SurveyForm | Input | value=f.attendees ; onChange=set('attendees') |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:77) |
| SurveyDetail | DocButton | url=`/api/surveys/${id}/pdf` |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:100) |
| SurveyDetail | DocButton | url=`/api/surveys/${id}/docx` |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:100) |
| SurveyDetail | Button | onClick=() => setEdit(s) | Modifier | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:101) |
| SurveyDetail | Button | onClick=() => st.run({ action: 'soumettre' }) | Soumettre | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:102) |
| SurveyDetail | Button | onClick=() => setReview('valider') | Valider | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:103) |
| SurveyDetail | Button | onClick=() => setReview('a_reprendre') | À reprendre | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:104) |
| SurveyDetail | Button | onClick=() => del.run(undefined) | Supprimer | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:105) |
| SurveyDetail | a | href=`https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=18/${s.latitude}/${s.longitude}` | {s.latitude} , {s.longitude} | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:108) |
| SurveyDetail | Documents | entityType=site_survey ; entityId=s.id ; kinds=['photo', 'plan', 'autre'] |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:113) |
| SurveyDetail | Modal | title=review === 'valider' ? 'Valider le rapport' : 'Demander une reprise' |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:115) |
| SurveyDetail | Button | onClick=() => setReview(null) | Annuler | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:116) |
| SurveyDetail | Button | onClick=() => st.run({ action: review, note }) | Confirmer | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:116) |
| SurveyDetail | Field | label=review === 'valider' ? 'Commentaire (facultatif)' : 'Ce qui doit être repris (obligatoire)' |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:117) |
| SurveyDetail | Textarea | value=note ; onChange=(e) => setNote(e.target.value) |  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:117) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| (partagé / module) | title =  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:13) |
| Surveys | id =  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | label = Tous | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | id = brouillon | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | label = Brouillons | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | id = soumis | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | label = À valider | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | id = valide | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | label = Validés | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | id = a_reprendre | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | label = À reprendre | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:24) |
| Surveys | key = t | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:28) |
| Surveys | label = Repérage | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:28) |
| Surveys | key = d | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:29) |
| Surveys | label = Date | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:29) |
| Surveys | key = svc | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:30) |
| Surveys | label = Service | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:30) |
| Surveys | key = c | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:31) |
| Surveys | label = Client | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:31) |
| Surveys | key = st | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:32) |
| Surveys | label = Statut | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:32) |
| SurveyForm | label =  | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:63) |
| SurveyDetail | label = Rapports de repérage | [Surveys.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Surveys.tsx:99) |

## Tasks.tsx — CRM-071

Source : [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Tasks (export)](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:21), [setTab](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:25), [useTasks](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:55), [TaskCard](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:59), [KanbanView](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:71), [ListView](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:97), [MatrixView](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:117), [RisksView](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:141), [level](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:153), [TimeView](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:205), [FlowView](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:230).

Dépendances locales : `../components/ExportButton`, `../components/Priority`, `../components/ProcessFlow`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/work`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Tasks | `'/api/xlsx/risks'` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:34) |
| Tasks | ``/api/xlsx/time-report`` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:34) |
| Tasks | ``/api/xlsx/tasks${view !== 'service' ? `?view=${view}` : ''}`` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:34) |
| useTasks | ``/api/tasks?${view !== 'service' ? `view=${view}&` : ''}${extra}`` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:56) |
| KanbanView | `api.put(`/api/tasks/${b.id}`)` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:75) |
| KanbanView | ``/api/tasks/${b.id}`` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:75) |
| MatrixView | ``/api/matrices/eisenhower${view === 'mine' ? '?view=mine' : ''}`` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:118) |
| MatrixView | `api.put(`/api/tasks/${b.id}`)` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:119) |
| MatrixView | ``/api/tasks/${b.id}`` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:119) |
| RisksView | `'/api/risks'` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:143) |
| RisksView | `api.put(`/api/risks/${edit.id}`)` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:146) |
| RisksView | ``/api/risks/${edit.id}`` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:146) |
| RisksView | `api.post('/api/risks')` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:146) |
| RisksView | `'/api/risks'` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:146) |
| TimeView | ``/api/time/report?from=${from}&to=${to}`` | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:208) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Tasks | Segmented | label=Périmètre ; value=view ; onChange=(v) => setSp({ vue: tab, qui: v }) ; options=[{ id: 'mine', label: 'Mes tâches' }, { id: 'service', label: 'Mon service' }, { id: 'delegated', label: 'Confiées' }] |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:33) |
| Tasks | ExcelButton | url=tab === 'risques' ? '/api/xlsx/risks' : tab === 'temps' ? `/api/xlsx/time-report` : `/api/xlsx/tasks${view !== 'service' ? `?view=${view}` : ''}` |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:34) |
| Tasks | Button | onClick=() => setCreating(true) | Nouvelle tâche | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:35) |
| Tasks | Tabs | value=tab ; onChange=setTab ; tabs=[         { id: 'kanban', label: <><Columns3 aria-hidden /> Kanban</> }, { id: 'liste', label: <><List aria-hidden /> Liste</> }, { id: 'frise', label: <><GitCommitHorizontal aria-hidden /> Planification</> },         { id: 'matrice', label: <><Grid2x2 aria-hidden /> Matrice des priorités</> }, { id: 'risques', label: <><ShieldAlert aria-hidden /> Matrice des risques</> },         { id: 'temps', label: <><Timer aria-hidden /> Gestion du temps</> },       ] |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:37) |
| TaskCard | article | onClick=() => onOpen(t) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:61) |
| ListView | Select | value=status ; onChange=(e) => setStatus(e.target.value) ; options=[{ value: 'ouvertes', label: 'Ouvertes' }, { value: '', label: 'Toutes' }, ...COLS.map((c) => ({ value: c.code, label: c.label })), { value: 'annule', label: 'Annulées' }] ; aria-label=Statut |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:102) |
| ListView | DataTable | columns=[           { key: 't', label: 'Tâche', render: (t: any) => <><div className="cell-title">{t.title}</div><div className="cell-sub">{t.ref}{t.project_name ? ` · ${t.project_name}` : ''}</div></> },           { key: 'o', label: 'Personne', render: (t: any) => <span className="small">{t.owner_name}</span>, mobile: 'hide' },           { key: 'p', label: 'Niveau', render: (t: any) => <PriorityBadge level={t.priority_level} legacy={t.priority} /> },           { key: 'q', label: 'Eisenhower', mobile: 'hide', render: (t: any) => { const q = QUADRANT[t.urgent && t.important ? 'faire' : t.important ? 'planifier' : t.urgent ? 'deleguer' : 'eliminer']; return <Badge tone={q.tone}>{q.label}</Badge>; } },           { key: 'd', label: 'Échéance', render: (t: any) => <span className={`small${t.is_late ? ' text-danger strong' : ''}`}>{date(t.due_date)}{t.is_late ? ' · en retard' : ''}</span> },           { key: 'tm', label: 'Temps', render: (t: any) => <span className="small">{minutes(t.spent_minutes)}{t.estimated_minutes ? ` / ${minutes(t.estimated_minutes)}` : ''}</span>, mobile: 'hide' },           { key: 's', label: 'Statut', render: (t: any) => <Status kind="task" code={t.status} /> },         ] |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:103) |
| RisksView | Button | onClick=() => setEdit({ title: '', description: '', category: 'operationnel', probability: 3, impact: 3, owner_id: '', mitigation: '', status: 'identifie', review_date: addDays(today(), 30) }) | Nouveau risque | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:158) |
| RisksView | button | title=x.title ; onClick=() => setEdit({ ...x }) | {x.ref.replace('RSK-', '')} | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:167) |
| RisksView | DataTable | columns=[               { key: 't', label: 'Risque', render: (x: any) => <><div className="cell-title">{x.title}</div><div className="cell-sub">{x.ref} · {RISK_CATEGORY[x.category]}{x.department_label ? ` · ${x.department_label}` : ''}</div></> },               { key: 's', label: 'Score', render: (x: any) => <Badge tone={x.score >= 15 ? 'danger' : x.score >= 8 ? 'warning' : 'info'}>{x.score}</Badge> },               { key: 'r', label: 'Revue', render: (x: any) => <span className={`small${x.review_late ? ' text-danger strong' : ''}`}>{date(x.review_date)}</span>, mobile: 'hide' },               { key: 'st', label: 'Statut', render: (x: any) => <Status kind="risk" code={x.status} /> },             ] |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:177) |
| RisksView | Modal | title=edit?.id ? `Risque ${edit.ref}` : 'Nouveau risque' |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:186) |
| RisksView | Button | onClick=() => setEdit(null) | Annuler | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:187) |
| RisksView | Button | onClick=() => save.run({ title: edit.title, description: edit.description ?? '', category: edit.category, probability: Number(edit.probability), impact: Number(edit.impact), owner_id: edit.owner_id \|\| null, mitigation: edit.mitigation ?? '', status: edit.status, review_date: edit.review_date \|\| null }) | Enregistrer | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:187) |
| RisksView | Field | label=Intitulé ; required=true |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:190) |
| RisksView | Input | value=edit.title ; onChange=(e) => setEdit({ ...edit, title: e.target.value }) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:190) |
| RisksView | Field | label=Catégorie |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:191) |
| RisksView | Select | value=edit.category ; onChange=(e) => setEdit({ ...edit, category: e.target.value }) ; options=Object.entries(RISK_CATEGORY).map(([value, label]) => ({ value, label })) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:191) |
| RisksView | Field | label=Responsable |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:192) |
| RisksView | Select | placeholder=— ; value=edit.owner_id ?? '' ; onChange=(e) => setEdit({ ...edit, owner_id: e.target.value }) ; options=users.map((u) => ({ value: u.id, label: u.full_name })) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:192) |
| RisksView | Field | label=Probabilité (1 = rare, 5 = quasi certaine) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:193) |
| RisksView | Select | value=String(edit.probability) ; onChange=(e) => setEdit({ ...edit, probability: e.target.value }) ; options=[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) })) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:193) |
| RisksView | Field | label=Impact (1 = mineur, 5 = majeur) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:194) |
| RisksView | Select | value=String(edit.impact) ; onChange=(e) => setEdit({ ...edit, impact: e.target.value }) ; options=[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) })) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:194) |
| RisksView | Field | label=Statut |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:195) |
| RisksView | Select | value=edit.status ; onChange=(e) => setEdit({ ...edit, status: e.target.value }) ; options=Object.keys({ identifie: 1, en_traitement: 1, maitrise: 1, clos: 1 }).map((c) => ({ value: c, label: statusOf('risk', c)[0] })) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:195) |
| RisksView | Field | label=Prochaine revue |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:196) |
| RisksView | Input | type=date ; value=edit.review_date ?? '' ; onChange=(e) => setEdit({ ...edit, review_date: e.target.value }) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:196) |
| RisksView | Field | label=Plan de traitement ; required=Number(edit.probability) * Number(edit.impact) >= 15 |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:197) |
| RisksView | Textarea | value=edit.mitigation ?? '' ; onChange=(e) => setEdit({ ...edit, mitigation: e.target.value }) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:197) |
| RisksView | Field | label=Description |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:198) |
| RisksView | Textarea | value=edit.description ?? '' ; onChange=(e) => setEdit({ ...edit, description: e.target.value }) |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:198) |
| TimeView | Input | type=date ; value=from ; onChange=(e) => setFrom(e.target.value) ; aria-label=Du |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:211) |
| TimeView | Input | type=date ; value=to ; onChange=(e) => setTo(e.target.value) ; aria-label=Au |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:211) |
| TimeView | DataTable | columns=[           { key: 'n', label: 'Personne', render: (x: any) => <span className="strong">{x.full_name}</span> },           { key: 'm', label: 'Temps saisi', num: true, render: (x: any) => minutes(x.minutes) },           { key: 'l', label: 'Charge', render: (x: any) => <div className="hbar-track" title={`${x.load_pct ?? 0} %`}><span className="hbar-fill" style={{ width: `${Math.min(100, x.load_pct ?? 0)}%` }} /></div> },           { key: 'q', label: 'Répartition', render: (x: any) => {             const parts: [string, number, string][] = [['faire', x.q_faire ?? 0, 'Urgent et important'], ['planifier', x.q_planifier ?? 0, 'Important'], ['deleguer', x.q_deleguer ?? 0, 'Urgent'], ['eliminer', x.q_eliminer ?? 0, 'Ni l’un ni l’autre'], ['ot', x.ordres_travail ?? 0, 'Ordres de travail']];             const tot = parts.reduce((s, p) => s + p[1], 0) \|\| 1;             return <div className="stacked-bar" role="img" aria-label={parts.map((p) => `${p[2]} ${Math.round((p[1] / tot) * 100)} %`).join(', ')}>{parts.filter((p) => p[1]).map((p) => <span key={p[0]} className={`seg-${p[0]}`} style={{ width: `${(p[1] / tot) * 100}%` }} title={`${p[2]} : ${minutes(p[1])}`} />)}</div>;           } },         ] |  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:213) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| (partagé / module) | label = À faire | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:17) |
| (partagé / module) | label = En cours | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:17) |
| (partagé / module) | label = En attente | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:17) |
| (partagé / module) | label = Terminé | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:17) |
| Tasks | id = mine | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:33) |
| Tasks | label = Mes tâches | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:33) |
| Tasks | id = service | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:33) |
| Tasks | label = Mon service | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:33) |
| Tasks | id = delegated | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:33) |
| Tasks | label = Confiées | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:33) |
| Tasks | id = kanban | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:38) |
| Tasks | id = liste | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:38) |
| Tasks | id = frise | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:38) |
| Tasks | id = matrice | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:39) |
| Tasks | id = risques | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:39) |
| Tasks | id = temps | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:40) |
| ListView | label = Ouvertes | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:102) |
| ListView | label = Toutes | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:102) |
| ListView | label = Annulées | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:102) |
| ListView | key = t | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:105) |
| ListView | label = Tâche | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:105) |
| ListView | key = o | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:106) |
| ListView | label = Personne | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:106) |
| ListView | key = p | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:107) |
| ListView | label = Niveau | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:107) |
| ListView | key = q | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:108) |
| ListView | label = Eisenhower | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:108) |
| ListView | key = d | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:109) |
| ListView | label = Échéance | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:109) |
| ListView | key = tm | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:110) |
| ListView | label = Temps | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:110) |
| ListView | key = s | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:111) |
| ListView | label = Statut | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:111) |
| RisksView | title =  | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:158) |
| RisksView | key = t | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:179) |
| RisksView | label = Risque | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:179) |
| RisksView | key = s | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:180) |
| RisksView | label = Score | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:180) |
| RisksView | key = r | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:181) |
| RisksView | label = Revue | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:181) |
| RisksView | key = st | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:182) |
| RisksView | label = Statut | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:182) |
| TimeView | key = n | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:215) |
| TimeView | label = Personne | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:215) |
| TimeView | key = m | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:216) |
| TimeView | label = Temps saisi | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:216) |
| TimeView | key = l | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:217) |
| TimeView | label = Charge | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:217) |
| TimeView | key = q | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:218) |
| TimeView | label = Répartition | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:218) |
| Tasks | useCan() | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:26) |
| Tasks | can('tasks', 'create') | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:35) |
| KanbanView | useCan() | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:72) |
| KanbanView | can('tasks', 'update') | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:88) |
| RisksView | useCan() | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:142) |
| RisksView | can('tasks', 'create') | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:158) |
| RisksView | can('tasks', 'update') | [Tasks.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tasks.tsx:177) |

## TeamAccess.tsx — CRM-033

Source : [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [TeamAccess (export)](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:9).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| TeamAccess | `'/api/team/accesses'` | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:10) |
| TeamAccess | `api.post('/api/team/accesses')` | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:13) |
| TeamAccess | `'/api/team/accesses'` | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:13) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| TeamAccess | Button | onClick=() => setForm({ full_name: '', email: '', username: '', job_title: '', role_code: d.roles[0]?.code ?? '', department_code: d.departments[0]?.code ?? '' }) | Créer un accès | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:21) |
| TeamAccess | DataTable | columns=[             { key: 'n', label: 'Collaborateur', render: (u: any) => <><div className="cell-title">{u.full_name} {!u.is_active && <Badge>Désactivé</Badge>}</div><div className="cell-sub"><code>{u.username}</code>{u.job_title ? ` · ${u.job_title}` : ''}</div></> },             { key: 'r', label: 'Rôle', render: (u: any) => <span className="small">{u.role_label}<div className="xsmall muted">{u.department_label}</div></span> },             { key: 'c', label: 'Accès', render: (u: any) => <span className="small">{u.created_via === 'responsable' ? `Créé par un responsable le ${date(u.created_at)}` : 'Créé par l’administration'}</span>, mobile: 'hide' },             { key: 'l', label: 'Connexion', render: (u: any) => u.must_change_password ? <Badge tone="info">Première connexion à venir</Badge> : <span className="small">{u.last_login_at ? relative(u.last_login_at) : 'Jamais'}</span> },           ] |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:24) |
| TeamAccess | Modal | title=Créer un accès |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:32) |
| TeamAccess | Button | onClick=() => setForm(null) | Annuler | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:33) |
| TeamAccess | Button | onClick=() => save.run({ ...form, username: form.username \|\| undefined }) | Créer l’accès | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:33) |
| TeamAccess | Field | label=Nom complet ; required=true |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:35) |
| TeamAccess | Input | value=form.full_name ; onChange=(e) => setForm({ ...form, full_name: e.target.value }) |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:35) |
| TeamAccess | Field | label=E-mail professionnel ; required=true |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:36) |
| TeamAccess | Input | type=email ; value=form.email ; onChange=(e) => setForm({ ...form, email: e.target.value }) |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:36) |
| TeamAccess | Field | label=Identifiant |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:37) |
| TeamAccess | Input | value=form.username ; onChange=(e) => setForm({ ...form, username: e.target.value.toLowerCase() }) |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:37) |
| TeamAccess | Field | label=Fonction |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:38) |
| TeamAccess | Input | value=form.job_title ; onChange=(e) => setForm({ ...form, job_title: e.target.value }) |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:38) |
| TeamAccess | Field | label=Rôle ; required=true |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:39) |
| TeamAccess | Select | value=form.role_code ; onChange=(e) => setForm({ ...form, role_code: e.target.value }) ; options=d.roles.map((x: any) => ({ value: x.code, label: x.label })) |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:39) |
| TeamAccess | Field | label=Service ; required=true |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:40) |
| TeamAccess | Select | value=form.department_code ; onChange=(e) => setForm({ ...form, department_code: e.target.value }) ; options=d.departments.map((x: any) => ({ value: x.code, label: x.label })) |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:40) |
| TeamAccess | Modal | title=Accès créé |  | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:44) |
| TeamAccess | Button | onClick=() => setTemp(null) | J’ai transmis les informations | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:44) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| TeamAccess | key = n | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:25) |
| TeamAccess | label = Collaborateur | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:25) |
| TeamAccess | key = r | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:26) |
| TeamAccess | label = Rôle | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:26) |
| TeamAccess | key = c | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:27) |
| TeamAccess | label = Accès | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:27) |
| TeamAccess | key = l | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:28) |
| TeamAccess | label = Connexion | [TeamAccess.tsx](C:/wamp64/www/comsig-crm/web/src/pages/TeamAccess.tsx:28) |

## Tenders.tsx — CRM-005

Source : [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Tenders (export)](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:12), [set](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:20), [submit](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:21).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../components/ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Tenders | `'/api/tenders'` | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:15) |
| Tenders | ``/api/organizations?pageSize=30&q=${encodeURIComponent(orgQ)}`` | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:18) |
| Tenders | `api.put(`/api/tenders/${edit.id}`)` | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:19) |
| Tenders | ``/api/tenders/${edit.id}`` | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:19) |
| Tenders | `api.post('/api/tenders')` | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:19) |
| Tenders | `'/api/tenders'` | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:19) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Tenders | Button | onClick=() => setEdit({ ...EMPTY }) | Nouvel appel d’offres | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:29) |
| Tenders | DataTable | columns=[             { key: 't', label: 'Appel d’offres', render: (t: any) => <><div className="cell-title">{t.title}</div><div className="cell-sub">{t.ref}{t.organization_name ? ` · ${t.organization_name}` : ''}</div></> },             { key: 'd', label: 'Date limite', render: (t: any) => <><div className="small">{date(t.deadline)}</div>{t.is_late ? <Badge tone="danger">Dépassée</Badge> : <span className="xsmall muted">{relative(t.deadline)}</span>}</> },             { key: 's', label: 'Statut', render: (t: any) => <Status kind="tender" code={t.status} /> },             { key: 'v', label: 'Valeur estimée', num: true, render: (t: any) => money(t.estimated_value), mobile: 'hide' },             { key: 'o', label: 'Responsable', render: (t: any) => <span className="small">{t.owner_name}</span>, mobile: 'hide' },           ] |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:31) |
| Tenders | Modal | title=edit?.id ? 'Modifier l’appel d’offres' : 'Nouvel appel d’offres' |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:41) |
| Tenders | Button | onClick=() => setEdit(null) | Annuler | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:42) |
| Tenders | Button | onClick=submit | Enregistrer | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:42) |
| Tenders | Field | label=Référence ; required=true |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:44) |
| Tenders | Input | value=edit.ref ; onChange=set('ref') |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:44) |
| Tenders | Field | label=Date limite de dépôt ; required=true |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:45) |
| Tenders | Input | type=datetime-local ; value=edit.deadline ; onChange=set('deadline') |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:45) |
| Tenders | Field | label=Intitulé ; required=true |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:46) |
| Tenders | Input | value=edit.title ; onChange=set('title') |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:46) |
| Tenders | Field | label=Acheteur |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:47) |
| Tenders | Input | placeholder=Rechercher… ; value=orgQ ; onChange=(e) => setOrgQ(e.target.value) ; aria-label=Rechercher |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:47) |
| Tenders | Select | placeholder=— ; value=edit.organization_id ?? '' ; onChange=set('organization_id') ; options=(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: o.legal_name })) |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:47) |
| Tenders | Field | label=Source |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:48) |
| Tenders | Input | value=edit.source ?? '' ; onChange=set('source') |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:48) |
| Tenders | Field | label=Valeur estimée |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:49) |
| Tenders | MoneyInput | value=edit.estimated_value ; onChange=set('estimated_value') |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:49) |
| Tenders | Field | label=Responsable |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:50) |
| Tenders | Select | placeholder=Moi ; value=edit.owner_id ?? '' ; onChange=set('owner_id') ; options=users.map((u) => ({ value: u.id, label: u.full_name })) |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:50) |
| Tenders | Field | label=Statut |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:51) |
| Tenders | Select | value=edit.status ; onChange=set('status') ; options=[{ value: 'veille', label: 'Veille' }, { value: 'en_preparation', label: 'En préparation' }, { value: 'soumis', label: 'Soumis' }, { value: 'gagne', label: 'Gagné' }, { value: 'perdu', label: 'Perdu' }, { value: 'non_soumis', label: 'Non soumis' }] |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:51) |
| Tenders | Field | label=Critères d’attribution |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:52) |
| Tenders | Textarea | value=edit.criteria ?? '' ; onChange=set('criteria') |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:52) |
| Tenders | Field | label=Pièces à produire |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:53) |
| Tenders | Textarea | value=edit.required_documents ?? '' ; onChange=set('required_documents') |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:53) |
| Tenders | Field | label=Décision / motif de non-soumission ; required=edit.status === 'non_soumis' |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:54) |
| Tenders | Textarea | value=edit.decision_reason ?? '' ; onChange=set('decision_reason') |  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:54) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| (partagé / module) | title =  | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:9) |
| Tenders | key = t | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:34) |
| Tenders | label = Appel d’offres | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:34) |
| Tenders | key = d | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:35) |
| Tenders | label = Date limite | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:35) |
| Tenders | key = s | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:36) |
| Tenders | label = Statut | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:36) |
| Tenders | key = v | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:37) |
| Tenders | label = Valeur estimée | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:37) |
| Tenders | key = o | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:38) |
| Tenders | label = Responsable | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:38) |
| Tenders | label = Veille | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:51) |
| Tenders | label = En préparation | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:51) |
| Tenders | label = Soumis | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:51) |
| Tenders | label = Gagné | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:51) |
| Tenders | label = Perdu | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:51) |
| Tenders | label = Non soumis | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:51) |
| Tenders | useCan() | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:13) |
| Tenders | can('contracts', 'create') | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:29) |
| Tenders | can('contracts', 'update') | [Tenders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Tenders.tsx:31) |

## Todo.tsx — CRM-072

Source : [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [toIso](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:13), [toLocal](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:14), [Todo (export)](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:16), [TodoList](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:29), [Checklists](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:97), [Templates](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:129).

Dépendances locales : `../lib/hooks`, `../lib/api`, `../lib/format`, `../components/ui`, `../components/Checklist`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| TodoList | ``/api/todos${qs({ status })}`` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:31) |
| TodoList | `api.post('/api/todos')` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:34) |
| TodoList | `'/api/todos'` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:34) |
| TodoList | `api.patch(`/api/todos/${v.id}`)` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:35) |
| TodoList | ``/api/todos/${v.id}`` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:35) |
| TodoList | `api.del(`/api/todos/${id}`)` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:36) |
| TodoList | ``/api/todos/${id}`` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:36) |
| Checklists | `'/api/checklists'` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:98) |
| Checklists | `api.del(`/api/checklists/${id}`)` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:101) |
| Checklists | ``/api/checklists/${id}`` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:101) |
| Templates | `'/api/checklists?templates=true'` | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:130) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Todo | Tabs | value=tab ; onChange=setTab ; tabs=[{ id: 'todo', label: 'Ma to-do list' }, { id: 'checklists', label: 'Mes checklists' }, { id: 'modeles', label: 'Modèles' }] |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:21) |
| TodoList | Button | onClick=onShowSuivi | Voir la checklist de suivi | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:49) |
| TodoList | Input | placeholder=Ajouter une chose à faire… ; value=quick.title ; onChange=(e) => setQuick({ ...quick, title: e.target.value }) ; aria-label=Nouvelle chose à faire |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:54) |
| TodoList | Select | value=quick.priority ; onChange=(e) => setQuick({ ...quick, priority: e.target.value }) ; options=[{ value: 'haute', label: 'Haute' }, { value: 'normale', label: 'Normale' }, { value: 'basse', label: 'Basse' }] ; aria-label=Priorité |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:56) |
| TodoList | label |  | <Bell size={14} /> <input type="datetime-local" aria-label="Me le rappeler le" value={quick.remind_at} onChange={(e) => setQuick({ ...quick, remind_at: e.target.value })} /> | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:57) |
| TodoList | input | type=datetime-local ; value=quick.remind_at ; onChange=(e) => setQuick({ ...quick, remind_at: e.target.value }) ; aria-label=Me le rappeler le |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:57) |
| TodoList | Button | onClick=() => add.run({ title: quick.title, priority: quick.priority, remind_at: toIso(quick.remind_at) }) | Ajouter | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:58) |
| TodoList | Tabs | value=status ; onChange=setStatus ; tabs=[{ id: 'ouvertes', label: 'À faire' }, { id: 'faites', label: 'Fait' }] |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:61) |
| TodoList | input | type=checkbox ; onChange=(e) => upd.run({ id: t.id, body: { done: e.target.checked } }) ; aria-label=`Marquer « ${t.title} » comme ${t.done_at ? 'à faire' : 'fait'}` |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:66) |
| TodoList | button | onClick=() => setEdit({ ...t, due_local: toLocal(t.due_at), remind_local: toLocal(t.remind_at) }) | <span className="todo-title">{t.title}</span> <span className="row-wrap xsmall muted"> <Badge tone={PRIO[t.priority][0]}>{PRIO[t.priority][1]}</Badge> {t.due_at && <span className={t.is_late ? 'text-danger' : ''}><CalendarClock size={12} /> {t.is_late ? 'En retard — ' : ''}{dateTime(t.due_at)}</span>} {t.remind_at && <span><Bell size={12} /> {t.reminded_at ? `rappelé ${relative(t.reminded_at)}` : `rappel ${dateTime(t.remind_at)}`}</span>} {t.task_ref && <span>Tâche {t.task_ref}</span>} {t.done_at && <span>Fait {relative(t.done_at)}</span>} </span> | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:67) |
| TodoList | Button | onClick=() => del.run(t.id) ; aria-label=`Supprimer « ${t.title} »` |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:77) |
| TodoList | Modal | title=Chose à faire |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:83) |
| TodoList | Button | onClick=() => setEdit(null) | Annuler | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:84) |
| TodoList | Button | onClick=() => upd.run({ id: edit.id, body: { title: edit.title, notes: edit.notes, priority: edit.priority, due_at: toIso(edit.due_local), remind_at: toIso(edit.remind_local) } }) | Enregistrer | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:84) |
| TodoList | Field | label=Intitulé ; required=true |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:86) |
| TodoList | Input | value=edit.title ; onChange=(e) => setEdit({ ...edit, title: e.target.value }) |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:86) |
| TodoList | Field | label=Priorité |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:87) |
| TodoList | Select | value=edit.priority ; onChange=(e) => setEdit({ ...edit, priority: e.target.value }) ; options=[{ value: 'haute', label: 'Haute' }, { value: 'normale', label: 'Normale' }, { value: 'basse', label: 'Basse' }] |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:87) |
| TodoList | Field | label=Échéance |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:88) |
| TodoList | Input | type=datetime-local ; value=edit.due_local ; onChange=(e) => setEdit({ ...edit, due_local: e.target.value }) |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:88) |
| TodoList | Field | label=Me le rappeler le |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:89) |
| TodoList | Input | type=datetime-local ; value=edit.remind_local ; onChange=(e) => setEdit({ ...edit, remind_local: e.target.value }) |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:89) |
| TodoList | Field | label=Notes |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:90) |
| TodoList | Textarea | value=edit.notes ; onChange=(e) => setEdit({ ...edit, notes: e.target.value }) |  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:90) |
| Checklists | Button | onClick=() => setOpen(true) | Nouvelle checklist | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:106) |
| Checklists | button | onClick=() => setSel(c.id) | <span className="todo-title">{c.title}</span> <span className="row-wrap xsmall muted">{c.kind === 'suivi_todo' && <Badge tone="info">Automatique · to-do list</Badge>}<Progress done={c.done_n} total={c.items_n} />{c.completed_at ? <Badge tone="success">Terminée</Badge> : c.required_open ? <Badge tone="warning">{c.required_open} {c.kind === 'suivi_todo' ? 'à faire' : 'obligatoire(s) restant(s)'}</Badge> : null}{c.task_ref && <span>Tâche {c.task_ref}</span>}{c.due_date && <span>Pour le {c.due_date}</span>}</span> | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:111) |
| Checklists | Button | onClick=() => del.run(current.id) | Supprimer | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:121) |
| Templates | Button | onClick=() => setUse(true) | Utiliser un modèle | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:137) |
| Templates | Button | onClick=() => setOpen(true) | Nouveau modèle | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:137) |
| Templates | button | onClick=() => setSel(c.id) | <span className="todo-title">{c.title}</span> <span className="xsmall muted">{c.items_n} point(s) · {c.owner_name}{c.department_code ? ' · partagé avec le service' : ''}</span> | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:142) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Todo | id = todo | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:21) |
| Todo | label = Ma to-do list | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:21) |
| Todo | id = checklists | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:21) |
| Todo | label = Mes checklists | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:21) |
| Todo | id = modeles | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:21) |
| Todo | label = Modèles | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:21) |
| TodoList | title =  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:32) |
| TodoList | title =  | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:34) |
| TodoList | label = Haute | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:56) |
| TodoList | label = Normale | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:56) |
| TodoList | label = Basse | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:56) |
| TodoList | id = ouvertes | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:61) |
| TodoList | label = À faire | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:61) |
| TodoList | id = faites | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:61) |
| TodoList | label = Fait | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:61) |
| TodoList | label = Haute | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:87) |
| TodoList | label = Normale | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:87) |
| TodoList | label = Basse | [Todo.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Todo.tsx:87) |

## WorkOrders.tsx — CRM-037, CRM-038

Source : [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [WorkOrders (export)](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:15), [WorkOrderDetail (export)](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:72).

Dépendances locales : `../components/ExportButton`, `../components/Priority`, `../lib/hooks`, `../lib/api`, `../lib/auth`, `../lib/format`, `../lib/labels`, `../components/ui`, `../components/work`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| WorkOrders | `'/api/workorders/kinds'` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:24) |
| WorkOrders | `'/api/workorders?requests=1'` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:26) |
| WorkOrders | `'/api/workorders?mine=1&open=1'` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:26) |
| WorkOrders | ``/api/workorders?open=${sp.get('tous') ? '' : '1'}${service ? `&department=${service}` : ''}`` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:26) |
| WorkOrders | ``/api/workorders/stats?department=${service}`` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:28) |
| WorkOrders | `'/api/workorders'` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:32) |
| WorkOrders | `'/api/xlsx/workorders'` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:32) |
| WorkOrderDetail | ``/api/workorders/${id}`` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:75) |
| WorkOrderDetail | `'/api/workorders/kinds'` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:76) |
| WorkOrderDetail | `'/api/assignable-users'` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:77) |
| WorkOrderDetail | `api.post(`/api/workorders/${id}/status`)` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:83) |
| WorkOrderDetail | ``/api/workorders/${id}/status`` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:83) |
| WorkOrderDetail | `api.put(`/api/workorders/${id}`)` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:84) |
| WorkOrderDetail | ``/api/workorders/${id}`` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:84) |
| WorkOrderDetail | `api.post(`/api/workorders/${id}/comment`)` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:85) |
| WorkOrderDetail | ``/api/workorders/${id}/comment`` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:85) |
| WorkOrderDetail | `api.post(`/api/workorders/${id}/time`)` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:86) |
| WorkOrderDetail | ``/api/workorders/${id}/time`` | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:86) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| WorkOrders | ExcelButton | url=url.replace('/api/workorders', '/api/xlsx/workorders') |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:32) |
| WorkOrders | Button | onClick=() => setCreating(true) | Nouvelle demande | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:32) |
| WorkOrders | Segmented | label=Vue ; value=tab ; onChange=(v) => setSp({ vue: v, ...(service ? { service } : {}) }) ; options=[           ...(executes \|\| me?.cross_department ? [{ id: 'file', label: 'File du service' }] : []), { id: 'moi', label: 'Qui me sont affectés' }, { id: 'demandes', label: 'Mes demandes' },         ] |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:34) |
| WorkOrders | Select | placeholder=Tous les services ; value=service ; onChange=(e) => setSp({ vue: 'file', service: e.target.value }) ; options=deps.filter((d) => kinds.data?.kinds[d.code]).map((d) => ({ value: d.code, label: d.label })) ; aria-label=Service |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:37) |
| WorkOrders | label |  | <input type="checkbox" checked={!!sp.get('tous')} onChange={(e) => setSp({ vue: 'file', ...(service ? { service } : {}), ...(e.target.checked ? { tous: '1' } : {}) })} /> Inclure les ordres clôturés | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:38) |
| WorkOrders | input | type=checkbox ; onChange=(e) => setSp({ vue: 'file', ...(service ? { service } : {}), ...(e.target.checked ? { tous: '1' } : {}) }) |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:38) |
| WorkOrders | DataTable | columns=[               { key: 't', label: 'Ordre', render: (w: any) => <><div className="cell-title">{w.title}</div><div className="cell-sub">{w.ref} · {kinds.data?.kinds[w.department_code]?.[w.kind] ?? w.kind}{w.quantity ? ` · ${w.quantity} ${w.unit}` : ''}</div></> },               { key: 'd', label: 'Service', render: (w: any) => <DeptChip label={w.department_label} color={w.department_color} />, mobile: 'hide' },               { key: 'r', label: 'Demandeur', render: (w: any) => <span className="small">{w.requested_by_name}{w.requester_department_label && w.requester_department_label !== w.department_label ? ` · ${w.requester_department_label}` : ''}</span>, mobile: 'hide' },               { key: 'a', label: 'Affecté à', render: (w: any) => <span className="small">{w.assignee_name ?? '—'}</span>, mobile: 'hide' },               { key: 'p', label: 'Priorité', render: (w: any) => <PriorityBadge level={w.priority_level} legacy={w.priority} /> },               { key: 'e', label: 'Échéance', render: (w: any) => <span className={`small${w.is_late ? ' text-danger strong' : ''}`}>{date(w.due_date)}{w.is_late ? ' · retard' : ''}</span> },               { key: 's', label: 'Statut', render: (w: any) => <Status kind="workorder" code={w.status} /> },             ] |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:50) |
| WorkOrderDetail | Button | onClick=() => { setForm({}); setMove(s); } | {statusOf('workorder', s)[0]} | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:97) |
| WorkOrderDetail | Link | to=`/projets/${w.project_id}` | {w.project_ref} | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:108) |
| WorkOrderDetail | Input | placeholder=Écrire un commentaire… ; value=comment ; onChange=(e) => setComment(e.target.value) ; aria-label=Commentaire |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:122) |
| WorkOrderDetail | Button | onClick=() => post.run({ comment }) | Envoyer | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:122) |
| WorkOrderDetail | Field | label=Affecter à |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:131) |
| WorkOrderDetail | Select | placeholder=— ; value=w.assignee_id ?? '' ; onChange=(e) => assign.run({ assignee_id: e.target.value \|\| null }) ; options=team.map((u: any) => ({ value: u.id, label: u.full_name })) |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:131) |
| WorkOrderDetail | Field | label=Début prévu |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:132) |
| WorkOrderDetail | Input | type=date |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:132) |
| WorkOrderDetail | Field | label=Machine / poste |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:133) |
| WorkOrderDetail | Input |  |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:133) |
| WorkOrderDetail | Button | onClick=() => setTime({ minutes: 60, note: '' }) | Saisir du temps | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:136) |
| WorkOrderDetail | DataTable | columns=[{ key: 'd', label: 'Date', render: (t: any) => date(t.work_date) }, { key: 'u', label: 'Personne', render: (t: any) => t.user_name }, { key: 'm', label: 'Durée', num: true, render: (t: any) => minutes(t.minutes) }] |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:139) |
| WorkOrderDetail | Modal | title=`Passer à « ${move ? statusOf('workorder', move)[0] : ''} »` |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:143) |
| WorkOrderDetail | Button | onClick=() => setMove(null) | Annuler | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:144) |
| WorkOrderDetail | Button | onClick=() => status.run({ status: move, comment: form.comment ?? '', blocking_reason: form.blocking_reason \|\| null, quality_note: form.quality_note \|\| null }) | Confirmer | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:144) |
| WorkOrderDetail | Field | label=Cause du blocage ; required=true |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:146) |
| WorkOrderDetail | Textarea | value=form.blocking_reason ?? '' ; onChange=(e) => setForm({ ...form, blocking_reason: e.target.value }) |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:146) |
| WorkOrderDetail | Field | label=Résultat du contrôle qualité ; required=true |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:147) |
| WorkOrderDetail | Textarea | value=form.quality_note ?? '' ; onChange=(e) => setForm({ ...form, quality_note: e.target.value }) |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:147) |
| WorkOrderDetail | Field | label=move === 'annule' ? 'Motif d’annulation' : 'Commentaire' ; required=move === 'annule' |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:148) |
| WorkOrderDetail | Textarea | value=form.comment ?? '' ; onChange=(e) => setForm({ ...form, comment: e.target.value }) |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:148) |
| WorkOrderDetail | Modal | title=Saisir du temps |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:151) |
| WorkOrderDetail | Button | onClick=() => setTime(null) | Annuler | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:151) |
| WorkOrderDetail | Button | onClick=() => log.run({ minutes: Number(time.minutes), note: time.note }) | Enregistrer | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:151) |
| WorkOrderDetail | Field | label=Durée (minutes) ; required=true |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:152) |
| WorkOrderDetail | Input | type=number ; value=time.minutes ; onChange=(e) => setTime({ ...time, minutes: e.target.value }) |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:152) |
| WorkOrderDetail | Field | label=Note |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:152) |
| WorkOrderDetail | Input | value=time.note ; onChange=(e) => setTime({ ...time, note: e.target.value }) |  | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:152) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| WorkOrders | id = file | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:35) |
| WorkOrders | label = File du service | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:35) |
| WorkOrders | id = moi | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:35) |
| WorkOrders | label = Qui me sont affectés | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:35) |
| WorkOrders | id = demandes | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:35) |
| WorkOrders | label = Mes demandes | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:35) |
| WorkOrders | key = t | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:52) |
| WorkOrders | label = Ordre | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:52) |
| WorkOrders | key = d | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:53) |
| WorkOrders | label = Service | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:53) |
| WorkOrders | key = r | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:54) |
| WorkOrders | label = Demandeur | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:54) |
| WorkOrders | key = a | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:55) |
| WorkOrders | label = Affecté à | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:55) |
| WorkOrders | key = p | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:56) |
| WorkOrders | label = Priorité | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:56) |
| WorkOrders | key = e | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:57) |
| WorkOrders | label = Échéance | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:57) |
| WorkOrders | key = s | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:58) |
| WorkOrders | label = Statut | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:58) |
| WorkOrderDetail | label = Ordres de travail | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:96) |
| WorkOrderDetail | key = d | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:139) |
| WorkOrderDetail | label = Date | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:139) |
| WorkOrderDetail | key = u | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:139) |
| WorkOrderDetail | label = Personne | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:139) |
| WorkOrderDetail | key = m | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:139) |
| WorkOrderDetail | label = Durée | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:139) |
| WorkOrders | useCan() | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:17) |
| WorkOrders | can('workorders', 'create') | [WorkOrders.tsx](C:/wamp64/www/comsig-crm/web/src/pages/WorkOrders.tsx:32) |

## Workspace.tsx — CRM-001, CRM-022

Source : [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Workspace (export)](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:12).

Dépendances locales : `../lib/hooks`, `../lib/auth`, `../lib/format`, `../components/ui`, `../components/work`, `../components/DeptDashboard`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Workspace | ``/api/workspace${dep ? `?department=${dep}` : ''}`` | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:18) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Workspace | Select | placeholder=Mon service ; value=dep ; onChange=(e) => setSp(e.target.value ? { service: e.target.value } : {}) ; options=deps.map((x) => ({ value: x.code, label: x.label })) ; aria-label=Service affiché |  | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:35) |
| Workspace | Select | placeholder=`Département (${me?.department_label ?? ''})` ; value=dep ; onChange=(e) => setSp(e.target.value ? { service: e.target.value } : {}) ; options=(r.data.services ?? []).map((x: any) => ({ value: x.code, label: x.label })) ; aria-label=Service affiché |  | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:39) |
| Workspace | Button | onClick=() => setTask(true) | Tâche | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:42) |
| Workspace | Button | onClick=() => setWo(true) | Demande à un service | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:43) |
| Workspace | button | onClick=() => setSp({ service: x.code }) | <strong>{x.label}</strong> <span className="xsmall muted">{x.open_orders} ordre(s) en cours{x.late_orders ? ` · ${x.late_orders} en retard` : ''} · {x.members} pers.</span> | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:57) |
| Workspace | Link | to=/taches | Toutes les tâches | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:67) |
| Workspace | Link | to=u.type === 'tache' ? '/taches' : `/ordres-travail/${u.id}` | {u.title} | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:74) |
| Workspace | Link | to=`/ordres-travail?service=${d.code}` | <Button size="sm" icon={<Inbox />}>File de travail</Button> | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:94) |
| Workspace | Button |  | File de travail | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:94) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Workspace | useCan() | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:14) |
| Workspace | can('tasks', 'create') | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:42) |
| Workspace | can('workorders', 'create') | [Workspace.tsx](C:/wamp64/www/comsig-crm/web/src/pages/Workspace.tsx:43) |

## AiPanel.tsx — composant partagé

Source : [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [ActionCard (export)](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:22), [decide](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:29), [undo](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:40), [AiMessage (export)](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:95), [AiChat (export)](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:119), [send](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:140), [ownerMessage](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:158), [AiPanel (export)](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:197), [k](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:198).

Dépendances locales : `../lib/api`, `../lib/markdown`, `../lib/toast`, `./ui`, `../lib/format`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| decide | `api.post(`/api/ai/actions/${state.id}/decide`)` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:32) |
| decide | ``/api/ai/actions/${state.id}/decide`` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:32) |
| undo | `api.post(`/api/ai/actions/${state.id}/undo`)` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:42) |
| undo | ``/api/ai/actions/${state.id}/undo`` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:42) |
| AiChat | `api.get('/api/ai/status')` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:120) |
| AiChat | `'/api/ai/status'` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:120) |
| AiChat | `api.get(`/api/ai/suggestions?context_type=${contextType ?? ''}`)` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:121) |
| AiChat | ``/api/ai/suggestions?context_type=${contextType ?? ''}`` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:121) |
| AiChat | `api.get(`/api/ai/conversations/${initialConv}`)` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:135) |
| AiChat | ``/api/ai/conversations/${initialConv}`` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:135) |
| send | `api.post('/api/ai/chat')` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:146) |
| send | `'/api/ai/chat'` | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:146) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| ActionCard | Field | label=Objet |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:66) |
| ActionCard | Input | value=payload.objet ; onChange=(e) => setPayload({ ...payload, objet: e.target.value }) |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:66) |
| ActionCard | Field | label=Message |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:67) |
| ActionCard | Textarea | value=payload.corps ; onChange=(e) => setPayload({ ...payload, corps: e.target.value }) |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:67) |
| ActionCard | Field | label=Compte rendu |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:68) |
| ActionCard | Textarea | value=payload.compte_rendu ; onChange=(e) => setPayload({ ...payload, compte_rendu: e.target.value }) |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:68) |
| ActionCard | Field | label=Prochaine étape |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:69) |
| ActionCard | Input | value=payload.prochaine_etape ; onChange=(e) => setPayload({ ...payload, prochaine_etape: e.target.value }) |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:69) |
| ActionCard | Field | label=Échéance |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:70) |
| ActionCard | Input | type=date ; value=payload.echeance ; onChange=(e) => setPayload({ ...payload, echeance: e.target.value }) |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:70) |
| ActionCard | Field | label=Date |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:71) |
| ActionCard | Input | type=date ; value=payload.date ; onChange=(e) => setPayload({ ...payload, date: e.target.value }) |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:71) |
| ActionCard | Link | to=safePath(result.link) | Ouvrir <ExternalLink size={12} /> | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:76) |
| ActionCard | a | href=safeMailto(result.mailto) | Ouvrir dans la messagerie <ExternalLink size={12} /> | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:77) |
| ActionCard | Button | onClick=undo | Annuler l’action | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:80) |
| ActionCard | Button | onClick=() => decide(true) | {edit ? 'Enregistrer et accepter' : 'Accepter'} | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:86) |
| ActionCard | Button | onClick=() => setEdit(true) | Modifier | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:87) |
| ActionCard | Button | onClick=() => decide(false) | Rejeter | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:88) |
| AiMessage | Link | to=safePath(s.link) | <FileSearch /> {s.label} | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:112) |
| AiChat | Segmented | label=Mode de l’assistant ; value=mode ; onChange=setMode ; options=allowed.map((x) => ({ id: x, label: x === 'assistant' ? 'Assistant' : x === 'copilote' ? 'Copilote' : 'Automatisation' })) |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:166) |
| AiChat | button | onClick=() => send(s) | {s} | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:177) |
| AiChat | form | onSubmit=(e) => { e.preventDefault(); send(text); } |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:186) |
| AiChat | label |  | Votre message à l’assistant | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:187) |
| AiChat | Textarea | id=ai-input ; placeholder=Posez une question, collez des notes de réunion à structurer… ; value=text ; onChange=(e) => setText(e.target.value) |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:188) |
| AiChat | Button | type=submit | Envoyer | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:191) |
| AiPanel | Link | onClick=onClose ; to=/assistant | Historique | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:204) |
| AiPanel | Button | onClick=onClose ; aria-label=Fermer l’assistant |  | [AiPanel.tsx](C:/wamp64/www/comsig-crm/web/src/components/AiPanel.tsx:205) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## Documents.tsx — composant partagé

Source : [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Documents (export)](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:12), [upload](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:22).

Dépendances locales : `../lib/api`, `../lib/hooks`, `../lib/toast`, `../lib/format`, `../lib/labels`, `./ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Documents | ``/api/documents?entity_type=${entityType}&entity_id=${entityId}`` | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:15) |
| upload | `'/api/documents'` | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:28) |
| Documents | `api.del(`/api/documents/${del.id}`)` | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:60) |
| Documents | ``/api/documents/${del.id}`` | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:60) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Documents | label |  | Type de document | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:37) |
| Documents | Select | id=`kind-${entityId}` ; value=kind ; onChange=(e) => setKind(e.target.value) ; options=kinds.map((k) => ({ value: k, label: DOC_KIND[k] ?? k })) |  | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:38) |
| Documents | input | type=file ; onChange=(e) => e.target.files?.[0] && upload(e.target.files[0]) |  | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:39) |
| Documents | Button | onClick=() => input.current?.click() | Ajouter un fichier | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:40) |
| Documents | a | onClick=(e) => { if (!fileUrl(d.id)) demoNotice(e); } ; href=fileUrl(d.id) ?? '#' | {d.filename} | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:50) |
| Documents | Button | onClick=() => setDel(d) ; aria-label=`Supprimer ${d.filename}` |  | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:53) |
| Documents | ConfirmModal | title=Supprimer ce document ? |  | [Documents.tsx](C:/wamp64/www/comsig-crm/web/src/components/Documents.tsx:58) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## ExportButton.tsx — composant partagé

Source : [ExportButton.tsx](C:/wamp64/www/comsig-crm/web/src/components/ExportButton.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [ExcelButton (export)](C:/wamp64/www/comsig-crm/web/src/components/ExportButton.tsx:6), [DocButton (export)](C:/wamp64/www/comsig-crm/web/src/components/ExportButton.tsx:11).

Dépendances locales : `../lib/api`, `./ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| ExcelButton | `download(url)` | [ExportButton.tsx](C:/wamp64/www/comsig-crm/web/src/components/ExportButton.tsx:7) |
| DocButton | `download(url)` | [ExportButton.tsx](C:/wamp64/www/comsig-crm/web/src/components/ExportButton.tsx:14) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| ExcelButton | Button | title=title ?? 'Télécharger au format Excel (.xlsx)' ; onClick=() => download(url) | {label} | [ExportButton.tsx](C:/wamp64/www/comsig-crm/web/src/components/ExportButton.tsx:7) |
| DocButton | Button | title=kind === 'pdf' ? 'PDF A4 sur papier à en-tête COM&SIG' : 'Document Word (.docx) sur papier à en-tête COM&SIG' ; onClick=() => download(url) | {kind === 'pdf' ? 'PDF' : 'Word'} | [ExportButton.tsx](C:/wamp64/www/comsig-crm/web/src/components/ExportButton.tsx:13) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## Layout.tsx — composant partagé

Source : [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [Logo (export)](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:19), [useAiPanel (export)](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:32), [Layout (export)](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:36), [onKey](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:59), [onAi](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:60), [h](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:67), [NavGroup](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:227), [toggle](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:236).

Dépendances locales : `../lib/auth`, `../lib/api`, `./ui`, `./SearchPalette`, `./Notifications`, `./Voice`, `./DemoBanner`, `../demo/demo`, `./AiPanel`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| Layout | `api.get('/api/approvals')` | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:74) |
| Layout | `'/api/approvals'` | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:74) |
| Layout | `api.get('/api/notifications')` | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:75) |
| Layout | `'/api/notifications'` | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:75) |
| Layout | `api.get('/api/ai/status')` | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:77) |
| Layout | `'/api/ai/status'` | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:77) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| Layout | a | href=#contenu | Aller au contenu | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:155) |
| Layout | div | onClick=() => setMenuOpen(false) |  | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:156) |
| Layout | Button | onClick=() => setMenuOpen(true) ; aria-label=Ouvrir le menu |  | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:175) |
| Layout | button | onClick=() => setSearchOpen(true) ; aria-label=Recherche globale (Ctrl+K) | <Search size={16} /> <span className="truncate">Rechercher un client, une opportunité, un support…</span> <span className="kbd hide-mobile">Ctrl K</span> | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:176) |
| Layout | Button | onClick=() => setAi({ open: true }) | Assistant | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:180) |
| Layout | Button | onClick=() => setNotifOpen((x) => !x) ; aria-label=`Notifications${notifs.data?.unread ? ` (${notifs.data.unread} non lues)` : ''}` |  | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:183) |
| Layout | button | onClick=() => setUserOpen((x) => !x) | <Avatar name={me?.full_name} size="sm" /> <span className="hide-mobile" style={{ textAlign: 'left', lineHeight: 1.2 }}><span className="small strong" style={{ display: 'block' }}>{me?.full_name}</span><span className="xsmall muted">{me?.role_label}</span></span> | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:188) |
| Layout | button | onClick=() => { setUserOpen(false); nav('/profil'); } | <UserRound /> Mon profil et sécurité | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:194) |
| Layout | button | onClick=() => { setUserOpen(false); nav('/profil#mot-de-passe'); } | <KeyRound /> Changer de mot de passe | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:195) |
| Layout | button | onClick=() => setTheme(v as string) | {ic} {l} | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:200) |
| Layout | button | onClick=async () => { await logout(); nav('/portail'); } | <LogOut /> Se déconnecter | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:204) |
| Layout | a | onClick=(e) => { e.preventDefault(); nav('/profil#mot-de-passe'); } ; href=/profil#mot-de-passe | Définissez votre mot de passe personnel | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:211) |
| Layout | button | onClick=() => setAi({ open: true }) ; aria-label=Ouvrir l’assistant IA | <Sparkles /> Assistant | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:217) |
| NavGroup | button | type=button ; onClick=toggle | <span className="nav-signet-mark" aria-hidden /> <span className="nav-signet-label">{label}</span> {!open && total > 0 && <span className="nav-count" aria-label={`${total} en attente`}>{total}</span>} <span className="nav-signet-n" aria-hidden>{items.length}</span> <ChevronDown className="nav-signet-chev" aria-hidden /> | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:241) |
| NavGroup | NavLink | to=i.to |  | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:250) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| Layout | label = Pilotage | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:81) |
| Layout | label = Palettes des services | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:84) |
| Layout | label = Espace entreprise | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:85) |
| Layout | label = Tableau de bord | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:86) |
| Layout | label = Indicateurs | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:87) |
| Layout | label = Reporting | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:88) |
| Layout | label = Rapports périodiques | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:89) |
| Layout | label = Analyse SWOT | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:90) |
| Layout | label = Validations | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:91) |
| Layout | label = Mon travail | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:93) |
| Layout | label = Messagerie | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:94) |
| Layout | label = To-do et checklists | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:95) |
| Layout | label = Mon assistant | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:96) |
| Layout | label = Tâches et matrices | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:97) |
| Layout | label = Calendrier | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:98) |
| Layout | label = Ordres de travail | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:99) |
| Layout | label = Circuits de production | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:100) |
| Layout | label = Rapports de repérage | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:101) |
| Layout | label = Projets | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:102) |
| Layout | label = Pointage et congés | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:103) |
| Layout | label = Protocole des priorités | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:104) |
| Layout | label = Prospection | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:107) |
| Layout | label = Opportunités | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:109) |
| Layout | label = Activités et agenda | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:111) |
| Layout | label = Devis et proformas | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:112) |
| Layout | label = Objectifs et commissions | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:113) |
| Layout | label = Classement des clients | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:114) |
| Layout | label = Régie publicitaire et médias | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:116) |
| Layout | label = Supports et espaces | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:117) |
| Layout | label = Planning des faces | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:118) |
| Layout | label = Campagnes | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:119) |
| Layout | label = Maintenance | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:120) |
| Layout | label = Redevances et dossiers | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:121) |
| Layout | label = Collectivités | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:122) |
| Layout | label = Projets | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:123) |
| Layout | label = Déploiements | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:124) |
| Layout | label = Réclamations | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:125) |
| Layout | label = Contrats et administratif | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:127) |
| Layout | label = Contrats | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:128) |
| Layout | label = Appels d’offres | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:129) |
| Layout | label = Production et stocks | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:131) |
| Layout | label = Stocks et matières | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:132) |
| Layout | label = Production | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:133) |
| Layout | label = Ressources humaines | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:135) |
| Layout | label = Accès de mon équipe | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:137) |
| Layout | label = Finance | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:139) |
| Layout | label = Comptabilité générale | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:140) |
| Layout | label = Factures et encaissements | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:141) |
| Layout | label = Intelligence | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:143) |
| Layout | label = Assistant IA | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:144) |
| Layout | label = Administration | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:146) |
| Layout | label = Audits de gouvernance | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:147) |
| Layout | label = Sécurité | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:148) |
| Layout | label = Administration | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:149) |
| Layout | useCan() | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:38) |
| Layout | can('ai') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:77) |
| Layout | can('projects') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:85) |
| Layout | can('reporting') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:88) |
| Layout | can('reporting') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:89) |
| Layout | can('reporting') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:90) |
| Layout | can('quotes', 'validate') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:91) |
| Layout | can('opportunities', 'validate') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:91) |
| Layout | can('contracts', 'validate') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:91) |
| Layout | can('tasks') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:97) |
| Layout | can('calendar') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:98) |
| Layout | can('workorders') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:99) |
| Layout | can('projects') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:102) |
| Layout | can('organizations') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:107) |
| Layout | can('opportunities') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:107) |
| Layout | can('organizations') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:108) |
| Layout | can('opportunities') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:109) |
| Layout | can('opportunities') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:110) |
| Layout | can('activities') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:111) |
| Layout | can('quotes') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:112) |
| Layout | can('performance') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:113) |
| Layout | can('organizations') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:114) |
| Layout | can('opportunities') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:114) |
| Layout | can('supports') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:117) |
| Layout | can('supports') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:118) |
| Layout | can('campaigns') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:119) |
| Layout | can('interventions') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:120) |
| Layout | can('royalties') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:121) |
| Layout | can('collectivities') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:122) |
| Layout | can('projects') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:123) |
| Layout | can('projects') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:124) |
| Layout | can('complaints') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:125) |
| Layout | can('contracts') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:128) |
| Layout | can('contracts') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:129) |
| Layout | can('stocks') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:132) |
| Layout | can('production') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:133) |
| Layout | can('accounting') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:140) |
| Layout | can('finance') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:141) |
| Layout | can('ai') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:144) |
| Layout | can('admin') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:149) |
| Layout | can('ai') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:180) |
| Layout | can('ai') | [Layout.tsx](C:/wamp64/www/comsig-crm/web/src/components/Layout.tsx:217) |

## forms.tsx — composant partagé

Source : [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [opt](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:12), [OrganizationForm (export)](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:15), [set](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:25), [clean](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:26), [submit](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:38), [ContactForm (export)](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:82), [set](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:87), [body](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:92), [OpportunityForm (export)](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:123), [set](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:136), [submit](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:142), [ActivityForm (export)](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:192), [set](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:203), [submit](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:209).

Dépendances locales : `../lib/api`, `../lib/hooks`, `../lib/auth`, `../lib/format`, `../lib/labels`, `./ui`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| OrganizationForm | `api.patch(`/api/organizations/${initial.id}`)` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:27) |
| OrganizationForm | ``/api/organizations/${initial.id}`` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:27) |
| OrganizationForm | `api.post('/api/organizations')` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:27) |
| OrganizationForm | `'/api/organizations'` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:27) |
| OrganizationForm | `api.post('/api/organizations/check-duplicates')` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:35) |
| OrganizationForm | `'/api/organizations/check-duplicates'` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:35) |
| ContactForm | `api.patch(`/api/contacts/${initial.id}`)` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:88) |
| ContactForm | ``/api/contacts/${initial.id}`` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:88) |
| ContactForm | `api.post(`/api/organizations/${orgId}/contacts`)` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:88) |
| ContactForm | ``/api/organizations/${orgId}/contacts`` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:88) |
| OpportunityForm | ``/api/organizations?pageSize=30&q=${encodeURIComponent(orgSearch)}`` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:134) |
| OpportunityForm | ``/api/organizations/${f.organization_id}`` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:135) |
| OpportunityForm | `api.patch(`/api/opportunities/${initial.id}`)` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:137) |
| OpportunityForm | ``/api/opportunities/${initial.id}`` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:137) |
| OpportunityForm | `api.post('/api/opportunities')` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:137) |
| OpportunityForm | `'/api/opportunities'` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:137) |
| ActivityForm | ``/api/organizations/${preset.organization_id}`` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:202) |
| ActivityForm | `api.patch(`/api/activities/${initial.id}`)` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:206) |
| ActivityForm | ``/api/activities/${initial.id}`` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:206) |
| ActivityForm | `api.post('/api/activities')` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:206) |
| ActivityForm | `'/api/activities'` | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:206) |

### Onglets, champs, filtres, actions et documents (contrôles)

| Fonction | Contrôle | Attributs | Contenu/action | Preuve |
| --- | --- | --- | --- | --- |
| OrganizationForm | Modal | title=initial ? `Modifier ${initial.legal_name}` : 'Nouvelle organisation' |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:46) |
| OrganizationForm | Button | onClick=onClose | Annuler | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:47) |
| OrganizationForm | Button | onClick=submit | {initial ? 'Enregistrer' : 'Créer la fiche'} | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:47) |
| OrganizationForm | a | href=`/organisations/${d.id}` | {d.legal_name} | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:51) |
| OrganizationForm | Field | label=Pourquoi s’agit-il d’une organisation différente ? ; required=true |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:52) |
| OrganizationForm | Input | placeholder=Ex. : filiale distincte, autre entité juridique… ; value=justif ; onChange=(e) => setJustif(e.target.value) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:52) |
| OrganizationForm | Field | label=Raison sociale ; required=true |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:56) |
| OrganizationForm | Input | value=f.legal_name ; onChange=set('legal_name') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:56) |
| OrganizationForm | Field | label=Personne ressource (interlocuteur) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:57) |
| OrganizationForm | Input | placeholder=Prénom et nom ; value=f.resource_person ; onChange=set('resource_person') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:57) |
| OrganizationForm | Field | label=Fonction occupée |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:58) |
| OrganizationForm | Input | placeholder=Ex. : Directeur marketing ; value=f.resource_title ; onChange=set('resource_title') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:58) |
| OrganizationForm | Field | label=Nom commercial |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:59) |
| OrganizationForm | Input | value=f.trade_name ; onChange=set('trade_name') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:59) |
| OrganizationForm | Field | label=Type |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:60) |
| OrganizationForm | Select | value=f.kind ; onChange=set('kind') ; options=[{ value: 'prospect', label: 'Prospect' }, { value: 'client', label: 'Client' }, { value: 'ancien_client', label: 'Ancien client' }, { value: 'institution', label: 'Institution' }, { value: 'partenaire', label: 'Partenaire' }, { value: 'fournisseur', label: 'Fournisseur' }] |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:60) |
| OrganizationForm | Field | label=Secteur |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:61) |
| OrganizationForm | Select | placeholder=— ; value=f.sector ; onChange=set('sector') ; options=opt(lookups.sector) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:61) |
| OrganizationForm | Field | label=Type de structure |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:62) |
| OrganizationForm | Select | placeholder=— ; value=f.structure_type ; onChange=set('structure_type') ; options=opt(lookups.structure_type) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:62) |
| OrganizationForm | Field | label=Source d’acquisition |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:63) |
| OrganizationForm | Select | placeholder=— ; value=f.source ; onChange=set('source') ; options=opt(lookups.source) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:63) |
| OrganizationForm | Field | label=Potentiel |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:64) |
| OrganizationForm | Select | placeholder=— ; value=f.potential ; onChange=set('potential') ; options=[{ value: 'faible', label: 'Faible' }, { value: 'moyen', label: 'Moyen' }, { value: 'fort', label: 'Fort' }, { value: 'strategique', label: 'Stratégique' }] |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:64) |
| OrganizationForm | Field | label=Taille |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:65) |
| OrganizationForm | Select | placeholder=— ; value=f.size ; onChange=set('size') ; options=[{ value: 'tpe', label: 'TPE' }, { value: 'pme', label: 'PME' }, { value: 'eti', label: 'ETI' }, { value: 'grande', label: 'Grande entreprise' }, { value: 'institution', label: 'Institution' }] |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:65) |
| OrganizationForm | Field | label=Identifiant (RCCM / NCC) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:66) |
| OrganizationForm | Input | value=f.legal_id ; onChange=set('legal_id') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:66) |
| OrganizationForm | Field | label=Commune |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:67) |
| OrganizationForm | Select | placeholder=— ; value=f.commune ; onChange=set('commune') ; options=opt(lookups.commune) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:67) |
| OrganizationForm | Field | label=Ville |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:68) |
| OrganizationForm | Input | value=f.city ; onChange=set('city') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:68) |
| OrganizationForm | Field | label=Adresse |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:69) |
| OrganizationForm | Input | value=f.address ; onChange=set('address') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:69) |
| OrganizationForm | Field | label=Téléphone |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:70) |
| OrganizationForm | Input | type=tel ; placeholder=+225 … ; value=f.phone ; onChange=set('phone') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:70) |
| OrganizationForm | Field | label=E-mail |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:71) |
| OrganizationForm | Input | type=email ; value=f.email ; onChange=set('email') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:71) |
| OrganizationForm | Field | label=Site web |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:72) |
| OrganizationForm | Input | value=f.website ; onChange=set('website') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:72) |
| OrganizationForm | Field | label=Responsable commercial |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:73) |
| OrganizationForm | Select | placeholder=— ; value=f.owner_id ; onChange=set('owner_id') ; options=users.filter((u) => ['commercial', 'direction_commerciale', 'direction_generale'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name })) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:73) |
| OrganizationForm | Field | label=Notes |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:74) |
| OrganizationForm | Textarea | value=f.notes ; onChange=set('notes') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:74) |
| ContactForm | Modal | title=initial ? 'Modifier le contact' : 'Nouveau contact' |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:95) |
| ContactForm | Button | onClick=onClose | Annuler | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:96) |
| ContactForm | Button | onClick=() => save.run(body()) | {dups.length ? 'Créer malgré tout' : 'Enregistrer'} | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:96) |
| ContactForm | Field | label=Civilité |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:100) |
| ContactForm | Select | placeholder=— ; value=f.civility ; onChange=set('civility') ; options=['M.', 'Mme', 'Dr', 'Me', 'Pr'].map((x) => ({ value: x, label: x })) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:100) |
| ContactForm | Field | label=Prénom |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:102) |
| ContactForm | Input | value=f.first_name ; onChange=set('first_name') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:102) |
| ContactForm | Field | label=Nom ; required=true |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:103) |
| ContactForm | Input | value=f.last_name ; onChange=set('last_name') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:103) |
| ContactForm | Field | label=Fonction |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:104) |
| ContactForm | Input | value=f.job_title ; onChange=set('job_title') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:104) |
| ContactForm | Field | label=Service |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:105) |
| ContactForm | Input | value=f.department ; onChange=set('department') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:105) |
| ContactForm | Field | label=Rôle dans la décision |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:106) |
| ContactForm | Select | placeholder=— ; value=f.decision_role ; onChange=set('decision_role') ; options=Object.entries(DECISION_ROLE).map(([value, label]) => ({ value, label })) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:106) |
| ContactForm | Field | label=Canal préféré |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:107) |
| ContactForm | Select | placeholder=— ; value=f.preferred_channel ; onChange=set('preferred_channel') ; options=[{ value: 'email', label: 'E-mail' }, { value: 'telephone', label: 'Téléphone' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'visite', label: 'Visite' }, { value: 'courrier', label: 'Courrier' }] |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:107) |
| ContactForm | Field | label=E-mail |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:108) |
| ContactForm | Input | type=email ; value=f.email ; onChange=set('email') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:108) |
| ContactForm | Field | label=Téléphone fixe |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:109) |
| ContactForm | Input | type=tel ; value=f.phone ; onChange=set('phone') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:109) |
| ContactForm | Field | label=Mobile |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:110) |
| ContactForm | Input | type=tel ; value=f.mobile ; onChange=set('mobile') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:110) |
| ContactForm | label |  | <input type="checkbox" checked={f.is_primary} onChange={set('is_primary')} /> Interlocuteur principal | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:112) |
| ContactForm | input | type=checkbox ; onChange=set('is_primary') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:112) |
| ContactForm | label |  | <input type="checkbox" checked={f.opt_out} onChange={set('opt_out')} /> Opposition aux sollicitations | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:113) |
| ContactForm | input | type=checkbox ; onChange=set('opt_out') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:113) |
| ContactForm | Field | label=Notes |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:115) |
| ContactForm | Textarea | value=f.notes ; onChange=set('notes') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:115) |
| OpportunityForm | Modal | title=initial ? `Modifier ${initial.ref}` : 'Nouvelle opportunité' |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:154) |
| OpportunityForm | Button | onClick=onClose | Annuler | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:155) |
| OpportunityForm | Button | onClick=submit | {initial ? 'Enregistrer' : 'Créer l’opportunité'} | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:155) |
| OpportunityForm | a | href=`/opportunites/${d.id}` | {d.ref} — {d.title} | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:159) |
| OpportunityForm | Field | label=Justification de la création ; required=true |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:160) |
| OpportunityForm | Input | placeholder=Ex. : besoin distinct, autre période… ; value=justif ; onChange=(e) => setJustif(e.target.value) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:160) |
| OpportunityForm | Field | label=Intitulé ; required=true |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:164) |
| OpportunityForm | Input | placeholder=Ex. : Lancement produit — affichage Cocody ; value=f.title ; onChange=set('title') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:164) |
| OpportunityForm | Field | label=Client / prospect ; required=true |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:166) |
| OpportunityForm | Input | placeholder=Rechercher… ; value=orgSearch ; onChange=(e) => setOrgSearch(e.target.value) ; aria-label=Rechercher une organisation |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:167) |
| OpportunityForm | Select | placeholder=Choisir… ; value=f.organization_id ; onChange=(e) => setF({ ...f, organization_id: e.target.value, primary_contact_id: '' }) ; options=(orgs.data?.rows ?? []).map((o: any) => ({ value: o.id, label: `${o.legal_name} (${o.ref})` })) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:168) |
| OpportunityForm | Field | label=Client |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:170) |
| OpportunityForm | Input | value=org.data?.organization?.legal_name ?? '…' |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:170) |
| OpportunityForm | Field | label=Interlocuteur principal |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:171) |
| OpportunityForm | Select | placeholder=— ; value=f.primary_contact_id ; onChange=set('primary_contact_id') ; options=contacts.map((c: any) => ({ value: c.id, label: `${c.first_name} ${c.last_name}${c.job_title ? ` — ${c.job_title}` : ''}` })) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:172) |
| OpportunityForm | Field | label=Responsable |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:174) |
| OpportunityForm | Select | placeholder=— ; value=f.owner_id ; onChange=set('owner_id') ; options=users.filter((u) => ['commercial', 'direction_commerciale', 'direction_generale'].includes(u.role_code)).map((u) => ({ value: u.id, label: u.full_name })) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:174) |
| OpportunityForm | Field | label=Source d’acquisition ; required=true |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:175) |
| OpportunityForm | Select | placeholder=Choisir… ; value=f.source ; onChange=set('source') ; options=opt(lookups.source) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:175) |
| OpportunityForm | Field | label=Type d’offre ; required=true |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:176) |
| OpportunityForm | Select | placeholder=Choisir… ; value=f.offer_type ; onChange=set('offer_type') ; options=opt(lookups.offer_type) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:176) |
| OpportunityForm | Field | label=Montant estimé (HT) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:177) |
| OpportunityForm | MoneyInput | value=f.amount ; onChange=set('amount') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:177) |
| OpportunityForm | Field | label=Date de clôture prévue ; required=true |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:178) |
| OpportunityForm | Input | type=date ; value=f.expected_close_date ; onChange=set('expected_close_date') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:178) |
| OpportunityForm | Field | label=Commune ciblée |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:179) |
| OpportunityForm | Select | placeholder=— ; value=f.commune ; onChange=set('commune') ; options=opt(lookups.commune) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:179) |
| OpportunityForm | Field | label=Type de support |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:180) |
| OpportunityForm | Select | placeholder=— ; value=f.support_type ; onChange=set('support_type') ; options=opt(lookups.support_type) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:180) |
| OpportunityForm | Field | label=Besoin |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:181) |
| OpportunityForm | Textarea | value=f.need ; onChange=set('need') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:181) |
| OpportunityForm | Field | label=Prochaine étape |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:182) |
| OpportunityForm | Input | value=f.next_step ; onChange=set('next_step') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:182) |
| OpportunityForm | Field | label=Date de la prochaine étape |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:183) |
| OpportunityForm | Input | type=date ; value=f.next_step_date ; onChange=set('next_step_date') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:183) |
| ActivityForm | Modal | title=title ?? (initial ? 'Modifier l’activité' : 'Nouvelle activité') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:217) |
| ActivityForm | Button | onClick=onClose | Annuler | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:218) |
| ActivityForm | Button | onClick=submit | {done ? 'Consigner' : 'Enregistrer'} | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:218) |
| ActivityForm | Field | label=Type |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:221) |
| ActivityForm | Select | value=f.kind ; onChange=set('kind') ; options=Object.entries(ACTIVITY_KIND).filter(([k]) => k !== 'demande_interne').map(([value, label]) => ({ value, label })) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:221) |
| ActivityForm | Field | label=Statut |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:222) |
| ActivityForm | Select | value=f.status ; onChange=set('status') ; options=[{ value: 'a_faire', label: 'À faire' }, { value: 'en_cours', label: 'En cours' }, { value: 'termine', label: 'Terminé (consigner)' }, { value: 'reporte', label: 'Reporté' }, { value: 'annule', label: 'Annulé' }] |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:222) |
| ActivityForm | Field | label=Objet ; required=true |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:223) |
| ActivityForm | Input | value=f.subject ; onChange=set('subject') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:223) |
| ActivityForm | Field | label=Échéance |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:224) |
| ActivityForm | Input | type=datetime-local ; value=f.due_at ; onChange=set('due_at') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:224) |
| ActivityForm | Field | label=Priorité |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:225) |
| ActivityForm | Select | value=f.priority ; onChange=set('priority') ; options=[{ value: 'basse', label: 'Basse' }, { value: 'normale', label: 'Normale' }, { value: 'haute', label: 'Haute' }, { value: 'critique', label: 'Critique (compte rendu obligatoire)' }] |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:225) |
| ActivityForm | Field | label=Contact |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:226) |
| ActivityForm | Select | placeholder=— ; value=f.contact_id ; onChange=set('contact_id') ; options=org.data.contacts.map((c: any) => ({ value: c.id, label: `${c.first_name} ${c.last_name}${c.opt_out ? ' (opposition)' : ''}` })) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:226) |
| ActivityForm | Field | label=Résultat du contact |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:227) |
| ActivityForm | Select | placeholder=— ; value=f.contact_result ; onChange=set('contact_result') ; options=[{ value: 'joint', label: 'Interlocuteur joint' }, { value: 'injoignable', label: 'Injoignable (nouvelle tentative programmée)' }, { value: 'refus', label: 'Refus de contact (relances arrêtées)' }] |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:227) |
| ActivityForm | Field | label=Récurrence |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:228) |
| ActivityForm | Select | placeholder=Aucune ; value=f.recurrence ; onChange=set('recurrence') ; options=[{ value: 'quotidienne', label: 'Quotidienne' }, { value: 'hebdomadaire', label: 'Hebdomadaire' }, { value: 'mensuelle', label: 'Mensuelle' }] |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:228) |
| ActivityForm | Field | label=Assigner à |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:229) |
| ActivityForm | Select | placeholder=— ; value=f.assigned_to ; onChange=set('assigned_to') ; options=users.map((u) => ({ value: u.id, label: u.full_name })) |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:229) |
| ActivityForm | Field | label=Compte rendu |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:230) |
| ActivityForm | Textarea | value=f.outcome ; onChange=set('outcome') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:230) |
| ActivityForm | Field | label=Description |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:231) |
| ActivityForm | Textarea | value=f.body ; onChange=set('body') |  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:231) |

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |
| OrganizationForm | label = Prospect | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:60) |
| OrganizationForm | label = Client | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:60) |
| OrganizationForm | label = Ancien client | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:60) |
| OrganizationForm | label = Institution | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:60) |
| OrganizationForm | label = Partenaire | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:60) |
| OrganizationForm | label = Fournisseur | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:60) |
| OrganizationForm | label = Faible | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:64) |
| OrganizationForm | label = Moyen | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:64) |
| OrganizationForm | label = Fort | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:64) |
| OrganizationForm | label = Stratégique | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:64) |
| OrganizationForm | label = TPE | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:65) |
| OrganizationForm | label = PME | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:65) |
| OrganizationForm | label = ETI | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:65) |
| OrganizationForm | label = Grande entreprise | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:65) |
| OrganizationForm | label = Institution | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:65) |
| ContactForm | label = E-mail | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:107) |
| ContactForm | label = Téléphone | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:107) |
| ContactForm | label = WhatsApp | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:107) |
| ContactForm | label = Visite | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:107) |
| ContactForm | label = Courrier | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:107) |
| OpportunityForm | title =  | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:128) |
| ActivityForm | label = À faire | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:222) |
| ActivityForm | label = En cours | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:222) |
| ActivityForm | label = Terminé (consigner) | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:222) |
| ActivityForm | label = Reporté | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:222) |
| ActivityForm | label = Annulé | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:222) |
| ActivityForm | label = Basse | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:225) |
| ActivityForm | label = Normale | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:225) |
| ActivityForm | label = Haute | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:225) |
| ActivityForm | label = Critique (compte rendu obligatoire) | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:225) |
| ActivityForm | label = Interlocuteur joint | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:227) |
| ActivityForm | label = Injoignable (nouvelle tentative programmée) | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:227) |
| ActivityForm | label = Refus de contact (relances arrêtées) | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:227) |
| ActivityForm | label = Quotidienne | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:228) |
| ActivityForm | label = Hebdomadaire | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:228) |
| ActivityForm | label = Mensuelle | [forms.tsx](C:/wamp64/www/comsig-crm/web/src/components/forms.tsx:228) |

## auth.tsx — composant partagé

Source : [auth.tsx](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx). Mobile : parcours écran/onglets/actions non recetté exhaustivement sur mobile.

Exports/fonctions : [AuthProvider (export)](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:14), [refresh](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:18), [logout](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:25), [useAuth](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:29), [useCan (export)](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:32), [useLookups (export)](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:38), [label](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:41), [useUsers (export)](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:45).

Dépendances locales : `./api`.

### Appels / références API de ce fichier

| Fonction | Expression | Preuve |
| --- | --- | --- |
| refresh | `api.get('/api/auth/me')` | [auth.tsx](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:19) |
| refresh | `'/api/auth/me'` | [auth.tsx](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:19) |
| logout | `api.post('/api/auth/logout')` | [auth.tsx](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:25) |
| logout | `'/api/auth/logout'` | [auth.tsx](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:25) |
| useLookups | `api.get('/api/lookups')` | [auth.tsx](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:39) |
| useLookups | `'/api/lookups'` | [auth.tsx](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:39) |
| useUsers | `api.get('/api/users/options')` | [auth.tsx](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:46) |
| useUsers | `'/api/users/options'` | [auth.tsx](C:/wamp64/www/comsig-crm/web/src/lib/auth.tsx:46) |

### Onglets, champs, filtres, actions et documents (contrôles)

Pas de contrôle littéral reconnu ; consulter les dépendances.

### Libellés et permissions déclarés

| Fonction | Déclaration | Preuve |
| --- | --- | --- |

## Dépendances partagées et code cible

Le détail par fonction des 29 fichiers partagés et 41 fichiers V2 est dans [snapshot.json](snapshot.json), propriétés shared et targetFiles. Les références dans les gabarits PDF/Word ou les endpoints ne prouvent pas un téléchargement raccordé.

## API CRM source — déclarations statiques

Ces déclarations Fastify ne sont pas nécessairement les seules routes : les déclarations calculées sont listées séparément. Le nombre n’est pas comparable directement aux routes Laravel génériques.

| Méthode | Chemin | Preuve |
| --- | --- | --- |
| GET | /api/quotes/new/clients | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:12) |
| GET | /api/quotes/new/context | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:13) |
| GET | /api/quotes/new/costs | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:14) |
| POST | /api/quotes/new | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:15) |
| GET | /api/accounting/entries | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:18) |
| GET | /api/accounting/entries/:id | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:21) |
| POST | /api/accounting/entries/:id/validate | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:22) |
| POST | /api/accounting/entries | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:23) |
| GET | /api/accounting/accounts | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:24) |
| GET | /api/accounting/balance | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:25) |
| GET | /api/accounting/ledger/:account | [accounting.ts](C:/wamp64/www/comsig-crm/server/src/modules/accounting.ts:29) |
| GET | /api/activities | [activities.ts](C:/wamp64/www/comsig-crm/server/src/modules/activities.ts:7) |
| POST | /api/activities | [activities.ts](C:/wamp64/www/comsig-crm/server/src/modules/activities.ts:8) |
| PATCH | /api/activities/:id | [activities.ts](C:/wamp64/www/comsig-crm/server/src/modules/activities.ts:9) |
| DELETE | /api/activities/:id | [activities.ts](C:/wamp64/www/comsig-crm/server/src/modules/activities.ts:10) |
| GET | /api/lookups | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:29) |
| GET | /api/users/options | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:36) |
| GET | /api/admin/users | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:42) |
| POST | /api/admin/users | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:43) |
| POST | /api/admin/service-accounts | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:44) |
| PATCH | /api/admin/users/:id | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:45) |
| DELETE | /api/admin/users/:id | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:46) |
| POST | /api/admin/users/:id/reset | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:47) |
| GET | /api/team/accesses | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:50) |
| POST | /api/team/accesses | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:51) |
| GET | /api/admin/teams | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:54) |
| POST | /api/admin/teams | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:59) |
| PATCH | /api/admin/teams/:id | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:67) |
| GET | /api/admin/roles | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:77) |
| PUT | /api/admin/roles/:code | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:83) |
| GET | /api/admin/departments | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:110) |
| PUT | /api/admin/departments/:code | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:124) |
| GET | /api/admin/settings | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:145) |
| PUT | /api/admin/settings/:key | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:151) |
| PUT | /api/admin/stages/:code | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:177) |
| GET | /api/admin/lookups | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:194) |
| PUT | /api/admin/lookups/:list/:code | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:195) |
| GET | /api/admin/automations | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:207) |
| PUT | /api/admin/automations/:code | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:208) |
| GET | /api/admin/audit | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:219) |
| GET | /api/admin/trash | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:249) |
| POST | /api/admin/trash/:type/:id/restore | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:259) |
| GET | /api/targets | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:272) |
| PUT | /api/targets | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:279) |
| POST | /api/admin/jobs/run | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:291) |
| GET | /api/admin/sessions | [admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/admin.ts:301) |
| GET | /api/approvals | [approvals.ts](C:/wamp64/www/comsig-crm/server/src/modules/approvals.ts:7) |
| POST | /api/approvals/:id/decide | [approvals.ts](C:/wamp64/www/comsig-crm/server/src/modules/approvals.ts:11) |
| GET | /api/assistant-admin/day | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:16) |
| GET | /api/assistant-admin/findings | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:17) |
| POST | /api/assistant-admin/findings/:id | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:20) |
| POST | /api/assistant-admin/controls/run | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:21) |
| GET | /api/mail | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:28) |
| GET | /api/mail/accounts | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:29) |
| POST | /api/mail/accounts | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:30) |
| DELETE | /api/mail/accounts/:id | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:31) |
| POST | /api/mail/accounts/:id/sync | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:32) |
| POST | /api/mail/import | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:33) |
| GET | /api/mail/briefing | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:41) |
| POST | /api/mail/accounts/:id/drafts | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:42) |
| POST | /api/mail/:id/classify | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:43) |
| GET | /api/mail/:id/drafts | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:44) |
| POST | /api/mail/:id/draft | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:45) |
| PATCH | /api/mail-drafts/:id | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:46) |
| GET | /api/mail/:id | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:47) |
| PATCH | /api/mail/:id | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:48) |
| POST | /api/mail/:id/task | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:49) |
| GET | /api/periodic-reports | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:52) |
| GET | /api/periodic-reports/:id | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:53) |
| POST | /api/periodic-reports | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:54) |
| GET | /api/swot | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:60) |
| GET | /api/swot/:id | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:61) |
| POST | /api/swot | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:62) |
| POST | /api/swot/:id/review | [assistant-admin.ts](C:/wamp64/www/comsig-crm/server/src/modules/assistant-admin.ts:66) |
| POST | /api/auth/login | [auth.ts](C:/wamp64/www/comsig-crm/server/src/modules/auth.ts:43) |
| POST | /api/auth/mfa/verify | [auth.ts](C:/wamp64/www/comsig-crm/server/src/modules/auth.ts:104) |
| POST | /api/auth/mfa/setup | [auth.ts](C:/wamp64/www/comsig-crm/server/src/modules/auth.ts:119) |
| POST | /api/auth/mfa/enable | [auth.ts](C:/wamp64/www/comsig-crm/server/src/modules/auth.ts:128) |
| POST | /api/auth/logout | [auth.ts](C:/wamp64/www/comsig-crm/server/src/modules/auth.ts:138) |
| GET | /api/auth/me | [auth.ts](C:/wamp64/www/comsig-crm/server/src/modules/auth.ts:149) |
| POST | /api/auth/password | [auth.ts](C:/wamp64/www/comsig-crm/server/src/modules/auth.ts:154) |
| GET | /api/campaigns | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:21) |
| POST | /api/campaigns | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:32) |
| GET | /api/campaigns/:id | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:33) |
| PATCH | /api/campaigns/:id | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:34) |
| POST | /api/campaigns/:id/accept | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:38) |
| POST | /api/campaigns/:id/tasks | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:39) |
| PUT | /api/campaigns/:id/tasks/:taskId | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:40) |
| POST | /api/campaigns/:id/costs | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:41) |
| PUT | /api/campaigns/:id/costs/:costId | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:42) |
| POST | /api/campaigns/:id/proofs | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:43) |
| POST | /api/reservations | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:47) |
| POST | /api/reservations/derogation | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:48) |
| POST | /api/reservations/:id/cancel | [campaigns.ts](C:/wamp64/www/comsig-crm/server/src/modules/campaigns.ts:49) |
| GET | /api/complaints | [complaints.ts](C:/wamp64/www/comsig-crm/server/src/modules/complaints.ts:9) |
| POST | /api/complaints | [complaints.ts](C:/wamp64/www/comsig-crm/server/src/modules/complaints.ts:10) |
| PUT | /api/complaints/:id | [complaints.ts](C:/wamp64/www/comsig-crm/server/src/modules/complaints.ts:11) |
| GET | /api/contracts | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:13) |
| POST | /api/contracts | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:37) |
| POST | /api/contracts/from-quote/:quoteId | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:38) |
| GET | /api/contracts/:id | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:39) |
| PATCH | /api/contracts/:id | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:40) |
| POST | /api/contracts/:id/workflow | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:41) |
| POST | /api/contracts/:id/amendments | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:43) |
| POST | /api/amendments/:id/sign | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:45) |
| POST | /api/contracts/:id/items | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:46) |
| PUT | /api/contracts/:id/items/:itemId | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:47) |
| GET | /api/tenders | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:49) |
| POST | /api/tenders | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:55) |
| PUT | /api/tenders/:id | [contracts.ts](C:/wamp64/www/comsig-crm/server/src/modules/contracts.ts:56) |
| GET | /api/dashboard | [dashboard.ts](C:/wamp64/www/comsig-crm/server/src/modules/dashboard.ts:118) |
| GET | /api/reports/sales | [dashboard.ts](C:/wamp64/www/comsig-crm/server/src/modules/dashboard.ts:230) |
| GET | /api/reports/operations | [dashboard.ts](C:/wamp64/www/comsig-crm/server/src/modules/dashboard.ts:263) |
| GET | /api/reports/adoption | [dashboard.ts](C:/wamp64/www/comsig-crm/server/src/modules/dashboard.ts:308) |
| POST | /api/documents | [documents.ts](C:/wamp64/www/comsig-crm/server/src/modules/documents.ts:70) |
| GET | /api/documents | [documents.ts](C:/wamp64/www/comsig-crm/server/src/modules/documents.ts:108) |
| GET | /api/documents/:id/file | [documents.ts](C:/wamp64/www/comsig-crm/server/src/modules/documents.ts:116) |
| DELETE | /api/documents/:id | [documents.ts](C:/wamp64/www/comsig-crm/server/src/modules/documents.ts:131) |
| GET | /api/xlsx/quote/:id | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:50) |
| GET | /api/xlsx/accounting/journal | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:96) |
| GET | /api/xlsx/accounting/balance | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:113) |
| GET | /api/xlsx/accounting/ledger/:account | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:126) |
| GET | /api/xlsx/performance | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:141) |
| GET | /api/xlsx/sales-pipeline | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:159) |
| GET | /api/xlsx/clients-classification | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:181) |
| GET | /api/xlsx/kpis | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:196) |
| GET | /api/xlsx/report/:id | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:209) |
| GET | /api/xlsx/swot/:id | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:241) |
| GET | /api/xlsx/hr/employees | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:257) |
| GET | /api/xlsx/hr/employee/:id | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:270) |
| GET | /api/xlsx/hr/attendance | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:291) |
| GET | /api/xlsx/hr/leaves | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:301) |
| GET | /api/xlsx/tasks | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:317) |
| GET | /api/xlsx/workorders | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:323) |
| GET | /api/xlsx/project/:id | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:336) |
| GET | /api/xlsx/risks | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:355) |
| GET | /api/xlsx/time-report | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:366) |
| GET | /api/xlsx/calendar | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:377) |
| GET | /api/xlsx/collectivities | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:390) |
| GET | /api/xlsx/deployments | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:401) |
| GET | /api/xlsx/flows | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:414) |
| GET | /api/xlsx/surveys | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:426) |
| GET | /api/xlsx/findings | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:440) |
| GET | /api/xlsx/mail | [excel.ts](C:/wamp64/www/comsig-crm/server/src/modules/excel.ts:450) |
| GET | /api/invoices | [finance.ts](C:/wamp64/www/comsig-crm/server/src/modules/finance.ts:8) |
| POST | /api/invoices | [finance.ts](C:/wamp64/www/comsig-crm/server/src/modules/finance.ts:19) |
| GET | /api/payments | [finance.ts](C:/wamp64/www/comsig-crm/server/src/modules/finance.ts:20) |
| POST | /api/invoices/:id/payments | [finance.ts](C:/wamp64/www/comsig-crm/server/src/modules/finance.ts:21) |
| POST | /api/payments/:id/validate | [finance.ts](C:/wamp64/www/comsig-crm/server/src/modules/finance.ts:23) |
| GET | /api/flows/itineraries | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:12) |
| GET | /api/flows | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:13) |
| GET | /api/flows/stats | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:14) |
| GET | /api/flows/:id | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:15) |
| POST | /api/flows | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:16) |
| POST | /api/flows/:id/take | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:17) |
| POST | /api/flows/:id/advance | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:18) |
| POST | /api/flows/:id/return | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:19) |
| POST | /api/flows/:id/orient | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:20) |
| POST | /api/flows/:id/cancel | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:21) |
| POST | /api/flows/:id/comment | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:22) |
| GET | /api/department-dashboard | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:24) |
| GET | /api/services/palettes | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:25) |
| GET | /api/surveys | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:27) |
| GET | /api/surveys/:id | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:28) |
| POST | /api/surveys | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:29) |
| PATCH | /api/surveys/:id | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:30) |
| POST | /api/surveys/:id/status | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:31) |
| DELETE | /api/surveys/:id | [flows.ts](C:/wamp64/www/comsig-crm/server/src/modules/flows.ts:32) |
| GET | /api/governance/audits | [governance.ts](C:/wamp64/www/comsig-crm/server/src/modules/governance.ts:10) |
| POST | /api/governance/audits | [governance.ts](C:/wamp64/www/comsig-crm/server/src/modules/governance.ts:11) |
| GET | /api/governance/audits/:id | [governance.ts](C:/wamp64/www/comsig-crm/server/src/modules/governance.ts:12) |
| POST | /api/governance/audits/:id/review | [governance.ts](C:/wamp64/www/comsig-crm/server/src/modules/governance.ts:13) |
| GET | /api/me/hr | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:11) |
| POST | /api/me/clock | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:12) |
| POST | /api/me/leave | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:16) |
| GET | /api/hr/dashboard | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:19) |
| GET | /api/hr/employees | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:20) |
| POST | /api/hr/employees | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:21) |
| GET | /api/hr/employees/:id | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:22) |
| PUT | /api/hr/employees/:id | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:23) |
| POST | /api/hr/employees/:id/profile | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:24) |
| POST | /api/hr/employees/:id/cv | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:25) |
| POST | /api/hr/employees/:id/evaluations | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:26) |
| POST | /api/hr/employees/:id/trainings | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:27) |
| GET | /api/hr/positions | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:28) |
| POST | /api/hr/positions | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:29) |
| PUT | /api/hr/positions/:id | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:30) |
| GET | /api/hr/skills | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:31) |
| GET | /api/hr/attendance | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:32) |
| POST | /api/hr/attendance | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:33) |
| GET | /api/hr/leaves | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:34) |
| POST | /api/hr/leaves | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:35) |
| POST | /api/hr/leaves/:id/decision | [hr.ts](C:/wamp64/www/comsig-crm/server/src/modules/hr.ts:36) |
| GET | /api/imports/targets | [imports.ts](C:/wamp64/www/comsig-crm/server/src/modules/imports.ts:134) |
| POST | /api/imports/preview | [imports.ts](C:/wamp64/www/comsig-crm/server/src/modules/imports.ts:136) |
| POST | /api/imports/:id/commit | [imports.ts](C:/wamp64/www/comsig-crm/server/src/modules/imports.ts:163) |
| GET | /api/imports | [imports.ts](C:/wamp64/www/comsig-crm/server/src/modules/imports.ts:204) |
| GET | /api/imports/:id/errors | [imports.ts](C:/wamp64/www/comsig-crm/server/src/modules/imports.ts:210) |
| GET | /api/interventions | [interventions.ts](C:/wamp64/www/comsig-crm/server/src/modules/interventions.ts:9) |
| GET | /api/interventions/kpis | [interventions.ts](C:/wamp64/www/comsig-crm/server/src/modules/interventions.ts:20) |
| POST | /api/interventions | [interventions.ts](C:/wamp64/www/comsig-crm/server/src/modules/interventions.ts:24) |
| GET | /api/interventions/:id | [interventions.ts](C:/wamp64/www/comsig-crm/server/src/modules/interventions.ts:25) |
| PATCH | /api/interventions/:id | [interventions.ts](C:/wamp64/www/comsig-crm/server/src/modules/interventions.ts:26) |
| GET | /api/quotes/:id/docx | [letterhead.ts](C:/wamp64/www/comsig-crm/server/src/modules/letterhead.ts:21) |
| GET | /api/admin/letterhead | [letterhead.ts](C:/wamp64/www/comsig-crm/server/src/modules/letterhead.ts:56) |
| GET | /api/admin/letterhead/image | [letterhead.ts](C:/wamp64/www/comsig-crm/server/src/modules/letterhead.ts:61) |
| GET | /api/admin/letterhead/template | [letterhead.ts](C:/wamp64/www/comsig-crm/server/src/modules/letterhead.ts:67) |
| POST | /api/admin/letterhead | [letterhead.ts](C:/wamp64/www/comsig-crm/server/src/modules/letterhead.ts:71) |
| DELETE | /api/admin/letterhead | [letterhead.ts](C:/wamp64/www/comsig-crm/server/src/modules/letterhead.ts:86) |
| GET | /api/messages | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:10) |
| GET | /api/messages/unread | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:11) |
| GET | /api/messages/recipients | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:12) |
| GET | /api/messages/:id | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:13) |
| POST | /api/messages | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:14) |
| POST | /api/messages/:id/archive | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:15) |
| GET | /api/todos | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:18) |
| GET | /api/todos/reminders | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:19) |
| POST | /api/todos | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:20) |
| PATCH | /api/todos/:id | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:21) |
| DELETE | /api/todos/:id | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:22) |
| GET | /api/checklists | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:25) |
| GET | /api/checklists/:id | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:26) |
| POST | /api/checklists | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:27) |
| PATCH | /api/checklists/:id | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:28) |
| DELETE | /api/checklists/:id | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:29) |
| POST | /api/checklists/:id/items | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:30) |
| PATCH | /api/checklist-items/:id | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:31) |
| DELETE | /api/checklist-items/:id | [messages.ts](C:/wamp64/www/comsig-crm/server/src/modules/messages.ts:32) |
| GET | /api/notifications | [notifications.ts](C:/wamp64/www/comsig-crm/server/src/modules/notifications.ts:6) |
| POST | /api/notifications/read | [notifications.ts](C:/wamp64/www/comsig-crm/server/src/modules/notifications.ts:12) |
| GET | /api/pipeline/stages | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:11) |
| GET | /api/opportunities | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:13) |
| POST | /api/opportunities/check-duplicates | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:29) |
| POST | /api/opportunities | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:34) |
| GET | /api/opportunities/:id | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:37) |
| PATCH | /api/opportunities/:id | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:38) |
| DELETE | /api/opportunities/:id | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:40) |
| GET | /api/opportunities/:id/gates/:stage | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:41) |
| POST | /api/opportunities/:id/stage | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:47) |
| POST | /api/opportunities/:id/derogation | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:48) |
| PUT | /api/opportunities/:id/brief | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:52) |
| PUT | /api/opportunities/:id/feasibility | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:53) |
| POST | /api/opportunities/:id/internal-request | [opportunities.ts](C:/wamp64/www/comsig-crm/server/src/modules/opportunities.ts:55) |
| GET | /api/organizations | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:35) |
| POST | /api/organizations/check-duplicates | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:80) |
| POST | /api/organizations | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:86) |
| GET | /api/organizations/:id | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:90) |
| PATCH | /api/organizations/:id | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:91) |
| GET | /api/organizations/:id/pricing | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:93) |
| PUT | /api/organizations/:id/pricing | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:101) |
| DELETE | /api/organizations/:id | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:113) |
| POST | /api/organizations/:id/qualify | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:114) |
| GET | /api/qualification-criteria | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:122) |
| POST | /api/organizations/:id/merge | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:123) |
| GET | /api/contacts | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:129) |
| POST | /api/organizations/:id/contacts | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:149) |
| PATCH | /api/contacts/:id | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:150) |
| DELETE | /api/contacts/:id | [organizations.ts](C:/wamp64/www/comsig-crm/server/src/modules/organizations.ts:151) |
| GET | /api/performance/sales | [performance.ts](C:/wamp64/www/comsig-crm/server/src/modules/performance.ts:12) |
| POST | /api/performance/close | [performance.ts](C:/wamp64/www/comsig-crm/server/src/modules/performance.ts:13) |
| GET | /api/performance/statements | [performance.ts](C:/wamp64/www/comsig-crm/server/src/modules/performance.ts:14) |
| POST | /api/performance/statements/:id/status | [performance.ts](C:/wamp64/www/comsig-crm/server/src/modules/performance.ts:15) |
| POST | /api/performance/plans | [performance.ts](C:/wamp64/www/comsig-crm/server/src/modules/performance.ts:16) |
| GET | /api/performance/pipeline | [performance.ts](C:/wamp64/www/comsig-crm/server/src/modules/performance.ts:22) |
| GET | /api/clients/classification | [performance.ts](C:/wamp64/www/comsig-crm/server/src/modules/performance.ts:28) |
| GET | /api/kpis | [performance.ts](C:/wamp64/www/comsig-crm/server/src/modules/performance.ts:34) |
| PUT | /api/kpis/targets | [performance.ts](C:/wamp64/www/comsig-crm/server/src/modules/performance.ts:38) |
| GET | /api/public/portal | [portal.ts](C:/wamp64/www/comsig-crm/server/src/modules/portal.ts:19) |
| GET | /api/public/portal/:code/photo | [portal.ts](C:/wamp64/www/comsig-crm/server/src/modules/portal.ts:20) |
| GET | /api/admin/portal | [portal.ts](C:/wamp64/www/comsig-crm/server/src/modules/portal.ts:27) |
| PATCH | /api/admin/portal/:code | [portal.ts](C:/wamp64/www/comsig-crm/server/src/modules/portal.ts:31) |
| POST | /api/admin/portal/:code/photo | [portal.ts](C:/wamp64/www/comsig-crm/server/src/modules/portal.ts:41) |
| DELETE | /api/admin/portal/:code/photo | [portal.ts](C:/wamp64/www/comsig-crm/server/src/modules/portal.ts:57) |
| GET | /api/quotes | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:17) |
| POST | /api/quotes/simulate | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:45) |
| POST | /api/quotes | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:55) |
| GET | /api/quotes/:id | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:56) |
| PATCH | /api/quotes/:id | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:57) |
| POST | /api/quotes/:id/version | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:58) |
| POST | /api/quotes/:id/submit | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:59) |
| POST | /api/quotes/:id/send | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:60) |
| POST | /api/quotes/:id/decision | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:61) |
| POST | /api/quotes/:id/cancel | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:63) |
| GET | /api/quotes/:id/pdf | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:64) |
| GET | /api/catalog | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:76) |
| POST | /api/catalog | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:89) |
| PATCH | /api/catalog/:id | [quotes.ts](C:/wamp64/www/comsig-crm/server/src/modules/quotes.ts:98) |
| GET | /api/royalties | [royalties.ts](C:/wamp64/www/comsig-crm/server/src/modules/royalties.ts:11) |
| POST | /api/royalties | [royalties.ts](C:/wamp64/www/comsig-crm/server/src/modules/royalties.ts:22) |
| PUT | /api/royalties/:id | [royalties.ts](C:/wamp64/www/comsig-crm/server/src/modules/royalties.ts:23) |
| POST | /api/royalties/:id/action | [royalties.ts](C:/wamp64/www/comsig-crm/server/src/modules/royalties.ts:24) |
| GET | /api/admin-records | [royalties.ts](C:/wamp64/www/comsig-crm/server/src/modules/royalties.ts:30) |
| POST | /api/admin-records | [royalties.ts](C:/wamp64/www/comsig-crm/server/src/modules/royalties.ts:35) |
| GET | /api/search | [search.ts](C:/wamp64/www/comsig-crm/server/src/modules/search.ts:6) |
| GET | /api/security/overview | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:12) |
| GET | /api/security/events | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:13) |
| POST | /api/security/events/:id/ack | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:14) |
| POST | /api/security/blocks | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:15) |
| DELETE | /api/security/blocks/:ip | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:16) |
| POST | /api/security/verify | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:17) |
| GET | /api/security/logins | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:21) |
| GET | /api/security/login-archives | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:22) |
| POST | /api/security/login-archives | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:23) |
| GET | /api/security/login-archives/:period | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:24) |
| GET | /api/xlsx/logins | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:25) |
| GET | /api/xlsx/login-archives/:period | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:32) |
| GET | /api/security/radar | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:41) |
| POST | /api/security/run | [security.ts](C:/wamp64/www/comsig-crm/server/src/modules/security.ts:42) |
| GET | /api/stocks/items | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:15) |
| POST | /api/stocks/items | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:31) |
| GET | /api/stocks/items/:id | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:32) |
| PATCH | /api/stocks/items/:id | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:33) |
| DELETE | /api/stocks/items/:id | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:34) |
| GET | /api/stocks/items/:id/prices | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:35) |
| POST | /api/stocks/items/:id/prices | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:36) |
| POST | /api/stocks/items/:id/receive | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:37) |
| POST | /api/stocks/items/:id/consume | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:38) |
| POST | /api/stocks/items/:id/adjust | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:39) |
| PUT | /api/stocks/items/:id/bom | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:40) |
| GET | /api/stocks/movements | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:42) |
| GET | /api/stocks/valuation | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:56) |
| GET | /api/production/orders | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:58) |
| POST | /api/production/orders | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:62) |
| GET | /api/production/orders/:id | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:63) |
| POST | /api/production/orders/:id/start | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:64) |
| POST | /api/production/orders/:id/complete | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:65) |
| POST | /api/production/orders/:id/cancel | [stocks.ts](C:/wamp64/www/comsig-crm/server/src/modules/stocks.ts:66) |
| GET | /api/supports | [supports.ts](C:/wamp64/www/comsig-crm/server/src/modules/supports.ts:11) |
| GET | /api/supports/planning | [supports.ts](C:/wamp64/www/comsig-crm/server/src/modules/supports.ts:29) |
| GET | /api/supports/conflicts | [supports.ts](C:/wamp64/www/comsig-crm/server/src/modules/supports.ts:33) |
| GET | /api/supports/:id | [supports.ts](C:/wamp64/www/comsig-crm/server/src/modules/supports.ts:39) |
| POST | /api/supports | [supports.ts](C:/wamp64/www/comsig-crm/server/src/modules/supports.ts:40) |
| PATCH | /api/supports/:id | [supports.ts](C:/wamp64/www/comsig-crm/server/src/modules/supports.ts:41) |
| DELETE | /api/supports/:id | [supports.ts](C:/wamp64/www/comsig-crm/server/src/modules/supports.ts:42) |
| GET | /api/support-networks | [supports.ts](C:/wamp64/www/comsig-crm/server/src/modules/supports.ts:52) |
| GET | /api/departments | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:14) |
| GET | /api/priority-levels | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:16) |
| GET | /api/workspace | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:17) |
| GET | /api/assignable-users | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:18) |
| GET | /api/tasks | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:21) |
| POST | /api/tasks | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:24) |
| PUT | /api/tasks/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:25) |
| DELETE | /api/tasks/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:26) |
| POST | /api/tasks/:id/time | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:27) |
| GET | /api/matrices/eisenhower | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:28) |
| GET | /api/time/report | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:29) |
| GET | /api/risks | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:33) |
| POST | /api/risks | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:34) |
| PUT | /api/risks/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:35) |
| GET | /api/workorders/kinds | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:38) |
| GET | /api/workorders | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:39) |
| GET | /api/workorders/stats | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:42) |
| POST | /api/workorders | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:43) |
| GET | /api/workorders/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:44) |
| PUT | /api/workorders/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:45) |
| POST | /api/workorders/:id/status | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:46) |
| POST | /api/workorders/:id/comment | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:47) |
| POST | /api/workorders/:id/time | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:48) |
| GET | /api/projects | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:51) |
| GET | /api/workspace/company | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:53) |
| PUT | /api/projects/:id/members | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:54) |
| PUT | /api/projects/:id/raci | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:55) |
| POST | /api/projects | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:56) |
| GET | /api/projects/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:57) |
| PUT | /api/projects/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:58) |
| POST | /api/projects/:id/milestones | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:59) |
| PUT | /api/projects/:id/milestones/:mid | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:60) |
| GET | /api/calendar/owners | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:66) |
| GET | /api/calendar | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:67) |
| POST | /api/calendar/events | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:68) |
| PUT | /api/calendar/events/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:69) |
| DELETE | /api/calendar/events/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:70) |
| GET | /api/delegations | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:71) |
| POST | /api/delegations | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:72) |
| POST | /api/delegations/remove | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:73) |
| GET | /api/collectivities | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:76) |
| POST | /api/collectivities | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:77) |
| GET | /api/collectivities/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:78) |
| PUT | /api/collectivities/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:79) |
| POST | /api/collectivities/:id/interactions | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:80) |
| GET | /api/deployments | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:81) |
| POST | /api/deployments | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:82) |
| PUT | /api/deployments/:id | [work.ts](C:/wamp64/www/comsig-crm/server/src/modules/work.ts:83) |
| GET | /api/ai/status | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:26) |
| GET | /api/ai/suggestions | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:27) |
| POST | /api/ai/chat | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:29) |
| GET | /api/ai/conversations | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:37) |
| GET | /api/ai/conversations/:id | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:42) |
| GET | /api/ai/actions | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:51) |
| POST | /api/ai/actions/:id/decide | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:56) |
| POST | /api/ai/actions/:id/undo | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:58) |
| GET | /api/ai/usage | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:61) |
| GET | /api/kb | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:79) |
| GET | /api/kb/:id | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:88) |
| POST | /api/kb | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:97) |
| PUT | /api/kb/:id | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:107) |
| POST | /api/kb/:id/archive | [routes.ts](C:/wamp64/www/comsig-crm/server/src/ai/routes.ts:119) |

Déclarations calculées à lire séparément :

| Expression | Preuve |
| --- | --- |
| app.get(`/api/periodic-reports/:id/${fmt}`) | [letterhead.ts](C:/wamp64/www/comsig-crm/server/src/modules/letterhead.ts:31) |
| app.get(`/api/swot/:id/${fmt}`) | [letterhead.ts](C:/wamp64/www/comsig-crm/server/src/modules/letterhead.ts:39) |
| app.get(`/api/surveys/:id/${fmt}`) | [letterhead.ts](C:/wamp64/www/comsig-crm/server/src/modules/letterhead.ts:46) |

## API cible Laravel enregistrée

| Méthode | URI | Action | Middleware |
| --- | --- | --- | --- |
| GET\|HEAD | api/v1/accounting/balance | App\Http\Controllers\Api\ErpFinanceController@balance | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:accounting.view |
| GET\|HEAD | api/v1/activities | App\Http\Controllers\Api\ActivityController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:activities.view |
| POST | api/v1/activities | App\Http\Controllers\Api\ActivityController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:activities.create |
| GET\|HEAD | api/v1/activities/{id} | App\Http\Controllers\Api\ActivityController@show | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:activities.view |
| PATCH | api/v1/activities/{id} | App\Http\Controllers\Api\ActivityController@update | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:activities.update |
| DELETE | api/v1/activities/{id} | App\Http\Controllers\Api\ActivityController@destroy | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:activities.delete |
| POST | api/v1/activities/{id}/follow-up | App\Http\Controllers\Api\ActivityController@followUp | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:activities.view, App\Http\Middleware\RequirePermission:activities.create |
| GET\|HEAD | api/v1/admin/audit-logs | App\Http\Controllers\Api\AdminController@audit | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:admin.view |
| POST | api/v1/admin/departments | App\Http\Controllers\Api\AdminController@storeDepartment | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:admin.update |
| PATCH | api/v1/admin/departments/{department} | App\Http\Controllers\Api\AdminController@updateDepartment | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:admin.update |
| GET\|HEAD | api/v1/admin/roles | App\Http\Controllers\Api\AdminController@roles | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:admin.view |
| GET\|HEAD | api/v1/admin/users | App\Http\Controllers\Api\AdminController@users | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:admin.view |
| POST | api/v1/admin/users | App\Http\Controllers\Api\AdminController@storeUser | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:admin.update |
| PATCH | api/v1/admin/users/{user} | App\Http\Controllers\Api\AdminController@updateUser | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:admin.update |
| GET\|HEAD | api/v1/attachments | App\Http\Controllers\Api\AttachmentController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | api/v1/attachments | App\Http\Controllers\Api\AttachmentController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, Illuminate\Routing\Middleware\ThrottleRequests:uploads |
| DELETE | api/v1/attachments/{attachment} | App\Http\Controllers\Api\AttachmentController@destroy | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/attachments/{attachment}/file | App\Http\Controllers\Api\AttachmentController@download | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | api/v1/attachments/{attachment}/restore | App\Http\Controllers\Api\AttachmentController@restore | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | api/v1/auth/forgot-password | App\Http\Controllers\Api\SecurityController@forgot | api, Illuminate\Routing\Middleware\ThrottleRequests:security |
| POST | api/v1/auth/login | App\Http\Controllers\Api\AuthController@login | api, Illuminate\Routing\Middleware\ThrottleRequests:login |
| POST | api/v1/auth/logout | App\Http\Controllers\Api\AuthController@logout | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/auth/me | App\Http\Controllers\Api\AuthController@me | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/auth/mfa | App\Http\Controllers\Api\SecurityController@status | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | api/v1/auth/mfa/challenge | App\Http\Controllers\Api\SecurityController@challenge | api, Illuminate\Routing\Middleware\ThrottleRequests:security |
| POST | api/v1/auth/mfa/confirm | App\Http\Controllers\Api\SecurityController@confirm | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, Illuminate\Routing\Middleware\ThrottleRequests:security |
| POST | api/v1/auth/mfa/manage | App\Http\Controllers\Api\SecurityController@manage | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, Illuminate\Routing\Middleware\ThrottleRequests:security |
| POST | api/v1/auth/mfa/setup | App\Http\Controllers\Api\SecurityController@setup | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, Illuminate\Routing\Middleware\ThrottleRequests:security |
| PUT | api/v1/auth/password | App\Http\Controllers\Api\AuthController@password | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | api/v1/auth/reset-password | App\Http\Controllers\Api\SecurityController@reset | api, Illuminate\Routing\Middleware\ThrottleRequests:security |
| POST | api/v1/auth/session | App\Http\Controllers\Api\AuthController@session | api, Illuminate\Routing\Middleware\ThrottleRequests:login |
| GET\|HEAD | api/v1/catalog | App\Http\Controllers\Api\CatalogController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:catalog.view |
| POST | api/v1/catalog | App\Http\Controllers\Api\CatalogController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:catalog.update |
| PATCH | api/v1/catalog/{catalog} | App\Http\Controllers\Api\CatalogController@update | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:catalog.update |
| GET\|HEAD | api/v1/contacts | App\Http\Controllers\Api\ContactController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| PATCH | api/v1/contacts/{contact} | App\Http\Controllers\Api\ContactController@update | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.update |
| DELETE | api/v1/contacts/{contact} | App\Http\Controllers\Api\ContactController@destroy | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.delete |
| GET\|HEAD | api/v1/customer-cases/{resource} | App\Http\Controllers\Api\CustomerCaseController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | api/v1/customer-cases/{resource} | App\Http\Controllers\Api\CustomerCaseController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/customer-cases/{resource}/{id} | App\Http\Controllers\Api\CustomerCaseController@show | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| PATCH | api/v1/customer-cases/{resource}/{id} | App\Http\Controllers\Api\CustomerCaseController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/customer-references | App\Http\Controllers\Api\CustomerReferenceController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | api/v1/customer-references | App\Http\Controllers\Api\CustomerReferenceController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:admin.update |
| PATCH | api/v1/customer-references/{id} | App\Http\Controllers\Api\CustomerReferenceController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:admin.update |
| GET\|HEAD | api/v1/dashboard | App\Http\Controllers\Api\SystemController@dashboard | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/departments | App\Http\Controllers\Api\AdminController@departments | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/documents/{resource}/{id}.pdf | App\Http\Controllers\Api\DocumentController@pdf | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/erp/references/{resource} | App\Http\Controllers\Api\ErpController@references | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/erp/{resource} | App\Http\Controllers\Api\ErpController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | api/v1/erp/{resource} | App\Http\Controllers\Api\ErpController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/erp/{resource}/{id} | App\Http\Controllers\Api\ErpController@show | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| PATCH | api/v1/erp/{resource}/{id} | App\Http\Controllers\Api\ErpController@update | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | api/v1/erp/{resource}/{id}/actions/{action} | App\Http\Controllers\Api\ErpController@action | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/exports/{resource}.csv | App\Http\Controllers\Api\DocumentController@csv | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/fne/status | App\Http\Controllers\Api\FneController@status | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:fne.view |
| GET\|HEAD | api/v1/health | App\Http\Controllers\Api\SystemController@health | api, Illuminate\Routing\Middleware\ThrottleRequests:60,1 |
| GET\|HEAD | api/v1/invoices | App\Http\Controllers\Api\InvoiceController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:finance.view |
| POST | api/v1/invoices | App\Http\Controllers\Api\InvoiceController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:finance.create |
| GET\|HEAD | api/v1/invoices/{invoice} | App\Http\Controllers\Api\InvoiceController@show | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:finance.view |
| POST | api/v1/invoices/{invoice}/fne/certify | App\Http\Controllers\Api\FneController@certify | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:finance.view, App\Http\Middleware\RequirePermission:fne.certify, Illuminate\Routing\Middleware\ThrottleRequests:6,1 |
| POST | api/v1/invoices/{invoice}/fne/prepare | App\Http\Controllers\Api\FneController@prepare | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:finance.view, App\Http\Middleware\RequirePermission:fne.view |
| POST | api/v1/invoices/{invoice}/payments | App\Http\Controllers\Api\InvoiceController@pay | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:finance.create |
| GET\|HEAD | api/v1/modules | App\Http\Controllers\Api\SystemController@modules | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/notifications | App\Http\Controllers\Api\NotificationController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| POST | api/v1/notifications/read | App\Http\Controllers\Api\NotificationController@read | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api |
| GET\|HEAD | api/v1/opportunities | App\Http\Controllers\Api\OpportunityController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.view |
| POST | api/v1/opportunities | App\Http\Controllers\Api\OpportunityController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.create |
| GET\|HEAD | api/v1/opportunities.csv | App\Http\Controllers\Api\OpportunityController@csv | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.view |
| GET\|HEAD | api/v1/opportunities/options | App\Http\Controllers\Api\OpportunityController@options | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.view |
| GET\|HEAD | api/v1/opportunities/{opportunity} | App\Http\Controllers\Api\OpportunityController@show | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.view |
| PATCH | api/v1/opportunities/{opportunity} | App\Http\Controllers\Api\OpportunityController@update | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.update |
| PUT | api/v1/opportunities/{opportunity}/brief | App\Http\Controllers\Api\OpportunityController@brief | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.update |
| GET\|HEAD | api/v1/opportunities/{opportunity}/derogations | App\Http\Controllers\Api\OpportunityController@derogations | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.view |
| POST | api/v1/opportunities/{opportunity}/derogations | App\Http\Controllers\Api\OpportunityController@requestDerogation | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.update |
| POST | api/v1/opportunities/{opportunity}/derogations/{decision} | App\Http\Controllers\Api\OpportunityController@decideDerogation | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.validate |
| PUT | api/v1/opportunities/{opportunity}/feasibility | App\Http\Controllers\Api\OpportunityController@feasibility | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.update |
| GET\|HEAD | api/v1/opportunities/{opportunity}/gates/{stage} | App\Http\Controllers\Api\OpportunityController@gates | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.view |
| GET\|HEAD | api/v1/opportunities/{opportunity}/history | App\Http\Controllers\Api\OpportunityController@history | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.view |
| GET\|HEAD | api/v1/opportunities/{opportunity}/related/{resource} | App\Http\Controllers\Api\OpportunityController@related | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.view |
| POST | api/v1/opportunities/{opportunity}/stage | App\Http\Controllers\Api\OpportunityController@move | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.update |
| GET\|HEAD | api/v1/organizations | App\Http\Controllers\Api\OrganizationController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| POST | api/v1/organizations | App\Http\Controllers\Api\OrganizationController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.create |
| POST | api/v1/organizations/check-duplicates | App\Http\Controllers\Api\OrganizationController@duplicates | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| GET\|HEAD | api/v1/organizations/options | App\Http\Controllers\Api\OrganizationController@options | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| GET\|HEAD | api/v1/organizations/prospects-summary | App\Http\Controllers\Api\OrganizationController@prospects | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| GET\|HEAD | api/v1/organizations/ranking | App\Http\Controllers\Api\CustomerRankingController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| GET\|HEAD | api/v1/organizations/ranking.csv | App\Http\Controllers\Api\CustomerRankingController@csv | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| GET\|HEAD | api/v1/organizations/{organization} | App\Http\Controllers\Api\OrganizationController@show | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| PATCH | api/v1/organizations/{organization} | App\Http\Controllers\Api\OrganizationController@update | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.update |
| DELETE | api/v1/organizations/{organization} | App\Http\Controllers\Api\OrganizationController@destroy | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.delete |
| POST | api/v1/organizations/{organization}/contacts | App\Http\Controllers\Api\ContactController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.create |
| GET\|HEAD | api/v1/organizations/{organization}/decisions | App\Http\Controllers\Api\OrganizationController@decisions | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| POST | api/v1/organizations/{organization}/merge | App\Http\Controllers\Api\OrganizationController@merge | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.update, App\Http\Middleware\RequirePermission:organizations.delete |
| POST | api/v1/organizations/{organization}/merge-preview | App\Http\Controllers\Api\OrganizationController@mergePreview | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.update, App\Http\Middleware\RequirePermission:organizations.delete |
| GET\|HEAD | api/v1/organizations/{organization}/overview | App\Http\Controllers\Api\OrganizationController@overview | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| POST | api/v1/organizations/{organization}/qualify | App\Http\Controllers\Api\OrganizationController@qualify | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.update |
| GET\|HEAD | api/v1/organizations/{organization}/related/{resource} | App\Http\Controllers\Api\OrganizationController@related | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:organizations.view |
| GET\|HEAD | api/v1/payments/pending | App\Http\Controllers\Api\ErpFinanceController@pending | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:finance.view |
| POST | api/v1/payments/{payment}/{decision} | App\Http\Controllers\Api\ErpFinanceController@review | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:finance.validate |
| GET\|HEAD | api/v1/pipeline/stages | App\Http\Controllers\Api\OpportunityController@stages | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:opportunities.view |
| GET\|HEAD | api/v1/quotes | App\Http\Controllers\Api\QuoteController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.view |
| POST | api/v1/quotes | App\Http\Controllers\Api\QuoteController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.create |
| POST | api/v1/quotes/new | App\Http\Controllers\Api\QuoteController@wizardCreate | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.create |
| GET\|HEAD | api/v1/quotes/new/context | App\Http\Controllers\Api\QuoteController@wizardContext | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.create |
| POST | api/v1/quotes/simulate | App\Http\Controllers\Api\QuoteController@simulate | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.create |
| GET\|HEAD | api/v1/quotes/{quote} | App\Http\Controllers\Api\QuoteController@show | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.view |
| PATCH | api/v1/quotes/{quote} | App\Http\Controllers\Api\QuoteController@update | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.update |
| POST | api/v1/quotes/{quote}/approve | App\Http\Controllers\Api\QuoteController@approve | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.validate |
| POST | api/v1/quotes/{quote}/cancel | App\Http\Controllers\Api\QuoteController@cancel | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.update |
| POST | api/v1/quotes/{quote}/decision | App\Http\Controllers\Api\QuoteController@decision | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.update |
| POST | api/v1/quotes/{quote}/reject | App\Http\Controllers\Api\QuoteController@reject | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.validate |
| POST | api/v1/quotes/{quote}/send | App\Http\Controllers\Api\QuoteController@send | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.update |
| POST | api/v1/quotes/{quote}/submit | App\Http\Controllers\Api\QuoteController@submit | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.update |
| POST | api/v1/quotes/{quote}/version | App\Http\Controllers\Api\QuoteController@version | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:quotes.create |
| GET\|HEAD | api/v1/stock-items | App\Http\Controllers\Api\StockController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:stocks.view |
| POST | api/v1/stock-items | App\Http\Controllers\Api\StockController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:stocks.update |
| GET\|HEAD | api/v1/stock-items/{stock_item} | App\Http\Controllers\Api\StockController@show | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:stocks.view |
| PATCH | api/v1/stock-items/{stock_item} | App\Http\Controllers\Api\StockController@update | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:stocks.update |
| GET\|HEAD | api/v1/stock-items/{stock_item}/movements | App\Http\Controllers\Api\StockController@movements | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:stocks.view |
| POST | api/v1/stock-items/{stock_item}/movements | App\Http\Controllers\Api\StockController@move | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:stocks.update |
| GET\|HEAD | api/v1/tasks | App\Http\Controllers\Api\TaskController@index | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:tasks.view |
| POST | api/v1/tasks | App\Http\Controllers\Api\TaskController@store | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:tasks.create |
| GET\|HEAD | api/v1/tasks/{id} | App\Http\Controllers\Api\TaskController@show | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:tasks.view |
| PATCH | api/v1/tasks/{id} | App\Http\Controllers\Api\TaskController@update | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:tasks.update |
| DELETE | api/v1/tasks/{id} | App\Http\Controllers\Api\TaskController@destroy | api, Illuminate\Auth\Middleware\Authenticate:sanctum, App\Http\Middleware\EnsureActiveUser, Illuminate\Routing\Middleware\ThrottleRequests:api, App\Http\Middleware\RequirePermission:tasks.delete |

## Fichiers PHP historiques sous public

Il s’agit de fichiers présents, pas d’un nombre d’écrans opérationnels. Traitements, wrappers, exports et outils sont séparés par classification indicative. Aucun fichier PHP n’a été exécuté. Les champs sont des noms HTML littéraux, pas des données personnelles.

| Fichier | Catégorie indicative | Noms de champs HTML |
| --- | --- | --- |
| public/actions/_setup/add_employee_columns.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/add_missing_columns.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/check_effectif_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/create_conges_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/create_decaissements_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/create_demandes_stock_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/create_departements_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/create_depenses_stables_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/create_encaissements_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/create_fournisseurs_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/create_messages_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/sms.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/sms2.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/update_effectif_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/actions/_setup/update_fournisseurs_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/admin/_tools/check_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/admin/_tools/fix_table.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/admin/agenda-create.php | écran potentiel — accessibilité à recetter | titre, lieu, date_rdv, heure_debut, heure_fin, participants, description |
| public/admin/agenda.php | écran potentiel — accessibilité à recetter | viewport, titre, lieu, date_rdv, heure_debut, heure_fin, participants, description |
| public/admin/campagne-delete.php | traitement / endpoint probable |  |
| public/admin/campagne-save.php | traitement / endpoint probable |  |
| public/admin/campagne-status.php | traitement / endpoint probable |  |
| public/admin/campagnes.php | écran potentiel — accessibilité à recetter | viewport, id, statut, nom, client, periode, type, medias[] |
| public/admin/contact-upload.php | écran potentiel — accessibilité à recetter |  |
| public/admin/edit-visiteur.php | écran potentiel — accessibilité à recetter | viewport, nom, prenom, societe, personne_visitee, motif, date_visite, heure_arrivee, badge_numero |
| public/admin/espaces.php | écran potentiel — accessibilité à recetter | viewport, id, statut, type, ville, commune, gps, position, dimensions, format |
| public/admin/map.php | écran potentiel — accessibilité à recetter | viewport, user-select, user, region, commune, quartier, adresse, lat, lon, surface, quantite, type, nom, taux, periode, contact, observation, image, banque, uploaded_file |
| public/admin/message-save.php | traitement / endpoint probable |  |
| public/admin/notifications-get.php | traitement / endpoint probable |  |
| public/admin/notifications-hide.php | écran potentiel — accessibilité à recetter |  |
| public/admin/permissions-save.php | traitement / endpoint probable |  |
| public/admin/permissions.php | écran potentiel — accessibilité à recetter | viewport |
| public/admin/pov-save.php | traitement / endpoint probable |  |
| public/admin/send-mail.php | traitement / endpoint probable |  |
| public/admin/support-delete.php | traitement / endpoint probable |  |
| public/admin/support-save.php | traitement / endpoint probable |  |
| public/admin/support-status.php | traitement / endpoint probable |  |
| public/admin/taxe-save.php | traitement / endpoint probable |  |
| public/admin/taxes.php | écran potentiel — accessibilité à recetter | viewport, type, montant, periode |
| public/admin/user-create.php | écran potentiel — accessibilité à recetter | viewport, surnom, email, identifiant, password, effectif_id, groupe |
| public/admin/user-modify.php | écran potentiel — accessibilité à recetter |  |
| public/admin/user-save.php | traitement / endpoint probable |  |
| public/admin/users.php | écran potentiel — accessibilité à recetter | viewport, action, id, surnom, email, username, password, effectif_id, groupe |
| public/admin/visiteur-modify.php | écran potentiel — accessibilité à recetter |  |
| public/admin/visiteurs-historique.php | écran potentiel — accessibilité à recetter | viewport, date_debut, date_fin, q |
| public/admin/visiteurs.php | écran potentiel — accessibilité à recetter | viewport, nom, prenom, telephone, societe, personne_visitee, motif, date_visite, heure_arrivee |
| public/api/departements_api.php | écran potentiel — accessibilité à recetter |  |
| public/api/documents_api.php | écran potentiel — accessibilité à recetter |  |
| public/api/index.php | écran potentiel — accessibilité à recetter |  |
| public/api/record.php | traitement / endpoint probable |  |
| public/api/smsapi.php | écran potentiel — accessibilité à recetter |  |
| public/api/vehicules_api.php | écran potentiel — accessibilité à recetter |  |
| public/api/vehicules_usage_api.php | écran potentiel — accessibilité à recetter |  |
| public/dashboard/board.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/commercial-as.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/commercial.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/compta.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/daf.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/data-get.php | traitement / endpoint probable |  |
| public/dashboard/gestionstock.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/index.php | écran potentiel — accessibilité à recetter | viewport, periode, date_debut, date_fin |
| public/dashboard/infographie.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/production.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/regie.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/rh.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/secretariat.php | écran potentiel — accessibilité à recetter | viewport |
| public/dashboard/services.php | écran potentiel — accessibilité à recetter | viewport |
| public/documents/document-create.php | écran potentiel — accessibilité à recetter | viewport, document_name, document_type, description, main_category, version, expires_at, expiry_date, tags, document_file |
| public/documents/document-edit.php | écran potentiel — accessibilité à recetter | viewport, id, document_name, document_type, description, main_category, version, expires_at, expiry_date, tags, document_file |
| public/documents/documents-controller.php | traitement / endpoint probable |  |
| public/documents/gen_pdf.php | document / export probable |  |
| public/documents/index.php | écran potentiel — accessibilité à recetter | viewport, document_name, document_type, main_category, version, expires_at, expiry_date, tags, description, document_file |
| public/documents/pdf.php | document / export probable | viewport |
| public/fleet/list_chauffeurs.php | écran potentiel — accessibilité à recetter |  |
| public/fleet/stats-vehicules.php | écran potentiel — accessibilité à recetter | viewport, month, year |
| public/fleet/vehicules-utilises.php | écran potentiel — accessibilité à recetter | viewport, vehicule_id, chauffeur_id, chauffeur_nom, chauffeur_telephone, date_remise_cle, date_retour_prevue, kilometrage_depart, destination, motif_utilisation, usage_id, statut, observations, date_retour_reelle, kilometrage_retour |
| public/fleet/vehicules.php | écran potentiel — accessibilité à recetter | viewport, id, nom, immatriculation, marque, modele, annee, couleur, type_vehicule, statut, date_achat, prix_achat, kilometrage_actuel, prochaine_revision, assurance_expire, description |
| public/human_resources/conge-create.php | écran potentiel — accessibilité à recetter | viewport, employe_id, type, type_absence, date_debut, date_fin, date_absence, heure_debut, heure_fin, duree, motif |
| public/human_resources/conge-delete.php | traitement / endpoint probable |  |
| public/human_resources/conge-details-get.php | traitement / endpoint probable |  |
| public/human_resources/conge-employee-update.php | traitement / endpoint probable |  |
| public/human_resources/conge-save.php | traitement / endpoint probable |  |
| public/human_resources/conge-status-update.php | traitement / endpoint probable |  |
| public/human_resources/conge-update.php | traitement / endpoint probable |  |
| public/human_resources/conges-events-get.php | traitement / endpoint probable |  |
| public/human_resources/conges-solde-get.php | traitement / endpoint probable |  |
| public/human_resources/departement-delete.php | traitement / endpoint probable |  |
| public/human_resources/departement-get.php | traitement / endpoint probable |  |
| public/human_resources/departement-save.php | traitement / endpoint probable |  |
| public/human_resources/departements.php | écran potentiel — accessibilité à recetter | viewport, id, nom, description |
| public/human_resources/effectif.php | écran potentiel — accessibilité à recetter | viewport |
| public/human_resources/employe-create.php | écran potentiel — accessibilité à recetter | viewport, nom, prenom, photo, matricule, email, telephone_mobile, telephone_fixe, date_naissance, adresse, poste, salaire_base, duree_contrat, date_debut_contrat, numero_cni, numero_cnps, document_identite |
| public/human_resources/employe-delete.php | traitement / endpoint probable |  |
| public/human_resources/employe-get.php | traitement / endpoint probable |  |
| public/human_resources/employe-save.php | traitement / endpoint probable |  |
| public/human_resources/employe-update.php | traitement / endpoint probable |  |
| public/human_resources/employee-create.php | écran potentiel — accessibilité à recetter |  |
| public/human_resources/employee-edit.php | écran potentiel — accessibilité à recetter | viewport, id, nom, prenom, matricule, date_naissance, email, telephone_mobile, telephone_fixe, adresse, poste, type_contrat, date_debut_contrat, duree_contrat, salaire_base, categorie, annees_experience, conges_payes, declaration_cnps, assure, avantages, statut_matrimonial, nombre_enfants, formations, certifications, antecedents_medicaux, antecedents_judiciaires, numero_cni, numero_cnps |
| public/human_resources/employee-search.php | écran potentiel — accessibilité à recetter |  |
| public/human_resources/fiche_de_paie.php | écran potentiel — accessibilité à recetter |  |
| public/human_resources/holiday-employee.php | écran potentiel — accessibilité à recetter | viewport, id, type, type_absence, date_debut, date_fin, date_absence, duree, heure_debut, heure_fin, motif, raison |
| public/human_resources/holiday.php | écran potentiel — accessibilité à recetter | viewport, type, type_absence, statut, date, id, date_debut, date_fin, date_absence, duree, heure_debut, heure_fin, motif, raison |
| public/human_resources/imprimer_badge.php | écran potentiel — accessibilité à recetter |  |
| public/human_resources/paie-generate.php | traitement / endpoint probable | viewport |
| public/human_resources/paie.php | écran potentiel — accessibilité à recetter | viewport, impot, salaire_net, employe_id, situation_familiale, enfants, salaire_base, mois, primes, indemnites, heures_supp, absences, retenues, avance |
| public/human_resources/paie2.php | écran potentiel — accessibilité à recetter | nom, brut, enfants, absences, heures_supp |
| public/human_resources/presence-create.php | écran potentiel — accessibilité à recetter | viewport, employe_id, date_pointage, type_absence |
| public/human_resources/presence-save.php | traitement / endpoint probable |  |
| public/human_resources/presences-recap.php | écran potentiel — accessibilité à recetter | viewport |
| public/human_resources/presences.php | écran potentiel — accessibilité à recetter | viewport |
| public/human_resources/presences/check-absences.php | traitement / endpoint probable |  |
| public/human_resources/presences/index.php | écran potentiel — accessibilité à recetter | viewport |
| public/human_resources/presences/recap-mensuel-presence.php | écran potentiel — accessibilité à recetter | viewport, mois, annee |
| public/human_resources/presences/record.php | traitement / endpoint probable |  |
| public/human_resources/presences/stats-client-periode.php | écran potentiel — accessibilité à recetter | viewport, date_debut, date_fin |
| public/human_resources/presences/stats-clients.php | écran potentiel — accessibilité à recetter | viewport |
| public/human_resources/profil-employe.php | écran potentiel — accessibilité à recetter | viewport |
| public/includes/app.php | écran potentiel — accessibilité à recetter |  |
| public/includes/require_auth.php | écran potentiel — accessibilité à recetter |  |
| public/includes/require_auth_api.php | écran potentiel — accessibilité à recetter |  |
| public/inventory/approvisionnement-create.php | écran potentiel — accessibilité à recetter | viewport, produit[], quantite[], unite[], date_demande, service, priorite, justificatif |
| public/inventory/approvisionnement-save.php | traitement / endpoint probable |  |
| public/inventory/article-finis-save.php | traitement / endpoint probable |  |
| public/inventory/article-save.php | traitement / endpoint probable |  |
| public/inventory/article-update.php | traitement / endpoint probable |  |
| public/inventory/demande-statut-update.php | traitement / endpoint probable |  |
| public/inventory/demande-stock-employee.php | écran potentiel — accessibilité à recetter | viewport |
| public/inventory/demande-stock-save.php | traitement / endpoint probable |  |
| public/inventory/demande-stock.php | écran potentiel — accessibilité à recetter | viewport |
| public/inventory/edit-produit.php | écran potentiel — accessibilité à recetter | viewport, id, nom, seuil_alerte, seuil_securite, caracteristique, marque, unite, prix_unitaire, fournisseur, verifier |
| public/inventory/inventaire.php | écran potentiel — accessibilité à recetter | viewport |
| public/inventory/ma-demande.php | écran potentiel — accessibilité à recetter | viewport, update_id, montant, motif, piece_jointe |
| public/inventory/mouvement-delete.php | traitement / endpoint probable |  |
| public/inventory/mouvement-finis-save.php | traitement / endpoint probable |  |
| public/inventory/mouvement-save.php | traitement / endpoint probable |  |
| public/inventory/mouvements-finis-historique.php | écran potentiel — accessibilité à recetter | viewport |
| public/inventory/mouvements-historique.php | écran potentiel — accessibilité à recetter | viewport |
| public/inventory/produit-create.php | écran potentiel — accessibilité à recetter | viewport, nom, seuil_alerte, seuil_securite, caracteristique, marque, unite, prix_unitaire, fournisseur, dateperemption, verifier |
| public/inventory/produit-finis-create.php | écran potentiel — accessibilité à recetter | viewport, nom, reference, seuil_alerte, seuil_securite, caracteristique, marque, unite, fournisseur, verifier |
| public/inventory/stock-finis-modify.php | écran potentiel — accessibilité à recetter |  |
| public/inventory/stock-finis.php | écran potentiel — accessibilité à recetter | viewport, produit_id, type, quantite, projet_id, agent_id, departement |
| public/inventory/stock-modify.php | écran potentiel — accessibilité à recetter |  |
| public/inventory/stock-view.php | écran potentiel — accessibilité à recetter | viewport, motif_demande, projet_id, description, articles[], quantites[] |
| public/inventory/stock.php | écran potentiel — accessibilité à recetter | viewport, produit_id, type, quantite, motif, motif_texte, agent_id, departement |
| public/layout/header.php | écran potentiel — accessibilité à recetter |  |
| public/login/connexion-save.php | traitement / endpoint probable |  |
| public/login/index.php | écran potentiel — accessibilité à recetter |  |
| public/parties/client-profil.php | écran potentiel — accessibilité à recetter | viewport |
| public/parties/clients-list.php | écran potentiel — accessibilité à recetter | viewport, id, nom, representant, adresse, numero1, numero2, email, ncc, commande_encours |
| public/parties/clients.php | écran potentiel — accessibilité à recetter | viewport, id, nom, adresse, representant, numero1, numero2, email, ncc |
| public/parties/fournisseur-add.php | écran potentiel — accessibilité à recetter |  |
| public/parties/fournisseur-create.php | écran potentiel — accessibilité à recetter | viewport, raison_sociale, nom_contact, produit, email, telephone_mobile, telephone_fixe, pays, adresse, type_fournisseur, numero_contribuable, representant_legal, numero_rccm, numero_cnps, documents_legaux |
| public/parties/fournisseur-delete.php | traitement / endpoint probable |  |
| public/parties/fournisseur-edit.php | écran potentiel — accessibilité à recetter | viewport, id, raison_sociale, nom_contact, pays, email, telephone_mobile, telephone_fixe, produit, adresse, type_fournisseur, numero_contribuable, representant_legal, numero_rccm, numero_cnps, documents_legaux |
| public/parties/fournisseur-save.php | traitement / endpoint probable |  |
| public/parties/fournisseur-update.php | traitement / endpoint probable |  |
| public/parties/fournisseurs.php | écran potentiel — accessibilité à recetter | viewport |
| public/production/fiche-create.php | écran potentiel — accessibilité à recetter | viewport, projet_id, statut, reference, date_creation, client_name, reception_commande, delai_livraison, elements_fournis[], travaux_conception, travaux_impression, travaux_nom_fichier, machines[], finitions[], salle_finition, observation, supports[${supportCounter}][type], supports[${supportCounter}][caracteristique], supports[${index}][caracteristique], infos_techniques[${infoTechniqueCounter}][fichiers], infos_techniques[${infoTechniqueCounter}][quantites], infos_techniques[${infoTechniqueCounter}][formats], charges_execution[] |
| public/production/fiche-delete.php | traitement / endpoint probable |  |
| public/production/fiche-edit.php | écran potentiel — accessibilité à recetter | viewport, id, statut, projet_id, reference, date_creation, client_name, reception_commande, delai_livraison, elements_fournis[], travaux_conception, travaux_impression, travaux_nom_fichier, machines[], finitions[], salle_finition, observation, supports[${supportCounter}][type], supports[${supportCounter}][caracteristique], supports[${index}][caracteristique], infos_techniques[${infoTechniqueCounter}][fichiers], infos_techniques[${infoTechniqueCounter}][quantites], infos_techniques[${infoTechniqueCounter}][formats], charges_execution[] |
| public/production/fiche-print.php | document / export probable | viewport |
| public/production/fiche-save.php | traitement / endpoint probable |  |
| public/production/fiche-update.php | traitement / endpoint probable |  |
| public/production/fiches.php | écran potentiel — accessibilité à recetter | viewport |
| public/projects/devis-by-client.php | écran potentiel — accessibilité à recetter |  |
| public/projects/espaces-map.php | écran potentiel — accessibilité à recetter | viewport |
| public/projects/executeurs-get.php | traitement / endpoint probable |  |
| public/projects/index.php | écran potentiel — accessibilité à recetter | viewport |
| public/projects/medias.php | écran potentiel — accessibilité à recetter | viewport, nom, type, designers, fichiers[], budget, etat |
| public/projects/points-espaces.php | écran potentiel — accessibilité à recetter |  |
| public/projects/projet-create.php | écran potentiel — accessibilité à recetter | viewport, produit[], quantite[], prix[], nom_projet, client_nom, commercial, chef_projet, reference_bc, ressources, fichier_bon, date_debut, date_fin |
| public/projects/projet-edit-save.php | traitement / endpoint probable |  |
| public/projects/projet-edit.php | écran potentiel — accessibilité à recetter | viewport, produit[], quantite[], prix[], id, nom_projet, client_name, commercial_name, chef_name, reference_bc, bc_link, ressources, date_debut, date_fin, infographie, soudure, impression, peinture, decoration, chef_cadrage, chef_conception, chef_approvision, chef_controle, chef_preparation, chef_livraison, chef_sav |
| public/projects/projet-media-save.php | traitement / endpoint probable |  |
| public/projects/projet-modify.php | écran potentiel — accessibilité à recetter |  |
| public/projects/projet-save.php | traitement / endpoint probable |  |
| public/projects/projet-update.php | traitement / endpoint probable |  |
| public/projects/projet-view.php | écran potentiel — accessibilité à recetter | viewport |
| public/projects/taches.php | écran potentiel — accessibilité à recetter | viewport |
| public/projects/task-create.php | écran potentiel — accessibilité à recetter | viewport, produit[], quantite[], prix[], titre, task, executeurs[], type_task, deadline, fichier_joint |
| public/projects/task-details.php | écran potentiel — accessibilité à recetter | viewport |
| public/projects/task-feedback-create.php | écran potentiel — accessibilité à recetter | viewport, task_id, feedback, fichier_joint |
| public/projects/task-feedback-save.php | traitement / endpoint probable |  |
| public/projects/task-modify.php | écran potentiel — accessibilité à recetter |  |
| public/projects/task-save.php | traitement / endpoint probable |  |
| public/projects/task-send.php | traitement / endpoint probable | viewport |
| public/projects/travail.php | écran potentiel — accessibilité à recetter | viewport, action, travail_id, observation, fichier, statut |
| public/projects/travaux.php | écran potentiel — accessibilité à recetter | viewport, action, travail_id, redirect, statut, projet_id, titre, deadline, assigne_id, brief, fichier |
| public/reporting/export-projets.php | document / export probable |  |
| public/reporting/rapport-travail-create.php | écran potentiel — accessibilité à recetter | viewport, reference, user_id, user_nom, periode_debut, periode_fin, nom_prenoms, fonction, objectifs[0][projet_client], objectifs[0][objectifs], objectifs[0][echeance], objectifs[0][statut], activites[0][jour], activites[0][description], activites[0][projet_client], activites[0][temps], activites[0][auto_evaluation], livrables[0][livrable], livrables[0][format], livrables[0][projet_client], livrables[0][statut], difficultes, solutions, suggestions, plan_travail[0][actions], plan_travail[0][projet_client], plan_travail[0][priorite], plan_travail[0][echeance], action, objectifs[${objectifRowCount}][projet_client], objectifs[${objectifRowCount}][objectifs], objectifs[${objectifRowCount}][echeance], objectifs[${objectifRowCount}][statut], activites[${activiteRowCount}][jour], activites[${activiteRowCount}][description], activites[${activiteRowCount}][temps], activites[${activiteRowCount}][auto_evaluation], livrables[${livrableRowCount}][livrable], livrables[${livrableRowCount}][format], livrables[${livrableRowCount}][statut], plan_travail[${planTravailRowCount}][actions], plan_travail[${planTravailRowCount}][priorite], plan_travail[${planTravailRowCount}][echeance] |
| public/reporting/rapport-travail-delete.php | traitement / endpoint probable |  |
| public/reporting/rapport-travail-edit.php | écran potentiel — accessibilité à recetter | viewport, rapport_id, reference, user_id, user_nom, departement, periode_debut, periode_fin, nom_prenoms, fonction, objectifs[0][projet_client], objectifs[0][objectifs], objectifs[0][echeance], objectifs[0][statut], activites[0][jour], activites[0][description], activites[0][temps], activites[0][auto_evaluation], livrables[0][livrable], livrables[0][format], livrables[0][statut], difficultes, solutions, suggestions, plan_travail[0][actions], plan_travail[0][priorite], plan_travail[0][echeance], action, objectifs[${objectifRowCount}][projet_client], objectifs[${objectifRowCount}][objectifs], objectifs[${objectifRowCount}][echeance], objectifs[${objectifRowCount}][statut], activites[${activiteRowCount}][jour], activites[${activiteRowCount}][description], activites[${activiteRowCount}][temps], activites[${activiteRowCount}][auto_evaluation], livrables[${livrableRowCount}][livrable], livrables[${livrableRowCount}][format], livrables[${livrableRowCount}][statut], plan_travail[${planTravailRowCount}][actions], plan_travail[${planTravailRowCount}][priorite], plan_travail[${planTravailRowCount}][echeance] |
| public/reporting/rapport-travail-save.php | traitement / endpoint probable |  |
| public/reporting/rapport-travail-view.php | écran potentiel — accessibilité à recetter | viewport, commentaire, submit_commentaire |
| public/reporting/rapports-travail.php | écran potentiel — accessibilité à recetter | viewport |
| public/reporting/stats-annuel-projet.php | écran potentiel — accessibilité à recetter | viewport, year |
| public/reporting/stats-projet.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/ajouter_taxes_communales.php | écran potentiel — accessibilité à recetter |  |
| public/sales/bon-commande-alt.php | écran potentiel — accessibilité à recetter |  |
| public/sales/bon-commande.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/bon-livraison.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/client-add.php | écran potentiel — accessibilité à recetter |  |
| public/sales/client-delete-alt.php | traitement / endpoint probable |  |
| public/sales/client-delete.php | traitement / endpoint probable |  |
| public/sales/client-details-get.php | traitement / endpoint probable |  |
| public/sales/client-email-get.php | traitement / endpoint probable |  |
| public/sales/client-factures-fetch.php | traitement / endpoint probable |  |
| public/sales/client-get.php | traitement / endpoint probable |  |
| public/sales/client-save.php | traitement / endpoint probable |  |
| public/sales/commande-create.php | écran potentiel — accessibilité à recetter | viewport, produit[], quantite[], prix[], client_nom, client_adresse, client_telephone |
| public/sales/commande-modify.php | écran potentiel — accessibilité à recetter |  |
| public/sales/commandes-alt.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/commandes-projet.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/commandes.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/compte-client-details.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/compte-client.php | écran potentiel — accessibilité à recetter | viewport, client_id, montant, date_versement, mode_paiement, reference, description, clientId, emailSubject, emailContent |
| public/sales/comptes-clients-export.php | document / export probable |  |
| public/sales/devis-create.php | écran potentiel — accessibilité à recetter | viewport, client_nom, titre_devis, delai_realisation, remise, produit[], detail[], quantite[], prix[] |
| public/sales/devis-edit-taxes.php | écran potentiel — accessibilité à recetter | viewport, id, client_nom, titre_devis, delai_realisation, produit[], detail[], periode[], quantite[], prix[], nom_taxe[], cout_taxe[], taxe_id[], metre_carre[], nombre[], duree[] |
| public/sales/devis-edit.php | écran potentiel — accessibilité à recetter | produit[], detail[], quantite[], prix[], viewport, id, client_nom, titre_devis, delai_realisation, remise |
| public/sales/devis-export.php | document / export probable |  |
| public/sales/devis-list.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/devis-mail-send.php | traitement / endpoint probable |  |
| public/sales/devis-modify.php | écran potentiel — accessibilité à recetter |  |
| public/sales/devis-particulier-update.php | traitement / endpoint probable |  |
| public/sales/devis-particulier.php | écran potentiel — accessibilité à recetter | viewport, client_nom, titre_devis, delai_realisation, produit[], detail[], periode[], quantite[], prix[], nom_taxe[], cout_taxe[], taxe_id[], metre_carre[], nombre[], duree[] |
| public/sales/devis-projet.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/devis-regie.php | écran potentiel — accessibilité à recetter | viewport, devisId, mainRecipient, emailSubject, emailContent, ccEmails[] |
| public/sales/devis-template.php | document / export probable |  |
| public/sales/devis-update.php | traitement / endpoint probable |  |
| public/sales/devis.php | écran potentiel — accessibilité à recetter | viewport, devisId, mainRecipient, emailSubject, emailContent, ccEmails[] |
| public/sales/facture-create.php | écran potentiel — accessibilité à recetter | viewport, produit[], quantite[], prix[], client_nom, titre_devis |
| public/sales/facture-export.php | document / export probable |  |
| public/sales/facture-fne-sign.php | écran potentiel — accessibilité à recetter |  |
| public/sales/facture-modify.php | écran potentiel — accessibilité à recetter |  |
| public/sales/facture-particulier-save.php | traitement / endpoint probable |  |
| public/sales/facture-save.php | traitement / endpoint probable |  |
| public/sales/facture-template.php | document / export probable | viewport |
| public/sales/factures-projet.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/factures-xls.php | document / export probable |  |
| public/sales/factures.php | écran potentiel — accessibilité à recetter | viewport |
| public/sales/historiques-versement.php | écran potentiel — accessibilité à recetter | viewport, client_id, montant, date_versement, mode_paiement, reference, description |
| public/sales/livraison-modify.php | écran potentiel — accessibilité à recetter |  |
| public/sales/rappel-mail-send.php | traitement / endpoint probable |  |
| public/sales/rdv-calendar.php | écran potentiel — accessibilité à recetter |  |
| public/sales/rdv-create.php | écran potentiel — accessibilité à recetter | viewport, action, titre, type_rdv, client_id, devis_id, commercial_id, date_rdv, heure_debut, heure_fin, lieu, description |
| public/sales/rdv-edit.php | écran potentiel — accessibilité à recetter | viewport, action, id, titre, type_rdv, statut, client_id, devis_id, commercial_id, date_rdv, heure_debut, heure_fin, lieu, description, compte_rendu, prochaine_action, date_prochaine_action |
| public/sales/rdv-events-get.php | traitement / endpoint probable |  |
| public/sales/rdv-list.php | écran potentiel — accessibilité à recetter | viewport, statut, commercial_id, du, au |
| public/sales/rdv-save.php | traitement / endpoint probable |  |
| public/sales/rdv-status.php | traitement / endpoint probable |  |
| public/sales/rdv.php | écran potentiel — accessibilité à recetter | viewport, scope, view, date, commercial_id, statut |
| public/sales/versement-details-get.php | traitement / endpoint probable |  |
| public/sales/versement-save.php | traitement / endpoint probable |  |
| public/sales/versements-export.php | document / export probable |  |
| public/treasury/bilan.php | écran potentiel — accessibilité à recetter | viewport, period, year, month, quarter, semester |
| public/treasury/caisse-analytics.php | écran potentiel — accessibilité à recetter | viewport, period, date_debut, date_fin |
| public/treasury/caisse-export.php | document / export probable |  |
| public/treasury/caisse-historique.php | écran potentiel — accessibilité à recetter | viewport, type, date_debut, date_fin |
| public/treasury/caisse-save-test.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/treasury/caisse-save.php | traitement / endpoint probable |  |
| public/treasury/caisse.php | écran potentiel — accessibilité à recetter | viewport, date, montant, moyen_paiement, fournisseur, description, type_decaissement, justificatif |
| public/treasury/compta.php | écran potentiel — accessibilité à recetter |  |
| public/treasury/decaissement-create.php | écran potentiel — accessibilité à recetter | viewport, date_decaissement, type_decaissement, description, montant_ttc, mode_paiement, fournisseur, reference_document, remarques, justificatif |
| public/treasury/decaissement-save.php | traitement / endpoint probable |  |
| public/treasury/decaissements.php | écran potentiel — accessibilité à recetter | viewport |
| public/treasury/demande-fond.php | écran potentiel — accessibilité à recetter | viewport, action, demande_id, employe_id, montant, motif, piece_jointe |
| public/treasury/depense-stable-delete.php | traitement / endpoint probable |  |
| public/treasury/depense-stable-save.php | traitement / endpoint probable |  |
| public/treasury/depenses-stables-summary-export.php | document / export probable |  |
| public/treasury/depenses-stables-totals-get.php | traitement / endpoint probable |  |
| public/treasury/depenses-stables.php | écran potentiel — accessibilité à recetter | viewport, id, type_depense, description, frequence, montant_ttc, mode_paiement, fournisseur, reference_document, justificatif |
| public/treasury/encaissement-create.php | écran potentiel — accessibilité à recetter | viewport, type_encaissement, date_encaissement, description, montant_ht, tva, mode_paiement, client, reference_document, remarques, justificatif |
| public/treasury/encaissement-save.php | traitement / endpoint probable |  |
| public/treasury/encaissement-summary-export.php | document / export probable |  |
| public/treasury/encaissement-totals-get.php | traitement / endpoint probable |  |
| public/treasury/encaissements.php | écran potentiel — accessibilité à recetter | viewport |
| public/treasury/performance-clients.php | écran potentiel — accessibilité à recetter | viewport, period, year, month, quarter, semester |
| public/treasury/setup_caisse.php | outil / setup / test — non exécuté, hors écran | Non lu |
| public/treasury/summary-export.php | document / export probable |  |
| public/treasury/totals-get.php | traitement / endpoint probable |  |
