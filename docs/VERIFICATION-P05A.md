# P05-A — Création, chiffrage, versions et validation des devis

Date : 04/11/2026. Autorisation : « relance le dernier scénario et passe à la p5 », puis « continue où tu t’es arrêté ». Premier sous-lot P05, pas une déclaration de clôture de toute P05.

## Réalisé

1. Parcours Nouveau devis inspiré des trois sections source : Client, Chiffrage, Document, avec synthèse latérale responsive et simulation Laravel différée. Client existant ou nouveau prospect, contact existant/nouveau et affaire existante/nouvelle. Création et soumission atomiques, droits enfants conservés et doublons à examiner explicitement. Nouvelle affaire à Nouveau, sans qualification fictive.
2. Liste dédiée avec filtres persistants/recherche, type devis/proforma, pagination et marge serveur. Fiche dédiée à onglets : proposition, validations, versions, historique et pièces privées. Liens vers client/opportunité, conditions, notes internes et suivi daté.
3. Calculs en FCFA entiers et BCMath conservés : catalogue, matière au CUMP, coût déclaré, quantité/durée, remise de ligne et globale, TVA, coût et marge. Sources/majoration conservées avec le snapshot. Une modification des seules conditions ou de lignes inchangées ne reprice pas silencieusement la proposition.
4. Révisions de famille, une seule version brouillon, anciennes versions actives annulées mais conservées. Devis accepté non révisable ; nouvelle validation, nouvelles dates et aucune pièce signée recopiée automatiquement. Références techniques uniques suffixées -V2/-V3 pour préserver la contrainte SQL existante. Client/opportunité immuables ; verrou optimiste des sauvegardes React.
5. Seuils existants inchangés, séparation auteur/responsable/demandeur/approbateur. PDF/envoi bloqués au-delà du seuil DG sans approbation. Envoi = déclaration d’une transmission externe avec destinataire et date, pas un e-mail réel. Acceptation expirée interdite ; refus motivé conservé.

Contrat : [QUOTES-API.md](../../comsig-v2/docs/QUOTES-API.md). Références : CRM source `web/src/pages/NewQuote.tsx`, `Quotes.tsx`, `QuoteDetail.tsx`, services `quotes.ts`, `quote-wizard.ts`. Guide Sites utilisé en mode local pour reprendre les composants CRM, structurer l’interface et effectuer la vérification visuelle ; aucune publication.

## Vérifications

- Suite API : **187 tests / 1 367 assertions**, après ajout du cas de non-rechiffrage des lignes inchangées ; **52 tests frontend**, compilation React réussie. Avertissement non bloquant sur le bundle principal (~599,5 ko minifiés, ~175,7 ko gzip).
- Navigateur : 50 scénarios collectés, 45 réussis et 2 échecs de sélecteurs dans la passe complète, 3 comparaisons publiques source ignorées faute de serveur de référence dans cette exécution. Après correction des sélecteurs, la reprise a révélé et corrigé deux défauts UI réels : recherche client vide envoyée comme `q=` et pas numérique quantité/durée incompatible avec les valeurs par défaut. **Reprise finale des 11 scénarios P04/P05/workflows : tous réussis** en 1,6 min. Soit 47 scénarios distincts exécutés avec succès au total après reprise, pas une prétention de 50 comparaisons visuelles réussies. Dossiers conservés : `test-results-p05`, `test-results-p05-acceptance`, `test-results-p05-final` et rapports correspondants sous `playwright-report`.
- Contrôle visuel des captures ordinateur/mobile : création proforma, versions, décision DG et historique des opportunités. Timeline redevenue lisible, corps de contenu > 200 px vérifié ; pas de débordement horizontal mobile sur les parcours contrôlés. Capture mobile attend désormais la fin de transition de la navigation (ancien artefact de capture éliminé).
- Inventaire régénéré : **10 contrôles réussis**, **125 routes API Laravel**, **99 chemins OpenAPI**, 30 modules dont 19 ERP ; **94 copies historiques inchangées**.
- Base de navigateur nouvelle : `comsig-v2/tmp/p05-20261104.sqlite`, pièces et outbox privées P05 isolées. Aucune remise à zéro de MySQL ni e-mail externe.
- MySQL Wamp arrêté au début de reprise, redémarré par l’utilisateur après échec de démarrage du service faute de droits Windows. Migration additive P05 appliquée avec succès, lectures HTTP authentifiées de la liste/fiche/contexte réussies (11 devis accessibles au profil de contrôle). Jetons temporaires de contrôle révoqués ; aucune création/modification de dossier métier utilisateur.
- Frontend `http://127.0.0.1:5174`, API `http://127.0.0.1:8002` relancés pour la réception locale. Aucun changement de `.env` ni publication Vercel/Hostinger.

### Captures contrôlées

- `test-results-p05-final/opportunities-P04-filtres--b8925-té-devis-lié-sans-ressaisie-chromium/opportunite-desktop.png`
- `test-results-p05-final/quotes-P05-nouveau-client--2f537--sans-qualification-fictive-chromium/proforma-desktop.png`
- `test-results-p05-final/quotes-P05-envoi-externe-n-4ac40-sions-conservées-sur-mobile-chromium/versions-mobile.png`
- `test-results-p05-final/quotes-P05-verrou-DG-valid-44d36--et-téléchargement-PDF-réel-chromium/validation-dg-desktop.png` et `devis-valide.pdf` (téléchargement fonctionnel ; réception du modèle PDF encore ouverte).

## Limites et suite P05-B

- Pas de conformité pixel exhaustive annoncée : adaptation des étapes existantes et éditeur brouillon sur écran séparé ; réception visuelle/métier utilisateur nécessaire.
- Mise en conformité exhaustive des modèles PDF, Word/Excel et courrier privé de test : **restants en P05-B**. Le PDF existant comporte la version et les contrôles DG, sans nouveau modèle final prétendu.
- Majoration propre au client disponible ; barème par catégorie, coût dernier achat/tarif fournisseur/nomenclature et faces publicitaires source non annoncés complets. À rapprocher du stock/régie P08 et compléter le chiffrage retenu en P05.
- Dates/auteurs/sources anciens inconnus restent vides. Aucun regroupement automatique de devis historiques supposés liés.
- Pas d’e-mail réel, relance séquencée automatique, réservation, facture ou écriture comptable automatique. La création de facture et son règlement restent des opérations finance distinctes.
- Le verrou optimiste est utilisé par React mais optionnel pour les anciens clients API ; concurrence InnoDB réelle et reprise des données à recetter en P12. Les documents consultables ne bénéficient pas d’une protection technique anticopie.

## Réception ensemble

- [ ] Créer un devis/proforma pour un nouveau prospect, puis pour un client existant ; vérifier contact/affaire sans ressaisie.
- [ ] Vérifier les chiffrages catalogue, CUMP et prestation au coût, remises/TVA et comparaison au moteur serveur.
- [ ] Soumettre dans/hors seuil, examiner avec DC/DG distinct et vérifier le verrou PDF.
- [ ] Consigner l’envoi externe, créer une version, modifier le brouillon et retrouver l’ancienne version et ses montants.
- [ ] Tester refus motivé/expiration, pièces privées et affichage ordinateur/mobile.
- [ ] Valider les adaptations et les modèles définitifs avant clôture P05.
