# P11 — Passe de recette globale

9 novembre 2026. Recette sur une nouvelle base SQLite de démonstration et stockage isolé ; aucun envoi externe ni appel fiscal réel. La base MySQL utilisateur n’a pas été réinitialisée. Les résultats automatiques ne constituent pas une validation métier ni une garantie de parité complète.

## Contrôles réalisés

- Backend : 293 tests réussis, 2 525 assertions, SQLite en mémoire.
- Frontend : 53 tests réussis ; compilation TypeScript et build Vite réussis. Avertissement de taille du paquet principal.
- Comparaison automatisée au CRM source : portail, connexion directe et connexion par service identiques dans les conditions de capture de ces trois tests (bureau, données publiques de référence).
- Navigation visuelle sur base de recette, profil direction : assistant local et son action « activités du jour », affichage du courrier externe désactivé, FNE non configurée, avertissement de paie ; liste et vue semaine des activités, sur ordinateur et sur mobile 390 × 844. La semaine mobile utilise un défilement horizontal. Vues d’activités vides au moment du contrôle ; ceci ne démontre pas la parité complète ni la qualité des données réelles.
- Les huit commandes planifiées apparaissent dans `schedule:list` ; leur exécution et leur verrouillage sur l’hébergement ne sont pas vérifiés.
- Suite navigateur : première passe de 72 cas, dont 66 réussis, trois comparaisons publiques ignorées sans URL source et trois échecs. Les trois comparaisons ont ensuite été exécutées avec la source : trois réussites. Les trois échecs ont été analysés, les scénarios ajustés, puis relancés : trois réussites. Il s'agit de passes successives, pas d'une unique exécution intégralement verte.
- Écarts de tests corrigés : le rappel de réactivation est un lien dans le calendrier et non plus un titre ; la matrice des tâches utilise désormais une carte et une fiche de modification ; le rapport de temps exige une saisie fictive préalable pour contrôler le tableau, le détail et l’export. Le scénario des tâches vérifie aussi la persistance de sa requalification et de son statut. Ces corrections portent sur les tests, sans changement fonctionnel de l'application.
- Passe suivante : palettes des services raccordées aux missions et droits réels, au lieu des tuiles de navigation ; client des pages CRM reprises raccordé à l'URL API V2 et au CSRF commun pour l'architecture multi-origine. Vérifications : 6 tests serveur / 63 assertions, 56 tests frontend, build et 2 scénarios navigateur sur ports locaux distincts. Une tentative initiale a échoué sur une connexion locale interrompue avant de réussir à la relance. L'essai local n'établit pas la conformité de DNS, HTTPS ou cookies sur Vercel/Hostinger.

## Réserves

- L’acceptation métier par COMSIG, la comparaison exhaustive source/cible, les autres profils et actions, les cas mobiles non couverts et l’inspection visuelle des devis Word restent ouverts.
- Les tests de fournisseur IA, de messagerie SMTP réelle et de FNE réelle exigent une configuration et une recette externe appropriées. Paie et taux de commission nécessitent les règles et validations métier.
- Les données de production, les sauvegardes/restaurations et le déploiement Vercel/Hostinger ne sont pas évalués par cette passe.
