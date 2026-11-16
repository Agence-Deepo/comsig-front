# Frontend ERP intégré

Les nouveaux écrans sont dans l’application active `src/v2`, pas dans les anciennes pages de référence.

| Ensemble | Routes React |
|---|---|
| Trésorerie | `/comptes-tresorerie`, `/mouvements-caisse`, `/validations-financieres` |
| Comptabilité | `/plan-comptable`, `/ecritures`, `/balance-comptable` |
| RH | `/effectif`, `/presences`, `/conges` |
| Paie préparatoire | `/paie` |
| Flotte | `/vehicules`, `/chauffeurs`, `/missions-vehicules` |
| Production | `/projets`, `/nomenclatures`, `/ordres-production`, `/stocks` |
| Régie | `/supports`, `/campagnes`, `/reservations`, `/taxes-communales`, `/redevances` |
| Connecteur fiscal | `/fne` et panneau FNE des factures |

Chaque liste dispose d’une fiche, de formulaires validés et d’actions selon les permissions. Les lignes de nomenclature et d’écriture comptable ont des formulaires dédiés, pas une saisie JSON. Les PDF et CSV sont téléchargés avec authentification, sans mettre de jeton dans l’URL. Les compteurs ERP de l’accueil proviennent de l’API.

## Mise à niveau locale

```powershell
Set-Location C:\wamp64\www\comsig-v2
& C:\wamp64\bin\php\php8.2.29\php.exe scripts/setup-erp-local.php --demo
```

Ce script a été exécuté dans la base locale dédiée V2, sans effacer les données existantes. Les anciens projets et leurs bases restent intacts. Lancer ensuite l’API et le frontend comme indiqué dans le README.

Profils de recette, mot de passe `Demo-Comsig-2026!` :

- `finance` : caisse, comptabilité, demandes de règlements, paie, redevances.
- `dg` : supervision et validations ; attribuer un dossier au responsable du service concerné dès sa création.
- `rh` : collaborateurs, pointages, congés et préparation des bulletins.
- `flotte` : véhicules, chauffeurs et missions, sans accès au dossier RH.
- `prod` : stocks, nomenclatures, ordres de fabrication et livraison.
- `regie` : faces, campagnes, réservations et paramètres de redevances.

## Circuits importants

Règlement de facture : finance enregistre → autre utilisateur autorisé valide → solde de facture mis à jour. Le compte de trésorerie choisi est crédité à la validation ; les espèces nécessitent ce compte.

Fabrication : autorisation → démarrage → fin de fabrication (consommation matières et réception des produits finis) → prêt à livrer → livraison (sortie du lot fini). Importer une nomenclature après avoir indiqué la quantité du lot ; réimporter si cette quantité change.

Congés : demande → validation RH → approbation direction ; contrôle du solde et des chevauchements. La méthode actuelle compte des jours calendaires, à valider avec COMSIG.

Paie : préparation → soumission → validation par une autre personne → enregistrement du paiement. Les impôts et cotisations sont saisis par le responsable ; aucun barème légal n’est supposé. Le paiement ne déclenche aucun transfert bancaire et n’alimente pas automatiquement caisse ou comptabilité.

Comptabilité : saisie équilibrée → comptabilisation par une autre personne → consultation balance/grand livre. Une erreur après validation se corrige par une contrepassation, sans modifier l’original. Pas d’écriture automatique depuis la trésorerie dans ce lot.

## Ce qui n’est pas présenté comme terminé

- Le connecteur **FNE est désactivé**, sans clé ni appel réel DGI. Il faut paramétrer l’environnement et effectuer la recette officielle. Cas couverts : ventes B2B/B2C, TVA 18 %, quantités entières, durée 1, sans remise. Les PDF restent des documents de gestion, pas un visuel fiscal agréé.
- Les règles de paie, de congés, les tarifs communaux et le plan comptable doivent être validés par les responsables de COMSIG avant usage réel.
- Depuis P02-B, les fiches ERP disposent des [pièces jointes privées](VERIFICATION-P02B.md), avec versions, corbeille et droits du parent. Le téléversement DOCX/XLSX ne signifie pas la génération des modèles Word/Excel. GED globale historique, import historique, génération Word/XLSX, avoirs, clôture comptable, carburant/entretien, géolocalisation temps réel, assistant et messagerie restent à porter.
- L’authentification navigateur dispose de sessions HttpOnly/CSRF, MFA TOTP et récupération de compte avec révocation. Voir [P02 réalisé localement](VERIFICATION-P02-COMPLETE.md). Vercel + API Hostinger sur sous-domaines communs est le choix retenu ; noms réels, DNS/TLS, SMTP et recette distante restent en P12.

Référence complète : `C:\wamp64\www\comsig-v2\docs\ERP-API.md`. Aucun déploiement distant n’a été effectué.
